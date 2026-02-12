"use client";

import { boardingPassConfig } from "@/data/boardingPass";

export function BoardingPassViewer() {
  return (
    <section className="resume-page resume-page-with-signage py-10 sm:py-14 px-4 sm:px-6 lg:px-12 z-10 relative">
      <div className="page-signage page-signage-resume" aria-hidden>
        <div className="signage-element signage-top-left">
          <span className="signage-text">Gate D</span>
          <span className="signage-arrow">↓</span>
        </div>
        <div className="signage-element signage-right">
          <span className="signage-arrow">→</span>
          <span className="signage-text">Boarding</span>
        </div>
      </div>
      <div className="mx-auto max-w-xl w-full">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--metal-gray)] mb-2">
          Gate D · Boarding pass
        </p>
        <h1 className="page-title text-xl font-bold text-[var(--window-white)] mb-6">
          Resume
        </h1>

        <div className="intro-boarding-pass-card boarding-pass-paper rounded overflow-visible border-2 border-[var(--floor-line)] bg-[var(--terminal-dark)]">
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
              <span className="text-[var(--window-white)]">{boardingPassConfig.from}</span>
              <span>To</span>
              <span className="text-[var(--window-white)]">{boardingPassConfig.to}</span>
              <span>Flight</span>
              <span className="text-[var(--window-white)]">{boardingPassConfig.flight}</span>
              <span>Status</span>
              <span className="text-[var(--departure-amber)]">{boardingPassConfig.tagline}</span>
            </div>

            <div className="pass-perf border-t-2 border-dashed border-[var(--floor-line)] relative pt-4 mt-4">
              <span className="absolute -top-3 left-0 text-[var(--metal-gray)]" aria-hidden>✂</span>
            </div>

            <a
              href={boardingPassConfig.resumeFileUrl}
              download="Ammar_Adam.pdf"
              className="barcode-download-section group block w-full mt-8 mb-6 py-6 px-6 rounded-lg border-2 border-dashed border-[var(--floor-line)] bg-transparent cursor-pointer transition-all duration-300 hover:border-[var(--departure-amber)] hover:bg-[var(--terminal-glow)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--departure-amber)] no-underline"
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
            </a>
          </div>

          <div className="boarding-footer text-center pt-4 border-t-2 border-[var(--floor-line)]">
            <p className="group-label font-mono text-[13px] font-bold text-[var(--departure-amber)] tracking-[0.15em] uppercase m-0">
              Group: Priority
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
