"use client";

import { boardingPassConfig } from "@/data/boardingPass";

export function BoardingPassViewer() {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-12 z-10">
      <div className="mx-auto max-w-xl w-full">
        <p className="airport-signage-label mb-2">Boarding Pass</p>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1 font-display">
          Resume
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          {boardingPassConfig.displayName}
        </p>

        <div className="intro-boarding-pass-card rounded-sm overflow-visible">
          <div className="pass-header">
            <span className="pass-airline">AFA INTERNATIONAL</span>
            <span className="pass-type">BOARDING PASS</span>
          </div>
          <div className="pass-perf" aria-hidden />
          <div className="pass-body">
            <div className="pass-passenger">{boardingPassConfig.displayName}</div>
            {boardingPassConfig.tagline && (
              <div className="pass-grid mb-3">
                <div className="pass-row">
                  <span className="pass-label">Status</span>
                  <span className="pass-value pass-value--status">{boardingPassConfig.tagline}</span>
                </div>
              </div>
            )}
            {boardingPassConfig.sections.map((section) => (
              <div key={section.title} className="mb-3">
                <div className="pass-label mb-1">{section.title}</div>
                <div className="pass-grid">
                  {section.items.map((item, j) => (
                    <div key={j} className="pass-row">
                      <span className="pass-label">{item.role}</span>
                      <span className="pass-value">
                        {item.org} · {item.period}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="boarding-pass-barcode-wrapper px-4 pb-2">
            <div
              className="pass-barcode-strip h-8 min-h-[28px] w-full max-w-full"
              aria-hidden
              role="img"
              aria-label="Barcode"
            />
          </div>
          <div className="px-4 pb-4 pt-2">
            <a
              href={boardingPassConfig.resumeFileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="boarding-pass__download block w-full text-center no-underline"
            >
              Export boarding pass (PDF)
            </a>
            <button
              type="button"
              className="mt-3 w-full text-center text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] border border-[var(--border-medium)] rounded-lg py-2 px-4 cursor-not-allowed"
              disabled
              title="Use Export boarding pass for PDF"
            >
              Download standard resume PDF (placeholder)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
