import { useEffect, useState } from "react";
import { db, auth } from "../../services/firebase.js";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { images } from "../../assets/Images/images.js";
import "../styles/MenuControl.css";
import { signOut } from "firebase/auth";

function MenuControl() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState([]);
  const navigate = useNavigate();
  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";

  /* ── Logout ── */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin");
  };

  /* ── Helper: handle ar/en text ── */
  const getText = (value) => {
    if (typeof value === "string") return value;
    if (!value || typeof value !== "object") return "";
    return value[lang] || value.ar || value.en || "";
  };

  /* ── Search Filter ── */
  const filteredMenu = menu.filter((item) => {
    const q = search.toLowerCase();
    const name = getText(item.name).toLowerCase();
    return search === "" || name.includes(q);
  });

  /* ── Fetch Menu ── */
  useEffect(() => {
    const ref = collection(db, "menu");

    const unsub = onSnapshot(ref, (snap) => {
      setMenu(
        snap.docs.map((doc) => ({
          docId: doc.id, // 🔥 ده الـ id الحقيقي
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  /* ── Logout when tab closes ── */
  useEffect(() => {
    const handleClose = () => {
      signOut(auth);
    };

    window.addEventListener("beforeunload", handleClose);

    return () => {
      window.removeEventListener("beforeunload", handleClose);
    };
  }, []);

  /* ── Toggle Stock ── */
  const toggleStock = async (item) => {
    const ref = doc(db, "menu", item.docId); // ✅ FIXED

    await updateDoc(ref, {
      available: item.available === false,
    });
  };

  return (
    <div className="mc-page">
      <aside className="dash-sidebar">
        <div className="dash-sidebar__brand">
          <img
            src={images.logo}
            alt={t("admin.brand.logoAlt")}
            className="dash-sidebar__logo"
          />
          <span className="dash-sidebar__name">Shelter</span>
        </div>

        <nav className="dash-sidebar__nav">
          <Link className="dash-nav-item" to="/admin">
            <span>📋</span> {t("admin.nav.orders")}
          </Link>

          <Link
            className="dash-nav-item dash-nav-item--active"
            to="/admin/menu"
          >
            <span>🍔</span> {t("admin.nav.menuControl")}
          </Link>
        </nav>

        <button className="dash-sidebar__logout" onClick={handleLogout}>
          <span>🚪</span> {t("admin.nav.logout")}
        </button>
      </aside>

      <div className="mc-content">
        <div className="mc-header">
          <h1 className="mc-title">{t("admin.menuControl.title")}</h1>
        </div>

        {/* 🔍 Search */}
        <div className="op-search">
          <input
            type="text"
            className="search-input"
            id="admin-search"
            placeholder={t("admin.menuControl.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 📦 Menu Grid */}
        <div className="mc-grid">
          {filteredMenu.length === 0 ? (
            <div className="mc-card">
              <span className="mc-name">{t("admin.menuControl.empty")}</span>
            </div>
          ) : (
            filteredMenu.map((item) => (
              <div className="mc-card" key={item.docId}>
                <span className="mc-name">{getText(item.name)}</span>

                <span
                  className={
                    item.available !== false
                      ? "mc-status mc-status--available"
                      : "mc-status mc-status--out"
                  }
                >
                  {item.available !== false
                    ? `🟢 ${t("admin.menuControl.available")}`
                    : `🔴 ${t("admin.menuControl.outOfStock")}`}
                </span>

                <div className="mc-actions">
                  <button
                    className={
                      item.available !== false
                        ? "mc-btn mc-btn--disable"
                        : "mc-btn mc-btn--enable"
                    }
                    onClick={() => toggleStock(item)}
                  >
                    {item.available !== false
                      ? t("admin.actions.markOutOfStock")
                      : t("admin.actions.makeAvailable")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MenuControl;
