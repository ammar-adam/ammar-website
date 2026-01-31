"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { projects } from "@/data/departures";
import { BoardingModal } from "@/components/BoardingModal";
import { PlaneIcon } from "@/components/ui/PlaneIcon";
import { RouteLine } from "@/components/ui/RouteLine";

export function DeparturesBoard() {
  const [boardingSlug, setBoardingSlug] = useState<string | null>(null);
  const project = boardingSlug
    ? projects.find((p) => p.slug === boardingSlug)
    : null;

  return (
    <>
      <section className="py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500 mb-4">
              <PlaneIcon className="w-3.5 h-3.5" />
              Departures
            </span>
            <h1 className="text-2xl sm:text-3xl font-light text-neutral-900">
              Board a flight to explore
            </h1>
          </motion.div>

          <ul className="space-y-2">
            {projects.map((p, i) => (
              <motion.li
                key={p.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <button
                  type="button"
                  onClick={() => setBoardingSlug(p.slug)}
                  className="group/card w-full text-left p-4 sm:p-5 rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
                >
                  <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-neutral-500 uppercase tracking-wider">
                        {p.city}
                      </p>
                      <p className="text-base font-medium text-neutral-900 mt-0.5">
                        {p.routeName}
                      </p>
                      <p className="text-sm text-neutral-600 mt-1 line-clamp-1">
                        {p.shortDesc}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-sm text-neutral-400 group-hover:text-neutral-600 transition-colors">
                      Board flight →
                    </span>
                  </div>
                  <div className="mt-3 text-neutral-300 group-hover/card:text-neutral-400 transition-colors">
                    <RouteLine
                      className="h-2 w-full"
                      orientation="horizontal"
                    />
                  </div>
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {project && (
        <BoardingModal
          isOpen={!!boardingSlug}
          onClose={() => setBoardingSlug(null)}
          city={project.city}
          slug={project.slug}
        />
      )}
    </>
  );
}
