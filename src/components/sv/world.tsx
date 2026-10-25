"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";

/* Environment layers: sky, stars, wet apron, light pools, spray speckle.
   All pure CSS gradients; moved with transforms only. */

export type SkyName = "night" | "dusk" | "dawn" | "cold" | "black";

/** Sky: a set of gradient layers crossfaded by opacity motion values. */
export function Sky({ p, from, to }: { p: MotionValue<number>; from: SkyName; to: SkyName }) {
  const opTo = useTransform(p, [0.1, 0.9], [0, 1]);
  return (
    <div className="sky" aria-hidden="true">
      <div className={`sky-l sky-${from}`} />
      <motion.div className={`sky-l sky-${to}`} style={{ opacity: opTo }} />
    </div>
  );
}

export function Stars({ className = "" }: { className?: string }) {
  return <div className={`stars ${className}`} aria-hidden="true" />;
}

/** Wet apron with runway lights receding; `x` dollies it. */
export function Apron({ x, tone = "night", className = "" }: { x?: MotionValue<number>; tone?: "night" | "cold" | "warm"; className?: string }) {
  return (
    <motion.div className={`apron apron-${tone} ${className}`} style={{ x }} aria-hidden="true">
      <div className="apron-lights" />
      <div className="apron-wet" />
      <div className="apron-edge" />
    </motion.div>
  );
}

/** A cone of light from above. */
export function Spot({ className = "", style, tone = "warm" }: { className?: string; style?: React.CSSProperties; tone?: "warm" | "cold" | "white" | "mag" }) {
  return <div className={`spot spot-${tone} ${className}`} style={style} aria-hidden="true" />;
}

/** Spray-paint speckle around graffiti text. */
export function Speckle({ className = "" }: { className?: string }) {
  return <div className={`speckle ${className}`} aria-hidden="true" />;
}

/** Big type painted in the world. */
export function Painted({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`painted ${className}`} style={style}>
      <Speckle />
      <span className="painted-txt">{children}</span>
    </div>
  );
}

/** Thin hand-drawn hatch strokes laid over a shadow region. */
export function Hatch({ className = "" }: { className?: string }) {
  return <div className={`hatch ${className}`} aria-hidden="true" />;
}
