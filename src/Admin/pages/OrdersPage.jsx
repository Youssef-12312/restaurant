import { useEffect, useState, useRef } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase.js";
import OrderCard from "../components/OrderCard.jsx";
import OrderModal from "../components/OrderModal.jsx";
import StatsCards from "../components/StatsCards.jsx";
import notificationSound from "../../../public/notification.mp3";

const FILTERS = ["all", "new", "preparing", "on_the_way", "completed", "cancelled"];

function getText(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value.ar || value.en || "";
}

function getPrice(item) {
  if (typeof item.price === "number") return item.price;

  if (item.prices && typeof item.prices === "object") {
    const vals = Object.values(item.prices).filter((v) => typeof v === "number");
    if (vals.length > 0) return vals[0];
  }

  return 0;
}

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  const prevIds = useRef(new Set());
  const audioRef = useRef(null);

  const printOrder = (order) => {
    const printWindow = window.open("", "", "width=400,height=600");

const subtotal = (order.items || []).reduce(
  (sum, item) => sum + getPrice(item) * (item.qty || 1),
  0
);

const vat = subtotal * 0.14;

const delivery = order.orderType === "delivery" ? 25 : 0;

const total = subtotal + vat + delivery;
    printWindow.document.write(`

      <html>
      <head>
        <title>Order #${order.orderNumber}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h1 { text-align: center;}
          .item { display: flex; justify-content: space-between; margin: 6px 0; }
          hr { margin: 10px 0; }
        </style>
      </head>
      <body>
      <img src="/Print.webp" style="display:block; margin:15px auto;width:100px;" />
        <h1>Shelter</h1>

        <p>Order #${String(order.orderNumber).padStart(4, "0")}</p>
        <p>Customer: ${order.customerName || "—"}</p>
        <p>Address: ${order.address || "—"}</p>
        <p>Phone: ${order.phone || "—"}</p>

        <hr>

        ${(order.items || [])
          .map(
            (item) => `
              <div class="item">
                <span>${getText(item.name)} x${item.qty || 1}</span>
                <span>${(getPrice(item) * (item.qty || 1)).toFixed(2)} EGP</span>
              </div>
            `
          )
          .join("")}

        <hr>

    <div class="item">
     <span>Subtotal</span>
   <span>${subtotal.toFixed(2)} EGP</span>
      </div>

<div class="item">
  <span>VAT 14%</span>
  <span>${vat.toFixed(2)} EGP</span>
</div>



<div class="item">
  <span>Delivery</span>
  <span>${delivery.toFixed(2)} EGP</span>
</div>

<hr>

<h3>Total: ${total.toFixed(2)} EGP</h3>

        <img src="/QrCode Shelter.webp" style="display:block;margin:15px auto;width:100px;" />
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const filtered = visibleOrders.filter((order) => {
    const matchFilter = filter === "all" || order.status === filter;
    const cleanSearch = search.replace("#", "");
    const matchSearch =
      search === "" || String(order.orderNumber || "").includes(cleanSearch);

    return matchFilter && matchSearch;
  });

  const clearCurrentList = async () => {
    if (filtered.length === 0) return;

    const confirmDelete = window.confirm(`Delete ${filtered.length} orders?`);
    if (!confirmDelete) return;

    try {
      for (const order of filtered) {
        await deleteDoc(doc(db, "orders", order.id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

      const unsub = onSnapshot(
        q,
        (snap) => {
          const docs = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));

          const newOnes = docs.filter((d) => !prevIds.current.has(d.id));

          if (newOnes.length > 0 && prevIds.current.size > 0) {
            audioRef.current?.play().catch(() => {});
            setToast(`🔔 New order #${newOnes[0].orderNumber} arrived!`);
            setTimeout(() => setToast(null), 4000);
          }

          prevIds.current = new Set(docs.map((d) => d.id));
          setOrders(docs);
        },
        (error) => {
          console.error("Firestore listener error:", error);
        }
      );

      return () => unsub();
    } catch (err) {
      console.error("Query error:", err);
    }
  }, []);

  return (
    <div className="op-page">
      <audio ref={audioRef} src={notificationSound} preload="auto" />

      {toast && <div className="op-toast">{toast}</div>}

      <StatsCards orders={visibleOrders} />

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

      <div className="op-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`op-filter-btn${filter === f ? " op-filter-btn--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all"
              ? "All"
              : f.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            {f === "all"
              ? ` (${visibleOrders.length})`
              : ` (${visibleOrders.filter((o) => o.status === f).length})`}
          </button>
        ))}

        <button className="op-clear-btn" onClick={clearCurrentList}>
          🗑 Clear List
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="op-empty">
          <span>🍽️</span>
          <p>No orders found</p>
        </div>
      ) : (
        <div className="op-grid">
          {filtered.map((order) => (
            <div key={order.id}>
              <OrderCard order={order} onOpen={setSelected} />

              <button
                onClick={() => printOrder(order)}
                style={{
                  marginTop: "6px",
                  padding: "6px 10px",
                  background: "#e8521a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                🧾 Print Order
              </button>
            </div>
          ))}
        </div>
      )}

      <OrderModal order={selectedOrder} onClose={() => setSelected(null)} />
    </div>
  );
}

export default OrdersPage;