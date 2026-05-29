import { motion } from "framer-motion";

const products = [
  { name: "AI Smart Ring", score: 94 },
  { name: "RGB Gaming Setup", score: 89 },
  { name: "Korean Skincare", score: 86 },
  { name: "Luxury Sneakers", score: 79 },
];

export default function TrendRadar() {
  return (
    <section className="ai-panel trend-radar">
      <div className="ai-panel-header radar-header">
        <div>
          <p className="eyebrow">Signal scanner</p>
          <h2>Live Trend Radar</h2>
        </div>
        <div className="live-dot" aria-label="Live trend signal" />
      </div>

      <div className="trend-list">
        {products.map((item, index) => (
          <div className="trend-row" key={item.name}>
            <div className="trend-meta">
              <span>{item.name}</span>
              <strong>{item.score}%</strong>
            </div>
            <div className="trend-track">
              <motion.div
                className="trend-fill"
                initial={{ width: 0 }}
                animate={{ width: `${item.score}%` }}
                transition={{ delay: index * 0.1, duration: 1.1, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
