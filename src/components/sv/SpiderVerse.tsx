"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { FarLayer, MidLayer, NearLayer } from "./Skyline";
import { Swinger } from "./Swinger";
import { Cover, Origins, Roles, Projects, Photos, OffClock, Landing, YVh } from "./Scenes";
import { BEATS, SCROLL_VH, STARTS, TOTAL_VH, swingState } from "./geometry";
import { f } from "./Comic";
import "./sv.css";

const subscribeResize = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};
const readVh = () => window.innerHeight || 900;

const NAV = [
  { href: "#experience", label: "Work" },
  { href: "#projects", label: "Projects" },
  { href: "#photos", label: "Photos" },
  { href: "#resume", label: "Contact" },
];

export function SpiderVerse() {
  const reduce = useReducedMotion();
  const vh = useSyncExternalStore(subscribeResize, readVh, () => 900);
  const mounted = useSyncExternalStore(subscribeResize, () => true, () => false);

  /* Plain scroll listener; the whole film is a function of this one number. */
  const scrollY = useMotionValue(0);
  useEffect(() => {
    const on = () => scrollY.set(window.scrollY);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [scrollY]);

  /* scroll position in viewport heights */
  const yVh = useTransform(scrollY, (y) => (y / vh) * 100);
  const yVhClamped = useTransform(yVh, (v) => Math.max(0, v));
  const state = useTransform(yVh, (v) => swingState(v));
  const progress = useTransform(yVh, (v) => Math.min(1, Math.max(0, v / SCROLL_VH)));

  /* camera: travel pans the city, intensity dips and leans it */
  const k = reduce ? 0 : 1;
  const farX = useTransform(state, (s) => `${-s.travel * 9 * k}vw`);
  const midX = useTransform(state, (s) => `${-s.travel * 22 * k}vw`);
  const nearX = useTransform(state, (s) => `${-s.travel * 48 * k}vw`);
  const dipY = useTransform(state, (s) => `${-s.intensity * 9 * k}vh`);
  const lean = useTransform(state, (s) => (s.index < 0 ? 0 : -Math.sin(s.phase * Math.PI * 2) * 3.5 * k));
  const night = useTransform(yVh, [0, TOTAL_VH - 100], [0, 1]);
  const speed = useTransform(state, (s) => Math.max(0, s.intensity - 0.35) * 1.4 * k);
  const speedScale = useTransform(state, (s) => 1 + Math.round(s.phase * 8) * 0.05);
  const sunOp = useTransform(night, [0, 0.5], [1, 0]);
  const moonOp = useTransform(night, [0.4, 0.8], [0, 1]);
  /* cold open: the first stretch of scroll brings the lights up */
  const dark = useTransform(yVh, [0, 30], [0.55, 0]);
  /* depth of field: out-of-focus layers misregister more while the camera moves */
  const dofFar = useTransform(state, (s) => 6 + s.intensity * 5);
  const dofNear = useTransform(state, (s) => 3 + s.intensity * 7);

  /* Glitch frames and landing bursts are toggled on the DOM directly: no React state
     in a motion-value callback, so scroll never triggers a render. */
  const mainRef = useRef<HTMLElement>(null);
  const landRef = useRef<HTMLDivElement>(null);
  useMotionValueEvent(state, "change", (s) => {
    const g = s.index >= 0 && s.phase > 0.44 && s.phase < 0.56 && !reduce;
    mainRef.current?.classList.toggle("sv-glitch-on", g);
    const l = s.index >= 0 && s.phase > 0.9 ? s.index : -1;
    const el = landRef.current;
    if (el && el.dataset.on !== String(l)) {
      el.dataset.on = String(l);
      const word = el.querySelector(".sv-land-word");
      if (word) word.textContent = LAND_WORDS[(l + 6) % 6];
    }
  });

  return (
    <main ref={mainRef} className="sv" style={{ height: `${TOTAL_VH}vh` }}>
      {/* The city is decorative and scroll-driven; render it after mount so SSR markup stays stable. */}
      {mounted && (
        <div className="sv-stage" aria-hidden="true">
          <div className="sv-sky" />
          <motion.div className="sv-sky sv-sky-night" style={{ opacity: night }} />
          <motion.div className="sv-sun" style={{ opacity: sunOp }} />
          <motion.div className="sv-moon" style={{ opacity: moonOp }} />
          <div className="sv-glow" />
          <motion.div className="sv-camera" style={{ y: dipY, rotate: lean }}>
            <Layer x={farX} className="sv-layer-far" copies={2} dof={dofFar}>
              <FarLayer />
            </Layer>
            <Layer x={midX} className="sv-layer-mid" copies={3}>
              <MidLayer />
            </Layer>
            <Layer x={nearX} className="sv-layer-near" copies={4} dof={dofNear}>
              <NearLayer />
            </Layer>
          </motion.div>
          <motion.div className="sv-speed" style={{ opacity: speed, scale: speedScale }}>
            <SpeedLines />
          </motion.div>
          <div className="sv-speckle" />
          <motion.div className="sv-dark" style={{ opacity: dark }} />
          <div className="sv-rgb sv-rgb-c" />
          <div className="sv-rgb sv-rgb-m" />
        </div>
      )}

      {BEATS.map((b, i) => (
        <div key={b.id} id={ANCHOR[b.id] ?? b.id} className="sv-anchor" style={{ top: `${STARTS[i]}vh` }} aria-hidden="true" />
      ))}

      <YVh.Provider value={yVhClamped}>
        <div className="sv-screen">
          <Cover />
          <Origins />
          <Roles />
          <Projects />
          <Photos />
          <OffClock />
          <Landing />
          {mounted && (
            <div className="sv-fx" aria-hidden="true">
              <Swinger state={state} />
              <LandingBurst ref={landRef} />
            </div>
          )}
          <nav className="sv-nav" aria-label="Jump to">
            {NAV.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
            <a href="/Ammar_Adam.pdf" target="_blank" rel="noopener">
              Resume
            </a>
          </nav>
          <motion.div className="sv-progress" style={{ scaleX: progress }} aria-hidden="true" />
        </div>
      </YVh.Provider>
    </main>
  );
}

const ANCHOR: Partial<Record<(typeof BEATS)[number]["id"], string>> = {
  roles: "experience",
  landing: "resume",
};

/**
 * A parallax layer. With `dof`, two ghost copies tinted cyan and magenta sit behind the
 * real one, offset by the current misregistration: the film's fake depth of field.
 */
function Layer({ x, className, copies, dof, children }: { x: MotionValue<string>; className: string; copies: number; dof?: MotionValue<number>; children: React.ReactNode }) {
  const zero = useMotionValue(0);
  const left = useTransform(dof ?? zero, (v) => -v);
  const right = useTransform(dof ?? zero, (v) => v);
  const row = Array.from({ length: copies }).map((_, i) => (
    <div key={i} className="sv-layer-copy">
      {children}
    </div>
  ));
  return (
    <motion.div className={`sv-layer ${className}`} style={{ x }}>
      {dof && (
        <>
          <motion.div className="sv-layer-row sv-ghost sv-ghost-c" style={{ x: left }}>
            {row}
          </motion.div>
          <motion.div className="sv-layer-row sv-ghost sv-ghost-m" style={{ x: right }}>
            {row}
          </motion.div>
        </>
      )}
      <div className="sv-layer-row">{row}</div>
    </motion.div>
  );
}

function SpeedLines() {
  const lines = [];
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2;
    const r1 = 18 + (i % 4) * 8;
    const r2 = 70 + (i % 3) * 10;
    lines.push(<line key={i} x1={f(50 + Math.cos(a) * r1)} y1={f(50 + Math.sin(a) * r1)} x2={f(50 + Math.cos(a) * r2)} y2={f(50 + Math.sin(a) * r2)} />);
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="sv-speed-svg">
      <g stroke="var(--paper)" strokeWidth={0.5} strokeLinecap="round">
        {lines}
      </g>
    </svg>
  );
}

const LAND_WORDS = ["WHUMP", "KA-CHUNK", "THUD", "TAK", "SKRRT", "WHUMP"];

function LandingBurst({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="sv-land" ref={ref} data-on="-1">
      <svg viewBox="0 0 200 200" className="sv-land-svg">
        <polygon
          points={Array.from({ length: 28 })
            .map((_, i) => {
              const a = (i / 28) * Math.PI * 2;
              const r = i % 2 ? 96 : 50 + (i % 3) * 10;
              return `${f(100 + Math.cos(a) * r)},${f(100 + Math.sin(a) * r)}`;
            })
            .join(" ")}
          fill="var(--paper)"
          stroke="var(--ink)"
          strokeWidth={5}
        />
        <g fill="var(--ink)">
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2 + 0.2;
            return <circle key={i} cx={f(100 + Math.cos(a) * 110)} cy={f(100 + Math.sin(a) * 110)} r={3 + (i % 3) * 2.5} />;
          })}
        </g>
      </svg>
      <span className="sv-land-word">WHUMP</span>
    </div>
  );
}
