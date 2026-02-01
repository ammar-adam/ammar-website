"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { AirportIcon } from "@/components/AirportIcon";

export function ArrivalsBoard() {
  return (
    <section className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-12 z-10 overflow-hidden">
      <div className="absolute top-1/4 left-0 w-40 h-20 opacity-20 pointer-events-none">
        <div className="h-px bg-[var(--border-subtle)]" />
      </div>

      <div className="mx-auto max-w-4xl relative">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex items-start gap-2"
        >
          <AirportIcon src="/airport-icons/suitcase-2.svg" className="w-9 h-9 opacity-[0.10] flex-shrink-0 mt-0.5" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-display">
              Arrivals
            </h1>
            <p className="text-base text-[var(--text-secondary)]">
              What landed. Experiences, lessons, things that made it here.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6">
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
                className="arrival-card block group"
              >
                <span className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-2 block">
                  FROM {a.from.toUpperCase()}
                </span>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display">
                  {a.title}
                </h2>
                <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-5">
                  {a.impact}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-warm)] group-hover:gap-3 transition-[gap]">
                  Details
                  <span aria-hidden>→</span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="absolute bottom-6 right-[10%] opacity-[0.08] pointer-events-none">
          <AirportIcon src="/airport-icons/trolley.svg" className="w-8 h-8" />
        </div>
      </div>
    </section>
  );
}
