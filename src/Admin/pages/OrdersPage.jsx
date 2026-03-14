import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import OrderCard from "../components/OrderCard.jsx";
import OrderModal from "../components/OrderModal.jsx";
import StatsCards from "../components/StatsCards.jsx";
import notificationSound from "../../../public/notification.mp3";

const FILTERS = ["all", "new", "preparing", "on the way", "completed", "cancelled"];

function OrdersPage() {

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  const prevIds = useRef(new Set());
  const audioRef = useRef(null);

  /* ───────── PRINT ORDER ───────── */

  const printOrder = (order) => {

    const printWindow = window.open("", "", "width=400,height=600");

    printWindow.document.write(`
      <html>
      <head>
        <title>Order #${order.orderNumber}</title>
        <style>
          body{font-family: Arial;padding:20px;}
          h2{text-align:center;}
          .item{display:flex;justify-content:space-between;margin:6px 0;}
          hr{margin:10px 0;}
        </style>
      </head>

      <body>

        <h2>Shelter</h2>

        <p>Order #${String(order.orderNumber).padStart(4,"0")}</p>

        <p>Customer: ${order.customerName}</p>

        <p>Phone: ${order.phone}</p>

        <hr>

        ${order.items.map(item => `
          <div class="item">
            <span>${item.name} x${item.qty}</span>
            <span>${(item.price || 0) * item.qty} EGP</span>
          </div>
        `).join("")}

        <hr>

        <h3>Total: ${order.total} EGP</h3>

      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  /* ───────── REALTIME LISTENER ───────── */

  useEffect(() => {

    try {

      const q = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      );

      const unsub = onSnapshot(q, (snap) => {

        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));

        const newOnes = docs.filter((d) => !prevIds.current.has(d.id));

        if (newOnes.length > 0 && prevIds.current.size > 0) {

          audioRef.current?.play().catch(() => {});

          setToast(`🔔 New order #${newOnes[0].orderNumber} arrived!`);

          setTimeout(() => setToast(null), 4000);
        }

        prevIds.current = new Set(docs.map((d) => d.id));

        setOrders(docs);

      }, (error) => {

        console.error("Firestore listener error:", error);

      });

      return () => unsub();

    } catch (err) {

      console.error("Query error:", err);

    }

  }, []);

  /* ───────── HIDE OLD COMPLETED ORDERS ───────── */

  const today = new Date();
  today.setHours(0,0,0,0);

  const visibleOrders = orders.filter((order) => {

    if (!order.createdAt) return true;

    const orderDate = order.createdAt.toDate
      ? order.createdAt.toDate()
      : new Date(order.createdAt);

    if (order.status === "completed" && orderDate < today) {
      return false;
    }

    return true;

  });

  /* ───────── FILTER + SEARCH ───────── */

  const filtered = visibleOrders.filter((order) => {

    const matchFilter =
      filter === "all" || order.status === filter;

    const cleanSearch = search.replace("#","");

    const matchSearch =
      search === "" ||
      String(order.orderNumber || "").includes(cleanSearch);

    return matchFilter && matchSearch;

  });

  return (

    <div className="op-page">

      <audio ref={audioRef} src={notificationSound} preload="auto" />

      {toast && <div className="op-toast">{toast}</div>}

      <StatsCards orders={orders} />


      {/* Search */}

      <div className="op-search">

        <input
          type="text"
          className="search-input"
          id="admin-search"
          placeholder="Search by order number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* Filters */}

      <div className="op-filters">

        {FILTERS.map((f) => (

          <button
            key={f}
            className={`op-filter-btn${filter === f ? " op-filter-btn--active" : ""}`}
            onClick={() => setFilter(f)}
          >

            {f === "all"
              ? "All"
              : f.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}

            {f === "all"
              ? ` (${orders.length})`
              : ` (${orders.filter((o)=>o.status===f).length})`}

          </button>

        ))}

      </div>

      {/* Orders */}

      {filtered.length === 0 ? (

        <div className="op-empty">

          <span>🍽️</span>

          <p>No orders found</p>

        </div>

      ) : (

        <div className="op-grid">

          {filtered.map((order) => (

            <div key={order.id}>

              <OrderCard
                order={order}
                onOpen={setSelected}
              />

              <button
                onClick={() => printOrder(order)}
                style={{
                  marginTop: "6px",
                  padding: "6px 10px",
                  background: "#e8521a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >

                🧾 Print Order

              </button>

            </div>

          ))}

        </div>

      )}

      <OrderModal
        order={selectedOrder}
        onClose={() => setSelected(null)}
      />

    </div>

  );
}

export default OrdersPage;