"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlaneIcon } from "@/components/ui/PlaneIcon";
import { DeparturesBoardDisplay } from "@/components/DeparturesBoardDisplay";
import { RouteOverlay } from "@/components/ui/RouteOverlay";
import { CheckInDeskIllustration } from "@/components/ambient/CheckInDeskIllustration";
import { BackgroundPeople } from "@/components/BackgroundPeople";
import { silhouetteImages } from "@/data/silhouettes";

const pathways = [
  { href: "/#departures", title: "Departures", desc: "Things I'm getting ready to ship.", gate: "GATES A" },
  { href: "/#arrivals", title: "Arrivals", desc: "What's landed — experiences, lessons.", gate: "BAGGAGE" },
  { href: "/#lounge", title: "Lounge", desc: "Relaxed. Human. Optional.", gate: "LEVEL 2" },
] as const;

export function TerminalHubCards() {
  return (
    <section className="terminal-page relative py-14 sm:py-20 px-4 sm:px-6 lg:px-12 overflow-hidden z-10 flex flex-col lg:flex-row gap-10 lg:gap-12">
      <BackgroundPeople section="terminal" images={silhouetteImages.terminal} />
      <div className="terminal-floor-perspective" aria-hidden />
      <div className="terminal-windows" aria-hidden>
        <div className="window-pane" />
        <div className="window-pane" />
        <div className="window-pane" />
      </div>
      <div className="overhead-signage" aria-hidden>
        <div className="sign-holder">
          <span className="sign-text">← GATES A-C</span>
        </div>
        <div className="sign-holder">
          <span className="sign-text">BAGGAGE →</span>
        </div>
      </div>
      <RouteOverlay />

      <div className="flex-1 lg:max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="terminal-card__label mb-3">Terminal</p>
          <h1 className="terminal-card__title" style={{ fontSize: "var(--text-2xl)" }}>
            Terminal Directory
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">Select a concourse.</p>
        </motion.div>

        <CheckInDeskIllustration />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pathways.map((path, i) => (
            <motion.div
              key={path.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
            >
              <Link href={path.href} className="terminal-card block h-full">
                <span className="terminal-card__label">{path.gate}</span>
                <h2 className="terminal-card__title mt-2 mb-4">{path.title}</h2>
                <p className="terminal-card__description mb-4">{path.desc}</p>
                <span className="terminal-card__link inline-flex items-center gap-2 group/link">
                  View
                  <PlaneIcon className="w-4 h-4 text-[var(--accent-warm)] group-hover/link:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Link
            href="/#boarding-pass"
            className="text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--accent-warm)] transition-colors"
          >
            Boarding Pass Office →
          </Link>
        </motion.div>
      </div>

      <div className="lg:w-80 flex-shrink-0 hidden">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
          Now boarding
        </p>
        <DeparturesBoardDisplay variant="mini" />
      </div>
    </section>
  );
}
