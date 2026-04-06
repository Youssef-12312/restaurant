import { useTranslation } from "react-i18next";

function StatsCards({ orders = [] }) {
  const { t } = useTranslation();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visibleOrders = orders.filter((order) => {
    if (!order.createdAt) return true;

    const orderDate = order.createdAt.toDate
      ? order.createdAt.toDate()
      : new Date(order.createdAt);

    if (order.status?.toLowerCase() === "completed" && orderDate < today) {
      return false;
    }

    return true;
  });

  const newOrders = visibleOrders.filter(
    (o) => o.status?.toLowerCase() === "new"
  ).length;

  const preparing = visibleOrders.filter(
    (o) => o.status?.toLowerCase() === "preparing"
  ).length;

  const completed = visibleOrders.filter(
    (o) => o.status?.toLowerCase() === "completed"
  ).length;

  const todaySales = visibleOrders
    .filter((o) => {
      if (!o.createdAt) return false;

      const d = o.createdAt.toDate
        ? o.createdAt.toDate()
        : new Date(o.createdAt);

      d.setHours(0, 0, 0, 0);

      return (
        d.getTime() === today.getTime() &&
        o.status?.toLowerCase() === "completed"
      );
    })
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const cards = [
    {
      key: "newOrders",
      label: t("admin.stats.newOrders"),
      value: newOrders,
      icon: "🔔",
      color: "#e8521a"
    },
    {
      key: "preparing",
      label: t("admin.stats.preparing"),
      value: preparing,
      icon: "👨‍🍳",
      color: "#f59e0b"
    },
    {
      key: "completed",
      label: t("admin.stats.completed"),
      value: completed,
      icon: "✅",
      color: "#10b981"
    },
    {
      key: "todaySales",
      label: t("admin.stats.todaySales"),
      value: `${todaySales.toFixed(2)} ${t("common.egp")}`,
      icon: "💰",
      color: "#6366f1"
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((c) => (
        <div
          className="stats-card"
          key={c.key}
          style={{ "--accent": c.color }}
        >
          <div className="stats-card__icon">{c.icon}</div>

          <div className="stats-card__info">
            <span className="stats-card__value">{c.value}</span>
            <span className="stats-card__label">{c.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;