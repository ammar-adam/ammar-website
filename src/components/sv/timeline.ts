"use client";

import { useRef, useState } from "react";
import { useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";

export const SEG = {
  hero: [0, 0.24], checkin: [0.24, 0.45], security: [0.45, 0.65],
  gate: [0.65, 0.86], boarding: [0.86, 1],
} as const;
export const CUTS = [0.24, 0.45, 0.65, 0.86];
export const CHAPTERS = [
  { id: "top", label: "The introduction", short: "Intro", at: 0 },
  { id: "experience", label: "Check-in / Experience", short: "Experience", at: 0.255 },
  { id: "projects", label: "Security / Projects", short: "Projects", at: 0.465 },
  { id: "people", label: "On the way to the gate", short: "Life", at: 0.665 },
  { id: "contact", label: "The next departure", short: "Contact", at: 0.925 },
];

export function useSceneProgress(t: MotionValue<number>, chapter: number) {
  return useTransform(t, [chapter === 0 ? 0 : CUTS[chapter - 1], CUTS[chapter] ?? 1], [0, 1]);
}

/** Optional seeking keeps a clicked item visible while the camera catches up to its scroll stop. */
export function useSelection(p: MotionValue<number>, count: number, seekWithSelection = false) {
  const selectAt = (value: number) => Math.min(count - 1, Math.max(0, Math.floor(value * count)));
  const [selected, setSelected] = useState(() => selectAt(p.get()));
  const index = useTransform(p, selectAt);
  const pending = useRef<number | null>(null);
  useMotionValueEvent(index, "change", value => {
    if (p.get() === 0 || p.get() === 1) pending.current = null;
    if (pending.current !== null && value !== pending.current) return;
    pending.current = null;
    setSelected(value);
  });
  const select = (value: number) => {
    pending.current = seekWithSelection && value !== index.get() ? value : null;
    setSelected(value);
  };
  return [selected, select] as const;
}
