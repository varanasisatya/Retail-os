"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePerformanceTier, TIER_PARTICLES } from "@/lib/usePerformanceTier";

// Particle colors: cyan, fuchsia, violet, white — weighted toward cyan
const COLORS = [
  "rgba(34,211,238,0.7)",
  "rgba(34,211,238,0.5)",
  "rgba(34,211,238,0.4)",
  "rgba(232,121,249,0.45)",
  "rgba(139,92,246,0.45)",
  "rgba(248,250,252,0.3)",
];

function buildParticles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left:    `${(i * 37 + 13) % 100}%`,
    top:     `${(i * 19 + 7)  % 100}%`,
    color:   COLORS[i % COLORS.length],
    opacity: 0.2 + (i % 5) * 0.12,
    size:    1 + (i % 3) * 0.8,      // 1–2.6px — varied depth
    delay:   (i % 13) * 0.22,
    driftX:  [0, (i % 2 === 0 ? 24 : -18), 8, 0],
    driftY:  [0, -16, 6, 0],
    duration: 14 + (i % 8) * 2,
  }));
}

export function ParticleField() {
  const tier = usePerformanceTier();
  const count = TIER_PARTICLES[tier];
  const [particles] = useState(() => buildParticles(200)); // pre-build max

  const visible = particles.slice(0, count);

  return (
    <div className="particle-field" aria-hidden="true">
      {visible.map((p) => (
        <motion.span
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            opacity: p.opacity,
          }}
          animate={{
            x: p.driftX,
            y: p.driftY,
            opacity: [p.opacity, p.opacity * 1.6, p.opacity * 0.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
