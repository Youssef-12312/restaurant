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

function OrderModal({ order, onClose }) {
  if (!order) return null;

  const time = order.createdAt?.toDate?.()
    ? order.createdAt.toDate().toLocaleString("en-EG")
    : order.createdAt || "—";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Order #{order.orderNumber}</h2>
            <p className="modal-time">{time}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Customer Info ── */}
        <div className="modal-section">
          <h3 className="modal-section__title">Customer</h3>
          <div className="modal-info-grid">
            <span className="modal-info__key">Name</span>
            <span className="modal-info__val">{order.customerName}</span>

            <span className="modal-info__key">Phone</span>
            <span className="modal-info__val">{order.phone}</span>

            <span className="modal-info__key">Type</span>
            <span className={`modal-badge modal-badge--${order.orderType}`}>
              {order.orderType === "delivery" ? "🛵 Delivery" : "🏃 Pickup"}
            </span>

            {order.address && (
              <>
                <span className="modal-info__key">Address</span>
                <div className="modal-address">
                  <span className="modal-info__val">{order.address}</span>
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(order.address)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Location
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Items ── */}
        <div className="modal-section">
          <h3 className="modal-section__title">Items</h3>
          <ul className="modal-items">
            {(order.items || []).map((item, i) => {
              const optionValues = Object.values(item.options || {}).filter(Boolean);
              const hasBadges = item.sizeLabel || item.spicy != null || optionValues.length > 0;

              return (
                <li className="modal-item" key={i}>

                  {/* الصف الأول: اسم + كمية + سعر */}
                  <span className="modal-item__name">{getText(item.name)}</span>
                  <span className="modal-item__qty">× {item.qty}</span>
                  <span className="modal-item__price">
                    {(getPrice(item) * (item.qty || 1)).toFixed(2)} EGP
                  </span>

                  {/* الـ badges تحت الاسم */}
                  {hasBadges && (
                    <div className="modal-item__badges">

                      {/* الحجم */}
                      {item.sizeLabel && (
                        <span className="modal-badge modal-badge--size">
                          📐 {item.sizeLabel}
                        </span>
                      )}

                      {/* الحرارة */}
                      {item.spicy === true && (
                        <span className="modal-badge modal-badge--spicy">
                          🌶️ حار
                        </span>
                      )}
                      {item.spicy === false && (
                        <span className="modal-badge modal-badge--mild">
                          😌 مش حار
                        </span>
                      )}

                      {/* الاختيارات */}
                      {optionValues.map((opt, oi) => (
                        <span key={oi} className="modal-badge modal-badge--option">
                          ✔ {opt}
                        </span>
                      ))}

                    </div>
                  )}

                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Notes ── */}
        {order.notes && (
          <div className="modal-section">
            <h3 className="modal-section__title">Notes</h3>
            <p className="modal-notes">{order.notes}</p>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="modal-footer">
          <div className="modal-total">
            <span>Total</span>
            <span className="modal-total__amount">{order.total} EGP</span>
          </div>
          <a
            className="modal-whatsapp"
            href={`https://wa.me/${order.phone}`}
            target="_blank"
            rel="noreferrer"
          >
            💬 WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}

export default OrderModal;