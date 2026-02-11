"use client";

import type { Project } from "@/data/departures";
import type { Arrival } from "@/data/arrivals";

type ProjectDetailsProps = {
  variant: "project";
  data: Project;
};

type ExperienceDetailsProps = {
  variant: "experience";
  data: Arrival;
};

type DetailsPanelProps = ProjectDetailsProps | ExperienceDetailsProps;

export function DetailsPanel(props: DetailsPanelProps) {
  if (props.variant === "project") {
    const p = props.data;
    const demoLink = p.seats.find((s) => s.links?.length)?.links?.find((l) => /demo|app|loom/i.test(l.label));
    const githubLink = p.seats.find((s) => s.links?.length)?.links?.find((l) => /github/i.test(l.label));
    const writeupLink = p.seats.find((s) => s.links?.length)?.links?.find((l) => /writeup|article|read/i.test(l.label));
    const tags = p.stackTag ? [p.stackTag] : [];

    return (
      <div className="details-panel h-full flex flex-col">
        {p.screenshot && (
          <div className="w-full h-32 rounded-lg overflow-hidden bg-[var(--bg-surface)] mb-3 flex-shrink-0">
            <img src={p.screenshot} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <h2 className="text-lg font-bold text-[var(--text-primary)] font-display">{p.destination}</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{p.shortDesc}</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-block px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-4">
          {demoLink && (
            <a
              href={demoLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-secondary text-xs px-3 py-1.5"
            >
              Demo
            </a>
          )}
          {githubLink && (
            <a
              href={githubLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-secondary text-xs px-3 py-1.5"
            >
              GitHub
            </a>
          )}
          {writeupLink && (
            <a
              href={writeupLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-secondary text-xs px-3 py-1.5"
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
    <div className="details-panel h-full flex flex-col">
      <div className="aspect-video w-full max-w-[280px] rounded-lg border border-[var(--border-medium)] bg-[var(--bg-elevated)] flex items-center justify-center mb-3 flex-shrink-0">
        <span className="font-mono text-xs text-[var(--text-muted)]">Image</span>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">{e.from}</span>
      <h2 className="text-lg font-bold text-[var(--text-primary)] font-display mt-1">{e.detailTitle ?? e.title}</h2>
      <p className="text-sm text-[var(--text-secondary)] mt-1">{e.impact}</p>
      {bullets.length > 0 && (
        <ul className="mt-3 space-y-1 list-disc list-inside text-sm text-[var(--text-secondary)]">
          {bullets.map((b, i) => (
            <li key={i}>{b.trim()}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
