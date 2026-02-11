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
      <div className="boarding-pass-panel details-panel h-full flex flex-col overflow-hidden">
        <div className="bp-header">Boarding pass</div>
        <div className="p-4 flex flex-col gap-3">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-[var(--metal-gray)]">
            <span>Project</span>
            <span className="text-[var(--window-white)] font-semibold normal-case">{p.destination}</span>
            {seatLabel && (
              <>
                <span>Seat</span>
                <span className="text-[var(--window-white)]">{seatLabel}</span>
              </>
            )}
            <span>Gate</span>
            <span className="text-[var(--window-white)]">{p.gate}</span>
          </div>
          <p className="text-sm text-[var(--metal-gray)] leading-relaxed mt-1">{p.shortDesc}</p>
          {tags.length > 0 && (
            <>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--metal-gray)]">Tech stack</span>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-block px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider bg-[var(--terminal-blue)] text-[var(--metal-gray)] border border-[var(--floor-line)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {demoLink && (
              <a
                href={demoLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[var(--departure-amber)] text-[var(--departure-amber)] font-mono text-xs hover:bg-[var(--terminal-glow)] transition-colors"
              >
                View project
              </a>
            )}
            {githubLink && (
              <a
                href={githubLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[var(--floor-line)] text-[var(--metal-gray)] font-mono text-xs hover:text-[var(--window-white)] transition-colors"
              >
                GitHub
              </a>
            )}
            {writeupLink && (
              <a
                href={writeupLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[var(--floor-line)] text-[var(--metal-gray)] font-mono text-xs hover:text-[var(--window-white)] transition-colors"
              >
                Writeup
              </a>
            )}
          </div>
          <div className="bp-barcode" aria-hidden />
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
