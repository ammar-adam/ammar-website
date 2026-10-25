"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import { PrintStage } from "./PrintStage";
import { Swinger, PoseDefs } from "./Figure";
import { Cover, Origins, Roles, Spotlight, Projects, Photos, OffClock, Landing, YVh, Cinema } from "./Scenes";
import { BEATS, SCROLL_VH, STARTS, TOTAL_VH, swingState } from "./geometry";
import { plateForBeat } from "./plates";
import { useMobile } from "./Comic";
import "./sv.css";

const subscribeResize = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};
const readVh = () => window.innerHeight || 900;
const readVw = () => window.innerWidth || 1440;

const NAV = [
  { href: "#experience", label: "Work" },
  { href: "#projects", label: "Projects" },
  { href: "#photos", label: "Photos" },
  { href: "#resume", label: "Contact" },
];

const SPOT = BEATS.findIndex((b) => b.id === "spotlight");

export function SpiderVerse() {
  const reduce = useReducedMotion();
  const vh = useSyncExternalStore(subscribeResize, readVh, () => 900);
  const vw = useSyncExternalStore(subscribeResize, readVw, () => 1440);
  const mounted = useSyncExternalStore(subscribeResize, () => true, () => false);
  const mobile = useMobile();
  const [menu, setMenu] = useState(false);

  /* Plain scroll listener; the whole film is a function of this one number. */
  const scrollY = useMotionValue(0);
  useEffect(() => {
    const on = () => scrollY.set(window.scrollY);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [scrollY]);

  const yVh = useTransform(scrollY, (y) => (y / vh) * 100);
  const yVhClamped = useTransform(yVh, (v) => Math.max(0, v));
  const state = useTransform(yVh, (v) => swingState(v));
  const progress = useTransform(yVh, (v) => Math.min(1, Math.max(0, v / SCROLL_VH)));

  /* the big one: dim the world to a spotlight */
  const dim = useTransform(state, (s) => {
    if (s.beat !== SPOT) return 0;
    if (s.index >= 0) return Math.max(0, (s.phase - 0.8) / 0.2) * 0.72;
    return s.p > 0.9 ? 0.72 * (1 - (s.p - 0.9) / 0.1) : 0.72;
  });

  /* Glitch frames at the cut and the figure's key light are toggled on the DOM directly. */
  const mainRef = useRef<HTMLElement>(null);
  useMotionValueEvent(state, "change", (s) => {
    const g = s.index >= 0 && s.phase > 0.88 && s.phase < 0.96 && !reduce;
    const el = mainRef.current;
    if (!el) return;
    el.classList.toggle("sv-glitch-on", g);
    const plate = plateForBeat(s, mobile).plate;
    const key = plate.night ? plate.key : "gold";
    if (el.dataset.key !== key) el.dataset.key = key;
  });

  return (
    <main ref={mainRef} className="sv" data-key="gold" style={{ height: `${TOTAL_VH}vh` }}>
      <PoseDefs />
      {mounted && <PrintStage state={state} mobile={mobile} />}

      {BEATS.map((b, i) => (
        <div key={b.id} id={ANCHOR[b.id] ?? b.id} className="sv-anchor" style={{ top: `${STARTS[i]}vh` }} aria-hidden="true" />
      ))}

      <YVh.Provider value={yVhClamped}>
        <Cinema.Provider value={{ state, vw, vh }}>
          <div className="sv-screen">
            <motion.div className="sv-dim" style={{ opacity: dim }} aria-hidden="true" />
            <Cover />
            <Origins />
            <Roles />
            <Spotlight />
            <Projects />
            <Photos />
            <OffClock />
            <Landing />
            {mounted && <Swinger state={state} vw={vw} vh={vh} mobile={mobile} />}
            <nav className={`sv-nav ${menu ? "sv-nav-open" : ""}`} aria-label="Jump to">
              <button type="button" className="sv-menu-btn" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
                Menu
              </button>
              <div className="sv-nav-links">
                {NAV.map((n) => (
                  <a key={n.href} href={n.href} onClick={() => setMenu(false)}>
                    {n.label}
                  </a>
                ))}
                <a href="/Ammar_Adam.pdf" target="_blank" rel="noopener">
                  Resume
                </a>
              </div>
            </nav>
            <motion.div className="sv-progress" style={{ scaleX: progress }} aria-hidden="true" />
          </div>
        </Cinema.Provider>
      </YVh.Provider>
    </main>
  );
}

const ANCHOR: Partial<Record<(typeof BEATS)[number]["id"], string>> = {
  roles: "experience",
  landing: "resume",
};
