"use client";

import { motion } from "framer-motion";
import { loungeContent, cafeContent } from "@/data/lounge";
import { AirportIcon } from "@/components/AirportIcon";

export function LoungePanel() {
  return (
    <section className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-12 z-10">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[var(--border-medium)] p-8 sm:p-10 relative overflow-hidden"
          style={{
            background: "linear-gradient(180deg, var(--bg-surface) 0%, #2a3038 100%)",
          }}
        >
          <div className="absolute top-6 right-6 opacity-[0.06] pointer-events-none">
            <AirportIcon src="/airport-icons/window.svg" className="w-14 h-14" />
          </div>

          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-4">
            Lounge
          </p>
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display">
            {loungeContent.headline}
          </h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-8">
            {loungeContent.blurb}
          </p>

          <p className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-5">
            Interests
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-16">
            {loungeContent.interests.map((interest, i) => (
              <motion.div
                key={interest}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08 * i }}
              >
                <div className="interest-pill">
                  {interest}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-[var(--border-medium)] pt-8">
            <div className="flex items-center gap-2 mb-4">
              <AirportIcon src="/airport-icons/coffee-cup.svg" className="w-4 h-4 opacity-[0.14]" />
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
                Café
              </p>
            </div>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-8">
              {cafeContent.intro}
            </p>
            <a
              href={cafeContent.sayHelloEmail}
              className="text-sm font-medium text-[var(--accent-warm)] hover:text-[var(--accent-glow)] transition-colors inline-flex items-center gap-1"
            >
              {cafeContent.cta}
              <span aria-hidden>→</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
