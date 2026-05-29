"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { TrendingUp, Activity, Zap, Target, Calendar } from "lucide-react";
import { useRetailData } from "@/lib/retailContext";

// ─── Orbital Timeline ─────────────────────────────────────────────────────────
const PERIODS = [
  { days: 7,  label: "7D",  angle: -60,  color: "#8b5cf6" },
  { days: 14, label: "14D", angle: 0,    color: "#22d3ee" },
  { days: 30, label: "30D", angle: 60,   color: "#f59e0b" },
];

function OrbitalTimeline({ period, onSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="orbital-timeline" aria-label="Forecast period selector">
      <div className="orbital-ring-track">
        <div className="orbital-ring" />
        <div className="orbital-ring outer" />

        {PERIODS.map(({ days, label, angle, color }) => {
          const rad = (angle * Math.PI) / 180;
          const r = 88;
          const x = 50 + Math.sin(rad) * r;
          const y = 50 - Math.cos(rad) * r;
          const isActive = period === days;

          return (
            <motion.button
              key={days}
              className={`orbital-node ${isActive ? "active" : ""}`}
              style={{ left: `${x}%`, top: `${y}%`, "--node-color": color }}
              onClick={() => onSelect(days)}
              onMouseEnter={() => setHovered(days)}
              onMouseLeave={() => setHovered(null)}
              animate={{
                scale: isActive ? 1.3 : hovered === days ? 1.12 : 1,
                boxShadow: isActive
                  ? `0 0 28px ${color}cc, 0 0 56px ${color}44`
                  : `0 0 10px ${color}33`,
                borderColor: isActive ? color : "rgba(255,255,255,0.15)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              aria-pressed={isActive}
              aria-label={`Forecast ${label}`}
            >
              <span className="orbital-node-label">{label}</span>
              {isActive && (
                <motion.div
                  className="orbital-pulse"
                  animate={{ scale: [1, 2.4, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  style={{ borderColor: color }}
                />
              )}
            </motion.button>
          );
        })}

        {/* Center orb */}
        <div className="orbital-center">
          <motion.div
            className="orbital-center-core"
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          />
          <div className="orbital-center-label">
            <Calendar size={12} />
            <span>{period}D</span>
          </div>
        </div>
      </div>
      <p className="orbital-hint">Navigate future timelines</p>
    </div>
  );
}

// ─── Glow Tooltip ─────────────────────────────────────────────────────────────
function GlowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="glow-tooltip">
      <p className="glow-tooltip-date">{label}</p>
      <p className="glow-tooltip-value">₹{val?.toLocaleString("en-IN") ?? "—"}</p>
      {payload[1] && (
        <p className="glow-tooltip-band">
          Band: ₹{payload[1]?.value?.toLocaleString("en-IN")}–₹{payload[2]?.value?.toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}

// ─── Kinetic Stat ─────────────────────────────────────────────────────────────
function KineticStat({ label, value, icon: Icon, accent }) {
  const [displayed, setDisplayed] = useState(0);
  const target = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;

  useEffect(() => {
    let frame;
    let start = null;
    const duration = 1600;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(target * ease);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  const formatted =
    displayed >= 1e6 ? `₹${(displayed / 1e6).toFixed(2)}M` :
    displayed >= 1e3 ? `₹${(displayed / 1e3).toFixed(1)}K` :
    `₹${displayed.toFixed(0)}`;

  return (
    <motion.div
      className="kinetic-stat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="kinetic-icon" style={{ "--accent": accent }}>
        <Icon size={17} />
      </div>
      <div>
        <div className="kinetic-number" style={{ "--accent": accent }}>{formatted}</div>
        <div className="kinetic-label">{label}</div>
      </div>
    </motion.div>
  );
}

// ─── Forecast Chart ───────────────────────────────────────────────────────────
function ForecastChart({ data, period, onPointClick }) {
  const sliced = useMemo(() => (data ?? []).slice(0, period), [data, period]);
  const formatted = useMemo(
    () => sliced.map((d) => ({
      date: d.date?.slice(5) ?? d.date,
      value: d.predicted_revenue ?? 0,
      lower: d.lower_bound ?? 0,
      upper: d.upper_bound ?? 0,
    })),
    [sliced]
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={period}
        className="forecast-chart-wrap"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart
            data={formatted}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            onClick={(e) => {
              if (onPointClick && e && e.activePayload && e.activePayload.length > 0) {
                const point = e.activePayload[0].payload;
                onPointClick(point.date, point.value);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <defs>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.38} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e879f9" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#e879f9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#73839b", fontSize: 11 }} axisLine={false} tickLine={false}
              interval={Math.ceil(formatted.length / 6)} />
            <YAxis tick={{ fill: "#73839b", fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} width={52} />
            <Tooltip content={<GlowTooltip />} />
            <Area type="monotone" dataKey="upper" stroke="none" fill="url(#bandGrad)" legendType="none" />
            <Area type="monotone" dataKey="lower" stroke="none" fill="transparent" legendType="none" />
            <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2.5}
              fill="url(#forecastGrad)" dot={false}
              activeDot={{ r: 5, fill: "#22d3ee", stroke: "#fff", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Historical Chart ─────────────────────────────────────────────────────────
function HistoricalChart({ data, onPointClick }) {
  const formatted = useMemo(
    () => (data ?? []).slice(-60).map((d) => ({
      date: d.date?.slice(5) ?? d.date,
      value: d.revenue ?? 0,
    })),
    [data]
  );

  return (
    <div className="forecast-chart-wrap historical">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart
          data={formatted}
          margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
          onClick={(e) => {
            if (onPointClick && e && e.activePayload && e.activePayload.length > 0) {
              const point = e.activePayload[0].payload;
              onPointClick(point.date, point.value);
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <defs>
            <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e879f9" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#e879f9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "#73839b", fontSize: 10 }} axisLine={false} tickLine={false}
            interval={Math.ceil(formatted.length / 5)} />
          <YAxis tick={{ fill: "#73839b", fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} width={44} />
          <Tooltip content={<GlowTooltip />} />
          <Area type="monotone" dataKey="value" stroke="#e879f9" strokeWidth={2} fill="url(#histGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div className="forecast-empty"
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
      <div className="forecast-empty-orb"><Activity size={32} /></div>
      <h3 className="forecast-empty-title">No dataset loaded</h3>
      <p className="forecast-empty-body">
        Upload a retail CSV to activate the temporal intelligence engine.
      </p>
      <a className="cinema-button primary" href="/experience/dataset" id="forecast-upload-cta">
        <Zap size={14} /> Upload Dataset
      </a>
    </motion.div>
  );
}

// ─── Main Scene ───────────────────────────────────────────────────────────────
export function ForecastScene() {
  const { reportData, forecastPeriod, setForecastPeriod, triggerDrilldown } = useRetailData();
  const metrics   = reportData?.metrics;
  const timeline  = reportData?.timeline_series;
  const historical = reportData?.daily_series;

  return (
    <section className="forecast-scene" id="forecast" aria-label="Temporal Intelligence — Forecast">
      {/* Atmosphere background per period */}
      <div className="forecast-bg" aria-hidden="true">
        <AnimatePresence mode="wait">
          <motion.div
            key={forecastPeriod}
            className={`forecast-atmosphere atm-${forecastPeriod}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            style={{ position: "absolute", inset: "-20%", borderRadius: "50%", filter: "blur(100px)" }}
          />
        </AnimatePresence>
      </div>

      {/* Header */}
      <motion.div className="forecast-header"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
        <p className="scene-kicker"><Activity size={14} />TEMPORAL INTELLIGENCE ENGINE</p>
        <h2 className="forecast-title">
          <span>Navigate</span>
          <span className="gradient-text">Future Timelines</span>
        </h2>
      </motion.div>

      {!reportData ? (
        <EmptyState />
      ) : (
        <div className="forecast-layout">
          {/* Left: orbital + stats */}
          <div className="forecast-left">
            <OrbitalTimeline period={forecastPeriod} onSelect={setForecastPeriod} />

            <div className="kinetic-stats-grid">
              <KineticStat label="Projected Revenue" value={metrics?.projected_monthly_revenue}
                icon={TrendingUp} accent="#22d3ee" />
              <KineticStat label="Peak Day Signal" value={metrics?.peak_day_forecast}
                icon={Target} accent="#e879f9" />
              <KineticStat label="Current Revenue" value={metrics?.current_revenue}
                icon={Activity} accent="#34d399" />
            </div>

            {metrics?.revenue_change_percent != null && (
              <motion.div
                className={`revenue-delta ${metrics.revenue_change_percent >= 0 ? "positive" : "negative"}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              >
                <TrendingUp size={13} />
                {metrics.revenue_change_percent >= 0 ? "+" : ""}{metrics.revenue_change_percent}%
                <span>vs prior period</span>
              </motion.div>
            )}
          </div>

          {/* Right: charts */}
          <div className="forecast-right">
            <div className="chart-section">
              <div className="chart-section-header">
                <span className="chart-label">AI Demand Forecast — {forecastPeriod} Days</span>
                <span className="chart-badge"><Zap size={10} />Neural Engine</span>
              </div>
              <ForecastChart data={timeline} period={forecastPeriod} onPointClick={triggerDrilldown} />
            </div>

            {historical?.length > 0 && (
              <div className="chart-section secondary">
                <div className="chart-section-header">
                  <span className="chart-label">Historical Revenue Signal</span>
                  <span className="chart-badge fuchsia"><Activity size={10} />Actual</span>
                </div>
                <HistoricalChart data={historical} onPointClick={triggerDrilldown} />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
