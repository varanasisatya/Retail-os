"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles, LogOut, LogIn, User } from "lucide-react";
import SystemHealthBar from "./SystemHealthBar";
import { useRetailData } from "@/lib/retailContext";

const NAV_LINKS = [
  { label: "ORIGIN",       href: "/",                       sys: "SYS://HOME"  },
  { label: "INGEST",       href: "/experience/dataset",     sys: "SYS://FEED"  },
  { label: "FORECAST",     href: "/experience/forecast",    sys: "SYS://TIME"  },
  { label: "INTELLIGENCE", href: "/experience/intelligence", sys: "SYS://INTEL" },
];

function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(d.toISOString().slice(11, 19) + " UTC");
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return <span className="nav-clock">{time}</span>;
}

export function CinematicNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { userSession, logout } = useRetailData();

  // Prevent SSR/client mismatch: only render auth UI after hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isLoggedIn = mounted && userSession?.isLoggedIn === true;
  const userId = userSession?.userId ?? "GUEST";

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <nav className="cinema-nav" aria-label="RetailOS AI navigation">
        <Link className="brand-lockup" href="/" aria-label="RetailOS AI home">
          <span className="brand-sigil" aria-hidden="true">
            <Sparkles size={14} />
          </span>
          <span>RETAILOS.AI</span>
        </Link>

        <div className="scene-nav" role="list">
          {NAV_LINKS.map(({ label, href, sys }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                className={`scene-link ${active ? "active" : ""}`}
                href={href}
                role="listitem"
                aria-current={active ? "page" : undefined}
                title={sys}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="nav-right">
          <LiveClock />

          {/* Only render auth UI after mount to avoid hydration mismatch */}
          {mounted && (
            isLoggedIn ? (
              <div className="nav-auth-group">
                <div className="nav-user-badge" title={userId}>
                  <User size={11} />
                  <span className="nav-user-id">{userId}</span>
                </div>
                <button
                  className="nav-logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                  id="nav-logout-btn"
                >
                  <LogOut size={12} />
                  <span>LOGOUT</span>
                </button>
              </div>
            ) : (
              <Link className="nav-login-btn" href="/login" id="nav-login-btn">
                <LogIn size={12} />
                <span>LOGIN</span>
              </Link>
            )
          )}

          <div className="nav-status" aria-label="System online">
            <div className="nav-status-dot" />
            <span>ONLINE</span>
          </div>
        </div>
      </nav>
      <SystemHealthBar />
    </>
  );
}