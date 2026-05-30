"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import {
  Brain, UploadCloud, TrendingUp, MapPin, Package, Zap,
  BarChart3, Layers,
} from "lucide-react";

const FEATURES = [
  { icon: Brain,       title: "Neural Demand Forecasting",  body: "AI engine analyses historical patterns, seasonality, and trend signals to generate 30-day revenue forecasts with confidence bands.", accent: "#22d3ee", tag: "CORE ENGINE" },
  { icon: UploadCloud, title: "CSV Intelligence Ingestion", body: "Drop any retail dataset — CSV or XLSX. The engine auto-detects columns, cleans data, and generates analytics in under 2 seconds.", accent: "#e879f9", tag: "DATA ENGINE" },
  { icon: TrendingUp,  title: "Revenue Trend Analysis",     body: "Compare current vs prior periods. Detect revenue acceleration, margin shifts, and demand momentum with kinetic visualisations.", accent: "#34d399", tag: "ANALYTICS"  },
  { icon: MapPin,      title: "Regional Demand Radar",      body: "Break down sales velocity by region or channel. Spot geographic demand surges, underperforming markets, and rebalancing opportunities.", accent: "#8b5cf6", tag: "REGIONAL INTEL" },
  { icon: Package,     title: "Inventory Signal Engine",    body: "AI detects depletion risk, reorder windows, and safety stock gaps before they become outages — proactive, not reactive.", accent: "#f59e0b", tag: "INVENTORY" },
  { icon: Zap,         title: "Realtime AI Alert Feed",     body: "Live stream of neural signals: demand spikes, price anomalies, category surges, and forecast updates — continuously processed.", accent: "#a5f3fc", tag: "LIVE FEED"  },
  { icon: BarChart3,   title: "Category Intelligence",      body: "Rank categories by revenue, quantity, and margin contribution. Understand your product mix to optimise assortment and allocation.", accent: "#fb7185", tag: "CATEGORY"  },
  { icon: Layers,      title: "Orbital Time Navigation",    body: "Navigate 7-day, 14-day, and 30-day forecast horizons via cinematic orbital controls. Charts morph fluidly — no buttons, no dashboards.", accent: "#c4b5fd", tag: "UX ENGINE" },
];

function FeatureCard({ feature, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = feature.icon;

  return (
    <motion.article
      ref={ref}
      className="platform-feature-card"
      style={{ "--feat-accent": feature.accent }}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: (index % 4) * 0.09, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.28 } }}
    >
      <div className="pf-card-glow" aria-hidden="true" />
      <div className="pf-card-top">
        <div className="pf-icon"><Icon size={18} /></div>
        <span className="pf-tag">{feature.tag}</span>
      </div>
      <h3 className="pf-title">{feature.title}</h3>
      <p className="pf-body">{feature.body}</p>
      <div className="pf-card-border" aria-hidden="true" />
    </motion.article>
  );
}

export function PlatformFeatures() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <section className="platform-features" id="platform-features" aria-label="Platform capabilities">
      <div className="cinema-shell">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="pf-header"
          initial={{ opacity: 0, y: 32 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="scene-kicker"><Brain size={13} />INTELLIGENCE STACK</p>
          <h2 className="pf-heading">
            Built for the{" "}
            <span className="gradient-text" style={{ display: "inline" }}>
              Future of Commerce
            </span>
          </h2>
          <p className="pf-subheading">
            Every capability in RetailOS AI is engineered around one goal —
            making retail intelligence feel effortless, beautiful, and alive.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="pf-grid">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>

        {/* CTA strip */}
        <motion.div
          className="pf-cta-strip"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="pf-cta-line" aria-hidden="true" />
          <Link className="cinema-button primary" href="/experience/dataset" id="features-upload-cta">
            <UploadCloud size={14} />Upload Your Dataset
          </Link>
          <Link className="cinema-button" href="/experience/intelligence" id="features-intel-cta">
            <Zap size={14} />View Live Feed
          </Link>
          <div className="pf-cta-line" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  );
}
