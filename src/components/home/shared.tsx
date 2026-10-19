"use client";

import { useState } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
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

/** The five stops. The top bar's "you are here" and the hero board both use these. */
export const STOPS = [
  { id: "checkin", gate: "A", here: "Check-in · Bag drop", dest: "CHECK-IN", info: "Where I've worked", status: "NOW BOARDING" },
  { id: "security", gate: "B", here: "Security · X-ray lane 2", dest: "SECURITY", info: "What I've built", status: "ON TIME" },
  { id: "concourse", gate: "C", here: "Concourse · Moving walkway", dest: "CONCOURSE", info: "Pictures along the way", status: "ON TIME" },
  { id: "boarding", gate: "D", here: "Boarding · Final call", dest: "BOARDING", info: "Resume and contact", status: "FINAL CALL" },
] as const;

/** Scroll so that step `i` of `n` sits in the middle of its range inside a pinned section. */
export function jumpToStep(el: HTMLElement | null, i: number, n: number, from = 0, to = 1) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const span = el.offsetHeight - window.innerHeight;
  const t = from + ((i + 0.5) / n) * (to - from);
  window.scrollTo({ top: top + t * span, behavior: "smooth" });
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
