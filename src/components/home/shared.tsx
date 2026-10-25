"use client";

import { useRef, useState } from "react";
import { motion, useInView, useMotionValueEvent, type MotionValue } from "framer-motion";
import { cloudPosterUrl, cloudVideoUrl } from "@/components/shell/Shell";
import type { Project } from "@/data/departures";
import { siteConfig } from "@/data/site";

export const ease = [0.22, 1, 0.36, 1] as const;
export const pad2 = (n: number) => String(n).padStart(2, "0");
export const host = (url?: string) => (url ? url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : "");
export const shotFor = (p: Project) =>
  p.slug === "canadaclip" ? "https://img.youtube.com/vi/JzYwfPrcPtM/maxresdefault.jpg" : p.screenshot;

/** City → airport code for bag tags. */
export const CODES: Record<string, string> = {
  Dubai: "DXB",
  Mississauga: "YYZ",
  Toronto: "YYZ",
  Waterloo: "YKF",
  "San Francisco": "SFO",
  "Palo Alto": "SFO",
};

export const SOCIALS = [
  { label: "Email", href: siteConfig.socialLinks.email },
  { label: "LinkedIn", href: siteConfig.socialLinks.linkedin },
  { label: "GitHub", href: siteConfig.socialLinks.github },
  { label: "X", href: siteConfig.socialLinks.x },
];

/** The four stops, in walking order. Only boarding is a gate. */
export const STOPS = [
  { id: "checkin", no: "01", title: "Check-in", where: "Hall A", here: "Check-in · Hall A", dest: "EXPERIENCE", time: "09:10", status: "CHECK-IN OPEN" },
  { id: "security", no: "02", title: "Security", where: "Lane 2", here: "Security · Lane 2", dest: "PROJECTS", time: "09:40", status: "ON TIME" },
  { id: "passport", no: "03", title: "Passport control", where: "Booth 3", here: "Passport control · Booth 3", dest: "PHOTOS", time: "10:05", status: "ON TIME" },
  { id: "boarding", no: "04", title: "Boarding", where: "Gate D", here: "Gate D · Boarding", dest: "RESUME", time: "10:30", status: "FINAL CALL" },
] as const;

/** Scroll so that step `i` of `n` sits in the middle of its range inside a pinned section. */
export function jumpToStep(el: HTMLElement | null, i: number, n: number, from = 0, to = 1) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const span = el.offsetHeight - window.innerHeight;
  const t = from + ((i + 0.5) / n) * (to - from);
  window.scrollTo({ top: top + t * span, behavior: "smooth" });
}

/** Scroll to the element after a section. */
export function skipPast(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + el.offsetHeight - 40, behavior: "smooth" });
}

/** Stepped index in [0, n) derived from a motion value over [from, to]. */
export function useStepFrom(mv: MotionValue<number>, n: number, from = 0, to = 1) {
  const [step, setStep] = useState(0);
  useMotionValueEvent(mv, "change", (v) => {
    const t = Math.min(1, Math.max(0, (v - from) / (to - from)));
    const next = Math.min(n - 1, Math.max(0, Math.floor(t * n)));
    setStep((s) => (s === next ? s : next));
  });
  return step;
}

/**
 * The one header every scene uses, so the page reads as one walk:
 * number, place, what it holds, and a hint on the right.
 */
export function SceneHead({
  no,
  title,
  where,
  sub,
  hint,
  skip,
}: {
  no: string;
  title: string;
  where: string;
  sub: string;
  hint?: React.ReactNode;
  skip?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  return (
    <div className="va-head" ref={ref}>
      <div className="va-head-l">
        <motion.span className="va-head-no" initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease }}>
          {no} · {where.toUpperCase()}
        </motion.span>
        <span className="mask">
          <motion.h2 className="va-head-title" initial={{ y: "105%" }} animate={inView ? { y: "0%" } : {}} transition={{ duration: 0.9, ease, delay: 0.05 }}>
            {title}
          </motion.h2>
        </span>
        <motion.p className="va-head-sub" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.8, delay: 0.25 }}>
          {sub}
        </motion.p>
      </div>
      <motion.div className="va-head-r" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.8, delay: 0.35 }}>
        {hint && <span className="va-head-hint">{hint}</span>}
        {skip && (
          <button type="button" className="va-head-skip" onClick={() => skipPast(skip)}>
            Skip ↓
          </button>
        )}
      </motion.div>
    </div>
  );
}

/** Side-view airliner silhouette. */
export function Airliner({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 60" aria-hidden>
      <path d="M16 26 L6 4 h11 l22 22 Z" />
      <path d="M12 31 L0 37 h20 l8 -5 Z" />
      <path d="M8 30c0-4 4-6 12-6h138c16 0 29 3 36 7-6 4-17 6-30 6H24C14 37 8 34 8 30Z" />
      <path d="M82 33h38l-22 15h-12Z" />
      <rect x="90" y="39" width="24" height="8" rx="4" />
    </svg>
  );
}

/** Walking figure, side view, flat silhouette. */
export function Walker({ variant = 0 }: { variant?: 0 | 1 }) {
  return variant === 0 ? (
    <svg viewBox="0 0 60 120" className="va-walker" aria-hidden>
      <circle cx="30" cy="12" r="9" />
      <path d="M22 24h16l6 34-5 2-4-18-2 20 8 38h-8l-8-30-6 30h-8l6-40-3-20-5 16-5-2z" />
      <rect x="44" y="70" width="14" height="22" rx="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 60 120" className="va-walker" aria-hidden>
      <circle cx="28" cy="12" r="9" />
      <path d="M20 24h16l4 30 8 6-3 4-10-6-2 18 10 40h-8l-10-32-4 32h-8l6-44-2-18-6 12-4-3z" />
      <rect x="34" y="30" width="12" height="22" rx="4" />
    </svg>
  );
}

/** A suitcase, drawn in CSS. */
export function Suitcase({ finish = "navy", code, className = "" }: { finish?: "navy" | "oat" | "amber"; code?: string; className?: string }) {
  return (
    <span className={`va-sc va-sc-${finish} ${className}`} aria-hidden>
      <span className="va-sc-handle" />
      <span className="va-sc-body"><i className="va-sc-line" /><i className="va-sc-lock" /></span>
      <span className="va-sc-wheels"><i /><i /></span>
      {code && <span className="va-sc-tag">{code}</span>}
    </span>
  );
}

/** The arched window's inside: the old sky, clouds and cloud video. */
export function WindowSky({ lazy = false }: { lazy?: boolean }) {
  return (
    <div className="win-inner" aria-hidden>
      <div className="sky">
        <div className="sky-grad" />
        <div className="sky-clouds sky-clouds-a" />
        <div className="sky-clouds sky-clouds-b" />
        <video className="sky-video" autoPlay muted loop playsInline preload={lazy ? "none" : "metadata"} poster={cloudPosterUrl}>
          <source src={cloudVideoUrl} type="video/mp4" />
        </video>
        <div className="sky-grain" />
      </div>
    </div>
  );
}
