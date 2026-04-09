import { useEffect, useRef, useState } from "react";
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
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../styles/sales.css";
import {
  createEmptyBranchStats,
  extractBranchStats,
  buildBranchStatsFromOrders,
  mergeBranchStats,
} from "../../services/branchSales";

setPersistence(auth, browserSessionPersistence);

function formatMonth(monthId, locale) {
  if (!monthId) return "";
  const [year, month] = monthId.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function getText(value, lang = "en") {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value[lang] || value.ar || value.en || "";
}

function getMonthBounds(monthId) {
  const [year, monthIndex] = monthId.split("-").map(Number);
  return {
    start: Timestamp.fromDate(new Date(year, monthIndex - 1, 1)),
    end: Timestamp.fromDate(new Date(year, monthIndex, 1)),
  };
}

function getMonthIdFromOrder(order) {
  const createdAt = order?.createdAt?.toDate?.()
    ? order.createdAt.toDate()
    : order?.createdAt
      ? new Date(order.createdAt)
      : null;

  if (!createdAt || Number.isNaN(createdAt.getTime())) {
    return null;
  }

  return `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
}

function getDateIdFromOrder(order) {
  const createdAt = order?.createdAt?.toDate?.()
    ? order.createdAt.toDate()
    : order?.createdAt
      ? new Date(order.createdAt)
      : null;

  if (!createdAt || Number.isNaN(createdAt.getTime())) {
    return null;
  }

  return `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")}`;
}

function getMonthDayNumbers(monthId) {
  if (!monthId) {
    return [];
  }

  const [year, month] = monthId.split("-").map(Number);
  const count = new Date(year, month, 0).getDate();

  return Array.from({ length: count }, (_, index) => count - index);
}

function getDayMetrics(day) {
  const snapshot = day?.snapshot && typeof day.snapshot === "object" ? day.snapshot : null;
  const topItem = snapshot?.topItem?.name
    ? {
        name: snapshot.topItem.name,
        qty: Number(snapshot.topItem.qty || 0),
      }
    : null;

  return {
    revenue: Number(snapshot ? snapshot.revenue || 0 : day?.totalRevenue || 0),
    orders: Number(snapshot ? snapshot.orders || 0 : day?.totalOrders || 0),
    cancelledOrders: Number(snapshot?.cancelledOrders || 0),
    branches: snapshot?.branches ? extractBranchStats(snapshot.branches) : extractBranchStats(day),
    topItem,
    closedAt: day?.closedAt?.toDate?.() ?? null,
  };
}

function buildMonthTotalsFromDailySummaries(days = []) {
  return days.reduce(
    (totals, day) => {
      const metrics = getDayMetrics(day);
      return {
        totalRevenue: totals.totalRevenue + metrics.revenue,
        totalOrders: totals.totalOrders + metrics.orders,
      };
    },
    { totalRevenue: 0, totalOrders: 0 }
  );
}

function buildMonthTotalsFromOrders(orders = []) {
  return orders.reduce(
    (totals, order) => ({
      totalRevenue: totals.totalRevenue + Number(order?.total || 0),
      totalOrders: totals.totalOrders + 1,
    }),
    { totalRevenue: 0, totalOrders: 0 }
  );
}

function buildBranchStatsFromDailySummaries(days = []) {
  const stats = createEmptyBranchStats();

  for (const day of days) {
    const dayBranches = getDayMetrics(day).branches;

    for (const branchKey of Object.keys(stats)) {
      stats[branchKey].revenue += Number(dayBranches?.[branchKey]?.revenue || 0);
      stats[branchKey].orders += Number(dayBranches?.[branchKey]?.orders || 0);
    }
  }

  return stats;
}

function getMostSoldItemFromOrders(orders = []) {
  const counter = new Map();

  for (const order of orders) {
    for (const item of order.items || []) {
      const rawName = item?.name;
      const key =
        typeof rawName === "object"
          ? JSON.stringify(rawName)
          : String(rawName || "");

      if (!key) {
        continue;
      }

      const existing = counter.get(key) || { name: rawName, qty: 0 };
      existing.qty += Number(item?.qty || 1);
      counter.set(key, existing);
    }
  }

  let topName = null;
  let topQty = 0;

  for (const entry of counter.values()) {
    if (entry.qty > topQty) {
      topName = entry.name;
      topQty = entry.qty;
    }
  }

  return topName ? { name: topName, qty: topQty } : null;
}

function buildDailySummariesFromOrders(orders = []) {
  const grouped = new Map();

  for (const order of orders) {
    const dateId = getDateIdFromOrder(order);

    if (!dateId) {
      continue;
    }

    if (!grouped.has(dateId)) {
      grouped.set(dateId, []);
    }

    grouped.get(dateId).push(order);
  }

  return Array.from(grouped.entries())
    .map(([dateId, dayOrders]) => {
      const completedOrders = dayOrders.filter((order) => order?.status === "completed");
      const cancelledOrders = dayOrders.filter((order) => order?.status === "cancelled");
      const monthId = dateId.slice(0, 7);
      const dayNumber = Number(dateId.slice(-2));

      return {
        dateId,
        monthId,
        dayNumber,
        snapshot: {
          revenue: buildMonthTotalsFromOrders(completedOrders).totalRevenue,
          orders: completedOrders.length,
          cancelledOrders: cancelledOrders.length,
          branches: buildBranchStatsFromOrders(completedOrders),
          topItem: getMostSoldItemFromOrders(completedOrders),
        },
      };
    })
    .sort((a, b) => Number(b?.dayNumber || 0) - Number(a?.dayNumber || 0));
}

function isPermissionDenied(error) {
  return error?.code === "permission-denied" || error?.message?.includes("Missing or insufficient permissions");
}

function useCountUp(target, duration = 950) {
  const [val, setVal] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return val;
}

function RevenueDonut({ revenue, orders, loading }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("ar") ? "ar-EG" : "en-US";
  const radius = 86;
  const centerX = 110;
  const centerY = 110;
  const circumference = 2 * Math.PI * radius;
  const [go, setGo] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setGo(true), 60);
    return () => clearTimeout(timeout);
  }, [revenue]);

  const fill = loading ? 0 : 0.78;
  const offset = circumference * (1 - fill);
  const endAngle = -Math.PI / 2 + fill * 2 * Math.PI;
  const dotX = centerX + radius * Math.cos(endAngle);
  const dotY = centerY + radius * Math.sin(endAngle);
  const dispRevenue = useCountUp(loading ? 0 : revenue, 1000);
  const dispOrders = useCountUp(loading ? 0 : orders, 850);

  return (
    <div className="sd-circle-wrap">
      <svg className="sd-circle-svg" viewBox="0 0 220 220" width="220" height="220">
        <defs>
          <linearGradient id="sdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8521a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <filter id="sdGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={centerX}
          cy={centerY}
          r="104"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="3 9"
        />

        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#f0ede8"
          strokeWidth="20"
        />

        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="url(#sdGrad)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={go ? offset : circumference}
          transform={`rotate(-90 ${centerX} ${centerY})`}
          style={{
            transition: "stroke-dashoffset 1.15s cubic-bezier(0.34,1.4,0.64,1)",
            filter: "url(#sdGlow)",
          }}
        />

        {go && !loading && (
          <circle cx={dotX} cy={dotY} r="7" fill="#e8521a" style={{ filter: "url(#sdGlow)" }} />
        )}

        {loading ? (
          <>
            <rect x="68" y="94" width="84" height="11" rx="5" fill="#f0ede8" className="sd-shimmer-rect" />
            <rect x="80" y="113" width="60" height="18" rx="5" fill="#f0ede8" className="sd-shimmer-rect" />
            <rect x="88" y="139" width="44" height="10" rx="5" fill="#f0ede8" className="sd-shimmer-rect" />
          </>
        ) : (
          <>
            <text
              x={centerX}
              y="97"
              textAnchor="middle"
              fontSize="10.5"
              fill="var(--muted)"
              fontWeight="700"
              fontFamily="Arial"
              letterSpacing="0.4"
            >
              {t("adminSales.revenueTotal")}
            </text>
            <text
              x={centerX}
              y="124"
              textAnchor="middle"
              fontSize="26"
              fill="var(--text)"
              fontWeight="800"
              fontFamily="Arial"
            >
              {dispRevenue.toLocaleString(locale)}
            </text>
            <text
              x={centerX}
              y="142"
              textAnchor="middle"
              fontSize="12"
              fill="var(--primary)"
              fontWeight="700"
              fontFamily="Arial"
            >
              {t("common.egp")}
            </text>
          </>
        )}
      </svg>

      <div className="sd-orders-badge">
        {loading ? (
          <span className="sd-shimmer-pill" style={{ width: 120, height: 38 }} />
        ) : (
          <>
            <span className="sd-orders-badge__val">{dispOrders.toLocaleString(locale)}</span>
            <span className="sd-orders-badge__lbl">{t("adminSales.ordersThisMonth")}</span>
          </>
        )}
      </div>
    </div>
  );
}

