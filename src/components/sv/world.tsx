"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";

/* Environment layers: sky, wet apron, light pools, haze, spray speckle.
   All pure CSS gradients; moved with transforms only. */

export type SkyName = "night" | "dusk" | "dawn" | "cold" | "black";

/** Sky: two gradient layers crossfaded by p. */
export function Sky({ p, from, to }: { p: MotionValue<number>; from: SkyName; to: SkyName }) {
  const opTo = useTransform(p, [0.1, 0.9], [0, 1]);
  return (
    <div className="sky" aria-hidden="true">
      <div className={`sky-l sky-${from}`} />
      {to !== from && <motion.div className={`sky-l sky-${to}`} style={{ opacity: opTo }} />}
    </div>
  );
}

/** Wet apron with runway lights receding; `x` dollies it. */
export function Apron({ x, tone = "night", className = "" }: { x?: MotionValue<number>; tone?: "night" | "cold" | "warm"; className?: string }) {
  return (
    <motion.div className={`apron apron-${tone} ${className}`} style={{ x }} aria-hidden="true">
      <div className="apron-lights" />
      <div className="apron-streaks" />
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

/** Atmospheric haze band. */
export function Haze({ className = "" }: { className?: string }) {
  return <div className={`haze ${className}`} aria-hidden="true" />;
}
