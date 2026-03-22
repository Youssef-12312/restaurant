function StatsCards({ orders = [] }) {
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
    { label: "New Orders", value: newOrders, icon: "🔔", color: "#e8521a" },
    { label: "Preparing", value: preparing, icon: "👨‍🍳", color: "#f59e0b" },
    { label: "Completed", value: completed, icon: "✅", color: "#10b981" },
    {
      label: "Today Sales",
      value: `${todaySales} EGP`,
      icon: "💰",
      color: "#6366f1"
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((c) => (
        <div
          className="stats-card"
          key={c.label}
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