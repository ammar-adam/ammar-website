"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Short "boarding" transition — plane moves forward, then onComplete.
 * Minimal. Plane hidden when prefers-reduced-motion.
 */
export function BoardingTransition({
  isActive,
  onComplete,
}: {
  isActive: boolean;
  onComplete: () => void;
}) {
  useEffect(() => {
    if (!isActive) return;
    const id = setTimeout(onComplete, 700);
    return () => clearTimeout(id);
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[var(--bg-deep)]/95 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="motion-reduce:hidden">
            <motion.div
              className="w-5 h-5"
              initial={{ x: -80, opacity: 0.4 }}
              animate={{ x: 80, opacity: 0.7 }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[var(--text-muted)]">
                <path d="M22 2 2 12l8 2 4 8 4-10 4-10Z" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
