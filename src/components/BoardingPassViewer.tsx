"use client";

import { motion } from "framer-motion";
import { boardingPassConfig } from "@/data/boardingPass";
import { PerforationDivider } from "@/components/ui/PerforationDivider";

export function BoardingPassViewer() {
  return (
    <section className="py-12 sm:py-16 px-4">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-light text-neutral-900 mb-2">
            Boarding Pass
          </h1>
          <p className="text-sm text-neutral-500 mb-8">
            {boardingPassConfig.displayName}
          </p>

          <div className="mb-6">
            <a
              href={boardingPassConfig.resumeFileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
            >
              Download PDF
              <span aria-hidden>→</span>
            </a>
          </div>

          <PerforationDivider />

          <div className="space-y-8">
            {boardingPassConfig.sections.map((section, i) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <h2 className="text-sm font-medium text-neutral-900 uppercase tracking-wider mb-4">
                  {section.title}
                </h2>
                <ul className="space-y-4">
                  {section.items.map((item, j) => (
                    <li key={j} className="border-l-2 border-neutral-200 pl-4">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-medium text-neutral-900">
                          {item.role}
                        </span>
                        <span className="text-neutral-500">·</span>
                        <span className="text-neutral-600">{item.org}</span>
                        <span className="text-neutral-400 text-sm">
                          {item.period}
                        </span>
                      </div>
                      {item.desc && (
                        <p className="text-sm text-neutral-600 mt-1">
                          {item.desc}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.section>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
