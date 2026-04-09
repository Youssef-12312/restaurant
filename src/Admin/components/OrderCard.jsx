import { useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { auth, db } from "../../services/firebase";
import { completeOrderAndSaveToSales } from "../../services/salesService";
import { getCartItemVariantSuffix } from "../../utils/cartItem.js";
import "../styles/ModalBadges.css";

const STATUS = {
  NEW: "new",
  PREPARING: "preparing",
  ON_THE_WAY: "on_the_way",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

function getText(value, lang = "en") {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value[lang] || value.ar || value.en || "";
}

function getBranchLabel(branchCode, t) {
  if (branchCode === "mashaya") return `📍 ${t("admin.branches.mashaya")}`;
  if (branchCode === "gamaa") return `📍 ${t("admin.branches.gamaa")}`;
  return branchCode ? `📍 ${branchCode}` : "—";
}

function getStatusLabels(t) {
  return {
    [STATUS.NEW]: { label: t("admin.status.new"), color: "#e8521a", bg: "#fff0eb" },
    [STATUS.PREPARING]: { label: t("admin.status.preparing"), color: "#f59e0b", bg: "#fffbeb" },
    [STATUS.ON_THE_WAY]: { label: t("admin.status.onTheWay"), color: "#3b82f6", bg: "#eff6ff" },
    [STATUS.COMPLETED]: { label: t("admin.status.completed"), color: "#10b981", bg: "#ecfdf5" },
    [STATUS.CANCELLED]: { label: t("admin.status.cancelled"), color: "#ef4444", bg: "#fef2f2" },
  };
}

function getActionButtons(t) {
  return [
    { status: STATUS.NEW, label: t("admin.actions.accept"), next: STATUS.PREPARING },
    { status: STATUS.PREPARING, label: t("admin.actions.onTheWay"), next: STATUS.ON_THE_WAY },
    { status: STATUS.ON_THE_WAY, label: t("admin.actions.complete"), next: STATUS.COMPLETED },
  ];
}

function getOrderTypeLabel(orderType, t) {
  if (orderType === "delivery") return `🛵 ${t("admin.orderType.delivery")}`;
  if (orderType === "pickup") return `🏃 ${t("admin.orderType.pickup")}`;
  if (orderType === "dine-in") return `🍽️ ${t("admin.orderType.dineIn")}`;
  return orderType || "—";
}

function isPermissionDenied(error) {
  return (
    error?.code === "permission-denied" ||
    error?.message?.includes("Missing or insufficient permissions")
  );
}

function OrderCard({ order, onOpen }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  const [isUpdating, setIsUpdating] = useState(false);

  const statusLabels = getStatusLabels(t);
  const actionButtons = getActionButtons(t);
  const statusInfo = statusLabels[order.status] || statusLabels[STATUS.NEW];

  const time = order.createdAt?.toDate?.()
    ? order.createdAt.toDate().toLocaleTimeString(
        locale,
        { hour: "2-digit", minute: "2-digit" }
      )
    : "—";

  const updateStatus = async (e, newStatus) => {
    e.stopPropagation();

    if (isUpdating) {
      return;
    }

    setIsUpdating(true);

    try {
      if (newStatus === STATUS.COMPLETED) {
        try {
          await completeOrderAndSaveToSales(order.id);
        } catch (err) {
          if (!isPermissionDenied(err)) {
            throw err;
          }

          console.warn("Falling back to status-only completion because sales summary writes were denied.", {
            orderId: order.id,
            uid: auth.currentUser?.uid ?? null,
            code: err?.code ?? null,
          });

          await updateDoc(doc(db, "orders", order.id), {
            status: STATUS.COMPLETED,
            completedAt: serverTimestamp(),
            addedToSales: false,
          });

          alert(
            lang === "ar"
              ? "تم تحديث الطلب إلى مكتمل، لكن لم يتم حفظه في ملخص المبيعات بسبب صلاحيات Firestore."
              : "The order was marked completed, but it was not saved to the sales summary because of Firestore permissions."
          );
        }
      } else {
        await updateDoc(doc(db, "orders", order.id), { status: newStatus });
      }
    } catch (err) {
      console.error("Update status error:", {
        orderId: order.id,
        newStatus,
        uid: auth.currentUser?.uid ?? null,
        code: err?.code ?? null,
        error: err,
      });
      
      if (isPermissionDenied(err)) {
        alert(
          lang === "ar"
            ? "تم رفض العملية من Firestore. لو مشكلة الإكمال فقط، أضف صلاحيات write على sales_summary. ولو كل الحالات بتفشل، تأكد أن admins/{uid} موجود لنفس المستخدم المسجل."
            : "Firestore rejected this action. If only completion fails, add write rules for sales_summary. If every status change fails, make sure admins/{uid} exists for the signed-in user."
        );
      } else {
        alert(t("admin.messages.updateFailed"));
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelOrder = async (e) => {
    e.stopPropagation();

    if (isUpdating || !window.confirm(t("admin.messages.cancelConfirm"))) {
      return;
    }

    setIsUpdating(true);

    try {
      await updateDoc(doc(db, "orders", order.id), { status: STATUS.CANCELLED });
    } catch (err) {
      console.error("Cancel error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const sendWhatsApp = (e) => {
    e.stopPropagation();

    if (!order.phone) {
      alert(t("admin.messages.noPhone"));
      return;
    }

    const phone = order.phone.replace(/^0/, "20");
    const formatOrderItem = (item) => {
      const itemName = getText(item.name, lang);
      const variantSuffix = getCartItemVariantSuffix(item, lang);
      return variantSuffix ? `${itemName} (${variantSuffix})` : itemName;
    };

    const message =
      lang === "ar"
        ? t("admin.whatsapp.statusWithItems", {
            name: order.customerName,
            items: (order.items || [])
              .map((i) => `${formatOrderItem(i)} x${i.qty}`)
              .join("\n"),
            total: order.total,
            currency: t("common.egp"),
            status: statusInfo.label,
          })
        : t("admin.whatsapp.statusOnly", {
            name: order.customerName,
            status: statusInfo.label,
          });

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const actionBtn = actionButtons.find((action) => action.status === order.status);

  return (
    <div className={`order-card order-card--${order.status}`} onClick={() => onOpen(order)}>
      <div className="order-card__top">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="order-card__num">#{order.orderNumber}</span>
          {order.branch && (
            <span
              style={{
                backgroundColor: order.branch === "mashaya" ? "#e0f2fe" : "#fef08a",
                color: order.branch === "mashaya" ? "#0369a1" : "#854d0e",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {getBranchLabel(order.branch, t)}
            </span>
          )}
        </div>
        <span
          className="order-card__status"
          style={{ color: statusInfo.color, background: statusInfo.bg }}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className="order-card__customer">
        <span className="order-card__name">{order.customerName}</span>
        <span className="order-card__phone">{order.phone || "—"}</span>
      </div>

      <div className="order-card__meta">
        <span className={`order-card__type order-card__type--${order.orderType}`}>
          {getOrderTypeLabel(order.orderType, t)}
        </span>
        <span className="order-card__time">{time}</span>
      </div>

      <div className="order-card__total">
        <span>{t("admin.modal.total")}</span>
        <span className="order-card__total-amount">
          {order.total} {t("common.egp")}
        </span>
      </div>

      <div className="order-card__actions" onClick={(e) => e.stopPropagation()}>
        {actionBtn && (
          <button
            className="order-card__btn order-card__btn--primary"
            onClick={(e) => updateStatus(e, actionBtn.next)}
            disabled={isUpdating}
          >
            {isUpdating
              ? t("admin.messages.saving")
              : actionBtn.next === STATUS.COMPLETED
                ? `✅ ${t("admin.messages.saveAndComplete")}`
                : actionBtn.label}
          </button>
        )}

        <button
          className="order-card__btn order-card__btn--whatsapp"
          onClick={sendWhatsApp}
          disabled={isUpdating}
        >
          {t("admin.actions.whatsapp")}
        </button>

        {order.status !== STATUS.CANCELLED && order.status !== STATUS.COMPLETED && (
          <button
            className="order-card__btn order-card__btn--cancel"
            onClick={cancelOrder}
            disabled={isUpdating}
          >
            {t("admin.actions.cancel")}
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderCard;
