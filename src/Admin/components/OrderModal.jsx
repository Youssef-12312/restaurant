import { useTranslation } from "react-i18next";

function getText(value, lang = "en") {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value[lang] || value.ar || value.en || "";
}

function getPrice(item) {
  if (typeof item.price === "number") return item.price;
  if (item.prices && typeof item.prices === "object") {
    const vals = Object.values(item.prices).filter(
      (v) => typeof v === "number"
    );
    if (vals.length > 0) return vals[0];
  }
  return 0;
}

function getOrderTypeLabel(orderType, t) {
  if (orderType === "delivery") return `🛵 ${t("admin.orderType.delivery")}`;
  if (orderType === "pickup") return `🏃 ${t("admin.orderType.pickup")}`;
  if (orderType === "dine-in") return `🍽️ ${t("admin.orderType.dineIn")}`;
  return orderType || "—";
}

// دالة صغيرة عشان نترجم اسم الفرع بشكل لطيف
function getBranchLabel(branchCode, t) {
  if (branchCode === "mashaya") return `📍 ${t("admin.branches.mashayaBranch")}`;
  if (branchCode === "gamaa") return `📍 ${t("admin.branches.gamaaBranch")}`;
  return branchCode || "—";
}

function OrderModal({ order, onClose }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";

  if (!order) return null;

  const locale = lang === "ar" ? "ar-EG" : "en-US";

  const time = order.createdAt?.toDate?.()
    ? order.createdAt.toDate().toLocaleString(locale)
    : order.createdAt || "—";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {t("admin.modal.order")} #{order.orderNumber}
            </h2>
            <p className="modal-time">{time}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-section">
          <h3 className="modal-section__title">
            {t("admin.modal.customer")}
          </h3>

          <div className="modal-info-grid">
            
          
            {order.branch && (
              <>
                <span className="modal-info__key" style={{ alignSelf: "center" }}>
                  {t("admin.modal.branch")}
                </span>
                <span 
                  className="modal-info__val" 
                  style={{ 
                    fontWeight: "bold", 
                    fontSize: "18px", // تكبير الخط
                    color: order.branch === "mashaya" ? "#0369a1" : "#854d0e",
                    backgroundColor: order.branch === "mashaya" ? "#e0f2fe" : "#fef08a",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    display: "inline-block",
                    width: "fit-content"
                  }}
                >
                   {getBranchLabel(order.branch, t)}
                </span>
              </>
            )}

            <span className="modal-info__key">{t("admin.modal.name")}</span>
            <span className="modal-info__val">{order.customerName || "—"}</span>

            <span className="modal-info__key">{t("admin.modal.phone")}</span>
            <span className="modal-info__val">{order.phone || "—"}</span>

            <span className="modal-info__key">{t("admin.modal.type")}</span>
            <span className={`modal-badge modal-badge--${order.orderType}`}>
              {getOrderTypeLabel(order.orderType, t)}
              {order.orderType === "dine-in" && order.table
                ? ` - ${t("admin.modal.table")} ${order.table}`
                : ""}
            </span>

{(order.address || order.manualAddress) && (
  <>
    <span className="modal-info__key">
      {t("admin.modal.address")}
    </span>

    <div className="modal-address">
      
      {/* 👇 العنوان من الخريطة */}
      {order.address && (
        <span className="modal-info__val">
          📍 {order.address}
        </span>
      )}

      {/* 👇 العنوان التفصيلي (الأهم) */}
      {order.manualAddress && (
        <span
          className="modal-info__val"
          style={{
            display: "block",
            marginTop: "6px",
            fontWeight: "bold",
            color: "#e8521a"
          }}
        >
          📝 {t("admin.modal.details")}:{" "}
          {order.manualAddress}
        </span>
      )}
      
    </div>
  </>
)}
          </div>
        </div>

        <div className="modal-section">
          <h3 className="modal-section__title">{t("admin.modal.items")}</h3>

          <ul className="modal-items">
            {(order.items || []).map((item, i) => {
              const optionValues = Object.values(item.options || {})
                .filter(Boolean)
                .map((option) => getText(option, lang));
              const hasBadges =
                item.sizeLabel || item.spicy != null || optionValues.length > 0;

              return (
                <li className="modal-item" key={i}>
                  <div className="modal-item__details">
                     <span className="modal-item__name">
                        {getText(item.name, lang)}
                     </span>
                     <span className="modal-item__qty">× {item.qty}</span>
                  </div>

                  <span className="modal-item__price">
                    {(getPrice(item) * (item.qty || 1)).toFixed(2)}{" "}
                    {t("common.egp")}
                  </span>

                  {hasBadges && (
                    <div className="modal-item__badges">
                      {item.sizeLabel && (
                        <span className="modal-badge modal-badge--size">
                          {getText(item.sizeLabel, lang)}
                        </span>
                      )}

                      {item.spicy === true && (
                        <span className="modal-badge modal-badge--spicy">
                          🌶️ {t("admin.modal.spicy")}
                        </span>
                      )}

                      {item.spicy === false && (
                        <span className="modal-badge modal-badge--mild">
                          😌 {t("admin.modal.notSpicy")}
                        </span>
                      )}

                      {optionValues.map((opt, oi) => (
                        <span
                          key={oi}
                          className="modal-badge modal-badge--option"
                        >
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

        {order.notes && (
          <div className="modal-section">
            <h3 className="modal-section__title">{t("admin.modal.notes")}</h3>
            <p className="modal-notes">{order.notes}</p>
          </div>
        )}

        <div className="modal-footer">
          <div className="modal-total">
            <span>{t("admin.modal.total")}</span>
            <span className="modal-total__amount">
              {order.total} {t("common.egp")}
            </span>
          </div>

          {order.phone && (
            <a
              className="modal-whatsapp"
              href={`https://wa.me/${order.phone.replace(/^0/, "20")}`}
              target="_blank"
              rel="noreferrer"
            >
              💬 {t("admin.actions.whatsapp")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderModal;
