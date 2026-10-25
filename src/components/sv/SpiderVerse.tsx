"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { CloudLayer, FarLayer, FarSil, MidLayer, NearLayer, NearSil, SkyDefs } from "./Skyline";
import { Swinger } from "./Figure";
import { Cover, Origins, Roles, Spotlight, Projects, Photos, OffClock, Landing, YVh } from "./Scenes";
import { BEATS, SCROLL_VH, STARTS, TOTAL_VH, swingState } from "./geometry";
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

  /* camera: travel pans the city (fast in swings, a slow dolly in dwells); each swing has its own move */
  const k = reduce ? 0 : 1;
  const cloudX = useTransform(state, (s) => `${-s.travel * 4 * k}vw`);
  const farX = useTransform(state, (s) => `${-s.travel * 9 * k}vw`);
  const midX = useTransform(state, (s) => `${-s.travel * 22 * k}vw`);
  const nearX = useTransform(state, (s) => `${-s.travel * 48 * k}vw`);
  const dipY = useTransform(state, (s) => {
    if (s.index < 0) return "0vh";
    if (s.kind === "freefall") return `${-16 * s.phase * k}vh`;
    if (s.kind === "lateral" || s.kind === "run" || s.kind === "whip") return "0vh";
    return `${-9 * s.intensity * k}vh`;
  });
  const lean = useTransform(state, (s) => {
    if (s.index < 0) return 0;
    if (s.kind === "low") return -6 * Math.sin(s.phase * Math.PI) * k;
    if (s.kind === "freefall") return 12 * s.phase * k;
    if (s.kind === "landing") return -3.5 * Math.sin(s.phase * Math.PI * 2) * k;
    return 0;
  });
  const night = useTransform(yVh, [0, TOTAL_VH - 100], [0, 1]);
  /* cold open: the first stretch of scroll brings the lights up */
  const dark = useTransform(yVh, [0, 30], [0.5, 0]);
  /* depth of field: out-of-focus layers misregister more while the camera moves */
  const dofFar = useTransform(state, (s) => 5 + s.intensity * 4);
  const dofNear = useTransform(state, (s) => 4 + s.intensity * 6);
  /* the big one: dim the city to a spotlight */
  const dim = useTransform(state, (s) => {
    if (s.beat !== SPOT) return 0;
    if (s.index >= 0) return Math.max(0, (s.phase - 0.8) / 0.2) * 0.75;
    return s.p > 0.9 ? 0.75 * (1 - (s.p - 0.9) / 0.1) : 0.75;
  });

  /* Glitch frames at the cut are toggled on the DOM directly: no React state in a motion-value callback. */
  const mainRef = useRef<HTMLElement>(null);
  useMotionValueEvent(state, "change", (s) => {
    const g = s.index >= 0 && s.phase > 0.88 && s.phase < 0.96 && !reduce;
    mainRef.current?.classList.toggle("sv-glitch-on", g);
  });

  return (
    <main ref={mainRef} className="sv" style={{ height: `${TOTAL_VH}vh` }}>
      <SkyDefs />
      {/* The city is decorative and scroll-driven; render it after mount so SSR markup stays stable. */}
      {mounted && (
        <div className="sv-stage" aria-hidden="true">
          <div className="sv-sky" />
          <motion.div className="sv-sky sv-sky-night" style={{ opacity: night }} />
          <div className="sv-glow" />
          <motion.div className="sv-camera" style={{ y: dipY, rotate: lean }}>
            <Layer x={cloudX} className="sv-layer-clouds" copies={2}>
              <CloudLayer />
            </Layer>
            <Layer x={farX} className="sv-layer-far" copies={2} dof={dofFar} sil={<FarSil />}>
              <FarLayer />
            </Layer>
            <div className="sv-haze sv-haze-far" />
            <Layer x={midX} className="sv-layer-mid" copies={3}>
              <MidLayer />
            </Layer>
            <div className="sv-haze sv-haze-mid" />
            <Layer x={nearX} className="sv-layer-near" copies={4} dof={dofNear} sil={<NearSil />}>
              <NearLayer />
            </Layer>
          </motion.div>
          <div className="sv-speckle" />
          <motion.div className="sv-dark" style={{ opacity: dark }} />
        </div>
      )}

      {BEATS.map((b, i) => (
        <div key={b.id} id={ANCHOR[b.id] ?? b.id} className="sv-anchor" style={{ top: `${STARTS[i]}vh` }} aria-hidden="true" />
      ))}

      <YVh.Provider value={yVhClamped}>
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
 * A parallax layer, repeated `copies` times. With `dof` and `sil`, two silhouette copies
 * (cyan behind-left, magenta behind-right) sit under the real drawing, offset by the
 * current misregistration, so only a sliver of fringe shows at the edges: the film's
 * fake depth of field.
 */
function Layer({ x, className, copies, dof, sil, children }: { x: MotionValue<string>; className: string; copies: number; dof?: MotionValue<number>; sil?: React.ReactNode; children: React.ReactNode }) {
  const zero = useMotionValue(0);
  const left = useTransform(dof ?? zero, (v) => -v);
  const right = useTransform(dof ?? zero, (v) => v);
  const row = (node: React.ReactNode) =>
    Array.from({ length: copies }).map((_, i) => (
      <div key={i} className="sv-layer-copy">
        {node}
      </div>
    ));
  return (
    <motion.div className={`sv-layer ${className}`} style={{ x }}>
      {dof && sil && (
        <>
          <motion.div className="sv-layer-row sv-ghost sv-ghost-c" style={{ x: left }}>
            {row(sil)}
          </motion.div>
          <motion.div className="sv-layer-row sv-ghost sv-ghost-m" style={{ x: right }}>
            {row(sil)}
          </motion.div>
        </>
      )}
      <div className="sv-layer-row sv-layer-real">{row(children)}</div>
    </motion.div>
  );
}
