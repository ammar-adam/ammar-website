"use client";

import { motion } from "framer-motion";

/**
 * Faint route line with a dot that moves slowly along it.
 * Ambient, radar-like. Hidden when prefers-reduced-motion.
 */
export function AmbientRouteWithPlane({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden motion-reduce:opacity-0 ${className}`} aria-hidden>
      <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
        <path
          d="M 0 10 L 100 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 4"
          className="text-[var(--text-muted)]/20"
        />
      </svg>
      <motion.div
        className="absolute top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-[var(--text-muted)]/40"
        style={{ left: 0 }}
        animate={{ left: ["0%", "100%"] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "loop" }}
      />
    </div>
  );
}