function BranchBar({ label, revenue, orders, total, color, loading }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("ar") ? "ar-EG" : "en-US";
  const pct = total > 0 ? Math.round((revenue / total) * 100) : 0;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setWidth(loading ? 0 : pct), loading ? 0 : 80);
    return () => clearTimeout(timeout);
  }, [pct, loading]);

  const dispRevenue = useCountUp(loading ? 0 : revenue, 900);
  const dispOrders = useCountUp(loading ? 0 : orders, 800);

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

      <div className="sd-branch-bar__track">
        <div
          className="sd-branch-bar__fill"
          style={{
            width: `${width}%`,
            background: color,
            transition: "width 1s cubic-bezier(0.34,1.2,0.64,1)",
          }}
        />
      </div>

      <div className="sd-branch-card__nums">
        <span>
          <strong>{loading ? "—" : dispRevenue.toLocaleString(locale)}</strong> {t("common.egp")}
        </span>
        <span>
          <strong>{loading ? "—" : dispOrders.toLocaleString(locale)}</strong>{" "}
          {t("adminSales.ordersUnit")}
        </span>
      </div>
    </div>
  );
}

function DailySummaryAside({ month, dailySummaries, loading }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  const days = getMonthDayNumbers(month);
  const summaryByDay = new Map(
    dailySummaries.map((day) => [Number(day?.dayNumber || 0), day])
  );

  return (
    <aside className="sd-daily-aside">
      <div className="sd-daily-aside__head">
        <div>
          <h3 className="sd-daily-aside__title">{t("adminSales.savedDays")}</h3>
          <p className="sd-daily-aside__sub">
            {month ? formatMonth(month, locale) : t("adminSales.daysSubtitleEmpty")}
          </p>
        </div>
      </div>

      <div className="sd-daily-list">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="sd-day-card sd-day-card--loading">
              <span className="sd-shimmer-pill" style={{ width: 66, height: 18 }} />
              <span className="sd-shimmer-pill" style={{ width: 120, height: 18 }} />
              <span className="sd-shimmer-pill" style={{ width: 150, height: 14 }} />
            </div>
          ))
        ) : days.length === 0 ? (
          <div className="sd-day-card sd-day-card--empty">
            <span className="sd-day-card__empty">{t("adminSales.noDaysForMonth")}</span>
          </div>
        ) : (
          days.map((dayNumber) => {
            const day = summaryByDay.get(dayNumber);

            if (!day) {
              return (
                <div key={dayNumber} className="sd-day-card sd-day-card--empty">
                  <div className="sd-day-card__top">
                    <span className="sd-day-card__day">
                      {t("adminSales.day", { day: String(dayNumber).padStart(2, "0") })}
                    </span>
                    <span className="sd-day-card__status">{t("adminSales.unsaved")}</span>
                  </div>
                  <span className="sd-day-card__empty">{t("adminSales.noDayDetails")}</span>
                </div>
              );
            }

            const metrics = getDayMetrics(day);
            const branchStats = metrics.branches;

            return (
              <article key={dayNumber} className="sd-day-card">
                <div className="sd-day-card__top">
                  <span className="sd-day-card__day">
                    {t("adminSales.day", { day: String(dayNumber).padStart(2, "0") })}
                  </span>
                  <span className={`sd-day-card__status${metrics.closedAt ? " sd-day-card__status--closed" : ""}`}>
                    {metrics.closedAt ? t("adminSales.saved") : t("adminSales.live")}
                  </span>
                </div>

                <div className="sd-day-card__revenue">
                  <strong>{metrics.revenue.toLocaleString(locale)}</strong>
                  <span>{t("common.egp")}</span>
                </div>

                <div className="sd-day-card__meta">
                  <span>{t("adminSales.ordersCount", { count: metrics.orders.toLocaleString(locale) })}</span>
                  <span>{t("adminSales.cancelledCount", { count: metrics.cancelledOrders.toLocaleString(locale) })}</span>
                </div>

                <div className="sd-day-card__branches">
                  <span>
                    {t("adminSales.branchOrders", {
                      branch: t("admin.branches.mashaya"),
                      count: Number(branchStats.mashaya.orders || 0).toLocaleString(locale),
                    })}
                  </span>
                  <span>
                    {t("adminSales.branchOrders", {
                      branch: t("admin.branches.gamaa"),
                      count: Number(branchStats.gamaa.orders || 0).toLocaleString(locale),
                    })}
                  </span>
                </div>

                {metrics.topItem && (
                  <div className="sd-day-card__top-item">
                    {t("adminSales.topItem", {
                      name: getText(metrics.topItem.name, lang),
                      qty: metrics.topItem.qty.toLocaleString(locale),
                    })}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </aside>
  );
}

function AdminSalesDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.language?.startsWith("ar") ? "ar-EG" : "en-US";

  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    branches: createEmptyBranchStats(),
  });
  const [months, setMonths] = useState([]);
  const [month, setMonth] = useState("");
  const [dailySummaries, setDailySummaries] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [dataSource, setDataSource] = useState("summary");

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

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "sales_summary"));
        const list = snap.docs
          .map((summaryDoc) => summaryDoc.id)
          .filter((id) => /^\d{4}-\d{2}$/.test(id))
          .sort();

        setMonths(list);
        if (list.length > 0) {
          setMonth(list[list.length - 1]);
        }
        setDataSource("summary");
      } catch (error) {
        if (!isPermissionDenied(error)) {
          throw error;
        }

        const ordersSnap = await getDocs(
          query(collection(db, "orders"), where("status", "==", "completed"))
        );
        const list = Array.from(
          new Set(
            ordersSnap.docs
              .map((orderDoc) => getMonthIdFromOrder(orderDoc.data()))
              .filter(Boolean)
          )
        ).sort();

        setMonths(list);
        if (list.length > 0) {
          setMonth(list[list.length - 1]);
        }
        setDataSource("orders");
      } finally {
        setInitialLoad(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!month) {
      setData({
        totalRevenue: 0,
        totalOrders: 0,
        branches: createEmptyBranchStats(),
      })
      setDailySummaries([]);
      return;
    }

    (async () => {
      setFetching(true);

      try {
        if (dataSource === "summary") {
          const [summarySnap, daySnap] = await Promise.all([
            getDoc(doc(db, "sales_summary", month)),
            getDocs(collection(db, "sales_summary", month, "days")),
          ]);

          const days = daySnap.docs
            .map((dayDoc) => dayDoc.data())
            .sort((a, b) => Number(b?.dayNumber || 0) - Number(a?.dayNumber || 0));

          const fallbackTotals = buildMonthTotalsFromDailySummaries(days);
          const fallbackBranches = buildBranchStatsFromDailySummaries(days);
          const summaryData = summarySnap.exists() ? summarySnap.data() : null;

          setDailySummaries(days);
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

        const { start, end } = getMonthBounds(month);
        const ordersSnap = await getDocs(
          query(
            collection(db, "orders"),
            where("createdAt", ">=", start),
            where("createdAt", "<", end)
          )
        );

        const monthOrders = ordersSnap.docs.map((orderDoc) => orderDoc.data());
        const completedOrders = monthOrders.filter((order) => order?.status === "completed");
        const daySummaries = buildDailySummariesFromOrders(monthOrders);

        setDailySummaries(daySummaries);
        setData({
          totalRevenue: buildMonthTotalsFromOrders(completedOrders).totalRevenue,
          totalOrders: completedOrders.length,
          branches: buildBranchStatsFromOrders(completedOrders),
        });
      } catch (error) {
        if (dataSource === "summary" && isPermissionDenied(error)) {
          setDataSource("orders");
          return;
        }

        throw error;
      } finally {
        setFetching(false);
      }
    })();
  }, [month, dataSource]);

  const avgOrder = data.totalOrders > 0
    ? Math.round(data.totalRevenue / data.totalOrders)
    : 0;

  return (
    <div className="sd-page">
      <div className="sd-header">
        <h2 className="sd-heading">{t("adminSales.heading")}</h2>
        <p className="sd-sub">{month ? formatMonth(month, locale) : t("adminSales.selectMonth")}</p>
      </div>

      <div className="sd-months-row">
        {initialLoad ? (
          Array.from({ length: 5 }).map((_, index) => (
            <span key={index} className="sd-shimmer-pill" />
          ))
        ) : months.length === 0 ? (
          <span className="sd-no-data">{t("adminSales.noData")}</span>
        ) : (
          months.map((monthId) => (
            <button
              key={monthId}
              className={`sd-month-btn${monthId === month ? " sd-month-btn--active" : ""}`}
              onClick={() => setMonth(monthId)}
            >
              {formatMonth(monthId, locale)}
            </button>
          ))
        )}
      </div>

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
            { icon: "📦", val: fetching ? null : data.totalOrders, lbl: t("adminSales.totalOrders"), accent: "#e8521a" },
            { icon: "💳", val: fetching ? null : avgOrder, lbl: t("adminSales.avgOrderValue"), accent: "#f59e0b" },
            { icon: "💰", val: fetching ? null : data.totalRevenue, lbl: t("adminSales.totalRevenue"), accent: "#10b981" },
          ].map(({ icon, val, lbl, accent }, index) => (
            <div
              key={index}
              className="stats-card sd-stat-card"
              style={{ "--accent": accent, animationDelay: `${index * 0.07}s` }}
            >
              <span className="stats-card__icon">{icon}</span>
              <div>
                <span className="stats-card__value">
                  {val === null ? "—" : val.toLocaleString(locale)}
                </span>
                <span className="stats-card__label">{lbl}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sd-bottom-grid">
        <div className="sd-branches-section">
          <h3 className="sd-branches-title">📍 {t("adminSales.branchesComparison")}</h3>
          <div className="sd-branches-grid">
            <BranchBar
              label={t("admin.branches.mashayaBranch")}
              revenue={data.branches.mashaya.revenue}
              orders={data.branches.mashaya.orders}
              total={data.totalRevenue}
              color="#0369a1"
              loading={fetching}
            />
            <BranchBar
              label={t("admin.branches.gamaaBranch")}
              revenue={data.branches.gamaa.revenue}
              orders={data.branches.gamaa.orders}
              total={data.totalRevenue}
              color="#854d0e"
              loading={fetching}
            />
          </div>
        </div>

        <DailySummaryAside
          month={month}
          dailySummaries={dailySummaries}
          loading={fetching}
        />
      </div>
    </div>
  );
}

export default AdminSalesDashboard;
