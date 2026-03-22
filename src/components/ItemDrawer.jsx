import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/drawer.css";

/* ─── helpers ──────────────────────────────────────────────────────────────── */

const getLang = (field, lang = "en") => {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] ?? field["en"] ?? field["ar"] ?? Object.values(field)[0] ?? "";
};

/**
 * Firestore maps come back as plain objects.
 * Filter out null values (e.g. triple: null in Chicken Burger).
 * Returns [{ key, label, value }, ...]
 */
const parseSizes = (prices) => {
  if (!prices || typeof prices !== "object" || Array.isArray(prices)) return [];
  return Object.entries(prices)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([key, value]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: Number(value),
    }))
    .filter((s) => !isNaN(s.value) && s.value > 0);
};

/**
 * Robust check: is `prices` a real non-empty plain object?
 * Handles Firestore maps, null, arrays, strings safely.
 */
const detectPrices = (prices) => {
  if (prices === null || prices === undefined) return false;
  if (typeof prices !== "object")              return false; // string / number
  if (Array.isArray(prices))                   return false;
  const validEntries = Object.entries(prices).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
  );
  return validEntries.length > 0;
};

const SPICY_CATS = new Set([
  "Beef Burger", "Chicken Burger", "Meals",
  "Broast", "Broast Saver", "Chicken Sandwich",
  "Beef Sandwich", "Sides",
]);

/* ─── component ─────────────────────────────────────────────────────────────── */

export default function ItemDrawer({ item, onClose, addToCart }) {
  const { i18n } = useTranslation();
  const lang  = i18n.language?.startsWith("ar") ? "ar" : "en";
  const isRTL = lang === "ar";

  const [selectedSizeKey, setSelectedSizeKey] = useState(null); // plain string key
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isSpicy,         setIsSpicy]         = useState(null);
  const [shake,           setShake]           = useState(false);
  const [addedAnim,       setAddedAnim]       = useState(false);

  /* reset on every new item */
