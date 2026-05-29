"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Brain, X, Zap } from "lucide-react";
import { useRetailData } from "@/lib/retailContext";

// ─── Demo intelligence answers ───────────────────────────────────────────────
const DEMO_PROBES = [
  {
    id: "demand",
    question: "What's driving demand?",
    answer: `Neural pattern recognition identifies **Electronics** as the primary demand accelerant this cycle. Weekend velocity running **1.8× baseline** with consistent acceleration in South India markets. Early-adopter surge patterns detected in Tier-2 cities.`,
    tags: ["Electronics", "Weekend Peak", "South India"],
  },
  {
    id: "region",
    question: "Which region needs attention?",
    answer: `Mumbai and Hyderabad are diverging signals. **Mumbai** showing market saturation indicators while **Hyderabad** registers **+67% growth velocity** in the 14-day window. Rebalancing regional inventory allocation is the highest-priority recommendation.`,
    tags: ["Hyderabad", "Mumbai", "Rebalance"],
  },
  {
    id: "peak",
    question: "When is peak day?",
    answer: `Forecast engine projects **Saturday** as the highest probability peak day, driven by a **1.2× weekend multiplier** and Electronics category surge. Secondary peak emerging mid-week (Wednesday) for Apparel. Stock replenishment window: **48 hours before Saturday**.`,
    tags: ["Saturday Peak", "Electronics", "Wednesday"],
  },
  {
    id: "stock",
    question: "What should I stock?",
    answer: `Three urgent reorder signals detected: **Electronics** (depletion risk — 14-day threshold breach), **Apparel** (velocity surge +34% above baseline), **Home & Kitchen** (safety stock gap at 18% below optimal). Accessories showing early-stage demand build.`,
    tags: ["Electronics", "Apparel", "Home & Kitchen"],
  },
];

// ─── Answers from real data ───────────────────────────────────────────────────
function buildLiveProbes(reportData) {
  if (!reportData) return DEMO_PROBES;
  const { metrics, recommendations, category_breakdown, region_breakdown } = reportData;
  const top = category_breakdown?.[0];
  const topRegion = region_breakdown?.[0];
  const change = metrics?.revenue_change_percent ?? 0;
  const dir = change >= 0 ? "up" : "down";

  return [
    {
      id: "demand",
      question: "What's driving demand?",
      answer: `Live intelligence: **${top?.name ?? "General"}** is the top demand driver with **₹${
        top ? (top.revenue / 1000).toFixed(1) : "—"
      }K** revenue. Overall trend is running **${dir} ${Math.abs(change)}%** vs prior period. Neural engine monitoring velocity in real-time.`,
      tags: [top?.name ?? "—", `${dir} ${Math.abs(change)}%`, "Live Data"],
    },
    {
      id: "region",
      question: "Which region needs attention?",
      answer: `${topRegion?.name ?? "Primary region"} is the highest velocity market with **₹${
        topRegion ? (topRegion.revenue / 1000).toFixed(1) : "—"
      }K** in revenue. ${recommendations?.[1]?.detail ?? "Regional rebalancing recommended."}`,
      tags: [topRegion?.name ?? "—", "Highest Velocity", "Regional Intel"],
    },
    {
      id: "peak",
      question: "When is peak day?",
      answer: `Forecast engine projects **₹${
        (metrics?.peak_day_forecast ?? 0).toLocaleString("en-IN")
      }** peak day revenue. Projected monthly run-rate: **₹${
        (metrics?.projected_monthly_revenue ?? 0).toLocaleString("en-IN")
      }**. Calendar window: align replenishment 48h before projected peak.`,
      tags: [`₹${((metrics?.peak_day_forecast ?? 0) / 1000).toFixed(1)}K Peak`, "30-Day Model", "Live"],
    },
    {
      id: "stock",
      question: "What should I stock?",
      answer: `${recommendations?.map((r) => `**${r.title}** — ${r.detail}`).join(" ") ?? "Upload a dataset for specific stock recommendations."}`,
      tags: recommendations?.map((r) => r.title).slice(0, 3) ?? ["—"],
    },
  ];
}

// ─── Typewriter text ───────────────────────────────────────────────────────────
function TypewriterResponse({ text }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      if (i < text.length) setDisplayed(text.slice(0, ++i));
      else clearInterval(interval);
    }, 14);
    return () => clearInterval(interval);
  }, [text]);

  // Render **bold** markers
  const parts = displayed.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="ai-response-text">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

// ─── Waveform ─────────────────────────────────────────────────────────────────
function AIWaveform() {
  return (
    <div className="ai-waveform" aria-hidden="true">
      {[12, 18, 9, 16, 14, 20, 11].map((h, i) => (
        <div
          key={i}
          className="ai-waveform-bar"
          style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AICommandCenter() {
  const [open, setOpen] = useState(false);
  const [activeProbe, setActiveProbe] = useState(null);
  const [thinking, setThinking] = useState(false);
  const { reportData } = useRetailData();
  const isLive = !!reportData;

  const probes = buildLiveProbes(reportData);

  const handleProbe = (probe) => {
    if (thinking) return;
    setActiveProbe(null);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setActiveProbe(probe);
    }, 1200);
  };

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        className={`ai-commander-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close AI Command Center" : "Open AI Command Center"}
        whileTap={{ scale: 0.92 }}
        id="ai-commander-btn"
      >
        {!open && <div className="ai-trigger-ring" />}
        {open ? <X size={18} /> : <Brain size={20} />}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="ai-commander-panel"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            role="dialog"
            aria-label="AI Command Center"
          >
            <div className="ai-commander-scan" />

            {/* Header */}
            <div className="ai-commander-header">
              <div className="ai-commander-title">
                <div className="ai-commander-icon">
                  <Brain size={15} />
                </div>
                <div>
                  <div className="ai-commander-label">RetailOS Intelligence</div>
                  <div className="ai-commander-sub">
                    <span className={`ai-mode-badge ${isLive ? "live" : "demo"}`}>
                      <span style={{ fontSize: "0.55rem" }}>●</span>
                      {isLive ? " LIVE DATA" : " DEMO INTELLIGENCE"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="ai-commander-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Neural probes */}
            <div className="ai-probes" role="list">
              {probes.map((probe) => (
                <button
                  key={probe.id}
                  className={`ai-probe-btn ${activeProbe?.id === probe.id ? "active" : ""}`}
                  onClick={() => handleProbe(probe)}
                  role="listitem"
                >
                  {probe.question}
                </button>
              ))}
            </div>

            {/* Response area */}
            <div className="ai-response-area">
              {!activeProbe && !thinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.7 }}
                >
                  Select a neural probe above to query the intelligence engine.
                  {isLive
                    ? " Your uploaded dataset is loaded — responses are data-driven."
                    : " Running in cinematic demo mode. Upload a CSV to activate live intelligence."}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {thinking && (
                  <motion.div
                    key="thinking"
                    className="ai-thinking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AIWaveform />
                    <span className="ai-thinking-label">Neural engine processing...</span>
                  </motion.div>
                )}

                {activeProbe && !thinking && (
                  <motion.div
                    key={activeProbe.id}
                    className="ai-response"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="ai-response-avatar">
                      <Zap size={14} />
                    </div>
                    <div className="ai-response-body">
                      <div className="ai-response-meta">
                        INTELLIGENCE ENGINE · {activeProbe.question.toUpperCase()}
                      </div>
                      <TypewriterResponse text={activeProbe.answer} />
                      <div className="ai-response-tags">
                        {activeProbe.tags.filter(Boolean).map((tag) => (
                          <span key={tag} className="ai-response-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
