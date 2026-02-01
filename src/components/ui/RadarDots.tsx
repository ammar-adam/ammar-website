"use client";

import { motion } from "framer-motion";

const DOT_COUNT = 12;

export function RadarDots({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden
    >
      {Array.from({ length: DOT_COUNT }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[var(--accent-warm)]/25"
          style={{
            left: `${15 + (i * 7) % 70}%`,
            top: `${10 + (i * 11) % 80}%`,
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 2 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}
