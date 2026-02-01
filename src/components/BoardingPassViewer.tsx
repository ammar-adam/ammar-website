"use client";

import { motion } from "framer-motion";
import { boardingPassConfig } from "@/data/boardingPass";

export function BoardingPassViewer() {
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-12 z-10">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-3">
            Boarding Pass Office
          </p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-display">
            Boarding Pass
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-8">
            {boardingPassConfig.displayName}
          </p>

          <div
            className="boarding-pass rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-medium)",
              boxShadow: "var(--shadow-md)",
              padding: "32px",
            }}
          >
            <a
              href={boardingPassConfig.resumeFileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-warm)] transition-colors mb-6 inline-block"
            >
              {boardingPassConfig.ctaLabel}
            </a>

            <div
              className="h-24 w-full rounded mb-4 opacity-70"
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

            <p className="text-[10px] text-[var(--text-muted)] mb-6">
              Generated from terminal record.
            </p>

            <div className="space-y-6">
              {boardingPassConfig.sections.map((section, i) => (
                <motion.section
                  key={section.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <h2 className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-3">
                    {section.title}
                  </h2>
                  <ul className="space-y-3">
                    {section.items.map((item, j) => (
                      <li
                        key={j}
                        className="boarding-pass__entry pl-4 border-l-2 border-[var(--accent-warm)]"
                      >
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-base font-bold text-[var(--text-primary)] font-display">
                            {item.role}
                          </span>
                          <span className="text-[var(--text-muted)] hidden sm:inline">·</span>
                          <span className="text-[var(--text-secondary)]">{item.org}</span>
                          <span className="font-mono text-sm text-[var(--text-tertiary)]">
                            {item.period}
                          </span>
                        </div>
                        {item.desc && (
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
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
