"use client";

import { motion } from "framer-motion";
import { loungeContent } from "@/data/lounge";
import { DiagonalRouteLine } from "@/components/ui/DiagonalRouteLine";

export function LoungePanel() {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="absolute bottom-1/3 right-0 w-48 h-24 opacity-15 pointer-events-none">
        <DiagonalRouteLine direction="rtl" />
      </div>

      <div className="mx-auto max-w-2xl ml-0 sm:ml-8 lg:ml-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 p-8 sm:p-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">
            Lounge
          </p>
          <h1 className="text-2xl sm:text-3xl font-light text-[var(--text-primary)] mb-6">
            {loungeContent.headline}
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-10">
            {loungeContent.blurb}
          </p>

          <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Interests
          </h2>
          <ul className="flex flex-wrap gap-2">
            {loungeContent.interests.map((interest, i) => (
              <motion.li
                key={interest}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08 * i }}
              >
                <span className="inline-block px-4 py-2 text-sm text-[var(--text-secondary)] bg-[var(--bg-dark)]/60 rounded-full border border-[var(--border-subtle)]">
                  {interest}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
