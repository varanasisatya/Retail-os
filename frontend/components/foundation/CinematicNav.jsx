"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import SystemHealthBar from "./SystemHealthBar";

const NAV_LINKS = [
  { label: "ORIGIN",       href: "/",                      sys: "SYS://HOME"  },
  { label: "INGEST",       href: "/experience/dataset",    sys: "SYS://FEED"  },
  { label: "FORECAST",     href: "/experience/forecast",   sys: "SYS://TIME"  },
  { label: "INTELLIGENCE", href: "/experience/intelligence",sys: "SYS://INTEL" },
];

function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(
        d.toISOString().slice(11, 19) + " UTC"
      );
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return <span className="nav-clock">{time}</span>;
}

export function CinematicNav() {
  const pathname = usePathname();

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav className="cinema-nav" aria-label="RetailOS AI navigation">
        {/* Brand */}
        <Link className="brand-lockup" href="/" aria-label="RetailOS AI home">
          <span className="brand-sigil" aria-hidden="true">
            <Sparkles size={14} />
          </span>
          <span>RETAILOS.AI</span>
        </Link>

        {/* Scene links */}
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

        {/* Right: clock + status */}
        <div className="nav-right">
          <LiveClock />
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
