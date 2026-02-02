"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BackgroundPeople } from "@/components/BackgroundPeople";
import { silhouetteImages } from "@/data/silhouettes";

export function LoungeDoorSection() {
  return (
    <section className="relative py-10 sm:py-14 px-4 sm:px-6 lg:px-12 z-10 overflow-hidden">
      <BackgroundPeople section="lounge" images={silhouetteImages.lounge} />
      <div className="mx-auto max-w-xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-2">
            Lounge
          </p>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1 font-display">
            Behind the Scenes
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            It&apos;s quieter in here. Enter if you want.
          </p>

          <Link href="/lounge" className="lounge-door-section-link block group">
            <div className="door-container relative w-36 sm:w-40 mx-auto mb-4">
              <svg viewBox="0 0 200 320" className="door-svg w-full h-auto block transition-transform duration-300 group-hover:scale-[1.02] group-hover:-translate-y-0.5">
                <rect x="30" y="10" width="140" height="300" fill="var(--bg-elevated)" stroke="var(--accent-warm)" strokeWidth="2.5" rx="8" />
                <line x1="100" y1="20" x2="100" y2="300" stroke="rgba(232,166,100,0.25)" strokeWidth="1.5" />
                <rect x="45" y="30" width="45" height="120" fill="none" stroke="rgba(232,166,100,0.2)" strokeWidth="1.5" rx="4" />
                <rect x="110" y="30" width="45" height="120" fill="none" stroke="rgba(232,166,100,0.2)" strokeWidth="1.5" rx="4" />
                <rect x="45" y="160" width="45" height="120" fill="none" stroke="rgba(232,166,100,0.2)" strokeWidth="1.5" rx="4" />
                <rect x="110" y="160" width="45" height="120" fill="none" stroke="rgba(232,166,100,0.2)" strokeWidth="1.5" rx="4" />
                <circle cx="145" cy="160" r="6" fill="var(--accent-warm)" opacity="0.8" />
                <ellipse cx="145" cy="160" rx="10" ry="3.5" fill="none" stroke="var(--accent-warm)" strokeWidth="1.5" opacity="0.4" />
                <path d="M 30,310 Q 100,305 170,310" stroke="rgba(232,166,100,0.5)" strokeWidth="2.5" fill="none" opacity="0.6" />
              </svg>
              <div className="door-label absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="door-sign block font-mono text-xs font-semibold text-[var(--accent-warm)] uppercase tracking-[0.12em] bg-[var(--bg-deep)] px-2 py-1 rounded border-[1.5px] border-[var(--accent-warm)] mb-1 transition-shadow duration-300 group-hover:shadow-[0_2px_12px_rgba(232,166,100,0.3)]">
                  LOUNGE
                </span>
                <span className="door-subtitle block font-body text-[10px] text-[var(--text-tertiary)] italic">
                  Step inside
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-sm text-[var(--accent-warm)] font-medium hover:text-[var(--accent-glow)] transition-colors group-hover:gap-3">
              Enter
              <span aria-hidden>→</span>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
