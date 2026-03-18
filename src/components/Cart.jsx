import { useState, useEffect } from "react";
import { images } from "../assets/Images/images";
import { useNavigate } from "react-router-dom";
import "../styles/menu.css";
import { useTranslation } from "react-i18next";

function getPrice(item) {
  if (item.price) return item.price;
  if (item.prices) {
    const priceValues = Object.values(item.prices);
    if (priceValues.length > 0) return priceValues[0];
  }
  return 0;
}

function CartContent({ cart, removeFromCart, decreaseQty, addToCart, total, navigate }) {
  const { t } = useTranslation();

  return (
    <>
      <div className="cart__body">
        {cart.length === 0 ? (
          <p className="cart__empty">{t("cart.empty")}</p>
        ) : (
          cart.map((item) => (
            <div className="cart__item" key={item.id}>
              <img
                className="cart__item-img"
                src={images[item.category] || images.placeholder}
                alt={item.name}
              />
              <div className="cart__item-info">
                <p className="cart__item-name">{item.name}</p>
                <p className="cart__item-price">
                  EGP {(getPrice(item) * item.qty).toFixed(2)}
                </p>
              </div>
              <div className="cart__item-controls">
                <button className="cart__qty-btn" onClick={() => decreaseQty(item.id)}>−</button>
                <span className="cart__qty">{item.qty}</span>
                <button className="cart__qty-btn" onClick={() => addToCart(item)}>+</button>
                <button className="cart__remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
              </div>
            </div>
          ))
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

  const total    = cart.reduce((sum, item) => sum + getPrice(item) * item.qty, 0);
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    if (totalQty === 0) return;
    const frame = requestAnimationFrame(() => setBump(true));
    const t = setTimeout(() => setBump(false), 320);
    return () => { cancelAnimationFrame(frame); clearTimeout(t); };
  }, [totalQty]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const sharedProps = { cart, removeFromCart, decreaseQty, addToCart, total, navigate };

  return (
    <>
      {/* ══ DESKTOP ══ */}
      <div className="cart cart--desktop">
        <div className="cart__header">
          <span className="cart__header-icon">🛒</span>
          <h2>{t("cart.title")}</h2>
          {totalQty > 0 && <span className="cart__count-badge">{totalQty}</span>}
        </div>
        <CartContent {...sharedProps} />
      </div>

      {/* ══ MOBILE FAB ══ */}
      <button
        className={`cart-fab${bump ? " cart-fab--bump" : ""}`}
        onClick={() => setDrawerOpen(true)}
        aria-label="Open cart"
      >
        🛒
        {totalQty > 0 && <span className="cart-fab__badge">{totalQty}</span>}
      </button>

      {/* ══ MOBILE Overlay ══ */}
      <div
        className={`cart-overlay${drawerOpen ? " cart-overlay--open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ══ MOBILE Drawer ══ */}
      <div className={`cart-drawer${drawerOpen ? " cart-drawer--open" : ""}`}>
        <div className="cart__header">
          <span className="cart__header-icon">🛒</span>
          <h2>{t("cart.title")}</h2>
          {totalQty > 0 && <span className="cart__count-badge">{totalQty}</span>}
          <button className="cart-drawer__close" onClick={() => setDrawerOpen(false)} aria-label="Close cart">✕</button>
        </div>
        <CartContent {...sharedProps} />
      </div>
    </>
  );
}

export default Cart;