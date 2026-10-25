"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import type { useSeg } from "./timeline";

/* Root element of a segment: hard-cut opacity, visibility, glitch slices on
   exit, z-order, and a data-active flag that pauses CSS loops when hidden. */
export function SegRoot({ seg, className = "", children }: { seg: ReturnType<typeof useSeg>; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useMotionValueEvent(seg.active, "change", (v) => {
    ref.current?.setAttribute("data-active", v);
  });
  return (
    <motion.div
      ref={ref}
      className={`seg ${className}`}
      data-active={seg.active.get()}
      style={{ opacity: seg.opacity, visibility: seg.visibility, clipPath: seg.clipPath, x: seg.x, zIndex: seg.zIndex }}
    >
      {children}
    </motion.div>
  );
}
