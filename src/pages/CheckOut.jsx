import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/checkout.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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
const customIcon = new L.Icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
async function getAddressFromCoords(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`
  );

  if (!res.ok) return "";

  const data = await res.json();
  return data.display_name || "";
}

function Checkout({ cart = [] }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
  const minimumOrder = 100;

  const [orderType, setOrderType] = useState("delivery");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: ""
  });

  const [mapPosition, setMapPosition] = useState([31.0409, 31.3785]);

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getText = (value) => {
    if (typeof value === "string") return value;
    if (!value || typeof value !== "object") return "";
    return value[lang] || value.ar || value.en || "";
  };

  const getPrice = (item) => {
    if (typeof item.price === "number") return item.price;

    if (item.prices && typeof item.prices === "object") {
      const vals = Object.values(item.prices).filter(
        (v) => typeof v === "number"
      );
      if (vals.length > 0) return vals[0];
    }

    return 0;
  };

const subtotal = cart.reduce(
  (sum, item) => sum + getPrice(item) * (item.qty || 1),
  0
);

const vat = subtotal * 0.14;

const deliveryFee = orderType === "delivery" ? 25 : 0;

const finalTotal = subtotal + vat + deliveryFee;





  const restaurantOpen = isRestaurantOpen();
  const isBelowMinimum = finalTotal < minimumOrder;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 11);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  function LocationMarker() {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;

        setMapPosition([lat, lng]);

        const addressText = await getAddressFromCoords(lat, lng);

        setFormData((prev) => ({
          ...prev,
          address: addressText || `${lat},${lng}`
        }));
      }
    });

return <Marker position={mapPosition} icon={customIcon} />;
  }

  const validate = () => {
    const newErrors = {};
    const nameValue = formData.name.trim();

    if (!nameValue) {
      newErrors.name = t("checkout.errors.name");
    } else if (/\d/.test(nameValue)) {
      newErrors.name = "Name cannot contain numbers";
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

  const handleConfirm = async () => {
    if (!isRestaurantOpen()) {
      alert("Shelter is currently closed. We open at 9 AM.");
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const shortOrderNumber = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      setOrderNumber(shortOrderNumber);

      await addDoc(collection(db, "orders"), {
        orderNumber: shortOrderNumber,
        customerName: formData.name,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes || "",
        orderType,
        items: cart,
        subtotal,
        vat,
        deliveryFee,
        total: finalTotal,
        status: "new",
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Order error:", err);
      alert("حدث خطأ أثناء إرسال الطلب، برجاء المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                i === 1 || i === 3 ? <strong key={i}>{part}</strong> : part
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
        <h1 className="checkout-header__title">{t("checkout.title")}</h1>
      </header>

      <div className="checkout-layout">
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

          <div
            className={`checkout-field ${
              errors.name ? "checkout-field--error" : ""
            }`}
          >
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

          <div
            className={`checkout-field ${
              errors.phone ? "checkout-field--error" : ""
            }`}
          >
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

          {orderType === "delivery" && (
            <div
              className={`checkout-field ${
                errors.address ? "checkout-field--error" : ""
              }`}
            >
              <label className="checkout-field__label">
                {t("checkout.address")}
              </label>

              <MapContainer
                center={mapPosition}
                zoom={15}
                style={{ height: "250px", width: "100%", borderRadius: "10px" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker />
              </MapContainer>

              {formData.address && (
                <p style={{ marginTop: "8px", fontSize: "14px" }}>
                  📍 {formData.address}
                </p>
              )}

              {errors.address && (
                <span className="checkout-field__error">{errors.address}</span>
              )}
            </div>
          )}

          <div className="checkout-field">
            <label className="checkout-field__label">{t("checkout.notes")}</label>
            <textarea
              className="checkout-field__textarea"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </section>

       <section className="checkout-section checkout-section--summary">
  <h2 className="checkout-section__title">
    <span className="checkout-section__num">2</span>
    {t("checkout.step2")}
  </h2>

  {cart.length === 0 ? (
    <p className="checkout-empty">{t("checkout.empty")}</p>
  ) : (
    <ul className="checkout-items">
      {cart.map((item, index) => (
        <li
          className="checkout-item"
          key={item.id || `${getText(item.name)}-${index}`}
        >
          <div className="checkout-item__details">
            <span className="checkout-item__name">
              {getText(item.name)}
            </span>
            <span className="checkout-item__qty">
              × {item.qty || 1}
            </span>
          </div>

          <span className="checkout-item__price">
            EGP {(getPrice(item) * (item.qty || 1)).toFixed(2)}
          </span>
        </li>
      ))}
    </ul>
  )}

  {/* Delivery */}
  {orderType === "delivery" && (
    <div className="checkout-delivery">
      <span>{t("checkout.deliveryFee")}</span>
      <span>{deliveryFee.toFixed(2)} EGP</span>
    </div>
  )}

  {/* VAT بنفس ستايل الدليفري */}
  <div className="checkout-delivery">
    <span>VAT 14%</span>
    <span>{vat.toFixed(2)} EGP</span>
  </div>

  {/* TOTAL (رجعناه ستايله الأصلي 🔥) */}
  <div className="checkout-total">
    <span className="checkout-total__label">
      {t("checkout.total")}
    </span>

    <span className="checkout-total__amount">
      EGP {finalTotal.toFixed(2)}
    </span>
  </div>

          {!restaurantOpen && (
            <div className="restaurant-closed">
              Shelter closed — opens at 9:00 AM
            </div>
          )}

          <button
            className="checkout-confirm-btn"
            onClick={handleConfirm}
            disabled={
              cart.length === 0 || isBelowMinimum || !restaurantOpen || isSubmitting
            }
          >
            {isSubmitting
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