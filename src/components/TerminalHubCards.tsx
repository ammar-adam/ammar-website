"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlaneIcon } from "@/components/ui/PlaneIcon";
import { DiagonalRouteLine } from "@/components/ui/DiagonalRouteLine";
import { DeparturesBoardDisplay } from "@/components/DeparturesBoardDisplay";
import { RouteOverlay } from "@/components/ui/RouteOverlay";

const pathways = [
  {
    href: "/#departures",
    title: "Departures",
    desc: "[Things I'm getting ready to ship]",
    gate: "Gates A",
  },
  {
    href: "/#arrivals",
    title: "Arrivals",
    desc: "[What's landed — experiences, lessons]",
    gate: "Baggage",
  },
  {
    href: "/#lounge",
    title: "Lounge",
    desc: "[Relaxed. Human. Optional.]",
    gate: "Level 2",
  },
] as const;

export function TerminalHubCards() {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <RouteOverlay />

      <div className="relative mx-auto max-w-6xl flex flex-col lg:flex-row gap-12 lg:gap-16">
        <div className="flex-1 lg:max-w-2xl lg:pl-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
              Terminal
            </p>
            <h1 className="text-2xl sm:text-3xl font-light text-[var(--text-primary)]">
              Where to first?
            </h1>
          </motion.div>

          <div className="space-y-6">
            {pathways.map((path, i) => (
              <motion.div
                key={path.href}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i }}
              >
                <Link
                  href={path.href}
                  className="group block relative p-6 sm:p-8 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 hover:bg-[var(--bg-elevated)]/70 hover:border-[var(--accent-amber)]/30 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-amber)] focus:ring-offset-2 focus:ring-offset-[var(--bg-dark)] ml-0 sm:ml-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-mono">
                        {path.gate}
                      </span>
                      <h2 className="text-lg sm:text-xl font-medium text-[var(--text-primary)] mt-1">
                        {path.title}
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{path.desc}</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] group-hover:text-[var(--accent-amber)] transition-colors">
                      Head this way
                      <PlaneIcon className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 ml-0 sm:ml-2"
          >
<Link
            href="/#boarding-pass"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-amber)] transition-colors"
          >
            Boarding Pass Office →
            </Link>
          </motion.div>
        </div>

        <div className="lg:w-72 flex-shrink-0 lg:pt-16">
          <DeparturesBoardDisplay variant="mini" />
        </div>
      </div>
    </section>
  );
}
