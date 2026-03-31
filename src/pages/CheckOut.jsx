import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/checkout.css";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { useTranslation } from "react-i18next";
import useTable from "../components/useTable";

// استدعاء ملف الخريطة
import LocationPicker from "../components/LocationPicker";

// --- إحداثيات الفروع وحساب المسافة ---
const BRANCHES = {
  mashaya: { lat: 31.047131947583605, lng: 31.372379203189183 }, 
  gamaa: { lat: 31.03632326743449, lng: 31.357770867506485 }    
};

function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getClosestBranch(userLat, userLng) {
  const distMashaya = getDistanceInKm(userLat, userLng, BRANCHES.mashaya.lat, BRANCHES.mashaya.lng);
  const distGamaa = getDistanceInKm(userLat, userLng, BRANCHES.gamaa.lat, BRANCHES.gamaa.lng);
  
  return distMashaya <= distGamaa ? "mashaya" : "gamaa";
}

function isRestaurantOpen() {
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 3 && hour < 9) {
    return false;
  }
  return true;
}


async function getAddressFromCoords(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=ar`
    );

    if (!res.ok) return `${lat}, ${lng}`;

    const data = await res.json();
    const addr = data.address || {};

    // 👇 الشارع
    const street =
      addr.road ||
      addr.pedestrian ||
      addr.residential ||
      addr.footway ||
      "";

    // 👇 المنطقة الصح (الأهم هنا الترتيب)
    const area =
      addr.suburb ||
      addr.city_district ||
      addr.neighbourhood ||
      addr.quarter ||
      addr.district ||
      "";

    // 👇 القسم / المركز
    const state =
      addr.state_district ||
      addr.county ||
      "";

    // 👇 المدينة
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      "المنصورة";

    // لو مفيش بيانات
    if (!street && !area && !city) {
      return data.display_name || `${lat}, ${lng}`;
    }

    // 👇 تنظيف قيم غلط زي "أول"
    const clean = (v) =>
      v
        ?.replace(/ميت طلخا|طلخا|مركز|أول|ثاني/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const finalAddress = [
      clean(street),
      clean(area),
      clean(state),
      clean(city)
    ]
      .filter(Boolean)
      .join(" , ");

    return finalAddress || data.display_name || `${lat}, ${lng}`;
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    return `${lat}, ${lng}`;
  }
}

function Checkout({ cart = [] }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { tableNumber, branchName } = useTable();
  const isDineIn = Boolean(tableNumber);

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
  const deliveryFee = !isDineIn && orderType === "delivery" ? 25 : 0;
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

  // --- دالة تحديد موقع العميل بالـ GPS ---
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setMapPosition([latitude, longitude]);
          const addressText = await getAddressFromCoords(latitude, longitude);
          setFormData((prev) => ({
            ...prev,
            address: addressText || `${latitude},${longitude}`
          }));
        },
(error) => {
          console.error("GPS Error:", error); // استخدمنا المتغير هنا
          alert(lang === "ar" ? "برجاء السماح للمتصفح بمعرفة موقعك (GPS) لتحديد العنوان بدقة." : "Please enable GPS to locate your address.");
        }
      );
    } else {
      alert(lang === "ar" ? "متصفحك لا يدعم هذه الخاصية." : "Geolocation is not supported by your browser.");
    }
  };

  const validate = () => {
    const newErrors = {};
    const nameValue = formData.name.trim();

    if (!nameValue) {
      newErrors.name = t("checkout.errors.name");
    } else if (/\d/.test(nameValue)) {
      newErrors.name = "Name cannot contain numbers";
    }

    if (!isDineIn) {
      const phoneDigits = formData.phone.replace(/\D/g, "");
      if (!phoneDigits) {
        newErrors.phone = t("checkout.errors.phone");
      } else if (!/^01\d{9}$/.test(phoneDigits)) {
        newErrors.phone = t("checkout.errors.phoneInvalid");
      }

      if (orderType === "delivery" && !formData.address.trim()) {
        newErrors.address = t("checkout.errors.address");
      }
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

      // --- حساب الفرع النهائي ---
      let finalBranch = branchName; 
      if (!isDineIn && orderType === "delivery") {
        finalBranch = getClosestBranch(mapPosition[0], mapPosition[1]);
      }

      await addDoc(collection(db, "orders"), {
        orderNumber: shortOrderNumber,
        customerName: formData.name,
        phone: isDineIn ? "" : formData.phone,
        address: isDineIn ? "" : formData.address,
        notes: formData.notes || "",
        orderType: isDineIn ? "dine-in" : orderType,
        table: isDineIn ? tableNumber : null,
        branch: finalBranch || null, 
        items: cart,
        subtotal,
        vat,
        deliveryFee,
        total: finalTotal,
        status: "new",
        createdAt: serverTimestamp(),
        // تخزين الإحداثيات عشان نستخدمها للطيار في الداشبورد
        lat: mapPosition[0],
        lng: mapPosition[1]
      });

      if (isDineIn) {
        sessionStorage.removeItem("tableNumber");
        sessionStorage.removeItem("branchName"); 
      }

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

          {isDineIn ? (
            <p className="checkout-success__msg">
              Order <strong>#{orderNumber}</strong> confirmed for{" "}
              <strong>Table {tableNumber}</strong>.
            </p>
          ) : (
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
          )}

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

          {isDineIn && (
            <div className="table-box">
              Your Order Will Be Delivered To Table {tableNumber}
            </div>
          )}

          {!isDineIn && (
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
          )}

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

          {!isDineIn && (
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
          )}

          {!isDineIn && orderType === "delivery" && (
            <div
              className={`checkout-field ${
                errors.address ? "checkout-field--error" : ""
              }`}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className="checkout-field__label" style={{ margin: 0 }}>
                  {t("checkout.address")}
                </label>
                
                <button
                  type="button"
                  onClick={getUserLocation}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#e8521a", 
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  📍 {lang === "ar" ? "موقعي الحالي" : "My Location"}
                </button>
              </div>

               <LocationPicker
  initialPosition={mapPosition}
  addressText={formData.address}

  setLocation={async (coords) => {
    setMapPosition([coords.lat, coords.lng]);

    // 👇 مهم: خلي في fallback فورًا عشان الـ UI ما يفضلش فاضي
    setFormData((prev) => ({
      ...prev,
      address: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
    }));

    try {
      const addressText = await getAddressFromCoords(
        coords.lat,
        coords.lng
      );

      setFormData((prev) => ({
        ...prev,
        address:
          addressText?.trim() ||
          `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
      }));
    } catch (err) {
      console.error("Reverse geocoding error:", err);

      setFormData((prev) => ({
        ...prev,
        address: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
      }));
    }
  }}