useEffect(() => {
  if (!item) return;

  setTimeout(() => {
    setSelectedSizeKey(null);
    setSelectedOptions({});
    setIsSpicy(null);
  }, 0);
}, [item]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = item ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [item]);

  /* Escape key */
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  if (!item) return null;

  /* ── DEBUG LOG ─────────────────────────────────────────────────────────────
     شيل الـ console.log دا بعد ما تتأكد إن كل حاجة شغالة تمام              */
  console.log("🧪 ItemDrawer →", item.name?.ar ?? item.name, {
    "item.price":       item.price,
    "item.prices":      item.prices,
    "typeof prices":    typeof item.prices,
    "prices keys":      item.prices ? Object.keys(item.prices) : "—",
    "detectPrices()":   detectPrices(item.prices),
    "category":         item.category,
    "showSpicy":        SPICY_CATS.has(item.category),
  });
  /* ─────────────────────────────────────────────────────────────────────── */

  /* ── derived values ── */
  const hasPrices      = detectPrices(item.prices);
  const hasSinglePrice = !hasPrices && (item.price !== null && item.price !== undefined);
  const sizes          = hasPrices ? parseSizes(item.prices) : [];
  const showSpicy      = SPICY_CATS.has(item.category);

  const sizeValue   = hasPrices && selectedSizeKey
                        ? (Number(item.prices[selectedSizeKey]) || null)
                        : null;
  const basePrice   = hasPrices
                        ? sizeValue
                        : hasSinglePrice
                        ? Number(item.price)
                        : 0;
  const optionExtra = Object.values(selectedOptions).reduce(
    (sum, opt) => sum + (typeof opt === "object" ? (opt?.extra ?? 0) : 0),
    0
  );
  const totalPrice  = basePrice != null ? basePrice + optionExtra : null;
  const canAdd      = !hasPrices || selectedSizeKey !== null;

  /* ── handlers ── */
  const handleSizeClick = (key) =>
    setSelectedSizeKey((prev) => (prev === key ? null : key));

  const handleOptionToggle = (groupIdx, optLabel) =>
    setSelectedOptions((prev) => ({
      ...prev,
      [groupIdx]: prev[groupIdx] === optLabel ? undefined : optLabel,
    }));

  const handleAdd = () => {
    if (!canAdd) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    addToCart?.({
      id:        item.docId || item.id || crypto.randomUUID(),
      name:      getLang(item.name, lang),
      image:     item.image ?? null,
      category:  item.category,
      sizeKey:   selectedSizeKey,
      sizeLabel: selectedSizeKey
                   ? selectedSizeKey.charAt(0).toUpperCase() + selectedSizeKey.slice(1)
                   : null,
      spicy:     isSpicy,
      options:   selectedOptions,
      price:     totalPrice,
    });
    setAddedAnim(true);
    setTimeout(() => onClose?.(), 820);
  };

  /* ── render ── */
  const itemName = getLang(item.name, lang);
  const itemDesc = getLang(item.description, lang);

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} aria-hidden="true" />

      <aside
        className={`drawer ${isRTL ? "drawer--rtl" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={itemName}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* close button */}
        <button className="drawer-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6"  x2="6"  y2="18" />
            <line x1="6"  y1="6"  x2="18" y2="18" />
          </svg>
        </button>

        {/* hero */}
<div className="drawer-hero">
  {item.id ? (
    <img
      src={`/images/${item.id}.webp`}
      alt={itemName}
      draggable={false}
    />
  ) : (
    <div className="drawer-hero-placeholder">
      <span>🍽️</span>
    </div>
  )}

  <div className="drawer-hero-fade" />

  {item.category && (
    <span className="drawer-category-chip">
      {item.category}
    </span>
  )}
</div>

        {/* scrollable body */}
        <div className="drawer-body">

          {/* title + single-price pill */}
          <div className="drawer-title-row">
            <h2 className="drawer-name">{itemName}</h2>
            {hasSinglePrice && (
              <span className="drawer-price-pill">
                {item.price} <em>EGP</em>
              </span>
            )}
          </div>

          {itemDesc && <p className="drawer-description">{itemDesc}</p>}

          {/* ── SIZE SELECTOR ── */}
          {hasPrices && sizes.length > 0 && (
            <section className={`drawer-section ${shake ? "drawer-section--shake" : ""}`}>
              <h3 className="drawer-section-title">
                {isRTL ? "اختر الحجم" : "Choose Size"}
                <span className="drawer-required-badge">
                  {isRTL ? "مطلوب" : "Required"}
                </span>
              </h3>
              <div className="drawer-sizes">
                {sizes.map((size) => (
                  <button
                    key={size.key}
                    type="button"
                    className={`drawer-size-btn ${selectedSizeKey === size.key ? "drawer-size-btn--active" : ""}`}
                    onClick={() => handleSizeClick(size.key)}
                  >
                    <span className="drawer-size-name">{size.label}</span>
                    <span className="drawer-size-price">{size.value} EGP</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ── SPICY TOGGLE ── */}
          {showSpicy && (
            <section className="drawer-section">
              <h3 className="drawer-section-title">
                {isRTL ? "مستوى الحرارة" : "Spice Level"}
                <span className="drawer-optional-badge">
                  {isRTL ? "اختياري" : "Optional"}
                </span>
              </h3>
              <div className="drawer-spicy-row">
                <button
                  type="button"
                  className={`drawer-spicy-btn drawer-spicy-btn--hot ${isSpicy === true ? "drawer-spicy-btn--active-hot" : ""}`}
                  onClick={() => setIsSpicy((prev) => prev === true ? null : true)}
                >
                  🌶️ {isRTL ? "حار" : "Spicy"}
                </button>
                <button
                  type="button"
                  className={`drawer-spicy-btn drawer-spicy-btn--mild ${isSpicy === false ? "drawer-spicy-btn--active-mild" : ""}`}
                  onClick={() => setIsSpicy((prev) => prev === false ? null : false)}
                >
                  😌 {isRTL ? "مش حار" : "Not Spicy"}
                </button>
              </div>
            </section>
          )}

          {/* ── OPTION GROUPS ── */}
          {Array.isArray(item.optionGroups) && item.optionGroups.map((group, gi) => (
            <section className="drawer-section" key={gi}>
              <h3 className="drawer-section-title">
                {getLang(group.title, lang) || group.title}
                <span className="drawer-optional-badge">
                  {isRTL ? "اختياري" : "Optional"}
                </span>
              </h3>
              <div className="drawer-options">
                {group.options.map((opt, oi) => {
                  const optLabel = typeof opt === "string" ? opt : getLang(opt, lang);
                  const isActive = selectedOptions[gi] === optLabel;
                  return (
                    <button
                      key={oi}
                      type="button"
                      className={`drawer-option ${isActive ? "drawer-option--active" : ""}`}
                      onClick={() => handleOptionToggle(gi, optLabel)}
                    >
                      <span className="drawer-option-check">
                        {isActive && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      {optLabel}
                      {opt?.extra > 0 && (
                        <span className="drawer-option-extra">+{opt.extra} EGP</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          <div style={{ height: "6rem" }} />
        </div>

        {/* ── STICKY FOOTER ── */}
        <div className="drawer-add">
          {hasPrices && !selectedSizeKey && (
            <p className="drawer-hint">
              {isRTL ? "⚠️ يرجى اختيار الحجم أولاً" : "⚠️ Please select a size first"}
            </p>
          )}
          <button
            type="button"
            className={[
              "drawer-add-btn",
              addedAnim ? "drawer-add-btn--added"    : "",
              !canAdd   ? "drawer-add-btn--disabled" : "",
            ].filter(Boolean).join(" ")}
            onClick={handleAdd}
            disabled={addedAnim}
          >
            {addedAnim ? (
              <span className="drawer-add-btn__inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {isRTL ? "تمت الإضافة! ✓" : "Added! ✓"}
              </span>
            ) : (
              <span className="drawer-add-btn__inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {isRTL ? "أضف للسلة" : "Add to Cart"}
                {totalPrice != null && (
                  <span className="drawer-add-btn__price">{totalPrice} EGP</span>
                )}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}