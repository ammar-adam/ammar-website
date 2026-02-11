"use client";

import { boardingPassConfig } from "@/data/boardingPass";

export function BoardingPassViewer() {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-12 z-10">
      <div className="mx-auto max-w-xl w-full">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--metal-gray)] mb-2">
          Gate D · Boarding pass
        </p>
        <h1 className="page-title text-xl font-bold text-[var(--window-white)] mb-1">
          Resume
        </h1>
        <p className="text-sm font-mono text-[var(--metal-gray)] mb-6">
          {boardingPassConfig.displayName}
        </p>

        <div className="intro-boarding-pass-card rounded overflow-visible border-2 border-[var(--floor-line)] bg-[var(--terminal-dark)]">
          <div className="pass-header flex flex-wrap justify-between items-center gap-2 px-4 py-3 border-b-2 border-[var(--departure-amber)] bg-[var(--terminal-glow)]/30">
            <span className="font-mono text-xs font-bold text-[var(--departure-amber)] tracking-[0.15em]">
              ✈ AFA INTERNATIONAL
            </span>
            <span className="font-signage text-sm font-bold text-[var(--window-white)] tracking-wider">
              BOARDING PASS
            </span>
          </div>

          <div className="pass-body px-4 py-4">
            <div className="pass-info-grid grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-[10px] uppercase tracking-wider text-[var(--metal-gray)] mb-3">
              <span>Passenger name</span>
              <span className="text-[var(--window-white)] font-semibold normal-case">{boardingPassConfig.displayName}</span>
              <span>From</span>
              <span className="text-[var(--window-white)]">YYZ</span>
              <span>To</span>
              <span className="text-[var(--window-white)]">CAREER</span>
              <span>Flight</span>
              <span className="text-[var(--window-white)]">CFM001</span>
              <span>Date</span>
              <span className="text-[var(--window-white)]">2026</span>
              <span>Gate</span>
              <span className="text-[var(--window-white)]">D</span>
              <span>Seat</span>
              <span className="text-[var(--window-white)]">1A</span>
              <span>Status</span>
              <span className="text-[var(--departure-amber)]">{boardingPassConfig.tagline ?? "—"}</span>
            </div>

            <div className="pass-perf border-t-2 border-dashed border-[var(--floor-line)] relative pt-4 mt-4">
              <span className="absolute -top-3 left-0 text-[var(--metal-gray)]" aria-hidden>✂</span>
            </div>

            {boardingPassConfig.sections.map((section) => (
              <div key={section.title} className="mb-4 mt-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--metal-gray)] mb-2">
                  {section.title.toUpperCase()}
                </div>
                <div className="space-y-1">
                  {section.items.map((item, j) => (
                    <div key={j} className="flex justify-between gap-4 font-mono text-xs">
                      <span className="text-[var(--window-white)]">{item.role}</span>
                      <span className="text-[var(--metal-gray)]">
                        {item.org} · {item.period}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => window.open(boardingPassConfig.resumeFileUrl, "_blank", "noopener,noreferrer")}
              className="barcode-download-section group w-full mt-8 mb-6 py-6 px-6 rounded-lg border-2 border-dashed border-[var(--floor-line)] bg-transparent cursor-pointer transition-all duration-300 hover:border-[var(--departure-amber)] hover:bg-[var(--terminal-glow)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--departure-amber)]"
              aria-label="Download resume PDF"
            >
              <div
                className="barcode-lines w-full h-20 rounded bg-[var(--terminal-navy)] mb-4 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, var(--window-white) 0px, var(--window-white) 2px, transparent 2px, transparent 5px)`,
                }}
                aria-hidden
              />
              <p className="barcode-instruction font-mono text-[11px] text-[var(--metal-gray)] tracking-[0.15em] mb-2 uppercase transition-colors duration-300 group-hover:text-[var(--departure-amber)]">
                Click barcode to download PDF
              </p>
              <p className="barcode-label font-mono text-[9px] text-[var(--metal-gray)] tracking-[0.1em] uppercase">
                Sequence · Priority boarding
              </p>
            </button>
          </div>

          <div className="boarding-footer text-center pt-4 border-t-2 border-[var(--floor-line)]">
            <p className="group-label font-mono text-[11px] text-[var(--departure-amber)] tracking-[0.15em] uppercase m-0">
              Group: Priority
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
