"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/* Overlays that float on top of the world: sound effects, chromatic
   depth-of-field copies, link pills, misregistered display type. */

/** Hand-lettered onomatopoeia with a rough starburst behind it. Wobbles between frames via CSS. */
export function Bang({
  text,
  color = "#fff6ea",
  burst = "#ff2e88",
  rotate = -8,
  size = 72,
  className = "",
  style,
}: {
  text: string;
  color?: string;
  burst?: string;
  rotate?: number;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const w = Math.max(220, text.length * size * 0.62 + 90);
  const h = size * 1.9;
  const cx = w / 2, cy = h / 2;
  const spikes = 14;
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (Math.PI * 2 * i) / (spikes * 2) - Math.PI / 2;
    const rx = i % 2 === 0 ? w * 0.5 : w * 0.38;
    const ry = i % 2 === 0 ? h * 0.5 : h * 0.33;
    const j = i % 3 === 0 ? 1.04 : 1;
    pts.push(`${(cx + Math.cos(a) * rx * j).toFixed(1)},${(cy + Math.sin(a) * ry * j).toFixed(1)}`);
  }
  return (
    <svg className={`bang ${className}`} viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ ["--rot" as string]: `${rotate}deg`, ...style }} aria-hidden="true">
      <polygon points={pts.join(" ")} fill={burst} stroke="#0d0b14" strokeWidth="6" strokeLinejoin="round" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-bangers), Impact, sans-serif" fontSize={size} fill={color} stroke="#0d0b14" strokeWidth={size * 0.11} strokeLinejoin="round" paintOrder="stroke" letterSpacing="2">
        {text}
      </text>
    </svg>
  );
}

/** A sound effect that pops in over a t-range (hard stepped pop, then holds, then leaves). */
export function BangAt({ t, at, hold = 0.03, ...props }: { t: MotionValue<number>; at: number; hold?: number } & Parameters<typeof Bang>[0]) {
  const opacity = useTransform(t, [at - 0.004, at, at + hold, at + hold + 0.01], [0, 1, 1, 0]);
  const scale = useTransform(t, [at - 0.004, at, at + 0.006, at + 0.012], [0.3, 1.3, 0.95, 1]);
  const stepped = useTransform(scale, (v) => Math.round(v * 8) / 8);
  return (
    <motion.div className={`bang-wrap ${props.className ?? ""}`} style={{ opacity, scale: stepped, ...props.style }}>
      <Bang {...props} className="" style={undefined} />
    </motion.div>
  );
}

/** Display text with CMYK misregistration (used for in-world type). */
export function Cmyk({ text, className = "", as: Tag = "span" }: { text: string; className?: string; as?: "span" | "h1" | "h2" }) {
  return (
    <Tag className={`cmyk ${className}`} data-text={text}>
      {text}
    </Tag>
  );
}

export function LinkPill({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  const ext = href.startsWith("http");
  return (
    <a className={`pill ${className}`} href={href} target={ext ? "_blank" : undefined} rel={ext ? "noreferrer" : undefined}>
      {children}
    </a>
  );
}

/**
 * Chromatic depth of field. Renders the drawing three times: a cyan copy shifted
 * left, a magenta copy shifted right (screen blend), and the sharp one on top.
 * `amount` is the offset in px as a motion value; 0 = in focus.
 */
export function Chroma({ render, amount, className = "", style }: { render: (mono?: string) => ReactNode; amount: MotionValue<number>; className?: string; style?: CSSProperties }) {
  const cx = useTransform(amount, (v) => -v);
  const op = useTransform(amount, [0, 1, 8], [0, 0.55, 0.7]);
  return (
    <div className={`chroma ${className}`} style={style}>
      <motion.div className="chroma-copy" style={{ x: cx, opacity: op }} aria-hidden="true">{render("#19d9ff")}</motion.div>
      <motion.div className="chroma-copy" style={{ x: amount, opacity: op }} aria-hidden="true">{render("#ff2e88")}</motion.div>
      <div className="chroma-sharp">{render()}</div>
    </div>
  );
}
