const categories = ["Grocery", "Apparel", "Electronics", "Home", "Beauty"];
const regions = ["North", "South", "West", "Online"];
const products = {
  Grocery: ["Organic staples", "Breakfast bundles", "Ready meals"],
  Apparel: ["Denim capsule", "Athleisure basics", "Festival edit"],
  Electronics: ["Smart accessories", "Audio bar", "Home devices"],
  Home: ["Storage systems", "Kitchenware", "Soft furnishings"],
  Beauty: ["Skin care set", "Hair care kit", "Fragrance minis"],
};

const dateAtOffset = (offset) => {
  const date = new Date("2026-04-01T00:00:00");
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export const sampleOrders = Array.from({ length: 56 }).flatMap((_, day) => {
  const weekdayLift = [1.04, 0.96, 1, 1.08, 1.16, 1.28, 1.18][day % 7];
  const campaignLift = day > 35 ? 1.13 : day > 22 ? 1.06 : 1;

  return categories.map((category, index) => {
    const categoryBase = [4600, 2800, 3900, 2100, 2400][index];
    const region = regions[(day + index) % regions.length];
    const revenue = Math.round(
      categoryBase * weekdayLift * campaignLift + ((day * 173 + index * 311) % 900)
    );
    const quantitySold = Math.max(12, Math.round(revenue / ([28, 42, 110, 38, 34][index])));

    return {
      orderDate: dateAtOffset(day),
      category,
      product: products[category][day % products[category].length],
      region,
      revenue,
      quantitySold,
      margin: [0.26, 0.42, 0.19, 0.33, 0.48][index],
      stockOnHand: [640, 280, 165, 330, 245][index] - Math.floor(day * (index + 2) * 0.8),
      reorderPoint: [180, 90, 55, 110, 80][index],
    };
  });
});

export const inventorySeed = [
  {
    sku: "GRO-101",
    product: "Organic staples",
    category: "Grocery",
    stockOnHand: 154,
    reorderPoint: 180,
    dailyVelocity: 38,
    supplierLeadTime: 4,
    margin: 0.26,
  },
  {
    sku: "APP-220",
    product: "Festival edit",
    category: "Apparel",
    stockOnHand: 62,
    reorderPoint: 90,
    dailyVelocity: 17,
    supplierLeadTime: 8,
    margin: 0.44,
  },
  {
    sku: "ELC-418",
    product: "Smart accessories",
    category: "Electronics",
    stockOnHand: 41,
    reorderPoint: 55,
    dailyVelocity: 12,
    supplierLeadTime: 9,
    margin: 0.2,
  },
  {
    sku: "HOM-512",
    product: "Storage systems",
    category: "Home",
    stockOnHand: 138,
    reorderPoint: 110,
    dailyVelocity: 21,
    supplierLeadTime: 6,
    margin: 0.33,
  },
  {
    sku: "BTY-304",
    product: "Skin care set",
    category: "Beauty",
    stockOnHand: 87,
    reorderPoint: 80,
    dailyVelocity: 19,
    supplierLeadTime: 5,
    margin: 0.48,
  },
];
