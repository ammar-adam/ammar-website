"use client";

import { useState } from "react";
import Link from "next/link";
import { projects } from "@/data/projects";
import { SeatMap } from "./SeatMap";
import { DetailsPanel } from "@/components/shared/DetailsPanel";

export function ProjectsSeatMapPage() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedProject = selectedSlug ? projects.find((p) => p.slug === selectedSlug) : null;

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-warm)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] rounded"
          >
            ← Directory
          </Link>
          <span className="text-[var(--text-muted)]">/</span>
          <span className="font-mono text-sm text-[var(--text-secondary)]">Projects</span>
        </div>

        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1 font-display">Projects</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Select a seat to view details.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="airport-surface rounded-xl border border-[var(--border-medium)] p-6 overflow-hidden min-h-[280px]">
            <SeatMap
              projects={projects}
              selectedSlug={selectedSlug}
              onSelect={setSelectedSlug}
            />
          </div>

          <div className="elevated rounded-xl border border-[var(--border-medium)] p-5 min-h-[280px] lg:min-h-0">
            {selectedProject ? (
              <DetailsPanel variant="project" data={selectedProject} />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[280px] text-center text-[var(--text-tertiary)]">
                <p className="text-sm">Select a seat to view project details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
