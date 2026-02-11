"use client";

import Link from "next/link";

const ROWS = [
  { gate: "A", destination: "Projects", info: "Things I built", status: "→", href: "/projects" },
  { gate: "B", destination: "Experiences", info: "Experience landed", status: "→", href: "/arrivals" },
  { gate: "C", destination: "About", info: "Who I am", status: "→", href: "/about" },
  { gate: "D", destination: "Resume", info: "Boarding pass PDF", status: "↓", href: "/resume" },
] as const;

export function TerminalDirectoryBoard() {
  return (
    <div className="directory-board-wrap departures-board departures-board-mounted directory-sign-3d" role="navigation" aria-label="Terminal Directory">
      <div className="mount-bracket mount-tl" aria-hidden />
      <div className="mount-bracket mount-tr" aria-hidden />
      <div className="mount-bracket mount-bl" aria-hidden />
      <div className="mount-bracket mount-br" aria-hidden />
      <table className="directory-table">
        <thead>
          <tr>
            <th className="gate-col">Gate</th>
            <th className="destination-col">Destination</th>
            <th className="info-col">Info</th>
            <th className="cta-col">Status</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ gate, destination, info, status, href }) => (
            <tr key={gate} className="directory-row">
              <td colSpan={4} className="p-0">
                <Link
                  href={href}
                  className="directory-row-link directory-row-grid flex w-full items-center"
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
  );
}
