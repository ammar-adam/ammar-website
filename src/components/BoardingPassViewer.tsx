"use client";

import { boardingPassConfig } from "@/data/boardingPass";

export function BoardingPassViewer() {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-12 z-10">
      <div className="mx-auto max-w-2xl w-full">
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1 font-display">
          Resume
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          {boardingPassConfig.displayName}
        </p>

        <a
          href={boardingPassConfig.resumeFileUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="boarding-pass__download block w-full text-center no-underline mb-8"
        >
          Export boarding pass (PDF)
        </a>

        <div
          className="boarding-pass boarding-pass-kiosk rounded-xl overflow-hidden"
          style={{ padding: "20px 24px" }}
        >
          {boardingPassConfig.tagline && (
            <p className="text-xs text-[var(--text-secondary)] text-center mb-6">
              {boardingPassConfig.tagline}
            </p>
          )}

          <div className="space-y-4">
            {boardingPassConfig.sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-2">
                  {section.title}
                </h2>
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li
                      key={j}
                      className="boarding-pass__entry pl-3 border-l-2 border-[var(--accent-warm)]"
                    >
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-sm font-bold text-[var(--text-primary)] font-display">
                          {item.role}
                        </span>
                        <span className="text-[var(--text-muted)] hidden sm:inline">·</span>
                        <span className="text-[var(--text-secondary)] text-sm">{item.org}</span>
                        <span className="font-mono text-xs text-[var(--text-tertiary)]">
                          {item.period}
                        </span>
                      </div>
                      {item.desc && (
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                          {item.desc}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
