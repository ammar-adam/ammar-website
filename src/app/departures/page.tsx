import Link from "next/link";
import { projects } from "@/data/departures";
import type { FlightStatus } from "@/data/departures";

function StatusBadge({ status }: { status: FlightStatus }) {
  const map: Record<FlightStatus, string> = {
    Boarding: "departure-status--boarding",
    "Boarding Closed": "departure-status--scheduled",
    Departed: "departure-status--departed",
    Delayed: "departure-status--delayed",
  };
  return (
    <span className={`departure-status text-[10px] font-bold uppercase tracking-[0.05em] px-2 py-1 rounded ${map[status]}`}>
      {status.replace(" ", "\u00A0")}
    </span>
  );
}

export default function ProjectsPage() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Projects
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          Things I'm building or have built. Click a project for details.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.slug}
              href={`/departures/${p.slug}`}
              className="group block elevated rounded-[var(--radius-card)] p-4 sm:p-5 border border-[var(--border-medium)] hover:border-[var(--border-accent)] transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="font-semibold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  {p.destination}
                </h2>
                {p.status && (
                  <StatusBadge status={p.status} />
                )}
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-snug mb-2">
                {p.shortDesc}
              </p>
              {p.screenshot && (
                <div className="mt-3 rounded-lg overflow-hidden bg-[var(--bg-surface)] h-24 flex items-center justify-center">
                  <img
                    src={p.screenshot}
                    alt=""
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-warm)] mt-2 group-hover:gap-2 transition-[gap]">
                View project
                <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
