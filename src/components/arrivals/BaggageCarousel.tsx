"use client";

import { useState } from "react";
import Link from "next/link";
import { arrivals } from "@/data/experiences";
import { DetailsPanel } from "@/components/shared/DetailsPanel";

function LuggageBag({
  from,
  title,
  slug,
  isSelected,
  onSelect,
}: {
  from: string;
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
      className={`luggage-tag flex-shrink-0 w-[200px] text-left overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] focus:ring-offset-2 focus:ring-offset-[var(--bg-deep)] baggage-tag-aesthetic rounded ${
        isSelected
          ? "border-2 border-[var(--accent-warm)] bg-[var(--accent-warm-dim)] shadow-[0_0_0_1px_var(--accent-warm)]"
          : "border border-[var(--border-medium)] bg-[var(--bg-elevated)] hover:border-[var(--border-accent)]"
      }`}
    >
      <div className="luggage-tag-strap h-2 bg-[var(--accent-warm)]/40 flex items-center justify-center">
        <span className="font-mono text-[8px] text-[var(--bg-deep)]/80 uppercase tracking-widest">Bag</span>
      </div>
      <div className="baggage-tag-body p-2.5 border-l-2 border-r-2 border-b-2 border-[var(--border-medium)] bg-[var(--bg-surface)]">
        <div className="aspect-[4/3] w-full rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mb-2">
          <span className="font-mono text-[9px] text-[var(--text-muted)]">Image</span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] block truncate">{from}</span>
        <span className="font-display text-xs font-semibold text-[var(--text-primary)] block mt-0.5 truncate">{title}</span>
      </div>
    </button>
  );
}

export function BaggageCarousel() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<"slow" | "normal">("normal");
  const selected = selectedSlug ? arrivals.find((a) => a.slug === selectedSlug) : null;
  const trackItems = [...arrivals, ...arrivals];

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--accent-warm)] hover:text-[var(--accent-glow)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] rounded"
          >
            ← Back to Directory
          </Link>
        </div>
        <p className="font-mono text-[10px] text-[var(--text-tertiary)] mb-1">
          Terminal Directory / Arrivals / Carousel 1
        </p>

        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display">Arrivals</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Select a bag to view experience details.</p>

        <p className="airport-signage-label mb-2">Baggage Claim</p>

        <div className="conveyor-belt conveyor-belt-tall rounded-xl overflow-hidden relative mb-4">
          <div className="conveyor-belt-edge conveyor-belt-edge-top" aria-hidden />
          <div className="conveyor-belt-edge conveyor-belt-edge-bottom" aria-hidden />
          <div className="conveyor-belt-inner overflow-hidden py-6">
            <div
              className={`belt-track flex gap-8 items-stretch w-max ${paused ? "belt-paused" : ""} ${speed === "slow" ? "belt-slow" : ""}`}
              style={{ animationDuration: speed === "slow" ? "55s" : "40s" }}
            >
              {trackItems.map((a, i) => (
                <LuggageBag
                  key={`${a.slug}-${i}`}
                  from={a.from}
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
            className="font-mono text-sm px-4 py-2 rounded-lg border border-[var(--border-medium)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent-warm)] hover:text-[var(--accent-warm)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)]"
          >
            {paused ? "Play" : "Pause"}
          </button>
          <button
            type="button"
            onClick={() => setSpeed((s) => (s === "normal" ? "slow" : "normal"))}
            className={`font-mono text-xs px-3 py-1.5 rounded border ${speed === "slow" ? "border-[var(--accent-warm)] text-[var(--accent-warm)] bg-[var(--accent-warm-dim)]" : "border-[var(--border-medium)] text-[var(--text-secondary)]"}`}
          >
            Speed: {speed === "slow" ? "Slow" : "Normal"}
          </button>
        </div>

        <div className="elevated rounded-xl border border-[var(--border-medium)] p-5 min-h-[200px]">
          {selected ? (
            <DetailsPanel variant="experience" data={selected} />
          ) : (
            <p className="text-sm text-[var(--text-tertiary)]">Select a bag above to view details.</p>
          )}
        </div>
      </div>
    </section>
  );
}
