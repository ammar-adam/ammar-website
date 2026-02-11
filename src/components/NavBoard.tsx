"use client";

import { useRouter } from "next/navigation";

export const NAV_DESTINATIONS = [
  { href: "/departures", label: "Projects", subLabel: "Things I'm building or have built.", gate: "A" },
  { href: "/arrivals", label: "Arrivals", subLabel: "Experiences that have landed.", gate: "B" },
  { href: "/about", label: "About Me", subLabel: "Who I am and what I'm up to.", gate: "C" },
  { href: "/boarding-pass", label: "Resume", subLabel: "Download boarding pass (PDF).", gate: "D" },
] as const;

export function NavBoard() {
  const router = useRouter();

  return (
    <div
      className="departures-board elevated overflow-hidden max-w-2xl w-full departures-board-mounted"
      role="navigation"
      aria-label="Terminal navigation"
    >
      <div className="mount-bracket mount-tl" aria-hidden />
      <div className="mount-bracket mount-tr" aria-hidden />
      <div className="mount-bracket mount-bl" aria-hidden />
      <div className="mount-bracket mount-br" aria-hidden />
      <table className="departures-table w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left py-3 px-3 md:px-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] w-[4rem] border-b border-r border-[var(--border-medium)]">
              Gate
            </th>
            <th className="text-left py-3 px-3 md:px-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] border-b border-r border-[var(--border-medium)]">
              Destination
            </th>
            <th className="text-left py-3 px-3 md:px-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border-medium)]">
              Info
            </th>
          </tr>
        </thead>
        <tbody>
          {NAV_DESTINATIONS.map(({ href, label, subLabel, gate }) => (
            <tr
              key={href}
              onClick={() => router.push(href)}
              onKeyDown={(e) => e.key === "Enter" && router.push(href)}
              role="link"
              tabIndex={0}
              className="cursor-pointer border-b border-[var(--border-subtle)] last:border-0 transition-colors hover:bg-[var(--accent-warm-dim)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--accent-warm)]"
            >
              <td className="font-mono text-sm font-semibold text-[var(--accent-warm)] tabular-nums py-3 px-3 md:px-4 align-top border-r border-[var(--border-subtle)]">
                {gate}
              </td>
              <td className="font-semibold text-[var(--text-primary)] py-3 px-3 md:px-4 align-top border-r border-[var(--border-subtle)]">
                {label}
              </td>
              <td className="text-sm text-[var(--text-secondary)] py-3 px-3 md:px-4 align-top">
                {subLabel}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
