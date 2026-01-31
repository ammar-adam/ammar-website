"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { PlaneIcon } from "@/components/ui/PlaneIcon";

export function ArrivalsBoard() {
  return (
    <section className="py-12 sm:py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500 mb-4">
            <PlaneIcon className="w-3.5 h-3.5" />
            Arrivals
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-neutral-900">
            Pick up an arrival
          </h1>
        </motion.div>

        <ul className="space-y-2">
          {arrivals.map((a, i) => (
            <motion.li
              key={a.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Link
                href={`/arrivals/${a.slug}`}
                className="block group p-4 sm:p-5 rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
              >
                <div className="flex items-start sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">
                      From {a.from}
                    </p>
                    <p className="text-base font-medium text-neutral-900 mt-0.5">
                      {a.title}
                    </p>
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-1">
                      {a.shortDesc}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-sm text-neutral-400 group-hover:text-neutral-600 transition-colors">
                    Pick up arrival →
                  </span>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
