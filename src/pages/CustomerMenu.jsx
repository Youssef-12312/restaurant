import { useEffect, useState } from "react";
import MenuCard from "../components/MenuCard.jsx";
import Cart from "../components/Cart.jsx";
import { images } from "../assets/Images/images.js";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import ItemDrawer from "../components/ItemDrawer.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

// استيراد الخدمات والهوكس
import { fetchMenuData } from "../services/menuService.js";
import useTable from "../components/useTable";

// مكون النص المتحرك (Typewriter)
function Typewriter({ text }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    if (!isDeleting && displayedText.length < text.length) {
      timer = setTimeout(() => setDisplayedText(text.slice(0, displayedText.length + 1)), 40);
    } else if (!isDeleting && displayedText.length === text.length) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && displayedText.length > 0) {
      timer = setTimeout(() => setDisplayedText(text.slice(0, displayedText.length - 1)), 20);
    } else if (isDeleting && displayedText.length === 0) {
      timer = setTimeout(() => setIsDeleting(false), 300);
    }
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, text]);

  return (
    <div style={{
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      color: "#e8521a",
      fontWeight: "bold",
      fontSize: "15px",
      whiteSpace: "nowrap",
      pointerEvents: "none"
    }} className="nav-typing-text">
      {displayedText}
      <style>{`
        @media (max-width: 768px) {
           .nav-typing-text {
              font-size: 11px !important;
              top: 50px; 
           }
        }
      `}</style>
    </div>
  );
}

// المكون الرئيسي للمنيو
function CustomerMenu({ cart, setCart }) {
  const { t } = useTranslation();
  const [menu, setMenu] = useState([]); // بيبدأ بمصفوفة فاضية
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState(null);

  const { tableNumber } = useTable();

  // جلب البيانات (Firebase مع Fallback للـ JSON)
useEffect(() => {
  const loadData = async () => {
    const data = await fetchMenuData();
    if (data && Array.isArray(data)) {
      // تعديل كل الأصناف مرة واحدة لإضافة مسار الصورة
      const dataWithImages = data.map(item => ({
        ...item,
       image: item.image || `/images/${item.id}.webp` 
      }));
      setMenu(dataWithImages);
    }
  };
  loadData();
}, []);

  // وظائف السلة
  function addToCart(item) {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((item) => item.id !== id));

  const decreaseQty = (id) =>
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: item.qty > 1 ? item.qty - 1 : 1 }
          : item
      )
    );

  // استخراج التصنيفات
  const categories = [
    "ALL",
    ...new Set(menu.map((item) => item.category).filter(Boolean)),
  ];

  // منطق البحث والفلترة
  const filtered = menu.filter((item) => {
    const q = search.trim().toLowerCase();

    const itemName =
      typeof item.name === "string"
        ? item.name.toLowerCase()
        : `${item.name?.ar || ""} ${item.name?.en || ""}`.toLowerCase();

    const itemDescription =
      typeof item.description === "string"
        ? item.description.toLowerCase()
        : `${item.description?.ar || ""} ${item.description?.en || ""}`.toLowerCase();

    const itemCategory = (item.category || "").toLowerCase();

    const matchSearch =
      !q ||
      itemName.includes(q) ||
      itemDescription.includes(q) ||
      itemCategory.includes(q);

    const matchTab =
      activeTab === "ALL" || item.category === activeTab;

    const isAvailable = item.available !== false;

    return matchSearch && matchTab && isAvailable;
  });

  return (
    <>
      <nav className="navbar" style={{ position: "relative" }}>
        <div className="nav-container">
          <div className="logo">
            <img src={images.logo} alt="Shelter logo" loading="lazy" />
            <span>Shelter</span>
          </div>

          {tableNumber && (
            <Typewriter text={`Your Order Will Be Delivered On Table ${tableNumber}`} />
          )}

          <div className="nav-links">
            <a href="/" className="menu-btn">
              {t("nav.home")}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <section className="menu-hero">
        <img src={images.logo} alt="Shelter logo" className="hero-logo" loading="lazy" />
        <h1>{t("menu.title")}</h1>
        <p className="tagline">{t("menu.tagline")}</p>
        <p className="hero-text">{t("menu.heroText")}</p>
      </section>

      <div className="menu-controls">
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="text"
            className="search-input"
            placeholder={t("menu.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button className="search-clear" onClick={() => setSearch("")} type="button">✕</button>
          )}
        </div>

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${activeTab === cat ? "active" : ""}`}
              onClick={() => setActiveTab(cat)}
              type="button"
            >
              {cat === "ALL" ? "الكل" : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="customer-menu">
        <div className="menu-grid">
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <div key={item.id || index}>
                <MenuCard
                  item={item}
                  onClick={() => setSelectedItem(item)}
                  addToCart={() => setSelectedItem(item)}
                />
              </div>
            ))
          ) : (
            <div className="menu-empty-state">
              <div className="empty-icon">🍽️</div>
              <h3>{t("menu.noResults")}</h3>
              <p>{t("menu.noResultsSub")}</p>
            </div>
          )}
        </div>

        <Cart
          cart={cart}
          removeFromCart={removeFromCart}
          decreaseQty={decreaseQty}
          addToCart={addToCart}
        />
      </div>

      {selectedItem && (
        <ItemDrawer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          addToCart={addToCart}
        />
      )}

      <a
        href="https://api.whatsapp.com/send/?phone=201033030430"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        style={{
          position: "fixed",
          right: "20px",
          bottom: "20px",
          width: "58px",
          height: "58px",
          borderRadius: "50%",
          backgroundColor: "#25D366",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          boxShadow: "0 10px 25px rgba(0,0,0,0.22)",
          zIndex: 9999,
        }}
      >
        <FontAwesomeIcon icon={faWhatsapp} size="xl" />
      </a>
    </>
  );
}

export default CustomerMenu;