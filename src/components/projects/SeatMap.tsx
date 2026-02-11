"use client";

import type { Project } from "@/data/projects";

/** 2-aisle-2 layout: Row 1 has 4 seats, Row 2 has 2 seats. Aisle runs full height. */
const ROWS = [1, 2];
const SEATS_LEFT = ["A", "B"];
const SEATS_RIGHT = ["C", "D"];

function seatId(row: number, seat: string): string {
  return `${row}${seat}`;
}

interface SeatMapProps {
  projects: Project[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
}

export function SeatMap({ projects, selectedSlug, onSelect }: SeatMapProps) {
  const bySeat: Record<string, Project> = {};
  let idx = 0;
  for (const row of ROWS) {
    for (const s of [...SEATS_LEFT, ...SEATS_RIGHT]) {
      if (idx >= projects.length) break;
      bySeat[seatId(row, s)] = projects[idx];
      idx++;
    }
  }

  return (
    <div className="seat-map-section">
      <p className="airport-signage-label mb-3">Gate A · Seat map</p>
      <div className="plane-cabin seat-map-layout">
        <div className="seat-map-left flex flex-col gap-3">
          {ROWS.map((row) => (
            <div key={row} className="seat-map-row flex gap-2">
              {SEATS_LEFT.map((seat) => {
                const id = seatId(row, seat);
                const project = bySeat[id];
                if (!project) return null;
                const isSelected = selectedSlug === project.slug;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelect(isSelected ? null : project.slug)}
                    className={`plane-seat seat-uniform flex flex-col justify-center min-h-[72px] w-full rounded-lg border-2 px-3 py-2.5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] focus:ring-offset-2 focus:ring-offset-[var(--bg-deep)] ${
                      isSelected
                        ? "seat--selected border-[var(--accent-warm)] bg-[var(--accent-warm-dim)]"
                        : "border-[var(--border-medium)] bg-[var(--bg-elevated)] hover:border-[var(--border-accent)]"
                    }`}
                  >
                    <span className="font-mono text-xs font-bold text-[var(--text-tertiary)]">
                      Row {row} · {seat}
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-primary)] truncate mt-0.5">
                      {project.destination}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="seat-map-aisle" aria-hidden>
          <div className="aisle-line" />
          <span className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest">Aisle</span>
        </div>

        <div className="seat-map-right flex flex-col gap-3">
          {ROWS.map((row) => (
            <div key={row} className="seat-map-row flex gap-2">
              {SEATS_RIGHT.map((seat) => {
                const id = seatId(row, seat);
                const project = bySeat[id];
                if (!project) return <div key={id} className="seat-uniform min-h-[72px] w-full rounded-lg border-2 border-transparent bg-transparent" aria-hidden />;
                const isSelected = selectedSlug === project.slug;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelect(isSelected ? null : project.slug)}
                    className={`plane-seat seat-uniform flex flex-col justify-center min-h-[72px] w-full rounded-lg border-2 px-3 py-2.5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] focus:ring-offset-2 focus:ring-offset-[var(--bg-deep)] ${
                      isSelected
                        ? "seat--selected border-[var(--accent-warm)] bg-[var(--accent-warm-dim)]"
                        : "border-[var(--border-medium)] bg-[var(--bg-elevated)] hover:border-[var(--border-accent)]"
                    }`}
                  >
                    <span className="font-mono text-xs font-bold text-[var(--text-tertiary)]">
                      Row {row} · {seat}
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-primary)] truncate mt-0.5">
                      {project.destination}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
