import { useEffect, useRef, useState } from "react";
import {
  Timestamp,
  collection,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebase.js";
import OrderCard from "../components/OrderCard.jsx";
import OrderModal from "../components/OrderModal.jsx";
import StatsCards from "../components/StatsCards.jsx";
import notificationSound from "../../../public/notification.mp3";
import { buildBranchStatsFromOrders } from "../../services/branchSales.js";
import { saveDailyOrdersSnapshot } from "../../services/salesService.js";
import { getCartItemVariantSuffix } from "../../utils/cartItem.js";
import { useTranslation } from "react-i18next";
const ACTIVE_STATUSES = ["new", "preparing", "on_the_way"];
const FILTERS = ["all", "new", "preparing", "on_the_way", "completed", "cancelled"];

function getText(value, lang = "en") {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value[lang] || value.ar || value.en || "";
}

function getPrice(item) {
  if (typeof item.price === "number") return item.price;

  if (item.prices && typeof item.prices === "object") {
    const vals = Object.values(item.prices).filter((v) => typeof v === "number");
    if (vals.length > 0) return vals[0];
  }

  return 0;
}

function getPrintableItemName(item, lang) {
  const itemName = getText(item.name, lang);
  const variantSuffix = getCartItemVariantSuffix(item, lang);
  return variantSuffix ? `${itemName} (${variantSuffix})` : itemName;
}

function getOrderTypeText(orderType, t) {
  if (orderType === "delivery") return t("admin.orderType.delivery");
  if (orderType === "pickup") return t("admin.orderType.pickup");
  if (orderType === "dine-in") return t("admin.orderType.dineIn");
  return orderType || "—";
}

function getDayStart(date = new Date()) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  return dayStart;
}

function getOrderDate(order) {
  const value = order?.createdAt?.toDate
    ? order.createdAt.toDate()
    : order?.createdAt
      ? new Date(order.createdAt)
      : null;

  if (!value || Number.isNaN(value.getTime())) {
    return null;
  }

  return value;
}

function isSameDay(date, dayStart) {
  if (!date || !dayStart) return false;

  const nextDay = new Date(dayStart);
  nextDay.setDate(nextDay.getDate() + 1);

  return date >= dayStart && date < nextDay;
}

function sortOrdersByDateDesc(orders) {
  return [...orders].sort((a, b) => {
    const aTime = getOrderDate(a)?.getTime() ?? 0;
    const bTime = getOrderDate(b)?.getTime() ?? 0;
    return bTime - aTime;
  });
}

function mergeOrders(...groups) {
  const map = new Map();

  for (const group of groups) {
    for (const order of group) {
      if (order?.id) {
        map.set(order.id, order);
      }
    }
  }

  return sortOrdersByDateDesc(Array.from(map.values()));
}

function getMostSoldItem(orders = []) {
  const counter = new Map();

  for (const order of orders) {
    for (const item of order.items || []) {
      const rawName = item?.name;
      const key =
        typeof rawName === "object"
          ? JSON.stringify(rawName)
          : String(rawName || "");

      if (!key) {
        continue;
      }

      const existing = counter.get(key) || { name: rawName, qty: 0 };
      existing.qty += item.qty || 1;
      counter.set(key, existing);
    }
  }

  let topItem = null;
  let topQty = 0;

  for (const entry of counter.values()) {
    if (entry.qty > topQty) {
      topItem = entry.name;
      topQty = entry.qty;
    }
  }

  return topItem ? { name: topItem, qty: topQty } : null;
}

function OrdersPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  const [activeOrders, setActiveOrders] = useState([]);
  const [todayOrders, setTodayOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [isSavingSummary, setIsSavingSummary] = useState(false);
  const [summarySaveState, setSummarySaveState] = useState(null);

  const todayStartRef = useRef(getDayStart());
  const prevActiveIds = useRef(new Set());
  const activeReadyRef = useRef(false);
  const audioRef = useRef(null);

  const todayStart = todayStartRef.current;

  const FILTER_LABELS = {
    all: t("ordersPage.filters.all"),
    new: t("ordersPage.filters.new"),
    preparing: t("ordersPage.filters.preparing"),
    on_the_way: t("ordersPage.filters.onTheWay"),
    completed: t("ordersPage.filters.completed"),
    cancelled: t("ordersPage.filters.cancelled"),
  };

  const orders = mergeOrders(activeOrders, todayOrders, cancelledOrders).filter(
    (order) => order.hidden !== true
  );

  const visibleOrders = orders.filter((order) => {
    const orderDate = getOrderDate(order);

    if (order.status === "completed" && orderDate && orderDate < todayStart) {
      return false;
    }

    return true;
  });

  const filtered = visibleOrders.filter((order) => {
    const matchFilter = filter === "all" || order.status === filter;
    const cleanSearch = search.replace("#", "");
    const matchSearch =
      search === "" || String(order.orderNumber || "").includes(cleanSearch);

    return matchFilter && matchSearch;
  });

  const todayCompleted = orders.filter(
    (order) =>
      order.status === "completed" &&
      isSameDay(getOrderDate(order), todayStart)
  );

  const todayCancelled = orders.filter(
    (order) =>
      order.status === "cancelled" &&
      isSameDay(getOrderDate(order), todayStart)
  );

  const todayRevenue = todayCompleted.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );

  const todayBranchStats = buildBranchStatsFromOrders(todayCompleted);
  const mostSold = getMostSoldItem(todayCompleted);

  const printOrder = (order) => {
    const printWindow = window.open("", "", "width=400,height=600");
    if (!printWindow) {
      return;
    }

    const subtotal = (order.items || []).reduce(
      (sum, item) => sum + getPrice(item) * (item.qty || 1),
      0
    );

    const vat = subtotal * 0.12;
    const delivery = order.orderType === "delivery" ? 25 : 0;
    const total = subtotal + vat + delivery;
    const direction = lang === "ar" ? "rtl" : "ltr";
    const textAlign = lang === "ar" ? "right" : "left";
    const orderTime = order.createdAt
      ? new Date(
          order.createdAt.toDate ? order.createdAt.toDate() : order.createdAt
        ).toLocaleString(locale)
      : "—";
    const orderTypeText = getOrderTypeText(order.orderType, t);
    const currency = t("common.egp");

    printWindow.document.write(`
      <html lang="${lang}" dir="${direction}">
      <head>
        <title>${t("ordersPage.receipt.title", { orderNumber: order.orderNumber })}</title>
        <style>
          @page { margin: 0; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            max-width: 80mm;
            margin: 0 auto;
            color: #000;
            direction: ${direction};
            text-align: ${textAlign};
          }
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .logo, .qr { width: 55px; height: auto; }
          .header-info { text-align: center; flex-grow: 1; padding: 0 10px; }
          .header-info h1 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
          .header-info p { margin: 5px 0 0; font-weight: bold; font-size: 16px; }
          .customer-info {
            margin-bottom: 20px;
            font-size: 14px;
            line-height: 1.6;
          }
          .customer-info p { margin: 3px 0; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 14px;
          }
          th {
            text-align: ${textAlign};
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            font-weight: bold;
          }
          td {
            padding: 8px 0;
            border-bottom: 1px dotted #888;
          }
          .col-qty { text-align: center; width: 40px; }
          .col-price { text-align: ${textAlign}; width: 70px; }
          .totals-container {
            margin-top: 15px;
            font-size: 14px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
          }
          .grand-total {
            font-size: 18px;
            font-weight: bold;
            border-top: 2px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 25px;
            font-size: 12px;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <img src="/Print.webp" class="logo" alt="Logo" />
          <div class="header-info">
            <h1>Shelter</h1>
            <p>${t("ordersPage.receipt.title", {
              orderNumber: String(order.orderNumber).padStart(4, "0"),
            })}</p>
          </div>
          <img src="/QrCode Shelter.webp" class="qr" alt="QR" />
        </div>

        <div class="customer-info">
          <p><strong>${t("ordersPage.receipt.customer")}:</strong> ${order.customerName || "—"}</p>
          <p><strong>${t("ordersPage.receipt.phone")}:</strong> ${order.phone || "—"}</p>
          <p><strong>${t("ordersPage.receipt.address")}:</strong> ${order.address || "—"}</p>
          <p><strong>${t("ordersPage.receipt.detailedAddress")}:</strong> ${order.manualAddress || "—"}</p>
          <p><strong>${t("ordersPage.receipt.time")}:</strong> ${orderTime}</p>
          ${order.orderType ? `<p><strong>${t("ordersPage.receipt.type")}:</strong> ${orderTypeText}</p>` : ""}
        </div>

        <table>
          <thead>
            <tr>
              <th>${t("ordersPage.receipt.item")}</th>
              <th class="col-qty">${t("ordersPage.receipt.qty")}</th>
              <th class="col-price">${t("ordersPage.receipt.price")}</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || [])
              .map(
                (item) => `
              <tr>
                <td>${getPrintableItemName(item, lang)}</td>
                <td class="col-qty">x${item.qty || 1}</td>
                <td class="col-price">${(getPrice(item) * (item.qty || 1)).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="totals-container">
          <div class="total-row">
            <span>${t("ordersPage.receipt.subtotal")}</span>
            <span>${subtotal.toFixed(2)} ${currency}</span>
          </div>
          <div class="total-row">
            <span>${t("ordersPage.receipt.vat")}</span>
            <span>${vat.toFixed(2)} ${currency}</span>
          </div>
          <div class="total-row">
            <span>${t("ordersPage.receipt.delivery")}</span>
            <span>${delivery.toFixed(2)} ${currency}</span>
          </div>
          <div class="total-row grand-total">
            <span>${t("ordersPage.receipt.total")}</span>
            <span>${total.toFixed(2)} ${currency}</span>
          </div>
        </div>

        <div class="footer">
          <p>${t("ordersPage.receipt.thanks")}</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };


  const clearCurrentList = async () => {
    if (filtered.length === 0) return;

    const confirmDelete = window.confirm(
      t("ordersPage.actions.deleteConfirm", { count: filtered.length })
    );
    if (!confirmDelete) return;

    try {
      for (const order of filtered) {
        await updateDoc(doc(db, "orders", order.id), { hidden: true });
      }
      setToast(t("ordersPage.actions.hiddenCount", { count: filtered.length }));
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error("Update error:", err);
      setToast(t("ordersPage.actions.hideFailed"));
      setTimeout(() => setToast(null), 5000);
    }
  };
  const openDailySummary = async () => {
    setShowSummary(true);
    setIsSavingSummary(true);
    setSummarySaveState(null);

    try {
      await saveDailyOrdersSnapshot({
        date: todayStart,
        revenue: todayRevenue,
        orders: todayCompleted.length,
        cancelledOrders: todayCancelled.length,
        topItem: mostSold,
        branches: todayBranchStats,
      });

      setSummarySaveState({
        type: "success",
        message: t("ordersPage.summary.saved"),
      });
    } catch (err) {
  console.error("Daily summary save error:", err);
  setSummarySaveState({
    type: "error",
    message: t("ordersPage.summary.failed"),
  });
} finally {
      setIsSavingSummary(false);
    }
  };

  const getFilterCount = (filterKey) => {
    if (filterKey === "all") {
      return visibleOrders.length;
    }

    return visibleOrders.filter((order) => order.status === filterKey).length;
  };

  useEffect(() => {
    const activeQuery = query(
      collection(db, "orders"),
      where("status", "in", ACTIVE_STATUSES)
    );
    const todayQuery = query(
      collection(db, "orders"),
      where("createdAt", ">=", Timestamp.fromDate(todayStart))
    );
    const cancelledQuery = query(
      collection(db, "orders"),
      where("status", "==", "cancelled")
    );

    const unsubActive = onSnapshot(
      activeQuery,
      (snap) => {
        const docs = sortOrdersByDateDesc(
          snap.docs.map((orderDoc) => ({
            id: orderDoc.id,
            ...orderDoc.data(),
          }))
        );

        if (activeReadyRef.current) {
          const newOnes = docs.filter((order) => !prevActiveIds.current.has(order.id));

          if (newOnes.length > 0) {
            audioRef.current?.play().catch(() => {});
            setToast(t("ordersPage.toastNewOrder", { orderNumber: newOnes[0].orderNumber }));
            setTimeout(() => setToast(null), 4000);
          }
        }

        prevActiveIds.current = new Set(docs.map((order) => order.id));
        activeReadyRef.current = true;
        setActiveOrders(docs);
      },
      (error) => {
        console.error("Active orders listener error:", error);
      }
    );

    const unsubToday = onSnapshot(
      todayQuery,
      (snap) => {
        const docs = sortOrdersByDateDesc(
          snap.docs.map((orderDoc) => ({
            id: orderDoc.id,
            ...orderDoc.data(),
          }))
        );
        setTodayOrders(docs);
      },
      (error) => {
        console.error("Today orders listener error:", error);
      }
    );

    const unsubCancelled = onSnapshot(
      cancelledQuery,
      (snap) => {
        const docs = sortOrdersByDateDesc(
          snap.docs.map((orderDoc) => ({
            id: orderDoc.id,
            ...orderDoc.data(),
          }))
        );
        setCancelledOrders(docs);
      },
      (error) => {
        console.error("Cancelled orders listener error:", error);
      }
    );

    return () => {
      unsubActive();
      unsubToday();
      unsubCancelled();
    };
  }, [t, todayStart]);

  return (
    <div className="op-page">
      <audio ref={audioRef} src={notificationSound} preload="auto" />

      {toast && <div className="op-toast">{toast}</div>}

      <StatsCards orders={visibleOrders} />

      {mostSold && (
        <div className="most-sold-card">
          <div className="most-sold-title">🔥 {t("ordersPage.mostSoldTitle")}</div>
          <div className="most-sold-name">{getText(mostSold.name, lang)}</div>
          <div className="most-sold-qty">
            {t("ordersPage.soldCount", { count: mostSold.qty })}
          </div>
        </div>
      )}

      <div className="op-search">
        <input
          type="text"
          className="search-input"
          id="admin-search"
          placeholder={t("ordersPage.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="op-filters">
        {FILTERS.map((filterKey) => (
          <button
            key={filterKey}
            className={`op-filter-btn${filter === filterKey ? " op-filter-btn--active" : ""}`}
            onClick={() => setFilter(filterKey)}
          >
            {FILTER_LABELS[filterKey] || filterKey} ({getFilterCount(filterKey)})
          </button>
        ))}

        <button className="op-clear-btn" onClick={clearCurrentList}>
          🗑 {t("admin.actions.clear")}
        </button>

        <button
          className="op-close-day-btn"
          onClick={openDailySummary}
          disabled={isSavingSummary}
        >
          {isSavingSummary ? t("ordersPage.actions.saving") : t("admin.actions.closeDay")}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="op-empty">
          <p>{t("ordersPage.empty")}</p>
        </div>
      ) : (
        <div className="op-grid">
          {filtered.map((order) => (
            <div key={order.id}>
              <OrderCard order={order} onOpen={setSelected} />

              <button
                onClick={() => printOrder(order)}
                style={{
                  marginTop: "6px",
                  padding: "6px 10px",
                  background: "#e8521a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                🧾 {t("admin.actions.printOrder")}
              </button>
            </div>
          ))}
        </div>
      )}

      <OrderModal order={selectedOrder} onClose={() => setSelected(null)} />

      {showSummary && (
        <div className="summary-overlay" onClick={() => setShowSummary(false)}>
          <div className="summary-card" onClick={(e) => e.stopPropagation()}>
            <h2>📊 {t("ordersPage.summary.title")}</h2>

            <div>
              💰 {t("ordersPage.summary.revenue", {
                amount: todayRevenue.toLocaleString(locale, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }),
                currency: t("common.egp"),
              })}
            </div>
            <div>✅ {t("ordersPage.summary.orders", { count: todayCompleted.length })}</div>
            <div>❌ {t("ordersPage.summary.cancelled", { count: todayCancelled.length })}</div>

            {mostSold && (
              <div>
                🔥 {getText(mostSold.name, lang)} ({mostSold.qty})
              </div>
            )}

            {summarySaveState && (
              <div
                style={{
                  marginTop: "10px",
                  color: summarySaveState.type === "success" ? "#15803d" : "#b91c1c",
                  fontWeight: 700,
                }}
              >
                {summarySaveState.message}
              </div>
            )}

            <button onClick={() => setShowSummary(false)} disabled={isSavingSummary}>
              {isSavingSummary ? t("ordersPage.actions.saving") : t("admin.actions.done")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
