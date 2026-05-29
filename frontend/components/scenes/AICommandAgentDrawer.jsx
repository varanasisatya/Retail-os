"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Brain, X, Send, MessageSquare, Database, Zap } from "lucide-react";
import { useRetailData } from "@/lib/retailContext";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * TypewriterMessage Component
 *
 * Renders text letter-by-letter to emulate a live system terminal printing logs.
 * Preserves structural width/height to avoid layout shifting.
 *
 * @component
 * @param {Object}   props
 * @param {string}   props.text       - The formatted string (supports **bold** markers).
 * @param {number}   [props.speed=10] - Typing interval in milliseconds per character.
 * @param {Function} [props.onComplete] - Callback fired when typing completes.
 * @returns {React.ReactElement}
 */
function TypewriterMessage({ text, speed = 10, onComplete }) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayed("");
    setIsDone(false);

    const timer = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(timer);
        setIsDone(true);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  const parts = displayed.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span style={{ display: "inline-block" }}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
      {!isDone && (
        <span
          className="boot-cursor"
          style={{
            width: "4px",
            height: "1.1em",
            background: "var(--color-violet)",
            display: "inline-block",
            marginLeft: "2px",
          }}
        />
      )}
    </span>
  );
}

TypewriterMessage.propTypes = {
  text: PropTypes.string.isRequired,
  speed: PropTypes.number,
  onComplete: PropTypes.func,
};

/**
 * AgentThinkingPulse Component
 *
 * Displays a subtle glowing pulse animation while the AI is processing.
 *
 * @component
 * @returns {React.ReactElement}
 */
function AgentThinkingPulse() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 18px", alignSelf: "flex-start" }}>
      <motion.div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--color-violet)",
          boxShadow: "0 0 10px var(--color-violet)",
        }}
        animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          color: "var(--color-violet)",
          letterSpacing: "0.08em",
          fontWeight: 700,
        }}
      >
        DECRYPTING PROMPT...
      </span>
    </div>
  );
}

// ─── Core response engine ───────────────────────────────────────────────────────

/**
 * Resolves a user command string into an agent response.
 * Handles slash commands and routes natural language against live or demo data.
 *
 * @param {string}      cmd        - Normalised (lowercased) user input string.
 * @param {string}      rawCmd     - Original user input string for display in responses.
 * @param {boolean}     isLive     - Whether real reportData is available.
 * @param {Object|null} reportData - The processed analytics payload from the server.
 * @returns {string} Formatted response string (supports **bold** markers).
 */
