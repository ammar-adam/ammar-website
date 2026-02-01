"use client";

import { motion } from "framer-motion";

/**
 * Route line with moving dot — suggests direction, movement
 */
export function AnimatedRouteLine({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`relative h-1 w-full ${className}`} aria-hidden>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 200 20"
        preserveAspectRatio="none"
      >
        <path
          d="M 0 10 L 200 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="4 6"
          className="text-[var(--text-muted)]/40"
        />
      </svg>
      <motion.div
        className="absolute top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-[var(--accent-amber)]/80"
        animate={{ left: ["0%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "loop" }}
      />
    </div>
  );
}
