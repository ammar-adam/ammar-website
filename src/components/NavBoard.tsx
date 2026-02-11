"use client";

import Link from "next/link";

export const NAV_DESTINATIONS = [
  { href: "/departures", label: "Projects", subLabel: "Things I'm building or have built." },
  { href: "/arrivals", label: "Arrivals", subLabel: "Experiences that have landed — roles and places." },
  { href: "/about", label: "About Me", subLabel: "Who I am, interests, and what I'm up to." },
  { href: "/boarding-pass", label: "Resume", subLabel: "Download my resume (boarding pass)." },
] as const;

export function NavBoard() {
  return (
    <div
      className="departures-board elevated overflow-hidden max-w-2xl w-full"
      role="navigation"
      aria-label="Site destinations"
    >
      <table className="departures-table w-full">
        <thead>
          <tr>
            <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] w-0">
              #
            </th>
            <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
              Destination
            </th>
            <th className="text-right py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] w-0">
              →
            </th>
          </tr>
        </thead>
        <tbody>
          {NAV_DESTINATIONS.map(({ href, label, subLabel }, i) => (
            <tr key={href} className="border-b border-[var(--border-subtle)] last:border-0">
              <td className="py-0 align-top" colSpan={3}>
                <Link
                  href={href}
                  className="group flex flex-row items-start sm:items-center gap-3 w-full py-3 px-4 transition-colors hover:bg-[var(--accent-warm-dim)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--accent-warm)]"
                >
                  <span className="font-mono text-sm text-[var(--text-tertiary)] tabular-nums w-6 flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="font-semibold text-[var(--text-primary)]">{label}</span>
                    <span className="text-sm text-[var(--text-secondary)] block mt-0.5">{subLabel}</span>
                  </span>
                  <span className="font-mono text-sm text-[var(--accent-warm)] flex-shrink-0" aria-hidden>
                    →
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
