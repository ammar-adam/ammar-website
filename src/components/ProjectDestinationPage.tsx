"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/data/departures";

const SEAT_MAP = [
  { id: "A1", label: "Overview", key: "overview" as const },
  { id: "A2", label: "Problem", key: "problem" as const },
  { id: "B1", label: "Tech Stack", key: "build" as const },
  { id: "B2", label: "Architecture", key: "architecture" as const },
  { id: "C1", label: "Demo", key: "demo" as const },
  { id: "C2", label: "Links", key: "links" as const },
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
      className="grid grid-cols-2 gap-3 sm:gap-4 font-mono text-xs tracking-wide"
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
            flex items-center justify-center rounded border transition-colors
            w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
            focus:outline-none focus:ring-2 focus:ring-[var(--accent-amber)] focus:ring-offset-2 focus:ring-offset-[var(--bg-dark)]
            ${
              activeSeat === seat.id
                ? "border-2 border-[var(--accent-amber)] bg-[var(--accent-amber-dim)] text-[var(--accent-amber)]"
                : "border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-muted)]/70 hover:text-[var(--text-secondary)]"
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
    switch (activeSection.key) {
      case "overview":
        return <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{project.overview}</p>;
      case "problem":
        return (
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            {project.problem || project.overview}
          </p>
        );
      case "build":
        return <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{project.build}</p>;
      case "architecture":
        return (
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            {project.architecture || project.build}
          </p>
        );
      case "demo":
        return (
          <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
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
                className="text-sm text-[var(--accent-amber)] hover:underline"
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
                  className="text-sm text-[var(--accent-amber)] hover:underline"
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
    <article className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/#departures"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-amber)] transition-colors"
          >
            ← Departures
          </Link>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Seatmap */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-shrink-0 w-full lg:w-[400px]"
          >
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-4 font-mono">
              Cabin
            </p>
            <div className="relative w-full max-w-[400px] p-6 sm:p-8 rounded-xl border border-[var(--border-subtle)]">
              <SeatmapGrid activeSeat={activeSeat} onSelect={handleSeatSelect} />
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-3">
              {activeSection.label}
            </p>
          </motion.div>

          {/* Content panel */}
          <motion.div
            key={activeSeat}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-w-0"
          >
            <header className="mb-6">
              <span className="font-mono text-sm text-[var(--accent-amber)]">
                {project.flightCode}
              </span>
              <h1 className="text-2xl font-light text-[var(--text-primary)] mt-1">
                {project.routeName}
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {project.shortDesc}
              </p>
              <span className="text-[10px] text-[var(--text-muted)] mt-2 block">
                Gate {project.gate} · {project.destination}
              </span>
            </header>

            <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-4 font-mono">
              {activeSection.label}
            </div>

            {getContent()}
          </motion.div>
        </div>
      </div>
    </article>
  );
}
