"use client";

import { useEffect } from "react";

export function SmoothScrollProvider({ children }) {
  useEffect(() => {
    document.documentElement.dataset.smoothScroll = "active";
    return () => {
      delete document.documentElement.dataset.smoothScroll;
    };
  }, []);

  return children;
}
