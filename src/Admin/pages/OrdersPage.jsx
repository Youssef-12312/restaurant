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
import { getCartItemVariantSuffix } from "../../utils/cartItem.js";
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

function getPrintableItemName(item) {
  const itemName = getText(item.name);
  const variantSuffix = getCartItemVariantSuffix(item, "ar");

  return variantSuffix ? `${itemName} (${variantSuffix})` : itemName;
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
          @page { margin: 0; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 20px; 
            max-width: 80mm; /* عرض مناسب لطابعات الكاشير */
            margin: 0 auto;
            color: #000;
          }
          
          /* تصميم الهيدر (الصور في الزوايا) */
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .logo, .qr { width: 55px; height: auto; }
          .header-info { text-align: center; flex-grow: 1; padding: 0 10px; }
          .header-info h1 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
          .header-info p { margin: 5px 0 0; font-weight: bold; font-size: 16px; }
          
          /* بيانات العميل */
          .customer-info {
            margin-bottom: 20px;
            font-size: 14px;
            line-height: 1.6;
          }
          .customer-info p { margin: 3px 0; }
          
          /* تصميم جدول الأصناف */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 14px;
          }
          th {
            text-align: left;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            font-weight: bold;
          }
          td {
            padding: 8px 0;
            border-bottom: 1px dotted #888;
          }
          .col-qty { text-align: center; width: 40px; }
          .col-price { text-align: right; width: 70px; }
          
          /* الحسابات النهائية */
          .totals-container {
            margin-top: 15px;
            font-size: 14px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
          }
          .grand-total {
            font-size: 18px;
            font-weight: bold;
            border-top: 2px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          
          /* الفوتر */
          .footer {
            text-align: center;
            margin-top: 25px;
            font-size: 12px;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <img src="/Print.webp" class="logo" alt="Logo" />
          <div class="header-info">
            <h1>Shelter</h1>
            <p>Order #${String(order.orderNumber).padStart(4, "0")}</p>
          </div>
          <img src="/QrCode Shelter.webp" class="qr" alt="QR" />
        </div>

        <div class="customer-info">
          <p><strong>Customer:</strong> ${order.customerName || "—"}</p>
          <p><strong>Phone:</strong> ${order.phone || "—"}</p>
          <p><strong>Address:</strong> ${order.address || "—"}</p>
          ${order.orderType ? `<p><strong>Type:</strong> ${order.orderType.toUpperCase()}</p>` : ''}
          </div>

        <table>
          <thead>
            <tr>
              <th>Item (الصنف)</th>
              <th class="col-qty">Qty</th>
              <th class="col-price">Price</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map((item) => `
              <tr>
                <td>${getPrintableItemName(item)}</td>
                <td class="col-qty">x${item.qty || 1}</td>
                <td class="col-price">${(getPrice(item) * (item.qty || 1)).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="totals-container">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)} EGP</span>
          </div>
          <div class="total-row">
            <span>VAT (14%)</span>
            <span>${vat.toFixed(2)} EGP</span>
          </div>
          <div class="total-row">
            <span>Delivery</span>
            <span>${delivery.toFixed(2)} EGP</span>
          </div>
          <div class="total-row grand-total">
            <span>TOTAL</span>
            <span>${total.toFixed(2)} EGP</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for choosing Shelter!</p>
        </div>

      </body>
      </html>
    `);

    printWindow.document.close();
    
    // الانتظار ثانية واحدة علشان الصور تلحق تحمل قبل ما شاشة الطباعة تظهر
    setTimeout(() => {
      printWindow.print();
    }, 500);
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
  <span>
    <img 
      src="/MainLogowebp.webp" 
      alt="" 
      loading="lazy"
      style={{ width: "80px", height: "auto", opacity: 0.8 }}
    />
  </span>
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
