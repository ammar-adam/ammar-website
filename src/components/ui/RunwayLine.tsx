"use client";

import { motion } from "framer-motion";

interface RunwayLineProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  dashed?: boolean;
  animated?: boolean;
}

export function RunwayLine({
  className = "",
  orientation = "horizontal",
  dashed = true,
  animated = true,
}: RunwayLineProps) {
  const isHorizontal = orientation === "horizontal";
  const path = isHorizontal ? "M 0 50 L 200 50" : "M 50 0 L 50 200";

  return (
    <motion.svg
      className={className}
      viewBox={isHorizontal ? "0 0 200 100" : "0 0 100 200"}
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray={dashed ? "8 6" : "none"}
        initial={animated ? { pathLength: 0 } : undefined}
        animate={animated ? { pathLength: 1 } : undefined}
        transition={
          animated
            ? { duration: 2, repeat: Infinity, repeatType: "reverse" }
            : undefined
        }
        className="text-slate-300/60"
      />
    </motion.svg>
  );
}
