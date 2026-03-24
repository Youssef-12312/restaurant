import { signOut, setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "../../services/firebase.js";
import OrdersPage from "./OrdersPage.jsx";
import { useEffect } from "react";
import "../styles/admin.css";
import { onAuthStateChanged } from "firebase/auth";
import { images } from "../../assets/Images/images.js";
import { Link, useNavigate } from "react-router-dom";

setPersistence(auth, browserSessionPersistence);

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin");
  };

useEffect(() => {

  const unsub = onAuthStateChanged(auth, (user) => {
    if (!user) {
      navigate("/admin");
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

}, []);
  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="dash-sidebar__brand">
          <img
            src={images.logo}
            alt="Shelter logo"
            className="dash-sidebar__logo"
          />
          <span className="dash-sidebar__name">Shelter</span>
        </div>

        <nav className="dash-sidebar__nav">
          <Link className="dash-nav-item dash-nav-item--active" to="/admin">
            <span>📋</span> Orders
          </Link>

          <Link className="dash-nav-item" to="/admin/menu">
            <span>🍔</span> Menu Control
          </Link>
        </nav>
      
        <button className="dash-sidebar__logout" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </aside>

      <div className="dash-main">
        <header className="dash-header">
          <div>
            <h1 className="dash-header__title">Orders Dashboard</h1>
            <p className="dash-header__sub">
              Shelter Restaurant — Real-time Management
            </p>
          </div>

          <div className="dash-header__user">
            <span className="dash-header__avatar">👤</span>
            <span className="dash-header__email">Admin</span>
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
