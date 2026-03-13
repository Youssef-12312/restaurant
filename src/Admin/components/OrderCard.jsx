import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../Services/firebase";

/**
 * OrderCard
 * كارت لكل طلب يعرض:
 * - بيانات العميل
 * - الحالة الحالية
 * - أزرار تغيير الحالة
 * - زر WhatsApp
 * - عند الضغط على الكارت يفتح Modal
 */

const STATUS_FLOW = ["new", "preparing", "on_the_way", "completed"];

const STATUS_LABELS = {
  new:         { label: "New",        color: "#e8521a", bg: "#fff0eb" },
  preparing:   { label: "Preparing",  color: "#f59e0b", bg: "#fffbeb" },
  on_the_way:  { label: "On The Way", color: "#3b82f6", bg: "#eff6ff" },
  completed:   { label: "Completed",  color: "#10b981", bg: "#ecfdf5" },
  cancelled:   { label: "Cancelled",  color: "#ef4444", bg: "#fef2f2" },
};

const ACTION_BUTTONS = [
  { status: "new",        label: "Accept",      next: "preparing"  },
  { status: "preparing",  label: "On The Way",  next: "on_the_way" },
  { status: "on_the_way", label: "Completed",   next: "completed"  },
];

function OrderCard({ order, onOpen }) {
  const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.new;

  const time = order.createdAt?.toDate?.()
    ? order.createdAt.toDate().toLocaleTimeString("en-EG", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const updateStatus = async (e, newStatus) => {
    e.stopPropagation();
    await updateDoc(doc(db, "orders", order.id), { status: newStatus });
  };

  const cancelOrder = async (e) => {
    e.stopPropagation();
    if (window.confirm("Cancel this order?")) {
      await updateDoc(doc(db, "orders", order.id), { status: "cancelled" });
    }
  };

  const actionBtn = ACTION_BUTTONS.find((a) => a.status === order.status);

  return (
    <div
      className={`order-card order-card--${order.status}`}
      onClick={() => onOpen(order)}
    >
      {/* Top Row */}
      <div className="order-card__top">
        <span className="order-card__num">#{order.orderNumber}</span>
        <span
          className="order-card__status"
          style={{ color: statusInfo.color, background: statusInfo.bg }}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Customer */}
      <div className="order-card__customer">
        <span className="order-card__name">{order.customerName}</span>
        <span className="order-card__phone">{order.phone}</span>
      </div>

      {/* Meta */}
      <div className="order-card__meta">
        <span className={`order-card__type order-card__type--${order.orderType}`}>
          {order.orderType === "delivery" ? "🛵 Delivery" : "🏃 Pickup"}
        </span>
        <span className="order-card__time">{time}</span>
      </div>

      {/* Items preview */}
      <p className="order-card__items-preview">
        {(order.items || []).slice(0, 2).map((i) => `${i.name} ×${i.qty}`).join(" · ")}
        {order.items?.length > 2 && ` +${order.items.length - 2} more`}
      </p>

      {/* Total */}
      <div className="order-card__total">
        <span>Total</span>
        <span className="order-card__total-amount">{order.total} EGP</span>
      </div>

      {/* Actions */}
      <div className="order-card__actions" onClick={(e) => e.stopPropagation()}>

        {actionBtn && (
          <button
            className="order-card__btn order-card__btn--primary"
            onClick={(e) => updateStatus(e, actionBtn.next)}
          >
            {actionBtn.label}
          </button>
        )}

        {order.status !== "cancelled" && order.status !== "completed" && (
          <button
            className="order-card__btn order-card__btn--cancel"
            onClick={cancelOrder}
          >
            Cancel
          </button>
        )}

        <a
          className="order-card__btn order-card__btn--whatsapp"
          href={`https://wa.me/${order.phone}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          💬
        </a>

      </div>
    </div>
  );
}

export default OrderCard;