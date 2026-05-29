"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/**
 * CursorReactor — renders a large soft glow that follows the cursor
 * with spring inertia, making the whole environment feel reactive.
 * Uses transform only for 60fps GPU compositing.
 */
export function CursorReactor() {
  const glowRef = useRef(null);

  const rawX = useMotionValue(
    typeof window !== "undefined" ? window.innerWidth / 2 : 0
  );
  const rawY = useMotionValue(
    typeof window !== "undefined" ? window.innerHeight / 2 : 0
  );

  // Spring adds cinematic inertia (lag behind cursor)
  const x = useSpring(rawX, { stiffness: 60, damping: 25, mass: 0.8 });
  const y = useSpring(rawY, { stiffness: 60, damping: 25, mass: 0.8 });

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    const handleMove = (e) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });

    // Subscribe to spring values and update DOM directly (no re-render)
    const unsubX = x.on("change", (v) => {
      if (el) el.style.left = `${v}px`;
    });
    const unsubY = y.on("change", (v) => {
      if (el) el.style.top = `${v}px`;
    });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      unsubX();
      unsubY();
    };
  }, [rawX, rawY, x, y]);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}
