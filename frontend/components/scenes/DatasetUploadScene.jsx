"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useRef, useState, useEffect } from "react";
import { Upload, Zap, CheckCircle, AlertCircle, FileText, X, Brain } from "lucide-react";
import { useRetailData } from "@/lib/retailContext";
import CSVUploadValidator from "./CSVUploadValidator";
import dynamic from "next/dynamic";

const NeuralUniverse = dynamic(
  () => import("./NeuralUniverse").then((m) => ({ default: m.NeuralUniverse })),
  { ssr: false, loading: () => <div className="neural-universe-loading" /> }
);

const ACCEPTED_COLUMNS = [
  "Order Date", "Date", "Revenue", "Sales", "Amount",
  "Category", "Product", "Region", "Quantity Sold", "Margin",
];

// Boot-style status messages during upload
const INGEST_MESSAGES = [
  "READING CSV HEADERS...",
  "NORMALIZING DATA SCHEMA...",
  "PARSING TEMPORAL SIGNALS...",
  "RUNNING NEURAL FORECAST...",
  "COMPILING INTELLIGENCE REPORT...",
];

function HolographicRing({ active, error }) {
  return (
    <div className="holo-ring-system" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`holo-ring holo-ring-${i} ${active ? "active" : ""} ${error ? "error" : ""}`}
        />
      ))}
      <div className={`holo-core ${active ? "active" : ""} ${error ? "error" : ""}`}>
        <div className="holo-core-inner" />
      </div>
    </div>
  );
}

function FloatingColumnTag({ label, index }) {
  return (
    <motion.span
      className="column-tag"
      initial={{ opacity: 0, y: 18, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.055, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {label}
    </motion.span>
  );
}

function NeuralProgressRing({ progress, message }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div className="neural-ring-wrap">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <motion.circle
            cx="70" cy="70" r={r}
            fill="none"
            stroke="url(#progressGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        <div className="neural-ring-label">
          <Zap size={20} />
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
      {message && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.08em", margin: 0, textAlign: "center" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export function DatasetUploadScene() {
  const { uploadStatus, uploadFile, errorMessage, uploadedFileName, reset } = useRetailData();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ingestMsg, setIngestMsg] = useState(INGEST_MESSAGES[0]);
  const fileInputRef = useRef(null);
  const progressTimer = useRef(null);
  const msgTimer = useRef(null);

  useEffect(() => {
    if (uploadStatus === "uploading") {
      setUploadProgress(0);
      let msgIdx = 0;
      setIngestMsg(INGEST_MESSAGES[0]);

      progressTimer.current = setInterval(() => {
        setUploadProgress((p) => Math.min(p + Math.random() * 10, 88));
      }, 200);

      msgTimer.current = setInterval(() => {
        msgIdx = (msgIdx + 1) % INGEST_MESSAGES.length;
        setIngestMsg(INGEST_MESSAGES[msgIdx]);
      }, 900);
    } else {
      clearInterval(progressTimer.current);
      clearInterval(msgTimer.current);
      if (uploadStatus === "success") setUploadProgress(100);
    }
    return () => {
      clearInterval(progressTimer.current);
      clearInterval(msgTimer.current);
    };
  }, [uploadStatus]);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) return;
    uploadFile(file);
  }, [uploadFile]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const isUploading = uploadStatus === "uploading";
  const isSuccess   = uploadStatus === "success";
  const isError     = uploadStatus === "error";

  return (
    <section className="upload-scene" id="dataset" aria-label="Dataset Intelligence Ingestion">
      {/* Three.js background universe */}
      <NeuralUniverse className="neural-universe-canvas" />

      <div className="upload-bg-grid"  aria-hidden="true" />
      <div className="upload-bg-glow"  aria-hidden="true" />

      {/* Header */}
      <motion.div
        className="upload-header"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="scene-kicker"><Zap size={14} />INTELLIGENCE INGESTION ENGINE</p>
        <h2 className="upload-title">
          <span>Feed the</span>
          <span className="gradient-text">Neural Core</span>
        </h2>
        <p className="upload-subtitle">
          Drop your retail dataset. The AI engine parses, cleans, and forecasts in under 2 seconds.
        </p>
      </motion.div>

      {/* Layout-shift free wrapper enclosing both states */}
      <div style={{ position: "relative", width: "min(520px, 88vw)", aspectRatio: 1, zIndex: 1 }}>
        {uploadStatus === "idle" ? (
          <CSVUploadValidator onValidationSuccess={handleFile} />
        ) : (
          <motion.div
            className={`upload-arena ${isUploading ? "uploading" : ""} ${isSuccess ? "success" : ""} ${isError ? "error" : ""}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%", height: "100%", borderRadius: "50%" }}
          >
            <HolographicRing active={isUploading} error={isError} />

            <AnimatePresence mode="wait">
              {isUploading && (
                <motion.div key="uploading" className="upload-progress-content"
                  initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <NeuralProgressRing progress={uploadProgress} message={ingestMsg} />
                </motion.div>
              )}

              {isSuccess && (
                <motion.div key="success" className="upload-success-content"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                  <div className="upload-success-icon">
                    <CheckCircle size={40} />
                  </div>
                  <p className="upload-status-text success">Intelligence activated</p>
                  <p className="upload-status-sub" style={{ fontFamily: "var(--font-mono)" }}>
                    {uploadedFileName}
                  </p>
                </motion.div>
              )}

              {isError && (
                <motion.div key="error" className="upload-error-content"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  <AlertCircle size={32} style={{ color: "#f87171" }} />
                  <p className="upload-status-text error">{errorMessage ?? "Upload failed"}</p>
                  {errorMessage && errorMessage.includes("No usable retail rows") && (
                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", lineHeight: 1.4, margin: "6px 0 12px 0", maxWidth: "240px" }}>
                      Ensure your CSV columns include: Date, Revenue, Category
                    </p>
                  )}
                  <button className="upload-retry-btn" onClick={(e) => { e.stopPropagation(); reset(); }}>
                    <X size={12} />Reset
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Column schema */}
      <motion.div
        className="column-schema"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <p className="column-schema-label">Supported data signals</p>
        <div className="column-tags">
          {ACCEPTED_COLUMNS.map((col, i) => (
            <FloatingColumnTag key={col} label={col} index={i} />
          ))}
        </div>
      </motion.div>

      {/* Success CTAs */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            className="upload-success-cta"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <a className="cinema-button primary" href="/experience/forecast" id="upload-forecast-cta">
              Enter Forecast Universe <span className="btn-arrow">→</span>
            </a>
            <a className="cinema-button" href="/experience/intelligence" id="upload-intel-cta">
              <Brain size={14} /> View Intelligence Feed
            </a>
            <button className="cinema-button" onClick={reset}>
              Upload New Dataset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
