import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase.js";
import OrdersPage from "./OrdersPage.jsx";
import { setPersistence, browserSessionPersistence } from "firebase/auth";
import { useEffect } from "react";
import "../styles/admin.css";
import { images } from "../../assets/Images/images.js";
import { Link } from "react-router-dom";

setPersistence(auth, browserSessionPersistence);
function AdminDashboard({ onLogout }) {
  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };
useEffect(() => {

  const handleClose = () => {
    signOut(auth);
  };

  window.addEventListener("beforeunload", handleClose);

  return () => {
    window.removeEventListener("beforeunload", handleClose);
  };

}, []);
  return (
    <div className="ad-layout">

      {/* ── Sidebar ── */}
      <aside className="ad-sidebar">

        <div className="ad-sidebar__brand">
          <img
            src={images.logo}
            alt="Shelter logo"
            className="ad-sidebar__logo"
          />
          <span className="ad-sidebar__name">Shelter</span>
        </div>

        <nav className="ad-sidebar__nav">
          <Link className="ad-nav-item ad-nav-item--active" to="/admin/orders">
            <span>📋</span> Orders
          </Link>

            <Link className="ad-nav-item" to="/admin/menu">
            <span>🍔</span> Menu Control
          </Link>

        </nav>

        <button className="ad-sidebar__logout" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>

      </aside>

      {/* ── Main ── */}
      <div className="ad-main">

        <header className="ad-header">
          <div>
            <h1 className="ad-header__title">Orders Dashboard</h1>
            <p className="ad-header__sub">Shelter Restaurant — Real-time Management</p>
          </div>
          <div className="ad-header__user">
            <span className="ad-header__avatar">👤</span>
            <span className="ad-header__email">Admin</span>
          </div>
        </header>

        <main className="ad-content">
          <OrdersPage />
        </main>

      </div>
    </div>
  );
}

export default AdminDashboard;