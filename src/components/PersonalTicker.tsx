"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/data/site";

export function PersonalTicker() {
  const items = siteConfig.tickerIdentifiers;
  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden border-y border-[var(--border-medium)] bg-[var(--bg-surface)]/90 py-3">
      <motion.div
        className="flex gap-8 whitespace-nowrap font-mono text-sm text-[var(--text-secondary)]"
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "loop" }}
        aria-hidden
      >
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="inline-flex items-center gap-8">
            <span>{item}</span>
            <span className="text-[var(--text-muted)]">•</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
