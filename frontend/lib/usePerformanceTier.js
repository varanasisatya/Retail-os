"use client";

import { useEffect, useState } from "react";

/**
 * Measures live FPS over 2s and returns a quality tier:
 *   'high'   — ≥ 50 FPS  → full particles, bloom, all connections
 *   'medium' — 30–49 FPS → reduced particles, soft bloom
 *   'low'    — < 30 FPS  → minimal particles, no bloom, no lines
 */
export function usePerformanceTier() {
  const [tier, setTier] = useState("high");

  useEffect(() => {
    // Quick hardware hint before measuring
    const cores = navigator.hardwareConcurrency ?? 4;
    if (cores <= 2) {
      setTier("low");
      return;
    }
    if (cores <= 4) {
      setTier("medium");
    }

    let frameCount = 0;
    let startTime = performance.now();
    let rafId;

    const measure = () => {
      frameCount++;
      const elapsed = performance.now() - startTime;

      if (elapsed >= 2000) {
        const fps = (frameCount * 1000) / elapsed;
        if (fps < 30) setTier("low");
        else if (fps < 50) setTier("medium");
        else setTier("high");
        return; // stop measuring
      }

      rafId = requestAnimationFrame(measure);
    };

    rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return tier;
}

/** Particle counts per tier */
export const TIER_PARTICLES = { high: 180, medium: 80, low: 30 };

/** Bloom intensity per tier */
export const TIER_BLOOM = { high: 0.9, medium: 0.45, low: 0 };

/** Whether to draw neural connection lines */
export const TIER_LINES = { high: true, medium: true, low: false };

/** Canvas DPR per tier */
export const TIER_DPR = { high: [1, 2], medium: [1, 1.5], low: [1, 1] };
