import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/checkout.css";
import {
  addDoc,
  collection,
  serverTimestamp,
  runTransaction,
  doc
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useTranslation } from "react-i18next";

function isRestaurantOpen() {
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 3 && hour < 9) {
    return false;
  }
  return true;
}

function getPrice(item) {
  if (item.price) return item.price;
  if (item.prices) {
    const vals = Object.values(item.prices);
    if (vals.length > 0) return vals[0];
  }
  return 0;
}

function Checkout({ cart = [] }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const minimumOrder = 100;

  const [orderType, setOrderType] = useState("delivery");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + getPrice(item) * item.qty,
    0
  );

  const deliveryFee = orderType === "delivery" ? 25 : 0;
  const finalTotal = total + deliveryFee;
  const restaurantOpen = isRestaurantOpen();
  const isBelowMinimum = finalTotal < minimumOrder;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 12);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("checkout.errors.name");
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!phoneDigits) {
      newErrors.phone = t("checkout.errors.phone");
    } else if (!/^01\d{9}$/.test(phoneDigits)) {
      newErrors.phone = t("checkout.errors.phoneInvalid");
    }

    if (orderType === "delivery" && !formData.address.trim()) {
      newErrors.address = t("checkout.errors.address");
    }

    return newErrors;
  };

  /* ── Confirm Order ── */
  const handleConfirm = async () => {
    if (!isRestaurantOpen()) {
      alert("Restaurant is currently closed. We open at 9 AM.");
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const counterRef = doc(db, "counters", "orders");
      let newOrderNumber;

      // Transaction علشان الـ order number يكون unique دايماً
      await runTransaction(db, async (transaction) => {
        const counterSnap = await transaction.get(counterRef);
        if (!counterSnap.exists()) {
          // لو الـ document مش موجود، نعمله من الأول
          newOrderNumber = 1;
          transaction.set(counterRef, { count: 1 });
        } else {
          newOrderNumber = (counterSnap.data().count || 0) + 1;
          transaction.update(counterRef, { count: newOrderNumber });
        }
      });

      await addDoc(collection(db, "orders"), {
        orderNumber: newOrderNumber,
        customerName: formData.name,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        orderType: orderType,
        items: cart,
        total: finalTotal,
        status: "new",
        createdAt: serverTimestamp()
      });

      setOrderNumber(String(newOrderNumber).padStart(4, "0"));
      setSubmitted(true);

    } catch (err) {
      console.log("Order error:", err);
      alert("حصل خطأ أثناء إرسال الطلب، حاول تاني.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Success Screen ── */
  if (submitted) {
    return (
      <div className="checkout-success">
        <div className="checkout-success__card">
          <div className="checkout-success__icon">✓</div>
          <h2 className="checkout-success__title">
            {t("checkout.success.title")}
          </h2>
          <p className="checkout-success__msg">
            {t("checkout.success.msg", {
              name: formData.name,
              phone: formData.phone,
              order: `#${orderNumber}`
            })
              .split(/<\d>|<\/\d>/)
              .map((part, i) =>
                i === 1 || i === 3
                  ? <strong key={i}>{part}</strong>
                  : part
              )}
          </p>
          <button
            className="checkout-success__btn"
            onClick={() => navigate("/menu")}
          >
            {t("checkout.success.backToMenu")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <button
          className="checkout-header__back"
          onClick={() => navigate(-1)}
        >
          {t("checkout.back")}
        </button>
        <h1 className="checkout-header__title">
          {t("checkout.title")}
        </h1>
      </header>

      <div className="checkout-layout">

        {/* ── Step 1: Info ── */}
        <section className="checkout-section checkout-section--info">
          <h2 className="checkout-section__title">
            <span className="checkout-section__num">1</span>
            {t("checkout.step1")}
          </h2>

          <div className="checkout-order-type">
            <label className="order-type-option">
              <input
                type="radio"
                name="orderType"
                value="delivery"
                checked={orderType === "delivery"}
                onChange={(e) => setOrderType(e.target.value)}
              />
              {t("checkout.delivery")}
            </label>

            <label className="order-type-option">
              <input
                type="radio"
                name="orderType"
                value="pickup"
                checked={orderType === "pickup"}
                onChange={(e) => setOrderType(e.target.value)}
              />
              {t("checkout.pickup")}
            </label>
          </div>

          {/* Name */}
          <div className={`checkout-field ${errors.name ? "checkout-field--error" : ""}`}>
            <label className="checkout-field__label">
              {t("checkout.fullName")}
            </label>
            <input
              className="checkout-field__input"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("checkout.namePlaceholder")}
            />
            {errors.name && (
              <span className="checkout-field__error">{errors.name}</span>
            )}
          </div>

          {/* Phone */}
          <div className={`checkout-field ${errors.phone ? "checkout-field--error" : ""}`}>
            <label className="checkout-field__label">
              {t("checkout.phone")}
            </label>
            <input
              className="checkout-field__input"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              maxLength={11}
              placeholder="01xxxxxxxxx"
            />
            {errors.phone && (
              <span className="checkout-field__error">{errors.phone}</span>
            )}
          </div>

          {/* Address - delivery only */}
          {orderType === "delivery" && (
            <div className={`checkout-field ${errors.address ? "checkout-field--error" : ""}`}>
              <label className="checkout-field__label">
                {t("checkout.address")}
              </label>
              <input
                className="checkout-field__input"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder={t("checkout.addressPlaceholder")}
              />
              {errors.address && (
                <span className="checkout-field__error">{errors.address}</span>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="checkout-field">
            <label className="checkout-field__label">
              {t("checkout.notes")}
            </label>
            <textarea
              className="checkout-field__textarea"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* ── Step 2: Summary ── */}
        <section className="checkout-section checkout-section--summary">
          <h2 className="checkout-section__title">
            <span className="checkout-section__num">2</span>
            {t("checkout.step2")}
          </h2>

          {cart.length === 0 ? (
            <p className="checkout-empty">{t("checkout.empty")}</p>
          ) : (
            <ul className="checkout-items">
              {cart.map((item) => (
                <li className="checkout-item" key={item.id}>
                  <div className="checkout-item__details">
                    <span className="checkout-item__name">{item.name}</span>
                    <span className="checkout-item__qty">× {item.qty}</span>
                  </div>
                  <span className="checkout-item__price">
                    {(getPrice(item) * item.qty).toFixed(2)} EGP
                  </span>
                </li>
              ))}
            </ul>
          )}

          {orderType === "delivery" && (
            <div className="checkout-delivery">
              <span>{t("checkout.deliveryFee")}</span>
              <span>25 EGP</span>
            </div>
          )}

          <div className="checkout-total">
            <span className="checkout-total__label">{t("checkout.total")}</span>
            <span className="checkout-total__amount">{finalTotal.toFixed(2)} EGP</span>
          </div>

          {!restaurantOpen && (
            <div className="restaurant-closed">
              Restaurant closed — opens at 9:00 AM
            </div>
          )}

          <button
            className="checkout-confirm-btn"
            onClick={handleConfirm}
            disabled={cart.length === 0 || isBelowMinimum || !restaurantOpen || loading}
          >
            {loading
              ? "جاري الإرسال..."
              : isBelowMinimum
              ? `Minimum order ${minimumOrder} EGP`
              : t("checkout.confirm")}
          </button>
        </section>

      </div>
    </div>
  );
}

export default Checkout;