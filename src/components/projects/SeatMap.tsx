"use client";

import type { Project } from "@/data/projects";

const ROWS = [1, 2, 3];
const SEATS = ["A", "B"];

function seatId(row: number, seat: string): string {
  return `${row}${seat}`;
}

/** Map project index to seat label (e.g. 0 -> "1A") for gate display */
export function getSeatLabelForIndex(index: number): string | null {
  if (index < 0 || index >= 6) return null;
  const row = Math.floor(index / 2) + 1;
  const seat = index % 2 === 0 ? "A" : "B";
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
    for (const seat of SEATS) {
      if (idx >= projects.length) break;
      bySeat[seatId(row, seat)] = projects[idx];
      idx++;
    }
  }

  return (
    <div className="seat-map-section">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--metal-gray)] mb-3 terminal-code">
        Gate A · Seat map
      </p>

      <div className="plane-cabin-narrow">
        <div className="plane-nose plane-nose-narrow" aria-hidden>
          <div className="cockpit-windows">
            <div className="cockpit-window-left" />
            <div className="cockpit-window-right" />
          </div>
        </div>

        <div className="seat-columns-narrow">
          <span aria-hidden />
          <span className="column-label">A</span>
          <span className="aisle-label-narrow">Aisle</span>
          <span className="column-label">B</span>
        </div>

        {ROWS.map((row) => {
          const projA = bySeat[seatId(row, "A")];
          const projB = bySeat[seatId(row, "B")];
          return (
            <div key={row} className="seat-row-narrow">
              <span className="row-number" aria-hidden>{row}</span>
              {projA ? (
                <button
                  type="button"
                  onClick={() => onSelect(selectedSlug === projA.slug ? null : projA.slug)}
                  className="plane-seat-narrow"
                  data-selected={selectedSlug === projA.slug ? "true" : "false"}
                >
                  <span className="seat-code">{row}A</span>
                  <span className="seat-project-name">{projA.destination}</span>
                </button>
              ) : (
                <div className="plane-seat-narrow empty" aria-hidden>
                  <span className="seat-code">{row}A</span>
                  <span className="seat-project-name">Available</span>
                </div>
              )}
              <div className="aisle-gap-narrow" aria-hidden />
              {projB ? (
                <button
                  type="button"
                  onClick={() => onSelect(selectedSlug === projB.slug ? null : projB.slug)}
                  className="plane-seat-narrow"
                  data-selected={selectedSlug === projB.slug ? "true" : "false"}
                >
                  <span className="seat-code">{row}B</span>
                  <span className="seat-project-name">{projB.destination}</span>
                </button>
              ) : (
                <div className="plane-seat-narrow empty" aria-hidden>
                  <span className="seat-code">{row}B</span>
                  <span className="seat-project-name">Available</span>
                </div>
              )}
            </div>
          );
        })}

        <div className="plane-tail-narrow" aria-hidden />
      </div>
    </div>
  );
}
