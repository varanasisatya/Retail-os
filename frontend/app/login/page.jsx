"use client";

import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRetailData } from "@/lib/retailContext";
import { Eye, EyeOff, Zap, Shield, AlertCircle, Sparkles, Terminal } from "lucide-react";

const TERMINAL_LINES = [
  "> INITIALIZING AUTHENTICATION LAYER...",
  "> ESTABLISHING NEURAL HANDSHAKE...",
  "> VERIFYING OPERATOR CREDENTIALS...",
  "> DECRYPTING ACCESS TOKENS...",
  "> LOADING INTELLIGENCE MATRIX...",
  "> ACCESS GRANTED — WELCOME OPERATOR",
];

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  size: (i % 3) + 1.5,
  duration: 6 + (i % 8),
  delay: (i % 4),
  color: i % 3 === 0 ? "#22d3ee" : i % 3 === 1 ? "#e879f9" : "#8b5cf6",
}));

function FloatingParticle({ x, y, size, duration, delay, color }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 ${size * 4}px ${color}`,
        pointerEvents: "none",
      }}
      animate={{ y: [-20, 20, -20], opacity: [0.1, 0.6, 0.1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function TypewriterLine({ text, speed = 22 }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const iv = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, ++i));
      } else {
        clearInterval(iv);
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return <span>{displayed}</span>;
}

/** Inner component that safely uses useSearchParams (wrapped in Suspense by parent) */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, userSession } = useRetailData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [terminalLines, setTerminalLines] = useState([]);
  const [authSuccess, setAuthSuccess] = useState(false);
  const emailRef = useRef(null);

  const redirectTo = searchParams?.get("from") || "/experience/dataset";

  useEffect(() => {
    if (userSession?.isLoggedIn) {
      router.replace(redirectTo);
    }
    emailRef.current?.focus();
  }, [userSession, router, redirectTo]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Both fields are required to authenticate.");
      return;
    }

    setIsAuthenticating(true);
    setTerminalLines([]);

    for (let i = 0; i < TERMINAL_LINES.length; i++) {
      await new Promise((r) => setTimeout(r, i < TERMINAL_LINES.length - 1 ? 520 : 420));
      setTerminalLines((prev) => [...prev, i]);
    }

    const success = login({ email, password });
    await new Promise((r) => setTimeout(r, 400));

    if (success) {
      setAuthSuccess(true);
      await new Promise((r) => setTimeout(r, 900));
      router.push(redirectTo);
    } else {
      setIsAuthenticating(false);
      setTerminalLines([]);
      setError("ACCESS DENIED — Invalid credentials. Try: admin@retailos.ai / neural-core-2026");
    }
  }, [email, password, login, router, redirectTo]);

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticating ? (
        <motion.form
          key="form"
          className="login-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="login-field-group">
            <label className="login-label" htmlFor="login-email">OPERATOR ID</label>
            <div className="login-input-wrap">
              <div className="login-input-prefix">@</div>
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                className="login-input"
                placeholder="admin@retailos.ai"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                autoComplete="email"
                spellCheck={false}
                disabled={isAuthenticating}
              />
              <div className="login-input-scan" aria-hidden="true" />
            </div>
          </div>

          <div className="login-field-group">
            <label className="login-label" htmlFor="login-password">NEURAL KEY</label>
            <div className="login-input-wrap">
              <div className="login-input-prefix">
                <Shield size={13} />
              </div>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="neural-core-2026"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                autoComplete="current-password"
                disabled={isAuthenticating}
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <div className="login-input-scan" aria-hidden="true" />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="login-error"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="login-submit-btn"
            id="login-submit-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Zap size={16} />
            AUTHENTICATE &amp; ENTER
            <span className="login-btn-arrow">&#8594;</span>
          </motion.button>
        </motion.form>
      ) : (
        <motion.div
          key="terminal"
          className="login-terminal"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.4 }}
        >
          <div className="login-terminal-header">
            <Terminal size={14} style={{ color: "var(--color-cyan)" }} />
            <span>AUTHENTICATION ENGINE v4.1</span>
            <div className="login-terminal-dot" />
          </div>
          <div className="login-terminal-body">
            {terminalLines.map((lineIndex) => (
              <motion.div
                key={lineIndex}
                className={`login-terminal-line ${lineIndex === TERMINAL_LINES.length - 1 && authSuccess ? "success" : ""}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TypewriterLine text={TERMINAL_LINES[lineIndex]} speed={18} />
                {lineIndex < terminalLines.length - 1 && (
                  <span className="login-terminal-check"> &#10003;</span>
                )}
              </motion.div>
            ))}
            {!authSuccess && <div className="login-terminal-cursor" />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Login page shell — provides the Suspense boundary required by useSearchParams */
export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <main className="login-root">
      <div className="login-particle-field" aria-hidden="true">
        {PARTICLES.map((p) => (
          <FloatingParticle key={p.id} {...p} />
        ))}
      </div>

      <div className="login-orb login-orb-1" aria-hidden="true" />
      <div className="login-orb login-orb-2" aria-hidden="true" />
      <div className="login-orb login-orb-3" aria-hidden="true" />
      <div className="login-grid" aria-hidden="true" />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-card-glow" aria-hidden="true" />

        <motion.div
          className="login-brand"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <div className="login-brand-icon">
            <Sparkles size={18} />
          </div>
          <span className="login-brand-name">RETAILOS.AI</span>
        </motion.div>

        <motion.div
          className="login-title-block"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="login-kicker">
            <Shield size={12} />
            SECURE OPERATOR PORTAL
          </div>
          <h1 className="login-heading">
            <span>Authenticate</span>
            <span className="login-heading-gradient">Intelligence</span>
          </h1>
          <p className="login-subheading">
            Enter your operator credentials to access the RetailOS neural intelligence platform.
          </p>
        </motion.div>

        <motion.div
          className="login-demo-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          <Terminal size={10} />
          <span>DEMO — any email + password (4+ chars) grants access</span>
        </motion.div>

        {/* Suspense boundary required by Next.js 14 for useSearchParams */}
        <Suspense fallback={<div className="login-form" style={{ minHeight: 200 }} />}>
          <LoginForm />
        </Suspense>

        <motion.div
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="login-footer-dot" />
          <span>RetailOS AI — Secure Neural Intelligence Platform</span>
          <div className="login-footer-dot" />
        </motion.div>
      </motion.div>

      <div className="login-scanline" aria-hidden="true" />
    </main>
  );
}