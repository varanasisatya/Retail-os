"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_LINES = [
  { text: "INITIALIZING RETAILOS AI OPERATING SYSTEM v4.1.0...", delay: 200 },
  { text: "LOADING NEURAL FORECAST ENGINE...", delay: 700 },
  { text: "CALIBRATING DEMAND SIGNAL NETWORKS...", delay: 1300 },
  { text: "CONNECTING TEMPORAL INTELLIGENCE LAYERS...", delay: 1900 },
  { text: "SCANNING RETAIL INTELLIGENCE CORPUS...", delay: 2500 },
  { text: "MOUNTING PREDICTIVE ANALYTICS CORE...", delay: 3100 },
  { text: "SYNCHRONIZING REGIONAL DATA STREAMS...", delay: 3600 },
  { text: "SYSTEM READY. ENTERING INTELLIGENCE ENVIRONMENT.", delay: 4200, ready: true },
];

export function BootSequence({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const [wiping, setWiping] = useState(false);
  const [done, setDone] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    // Check session — only show once per session
    if (typeof window !== "undefined") {
      const booted = sessionStorage.getItem("ros_booted");
      if (booted) {
        onComplete();
        return;
      }
    }

    // Schedule each line to appear
    const timers = BOOT_LINES.map(({ delay }, i) =>
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, i]);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
      }, delay)
    );

    // Trigger wipe after last line
    const wipeTimer = setTimeout(() => {
      setWiping(true);
    }, 5000);

    // Complete boot
    const doneTimer = setTimeout(() => {
      setDone(true);
      sessionStorage.setItem("ros_booted", "1");
      onComplete();
    }, 5700);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(wipeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (done) return null;

  return (
    <AnimatePresence>
      {!done && (
        <>
          {/* Main boot overlay */}
          <motion.div
            className="boot-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="boot-scanline" />

            <div className="boot-logo">RETAILOS.AI // BOOT SEQUENCE</div>

            {/* Terminal lines */}
            <div className="boot-terminal">
              {BOOT_LINES.map(({ text, ready }, i) => (
                <div
                  key={i}
                  className={`boot-line ${visibleLines.includes(i) ? "visible" : ""} ${ready ? "ready" : ""}`}
                >
                  <span className="boot-line-prefix">
                    {ready ? "✓" : `[${String(i).padStart(2, "0")}]`}
                  </span>
                  {visibleLines.includes(i) ? (
                    <TypewriterText text={text} speed={28} />
                  ) : null}
                  {i === visibleLines[visibleLines.length - 1] && !ready && (
                    <span className="boot-cursor" />
                  )}
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="boot-progress-wrap">
              <div className="boot-progress-label">SYSTEM INITIALIZATION — {progress}%</div>
              <div className="boot-progress-track">
                <div
                  className="boot-progress-beam"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* Wipe panels */}
          {wiping && (
            <>
              <motion.div
                className="boot-wipe-left"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.div
                className="boot-wipe-right"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              />
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

function TypewriterText({ text, speed = 30 }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, ++i));
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayed}</span>;
}
