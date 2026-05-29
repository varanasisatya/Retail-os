"use client";

import { useEffect } from "react";

/**
 * useKeyboardShortcuts - Global keyboard listener for hotkeys
 * 
 * Maps Ctrl+K to toggle the drawer, and Escape to close any open overlays or drawers.
 * 
 * @param {Object} handlers
 * @param {Function} handlers.onToggleDrawer - Callback when Ctrl+K is pressed
 * @param {Function} handlers.onCloseAll - Callback when Escape is pressed
 */
export function useKeyboardShortcuts({ onToggleDrawer, onCloseAll }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + K or Cmd + K (Mac OS meta key support)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (onToggleDrawer) onToggleDrawer();
      }

      // Escape key to close drawers and panels
      if (e.key === "Escape") {
        if (onCloseAll) onCloseAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggleDrawer, onCloseAll]);
}
