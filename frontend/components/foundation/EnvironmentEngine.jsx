"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * EnvironmentEngine — reads the current route and applies
 * a scene-specific class to <body>, driving the CSS custom-property
 * theming system that changes the atmospheric colors per scene.
 */
export function EnvironmentEngine() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const body = document.body;

    // Remove all env classes
    body.classList.remove("env-hero", "env-dataset", "env-forecast", "env-intel");

    if (pathname === "/") {
      body.classList.add("env-hero");
    } else if (pathname.includes("dataset")) {
      body.classList.add("env-dataset");
    } else if (pathname.includes("forecast")) {
      body.classList.add("env-forecast");
    } else if (pathname.includes("intelligence")) {
      body.classList.add("env-intel");
    } else {
      body.classList.add("env-hero");
    }
  }, [pathname]);

  return null; // purely behavioral
}
