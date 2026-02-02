"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/data/departures";
import { AirportIcon } from "@/components/AirportIcon";

const SEAT_MAP = [
  { id: "A1", label: "Overview", key: "overview" as const },
  { id: "A2", label: "Problem", key: "problem" as const },
  { id: "B1", label: "Tech Stack", key: "build" as const },
  { id: "B2", label: "Architecture", key: "architecture" as const },
  { id: "C1", label: "Demo", key: "demo" as const },
  { id: "C2", label: "Reflection", key: "links" as const },
] as const;

type SeatId = (typeof SEAT_MAP)[number]["id"];

function getSeatFromHash(): SeatId {
  if (typeof window === "undefined") return "A1";
  const hash = window.location.hash.slice(1).toUpperCase();
  const valid = SEAT_MAP.find((s) => s.id === hash);
  return valid ? valid.id : "A1";
}

function SeatmapGrid({
  activeSeat,
  onSelect,
}: {
  activeSeat: SeatId;
  onSelect: (id: SeatId) => void;
}) {
  return (
    <div
      className="grid grid-cols-2 gap-3 font-mono text-xs font-semibold"
      role="listbox"
      aria-label="Seatmap sections"
    >
      {SEAT_MAP.map((seat) => (
        <button
          key={seat.id}
          type="button"
          role="option"
          aria-selected={activeSeat === seat.id}
          onClick={() => onSelect(seat.id)}
          title={seat.label}
          className={`
            aspect-square flex items-center justify-center rounded-lg border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] focus:ring-offset-2 focus:ring-offset-[var(--bg-deep)]
            ${
              activeSeat === seat.id
                ? "seat--selected"
                : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-elevated)]"
            }
          `}
        >
          {seat.id}
        </button>
      ))}
    </div>
  );
}

export function ProjectDestinationPage({ project }: { project: Project }) {
  const [activeSeat, setActiveSeat] = useState<SeatId>("A1");

  useEffect(() => {
    setActiveSeat(getSeatFromHash());
  }, []);

  useEffect(() => {
    const handler = () => setActiveSeat(getSeatFromHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const handleSeatSelect = (id: SeatId) => {
    setActiveSeat(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  const activeSection = SEAT_MAP.find((s) => s.id === activeSeat)!;

  const getContent = () => {
    const textClass = "text-[var(--text-secondary)] text-sm leading-[1.6]";
    switch (activeSection.key) {
      case "overview":
        return <p className={textClass}>{project.overview}</p>;
      case "problem":
        return (
          <p className={textClass}>
            {project.problem || project.overview}
          </p>
        );
      case "build":
        return <p className={textClass}>{project.build}</p>;
      case "architecture":
        return (
          <p className={textClass}>
            {project.architecture || project.build}
          </p>
        );
      case "demo":
        return (
          <div className="space-y-3">
            <div className="relative h-28 w-full overflow-hidden rounded-[var(--radius-compact)] elevated">
              <Image
                src={project.screenshot}
                alt={`${project.routeName}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
            {project.links.find((l) => l.label.toLowerCase().includes("demo")) && (
              <a
                href={project.links.find((l) => l.label.toLowerCase().includes("demo"))!.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--accent-warm)] hover:text-[var(--accent-glow)]"
              >
                View demo →
              </a>
            )}
          </div>
        );
      case "links":
        return (
          <ul className="space-y-2">
            {project.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--accent-warm)] hover:text-[var(--accent-glow)]"
                >
                  {link.label} →
                </a>
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <article className="page-level-gate density-compact py-6 sm:py-8 px-4 sm:px-6 lg:px-12 z-10">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Link
            href="/#departures"
            className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--accent-warm)] transition-colors"
          >
            ← Departures
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="elevated rounded-[var(--radius-card)] p-4 cabin-container cabin-container-lit"
          >
            <div className="cabin-aisle" aria-hidden>
              <span className="aisle-label">AISLE</span>
            </div>
            <div className="cabin-header mb-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
                Cabin
              </p>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-0.5 font-display">
                Select your seat
              </h3>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                Each seat contains a different aspect of the project.
              </p>
            </div>
            <SeatmapGrid activeSeat={activeSeat} onSelect={handleSeatSelect} />
            <p className="font-mono text-[10px] text-[var(--text-tertiary)] mt-3 text-center">
              {activeSection.label}
            </p>
          </motion.div>

          <motion.div
            key={activeSeat}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="elevated rounded-[var(--radius-card)] p-4"
          >
            <header className="mb-3 relative">
              <div className="absolute -top-0.5 right-0 opacity-[0.08]">
                <AirportIcon src="/airport-icons/boarding-pass.svg" className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-[10px] text-[var(--accent-warm)]">
                {project.flightCode}
              </span>
              <h1 className="page-level-gate__title text-lg font-semibold text-[var(--text-primary)] mt-0.5 font-display">
                {project.destination}
              </h1>
              <p className="page-level-gate__body text-xs text-[var(--text-secondary)] mt-1">
                {project.shortDesc}
              </p>
              <span className="text-[10px] text-[var(--text-tertiary)] mt-1.5 block">
                Gate {project.gate} · {project.routeName}
              </span>
            </header>

            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
              {activeSection.label}
            </p>

            <div className="page-level-gate__body text-sm leading-relaxed">{getContent()}</div>
          </motion.div>
        </div>
      </div>
    </article>
  );
}
