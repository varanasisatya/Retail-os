import { motion } from "framer-motion";
import { AlertTriangle, Brain, Sparkles, TrendingUp } from "lucide-react";

const insights = [
  {
    icon: TrendingUp,
    title: "Demand Spike",
    desc: "Gaming accessories demand increased 32% across Hyderabad premium stores.",
    tone: "emerald",
  },
  {
    icon: Sparkles,
    title: "Viral Product",
    desc: "AI smart rings are accelerating across metro regions and online search.",
    tone: "fuchsia",
  },
  {
    icon: AlertTriangle,
    title: "Inventory Warning",
    desc: "Beauty products may run out within 5 days unless replenishment is pulled forward.",
    tone: "amber",
  },
];

export default function AIInsightsPanel() {
  return (
    <section className="ai-panel ai-insights-panel">
      <div className="ai-panel-glow" />
      <div className="ai-panel-header">
        <div className="ai-panel-icon">
          <Brain size={24} />
        </div>
        <div>
          <p className="eyebrow">Live AI layer</p>
          <h2>AI Strategic Insights</h2>
        </div>
      </div>

      <div className="ai-insight-stack">
        {insights.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.article
              className="ai-insight-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.36 }}
              whileHover={{ scale: 1.015, y: -2 }}
              key={item.title}
            >
              <div className={`ai-insight-icon tone-${item.tone}`}>
                <Icon size={20} />
              </div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
