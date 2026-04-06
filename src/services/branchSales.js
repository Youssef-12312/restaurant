function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function cleanBranchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\u0600-\u06FF ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createEmptyBranchStats() {
  return {
    mashaya: { revenue: 0, orders: 0 },
    gamaa: { revenue: 0, orders: 0 },
  };
}

export function normalizeBranchKey(value) {
  const branch = cleanBranchText(value);

  if (!branch) {
    return null;
  }

  if (
    branch === "mashaya" ||
    branch.includes("mash") ||
    branch.includes("مشاي")
  ) {
    return "mashaya";
  }

  if (
    branch === "gamaa" ||
    branch.includes("gam") ||
    branch.includes("gam3") ||
    branch.includes("جامعة") ||
    branch.includes("جامعه") ||
    (branch.includes("حي") && (branch.includes("جامعة") || branch.includes("جامعه")))
  ) {
    return "gamaa";
  }

  return null;
}

function pickMetricValue(source, metric) {
  if (!source || typeof source !== "object") {
    return 0;
  }

  if (metric === "revenue") {
    return toNumber(
      source.revenue ??
        source.totalRevenue ??
        source.sales ??
        source.amount ??
        source.total
    );
  }

  return toNumber(
    source.orders ??
      source.totalOrders ??
      source.count ??
      source.orderCount
  );
}

export function extractBranchStats(source) {
  const stats = createEmptyBranchStats();

  const containers = [
    source?.branches,
    source?.branchTotals,
    source?.branchBreakdown,
    source,
  ];

  for (const container of containers) {
    if (!container || typeof container !== "object") {
      continue;
    }

    for (const [rawKey, value] of Object.entries(container)) {
      const branchKey = normalizeBranchKey(rawKey);

      if (!branchKey || !value || typeof value !== "object") {
        continue;
      }

      const revenue = pickMetricValue(value, "revenue");
      const orders = pickMetricValue(value, "orders");

      if (
        revenue === 0 &&
        orders === 0 &&
        (stats[branchKey].revenue > 0 || stats[branchKey].orders > 0)
      ) {
        continue;
      }

      stats[branchKey] = { revenue, orders };
    }
  }

  const flatFields = {
    mashaya: {
      revenue: ["mashayaRevenue", "mashaya_revenue"],
      orders: ["mashayaOrders", "mashaya_orders"],
    },
    gamaa: {
      revenue: ["gamaaRevenue", "gamaa_revenue"],
      orders: ["gamaaOrders", "gamaa_orders"],
    },
  };

  for (const [branchKey, metrics] of Object.entries(flatFields)) {
    const revenue = metrics.revenue
      .map((key) => toNumber(source?.[key]))
      .find((value) => value > 0);
    const orders = metrics.orders
      .map((key) => toNumber(source?.[key]))
      .find((value) => value > 0);

    if (revenue || orders) {
      stats[branchKey] = {
        revenue: revenue ?? stats[branchKey].revenue,
        orders: orders ?? stats[branchKey].orders,
      };
    }
  }

  return stats;
}

export function buildBranchStatsFromOrders(orders = []) {
  const stats = createEmptyBranchStats();

  for (const order of orders) {
    const branchKey = normalizeBranchKey(order?.branch);

    if (!branchKey) {
      continue;
    }

    stats[branchKey].revenue += toNumber(order?.total);
    stats[branchKey].orders += 1;
  }

  return stats;
}

export function mergeBranchStats(primary, fallback) {
  const merged = createEmptyBranchStats();

  for (const branchKey of Object.keys(merged)) {
    const primaryRevenue = toNumber(primary?.[branchKey]?.revenue);
    const primaryOrders = toNumber(primary?.[branchKey]?.orders);
    const fallbackRevenue = toNumber(fallback?.[branchKey]?.revenue);
    const fallbackOrders = toNumber(fallback?.[branchKey]?.orders);

    merged[branchKey] = {
      revenue: Math.max(primaryRevenue, fallbackRevenue),
      orders: Math.max(primaryOrders, fallbackOrders),
    };
  }

  return merged;
}
