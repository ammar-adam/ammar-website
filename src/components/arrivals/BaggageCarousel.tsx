"use client";

import { useState } from "react";
import Link from "next/link";
import { arrivals } from "@/data/experiences";
import { DetailsPanel } from "@/components/shared/DetailsPanel";

function LuggageBag({
  from,
  origin,
  title,
  slug,
  isSelected,
  onSelect,
}: {
  from: string;
  origin: string;
  title: string;
  slug: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      data-selected={isSelected ? "true" : "false"}
      className="baggage-card flex-shrink-0 w-[240px] text-left overflow-visible rounded-lg border-2 border-[var(--floor-line)] bg-[var(--terminal-dark)]"
    >
      <div className="baggage-card-handle" aria-hidden />
      <span className="bag-tag" aria-hidden>{origin}</span>
      <div className="p-3 pt-4 border-2 border-t-0 border-[var(--floor-line)] rounded-b-lg bg-[var(--terminal-dark)]">
        <div className="aspect-[4/3] w-full rounded bg-[var(--terminal-blue)]/40 border border-[var(--floor-line)] flex items-center justify-center mb-2">
          <span className="font-mono text-[9px] text-[var(--metal-gray)]">Image</span>
        </div>
        <span className="baggage-origin block truncate">From: {from}</span>
        <span className="baggage-role block mt-0.5 truncate">{title}</span>
        <div className="barcode-stripe mt-2" aria-hidden />
      </div>
    </button>
  );
}

export function BaggageCarousel() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const selected = selectedSlug ? arrivals.find((a) => a.slug === selectedSlug) : null;
  const trackItems = [...arrivals, ...arrivals];

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[var(--runway-max)]">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/"
            className="text-sm font-mono text-[var(--metal-gray)] hover:text-[var(--departure-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--departure-amber)] rounded"
          >
            ← Directory
          </Link>
        </div>

        <div className="baggage-claim-led mb-6">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--departure-amber)]">
            Baggage claim area
          </div>
          <div className="font-mono text-[10px] text-[var(--metal-gray)] uppercase tracking-wider mt-1">
            Carousel 1 · All experiences
          </div>
        </div>

        <h1 className="page-title text-xl font-bold text-[var(--window-white)] mb-1">Experiences</h1>
        <p className="text-sm font-mono text-[var(--metal-gray)] mb-6">Select a bag to view experience details.</p>

        <div className="conveyor-belt conveyor-belt-tall rounded-xl overflow-hidden relative mb-4">
          <div className="conveyor-belt-edge conveyor-belt-edge-top" aria-hidden />
          <div className="conveyor-belt-edge conveyor-belt-edge-bottom" aria-hidden />
          <div className="conveyor-belt-inner overflow-hidden py-6">
            <div
              className={`belt-track flex gap-8 items-stretch w-max ${paused ? "belt-paused" : ""}`}
              style={{ animationDuration: "70s" }}
            >
              {trackItems.map((a, i) => (
                <LuggageBag
                  key={`${a.slug}-${i}`}
                  from={a.from}
                  origin={a.origin}
                  title={a.title}
                  slug={a.slug}
                  isSelected={selectedSlug === a.slug}
                  onSelect={() => setSelectedSlug(selectedSlug === a.slug ? null : a.slug)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="belt-controls flex flex-wrap items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="belt-control-btn font-mono text-sm px-4 py-2.5 rounded border-2 border-[var(--floor-line)] bg-[var(--terminal-dark)] text-[var(--metal-gray)] hover:border-[var(--departure-amber)] hover:text-[var(--departure-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--departure-amber)] inline-flex items-center gap-2"
            aria-label={paused ? "Resume carousel" : "Pause carousel"}
          >
            {paused ? (
              <span className="belt-control-icon" aria-hidden>▶</span>
            ) : (
              <span className="belt-control-icon belt-control-icon-pause" aria-hidden>⏸</span>
            )}
            <span>{paused ? "Play" : "Pause"}</span>
          </button>
        </div>

        <p className="font-mono text-[9px] text-[var(--metal-gray)] uppercase tracking-widest mb-2">Stand behind yellow line</p>

        <div className="rounded-xl border-2 border-[var(--floor-line)] bg-[var(--terminal-dark)] p-5 min-h-[200px]">
          {selected ? (
            <DetailsPanel variant="experience" data={selected} />
          ) : (
            <p className="text-sm font-mono text-[var(--metal-gray)]">Select a bag above to view details.</p>
          )}
        </div>
      </div>
    </section>
  );
}
