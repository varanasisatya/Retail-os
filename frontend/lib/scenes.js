export const scenes = [
  {
    slug: "hero",
    label: "Home",
    eyebrow: "RetailOS AI",
    title: ["THE FUTURE OF", "RETAIL INTELLIGENCE"],
    description:
      "An immersive AI operating system for the future of commerce. Neural forecasting, demand intelligence, and inventory signals — unified.",
    metric: "∞",
    metricLabel: "Intelligence layers",
  },
  {
    slug: "dataset",
    label: "Dataset",
    eyebrow: "Intelligence ingestion engine",
    title: ["Feed the", "Neural Core"],
    description:
      "Drop your retail dataset. The AI engine will parse, clean, forecast, and return intelligence in seconds.",
    metric: "CSV",
    metricLabel: "Data signals accepted",
  },
  {
    slug: "forecast",
    label: "Forecast",
    eyebrow: "Temporal intelligence engine",
    title: ["Navigate", "Future Timelines"],
    description:
      "Navigate AI-powered demand forecasts across orbital time ranges. Charts morph as you traverse future timelines.",
    metric: "30D",
    metricLabel: "Max forecast horizon",
  },
  {
    slug: "intelligence",
    label: "Intelligence",
    eyebrow: "Live AI signal feed",
    title: ["AI", "Intelligence Feed"],
    description:
      "Realtime AI signals: demand spikes, inventory alerts, trend surges, and regional intelligence — streaming live.",
    metric: "∞",
    metricLabel: "Live signals",
  },
];

export const getSceneBySlug = (slug) => scenes.find((s) => s.slug === slug);
