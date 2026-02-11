"use client";

import Link from "next/link";

const ROWS = [
  { gate: "A", destination: "Projects", info: "Things I built", cta: "→", href: "/projects" },
  { gate: "B", destination: "Arrivals", info: "Experience landed", cta: "→", href: "/arrivals" },
  { gate: "C", destination: "About", info: "Who I am", cta: "→", href: "/about" },
  { gate: "D", destination: "Resume", info: "Boarding pass PDF", cta: "↓", href: "/resume" },
] as const;

export function TerminalDirectoryBoard() {
  return (
    <div
      className="departures-board elevated overflow-hidden w-full max-w-3xl departures-board-mounted border-2 border-[var(--floor-line)] rounded-lg"
      role="navigation"
      aria-label="Terminal Directory"
    >
      <div className="mount-bracket mount-tl" aria-hidden />
      <div className="mount-bracket mount-tr" aria-hidden />
      <div className="mount-bracket mount-bl" aria-hidden />
      <div className="mount-bracket mount-br" aria-hidden />
      <table className="departures-table w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left py-3 px-3 md:px-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--metal-gray)] w-[3.5rem] border-b border-r border-[var(--floor-line)]">
              Gate
            </th>
            <th className="text-left py-3 px-3 md:px-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--metal-gray)] border-b border-r border-[var(--floor-line)]">
              Destination
            </th>
            <th className="text-left py-3 px-3 md:px-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--metal-gray)] min-w-[120px] border-b border-r border-[var(--floor-line)]">
              Info
            </th>
            <th className="text-center py-3 px-3 md:px-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--metal-gray)] w-[3rem] border-b border-[var(--floor-line)]">
              CTA
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ gate, destination, info, cta, href }) => (
            <tr key={gate} className="directory-row border-b border-[var(--floor-line)] last:border-0 group transition-colors">
              <td className="py-0 align-middle border-r border-[var(--floor-line)]" colSpan={4}>
                <Link
                  href={href}
                  className="directory-row-link flex w-full items-center py-3 px-3 md:px-4 gap-0 cursor-pointer transition-colors hover:bg-[var(--terminal-glow)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--departure-amber)] focus:bg-[var(--terminal-glow)]"
                >
                  <span className="font-signage font-bold text-lg text-[var(--departure-amber)] w-[3.5rem] flex-shrink-0">
                    {gate}
                  </span>
                  <span className="font-semibold text-[var(--window-white)] flex-1 min-w-0 px-3 md:px-4 text-left font-mono text-sm uppercase tracking-wider">
                    {destination}
                  </span>
                  <span className="text-sm text-[var(--metal-gray)] min-w-[120px] text-left hidden sm:block font-mono text-xs">
                    {info}
                  </span>
                  <span className="font-mono text-lg font-bold text-[var(--departure-amber)] w-[3rem] flex-shrink-0 text-center group-hover:text-[var(--window-white)]" aria-hidden>
                    {cta}
                  </span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
