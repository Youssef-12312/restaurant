import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/menu.css";
import { useTranslation } from "react-i18next";
import { getCartItemKey, getCartItemVariantLabels } from "../utils/cartItem.js";
import { getItemSelectedPrice } from "../utils/menuSchema.js";

function getPrice(item) {
  return getItemSelectedPrice(item) ?? 0;
}

function CartContent({
  cart,
  removeFromCart,
  decreaseQty,
  addToCart,
  total,
  navigate
}) {
  const { t, i18n } = useTranslation();

  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";

  const getText = (value) => {
    if (typeof value === "string") return value;
    if (!value || typeof value !== "object") return "";
    return value[lang] || value.ar || value.en || "";
  };

  return (
    <>
      <div className="cart__body">
        {cart.length === 0 ? (
          <p className="cart__empty">{t("cart.empty")}</p>
        ) : (
          cart.map((item, index) => {
            const itemKey = getCartItemKey(item) || index;
            const variantLabels = getCartItemVariantLabels(item, lang);

            return (
              <div className="cart__item" key={itemKey}>
{item.imageUrl ? (
  <img
    className="cart__item-img"
    src={item.imageUrl}
    alt={getText(item.name)}
  />
) : (
  <div className="cart__item-img cart__item-img--placeholder" aria-label={getText(item.name)}>
    <span aria-hidden="true">🍽️</span>
  </div>
)}

                <div className="cart__item-info">
                  <p className="cart__item-name">{getText(item.name)}</p>
                  {variantLabels.length > 0 && (
                    <p
                      className="cart__item-variants"
                      style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#6b7280" }}
                    >
                      {variantLabels.join(", ")}
                    </p>
                  )}
                  <p className="cart__item-price">
                    EGP {(getPrice(item) * (item.qty || 1)).toFixed(2)}
                  </p>
                </div>

                <div className="cart__item-controls">
                  <button
                    className="cart__qty-btn"
                    onClick={() => decreaseQty(itemKey)}
                  >
                    −
                  </button>

                  <span className="cart__qty">{item.qty || 1}</span>

                  <button
                    className="cart__qty-btn"
                    onClick={() => addToCart(item)}
                  >
                    +
                  </button>

                  <button
                    className="cart__remove-btn"
                    onClick={() => removeFromCart(itemKey)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="cart__footer">
        <div className="cart__total">
          <span className="cart__total-label">{t("cart.total")}</span>
          <span className="cart__total-amount">EGP {total.toFixed(2)}</span>
        </div>

        <button
          className="cart__checkout-btn"
          onClick={() => navigate("/checkout")}
          disabled={cart.length === 0}
        >
          {t("cart.placeOrder")}
        </button>
      </div>
    </>
  );
}

function Cart({ cart, removeFromCart, decreaseQty, addToCart }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bump, setBump] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + getPrice(item) * (item.qty || 1),
    0
  );

  const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  useEffect(() => {
    if (totalQty === 0) return;

    const frame = requestAnimationFrame(() => setBump(true));
    const timeoutId = setTimeout(() => setBump(false), 320);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeoutId);
    };
  }, [totalQty]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const sharedProps = {
    cart,
    removeFromCart,
    decreaseQty,
    addToCart,
    total,
    navigate
  };

  return (
    <>
      <div className="cart cart--desktop">
        <div className="cart__header">
          <span className="cart__header-icon">🛒</span>
          <h2>{t("cart.title")}</h2>
          {totalQty > 0 && <span className="cart__count-badge">{totalQty}</span>}
        </div>
        <CartContent {...sharedProps} />
      </div>

      <button
        className={`cart-fab${bump ? " cart-fab--bump" : ""}`}
        onClick={() => setDrawerOpen(true)}
        aria-label="Open cart"
      >
        🛒
        {totalQty > 0 && <span className="cart-fab__badge">{totalQty}</span>}
      </button>

      <div
        className={`cart-overlay${drawerOpen ? " cart-overlay--open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      <div className={`cart-drawer${drawerOpen ? " cart-drawer--open" : ""}`}>
        <div className="cart__header">
          <span className="cart__header-icon">🛒</span>
          <h2>{t("cart.title")}</h2>
          {totalQty > 0 && <span className="cart__count-badge">{totalQty}</span>}
          <button
            className="cart-drawer__close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>
        <CartContent {...sharedProps} />
      </div>
    </>
  );
}

export default Cart;
