"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlaneIcon } from "@/components/ui/PlaneIcon";

const hubCards = [
  {
    href: "/departures",
    title: "Departures",
    desc: "[Projects — routes you can board]",
  },
  {
    href: "/arrivals",
    title: "Arrivals",
    desc: "[Experiences — what has landed]",
  },
  {
    href: "/lounge",
    title: "Lounge",
    desc: "[Personality — relaxed, human]",
  },
] as const;

export function TerminalHubCards() {
  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500 mb-4">
            <PlaneIcon className="w-3.5 h-3.5" />
            Terminal
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-neutral-900">
            Where would you like to go?
          </h1>
        </motion.div>

        <div className="grid gap-4 sm:gap-6">
          {hubCards.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.35 }}
            >
              <Link
                href={card.href}
                className="group block p-6 sm:p-8 rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-medium text-neutral-900 group-hover:text-neutral-700 transition-colors">
                      {card.title}
                    </h2>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {card.desc}
                    </p>
                  </div>
                  <span className="text-sm text-neutral-400 group-hover:text-neutral-600 transition-colors">
                    →
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
          className="mt-8 text-center"
        >
          <Link
            href="/boarding-pass"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors underline underline-offset-4"
          >
            Boarding Pass (Resume)
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
