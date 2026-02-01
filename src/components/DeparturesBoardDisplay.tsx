"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { projects } from "@/data/departures";
import type { FlightStatus } from "@/data/departures";

interface DeparturesBoardDisplayProps {
  variant?: "ticker" | "mini" | "hero";
  onSelectFlight?: (slug: string) => void;
}

function StatusBadge({ status }: { status: FlightStatus }) {
  const styles: Record<FlightStatus, string> = {
    Boarding: "text-[var(--status-green)]",
    Ready: "text-[var(--accent-amber)]",
    Scheduled: "text-[var(--text-muted)]",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}

function DepartureRowHero({
  project,
  index,
  onSelect,
}: {
  project: (typeof projects)[0];
  index: number;
  onSelect: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverStatus: FlightStatus = project.status === "Scheduled" ? "Boarding" : project.status;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group w-full text-left relative overflow-hidden transition-colors border-b border-[var(--border-subtle)] last:border-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--accent-amber)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.08 * index, duration: 0.3 }}
    >
      <div
        className={`grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 transition-colors ${
          isHovered ? "bg-[var(--accent-amber-dim)]" : ""
        }`}
      >
        <div className="col-span-2 font-mono text-sm text-[var(--text-secondary)] tabular-nums">
          09:{String(45 + index * 15).padStart(2, "0")}
        </div>
        <div className="col-span-2 font-mono font-semibold text-[var(--text-primary)]">
          {project.flightCode}
        </div>
        <div className="col-span-2 text-sm text-[var(--text-primary)] truncate">
          {project.destination}
        </div>
        <div className="col-span-2 hidden md:block text-sm text-[var(--text-secondary)] truncate">
          {project.routeName}
        </div>
        <div className="col-span-2">
          <motion.span key={isHovered ? "h" : "n"} initial={{ opacity: 0.7 }} animate={{ opacity: 1 }}>
            <StatusBadge status={isHovered ? hoverStatus : project.status} />
          </motion.span>
        </div>
        <div className="col-span-2 text-right font-mono text-sm font-semibold text-[var(--accent-amber)]">
          {project.gate}
        </div>
      </div>
      {/* Route line + tiny plane on hover */}
      <div className="motion-reduce:hidden absolute bottom-0 left-0 right-0 h-px overflow-hidden">
        <motion.div
          className="relative h-full"
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <motion.path
              d="M 0 1 L 1000 1"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="4 4"
              className="text-[var(--text-muted)]/25"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            />
          </svg>
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 text-[var(--text-muted)]/50"
            initial={{ left: "0%" }}
            animate={{ left: isHovered ? "100%" : "0%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 8 8" className="w-full h-full" fill="currentColor">
              <path d="M1 2 L4 4 L1 6 L2 4 Z" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </motion.button>
  );
}

export function DeparturesBoardDisplay({
  variant = "hero",
  onSelectFlight,
}: DeparturesBoardDisplayProps) {
  const displayFlights = variant === "ticker" ? projects.slice(0, 3) : projects;

  if (variant === "ticker") {
    return (
      <div className="w-full overflow-hidden border-y border-[var(--border-subtle)] bg-[var(--bg-elevated)]/80 py-2.5">
        <motion.div
          className="flex gap-12 whitespace-nowrap font-mono text-sm text-[var(--text-secondary)]"
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "loop" }}
        >
          {[...displayFlights, ...displayFlights].map((p, i) => (
            <span key={`${p.slug}-${i}`} className="inline-flex gap-6">
              <span className="text-[var(--text-primary)] font-semibold">{p.flightCode}</span>
              <span>{p.destination}</span>
              <span className="text-[var(--accent-amber)]">{p.gate}</span>
            </span>
          ))}
        </motion.div>
      </div>
    );
  }

  if (variant === "mini") {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 p-4">
        <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-3 font-mono">
          Departures
        </p>
        <div className="space-y-2.5">
          {displayFlights.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center justify-between font-mono text-xs text-[var(--text-secondary)]"
            >
              <span className="tabular-nums">09:{String(45 + i * 15).padStart(2, "0")}</span>
              <span className="font-semibold text-[var(--text-primary)]">{p.flightCode}</span>
              <span className="truncate max-w-[120px]">{p.destination}</span>
              <span className="text-[var(--accent-amber)]">{p.gate}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40">
      <div className="grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-3 border-b border-[var(--border-subtle)] text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-mono">
        <div className="col-span-2">Time</div>
        <div className="col-span-2">Flight</div>
        <div className="col-span-2">To</div>
        <div className="col-span-2 hidden md:block">Route</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2 text-right">Gate</div>
      </div>
      {displayFlights.map((p, i) => (
        <DepartureRowHero
          key={p.slug}
          project={p}
          index={i}
          onSelect={() => onSelectFlight?.(p.slug)}
        />
      ))}
    </div>
  );
}
