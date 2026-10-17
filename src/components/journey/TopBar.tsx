"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";
import { stops, type StopId } from "@/data/journey";

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
  const [stop, setStop] = useState<StopId>("hall");
  useEffect(() => {
    const els = stops.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setStop(e.target.id as StopId);
      },
      { rootMargin: "-40% 0px -59% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return stop;
}

function useClock() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-CA", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Toronto" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

export function TopBar() {
  const { theme, toggle } = useTheme();
  const stop = useCurrentStop();
  const current = stops.find((s) => s.id === stop) ?? stops[0];
  const time = useClock();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a href="#hall" className="tb-name">Ammar Adam</a>

        <div className="tb-here" aria-live="polite">
          <span className="tb-here-dot" aria-hidden />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={current.id}
              className="tb-here-label"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {current.label}
              {current.walk && <em> · {current.walk}</em>}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="tb-right">
          <span className="tb-clock" title="Toronto time">YYZ {time}</span>
          <button className="tb-theme" onClick={toggle} aria-label={theme === "day" ? "Switch to night" : "Switch to day"}>
            <span className={`tb-orb ${theme}`} aria-hidden />
          </button>
        </div>
      </div>
      <motion.div className="tb-progress" style={{ scaleX: progress }} aria-hidden />
    </header>
  );
}
