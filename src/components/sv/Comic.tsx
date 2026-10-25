"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/** Fixed-precision numbers so SSR and client markup match byte for byte. */
export const f = (n: number) => Math.round(n * 100) / 100;

/** Narration box. Yellow/cream, hand-lettered. */
export function Caption({ children, className = "", tone = "paper", delay = 0 }: { children: ReactNode; className?: string; tone?: "paper" | "amber" | "ink"; delay?: number }) {
  return (
    <motion.p
      className={`sv-caption sv-caption-${tone} ${className}`}
      initial={{ opacity: 0, x: -24, rotate: -2 }}
      whileInView={{ opacity: 1, x: 0, rotate: -1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.01, delay }}
    >
      {children}
    </motion.p>
  );
}

/** Hand-lettered onomatopoeia with wobble on 3s and CMYK fringe. */
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

/** Kirby krackle: a burst of ink dots. */
function krackleDots(n: number, seed: number) {
  let s = seed;
  const r = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const out: Array<{ cx: number; cy: number; r: number }> = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.4;
    const d = 22 + r() * 30;
    out.push({ cx: f(50 + Math.cos(a) * d), cy: f(50 + Math.sin(a) * d), r: f(2 + r() * 5) });
  }
  return out;
}

export function Krackle({ className = "", n = 18, seed = 1 }: { className?: string; n?: number; seed?: number }) {
  const dots = krackleDots(n, seed).map((d, i) => <circle key={i} cx={d.cx} cy={d.cy} r={d.r} />);
  return (
    <svg className={`sv-krackle ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <g fill="currentColor">{dots}</g>
    </svg>
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

/** A panel that cuts in hard (no easing) when `p` crosses `at`. */
export function Cut({ p, at, children, className = "", style, tilt = 0 }: { p: MotionValue<number>; at: number; children: ReactNode; className?: string; style?: CSSProperties; tilt?: number }) {
  return (
    <motion.div
      className={`sv-cut ${className}`}
      style={{
        ...style,
        opacity: useStep(p, at),
        rotate: tilt,
      }}
    >
      {children}
    </motion.div>
  );
}

export function useStep(p: MotionValue<number>, at: number) {
  return useTransform(p, (v) => (v >= at ? 1 : 0));
}

/** Rooftop ledge the scenes land on. */
export function Roof({ variant = "a" }: { variant?: "a" | "b" | "c" | "d" }) {
  return (
    <div className={`sv-roof sv-roof-${variant}`} aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="sv-roof-svg">
        <rect x="0" y="40" width="1440" height="80" fill="var(--ink)" />
        <rect x="0" y="36" width="1440" height="10" fill="var(--paper)" />
        {variant === "a" && (
          <>
            <rect x="120" y="-20" width="90" height="60" fill="var(--ink)" />
            <rect x="110" y="-30" width="110" height="14" fill="var(--ink)" />
            <rect x="1180" y="4" width="120" height="36" fill="var(--ink)" />
            <circle cx="1240" cy="-6" r="22" fill="var(--ink)" />
          </>
        )}
        {variant === "b" && (
          <>
            <rect x="200" y="6" width="60" height="34" fill="var(--ink)" />
            <rect x="1100" y="-10" width="140" height="50" fill="var(--ink)" />
            <rect x="1120" y="-24" width="20" height="14" fill="var(--ink)" />
          </>
        )}
        {variant === "c" && (
          <>
            <rect x="60" y="-14" width="30" height="54" fill="var(--ink)" />
            <rect x="1300" y="-14" width="30" height="54" fill="var(--ink)" />
          </>
        )}
      </svg>
    </div>
  );
}
