"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BootSequence } from "./BootSequence";
import { useRetailData } from "@/lib/retailContext";

/**
 * BootGate — wraps the application and shows the BootSequence
 * on first session load. Children are rendered (but hidden) during
 * boot so they can preload/hydrate in the background.
 *
 * Also enforces a client-side auth guard: redirects unauthenticated
 * users to /login when they attempt to access /experience/* routes.
 */
export function BootGate({ children }) {
  const [booted, setBooted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { userSession } = useRetailData();

  const handleComplete = useCallback(() => {
    setBooted(true);
  }, []);

  useEffect(() => {
    if (!booted) return;
    const isExperience = pathname.startsWith("/experience");
    const isLoggedIn = userSession?.isLoggedIn === true;
    if (isExperience && !isLoggedIn) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [booted, pathname, userSession, router]);

  return (
    <>
      <BootSequence onComplete={handleComplete} />
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