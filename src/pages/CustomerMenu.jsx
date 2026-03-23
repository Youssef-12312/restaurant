import { useEffect, useState } from "react";
import { db } from "../services/firebase.js";
import { collection, onSnapshot } from "firebase/firestore";
import MenuCard from "../components/MenuCard.jsx";
import Cart from "../components/Cart.jsx";
import { images } from "../assets/Images/images.js";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import ItemDrawer from "../components/ItemDrawer.jsx";

function CustomerMenu({ cart, setCart }) {
  const { t } = useTranslation();
  const [menu, setMenu] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState(null);

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

  useEffect(() => {
    const ref = collection(db, "menu");

    const unsub = onSnapshot(ref, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        ...doc.data(),
        docId: doc.id,
      }));
      setMenu(data);
    });

    return () => unsub();
  }, []);

  const categories = [
    "ALL",
    ...new Set(menu.map((item) => item.category).filter(Boolean)),
  ];

  /* 🔥 FILTER (FIXED) */
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

    /* 🔥 أهم سطر */
    const isAvailable = item.available !== false;

    return matchSearch && matchTab && isAvailable;
  });

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <img src={images.logo} alt="Shelter logo" loading="lazy" />
            <span>Shelter</span>
          </div>

          <div className="nav-links">
            <a href="/" className="menu-btn">
              {t("nav.home")}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <section className="menu-hero">
        <img
          src={images.logo}
          alt="Shelter logo"
          className="hero-logo"
          loading="lazy"
        />
        <h1>{t("menu.title")}</h1>
        <p className="tagline">{t("menu.tagline")}</p>
        <p className="hero-text">{t("menu.heroText")}</p>
      </section>

      <div className="menu-controls">
        <div className="search-wrapper">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="text"
            className="search-input"
            placeholder={t("menu.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch("")}
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {search && (
          <p className="search-results-count">
            <span>{filtered.length}</span>{" "}
            {t("menu.dishFound", { count: filtered.length })}
          </p>
        )}

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${
                activeTab === cat ? "active" : ""
              }`}
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
              <div key={item.docId || item.id || index}>
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
    </>
  );
}

export default CustomerMenu;