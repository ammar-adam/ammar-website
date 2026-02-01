"use client";

import { motion } from "framer-motion";
import { boardingPassConfig } from "@/data/boardingPass";

export function BoardingPassViewer() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl ml-0 sm:ml-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">
            Boarding Pass Office
          </p>
          <h1 className="text-2xl sm:text-3xl font-light text-[var(--text-primary)] mb-2">
            Boarding Pass
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-8">
            {boardingPassConfig.displayName}
          </p>

          <div className="mb-8">
            <a
              href={boardingPassConfig.resumeFileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--bg-dark)] bg-[var(--accent-amber)] hover:bg-[#fbbf24] rounded-lg border border-[var(--accent-amber)]/30 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-amber)] focus:ring-offset-2 focus:ring-offset-[var(--bg-dark)]"
            >
              Download PDF
              <span aria-hidden>→</span>
            </a>
          </div>

          <div className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-6 sm:p-8">
            <div className="space-y-8">
              {boardingPassConfig.sections.map((section, i) => (
                <motion.section
                  key={section.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-4">
                    {section.title}
                  </h2>
                  <ul className="space-y-4">
                    {section.items.map((item, j) => (
                      <li
                        key={j}
                        className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-l-2 border-[var(--accent-amber)]/40 pl-4"
                      >
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="font-semibold text-[var(--text-primary)]">
                            {item.role}
                          </span>
                          <span className="text-[var(--text-muted)] hidden sm:inline">·</span>
                          <span className="text-[var(--text-secondary)]">{item.org}</span>
                          <span className="text-[var(--text-muted)] text-sm font-mono">
                            {item.period}
                          </span>
                        </div>
                        {item.desc && (
                          <p className="text-sm text-[var(--text-secondary)] mt-1 sm:mt-0">
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
