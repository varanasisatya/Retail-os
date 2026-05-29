"use client";

import { useState, useCallback } from "react";
import { BootSequence } from "./BootSequence";

/**
 * BootGate — wraps the application and shows the BootSequence
 * on first session load. Children are rendered (but hidden) during
 * boot so they can preload/hydrate in the background.
 */
export function BootGate({ children }) {
  const [booted, setBooted] = useState(false);

  const handleComplete = useCallback(() => {
    setBooted(true);
  }, []);

  return (
    <>
      {/* Boot sequence overlay — shown first-visit only */}
      <BootSequence onComplete={handleComplete} />

      {/* App content — visible after boot */}
      <div
        style={{
          opacity: booted ? 1 : 0,
          transition: "opacity 0.5s ease",
          pointerEvents: booted ? "auto" : "none",
        }}
      >
        {children}
      </div>
    </>
  );
}
