function StatsCards({ orders }) {

  const today = new Date().toDateString();

  const newOrders = orders.filter(
    (o) => o.status?.toLowerCase() === "new"
  ).length;

  const preparing = orders.filter(
    (o) => o.status?.toLowerCase() === "preparing"
  ).length;

  const completed = orders.filter(
    (o) => o.status?.toLowerCase() === "completed"
  ).length;

  const todaySales = orders
    .filter((o) => {

      if (!o.createdAt) return false;

      const d = o.createdAt.toDate
        ? o.createdAt.toDate()
        : new Date(o.createdAt);

      return (
        d.toDateString() === today &&
        o.status?.toLowerCase() === "completed"
      );

    })
    .reduce((sum, o) => sum + (o.total || 0), 0);


  const cards = [
    { label: "New Orders", value: newOrders, icon: "🔔", color: "#e8521a" },
    { label: "Preparing", value: preparing, icon: "👨‍🍳", color: "#f59e0b" },
    { label: "Completed", value: completed, icon: "✅", color: "#10b981" },
    { label: "Today Sales", value: `${todaySales} EGP`, icon: "💰", color: "#6366f1" },
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