function resolveCommand(cmd, rawCmd, isLive, reportData) {
  // ── Slash commands ──────────────────────────────────────────────────────────
  if (cmd.includes("/help")) {
    return (
      "Core operational commands:\n" +
      "- **/status** — Query neural core and ingestion metadata.\n" +
      "- **/metrics** — Top-performing categories and revenue splits.\n" +
      "- **/forecast** — 30-day peak revenue projection.\n" +
      "- **/inventory** — Inventory health and reorder signals.\n" +
      "- **/insights** — AI-generated strategic recommendations.\n" +
      "- **/clear** — Flush message stream."
    );
  }

  if (cmd.includes("/status")) {
    return isLive
      ? "System status: **LIVE INGESTION ACTIVE**. Decryption channel synchronized with uploaded schema data. Latency: **42ms**. Neural engine operating at **60 FPS**."
      : "System status: **DEMO INTELLIGENCE MODE**. Running on synthetic commerce signals. Upload a CSV inside the Dataset Core to activate live sync.";
  }

  if (cmd.includes("/metrics")) {
    if (isLive) {
      const top = reportData?.category_breakdown?.[0];
      const totalRev = reportData?.metrics?.total_revenue;
      const topLine = top
        ? `Category **${top.name}** leads with **₹${(top.revenue / 1000).toFixed(1)}K** total revenue.`
        : "Category breakdown data not available.";
      const revLine = totalRev
        ? ` Total portfolio revenue: **₹${Number(totalRev).toLocaleString("en-IN")}**.`
        : "";
      return `Telemetry match: ${topLine}${revLine}`;
    }
    return "Operational metrics (Synthetic): Category **Electronics** leads weekend surge velocity at **1.8× average threshold**. Demo mode — upload a dataset for live figures.";
  }

  if (cmd.includes("/forecast")) {
    if (isLive) {
      const peak = reportData?.metrics?.peak_day_forecast;
      const topCat = reportData?.metrics?.top_category;
      const forecastLine = peak
        ? `Peak day revenue forecast: **₹${Number(peak).toLocaleString("en-IN")}** ±6% standard deviation.`
        : "Forecast data not yet available in payload.";
      const catLine = topCat ? ` Demand anchor: **${topCat}** category.` : "";
      return `Neural forecast model: ${forecastLine}${catLine}`;
    }
    return "Forecast (Synthetic): Peak revenue target **₹2.4M** projected on Saturday with Electronics surge multiplier. Upload a dataset for live projections.";
  }

  if (cmd.includes("/inventory")) {
    if (isLive) {
      const recs = reportData?.recommendations ?? [];
      const invRec = recs.find((r) => /inventory|stock|reorder/i.test(r.title ?? r.detail ?? ""));
      return invRec
        ? `Inventory signal: **${invRec.title}** — ${invRec.detail}`
        : "No critical inventory flags detected in current dataset. Stock levels within modelled thresholds.";
    }
    return "Inventory (Synthetic): Safety stock buffer insufficient for projected 30-day demand surge in **Home & Kitchen**. Upload a dataset to run real diagnostics.";
  }

  if (cmd.includes("/insights")) {
    if (isLive) {
      const recs = reportData?.recommendations ?? [];
      if (recs.length === 0) return "No AI recommendations generated. Dataset may require additional signal depth.";
      const top = recs[0];
      const second = recs[1];
      let response = `**Primary insight:** ${top.title} — ${top.detail}`;
      if (second) response += `\n**Secondary insight:** ${second.title} — ${second.detail}`;
      return response;
    }
    return "Insights (Synthetic): Viral product signal emerging — TrendNet score exceeds alert threshold in Electronics. Upload a CSV to unlock real AI recommendations.";
  }

  // ── Natural language query routing ─────────────────────────────────────────
  if (cmd.includes("revenue") || cmd.includes("sales") || cmd.includes("money")) {
    if (isLive && reportData?.metrics?.total_revenue) {
      return `Live revenue telemetry: Total ingested revenue signal is **₹${Number(reportData.metrics.total_revenue).toLocaleString("en-IN")}**. Run **/forecast** for 30-day projection.`;
    }
    return "Revenue data requires a live dataset. Upload a CSV and ask again — the neural engine will surface exact figures.";
  }

  if (cmd.includes("category") || cmd.includes("segment") || cmd.includes("product")) {
    if (isLive && reportData?.category_breakdown?.length) {
      const cats = reportData.category_breakdown
        .slice(0, 3)
        .map((c) => `**${c.name}** (₹${(c.revenue / 1000).toFixed(1)}K)`)
        .join(", ");
      return `Top category signals: ${cats}. Full breakdown available via **/metrics**.`;
    }
    return "Category breakdown unavailable in demo mode. Ingest a dataset to activate category intelligence.";
  }

  if (cmd.includes("recommend") || cmd.includes("suggest") || cmd.includes("action") || cmd.includes("what should")) {
    if (isLive) {
      const recs = reportData?.recommendations ?? [];
      if (recs.length) return `Neural recommendation: **${recs[0].title}** — ${recs[0].detail}. Type **/insights** for the full intelligence report.`;
    }
    return "Recommendations require live data. Type **/insights** after uploading a dataset to receive AI-generated strategic actions.";
  }

  if (cmd.includes("mode") || cmd.includes("live") || cmd.includes("demo") || cmd.includes("status")) {
    return isLive
      ? "Current operating mode: **LIVE INTELLIGENCE**. Neural engine is synchronized with your uploaded dataset. All commands now query real retail signals."
      : "Current operating mode: **DEMO INTELLIGENCE**. Agent is running on synthetic commerce signals. Upload a CSV in the Dataset Core to activate live sync.";
  }

  // ── Default fallback ────────────────────────────────────────────────────────
  return `Command unrecognized: "${rawCmd}". The agent intercepted your input but found no mapped signal route. Type **/help** to list available commands.`;
}

