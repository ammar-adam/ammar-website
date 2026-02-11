"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { projects } from "@/data/departures";
import { DeparturesBoardDisplay } from "@/components/DeparturesBoardDisplay";
import { AirportIcon } from "@/components/AirportIcon";

const ROWS = ["A", "B"];
const COLS_LEFT = [1, 2];
const COLS_RIGHT = [3];

export function ProjectsSeatMap() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const projectBySeat: Record<string, (typeof projects)[0]> = {};
  projects.forEach((p, i) => {
    const row = ROWS[Math.floor(i / 3)] ?? "A";
    const col = (i % 3) + 1;
    projectBySeat[`${row}${col}`] = p;
  });
  const selectedProject = selectedSlug ? projects.find((p) => p.slug === selectedSlug) : null;
  const overviewSeat = selectedProject?.seats.find((s) => s.label === "Overview") ?? selectedProject?.seats[0];

  return (
    <section className="relative py-10 sm:py-14 px-4 sm:px-6 lg:px-12 z-10 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <div className="overhead-signage departures-signage" aria-hidden>
          <div className="sign-holder">
            <span className="sign-text">Gates A–C</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start gap-2"
        >
          <AirportIcon src="/airport-icons/gate-sign.svg" className="w-6 h-6 opacity-80 flex-shrink-0 mt-0.5" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1 font-display">
              Departures
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Select a flight from the board or a seat from the map. Details appear on the right.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="departures-board-mounted relative mt-4"
        >
          <div className="mount-bracket mount-tl" aria-hidden />
          <div className="mount-bracket mount-tr" aria-hidden />
          <div className="mount-bracket mount-bl" aria-hidden />
          <div className="mount-bracket mount-br" aria-hidden />
          <DeparturesBoardDisplay
            variant="hero"
            onSelectFlight={(slug) => setSelectedSlug(slug)}
          />
        </motion.div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
          <div className="plane-seat-map-container airport-surface rounded-xl border border-[var(--border-medium)] p-5 overflow-hidden">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
              Seat map
            </p>
            <div className="plane-cabin flex gap-2">
              <div className="seat-block flex flex-col gap-2">
                {ROWS.map((row) =>
                  COLS_LEFT.map((col) => {
                    const seatId = `${row}${col}`;
                    const project = projectBySeat[seatId];
                    if (!project) return null;
                    const isSelected = selectedSlug === project.slug;
                    return (
                      <button
                        key={seatId}
                        type="button"
                        onClick={() => setSelectedSlug(project.slug)}
                        className={`plane-seat min-h-[52px] rounded border-2 px-3 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] ${
                          isSelected
                            ? "seat--selected border-[var(--accent-warm)]"
                            : "border-[var(--border-medium)] bg-[var(--bg-elevated)] hover:border-[var(--accent-warm)]/50"
                        }`}
                      >
                        <span className="font-mono text-xs font-bold text-[var(--text-tertiary)]">{seatId}</span>
                        <span className="block text-sm font-semibold text-[var(--text-primary)] truncate">{project.destination}</span>
                      </button>
                    );
                  })
                )}
              </div>
              <div className="aisle flex flex-col justify-center px-1" aria-hidden>
                <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase tracking-widest rotate-0 text-center">Aisle</span>
              </div>
              <div className="seat-block flex flex-col gap-2">
                {ROWS.map((row) =>
                  COLS_RIGHT.map((col) => {
                    const seatId = `${row}${col}`;
                    const project = projectBySeat[seatId];
                    if (!project) return null;
                    const isSelected = selectedSlug === project.slug;
                    return (
                      <button
                        key={seatId}
                        type="button"
                        onClick={() => setSelectedSlug(project.slug)}
                        className={`plane-seat min-h-[52px] rounded border-2 px-3 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] ${
                          isSelected
                            ? "seat--selected border-[var(--accent-warm)]"
                            : "border-[var(--border-medium)] bg-[var(--bg-elevated)] hover:border-[var(--accent-warm)]/50"
                        }`}
                      >
                        <span className="font-mono text-xs font-bold text-[var(--text-tertiary)]">{seatId}</span>
                        <span className="block text-sm font-semibold text-[var(--text-primary)] truncate">{project.destination}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="project-detail-panel elevated rounded-xl border border-[var(--border-medium)] p-5 min-h-[280px]">
            {selectedProject && overviewSeat ? (
              <>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  {selectedProject.screenshot && (
                    <div className="flex-shrink-0 w-full sm:w-40 h-28 rounded-lg overflow-hidden bg-[var(--bg-surface)]">
                      <img
                        src={selectedProject.screenshot}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <span className="font-mono text-[10px] text-[var(--accent-warm)]">{selectedProject.flightCode}</span>
                    <h2 className="text-lg font-bold text-[var(--text-primary)] font-display">{selectedProject.destination}</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">{selectedProject.shortDesc}</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {overviewSeat.content}
                </p>
                <Link
                  href={`/departures/${selectedProject.slug}`}
                  className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-[var(--accent-warm)] hover:text-[var(--accent-glow)]"
                >
                  Full project details
                  <span aria-hidden>→</span>
                </Link>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[240px] text-center text-[var(--text-tertiary)]">
                <AirportIcon src="/airport-icons/gate-sign.svg" className="w-10 h-10 opacity-40 mb-3" />
                <p className="text-sm">Select a flight from the board or a seat from the map.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
