"use client";

import Link from "next/link";

const ROWS = [
  { gate: "A", destination: "Projects", info: "Things I've built", status: "→", href: "/projects" },
  { gate: "B", destination: "Experiences", info: "Where I've worked", status: "→", href: "/arrivals" },
  { gate: "C", destination: "About", info: "Off the clock", status: "→", href: "/about" },
  { gate: "D", destination: "Resume", info: "The one-page version", status: "↓", href: "/resume" },
] as const;

export function TerminalDirectoryBoard() {
  return (
    <div className="directory-board-wrap directory-board-led" role="navigation" aria-label="Terminal Directory">
      <div className="directory-table-container">
      <table className="directory-table">
        <thead>
          <tr>
            <th className="gate-col">Gate</th>
            <th className="destination-col">Destination</th>
            <th className="info-col">Info</th>
            <th className="cta-col status-col">Direction</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ gate, destination, info, status, href }) => (
            <tr key={gate} className="directory-row">
              <td colSpan={4} className="p-0">
                <Link
                  href={href}
                  className="directory-row-link directory-row-grid w-full"
                >
                  <span className="gate-letter gate-col-cell">{gate}</span>
                  <span className="destination-name destination-col-cell">{destination}</span>
                  <span className="info-text info-col-cell">{info}</span>
                  <span className="status-arrow cta-col-cell" aria-hidden>{status}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
