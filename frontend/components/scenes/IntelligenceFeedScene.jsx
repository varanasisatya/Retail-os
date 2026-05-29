"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Zap,
  MapPin,
  Package,
  Brain,
  Wifi,
  WifiOff,
  RefreshCw
} from "lucide-react";
import { useRetailData } from "@/lib/retailContext";

// Lazy-load Three.js background canvas
const NeuralUniverse = dynamic(
  () => import("./NeuralUniverse").then((m) => ({ default: m.NeuralUniverse })),
  { ssr: false, loading: () => <div className="neural-universe-loading" /> }
);

// Signal categories color map and icon vectors matching globals.css accents
const SIGNAL_TYPES = {
  demand:    { icon: TrendingUp,    color: "var(--color-cyan)",    label: "DEMAND"    },
  alert:     { icon: AlertTriangle, color: "var(--color-rose)",    label: "ALERT"     },
  forecast:  { icon: Activity,      color: "var(--color-violet)",  label: "FORECAST"  },
  inventory: { icon: Package,       color: "var(--color-mint)",    label: "INVENTORY" },
  regional:  { icon: MapPin,        color: "var(--color-fuchsia)", label: "REGIONAL"  },
  neural:    { icon: Brain,         color: "var(--color-ice)",     label: "NEURAL"    },
};

// Seed signals database
const AMBIENT_SIGNALS = [
  { type: "demand",    msg: "AI detected demand spike in Electronics — +34% above baseline" },
  { type: "regional",  msg: "Mumbai region showing 2.4× velocity surge in Apparel category" },
  { type: "forecast",  msg: "30-day forecast model recalibrated — confidence band tightened to ±8%" },
  { type: "alert",     msg: "Inventory depletion risk flagged for SKU-7842 in North region" },
  { type: "neural",    msg: "Neural engine detected seasonal pattern shift — Q3 model updated" },
  { type: "inventory", msg: "Reorder signal triggered: Home & Kitchen stock < 14-day threshold" },
  { type: "demand",    msg: "Weekend demand peak predicted — 1.8× average Saturday velocity" },
  { type: "regional",  msg: "Hyderabad market showing early adoption of Premium segment trend" },
  { type: "forecast",  msg: "Revenue forecast revised upward +12% based on emerging category signal" },
  { type: "neural",    msg: "Cross-category correlation: Electronics → Accessories demand lag detected" },
  { type: "alert",     msg: "Price elasticity anomaly in Bangalore — AI recommends margin review" },
  { type: "inventory", msg: "Safety stock buffer insufficient for projected 30-day demand surge" },
  { type: "demand",    msg: "Viral product signal emerging — TrendNet score exceeds alert threshold" },
  { type: "regional",  msg: "Tier-2 city demand acceleration: 67% growth rate in 14-day window" },
  { type: "forecast",  msg: "Peak day forecast: ₹2.4M — highest projected single-day revenue this quarter" },
];

/**
 * Character-by-character typewriter text renderer.
 * Keeps structural dimensions static during typewriting to prevent reflow layout shifts.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.text - Source string to render character by character
 * @param {number} [props.speed=12] - Duration in milliseconds between writing characters
 * @returns {React.ReactElement}
 */
function TypewriterSignal({ text, speed = 12 }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    setIsDone(false);

    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(timer);
        setIsDone(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      {!isDone && <span className="boot-cursor" style={{ width: "5px", height: "1.05em", background: "var(--color-cyan)", display: "inline-block", marginLeft: "2px" }} />}
    </span>
  );
}

TypewriterSignal.propTypes = {
  text: PropTypes.string.isRequired,
  speed: PropTypes.number
};

/**
 * Live single signal card container.
 * Animates scale and opacity only (60fps compliant, layout-shift free).
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.signal - Signal data payload
 * @param {string} props.signal.timestamp - Generated timestamp string
 * @param {string} props.signal.type - Category index for styling and icon maps
 * @param {string} props.signal.msg - Raw string content to print
 * @returns {React.ReactElement}
 */
