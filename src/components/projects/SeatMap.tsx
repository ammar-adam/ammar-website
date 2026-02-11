"use client";

import type { Project } from "@/data/projects";

const ROWS = [1, 2];
const SEATS_LEFT = ["A", "B"];
const SEATS_RIGHT = ["C", "D"];

function seatId(row: number, seat: string): string {
  return `${row}${seat}`;
}

/** Map project index to seat label (e.g. 0 -> "1A") for boarding pass */
export function getSeatLabelForIndex(index: number): string | null {
  let idx = 0;
  for (const row of ROWS) {
    for (const s of [...SEATS_LEFT, ...SEATS_RIGHT]) {
      if (idx === index) return `${row}${s}`;
      idx++;
    }
  }
  return null;
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
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--metal-gray)] mb-3 terminal-code">
        Gate A · Seat map
      </p>

      <div className="plane-cabin-wrap">
        <div className="plane-nose" aria-hidden>
          <div className="cockpit-window" />
        </div>

        <div className="seat-columns">
          <span className="w-10" aria-hidden />
          <span className="column-label">A</span>
          <span className="column-label">B</span>
          <span className="aisle-label">Aisle</span>
          <span className="column-label">C</span>
          <span className="column-label">D</span>
        </div>

        {ROWS.map((row) => (
          <div key={row} className="seat-row">
            <span className="row-number" aria-hidden>
              {row}
            </span>
            {SEATS_LEFT.map((seat) => {
              const id = seatId(row, seat);
              const project = bySeat[id];
              if (!project) return <div key={id} className="plane-seat empty opacity-50 cursor-not-allowed" style={{ width: 120, minHeight: 140 }} aria-hidden />;
              const isSelected = selectedSlug === project.slug;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelect(isSelected ? null : project.slug)}
                  className="plane-seat flex flex-col justify-end pb-3 pt-10 px-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[var(--departure-amber)] focus:ring-offset-2 focus:ring-offset-[var(--terminal-navy)]"
                  data-selected={isSelected ? "true" : "false"}
                >
                  <span className="seat-label">{row}{seat}</span>
                  <span className="seat-project">{project.destination}</span>
                </button>
              );
            })}
            <div className="aisle-space" aria-hidden />
            {SEATS_RIGHT.map((seat) => {
              const id = seatId(row, seat);
              const project = bySeat[id];
              if (!project)
                return (
                  <div
                    key={id}
                    className="plane-seat empty opacity-50 cursor-not-allowed flex flex-col justify-end pb-3 pt-10 px-2"
                    style={{ width: 120, minHeight: 140 }}
                    aria-hidden
                  >
                    <span className="seat-label text-[var(--metal-gray)]">{row}{seat}</span>
                    <span className="seat-project text-[var(--metal-gray)] text-xs">Available</span>
                  </div>
                );
              const isSelected = selectedSlug === project.slug;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelect(isSelected ? null : project.slug)}
                  className="plane-seat flex flex-col justify-end pb-3 pt-10 px-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[var(--departure-amber)] focus:ring-offset-2 focus:ring-offset-[var(--terminal-navy)]"
                  data-selected={isSelected ? "true" : "false"}
                >
                  <span className="seat-label">{row}{seat}</span>
                  <span className="seat-project">{project.destination}</span>
                </button>
              );
            })}
          </div>
        ))}

        <div className="plane-tail" aria-hidden />
      </div>
    </div>
  );
}
