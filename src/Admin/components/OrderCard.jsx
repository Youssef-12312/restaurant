import { doc, updateDoc} from "firebase/firestore";
import { db } from "../../services/firebase";
import "../styles/ModalBadges.css";
import { useTranslation } from "react-i18next";
import { addOrderToSales } from "../../services/salesService";/* ───────── STATUS CONSTANTS ───────── */
import { getCartItemVariantSuffix } from "../../utils/cartItem.js";
const STATUS = {
  NEW: "new",
  PREPARING: "preparing",
  ON_THE_WAY: "on_the_way",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

/* ───────── HELPERS ───────── */
function getText(value, lang = "en") {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value[lang] || value.ar || value.en || "";
}

function getBranchLabel(branchCode, lang) {
  if (branchCode === "mashaya") return lang === "ar" ? "📍 المشاية" : "📍 Mashaya";
  if (branchCode === "gamaa") return lang === "ar" ? "📍 حي الجامعة" : "📍 Gamaa";
  return branchCode ? `📍 ${branchCode}` : "—";
}

function getStatusLabels(t) {
  return {
    [STATUS.NEW]: { label: t("admin.status.new"), color: "#e8521a", bg: "#fff0eb" },
    [STATUS.PREPARING]: { label: t("admin.status.preparing"), color: "#f59e0b", bg: "#fffbeb" },
    [STATUS.ON_THE_WAY]: { label: t("admin.status.onTheWay"), color: "#3b82f6", bg: "#eff6ff" },
    [STATUS.COMPLETED]: { label: t("admin.status.completed"), color: "#10b981", bg: "#ecfdf5" },
    [STATUS.CANCELLED]: { label: t("admin.status.cancelled"), color: "#ef4444", bg: "#fef2f2" }
  };
}

function getActionButtons(t) {
  return [
    { status: STATUS.NEW, label: t("admin.actions.accept"), next: STATUS.PREPARING },
    { status: STATUS.PREPARING, label: t("admin.actions.onTheWay"), next: STATUS.ON_THE_WAY },
    { status: STATUS.ON_THE_WAY, label: t("admin.actions.complete"), next: STATUS.COMPLETED }
  ];
}

function getOrderTypeLabel(orderType, t) {
  if (orderType === "delivery") return `🛵 ${t("admin.orderType.delivery")}`;
  if (orderType === "pickup") return `🏃 ${t("admin.orderType.pickup")}`;
  if (orderType === "dine-in") return `🍽️ ${t("admin.orderType.dineIn")}`;
  return orderType || "—";
}

/* ───────── COMPONENT ───────── */
function OrderCard({ order, onOpen }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
  
  const STATUS_LABELS = getStatusLabels(t);
  const ACTION_BUTTONS = getActionButtons(t);
  const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS[STATUS.NEW];

  const time = order.createdAt?.toDate?.()
    ? order.createdAt.toDate().toLocaleTimeString(
        lang === "ar" ? "ar-EG" : "en-EG",
        { hour: "2-digit", minute: "2-digit" }
      )
    : "—";

 const updateStatus = async (e, newStatus) => {
  e.stopPropagation();
  try {
    await updateDoc(doc(db, "orders", order.id), { status: newStatus });

    if (newStatus === STATUS.COMPLETED && !order.addedToSales) {
      await addOrderToSales(order);

      await updateDoc(doc(db, "orders", order.id), {
        addedToSales: true,
      });
    }

  } catch (err) {
    console.error("Update status error:", err);
  }
};

  const cancelOrder = async (e) => {
    e.stopPropagation();
    if (window.confirm(t("admin.messages.cancelConfirm"))) {
      try {
        await updateDoc(doc(db, "orders", order.id), { status: STATUS.CANCELLED });
      } catch (err) {
        console.error("Cancel error:", err);
      }
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
    const message = lang === "ar"
      ? `مرحبًا ${order.customerName}\nطلبك من *Shelter House Of Cheese* هو:\n${(order.items || []).map((i) => `${formatOrderItem(i)} x${i.qty}`).join("\n")}\nالإجمالي: ${order.total} ${t("common.egp")}\nحالة طلبك الآن: ${statusInfo.label}`
      : `Hello ${order.customerName}\nYour order from *Shelter House Of Cheese* is now ${statusInfo.label}.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const actionBtn = ACTION_BUTTONS.find((a) => a.status === order.status);

  return (
    <div className={`order-card order-card--${order.status}`} onClick={() => onOpen(order)}>
      <div className="order-card__top">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="order-card__num">#{order.orderNumber}</span>
          {order.branch && (
            <span style={{ 
              backgroundColor: order.branch === "mashaya" ? "#e0f2fe" : "#fef08a", 
              color: order.branch === "mashaya" ? "#0369a1" : "#854d0e",
              padding: "2px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" 
            }}>
              {getBranchLabel(order.branch, lang)}
            </span>
          )}
        </div>
        <span className="order-card__status" style={{ color: statusInfo.color, background: statusInfo.bg }}>
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
        <span className="order-card__total-amount">{order.total} {t("common.egp")}</span>
      </div>

      <div className="order-card__actions" onClick={(e) => e.stopPropagation()}>
        {actionBtn && (
          <button
            className="order-card__btn order-card__btn--primary"
            onClick={(e) => updateStatus(e, actionBtn.next)}
          >
            {actionBtn.next === STATUS.COMPLETED
              ? `✅ ${actionBtn.label} + Save to Sales`
              : actionBtn.label}
          </button>
        )}
        <button className="order-card__btn order-card__btn--whatsapp" onClick={sendWhatsApp}>
          {t("admin.actions.whatsapp")}
        </button>
        {order.status !== STATUS.CANCELLED && order.status !== STATUS.COMPLETED && (
          <button className="order-card__btn order-card__btn--cancel" onClick={cancelOrder}>
            {t("admin.actions.cancel")}
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderCard;
