"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cloudVideoUrl } from "@/variants/shared/Shell";

const ease = [0.22, 1, 0.36, 1] as const;

export type View = 0 | 1 | 2 | 3 | 4;

export const CARDS: { route: string; status: string; left: string; right: string; progress: number }[] = [
  { route: "AFA · CHECK-IN", status: "ON TIME", left: "GATES A–D · SEAT 2A", right: "YYZ", progress: 0.08 },
  { route: "DEPARTURES", status: "7 FLIGHTS", left: "DXB · YYZ · SFO", right: "ALL GATES", progress: 0.3 },
  { route: "GATE A", status: "NOW BOARDING", left: "GATES A1–A4", right: "2025–2026", progress: 0.52 },
  { route: "SEAT 2A", status: "CRUISING", left: "YYZ → TBD", right: "38,000 FT", progress: 0.74 },
  { route: "BOARDING", status: "GROUP 1", left: "GATE A · LAST CALL", right: "YYZ → TBD", progress: 0.96 },
];

/* Per view: sun position/size, cloud strength, video strength, star strength. */
const SUN = [
  { top: "14%", left: "66%", width: "46%", opacity: 0.95 },
  { top: "56%", left: "22%", width: "62%", opacity: 1 },
  { top: "-18%", left: "58%", width: "40%", opacity: 0.8 },
  { top: "84%", left: "40%", width: "70%", opacity: 0.45 },
  { top: "104%", left: "40%", width: "70%", opacity: 0 },
];
const CLOUDS = [0.6, 0.5, 0.75, 0.22, 0.1];
const VIDEO = [0.3, 0.26, 0.62, 0.14, 0.06];
const STARS = [0, 0, 0, 0.75, 1];

export function Window({ view, compact = false }: { view: View; compact?: boolean }) {
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : { duration: 0.9, ease };
  const card = CARDS[view];

  return (
    <div className={`window vb-window ${compact ? "is-compact" : ""}`} data-view={view} aria-hidden>
      <div className="win-inner">
        <div className="sky">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div key={i} className={`vb-skyL vb-skyL-${i}`} initial={false} animate={{ opacity: view === i ? 1 : 0 }} transition={t} />
          ))}
          <motion.div className="vb-sun" initial={false} animate={SUN[view]} transition={reduce ? { duration: 0 } : { duration: 1.4, ease }} />
          <motion.div className="vb-clouds" initial={false} animate={{ opacity: CLOUDS[view] }} transition={t}>
            <div className="sky-clouds sky-clouds-a" />
            <div className="sky-clouds sky-clouds-b" />
          </motion.div>
          <motion.video className="sky-video vb-video" autoPlay muted loop playsInline preload="metadata" initial={false} animate={{ opacity: VIDEO[view] }} transition={t}>
            <source src={cloudVideoUrl} type="video/mp4" />
          </motion.video>
          <motion.div className="vb-stars" initial={false} animate={{ opacity: STARS[view] }} transition={t} />
          <motion.div className="vb-haze" initial={false} animate={{ opacity: view <= 1 ? 1 : 0 }} transition={t} />
          <motion.div className="vb-runway" initial={false} animate={{ opacity: view === 4 ? 1 : 0 }} transition={t} />
          <div className="sky-grain" />
          <div className="sky-vignette" />
        </div>
      </div>
      <div className="win-frame" />
      <div className="flight-card vb-card">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            className="vb-card-in"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={reduce ? { duration: 0 } : { duration: 0.45, ease }}
          >
            <div className="fc-top">
              <span className="fc-route">{card.route}</span>
              <span className="fc-status">{card.status}</span>
            </div>
            <div className="fc-bar"><motion.i initial={false} animate={{ width: `${card.progress * 100}%` }} transition={t} /></div>
            <div className="fc-sub">
              <span>{card.left}</span>
              <span>{card.right}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
