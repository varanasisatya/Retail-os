"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ArrowRight, Activity, TrendingUp, Zap, BarChart3 } from "lucide-react";

// Lazy-load Three.js canvas — SSR must be disabled
const NeuralUniverse = dynamic(
  () => import("./NeuralUniverse").then((m) => ({ default: m.NeuralUniverse })),
  { ssr: false, loading: () => <div className="neural-universe-loading" /> }
);

// Floating ambient intelligence words
const FLOAT_WORDS = [
  { text: "FORECAST INTELLIGENCE", x: "-42vw", y: "-28vh" },
  { text: "NEURAL COMMERCE",       x:  "36vw",  y: "-32vh" },
  { text: "DEMAND SIGNALS",        x: "-44vw",  y:  "18vh" },
  { text: "RETAIL PULSE",          x:  "40vw",  y:  "22vh" },
  { text: "PREDICTIVE ENGINE",     x: "-18vw",  y: "-42vh" },
  { text: "INVENTORY INTELLIGENCE",x:  "14vw",  y:  "38vh" },
  { text: "TEMPORAL ANALYTICS",    x: "-36vw",  y:  "36vh" },
  { text: "MARKET SIGNALS",        x:  "42vw",  y: "-10vh" },
];

const STATS = [
  { value: "98.4%", label: "Forecast Accuracy", icon: TrendingUp },
  { value: "< 2s",  label: "AI Response Time",  icon: Zap         },
  { value: "30D",   label: "Forecast Horizon",  icon: Activity    },
  { value: "∞",     label: "Data Signals",      icon: BarChart3   },
];

/**
 * LiveCounter Component
 * 
 * Renders a mock streaming signal counter that increments periodically on screen
 * to convey a real-time signal processing engine.
 * 
 * @component
 * @returns {React.ReactElement}
 */
function LiveCounter() {
  const [count, setCount] = useState(18472091);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 7 + 2));
    }, 800);
    return () => clearInterval(t);
  }, []);

  // Render static placeholder during SSR to prevent hydration mismatch
  const displayCount = mounted ? count.toLocaleString() : "18,472,091";

  return (
    <div className="hero-live-counter">
      <div className="hero-live-dot" />
      <span>
        <span className="hero-counter-num">{displayCount}</span>
        &nbsp;signals processed
      </span>
    </div>
  );
}

/**
 * FloatingWord Component
 * 
 * Floating holographic word tags situated in 3D coordinate space around
 * the neural network nodes.
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.word - Word tag metadata
 * @param {string} props.word.text - Word string text content
 * @param {string} props.x - Horizontal viewport offset mapping
 * @param {string} props.y - Vertical viewport offset mapping
 * @param {number} props.index - Element index for animations delay stagger
 * @returns {React.ReactElement}
 */
function FloatingWord({ word, x, y, index }) {
  return (
    <motion.span
      className="hero-float-word"
      style={{
        position: "absolute",
        left: `calc(50% + ${x})`,
        top:  `calc(50% + ${y})`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0, filter: "blur(8px)" }}
      animate={{
        opacity: [0, 0.38, 0.22, 0.38],
        y: [0, -12, 5, 0],
        filter: ["blur(6px)", "blur(0px)", "blur(2px)", "blur(0px)"],
      }}
      transition={{
        duration: 9 + index * 1.8,
        repeat: Infinity,
        delay: index * 1.1,
        ease: "easeInOut",
      }}
      aria-hidden="true"
    >
      {word.text}
    </motion.span>
  );
}

FloatingWord.propTypes = {
  word: PropTypes.shape({
    text: PropTypes.string.isRequired
  }).isRequired,
  x: PropTypes.string.isRequired,
  y: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired
};

/**
 * HeroScene Component
 * 
 * Cinematic landing layout showcasing full-screen Three.js networks, floating tag clouds,
 * operational statistics widgets, and system enter trigger paths.
 * 
 * @component
 * @returns {React.ReactElement}
 */
export function HeroScene() {
  return (
    <section className="hero-scene" id="hero" aria-label="RetailOS AI — Enter the Intelligence OS">
      {/* Three.js neural universe — background */}
      <NeuralUniverse className="neural-universe-canvas" />

      {/* Ambient layer: glow blobs */}
      <div className="hero-ambient-layer" aria-hidden="true">
        <div className="hero-glow-blob blob-cyan" />
        <div className="hero-glow-blob blob-fuchsia" />
        <div className="hero-glow-blob blob-violet" />
        <div className="hero-scan-grid" />
      </div>

      {/* Floating word cloud */}
      <div className="hero-float-words">
        {FLOAT_WORDS.map((w, i) => (
          <FloatingWord key={w.text} word={w} x={w.x} y={w.y} index={i} />
        ))}
      </div>

      {/* Main content */}
      <div className="hero-content">
        {/* Eyebrow */}
        <motion.div
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Activity size={12} />
          <span>RetailOS AI — Neural Intelligence Operating System</span>
        </motion.div>

        {/* Giant cinematic title */}
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="hero-title-line1">THE FUTURE OF</span>
          <span className="hero-title-line2">RETAIL<br />INTELLIGENCE</span>
        </motion.h1>

        {/* Descriptor */}
        <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          An immersive AI operating system for the future of commerce.
          Neural forecasting, demand intelligence, and inventory signals — unified.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            className="hero-portal-btn"
            href="/experience/dataset"
            id="hero-enter-btn"
          >
            <Zap size={15} />
            Enter System
            <ArrowRight size={15} />
          </Link>
          <Link
            className="hero-cta-secondary"
            href="/experience/forecast"
            id="hero-forecast-cta"
          >
            View Forecast
          </Link>
        </motion.div>

        {/* Live counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.8 }}
        >
          <LiveCounter />
        </motion.div>

        {/* Stats */}
        <motion.div
          className="hero-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <motion.div
              key={label}
              className="hero-stat"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="hero-stat-icon"><Icon size={13} /></div>
              <div className="hero-stat-value">{value}</div>
              <div className="hero-stat-label">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="hero-scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        aria-hidden="true"
      >
        <div className="hero-scroll-track">
          <motion.div
            className="hero-scroll-dot"
            animate={{ y: [0, 28, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <span className="hero-scroll-label">SCROLL</span>
      </motion.div>
    </section>
  );
}
