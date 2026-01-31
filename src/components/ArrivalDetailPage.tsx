"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Arrival } from "@/data/arrivals";

interface ArrivalDetailPageProps {
  arrival: Arrival;
}

export function ArrivalDetailPage({ arrival }: ArrivalDetailPageProps) {
  return (
    <article className="py-12 sm:py-16 px-4">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/arrivals"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            ← Arrivals
          </Link>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            From {arrival.from}
          </p>
          <h1 className="text-2xl sm:text-3xl font-light text-neutral-900 mt-1">
            {arrival.title}
          </h1>
          <p className="text-neutral-600 mt-2">{arrival.shortDesc}</p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap"
        >
          {arrival.details}
        </motion.div>
      </div>
    </article>
  );
}