function TerminalSignalRow({ signal }) {
  const config = SIGNAL_TYPES[signal.type] ?? SIGNAL_TYPES.neural;
  const Icon = config.icon;
  const colorVal = config.color;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97, y: -15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
        padding: "12px 16px",
        background: "rgba(255, 255, 255, 0.015)",
        borderLeft: `2px solid ${colorVal}`,
        borderRadius: "4px",
        borderTopRightRadius: "8px",
        borderBottomRightRadius: "8px",
        boxShadow: "inset 0 0 15px rgba(255,255,255,0.01)",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <span style={{ color: "var(--text-ghost)", fontSize: "0.7rem", fontFamily: "var(--font-mono)" }}>
          [{signal.timestamp}]
        </span>
        <span style={{ color: colorVal, fontSize: "0.68rem", fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.08em" }}>
          {config.label}
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>&gt;&gt;</span>
      </div>
      <div style={{ flex: 1, color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>
        <TypewriterSignal text={signal.msg} />
      </div>
      <div style={{ color: colorVal, opacity: 0.7, display: "grid", placeItems: "center", flexShrink: 0, marginTop: "2px" }}>
        <Icon size={12} />
      </div>
    </motion.div>
  );
}

TerminalSignalRow.propTypes = {
  signal: PropTypes.shape({
    timestamp: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    msg: PropTypes.string.isRequired
  }).isRequired
};

/**
 * IntelligenceFeedScene Component
 * 
 * Renders a full-width terminal-style telemetry panel overlayed on the 3D NeuralUniverse.
 * Displays streaming signals utilizing character-by-character typewriter logs, layout-shift free
 * list prepending, and category metrics using GPU scale transitions.
 * 
 * @component
 * @returns {React.ReactElement}
 */
export function IntelligenceFeedScene() {
  const { reportData } = useRetailData();
  const [signals, setSignals] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [totalSignals, setTotalSignals] = useState(0);
  const listRef = useRef(null);

  // Auto responsive window resize detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hydrate signals feed
  useEffect(() => {
    if (hasError) return;

    // Build signals from static database + dynamic context reportData
    const dynamicSignals = [];
    if (reportData) {
      const { metrics, recommendations } = reportData;
      if (metrics?.top_category) {
        dynamicSignals.push({ type: "demand", msg: `Top demand category identified: ${metrics.top_category}` });
      }
      recommendations?.forEach((r) => {
        dynamicSignals.push({ type: r.priority === "high" ? "alert" : "inventory", msg: `${r.title} — ${r.detail}` });
      });
    }

    const availablePool = [...dynamicSignals, ...AMBIENT_SIGNALS];
    let poolIndex = 0;

    // Load initial batch
    const initialBatch = [];
    for (let i = 0; i < Math.min(5, availablePool.length); i++) {
      const now = new Date();
      initialBatch.push({
        ...availablePool[poolIndex],
        id: `init-${i}-${Date.now()}`,
        timestamp: now.toLocaleTimeString(),
      });
      poolIndex++;
    }
    setSignals(initialBatch);
    setTotalSignals(initialBatch.length);

    // Live signal stream generator loop (updates feed every 3.8 seconds)
    const interval = setInterval(() => {
      const now = new Date();
      const nextSignal = {
        ...availablePool[poolIndex % availablePool.length],
        id: `signal-${Date.now()}-${Math.random()}`,
        timestamp: now.toLocaleTimeString(),
      };
      setSignals((prev) => [nextSignal, ...prev].slice(0, 12));
      setTotalSignals((c) => c + 1);
      poolIndex++;
    }, 3800);

    return () => clearInterval(interval);
  }, [reportData, hasError]);

  const toggleConnectionAnomaly = useCallback(() => {
    setHasError((prev) => !prev);
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
  }, []);

  return (
    <section className="intel-scene" id="intelligence" style={{ position: "relative", minHeight: "calc(100vh - 64px)", width: "100%", overflow: "hidden" }} aria-label="Live AI Intelligence Feed">
      {/* Scrollbar styling override inside standalone style tag */}
      <style>{`
        .terminal-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .terminal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .terminal-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 999px;
        }
        .terminal-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.2);
        }
      `}</style>

      {/* Three.js background canvas */}
      <NeuralUniverse className="neural-universe-canvas" />

      {/* Ambient glass scans */}
      <div className="intel-bg" aria-hidden="true" style={{ pointerEvents: "none" }}>
        <div className="intel-bg-scan" />
      </div>

      {/* Absolute overlay container positioned over Three.js scene */}
      <div
        style={{
          position: "absolute",
          top: "92px",
          left: "24px",
          right: "24px",
          bottom: "24px",
          background: "rgba(2, 4, 11, 0.82)", // Monochromatic dark void base
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          border: hasError ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          boxShadow: "var(--shadow-cinema)",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 280px",
          overflow: "hidden",
          zIndex: 10,
          transition: "border-color 0.5s ease"
        }}
      >
        {/* Left Side: System Terminal */}
        <div style={{ display: "flex", flexDirection: "column", height: "100%", borderRight: isMobile ? "none" : "1px solid rgba(255, 255, 255, 0.05)", overflow: "hidden" }}>
          
          {/* Terminal Window Header Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", background: "rgba(255, 255, 255, 0.01)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: hasError ? "#ef4444" : "rgba(255, 255, 255, 0.15)" }} />
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: hasError ? "rgba(255,255,255,0.15)" : "#f59e0b" }} />
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: hasError ? "rgba(255,255,255,0.15)" : "#10b981" }} />
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.15em", marginLeft: "12px", fontWeight: 700 }}>
                RETAILOS_AI // NEURAL_SIGNAL_CORE
              </span>
            </div>
            
            <button
              onClick={toggleConnectionAnomaly}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                letterSpacing: "0.08em",
                color: hasError ? "var(--color-cyan)" : "var(--color-rose)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "opacity 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
            >
              {hasError ? <Wifi size={10} style={{ color: "var(--color-rose)" }} /> : <WifiOff size={10} style={{ color: "var(--color-cyan)" }} />}
              {hasError ? "ESTABLISH LINK" : "DISRUPT STREAM"}
            </button>
          </div>

          {/* Terminal stream log list */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <AnimatePresence mode="wait">
              {hasError ? (
                <motion.div
                  key="error-state"
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "32px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center"
                  }}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertTriangle size={48} style={{ color: "var(--color-rose)", marginBottom: "16px", filter: "drop-shadow(0 0 15px rgba(251,113,133,0.3))" }} />
                  
                  {/* Using custom heading typographic scale */}
                  <h1 className="pf-heading" style={{ color: "var(--color-rose)", margin: "0 0 12px 0", fontSize: "2.4rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
                    NEURAL ERROR
                  </h1>

                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0 0 24px 0", maxWidth: "380px", lineHeight: 1.6 }}>
                    A critical interruption terminated the intelligence feed link. The decryption sync key was invalidated.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "340px", marginBottom: "28px" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--color-rose)", background: "rgba(251, 113, 133, 0.08)", border: "1px solid rgba(251, 113, 133, 0.2)", padding: "10px", borderRadius: "6px" }}>
                      SYS_ERR_403: DECRYPTION_KEY_INVALIDATED
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--color-rose)", background: "rgba(251, 113, 133, 0.08)", border: "1px solid rgba(251, 113, 133, 0.2)", padding: "10px", borderRadius: "6px" }}>
                      SYS_ERR_509: BROADCAST_HANDSHAKE_TIMEOUT
                    </div>
                  </div>

                  <button
                    onClick={handleRetry}
                    className="cinema-button"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      letterSpacing: "0.1em",
                      borderColor: "rgba(255, 255, 255, 0.12)"
                    }}
                  >
                    <RefreshCw size={12} style={{ marginRight: 6 }} />
                    RE-SYNCHRONIZE CORE
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="live-feed"
                  className="terminal-scroll"
                  ref={listRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    overflowY: "auto"
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {signals.map((sig) => (
                      <TerminalSignalRow key={sig.id} signal={sig} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Operations Panel */}
        {!isMobile && (
          <div style={{ display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.1)", padding: "24px", gap: "24px", overflowY: "auto" }}>
            
            {/* Connection Node */}
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-muted)", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 12px 0", fontWeight: 700 }}>
                SIGNAL STATUS
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.015)", padding: "12px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
                  <motion.div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: hasError ? "var(--color-rose)" : "var(--color-mint)",
                      boxShadow: hasError ? "0 0 8px var(--color-rose)" : "0 0 8px var(--color-mint)"
                    }}
                    animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {hasError ? "LINK SEVERED" : "SYNCHRONIZED"}
                  </div>
                  <div style={{ fontSize: "0.62rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    FPS: 60.0 // LATENCY: 42ms
                  </div>
                </div>
              </div>
            </div>

            {/* Total Signals Counter */}
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-muted)", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 12px 0", fontWeight: 700 }}>
                TELEMETRY VOLUME
              </p>
              <div style={{ background: "rgba(255,255,255,0.015)", padding: "14px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.6rem", fontWeight: 900, color: hasError ? "var(--color-rose)" : "var(--color-cyan)" }}>
                  {hasError ? "000,000" : totalSignals.toLocaleString()}
                </span>
                <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", margin: "4px 0 0 0", letterSpacing: "0.05em", fontWeight: 700 }}>
                  Active Stream Ingests
                </p>
              </div>
            </div>

            {/* Signal Categories Breakdown */}
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-muted)", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 14px 0", fontWeight: 700 }}>
                SIGNAL DISTRIBUTION
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {Object.entries(SIGNAL_TYPES).map(([key, { color, label }]) => {
                  const percent = hasError ? 0 : 25 + (key.charCodeAt(0) % 5) * 15;
                  return (
                    <div key={key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", fontFamily: "var(--font-mono)" }}>
                        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                        <span style={{ color: color }}>{percent}%</span>
                      </div>
                      <div style={{ height: "3px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "99px", overflow: "hidden" }}>
                        <motion.div
                          style={{
                            height: "100%",
                            background: color,
                            transformOrigin: "left",
                            borderRadius: "99px"
                          }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: percent / 100 }}
                          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
