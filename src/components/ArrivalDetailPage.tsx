"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Arrival } from "@/data/arrivals";
import { BaggageCard } from "@/components/BaggageCard";

interface ArrivalDetailPageProps {
  arrival: Arrival;
}

export function ArrivalDetailPage({ arrival }: ArrivalDetailPageProps) {
  const [beltPaused, setBeltPaused] = useState(false);
  const artifacts = arrival.artifacts ?? [];

  return (
    <article className="page-level-gate density-compact py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
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

        <div className="baggage-claim relative">
          <div className="carousel-zone-marker" aria-hidden>
            <span className="zone-number">Zone</span>
            <span className="zone-label">Baggage Claim</span>
          </div>
          <div className="claim-header mb-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
              Baggage Claim
            </h2>
          </div>

          <div className="conveyor-belt my-8 overflow-hidden rounded-xl">
                <div
                  className={`belt-track flex gap-8 py-5 ${beltPaused ? "belt-paused" : ""}`}
                >
                  {[...artifacts, ...artifacts].map((a, i) => (
                    <BaggageCard key={`${a.label}-${i}`} artifact={a} />
                  ))}
                </div>
          </div>
          <div className="belt-controls flex justify-center mt-4">
            <button
              type="button"
              onClick={() => setBeltPaused((p) => !p)}
              className="belt-toggle flex items-center gap-3 font-mono text-sm text-[var(--text-secondary)] bg-[rgba(47,55,66,0.6)] border border-[var(--border-medium)] rounded-lg px-5 py-2.5 cursor-pointer transition-all hover:bg-[rgba(47,55,66,0.9)] hover:border-[var(--accent-warm)] hover:text-[var(--accent-warm)]"
            >
              {beltPaused ? (
                <svg viewBox="0 0 24 24" width="18" className="text-[var(--accent-warm)]" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" className="text-[var(--accent-warm)]" fill="currentColor">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                </svg>
              )}
              <span>{beltPaused ? "Resume belt" : "Pause belt"}</span>
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="claim-details rounded-[var(--radius-panel)] border border-[var(--accent-warm)]/20 bg-[var(--accent-warm-dim)] p-5 mb-6"
          >
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-mono">
              FROM {arrival.from.toUpperCase()}
            </span>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] mt-1 font-display">
              {arrival.title}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5">{arrival.impact}</p>
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
      </div>
    </article>
  );
}
