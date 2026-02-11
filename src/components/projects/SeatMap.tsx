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
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--metal-gray)] mb-3">
        Gate A · Seat map
      </p>
      <div className="flex items-center gap-2 mb-2 pl-6">
        <span className="w-[140px] text-center font-mono text-[10px] font-bold text-[var(--departure-amber)]">A</span>
        <span className="w-[140px] text-center font-mono text-[10px] font-bold text-[var(--departure-amber)]">B</span>
        <span className="w-6" aria-hidden />
        <span className="w-[140px] text-center font-mono text-[10px] font-bold text-[var(--departure-amber)]">C</span>
        <span className="w-[140px] text-center font-mono text-[10px] font-bold text-[var(--departure-amber)]">D</span>
      </div>
      <div className="plane-cabin seat-map-layout">
        <div className="seat-map-left flex flex-col gap-3">
          {ROWS.map((row) => (
            <div key={row} className="seat-map-row flex gap-2 items-center">
              <span className="w-6 flex-shrink-0 font-mono text-xs font-bold text-[var(--metal-gray)]" aria-hidden>
                {row}
              </span>
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
                    className={`plane-seat flex flex-col justify-end pb-3 pt-10 px-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[var(--departure-amber)] focus:ring-offset-2 focus:ring-offset-[var(--terminal-navy)] ${isSelected ? "seat--selected" : ""}`}
                  >
                    <span className="font-mono text-[10px] text-[var(--metal-gray)]">
                      {row}{seat}
                    </span>
                    <span className="text-xs font-semibold text-[var(--window-white)] truncate mt-0.5 leading-tight">
                      {project.destination}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="seat-map-aisle flex flex-col justify-center items-center" aria-hidden>
          <div className="aisle-line" />
          <span className="font-mono text-[9px] text-[var(--metal-gray)] uppercase tracking-widest mt-1">Aisle</span>
        </div>

        <div className="seat-map-right flex flex-col gap-3">
          {ROWS.map((row) => (
            <div key={row} className="seat-map-row flex gap-2 items-center">
              <span className="w-6 flex-shrink-0" aria-hidden />
              {SEATS_RIGHT.map((seat) => {
                const id = seatId(row, seat);
                const project = bySeat[id];
                if (!project)
                  return (
                    <div
                      key={id}
                      className="plane-seat opacity-0 pointer-events-none flex-shrink-0"
                      style={{ minWidth: 140 }}
                      aria-hidden
                    />
                  );
                const isSelected = selectedSlug === project.slug;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelect(isSelected ? null : project.slug)}
                    className={`plane-seat flex flex-col justify-end pb-3 pt-10 px-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[var(--departure-amber)] focus:ring-offset-2 focus:ring-offset-[var(--terminal-navy)] ${isSelected ? "seat--selected" : ""}`}
                  >
                    <span className="font-mono text-[10px] text-[var(--metal-gray)]">
                      {row}{seat}
                    </span>
                    <span className="text-xs font-semibold text-[var(--window-white)] truncate mt-0.5 leading-tight">
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
