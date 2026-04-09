import { signOut, setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "../../services/firebase.js";
import OrdersPage from "./OrdersPage.jsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/admin.css";
import { onAuthStateChanged } from "firebase/auth";
import { images } from "../../assets/Images/images.js";
import { Link, useNavigate } from "react-router-dom";
import LanguageSwitcher from "../../components/LanguageSwitcher.jsx";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase.js";

setPersistence(auth, browserSessionPersistence);

function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin");
  };

  const [adminName, setAdminName] = useState("");
  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/admin");
      } else {
        // 🔥 هات الاسم من Firestore
        const docRef = doc(db, "admins", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setAdminName(snap.data().name);
        }
      }
    });

    const handleClose = () => {
      signOut(auth);
    };

    window.addEventListener("beforeunload", handleClose);

    return () => {
      unsub();
      window.removeEventListener("beforeunload", handleClose);
    };
  }, [navigate]);

  return (
    <div className="dash-layout">
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
          <Link className="dash-nav-item dash-nav-item--active" to="/admin">
            <span>📋</span> {t("admin.nav.orders")}
          </Link>

          <Link className="dash-nav-item" to="/admin/menu">
            <span>🍔</span> {t("admin.nav.menuControl")}
          </Link>

        </nav>
              
        <button className="dash-sidebar__logout" onClick={handleLogout}>
          <span>🚪</span> {t("admin.nav.logout")}
        </button>
      </aside>

      <div className="dash-main">
        <header className="dash-header">
          <div>
            <h1 className="dash-header__title">{t("admin.dashboard.title")}</h1>
            <p className="dash-header__sub">{t("admin.dashboard.subtitle")}</p>
          </div>
          <LanguageSwitcher />
          <div className="dash-header__user">
            <span className="dash-header__avatar">👤</span>
            
            <span className="dash-header__email">
              {adminName || auth.currentUser?.email || t("admin.brand.fallbackUser")}
            </span>
          </div>
        </header>

        <main className="dash-content">
          <OrdersPage />
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
