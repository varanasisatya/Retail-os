"use client";

import React from "react";
import PropTypes from "prop-types";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Cinematic Error Fallback UI
 * Renders when a rendering exception is caught in the React tree (e.g. Three.js context losses).
 */
function HolographicErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100vw",
        background: "radial-gradient(circle at center, #07111f 0%, #02040b 100%)",
        color: "var(--text-primary)",
        padding: "40px 20px",
        textAlign: "center",
        fontFamily: "var(--font-body)",
        position: "fixed",
        inset: 0,
        zIndex: 99999
      }}
    >
      {/* Background Holographic Scan grid */}
      <div
        className="upload-bg-grid"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.3,
          pointerEvents: "none"
        }}
      />
      <div className="scanline-overlay" style={{ opacity: 0.15 }} />

      <div style={{ maxWidth: "560px", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(251, 113, 133, 0.08)",
            border: "1px solid rgba(251, 113, 133, 0.35)",
            display: "grid",
            placeItems: "center",
            color: "var(--color-rose)",
            marginBottom: "24px",
            boxShadow: "0 0 30px rgba(251, 113, 133, 0.2)"
          }}
        >
          <AlertCircle size={40} className="animate-pulse" />
        </div>

        {/* Large Cinematic Header */}
        <h1
          className="pf-heading"
          style={{
            color: "var(--color-rose)",
            margin: "0 0 16px 0",
            fontSize: "clamp(2rem, 5vw, 4.5rem)",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            textShadow: "0 0 40px rgba(251, 113, 133, 0.35)"
          }}
        >
          System Anomaly Detected
        </h1>

        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            margin: "0 0 32px 0",
            fontFamily: "var(--font-mono)",
            opacity: 0.85
          }}
        >
          The neural graphics pipeline or telemetry stream encountered a rendering exception. WebGL context loss or DOM corruption flagged.
        </p>

        {error && (
          <div
            style={{
              width: "100%",
              background: "rgba(2, 4, 11, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              padding: "14px 18px",
              marginBottom: "32px",
              textAlign: "left",
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              overflowX: "auto"
            }}
          >
            <span style={{ color: "var(--color-rose)" }}>CRITICAL_CORE_EXCEPTION:</span> {error.message || String(error)}
          </div>
        )}

        <button
          onClick={resetErrorBoundary}
          className="cinema-button"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.12em",
            borderColor: "rgba(255, 255, 255, 0.15)",
            background: "rgba(255, 255, 255, 0.03)"
          }}
        >
          <RefreshCw size={12} style={{ marginRight: 8 }} />
          REBOOT TELEMETRY COMMANDS
        </button>
      </div>
    </div>
  );
}

HolographicErrorFallback.propTypes = {
  error: PropTypes.object,
  resetErrorBoundary: PropTypes.func.isRequired
};

/**
 * ErrorBoundary Class Component
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays the fallback Holographic Error UI.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <HolographicErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onReset: PropTypes.func
};
