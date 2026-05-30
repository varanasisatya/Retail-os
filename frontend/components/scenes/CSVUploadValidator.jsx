"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import PropTypes from "prop-types";
import { Upload, RefreshCw, FileImage, FileText, File, FileSpreadsheet, Database } from "lucide-react";

// File type display metadata
const FILE_META = {
  csv:   { label: "CSV",   icon: FileText,        color: "var(--color-cyan)" },
  xlsx:  { label: "XLSX",  icon: FileSpreadsheet, color: "var(--color-mint)" },
  xls:   { label: "XLS",   icon: FileSpreadsheet, color: "var(--color-mint)" },
  pdf:   { label: "PDF",   icon: File,            color: "var(--color-fuchsia)" },
  png:   { label: "PNG",   icon: FileImage,       color: "var(--color-violet)" },
  jpg:   { label: "JPG",   icon: FileImage,       color: "var(--color-violet)" },
  json:  { label: "JSON",  icon: Database,        color: "var(--color-amber)" },
  other: { label: "ANY",   icon: Upload,          color: "var(--color-rose)" },
};

// CSV extensions that get schema validation
const CSV_EXTS = ["csv"];
// Excel extensions
const EXCEL_EXTS = ["xlsx", "xls", "xlsm", "xlsb"];
// Image extensions
const IMAGE_EXTS = ["png", "jpg", "jpeg", "gif", "bmp", "webp", "tiff"];
// Document extensions
const DOC_EXTS = ["pdf", "doc", "docx", "ppt", "pptx", "txt", "rtf"];
// Data extensions
const DATA_EXTS = ["json", "xml", "parquet", "tsv", "ndjson"];

function getFileMeta(ext) {
  if (CSV_EXTS.includes(ext)) return FILE_META.csv;
  if (EXCEL_EXTS.includes(ext)) return FILE_META.xlsx;
  if (IMAGE_EXTS.includes(ext)) return FILE_META.png;
  if (ext === "pdf") return FILE_META.pdf;
  if (ext === "json") return FILE_META.json;
  return FILE_META.other;
}

function getFileCategory(ext) {
  if (CSV_EXTS.includes(ext)) return "csv";
  if (EXCEL_EXTS.includes(ext)) return "excel";
  if (IMAGE_EXTS.includes(ext)) return "image";
  if (DOC_EXTS.includes(ext)) return "document";
  if (DATA_EXTS.includes(ext)) return "data";
  return "universal";
}

function getScanLabel(category) {
  switch (category) {
    case "excel":    return "PARSING SPREADSHEET SIGNALS...";
    case "image":    return "DECODING IMAGE MATRIX...";
    case "document": return "EXTRACTING DOCUMENT INTELLIGENCE...";
    case "data":     return "PARSING STRUCTURED DATA STREAM...";
    case "universal":return "ANALYZING DATA SIGNALS...";
    default:         return "SCANNING SCHEMA...";
  }
}

function getScanSub(category) {
  switch (category) {
    case "excel":    return "NEURAL SPREADSHEET RECOGNITION";
    case "image":    return "NEURAL IMAGE RECOGNITION";
    case "document": return "AI DOCUMENT INTELLIGENCE";
    case "data":     return "STRUCTURED DATA PARSING";
    case "universal":return "UNIVERSAL SIGNAL EXTRACTION";
    default:         return "PARSING DATA CHANNELS";
  }
}

function getAccentColor(category) {
  switch (category) {
    case "excel":    return "var(--color-mint)";
    case "image":    return "var(--color-violet)";
    case "document": return "var(--color-fuchsia)";
    case "data":     return "var(--color-amber)";
    default:         return "var(--color-cyan)";
  }
}

