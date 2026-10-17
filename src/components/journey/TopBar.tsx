"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";
import { stops, type StopId } from "@/data/journey";
import { boardingPassConfig } from "@/data/boardingPass";
import { Flap } from "./Flap";

type Theme = "day" | "night";

function subscribeTheme(cb: () => void) {
  window.addEventListener("afa-theme", cb);
  return () => window.removeEventListener("afa-theme", cb);
}
const readTheme = (): Theme => (document.documentElement.dataset.theme === "night" ? "night" : "day");

export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "day" as Theme);
  const toggle = () => {
    const next: Theme = theme === "day" ? "night" : "day";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("afa-theme", next);
      } catch {}
      window.dispatchEvent(new Event("afa-theme"));
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(apply);
    else apply();
  };
  return { theme, toggle };
}

function useCurrentStop() {
  const [stop, setStop] = useState<StopId>("check-in");
  useEffect(() => {
    const els = stops.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setStop(e.target.id as StopId);
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return stop;
}

export function TopBar() {
  const { theme, toggle } = useTheme();
  const stop = useCurrentStop();
  const label = stops.find((s) => s.id === stop)?.label ?? "";
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const planeLeft = useTransform(progress, (v) => `${v * 100}%`);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a href="#check-in" className="tb-name">
          <span className="tb-mark" aria-hidden>
            <svg viewBox="0 0 24 24"><path d="M21 12c0-.8-.7-1.3-1.5-1.3H15L10 3H8l2.5 7.7H6L4.3 8.5H3l1 3.5-1 3.5h1.3L6 13.3h4.5L8 21h2l5-7.7h4.5c.8 0 1.5-.5 1.5-1.3Z" /></svg>
          </span>
          Ammar Adam
        </a>

        <nav className="tb-stops" aria-label="Sections">
          <span className="tb-now">Now at</span>
          <Flap value={label} length={10} stagger={18} step={30} className="flap-sm" />
        </nav>

        <div className="tb-actions">
          <a className="tb-link" href={boardingPassConfig.resumeFileUrl} target="_blank" rel="noreferrer">Resume</a>
          <button className="tb-theme" onClick={toggle} aria-label={theme === "day" ? "Switch to night" : "Switch to day"}>
            <span className={`tb-orb ${theme}`} aria-hidden />
          </button>
        </div>
      </div>
      <div className="tb-route" aria-hidden>
        <motion.span className="tb-route-fill" style={{ scaleX: progress }} />
        <motion.span className="tb-route-plane" style={{ left: planeLeft }}>
          <svg viewBox="0 0 24 24"><path d="M21 12c0-.8-.7-1.3-1.5-1.3H15L10 3H8l2.5 7.7H6L4.3 8.5H3l1 3.5-1 3.5h1.3L6 13.3h4.5L8 21h2l5-7.7h4.5c.8 0 1.5-.5 1.5-1.3Z" /></svg>
        </motion.span>
      </div>
    </header>
  );
}
