import { useEffect, useState, useMemo } from "react";
import { db } from "../services/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import MenuCard from "../components/MenuCard.jsx";
import Cart from "../components/Cart.jsx";
import { images } from "../assets/Images/images.js";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";

function CustomerMenu({ cart, setCart }) {
  const { t } = useTranslation();
  const [menu, setMenu]           = useState([]);
  const [search, setSearch]       = useState("");
  const [activeTab, setActiveTab] = useState("All");

  /* ── Cart actions ── */
  function addToCart(item) {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists)
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        );
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

  /* ── Fetch from Firestore ── */
  useEffect(() => {
    const ref   = collection(db, "menu");
    const unsub = onSnapshot(ref, (snap) => {
      setMenu(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  /* ── Dynamic categories ── */
  const categories = useMemo(() => {
    const cats = [...new Set(menu.map((i) => i.category).filter(Boolean))];
    return [t("menu.all"), ...cats];
  }, [menu, t]);

  /* ── Filtered menu ── */
const filtered = useMemo(() => {
  const q = search.toLowerCase().trim();

  return menu.filter((item) => {

    const available = item.available !== false;

    const matchSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q);

    const matchTab =
      activeTab === t("menu.all") || item.category === activeTab;

    return available && matchSearch && matchTab;

  });

}, [menu, search, activeTab, t]);

  /* ── Render ── */
  return (
    <>
      {/* ══ NAVBAR ══ */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <img src={images.logo} alt="Shelter logo" loading="lazy" />
            <span>Shelter</span>
          </div>
          <div className="nav-links">
            <a href="/" className="menu-btn">{t("nav.home")}</a>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="menu-hero">
        <img src={images.logo} alt="Shelter logo" className="hero-logo" loading="lazy" />
        <h1>{t("menu.title")}</h1>
        <p className="tagline">{t("menu.tagline")}</p>
        <p className="hero-text">{t("menu.heroText")}</p>
      </section>

      {/* ══ SEARCH + FILTER ══ */}
      <div className="menu-controls">
        <div className="search-wrapper">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
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
              aria-label="Clear search"
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
              className={`category-tab${activeTab === cat ? " active" : ""}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ══ MENU GRID + CART ══ */}
      <div className="customer-menu">
        <div className="menu-grid">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div key={item.id}>
                <MenuCard item={item} addToCart={addToCart} />

                {item.available === false && (
                  <button disabled>
                    Out of Stock
                  </button>
                )}
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
    </>
  );
}

export default CustomerMenu;