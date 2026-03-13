import { useEffect, useState } from "react";
import { db, auth } from "../../services/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { images } from "../../assets/Images/images.js";
import "../styles/MenuControl.css";
import { signOut } from "firebase/auth";

function MenuControl() {
  const [search, setSearch] = useState("");

  const [menu, setMenu] = useState([]);
  const navigate = useNavigate();

  /* ── Logout ── */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin");
  };
    const filteredMenu = menu.filter((item) => {
  const q = search.toLowerCase();
  return search === "" || item.name?.toLowerCase().includes(q);
});
  /* ── Fetch Menu ── */
  useEffect(() => {

    const ref = collection(db, "menu");

    const unsub = onSnapshot(ref, (snap) => {

      setMenu(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
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

    const ref = doc(db, "menu", item.id);

    await updateDoc(ref, {
      available: item.available === false
    });

  };

  return (

    <div className="mc-page">

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

          <Link className="ad-nav-item" to="/admin">
            <span>📋</span> Orders
          </Link>

          <Link className="ad-nav-item ad-nav-item--active" to="/admin/menu">
            <span>🍔</span> Menu Control
          </Link>

        </nav>

        <button className="ad-sidebar__logout" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>

      </aside>

      <div className="ad-content">

        <div className="mc-header">
          <h1 className="mc-title">Menu Control</h1>
        </div>
              <div className="op-search">

        <input
          type="text"
          className="search-input"
          id="admin-search"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
      </div>
        <div className="mc-grid">

          {filteredMenu.map((item) => (

            <div className="mc-card" key={item.id}>

              <span className="mc-name">{item.name}</span>

              <span
                className={
                  item.available !== false
                    ? "mc-status mc-status--available"
                    : "mc-status mc-status--out"
                }
              >
                {item.available !== false ? "🟢 Available" : "🔴 Out of Stock"}
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
                  {item.available !== false ? "Out of Stock" : "Make Available"}
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

export default MenuControl;