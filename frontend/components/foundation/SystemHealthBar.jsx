"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRetailData } from "@/lib/retailContext";
import { usePerformanceTier } from "@/lib/usePerformanceTier";
import { Terminal, X } from "lucide-react";

/**
 * SystemHealthBar Component
 * 
 * Renders a fixed 24px telemetry strip directly below the main navigation bar.
 * Provides real-time stats on backend API availability, active data ingestion mode,
 * current dataset file name, upload latency, rendering FPS tier, and system event logs.
 * 
 * @component
 * @returns {React.ReactElement}
 */
export default function SystemHealthBar() {
  const {
    dataMode,
    uploadedFileName,
    uploadLatencyMs,
    isConsoleOpen,
    setIsConsoleOpen,
    systemLogs,
  } = useRetailData();

  const tier = usePerformanceTier();
  const [isCoreOnline, setIsCoreOnline] = useState(true);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  // Map performance quality tier to target FPS
  const fpsMap = { high: 60, medium: 45, low: 30 };
  const fps = fpsMap[tier] ?? 60;

  // Active polling of backend health status
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${apiBase}/health`, { cache: "no-store" });
        setIsCoreOnline(res.ok);
      } catch (err) {
        setIsCoreOnline(false);
      }
    };
    
    checkHealth();
    const timer = setInterval(checkHealth, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="system-health-bar" aria-label="System telemetry feed">
        <div className="shb-group">
          {/* Core Status indicator */}
          <div className="shb-item" aria-live="polite">
            <div className={`shb-status-dot ${isCoreOnline ? "online" : "offline"}`} />
            <span style={{ fontWeight: 800 }}>
              CORE {isCoreOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>

          <span style={{ opacity: 0.15 }}>|</span>

          {/* Ingestion Mode */}
          <div className="shb-item">
            <span className="shb-label">MODE:</span>
            <div style={{ position: "relative", display: "inline-flex", width: "40px", height: "14px", alignItems: "center" }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={dataMode}
                  className={`shb-val ${dataMode}`}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  style={{ position: "absolute" }}
                >
                  {dataMode.toUpperCase()}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <span style={{ opacity: 0.15 }}>|</span>

          {/* Dataset Filename */}
          <div className="shb-item" style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <span className="shb-label">DATASET:</span>
            <span className="shb-val" style={{ opacity: 0.8 }}>
              {dataMode === "live" ? uploadedFileName : "SYNTHETIC_STREAM"}
            </span>
          </div>
        </div>

        <div className="shb-group">
          {/* Latency */}
          <div className="shb-item">
            <span className="shb-label">LATENCY:</span>
            <span className="shb-val">
              {uploadLatencyMs !== null ? `${uploadLatencyMs}ms` : "N/A"}
            </span>
          </div>

          <span style={{ opacity: 0.15 }}>|</span>

          {/* Render FPS */}
          <div className="shb-item">
            <span className="shb-label">FPS:</span>
            <span className="shb-val">{fps}</span>
          </div>

          <span style={{ opacity: 0.15 }}>|</span>

          {/* Console trigger button */}
          <button
            onClick={() => setIsConsoleOpen((prev) => !prev)}
            aria-label="Toggle System Console Log Viewer"
            aria-expanded={isConsoleOpen}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: isConsoleOpen ? "var(--color-cyan)" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              padding: 0,
              transition: "color 0.2s",
              outline: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-cyan)")}
            onMouseLeave={(e) => {
              if (!isConsoleOpen) e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <Terminal size={12} />
          </button>
        </div>
      </div>

      {/* Floating System Log Viewer overlay */}
      <AnimatePresence>
        {isConsoleOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: "96px",
              right: "24px",
              width: "340px",
              background: "rgba(6, 7, 20, 0.88)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "var(--shadow-cinema)",
              zIndex: 198,
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              color: "var(--text-secondary)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
            role="dialog"
            aria-label="System Log Viewer"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "6px" }}>
              <span style={{ fontWeight: 800, color: "var(--color-cyan)", letterSpacing: "0.15em" }}>
                TELEMETRY CONSOLE
              </span>
              <button
                onClick={() => setIsConsoleOpen(false)}
                aria-label="Close Log Viewer"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: 0,
                  display: "grid",
                  placeItems: "center",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <X size={10} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }} aria-live="polite">
              {systemLogs.map((log) => (
                <div key={log.id} style={{ display: "flex", gap: "8px", lineHeight: 1.4 }}>
                  <span style={{ color: "var(--color-violet)", opacity: 0.8 }}>[{log.timestamp}]</span>
                  <span style={{ flex: 1, color: "var(--text-primary)" }}>{log.message}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
