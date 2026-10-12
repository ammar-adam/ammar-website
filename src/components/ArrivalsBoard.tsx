"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { AirportIcon } from "@/components/AirportIcon";
import { BackgroundPeople } from "@/components/BackgroundPeople";
import { silhouetteImages } from "@/data/silhouettes";

export function ArrivalsBoard() {
  return (
    <section className="arrivals-section relative py-10 sm:py-14 px-4 sm:px-6 lg:px-12 z-10 overflow-hidden">
      <BackgroundPeople section="arrivals" images={silhouetteImages.arrivals} />
      <div className="absolute top-1/4 left-0 w-40 h-20 opacity-20 pointer-events-none">
        <div className="h-px bg-[var(--border-subtle)]" />
      </div>

      <div className="mx-auto max-w-4xl relative">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start gap-2"
        >
          <AirportIcon src="/airport-icons/suitcase-2.svg" className="w-8 h-8 opacity-[0.10] flex-shrink-0 mt-0.5" />
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1 font-display">
              Experiences
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Where I have been and what has landed so far.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 grid-rows-[auto] arrivals-grid-strict">
          {arrivals.map((a, i) => (
            <motion.div
              key={a.slug}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="min-h-0"
            >
              <Link
                href={`/arrivals/${a.slug}`}
                className="arrival-card block group h-full flex flex-col"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-1 block">
                  FROM {a.from.toUpperCase()}
                </span>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1 font-display">
                  {a.title}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2 flex-1">
                  {a.impact}
                </p>
                {a.status && (
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)] mb-2 block">
                    Status: {a.status}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent-warm)] group-hover:gap-3 transition-[gap] mt-auto">
                  Details
                  <span aria-hidden>→</span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
