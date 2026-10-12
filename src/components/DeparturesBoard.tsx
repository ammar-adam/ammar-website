"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BoardingModal } from "@/components/BoardingModal";
import { BoardingTransition } from "@/components/BoardingTransition";
import { DeparturesBoardDisplay } from "@/components/DeparturesBoardDisplay";
import { AirportIcon } from "@/components/AirportIcon";
import { BackgroundPeople } from "@/components/BackgroundPeople";
import { silhouetteImages } from "@/data/silhouettes";
import { projects } from "@/data/departures";

export function DeparturesBoard() {
  const router = useRouter();
  const [boardingSlug, setBoardingSlug] = useState<string | null>(null);
  const [transitionSlug, setTransitionSlug] = useState<string | null>(null);
  const project = boardingSlug
    ? projects.find((p) => p.slug === boardingSlug)
    : null;

  const handleBoard = useCallback((slug: string) => {
    setTransitionSlug(slug);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    if (transitionSlug) {
      router.push(`/departures/${transitionSlug}`);
      setTransitionSlug(null);
    }
    setBoardingSlug(null);
  }, [router, transitionSlug]);

  return (
    <>
      <section className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-12 z-10 overflow-hidden">
        <BackgroundPeople section="departures" images={silhouetteImages.departures} />
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-start gap-2"
          >
            <AirportIcon src="/airport-icons/gate-sign.svg" className="w-5 h-5 opacity-[0.12] flex-shrink-0 mt-0.5" />
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Departures
              </h1>
              <p className="font-body text-base font-semibold text-[var(--accent-warm)] mb-1">
                Don&apos;t miss your flight.
              </p>
              <p className="font-body text-sm text-[var(--text-secondary)]">
                Everything here started with a problem I wanted to understand better. I try to build things end to end, even if the first version is rough. Some of these projects are still boarding. Some have already departed. Descriptions are intentionally high level.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="departures-board-mounted relative mt-6"
          >
            <div className="mount-bracket mount-tl" aria-hidden />
            <div className="mount-bracket mount-tr" aria-hidden />
            <div className="mount-bracket mount-bl" aria-hidden />
            <div className="mount-bracket mount-br" aria-hidden />
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
