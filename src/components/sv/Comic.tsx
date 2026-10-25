"use client";

import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

/** Fixed-precision numbers so SSR and client markup match byte for byte. */
export const f = (n: number) => Math.round(n * 100) / 100;

/* Viewport mode, SSR-safe. */
const mq = () => window.matchMedia("(max-width: 760px)");
const subscribeMobile = (cb: () => void) => {
  const q = mq();
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
};
export function useMobile() {
  return useSyncExternalStore(subscribeMobile, () => mq().matches, () => false);
}

/** Narration: one line, hand-lettered, floating over the world. Pops in, no easing. */
export function Caption({ children, className = "", hand = false }: { children: ReactNode; className?: string; hand?: boolean }) {
  return (
    <motion.p className={`sv-caption ${hand ? "sv-caption-hand" : ""} ${className}`} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.01 }}>
      {children}
    </motion.p>
  );
}

/** Hand-lettered onomatopoeia with wobble on 2s and CMYK fringe. */
export function Onoma({ children, color = "amber", className = "", style, size = "md" }: { children: string; color?: "amber" | "magenta" | "cyan" | "red" | "paper"; className?: string; style?: CSSProperties; size?: "sm" | "md" | "lg" | "xl" }) {
  return (
    <span className={`sv-onoma sv-onoma-${color} sv-onoma-${size} ${className}`} style={style} aria-hidden="true">
      <span className="sv-onoma-c">{children}</span>
      <span className="sv-onoma-m">{children}</span>
      <span className="sv-onoma-k">{children}</span>
    </span>
  );
}

/** Headline type with offset-print fringing. */
export function Cmyk({ children, as: Tag = "h1", className = "" }: { children: string; as?: "h1" | "h2" | "span"; className?: string }) {
  return (
    <Tag className={`sv-cmyk ${className}`}>
      <span className="sv-cmyk-c" aria-hidden="true">{children}</span>
      <span className="sv-cmyk-m" aria-hidden="true">{children}</span>
      <span className="sv-cmyk-k">{children}</span>
    </Tag>
  );
}

/** Spiky impact burst behind a word. */
export function Burst({ className = "", color = "var(--amber)" }: { className?: string; color?: string }) {
  const pts: string[] = [];
  const n = 14;
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rad = i % 2 ? 50 : 32 + (i % 3) * 4;
    pts.push(`${f(50 + Math.cos(a) * rad)},${f(50 + Math.sin(a) * rad)}`);
  }
  return (
    <svg className={`sv-burst ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <polygon points={pts.join(" ")} fill={color} stroke="var(--ink)" strokeWidth={2.5} strokeLinejoin="round" />
    </svg>
  );
}

export function useStep(p: MotionValue<number>, at: number, until = Infinity) {
  return useTransform(p, (v) => (v >= at && v < until ? 1 : 0));
}

/** A surface that cuts in hard (no easing) when `p` crosses `at`, and out at `until`. */
export function Cut({ p, at, until = Infinity, children, className = "", style, tilt = 0 }: { p: MotionValue<number>; at: number; until?: number; children: ReactNode; className?: string; style?: CSSProperties; tilt?: number }) {
  const on = useStep(p, at, until);
  const visibility = useTransform(on, (v) => (v ? "visible" : "hidden"));
  return (
    <div className={`sv-cut ${className}`} style={style}>
      <motion.div className="sv-cut-inner" style={{ opacity: on, visibility, rotate: tilt }}>
        {children}
      </motion.div>
    </div>
  );
}
