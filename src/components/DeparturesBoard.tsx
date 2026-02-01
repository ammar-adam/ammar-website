"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BoardingModal } from "@/components/BoardingModal";
import { BoardingTransition } from "@/components/BoardingTransition";
import { DeparturesBoardDisplay } from "@/components/DeparturesBoardDisplay";
import { projects } from "@/data/departures";

export function DeparturesBoard() {
  const router = useRouter();
  const [boardingSlug, setBoardingSlug] = useState<string | null>(null);
  const [transitionSlug, setTransitionSlug] = useState<string | null>(null);
  const project = boardingSlug
    ? projects.find((p) => p.slug === boardingSlug)
    : null;

  const handleBoard = useCallback(
    (slug: string) => {
      setTransitionSlug(slug);
    },
    []
  );

  const handleTransitionComplete = useCallback(() => {
    if (transitionSlug) {
      router.push(`/departures/${transitionSlug}`);
      setTransitionSlug(null);
    }
    setBoardingSlug(null);
  }, [router, transitionSlug]);

  return (
    <>
      <section className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 ml-0 sm:ml-4"
          >
            <h1 className="text-2xl sm:text-3xl font-light text-[var(--text-primary)]">
              Departures
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              A few things I'm getting ready to ship.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <DeparturesBoardDisplay
              variant="hero"
              onSelectFlight={setBoardingSlug}
            />
          </motion.div>
        </div>
      </section>

      {project && (
        <BoardingModal
          isOpen={!!boardingSlug}
          onClose={() => setBoardingSlug(null)}
          onBoard={handleBoard}
          city={project.destination}
          slug={project.slug}
        />
      )}

      <BoardingTransition
        isActive={!!transitionSlug}
        onComplete={handleTransitionComplete}
      />
    </>
  );
}
