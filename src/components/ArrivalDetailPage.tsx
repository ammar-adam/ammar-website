"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Arrival } from "@/data/arrivals";

interface ArrivalDetailPageProps {
  arrival: Arrival;
}

export function ArrivalDetailPage({ arrival }: ArrivalDetailPageProps) {
  return (
    <article className="page-level-gate density-compact py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl ml-0 sm:ml-6">
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href="/#arrivals"
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-warm)] transition-colors"
          >
            ← Arrivals
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[var(--radius-panel)] border border-[var(--accent-warm)]/20 bg-[var(--accent-warm-dim)] p-5 mb-6"
        >
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-mono">
            Baggage Claim
          </span>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mt-1 font-display">
            {arrival.title}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5">{arrival.impact}</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-3">From {arrival.from}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap"
        >
          {arrival.details}
        </motion.div>
      </div>
    </article>
  );
}
