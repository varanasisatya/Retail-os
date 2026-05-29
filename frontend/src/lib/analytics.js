export const normalizeOrder = (row) => {
  const get = (...keys) => {
    const match = keys.find((key) => row[key] !== undefined && row[key] !== "");
    return match ? row[match] : undefined;
  };

  const revenue = Number(get("Revenue", "revenue", "Sales", "sales", "Amount", "amount")) || 0;
  const quantitySold =
    Number(get("Quantity Sold", "quantitySold", "Quantity", "quantity", "Units", "units")) || 0;
  const rawDate = get("Order Date", "orderDate", "Date", "date");

  return {
    orderDate: rawDate ? new Date(rawDate).toISOString().slice(0, 10) : "",
    category: get("Category", "Product Category", "category") || "General",
    product: get("Product", "product", "SKU", "sku") || "Assorted retail",
    region: get("Region", "region", "Channel", "channel") || "All stores",
    revenue,
    quantitySold,
    margin: Number(get("Margin", "margin", "Gross Margin", "grossMargin")) || 0.32,
    stockOnHand: Number(get("Stock", "stockOnHand", "Inventory", "inventory")) || 0,
    reorderPoint: Number(get("Reorder Point", "reorderPoint")) || 0,
  };
};

export const parseCsv = (text) => {
  const rows = text.trim().split(/\r?\n/);
  if (rows.length < 2) return [];

  const splitLine = (line) => {
    const values = [];
    let current = "";
    let quoted = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];

      if (char === '"' && quoted && next === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  };

  const headers = splitLine(rows[0]).map((header) => header.replace(/^"|"$/g, ""));
  return rows
    .slice(1)
    .map((line) => splitLine(line))
    .map((values) =>
      headers.reduce((row, header, index) => {
        row[header] = values[index]?.replace(/^"|"$/g, "") ?? "";
        return row;
      }, {})
    )
    .map(normalizeOrder)
    .filter((row) => row.orderDate && row.revenue > 0);
};

const sumBy = (items, selector) => items.reduce((total, item) => total + selector(item), 0);

const groupBy = (items, selector) =>
  items.reduce((groups, item) => {
    const key = selector(item);
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {});

const buildDailySeries = (orders) => {
  const byDate = groupBy(orders, (order) => order.orderDate);

  return Object.entries(byDate)
    .map(([date, rows]) => ({
      date,
      revenue: Math.round(sumBy(rows, (row) => row.revenue)),
      units: Math.round(sumBy(rows, (row) => row.quantitySold)),
      marginRevenue: Math.round(sumBy(rows, (row) => row.revenue * row.margin)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const buildForecast = (dailySeries, horizon) => {
  const recent = dailySeries.slice(-14);
  const first = recent[0]?.revenue || 1;
  const last = recent[recent.length - 1]?.revenue || first;
  const trend = (last - first) / Math.max(recent.length, 1);
  const average = sumBy(recent, (day) => day.revenue) / Math.max(recent.length, 1);
  const lastDate = new Date(`${dailySeries[dailySeries.length - 1]?.date || "2026-05-26"}T00:00:00`);

  return Array.from({ length: horizon }).map((_, index) => {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + index + 1);
    const weeklyPattern = [0.94, 0.98, 1.02, 1.05, 1.13, 1.2, 1.08][date.getDay()];
    const predicted = Math.max(0, Math.round((average + trend * (index + 1)) * weeklyPattern));

    return {
      date: date.toISOString().slice(0, 10),
      forecast: predicted,
      lower: Math.round(predicted * 0.88),
      upper: Math.round(predicted * 1.12),
    };
  });
};

const buildBreakdown = (orders, key) =>
  Object.entries(groupBy(orders, (order) => order[key] || "Other"))
    .map(([name, rows]) => ({
      name,
      revenue: Math.round(sumBy(rows, (row) => row.revenue)),
      units: Math.round(sumBy(rows, (row) => row.quantitySold)),
      marginRevenue: Math.round(sumBy(rows, (row) => row.revenue * row.margin)),
    }))
    .sort((a, b) => b.revenue - a.revenue);

export const buildDashboardModel = (orders, horizon = 14, region = "All regions") => {
  const filteredOrders =
    region === "All regions" ? orders : orders.filter((order) => order.region === region);
  const dailySeries = buildDailySeries(filteredOrders);
  const previousWindow = dailySeries.slice(-28, -14);
  const currentWindow = dailySeries.slice(-14);
  const currentRevenue = sumBy(currentWindow, (day) => day.revenue);
  const previousRevenue = sumBy(previousWindow, (day) => day.revenue);
  const currentUnits = sumBy(currentWindow, (day) => day.units);
  const marginRevenue = sumBy(currentWindow, (day) => day.marginRevenue);
  const forecast = buildForecast(dailySeries, horizon);
  const categoryBreakdown = buildBreakdown(filteredOrders, "category");
  const regionBreakdown = buildBreakdown(orders, "region");

  const topCategory = categoryBreakdown[0]?.name || "General";
  const projectedRevenue = sumBy(forecast, (day) => day.forecast);
  const revenueChange = previousRevenue
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
    : 0;

  return {
    dailySeries,
    forecast,
    categoryBreakdown,
    regionBreakdown,
    regions: ["All regions", ...new Set(orders.map((order) => order.region))],
    kpis: {
      currentRevenue,
      revenueChange,
      currentUnits,
      marginRate: currentRevenue ? (marginRevenue / currentRevenue) * 100 : 0,
      projectedRevenue,
      topCategory,
    },
    insights: [
      {
        title: `${topCategory} is leading demand`,
        body: `${topCategory} contributes ${Math.round(
          ((categoryBreakdown[0]?.revenue || 0) / Math.max(sumBy(categoryBreakdown, (row) => row.revenue), 1)) *
            100
        )}% of active revenue in the selected view.`,
        tone: "green",
      },
      {
        title: "Forecast momentum",
        body: `The next ${horizon} days are projected at ${formatCurrency(projectedRevenue)} with current trading patterns.`,
        tone: "blue",
      },
      {
        title: "Margin guardrail",
        body: `Gross margin is tracking at ${formatPercent(
          currentRevenue ? (marginRevenue / currentRevenue) * 100 : 0
        )}; protect discounting on high-velocity items.`,
        tone: "amber",
      },
    ],
  };
};

export const buildInventoryActions = (inventory) =>
  inventory
    .map((item) => {
      const coverDays = item.dailyVelocity ? item.stockOnHand / item.dailyVelocity : 999;
      const targetUnits = Math.max(0, Math.ceil(item.dailyVelocity * (item.supplierLeadTime + 7) - item.stockOnHand));
      const status =
        item.stockOnHand <= item.reorderPoint ? "Reorder now" : coverDays < item.supplierLeadTime ? "At risk" : "Healthy";

      return {
        ...item,
        coverDays,
        targetUnits,
        status,
        priority: status === "Reorder now" ? 1 : status === "At risk" ? 2 : 3,
      };
    })
    .sort((a, b) => a.priority - b.priority || a.coverDays - b.coverDays);

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const formatCompactCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

export const formatPercent = (value) => `${(value || 0).toFixed(1)}%`;
