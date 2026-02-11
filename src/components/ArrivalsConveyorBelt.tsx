"use client";

import Link from "next/link";
import { arrivals } from "@/data/arrivals";

function LuggageItem({ from, title, impact, slug }: { from: string; title: string; impact: string; slug: string }) {
  return (
    <Link
      href={`/arrivals/${slug}`}
      className="conveyor-luggage flex-shrink-0 w-[200px] group"
    >
      <div className="baggage-card h-full flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[var(--accent-warm)] hover:shadow-[var(--shadow-md)]">
        <div className="card-visual w-full h-28 flex items-center justify-center bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] relative">
          <div className="w-12 h-12 rounded border-2 border-[var(--border-medium)] bg-[var(--bg-elevated)] flex items-center justify-center" aria-hidden>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18" /></svg>
          </div>
        </div>
        <div className="card-label px-3 py-3 flex flex-col gap-1 bg-[var(--bg-elevated)] flex-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">{from}</span>
          <span className="font-display text-sm font-semibold text-[var(--text-primary)]">{title}</span>
          <span className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-0.5">{impact}</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-warm)] mt-2 group-hover:gap-2 transition-[gap]">
            Details
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ArrivalsConveyorBelt() {
  const doubled = [...arrivals, ...arrivals];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 relative">
      <div className="mx-auto max-w-5xl">
        <div className="overhead-signage departures-signage mb-2" aria-hidden>
          <div className="sign-holder">
            <span className="sign-text">Baggage claim</span>
          </div>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
          Carousel 1
        </p>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-6 font-display">
          Arrivals
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          Click a bag for full experience details.
        </p>

        <div className="conveyor-belt conveyor-belt-tall rounded-xl overflow-hidden relative">
          <div className="conveyor-belt-edge conveyor-belt-edge-top" aria-hidden />
          <div className="conveyor-belt-edge conveyor-belt-edge-bottom" aria-hidden />
          <div className="conveyor-belt-inner overflow-hidden py-6">
            <div className="belt-track flex gap-8 items-stretch w-max">
              {doubled.map((a, i) => (
                <LuggageItem
                  key={`${a.slug}-${i}`}
                  from={a.from}
                  title={a.title}
                  impact={a.impact}
                  slug={a.slug}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
