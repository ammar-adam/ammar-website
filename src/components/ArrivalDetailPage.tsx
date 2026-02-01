"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Arrival } from "@/data/arrivals";

interface ArrivalDetailPageProps {
  arrival: Arrival;
}

export function ArrivalDetailPage({ arrival }: ArrivalDetailPageProps) {
  return (
    <article className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl ml-0 sm:ml-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/arrivals"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-amber)] transition-colors"
          >
            ← Arrivals
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-[var(--accent-amber)]/20 bg-[var(--accent-amber-dim)] p-6 mb-8"
        >
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-mono">
            Baggage Claim
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-[var(--text-primary)] mt-2">
            {arrival.title}
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">{arrival.shortDesc}</p>
          <p className="text-xs text-[var(--text-muted)] mt-4">From {arrival.from}</p>
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
