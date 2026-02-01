"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { DiagonalRouteLine } from "@/components/ui/DiagonalRouteLine";

export function ArrivalsBoard() {
  return (
    <section className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-1/4 left-0 w-40 h-20 opacity-20 pointer-events-none">
        <DiagonalRouteLine direction="ltr" />
      </div>

      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 ml-0 sm:ml-6"
        >
          <h1 className="text-2xl sm:text-3xl font-light text-[var(--text-primary)]">
            Arrivals
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Pick up what landed. Experiences, lessons, things that made it here.
          </p>
        </motion.div>

        <div className="space-y-4">
          {arrivals.map((a, i) => (
            <motion.div
              key={a.slug}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              style={{ marginLeft: i % 2 === 0 ? 0 : "1rem" }}
            >
              <Link
                href={`/arrivals/${a.slug}`}
                className="group block p-6 sm:p-8 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 hover:bg-[var(--bg-elevated)]/70 hover:border-[var(--accent-amber)]/30 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-amber)] focus:ring-offset-2 focus:ring-offset-[var(--bg-dark)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-mono">
                      From {a.from}
                    </span>
                    <h2 className="text-lg font-medium text-[var(--text-primary)] mt-1 group-hover:text-[var(--accent-amber)] transition-colors">
                      {a.title}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">{a.shortDesc}</p>
                  </div>
                  <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--accent-amber)] flex items-center gap-1 transition-colors">
                    Pick up
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
