"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/data/departures";

export function ProjectDestinationPage({ project }: { project: Project }) {
  const [activeId, setActiveId] = useState(project.seats[0]?.id ?? "A1");
  const activeSection = project.seats.find((s) => s.id === activeId) ?? project.seats[0];
  if (!activeSection) return null;

  const renderContent = () => {
    if (activeSection.links && activeSection.links.length > 0) {
      return (
        <ul className="space-y-2">
          {activeSection.links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--accent-warm)] hover:text-[var(--accent-glow)]"
              >
                {link.label} →
              </a>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p className="text-[var(--text-secondary)] text-sm leading-[1.6] whitespace-pre-wrap">
        {activeSection.content}
      </p>
    );
  };

  return (
    <article className="py-8 sm:py-10 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/departures"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent-warm)] mb-4 inline-block"
        >
          ← Projects
        </Link>

        <header className="mb-8">
          <span className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
            {project.flightCode} · Gate {project.gate}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1" style={{ fontFamily: "var(--font-display)" }}>
            {project.destination}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {project.shortDesc}
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-6">
          <nav className="flex flex-wrap gap-2 sm:flex-col sm:flex-nowrap sm:w-44 flex-shrink-0" aria-label="Project sections">
            {project.seats.map((seat) => (
              <button
                key={seat.id}
                type="button"
                onClick={() => setActiveId(seat.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] ${
                  activeId === seat.id
                    ? "bg-[var(--accent-warm)] text-[var(--bg-deep)]"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                }`}
              >
                <span className="font-mono text-[10px] text-[var(--text-tertiary)] mr-2">{seat.id}</span>
                {seat.label}
              </button>
            ))}
          </nav>

          <div className="flex-1 min-w-0 elevated rounded-[var(--radius-card)] p-4 sm:p-5 border border-[var(--border-medium)]">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
              {activeSection.label}
            </p>
            {renderContent()}
          </div>
        </div>
      </div>
    </article>
  );
}
