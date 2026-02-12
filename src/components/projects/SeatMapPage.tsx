"use client";

import { useState } from "react";
import Link from "next/link";
import { projects } from "@/data/projects";
import { SeatMap, getSeatLabelForIndex } from "./SeatMap";
import { DetailsPanel } from "@/components/shared/DetailsPanel";

export function ProjectsSeatMapPage() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedProject = selectedSlug ? projects.find((p) => p.slug === selectedSlug) : null;
  const selectedIndex = selectedProject ? projects.findIndex((p) => p.slug === selectedSlug) : -1;
  const seatLabel = selectedIndex >= 0 ? getSeatLabelForIndex(selectedIndex) : null;

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[var(--runway-max)]">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="text-sm font-mono text-[var(--metal-gray)] hover:text-[var(--departure-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--departure-amber)] rounded"
          >
            ← Directory
          </Link>
          <span className="text-[var(--floor-line)]">/</span>
          <span className="font-mono text-sm text-[var(--metal-gray)] uppercase tracking-wider">Projects</span>
        </div>

        <h1 className="page-title text-xl font-bold text-[var(--window-white)] mb-1">Projects</h1>
        <p className="text-sm font-mono text-[var(--metal-gray)] mb-6">Select a seat to view details.</p>

        <div className="seat-map-container">
          <div className="airport-surface rounded-xl border-2 border-[var(--floor-line)] p-4 overflow-hidden min-h-[280px] flex justify-center">
            <SeatMap
              projects={projects}
              selectedSlug={selectedSlug}
              onSelect={setSelectedSlug}
            />
          </div>

          <div className="gate-display-panel min-h-[280px] lg:min-h-0">
            {selectedProject ? (
              <DetailsPanel variant="project" data={selectedProject} seatLabel={seatLabel} />
            ) : (
              <div className="gate-display-empty flex flex-col items-center justify-center min-h-[400px] text-center">
                <p className="font-mono text-sm text-[var(--metal-gray)]">Select a seat to view gate details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
