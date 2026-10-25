"use client";

import { useState } from "react";
import { useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";

export const SEG = {
  hero: [0, 0.15], checkin: [0.15, 0.42], security: [0.42, 0.70],
  gate: [0.70, 0.90], boarding: [0.90, 1],
} as const;
export const CUTS = [0.15, 0.42, 0.70, 0.90];
export const CHAPTERS = [
  { id: "top", label: "The introduction", short: "Intro", at: 0 },
  { id: "experience", label: "What I do", short: "Experience", at: 0.17 },
  { id: "projects", label: "Things I’ve built", short: "Projects", at: 0.445 },
  { id: "people", label: "Away from the laptop", short: "Life", at: 0.74 },
  { id: "contact", label: "The next departure", short: "Contact", at: 0.96 },
];

export function useSceneProgress(t: MotionValue<number>, chapter: number) {
  return useTransform(t, [chapter === 0 ? 0 : CUTS[chapter - 1], CUTS[chapter] ?? 1], [0, 1]);
}

/** Scroll chooses an item; clicking can hold a different item until the next scroll stop. */
export function useSelection(p: MotionValue<number>, count: number) {
  const selectAt = (value: number) => Math.min(count - 1, Math.max(0, Math.floor(value * count)));
  const [selected, setSelected] = useState(() => selectAt(p.get()));
  const index = useTransform(p, selectAt);
  useMotionValueEvent(index, "change", setSelected);
  return [selected, setSelected] as const;
}
