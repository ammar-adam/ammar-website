"use client";

import { motion } from "framer-motion";
import { boardingPassConfig } from "@/data/boardingPass";

export function BoardingPassViewer() {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-12 z-10">
      <div className="mx-auto max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-2">
            Boarding Pass Office
          </p>
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1 font-display">
            Boarding Pass
          </h1>
          <p className="text-base text-[var(--text-secondary)] mb-6">
            Passenger: {boardingPassConfig.displayName}
          </p>

          <div
            className="boarding-pass boarding-pass-kiosk rounded-xl overflow-hidden"
            style={{
              padding: "20px 24px",
            }}
          >
            <p className="text-center font-mono text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
              Scan your boarding pass
            </p>

            <a
              href={boardingPassConfig.resumeFileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="barcode-button block w-full bg-[var(--bg-surface)] border-2 border-[var(--border-medium)] rounded-lg p-6 cursor-pointer transition-all duration-200 hover:border-[var(--accent-warm)] hover:bg-[rgba(232,166,100,0.05)] hover:shadow-[var(--glow-subtle)] hover:-translate-y-0.5 no-underline"
            >
              <div
                className="h-24 w-full rounded mb-4 opacity-80 min-h-[6rem]"
                style={{
                  background: `repeating-linear-gradient(
                    90deg,
                    var(--text-primary) 0px,
                    var(--text-primary) 2px,
                    transparent 2px,
                    transparent 4px,
                    var(--text-primary) 4px,
                    var(--text-primary) 5px,
                    transparent 5px,
                    transparent 8px
                  )`,
                }}
                aria-hidden
              />
              <span className="block text-center text-sm font-semibold text-[var(--accent-warm)]">
                Click to {boardingPassConfig.ctaLabel}
              </span>
            </a>

            <p className="text-[10px] text-[var(--text-muted)] text-center mb-2">
              Generated from terminal record.
            </p>
            {boardingPassConfig.tagline && (
              <p className="text-xs text-[var(--text-secondary)] text-center mb-6">
                {boardingPassConfig.tagline}
              </p>
            )}

            <div className="space-y-4">
              {boardingPassConfig.sections.map((section, i) => (
                <motion.section
                  key={section.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
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
                </motion.section>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