// ─── Main Component ─────────────────────────────────────────────────────────────

/**
 * AICommandAgentDrawer Component
 *
 * Fixed drawer overlay that slides in from the right edge. Acts as a terminal
 * console where users can submit slash commands (e.g., /metrics, /forecast) or
 * natural language queries to interrogate live ingestion datasets.
 *
 * Operates in two modes:
 * - **Demo Mode** (`dataMode === 'demo'`): responses use synthetic intelligence signals.
 * - **Live Mode** (`dataMode === 'live'`): responses query real `reportData` from context.
 *
 * Mode transitions are detected via the `activatedAt` timestamp from `RetailDataContext`.
 * When a new activation is detected, a system message is automatically injected
 * announcing the handshake — no user action required.
 *
 * @component
 * @returns {React.ReactElement}
 */
export default function AICommandAgentDrawer() {
  const {
    reportData,
    dataMode,
    activatedAt,
    uploadedFileName,
    isDrawerOpen,
    setIsDrawerOpen,
    drilldownData,
    setIsConsoleOpen,
  } = useRetailData();

  const open = isDrawerOpen;
  const setOpen = setIsDrawerOpen;

  const [inputVal, setInputVal] = useState("");
  const [thinking, setThinking] = useState(false);
  const isLive = dataMode === "live";

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "assistant",
      text: "RetailOS AI **Command Core** active. Running on synthetic intelligence signals. Upload a CSV in the **Dataset Core** to switch to live mode. Type **/help** to list commands.",
    },
  ]);

  const messagesEndRef = useRef(null);
  /** Track the last activatedAt value to detect mode transitions. */
  const prevActivatedAt = useRef(null);
  const prevDrilldown = useRef(null);

  // Keyboard navigation
  useKeyboardShortcuts({
    onToggleDrawer: () => setOpen((o) => !o),
    onCloseAll: () => {
      setOpen(false);
      setIsConsoleOpen(false);
    },
  });

  // Drilldown analysis reactive responder
  useEffect(() => {
    if (!drilldownData || drilldownData === prevDrilldown.current) return;
    prevDrilldown.current = drilldownData;

    const formattedVal = typeof drilldownData.value === "number"
      ? `₹${Number(drilldownData.value.toFixed(0)).toLocaleString("en-IN")}`
      : drilldownData.value;

    const drilldownMsg = {
      id: `msg-${Date.now()}-drilldown`,
      sender: "assistant",
      text: `📊 **DRILLDOWN ANALYSIS :: ${drilldownData.date}**\nIngested revenue projection for this cycle: **${formattedVal}**.\n\n` +
            `*Modelled Category distribution*:\n` +
            `- **Electronics**: 42% (high confidence)\n` +
            `- **Apparel**: 28%\n` +
            `- **Home & Kitchen**: 18%\n` +
            `- **Other**: 12%\n\n` +
            `*Signal diagnosis*: Forecast sequence matches a high-probability demand wave. Stock replenishment recommendation stands at **+15%** safety margin.`,
    };

    setMessages((prev) => [...prev, drilldownMsg]);
  }, [drilldownData]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  /**
   * Reactive Live Mode handshake.
   * When `activatedAt` changes from null to a timestamp, the system injects
   * an automated announcement — the drawer becomes "aware" of the data upload
   * without the user having to ask.
   */
  useEffect(() => {
    if (!activatedAt || activatedAt === prevActivatedAt.current) return;
    prevActivatedAt.current = activatedAt;

    // Inject the system announcement message
    const filename = uploadedFileName ? ` Source: **${uploadedFileName}**.` : "";
    const topCategory = reportData?.metrics?.top_category;
    const revenue = reportData?.metrics?.total_revenue;

    let liveMsg = `⚡ **LIVE INGESTION ACTIVATED.**${filename} Neural engine has synchronized with your dataset.`;
    if (topCategory) liveMsg += ` Top demand signal: **${topCategory}**.`;
    if (revenue) liveMsg += ` Ingested revenue volume: **₹${Number(revenue).toLocaleString("en-IN")}**.`;
    liveMsg += " All commands now query live retail intelligence. Type **/insights** for AI recommendations.";

    const systemMsg = {
      id: `msg-${Date.now()}-system`,
      sender: "assistant",
      text: liveMsg,
      isSystem: true,
    };

    setMessages((prev) => [...prev, systemMsg]);

    // Open the drawer so the user sees the handshake
    setOpen(true);
  }, [activatedAt, uploadedFileName, reportData]);

  /**
   * Primary command submission handler.
   * Routes input through `resolveCommand` and appends the response to the message thread.
   *
   * @param {React.FormEvent} [e] - Form submission event
   */
  const handleSend = useCallback(
    (e) => {
      if (e) e.preventDefault();
      if (!inputVal.trim() || thinking) return;

      const userText = inputVal.trim();
      setInputVal("");

      const userMsg = { id: `msg-${Date.now()}-user`, sender: "user", text: userText };
      setMessages((prev) => [...prev, userMsg]);
      setThinking(true);

      setTimeout(() => {
        const lowerCmd = userText.toLowerCase();

        // /clear is handled directly (no response message)
        if (lowerCmd.includes("/clear")) {
          setMessages([{ id: `msg-${Date.now()}-system`, sender: "assistant", text: "Message stream cleared. Core operational." }]);
          setThinking(false);
          return;
        }

        const responseText = resolveCommand(lowerCmd, userText, isLive, reportData);
        const assistantMsg = { id: `msg-${Date.now()}-assistant`, sender: "assistant", text: responseText };
        setMessages((prev) => [...prev, assistantMsg]);
        setThinking(false);
      }, 1100);
    },
    [inputVal, thinking, isLive, reportData]
  );

  return (
    <>
      {/* Floating trigger handle */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle AI Command Agent Drawer"
        aria-expanded={open}
        style={{
          position: "fixed",
          bottom: "96px",
          right: "32px",
          zIndex: 300,
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "rgba(2, 4, 11, 0.9)",
          border: open
            ? "1px solid var(--color-violet)"
            : isLive
            ? "1px solid rgba(34, 211, 238, 0.45)"
            : "1px solid rgba(139, 92, 246, 0.35)",
          boxShadow: open
            ? "0 0 30px rgba(139, 92, 246, 0.4)"
            : isLive
            ? "0 0 24px rgba(34, 211, 238, 0.25)"
            : "0 0 24px rgba(139, 92, 246, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: isLive ? "var(--color-cyan)" : "var(--color-violet)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transition: "border-color 0.4s ease 0.2s, box-shadow 0.4s ease 0.2s, color 0.3s ease 0.2s",
        }}
        whileTap={{ scale: 0.92 }}
        id="ai-agent-drawer-btn"
      >
        {/* Pulse ring when closed */}
        {!open && (
          <motion.div
            style={{
              position: "absolute",
              inset: "-4px",
              borderRadius: "50%",
              border: isLive
                ? "1px solid rgba(34, 211, 238, 0.25)"
                : "1px solid rgba(139, 92, 246, 0.2)",
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
        {open ? <X size={18} /> : <MessageSquare size={18} />}
      </motion.button>

      {/* Slide-out glassmorphic drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            style={{
              position: "fixed",
              top: "88px",
              right: 0,
              bottom: 0,
              width: "min(400px, 90vw)",
              background: "rgba(2, 4, 11, 0.85)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "var(--shadow-cinema)",
              zIndex: 199,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            role="dialog"
            aria-label="AI Command Agent Drawer"
          >
            {/* ── Header ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Brain size={14} style={{ color: isLive ? "var(--color-cyan)" : "var(--color-violet)" }} />
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 900,
                      color: isLive ? "var(--color-cyan)" : "var(--color-violet)",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      transition: "color 0.4s",
                    }}
                  >
                    AI Command Agent
                  </span>
                </div>

                {/* Mode indicator */}
                <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                  {isLive && (
                    <motion.div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "var(--color-mint)",
                        boxShadow: "0 0 6px var(--color-mint)",
                      }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <div style={{ position: "relative", height: "14px", display: "inline-flex", alignItems: "center" }}>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={isLive ? "live" : "demo"}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "0.58rem",
                          fontWeight: 900,
                          letterSpacing: "0.12em",
                          color: isLive ? "var(--color-mint)" : "var(--color-amber)",
                          textTransform: "uppercase",
                          position: "absolute",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {isLive ? (
                          <>
                            <Database size={8} />
                            LIVE INGESTION
                          </>
                        ) : (
                          <>
                            <Zap size={8} />
                            DEMO INTELLIGENCE MODE
                          </>
                        )}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                aria-label="Close Drawer"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <X size={12} />
              </button>
            </div>

            {/* ── Message area ── */}
            <div
              className="terminal-scroll"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              {messages.map((msg) => {
                const isAssistant = msg.sender === "assistant";
                const isSystemMsg = !!msg.isSystem;
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", alignItems: isAssistant ? "flex-start" : "flex-end" }}>
                    {isSystemMsg && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", margin: "8px 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.58rem", fontFamily: "var(--font-mono)", color: "var(--color-cyan)", opacity: 0.6, letterSpacing: "0.15em" }}>
                          <span>SYS :: LIVE_MODE_ACTIVATED</span>
                          <span>{new Date().toISOString().slice(11, 19)} UTC</span>
                        </div>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          style={{
                            height: "1px",
                            background: "linear-gradient(90deg, var(--color-cyan) 0%, rgba(34,211,238,0.2) 70%, transparent 100%)",
                            transformOrigin: "left",
                          }}
                        />
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        alignSelf: isAssistant ? "flex-start" : "flex-end",
                        maxWidth: "85%",
                        padding: "12px 16px",
                        background: isSystemMsg
                          ? "rgba(34, 211, 238, 0.05)"
                          : isAssistant
                          ? "rgba(255, 255, 255, 0.015)"
                          : "rgba(139, 92, 246, 0.08)",
                        border: isSystemMsg
                          ? "1px solid rgba(34, 211, 238, 0.2)"
                          : isAssistant
                          ? "1px solid rgba(255, 255, 255, 0.05)"
                          : "1px solid rgba(139, 92, 246, 0.25)",
                        borderRadius: "12px",
                        borderTopLeftRadius: isAssistant ? "2px" : "12px",
                        borderTopRightRadius: isAssistant ? "12px" : "2px",
                        color: isSystemMsg
                          ? "var(--color-cyan)"
                          : isAssistant
                          ? "var(--text-secondary)"
                          : "var(--text-primary)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                        lineHeight: "1.6",
                        boxShadow: isSystemMsg
                          ? "0 0 20px rgba(34, 211, 238, 0.06)"
                          : isAssistant
                          ? "none"
                          : "0 0 15px rgba(139, 92, 246, 0.08)",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {isAssistant ? (
                        <TypewriterMessage text={msg.text} />
                      ) : (
                        <span>{msg.text}</span>
                      )}
                    </motion.div>
                  </div>
                );
              })}

              {thinking && <AgentThinkingPulse />}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Input form ── */}
            <form
              onSubmit={handleSend}
              style={{
                padding: "16px 20px",
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                background: "rgba(0, 0, 0, 0.15)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={isLive ? "Query live data..." : "Enter command or question..."}
                style={{
                  flex: 1,
                  background: "rgba(2, 4, 11, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.78rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = isLive
                    ? "rgba(34, 211, 238, 0.4)"
                    : "rgba(139, 92, 246, 0.4)")
                }
                onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.08)")}
                disabled={thinking}
                id="ai-drawer-input"
              />
              <button
                type="submit"
                className="cinema-button"
                aria-label="Submit query"
                style={{
                  background: isLive ? "var(--color-cyan)" : "var(--color-violet)",
                  color: "var(--color-void)",
                  borderColor: "transparent",
                  boxShadow: isLive
                    ? "0 0 20px rgba(34, 211, 238, 0.35)"
                    : "0 0 20px rgba(139, 92, 246, 0.45)",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.4s, box-shadow 0.4s",
                }}
                disabled={thinking}
              >
                <Send size={12} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
