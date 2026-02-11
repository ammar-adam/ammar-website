"use client";

import type { Project } from "@/data/departures";
import type { Arrival } from "@/data/arrivals";

type ProjectDetailsProps = {
  variant: "project";
  data: Project;
  seatLabel?: string | null;
};

type ExperienceDetailsProps = {
  variant: "experience";
  data: Arrival;
};

type DetailsPanelProps = ProjectDetailsProps | ExperienceDetailsProps;

export function DetailsPanel(props: DetailsPanelProps) {
  if (props.variant === "project") {
    const p = props.data;
    const seatLabel = props.seatLabel ?? null;
    const demoLink = p.seats.find((s) => s.links?.length)?.links?.find((l) => /demo|app|loom/i.test(l.label));
    const githubLink = p.seats.find((s) => s.links?.length)?.links?.find((l) => /github/i.test(l.label));
    const writeupLink = p.seats.find((s) => s.links?.length)?.links?.find((l) => /writeup|article|read/i.test(l.label));
    const tags = p.stackTag ? [p.stackTag] : [];

    return (
      <div className="gate-display flex flex-col gap-4">
        <div className="gate-header">
          <span className="gate-icon text-2xl" aria-hidden>🛫</span>
          <div className="gate-info">
            <h2 className="gate-number">Gate {p.gate}</h2>
            <p className="gate-status">Now boarding</p>
          </div>
        </div>

        <div className="flight-info">
          <div className="info-row">
            <span className="info-label">Destination</span>
            <span className="info-value">{p.destination}</span>
          </div>
          {seatLabel && (
            <div className="info-row">
              <span className="info-label">Seat</span>
              <span className="info-value">{seatLabel}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">Flight type</span>
            <span className="info-value">{p.routeName || "Project"}</span>
          </div>
        </div>

        <div className="project-description">
          <p>{p.shortDesc}</p>
        </div>

        {tags.length > 0 && (
          <div className="tech-stack">
            <h3 className="tech-stack-title">Tech stack</h3>
            <div className="tech-tags flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="tech-tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {p.screenshot && (
          <div className="project-image aspect-video w-full rounded-lg border-2 border-[var(--floor-line)] overflow-hidden bg-[var(--terminal-blue)]">
            <img src={p.screenshot} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="gate-actions flex flex-wrap gap-3">
          {demoLink && (
            <a
              href={demoLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="gate-btn primary gate-btn-view flex-1 min-w-[120px] text-center py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider bg-[var(--departure-amber)] text-[var(--terminal-navy)] border-2 border-[var(--departure-amber)] hover:bg-[var(--window-white)] hover:border-[var(--window-white)] transition-colors"
            >
              View project
            </a>
          )}
          {githubLink && (
            <a
              href={githubLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="gate-btn secondary flex-1 min-w-[100px] text-center py-3 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border-2 border-[var(--floor-line)] text-[var(--window-white)] hover:border-[var(--departure-amber)] hover:text-[var(--departure-amber)] transition-colors"
            >
              GitHub
            </a>
          )}
          {writeupLink && (
            <a
              href={writeupLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="gate-btn secondary flex-1 min-w-[100px] text-center py-3 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border-2 border-[var(--floor-line)] text-[var(--window-white)] hover:border-[var(--departure-amber)] hover:text-[var(--departure-amber)] transition-colors"
            >
              Writeup
            </a>
          )}
        </div>
      </div>
    );
  }

  const e = props.data;
  const bullets = e.details.split(". ").filter(Boolean).slice(0, 4);

  return (
    <div className="baggage-claim-details details-panel h-full flex flex-col baggage-details-two-col">
      <div className="baggage-details-content">
        <div className="aspect-video w-full max-w-[220px] rounded-lg border border-[var(--floor-line)] bg-[var(--terminal-blue)] flex items-center justify-center mb-3 flex-shrink-0">
          <span className="font-mono text-xs text-[var(--metal-gray)]">Image</span>
        </div>
        <span className="baggage-origin">From: {e.from}</span>
        <h2 className="baggage-role mt-1">{e.detailTitle ?? e.title}</h2>
        <p className="text-sm text-[var(--metal-gray)] mt-1">{e.impact}</p>
        {bullets.length > 0 && (
          <ul className="mt-3 space-y-1 list-disc list-inside text-sm text-[var(--metal-gray)]">
            {bullets.map((b, i) => (
              <li key={i}>{b.trim()}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="trolley-illustration trolley-right flex-shrink-0 opacity-60">
        <svg viewBox="0 0 200 150" className="luggage-trolley w-[160px] h-[120px]" aria-hidden>
          <rect x="30" y="40" width="140" height="80" fill="var(--terminal-blue)" stroke="var(--floor-line)" strokeWidth="2" rx="4" />
          <rect x="50" y="50" width="40" height="50" fill="var(--terminal-dark)" stroke="var(--departure-amber)" strokeWidth="2" rx="2" />
          <rect x="110" y="50" width="40" height="50" fill="var(--terminal-dark)" stroke="var(--departure-amber)" strokeWidth="2" rx="2" />
          <line x1="30" y1="120" x2="30" y2="135" stroke="var(--metal-gray)" strokeWidth="3" />
          <line x1="170" y1="120" x2="170" y2="135" stroke="var(--metal-gray)" strokeWidth="3" />
          <circle cx="30" cy="140" r="8" fill="var(--floor-line)" />
          <circle cx="170" cy="140" r="8" fill="var(--floor-line)" />
          <text x="100" y="80" textAnchor="middle" fill="var(--metal-gray)" fontSize="12" fontFamily="JetBrains Mono, monospace">LUGGAGE</text>
        </svg>
        <p className="trolley-caption font-mono text-[9px] text-[var(--metal-gray)] tracking-[0.15em] mt-2 uppercase">Baggage trolley available</p>
      </div>
    </div>
  );
}
