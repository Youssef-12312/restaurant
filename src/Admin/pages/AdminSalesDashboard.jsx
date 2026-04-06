  import { useEffect, useState, useRef } from "react";
  import { db, auth } from "../../services/firebase";
  import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
    Timestamp,
  } from "firebase/firestore";
  import {
    onAuthStateChanged,
    signOut,
    setPersistence,
    browserSessionPersistence,
  } from "firebase/auth";
  import { useNavigate } from "react-router-dom";
  import "../styles/sales.css";
  import {
    createEmptyBranchStats,
    extractBranchStats,
    buildBranchStatsFromOrders,
    mergeBranchStats,
  } from "../../services/branchSales";
  setPersistence(auth, browserSessionPersistence);

  /* ── Arabic month labels ── */
  const AR = {
    "01":"يناير","02":"فبراير","03":"مارس","04":"أبريل",
    "05":"مايو",  "06":"يونيو", "07":"يوليو","08":"أغسطس",
    "09":"سبتمبر","10":"أكتوبر","11":"نوفمبر","12":"ديسمبر",
  };
  const fmtMonth = (m) => {
    if (!m) return "";
    const [yr, mo] = m.split("-");
    return `${AR[mo] || mo} ${yr}`;
  };

  const getMonthBounds = (monthId) => {
    const [year, monthIndex] = monthId.split("-").map(Number);
    return {
      start: Timestamp.fromDate(new Date(year, monthIndex - 1, 1)),
      end: Timestamp.fromDate(new Date(year, monthIndex, 1)),
    };
  };

  const buildMonthTotalsFromOrders = (orders) =>
    orders.reduce(
      (totals, order) => ({
        totalRevenue: totals.totalRevenue + Number(order?.total || 0),
        totalOrders: totals.totalOrders + 1,
      }),
      { totalRevenue: 0, totalOrders: 0 }
    );

  /* ── Animated counter ── */
  function useCountUp(target, duration = 950) {
    const [val, setVal] = useState(0);
    const rafRef = useRef(null);
    useEffect(() => {
      cancelAnimationFrame(rafRef.current);
      const start = performance.now();
      const tick  = (now) => {
        const t    = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(target * ease));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration]);
    return val;
  }

  /* ── Revenue Donut ── */
  function RevenueDonut({ revenue, orders, loading }) {
    const R  = 86;
    const CX = 110;
    const CY = 110;
    const C  = 2 * Math.PI * R;
    const [go, setGo] = useState(false);

    useEffect(() => {
      const t = setTimeout(() => setGo(true), 60);
      return () => clearTimeout(t);
    }, [revenue]);

    const fill      = loading ? 0 : 0.78;
    const offset    = C * (1 - fill);
    const endAngle  = -Math.PI / 2 + fill * 2 * Math.PI;
    const dotX      = CX + R * Math.cos(endAngle);
    const dotY      = CY + R * Math.sin(endAngle);
    const dispRev   = useCountUp(loading ? 0 : revenue, 1000);
    const dispOrd   = useCountUp(loading ? 0 : orders,   850);

    return (
      <div className="sd-circle-wrap">
        <svg className="sd-circle-svg" viewBox="0 0 220 220" width="220" height="220">
          <defs>
            <linearGradient id="sdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#e8521a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="sdGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <circle cx={CX} cy={CY} r="104"
            fill="none" stroke="var(--border)"
            strokeWidth="1" strokeDasharray="3 9" />

          <circle cx={CX} cy={CY} r={R}
            fill="none" stroke="#f0ede8" strokeWidth="20" />

          <circle cx={CX} cy={CY} r={R}
            fill="none"
            stroke="url(#sdGrad)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={go ? offset : C}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{
              transition: "stroke-dashoffset 1.15s cubic-bezier(0.34,1.4,0.64,1)",
              filter: "url(#sdGlow)",
            }}
          />

          {go && !loading && (
            <circle cx={dotX} cy={dotY} r="7"
              fill="#e8521a" style={{ filter: "url(#sdGlow)" }} />
          )}

          {loading ? (
            <>
              <rect x="68" y="94"  width="84" height="11" rx="5" fill="#f0ede8" className="sd-shimmer-rect" />
              <rect x="80" y="113" width="60" height="18" rx="5" fill="#f0ede8" className="sd-shimmer-rect" />
              <rect x="88" y="139" width="44" height="10" rx="5" fill="#f0ede8" className="sd-shimmer-rect" />
            </>
          ) : (
            <>
              <text x={CX} y="97"  textAnchor="middle" fontSize="10.5"
                fill="var(--muted)" fontWeight="700" fontFamily="Arial" letterSpacing="0.4">
                إجمالي الإيرادات
              </text>
              <text x={CX} y="124" textAnchor="middle" fontSize="26"
                fill="var(--text)" fontWeight="800" fontFamily="Arial">
                {dispRev.toLocaleString("en")}
              </text>
              <text x={CX} y="142" textAnchor="middle" fontSize="12"
                fill="var(--primary)" fontWeight="700" fontFamily="Arial">
                EGP
              </text>
            </>
          )}
        </svg>

        <div className="sd-orders-badge">
          {loading ? (
            <span className="sd-shimmer-pill" style={{ width: 120, height: 38 }} />
          ) : (
            <>
              <span className="sd-orders-badge__val">{dispOrd.toLocaleString("en")}</span>
              <span className="sd-orders-badge__lbl">طلب هذا الشهر</span>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── Branch Bar ── */
  function BranchBar({ label, revenue, orders, total, color, loading }) {
    const pct      = total > 0 ? Math.round((revenue / total) * 100) : 0;
    const [w, setW] = useState(0);

    useEffect(() => {
      const t = setTimeout(() => setW(loading ? 0 : pct), loading ? 0 : 80);
      return () => clearTimeout(t);
    }, [pct, loading]);

    const dispRev = useCountUp(loading ? 0 : revenue, 900);
    const dispOrd = useCountUp(loading ? 0 : orders,  800);

    return (
      <div className="sd-branch-card">
        <div className="sd-branch-card__top">
          <span className="sd-branch-card__label" style={{ color }}>
            {label}
          </span>
          <span className="sd-branch-card__pct" style={{ color }}>
            {loading ? "—" : `${pct}%`}
          </span>
        </div>

        {/* progress bar */}
        <div className="sd-branch-bar__track">
          <div
            className="sd-branch-bar__fill"
            style={{
              width: `${w}%`,
              background: color,
              transition: "width 1s cubic-bezier(0.34,1.2,0.64,1)",
            }}
          />
        </div>

        <div className="sd-branch-card__nums">
          <span>
            <strong>{loading ? "—" : dispRev.toLocaleString("en")}</strong> EGP
          </span>
          <span>
            <strong>{loading ? "—" : dispOrd.toLocaleString("en")}</strong> طلب
          </span>
        </div>
      </div>
    );
  }

  /* ══ Main ══ */
  function AdminSalesDashboard() {
    const navigate = useNavigate();

    const [data,        setData]        = useState({
      totalRevenue: 0,
      totalOrders: 0,
      branches: createEmptyBranchStats(),
    });
    const [months,      setMonths]      = useState([]);
    const [month,       setMonth]       = useState("");
    const [fetching,    setFetching]    = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    /* ── Auth guard ── */
    useEffect(() => {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (!user) navigate("/admin");
      });
      const handleClose = () => signOut(auth);
      window.addEventListener("beforeunload", handleClose);
      return () => {
        unsub();
        window.removeEventListener("beforeunload", handleClose);
      };
    }, [navigate]);

  /* ── Fetch months ── */
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "sales_summary"));
      const list = snap.docs.map((d) => d.id).sort();
      setMonths(list);
      if (list.length > 0) setMonth(list[list.length - 1]);
      setInitialLoad(false);
    })();
  }, []);

  /* ── Fetch month data ── */
    useEffect(() => {
      if (!month) return;
      (async () => {
        setFetching(true);
        try {
          const { start, end } = getMonthBounds(month);
          const [summarySnap, ordersSnap] = await Promise.all([
            getDoc(doc(db, "sales_summary", month)),
            getDocs(
              query(
                collection(db, "orders"),
                where("createdAt", ">=", start),
                where("createdAt", "<", end)
              )
            ),
          ]);

          const monthOrders = ordersSnap.docs
            .map((orderDoc) => orderDoc.data())
            .filter(
              (order) => order?.status === "completed" && order?.addedToSales !== false
            );
          const fallbackTotals = buildMonthTotalsFromOrders(monthOrders);
          const fallbackBranches = buildBranchStatsFromOrders(monthOrders);

          if (summarySnap.exists()) {
            const summaryData = summarySnap.data();

            setData({
              totalRevenue: Number(summaryData?.totalRevenue || fallbackTotals.totalRevenue),
              totalOrders: Number(summaryData?.totalOrders || fallbackTotals.totalOrders),
              branches: mergeBranchStats(
                extractBranchStats(summaryData),
                fallbackBranches
              ),
            });
            return;
          }

          setData({
            totalRevenue: fallbackTotals.totalRevenue,
            totalOrders: fallbackTotals.totalOrders,
            branches: fallbackBranches,
          });
        } finally {
          setFetching(false);
        }
      })();
    }, [month]);

    const avgOrder = data.totalOrders > 0
      ? Math.round(data.totalRevenue / data.totalOrders)
      : 0;

    return (
      <div className="sd-page">

        {/* Header */}
        <div className="sd-header">
          <h2 className="sd-heading">تقرير المبيعات</h2>
          <p className="sd-sub">{month ? fmtMonth(month) : "اختر شهراً"}</p>
        </div>

        {/* Month pills */}
        <div className="sd-months-row">
          {initialLoad
            ? Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="sd-shimmer-pill" />
              ))
            : months.length === 0
            ? <span className="sd-no-data">لا توجد بيانات حتى الآن</span>
            : months.map((m) => (
                <button
                  key={m}
                  className={`sd-month-btn${m === month ? " sd-month-btn--active" : ""}`}
                  onClick={() => setMonth(m)}
                >
                  {fmtMonth(m)}
                </button>
              ))}
        </div>

        {/* Top grid — donut + stat cards */}
        <div className="sd-grid">
          <div className="sd-donut-card">
            <div className="sd-donut-card__glow" aria-hidden="true" />
            <RevenueDonut
              revenue={data.totalRevenue}
              orders={data.totalOrders}
              loading={fetching}
            />
          </div>

          <div className="sd-stats-col">
            {[
              { icon:"📦", val: fetching ? null : data.totalOrders,  lbl:"إجمالي الطلبات",       accent:"#e8521a" },
              { icon:"💳", val: fetching ? null : avgOrder,          lbl:"متوسط قيمة الطلب (EGP)", accent:"#f59e0b" },
              { icon:"💰", val: fetching ? null : data.totalRevenue, lbl:"إجمالي الإيرادات (EGP)", accent:"#10b981" },
            ].map(({ icon, val, lbl, accent }, i) => (
              <div key={i} className="stats-card sd-stat-card"
                style={{ "--accent": accent, animationDelay: `${i * 0.07}s` }}>
                <span className="stats-card__icon">{icon}</span>
                <div>
                  <span className="stats-card__value">
                    {val === null ? "—" : val.toLocaleString("en")}
                  </span>
                  <span className="stats-card__label">{lbl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
            
        {/* Branch breakdown */}
        <div className="sd-branches-section">
          <h3 className="sd-branches-title">📍 مقارنة الفروع</h3>
          <div className="sd-branches-grid">
            <BranchBar
              label="فرع المشاية"
              revenue={data.branches.mashaya.revenue}
              orders={data.branches.mashaya.orders}
              total={data.totalRevenue}
              color="#0369a1"
              loading={fetching}
            />
            <BranchBar
              label="فرع حي الجامعة"
              revenue={data.branches.gamaa.revenue}
              orders={data.branches.gamaa.orders}
              total={data.totalRevenue}
              color="#854d0e"
              loading={fetching}
            />
          </div>
        </div>

      </div>
    );
  }

  export default AdminSalesDashboard;