export default function CSVUploadValidator({ onValidationSuccess }) {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);
  const [missingHeaders, setMissingHeaders] = useState([]);
  const [fileCategory, setFileCategory] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setError(null);
    setMissingHeaders([]);
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const ext = file.name.split(".").pop().toLowerCase();
    const category = getFileCategory(ext);
    setFileCategory(category);

    // Size guard: 100MB for all files
    const MAX_BYTES = 100 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setError("File too large. Maximum accepted size: 100 MB.");
      return;
    }

    // CSV: run schema validation
    if (category === "csv") {
      setIsValidating(true);
      setTimeout(() => {
        Papa.parse(file, {
          preview: 1,
          skipEmptyLines: true,
          complete: (results) => {
            setIsValidating(false);
            if (!results.data || results.data.length === 0) {
              setError("Empty file. The upload stream contains no data fields.");
              return;
            }
            const headers = results.data[0].map((h) =>
              typeof h === "string" ? h.trim().toLowerCase() : ""
            );
            const hasDate  = headers.some((h) => h.includes("date") || h.includes("time") || h.includes("period"));
            const hasValue = headers.some((h) =>
              h.includes("revenue") || h.includes("sales") || h.includes("amount") ||
              h.includes("price")   || h.includes("units") || h.includes("quantity") ||
              h.includes("total")   || h.includes("value")
            );
            const missingFields = [];
            if (!hasDate)  missingFields.push("Date / Time column");
            if (!hasValue) missingFields.push("Revenue / Sales / Price column");

            if (missingFields.length > 0) {
              setMissingHeaders(missingFields);
              setError("Schema Mismatch: Missing core signal indicators.");
            } else {
              onValidationSuccess?.(file);
            }
          },
          error: (err) => {
            setIsValidating(false);
            setError(`Parsing Error: ${err.message || "Failed to scan CSV headers"}`);
          },
        });
      }, 1500);
      return;
    }

    // All other formats: holographic scan → direct pass-through
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      onValidationSuccess?.(file);
    }, 1800);
  }, [onValidationSuccess]);

  // Accept ALL file types — no restrictions
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: undefined, // unrestricted
    multiple: false,
    disabled: isValidating,
  });

  const handleRetry = useCallback((e) => {
    e.stopPropagation();
    setError(null);
    setMissingHeaders([]);
    setFileCategory(null);
  }, []);

  const accentColor = getAccentColor(fileCategory);
  const scanLabel   = getScanLabel(fileCategory);
  const scanSub     = getScanSub(fileCategory);

  return (
    <motion.div
      {...getRootProps()}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(6, 7, 20, 0.85)",
        backdropFilter: "blur(32px) saturate(180%)",
        WebkitBackdropFilter: "blur(32px) saturate(180%)",
        border: isDragActive
          ? "1px solid var(--color-cyan)"
          : error
          ? "1px solid rgba(239, 68, 68, 0.4)"
          : "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "24px",
        padding: "32px",
        boxShadow: isDragActive ? "var(--shadow-glow-sm)" : "var(--shadow-cinema)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        cursor: "pointer",
        overflow: "hidden",
        transition: "border-color 0.4s, box-shadow 0.4s",
      }}
      whileHover={{ scale: isValidating ? 1 : 1.01 }}
      whileTap={{ scale: isValidating ? 1 : 0.99 }}
    >
      <input {...getInputProps()} />

      {/* Holographic rings */}
      <div className="holo-ring-system" aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`holo-ring holo-ring-${i} ${isDragActive || isValidating ? "active" : ""} ${error ? "error" : ""}`}
            style={{ borderColor: error ? "var(--color-rose)" : undefined }}
          />
        ))}
      </div>

      {/* Animated scan beam */}
      {isValidating && (
        <motion.div
          style={{
            position: "absolute", left: 0, right: 0, top: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${accentColor}, #fff, ${accentColor}, transparent)`,
            boxShadow: `0 0 15px ${accentColor}`,
            zIndex: 2, pointerEvents: "none",
          }}
          animate={{ y: [0, 520, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AnimatePresence mode="wait">

          {/* Validating state */}
          {isValidating && (
            <motion.div key="validating"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", width: "100%", height: "100%" }}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}
            >
              <div style={{ position: "relative", width: 64, height: 64, display: "grid", placeItems: "center", marginBottom: 16 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ position: "absolute", inset: 0, border: "2px solid transparent", borderTopColor: accentColor, borderRadius: "50%" }}
                />
                <RefreshCw size={24} style={{ color: accentColor }} />
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: accentColor, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 6px 0", fontWeight: 700 }}>
                {scanLabel}
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-muted)", letterSpacing: "0.08em", margin: 0 }}>
                {scanSub}
              </p>
            </motion.div>
          )}

          {/* Error state */}
          {error && !isValidating && (
            <motion.div key="error"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", width: "100%", height: "100%" }}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}
            >
              <h3 className="pf-heading" style={{ color: "var(--color-rose)", margin: "0 0 8px 0", fontSize: "2rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
                NEURAL ERROR
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px 0", maxWidth: "340px" }}>{error}</p>
              {missingHeaders.length > 0 && (
                <div style={{ width: "100%", marginBottom: "20px" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px 0" }}>Missing Fields:</p>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
                    {missingHeaders.map((h) => (
                      <div key={h} style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", fontWeight: 700, padding: "4px 8px", borderRadius: "6px", background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.25)", color: "var(--color-rose)" }}>{h}</div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={handleRetry} className="cinema-button" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", borderColor: "rgba(255,255,255,0.12)" }}>
                <RefreshCw size={12} style={{ marginRight: 6 }} />RESET SCANNER
              </button>
            </motion.div>
          )}

          {/* Idle state */}
          {!isValidating && !error && (
            <motion.div key="idle"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", width: "100%", height: "100%" }}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}
            >
              <div className="upload-icon-wrap" style={{ color: isDragActive ? "var(--color-cyan)" : "var(--color-violet)", marginBottom: 16 }}>
                <Upload size={28} />
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 6px 0", letterSpacing: "-0.01em" }}>
                {isDragActive ? "RELEASE TO INGEST" : "INGEST ANY DATA FORMAT"}
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "0 0 18px 0", maxWidth: "290px", lineHeight: 1.5 }}>
                Drop any dataset format. The neural engine extracts retail signals from CSV, Excel, PDF, images, JSON and more.
              </p>

              {/* Format chips row 1 */}
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center", marginBottom: 7 }}>
                {[
                  { label: "CSV",  color: "var(--color-cyan)",    Icon: FileText },
                  { label: "XLSX", color: "var(--color-mint)",    Icon: FileSpreadsheet },
                  { label: "XLS",  color: "var(--color-mint)",    Icon: FileSpreadsheet },
                  { label: "PDF",  color: "var(--color-fuchsia)", Icon: File },
                ].map(({ label, color, Icon }) => (
                  <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", padding: "3px 9px", borderRadius: "999px", border: `1px solid ${color}33`, background: `${color}0d`, color }}>
                    <Icon size={9} />{label}
                  </span>
                ))}
              </div>
              {/* Format chips row 2 */}
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 }}>
                {[
                  { label: "PNG/JPG", color: "var(--color-violet)", Icon: FileImage },
                  { label: "JSON",    color: "var(--color-amber)",   Icon: Database },
                  { label: "TSV",     color: "var(--color-cyan)",    Icon: FileText },
                  { label: "+ MORE",  color: "var(--color-rose)",    Icon: Upload },
                ].map(({ label, color, Icon }) => (
                  <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", padding: "3px 9px", borderRadius: "999px", border: `1px solid ${color}33`, background: `${color}0d`, color }}>
                    <Icon size={9} />{label}
                  </span>
                ))}
              </div>

              <p className="upload-formats" style={{ fontSize: "0.56rem", opacity: 0.45, margin: 0 }}>
                All formats welcome &#183; Max 100 MB &#183; Neural AI extracts signals from any source
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}

CSVUploadValidator.propTypes = {
  onValidationSuccess: PropTypes.func.isRequired,
};