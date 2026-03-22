import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import "../styles/ModalBadges.css";
/* ───────── STATUS CONSTANTS ───────── */

const STATUS = {
  NEW: "new",
  PREPARING: "preparing",
  ON_THE_WAY: "on_the_way",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

/* ───────── STATUS FLOW ───────── */

const STATUS_FLOW = [
  STATUS.NEW,
  STATUS.PREPARING,
  STATUS.ON_THE_WAY,
  STATUS.COMPLETED
];

/* ───────── STATUS UI ───────── */

const STATUS_LABELS = {
  [STATUS.NEW]: {
    label: "New",
    color: "#e8521a",
    bg: "#fff0eb"
  },
  [STATUS.PREPARING]: {
    label: "Preparing",
    color: "#f59e0b",
    bg: "#fffbeb"
  },
  [STATUS.ON_THE_WAY]: {
    label: "On The Way",
    color: "#3b82f6",
    bg: "#eff6ff"
  },
  [STATUS.COMPLETED]: {
    label: "Completed",
    color: "#10b981",
    bg: "#ecfdf5"
  },
  [STATUS.CANCELLED]: {
    label: "Cancelled",
    color: "#ef4444",
    bg: "#fef2f2"
  }
};

/* ───────── ACTION BUTTONS ───────── */

const ACTION_BUTTONS = [
  {
    status: STATUS.NEW,
    label: "Accept",
    next: STATUS.PREPARING
  },
  {
    status: STATUS.PREPARING,
    label: "On The Way",
    next: STATUS.ON_THE_WAY
  },
  {
    status: STATUS.ON_THE_WAY,
    label: "Completed",
    next: STATUS.COMPLETED
  }
];

function getText(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value.ar || value.en || "";
}

function getPrice(item) {
  if (typeof item.price === "number") return item.price;

  if (item.prices && typeof item.prices === "object") {
    const vals = Object.values(item.prices).filter((v) => typeof v === "number");
    if (vals.length > 0) return vals[0];
  }

  return 0;
}

/* ───────── COMPONENT ───────── */

function OrderCard({ order, onOpen }) {
  const statusInfo =
    STATUS_LABELS[order.status] || STATUS_LABELS[STATUS.NEW];

  const time = order.createdAt?.toDate?.()
    ? order.createdAt.toDate().toLocaleTimeString("en-EG", {
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";

  const updateStatus = async (e, newStatus) => {
    e.stopPropagation();

    try {
      await updateDoc(doc(db, "orders", order.id), {
        status: newStatus
      });
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const cancelOrder = async (e) => {
    e.stopPropagation();

    if (window.confirm("Cancel this order?")) {
      try {
        await updateDoc(doc(db, "orders", order.id), {
          status: STATUS.CANCELLED
        });
      } catch (err) {
        console.error("Cancel error:", err);
      }
    }
  };

  const sendWhatsApp = (e) => {
    e.stopPropagation();

    if (!order.phone) {
      alert("No phone number");
      return;
    }

    const phone = order.phone.replace(/^0/, "20");

    const message = `Hello ${order.customerName}
Your order from *Shelter House Of Cheese* is:
${(order.items || [])
  .map((i) => `${getText(i.name)} x${i.qty}`)
  .join("\n")}
Address: ${order.address || "—"}
Total: ${order.total} EGP
Your order *#${order.orderNumber}* is now ${statusInfo.label}.
If there is any problem call us on: 17574
Thank you for ordering from *Shelter House Of Cheese*`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const actionBtn = ACTION_BUTTONS.find(
    (a) => a.status === order.status
  );

  return (
    <div
      className={`order-card order-card--${order.status}`}
      onClick={() => onOpen(order)}
    >
      <div className="order-card__top">
        <span className="order-card__num">
          #{order.orderNumber}
        </span>

        <span
          className="order-card__status"
          style={{
            color: statusInfo.color,
            background: statusInfo.bg
          }}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className="order-card__customer">
        <span className="order-card__name">
          {order.customerName}
        </span>
        <span className="order-card__phone">
          {order.phone}
        </span>
      </div>

      <div className="order-card__meta">
        <span
          className={`order-card__type order-card__type--${order.orderType}`}
        >
          {order.orderType === "delivery"
            ? "🛵 Delivery"
            : "🏃 Pickup"}
        </span>

        <span className="order-card__time">{time}</span>
      </div>

      <p className="order-card__items-preview">
        {(order.items || [])
          .slice(0, 2)
          .map((i) => `${getText(i.name)} ×${i.qty}`)
          .join(" · ")}

        {order.items?.length > 2 &&
          ` +${order.items.length - 2} more`}
      </p>

      <div className="order-card__total">
        <span>Total</span>
        <span className="order-card__total-amount">
          {order.total} EGP
        </span>
      </div>

      <div
        className="order-card__actions"
        onClick={(e) => e.stopPropagation()}
      >
        {actionBtn && (
          <button
            className="order-card__btn order-card__btn--primary"
            onClick={(e) =>
              updateStatus(e, actionBtn.next)
            }
          >
            {actionBtn.label}
          </button>
        )}

        <button
          className="order-card__btn order-card__btn--whatsapp"
          onClick={sendWhatsApp}
        >
          WhatsApp
        </button>

        {order.status !== STATUS.CANCELLED &&
          order.status !== STATUS.COMPLETED && (
            <button
              className="order-card__btn order-card__btn--cancel"
              onClick={cancelOrder}
            >
              Cancel
            </button>
          )}
      </div>
    </div>
  );
}

export default OrderCard;