/>

<input
  className="checkout-field__input"
  style={{ marginTop: "12px" }}
  type="text"
  name="address"
  value={formData.address}
  onChange={handleChange}
  placeholder={
    lang === "ar"
      ? "تفاصيل العنوان (رقم العمارة، علامة مميزة ،الشارع)..."
      : "Address details (Building, Street)..."
  }
/>

              {errors.address && (
                <span className="checkout-field__error">{errors.address}</span>
              )}
            </div>
          )}

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

          {!isDineIn && orderType === "delivery" && (
            <div className="checkout-delivery">
              <span>{t("checkout.deliveryFee")}</span>
              <span>{deliveryFee.toFixed(2)} EGP</span>
            </div>
          )}

          <div className="checkout-delivery">
            <span>VAT 14%</span>
            <span>{vat.toFixed(2)} EGP</span>
          </div>

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

          {isDineIn ? (
            <div className="checkout-actions">
              <button
                className="checkout-edit-btn"
                onClick={() => navigate(-1)}
              >
                Edit Order
              </button>

              <button
                className="checkout-confirm-btn"
                onClick={handleConfirm}
                disabled={
                  cart.length === 0 ||
                  isBelowMinimum ||
                  !restaurantOpen ||
                  isSubmitting
                }
              >
                {isSubmitting
                  ? "جارٍ الإرسال..."
                  : isBelowMinimum
                  ? `Minimum order ${minimumOrder} EGP`
                  : "Confirm Order"}
              </button>
            </div>
          ) : (
            <button
              className="checkout-confirm-btn"
              onClick={handleConfirm}
              disabled={
                cart.length === 0 ||
                isBelowMinimum ||
                !restaurantOpen ||
                isSubmitting
              }
            >
              {isSubmitting
                ? "جارٍ الإرسال..."
                : isBelowMinimum
                ? `Minimum order ${minimumOrder} EGP`
                : t("checkout.confirm")}
            </button>
          )}
        </section>
      </div>
    </div>
  );
}

export default Checkout;