"use client";

import { createContext, useCallback, useContext, useState, useEffect } from "react";

const RetailDataContext = createContext(null);

export function RetailDataProvider({ children }) {
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle | uploading | success | error
  const [reportData, setReportData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [forecastPeriod, setForecastPeriod] = useState(30);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  /**
   * 'demo' — no CSV ingested; agent runs on synthetic signals.
   * 'live' — CSV processed by backend; agent queries real reportData.
   */
  const [dataMode, setDataMode] = useState("demo");

  /** ISO timestamp set the moment a successful upload transitions to Live Mode. */
  const [activatedAt, setActivatedAt] = useState(null);

  /**
   * Real round-trip latency (ms) measured via performance.now() from upload
   * start to first successful API response byte. null until first upload.
   */
  const [uploadLatencyMs, setUploadLatencyMs] = useState(null);

  // ─── Mock Auth Layer & Session Persistence ──────────────────────────────────
  const [userSession, setUserSession] = useState(() => {
    if (typeof window !== "undefined") {
      const persisted = localStorage.getItem("retailos_user_session");
      if (persisted) {
        try {
          return JSON.parse(persisted);
        } catch (_) {}
      }
    }
    return { userId: "RETAIL_OS_USER_983", theme: "cinema-dark" };
  });

  useEffect(() => {
    localStorage.setItem("retailos_user_session", JSON.stringify(userSession));
  }, [userSession]);

  // Drawer open state persistence (remember last visit)
  const [isDrawerOpen, setIsDrawerOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const persisted = localStorage.getItem("retailos_drawer_open");
      return persisted === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("retailos_drawer_open", String(isDrawerOpen));
  }, [isDrawerOpen]);

  // Console / Log Viewer state
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // System logs tracking
  const [systemLogs, setSystemLogs] = useState(() => [
    { id: 1, timestamp: new Date().toLocaleTimeString(), message: "System initialized in DEMO mode." },
  ]);

  const addLog = useCallback((message) => {
    setSystemLogs((prev) => {
      const newLog = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        message,
      };
      // Keep only the last 5 events
      return [...prev, newLog].slice(-5);
    });
  }, []);

  // Selected drilldown data
  const [drilldownData, setDrilldownData] = useState(null);

  const triggerDrilldown = useCallback((date, value) => {
    setDrilldownData({ date, value });
    setIsDrawerOpen(true);
    addLog(`Drilldown triggered for date: ${date} (${value} units)`);
  }, [addLog]);

  /**
   * uploadFile — sends the CSV file to the analytics API.
   *
   * @param {File} file - The validated CSV file from CSVUploadValidator.
   */
  const uploadFile = useCallback(async (file) => {
    setUploadStatus("uploading");
    setErrorMessage(null);
    setUploadedFileName(file.name);
    addLog(`Initiating CSV datastream ingestion: ${file.name}`);

    const form = new FormData();
    form.append("file", file);

    // AbortController for 30s timeout guard
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    // Real latency: mark before the network call
    const startTime = performance.now();

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/analytics/async-compute", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Server error ${res.status}`);
      }

      const json = await res.json();

      // Record real round-trip latency before any state commits
      const latency = Math.round(performance.now() - startTime);

      setReportData(json.payload);
      setUploadLatencyMs(latency);
      setUploadStatus("success");
      setDataMode("live");
      setActivatedAt(new Date().toISOString());

      addLog(`Ingestion completed successfully: ${file.name}`);
      addLog(`Upload latency: ${latency}ms`);
      if (latency > 500) {
        addLog(`Latency warning: high round-trip latency detected (${latency}ms)`);
      }

      return { ...json, latency };
    } catch (err) {
      clearTimeout(timeoutId);
      const latency = Math.round(performance.now() - startTime);
      let errorMsg = err.message;
      if (err.name === "AbortError") {
        errorMsg = "Request timed out after 30s. Verify the backend server is running on port 8000.";
        setErrorMessage(errorMsg);
      } else if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        errorMsg = "Cannot reach the backend server. Start uvicorn and try again.";
        setErrorMessage(errorMsg);
      } else {
        setErrorMessage(errorMsg);
      }
      setUploadStatus("error");
      addLog(`Ingestion failed: ${errorMsg}`);
      return { status: "error", detail: errorMsg, latency };
    }
  }, [addLog]);

  const reset = useCallback(() => {
    setUploadStatus("idle");
    setReportData(null);
    setErrorMessage(null);
    setUploadedFileName(null);
    setForecastPeriod(30);
    setDataMode("demo");
    setActivatedAt(null);
    setUploadLatencyMs(null);
    setDrilldownData(null);
    addLog("System reset. Returning to synthetic DEMO mode.");
  }, [addLog]);

  return (
    <RetailDataContext.Provider
      value={{
        uploadStatus,
        reportData,
        errorMessage,
        forecastPeriod,
        setForecastPeriod,
        uploadFile,
        reset,
        uploadedFileName,
        dataMode,
        activatedAt,
        uploadLatencyMs,
        userSession,
        setUserSession,
        isDrawerOpen,
        setIsDrawerOpen,
        isConsoleOpen,
        setIsConsoleOpen,
        systemLogs,
        addLog,
        drilldownData,
        setDrilldownData,
        triggerDrilldown,
      }}
    >
      {children}
    </RetailDataContext.Provider>
  );
}

export function useRetailData() {
  const ctx = useContext(RetailDataContext);
  if (!ctx) throw new Error("useRetailData must be used inside RetailDataProvider");
  return ctx;
}
