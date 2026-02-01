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
  const statusMap: Record<FlightStatus, string> = {
    Boarding: "departure-status--boarding",
    Scheduled: "departure-status--scheduled",
    Departed: "departure-status--departed",
    Delayed: "departure-status--delayed",
    Taxiing: "departure-status--taxiing",
  };
  return (
    <span className={`departure-status text-[10px] font-bold uppercase tracking-[0.05em] px-3 py-1.5 rounded-md ${statusMap[status]}`}>
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
    <motion.tr
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative cursor-pointer border-b border-[var(--border-subtle)] last:border-0 transition-all duration-200 hover:bg-[var(--accent-warm-dim)] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[var(--accent-warm)] ${
        isHovered ? "bg-[var(--accent-warm-dim)]" : ""
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.08 * index, duration: 0.3 }}
    >
      <td className="font-mono text-sm text-[var(--text-tertiary)] tabular-nums py-4 px-4 md:px-5">
        {project.year}
      </td>
      <td className="font-mono text-base font-bold text-[var(--text-primary)] py-4 px-4 md:px-5">
        {project.flightCode}
      </td>
      <td className="py-4 px-4 md:px-5 min-w-[180px]">
        <div>
          <div className="font-semibold text-[var(--text-primary)]">{project.destination}</div>
          <div className="text-sm text-[var(--text-tertiary)] mt-0.5">
            {project.routeName} · {project.stackTag}
          </div>
        </div>
      </td>
      <td className="py-4 px-4 md:px-5">
        <motion.span key={isHovered ? "h" : "n"} initial={{ opacity: 0.7 }} animate={{ opacity: 1 }}>
          <StatusBadge status={isHovered ? hoverStatus : project.status} />
        </motion.span>
      </td>
      <td className="font-mono text-sm font-semibold text-[var(--accent-warm)] text-right py-4 px-4 md:px-5">
        {project.gate}
      </td>
    </motion.tr>
  );
}

export function DeparturesBoardDisplay({
  variant = "hero",
  onSelectFlight,
}: DeparturesBoardDisplayProps) {
  const displayFlights = variant === "ticker" ? projects.slice(0, 3) : projects;

  if (variant === "ticker") {
    return (
      <div className="w-full overflow-hidden border-y border-[var(--border-medium)] bg-[var(--bg-surface)]/90 py-3">
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
              <span className="text-[var(--accent-warm)]">{p.gate}</span>
            </span>
          ))}
        </motion.div>
      </div>
    );
  }

  if (variant === "mini") {
    return (
      <div className="elevated rounded-xl p-4">
        <div className="space-y-3">
          {displayFlights.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center justify-between font-mono text-sm text-[var(--text-secondary)]"
            >
              <span className="tabular-nums text-[var(--text-tertiary)]">{p.year}</span>
              <span className="font-semibold text-[var(--text-primary)]">{p.flightCode}</span>
              <span className="truncate max-w-[100px]">{p.destination}</span>
              <span className="text-[var(--accent-warm)] font-medium">{p.gate}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="departures-board elevated overflow-hidden">
      <table className="departures-table w-full">
        <thead>
          <tr>
            <th className="text-left py-4 px-4 md:px-5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Year</th>
            <th className="departure-flight text-left py-4 px-4 md:px-5">Flight</th>
            <th className="departure-destination text-left py-4 px-4 md:px-5">To</th>
            <th className="text-left py-4 px-4 md:px-5">Status</th>
            <th className="departure-gate text-right py-4 px-4 md:px-5">Gate</th>
          </tr>
        </thead>
        <tbody>
          {displayFlights.map((p, i) => (
            <DepartureRowHero
              key={p.slug}
              project={p}
              index={i}
              onSelect={() => onSelectFlight?.(p.slug)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
