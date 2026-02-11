"use client";

import Link from "next/link";

const ROWS = [
  { gate: "A", destination: "Projects", info: "Things I'm building / built", cta: "View seat map", href: "/projects" },
  { gate: "B", destination: "Arrivals", info: "Experiences that have landed", cta: "Go to baggage claim", href: "/arrivals" },
  { gate: "C", destination: "About", info: "Who I am / what I'm optimizing for", cta: "Open profile", href: "/about" },
  { gate: "D", destination: "Resume", info: "Boarding pass (PDF)", cta: "Export", href: "/resume" },
] as const;

export function TerminalDirectoryBoard() {
  return (
    <div
      className="departures-board elevated overflow-hidden w-full max-w-3xl departures-board-mounted"
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
            <th className="text-left py-3 px-3 md:px-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] w-[3rem] border-b border-r border-[var(--border-medium)]">
              Gate
            </th>
            <th className="text-left py-3 px-3 md:px-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] border-b border-r border-[var(--border-medium)]">
              Destination
            </th>
            <th className="text-left py-3 px-3 md:px-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] min-w-[140px] border-b border-r border-[var(--border-medium)]">
              Info
            </th>
            <th className="text-right py-3 px-3 md:px-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] w-[7rem] border-b border-[var(--border-medium)]">
              CTA
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ gate, destination, info, cta, href }) => (
            <tr key={gate} className="border-b border-[var(--border-subtle)] last:border-0 group">
              <td className="py-0 align-middle border-r border-[var(--border-subtle)]" colSpan={4}>
                <Link
                  href={href}
                  className="directory-row-link flex w-full items-center py-3 px-3 md:px-4 gap-0 cursor-pointer transition-colors hover:bg-[var(--accent-warm-dim)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--accent-warm)] focus:bg-[var(--accent-warm-dim)]"
                >
                  <span className="font-mono text-sm font-semibold text-[var(--accent-warm)] tabular-nums w-[3rem] flex-shrink-0">
                    {gate}
                  </span>
                  <span className="font-semibold text-[var(--text-primary)] flex-1 min-w-0 px-3 md:px-4 text-left">
                    {destination}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)] min-w-[140px] text-left hidden sm:block">
                    {info}
                  </span>
                  <span className="font-mono text-xs font-semibold text-[var(--accent-warm)] w-[7rem] flex-shrink-0 text-right group-hover:text-[var(--accent-glow)]">
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
