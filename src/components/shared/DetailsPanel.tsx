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
    const allLinks = p.seats.flatMap((s) => s.links ?? []);
    const viewProjectLink = allLinks.find((l) => /view project/i.test(l.label));
    const githubLink = allLinks.find((l) => /github/i.test(l.label));
    const demoLink = allLinks.find((l) => /^demo$/i.test(l.label));
    const moreLink = allLinks.find((l) => /^more$/i.test(l.label));
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
          <div className="project-image project-image-compact w-full rounded-lg border-2 border-[var(--floor-line)] overflow-hidden bg-[var(--terminal-navy)] flex items-center justify-center p-2">
            <img src={p.screenshot} alt="" className="max-w-full max-h-[380px] w-auto h-auto object-contain" />
          </div>
        )}

        <div className="gate-actions flex flex-wrap gap-3">
          {viewProjectLink && (
            <a
              href={viewProjectLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="gate-btn primary gate-btn-view flex-1 min-w-[120px] text-center py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border-2 border-[var(--departure-amber)] text-[var(--departure-amber)] bg-transparent hover:bg-[var(--departure-amber)] hover:text-[var(--terminal-navy)] transition-colors"
            >
              View Project
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
          {demoLink && (
            <a
              href={demoLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="gate-btn secondary flex-1 min-w-[100px] text-center py-3 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border-2 border-[var(--floor-line)] text-[var(--window-white)] hover:border-[var(--departure-amber)] hover:text-[var(--departure-amber)] transition-colors"
            >
              Demo
            </a>
          )}
          {moreLink && (
            <a
              href={moreLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="gate-btn secondary flex-1 min-w-[100px] text-center py-3 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border-2 border-[var(--floor-line)] text-[var(--window-white)] hover:border-[var(--departure-amber)] hover:text-[var(--departure-amber)] transition-colors"
            >
              More
            </a>
          )}
        </div>
      </div>
    );
  }

  const e = props.data;

  return (
    <div className="baggage-claim-details details-panel h-full flex flex-col baggage-details-two-col">
      <div className="baggage-details-content">
        <div className="aspect-video w-full max-w-[220px] rounded-lg border border-[var(--floor-line)] bg-[var(--terminal-blue)] overflow-hidden mb-3 flex-shrink-0">
          {e.image ? (
            <img src={e.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="flex w-full h-full items-center justify-center font-mono text-xs text-[var(--metal-gray)]">Image</span>
          )}
        </div>
        <span className="baggage-origin">
          From:{" "}
          {e.fromUrl ? (
            <a href={e.fromUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--departure-amber)] hover:underline">
              {e.from}
            </a>
          ) : (
            e.from
          )}
        </span>
        <h2 className="baggage-role mt-1">{e.detailTitle ?? e.title}</h2>
        <p className="text-sm text-[var(--metal-gray)] mt-1">{e.impact}</p>
        {e.details && <p className="text-sm text-[var(--metal-gray)] mt-2">{e.details}</p>}
      </div>
      <div className="trolley-illustration trolley-right flex-shrink-0">
        <svg viewBox="0 0 200 150" className="luggage-trolley w-[180px] h-[135px]" aria-hidden>
          <rect x="30" y="40" width="140" height="80" fill="var(--terminal-blue)" stroke="var(--floor-line)" strokeWidth="2" rx="4" />
          <rect x="50" y="50" width="40" height="50" fill="var(--terminal-dark)" stroke="var(--departure-amber)" strokeWidth="2" rx="2" />
          <rect x="110" y="50" width="40" height="50" fill="var(--terminal-dark)" stroke="var(--departure-amber)" strokeWidth="2" rx="2" />
          <line x1="30" y1="120" x2="30" y2="135" stroke="var(--metal-gray)" strokeWidth="3" />
          <line x1="170" y1="120" x2="170" y2="135" stroke="var(--metal-gray)" strokeWidth="3" />
          <circle cx="30" cy="140" r="8" fill="var(--floor-line)" />
          <circle cx="170" cy="140" r="8" fill="var(--floor-line)" />
        </svg>
        <p className="trolley-caption font-mono text-[9px] text-[var(--metal-gray)] tracking-[0.15em] mt-2 uppercase">Baggage trolley available</p>
      </div>
    </div>
  );
}
