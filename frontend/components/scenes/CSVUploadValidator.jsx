"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import PropTypes from "prop-types";
import { Upload, AlertCircle, RefreshCw } from "lucide-react";

/**
 * CSVUploadValidator Component
 * 
 * Renders a glass-morphic drag-and-drop file uploader aligned with the
 * platform's cinematic dark-theme. Parses CSV headers on drop and validates 
 * the structure for critical retail data fields.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onValidationSuccess - Callback fired on successful CSV header validation
 * @returns {React.ReactElement}
 */
export default function CSVUploadValidator({ onValidationSuccess }) {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);
  const [missingHeaders, setMissingHeaders] = useState([]);
  const [fileName, setFileName] = useState("");

  /**
   * Internal drop handler logic for react-dropzone.
   * Runs schema validation with simulated cinematic scanning delay.
   * 
   * @type {Function}
   * @param {File[]} acceptedFiles - Set of files dropped by the client
   */
  const onDrop = useCallback((acceptedFiles) => {
    setError(null);
    setMissingHeaders([]);
    
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setFileName(file.name);

    // ── Size guard: reject files > 20MB before PapaParse reads them ──────────
    const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_BYTES) {
      setError("File too large. Maximum accepted size: 20MB.");
      return;
    }

    const ext = file.name.split(".").pop().toLowerCase();
    if (ext !== "csv") {
      setError("Invalid file format. Datastream requires a standard CSV file.");
      return;
    }

    setIsValidating(true);

    // Artificial scanning latency to showcase the holographic scanner (no layout shifts)
    setTimeout(() => {
      Papa.parse(file, {
        preview: 1, // Only read the first row
        skipEmptyLines: true,
        complete: (results) => {
          setIsValidating(false);
          
          if (!results.data || results.data.length === 0) {
            setError("Empty file. The upload stream contains no data fields.");
            return;
          }
          
          const rawHeaders = results.data[0];
          const headers = rawHeaders.map(h => typeof h === "string" ? h.trim() : "");
          
          const required = ["Date", "Product_ID", "Units_Sold", "Price"];
          const missing = required.filter(h => !headers.includes(h));
          
          if (missing.length > 0) {
            setMissingHeaders(missing);
            setError("Schema Mismatch: Missing core signal indicators.");
          } else {
            if (onValidationSuccess) {
              onValidationSuccess(file);
            }
          }
        },
        error: (err) => {
          setIsValidating(false);
          setError(`Parsing Error: ${err.message || "Failed to scan CSV headers"}`);
        }
      });
    }, 1500);
  }, [onValidationSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"]
    },
    multiple: false,
    disabled: isValidating
  });

  /**
   * Clears uploader error states and resets stream input fields.
   * 
   * @type {Function}
   * @param {React.MouseEvent} e - Click event object
   */
  const handleRetry = useCallback((e) => {
    e.stopPropagation();
    setError(null);
    setMissingHeaders([]);
    setFileName("");
  }, []);

  return (
    <motion.div
      {...getRootProps()}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(6, 7, 20, 0.85)", // Sleek dark void theme
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
        transition: "border-color 0.4s, box-shadow 0.4s"
      }}
      whileHover={{ scale: isValidating ? 1 : 1.01 }}
      whileTap={{ scale: isValidating ? 1 : 0.99 }}
    >
      <input {...getInputProps()} />

      {/* Holographic Ring System */}
      <div className="holo-ring-system" aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`holo-ring holo-ring-${i} ${isDragActive || isValidating ? "active" : ""} ${error ? "error" : ""}`}
            style={{
              borderColor: error ? "var(--color-rose)" : undefined
            }}
          />
        ))}
      </div>

      {/* Scanning Beam (Active when validating) */}
      {isValidating && (
        <motion.div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: "2px",
            background: "linear-gradient(90deg, transparent, var(--color-cyan), #fff, var(--color-cyan), transparent)",
            boxShadow: "0 0 15px var(--color-cyan)",
            zIndex: 2,
            pointerEvents: "none"
          }}
          animate={{ y: [0, 520, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Content States */}
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AnimatePresence mode="wait">
          {isValidating && (
            <motion.div
              key="validating"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                width: "100%",
                height: "100%"
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ position: "relative", width: 64, height: 64, display: "grid", placeItems: "center", marginBottom: 16 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    border: "2px solid transparent",
                    borderTopColor: "var(--color-cyan)",
                    borderRadius: "50%"
                  }}
                />
                <RefreshCw size={24} style={{ color: "var(--color-cyan)" }} />
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-cyan)", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 6px 0", textShadow: "0 0 8px rgba(34,211,238,0.3)", fontWeight: 700 }}>
                SCANNING SCHEMA...
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-muted)", letterSpacing: "0.08em", margin: 0 }}>
                PARSING DATA CHANNELS
              </p>
            </motion.div>
          )}

          {error && !isValidating && (
            <motion.div
              key="error"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                width: "100%",
                height: "100%"
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="pf-heading" style={{ color: "var(--color-rose)", margin: "0 0 8px 0", fontSize: "2rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
                NEURAL ERROR
              </h3>
              
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px 0", maxWidth: "340px" }}>
                Datastream ingestion rejected. The schema is missing key signals.
              </p>

              {missingHeaders.length > 0 && (
                <div style={{ width: "100%", marginBottom: "20px" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px 0" }}>
                    Missing Fields:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
                    {missingHeaders.map((header) => (
                      <div
                        key={header}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: "rgba(251, 113, 133, 0.08)",
                          border: "1px solid rgba(251, 113, 133, 0.25)",
                          color: "var(--color-rose)"
                        }}
                      >
                        {header}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleRetry}
                className="cinema-button"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  borderColor: "rgba(255, 255, 255, 0.12)"
                }}
              >
                <RefreshCw size={12} style={{ marginRight: 6 }} />
                RESET SCANNER
              </button>
            </motion.div>
          )}

          {!isValidating && !error && (
            <motion.div
              key="idle"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                width: "100%",
                height: "100%"
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              <div className="upload-icon-wrap" style={{ color: isDragActive ? "var(--color-cyan)" : "var(--color-violet)", marginBottom: 16 }}>
                <Upload size={28} />
              </div>
              
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 6px 0", letterSpacing: "-0.01em" }}>
                {isDragActive ? "RELEASE TO DECRYPT" : "INGEST CSV CORE"}
              </h3>
              
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "0 0 20px 0", maxWidth: "280px", lineHeight: 1.5 }}>
                Drag your CSV dataset here or click to select from file system directory.
              </p>

              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <p className="upload-formats" style={{ fontSize: "0.62rem", opacity: 0.6, margin: 0 }}>
                  REQUIRED: Date · Product_ID · Units_Sold · Price
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

CSVUploadValidator.propTypes = {
  onValidationSuccess: PropTypes.func.isRequired
};
