"use client";

import { useState } from "react";
import { useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";

export const SEG = {
  hero: [0, 0.13], gates: [0.13, 0.26], checkin: [0.26, 0.48],
  security: [0.48, 0.73], gate: [0.73, 0.88], boarding: [0.88, 1],
} as const;
export const CUTS = [0.13, 0.26, 0.48, 0.73, 0.88];
export const CHAPTERS = [
  { id: "top", label: "The arrival", short: "Arrival", at: 0 },
  { id: "origins", label: "Between cities", short: "Origins", at: 0.16 },
  { id: "experience", label: "Connections", short: "Experience", at: 0.285 },
  { id: "projects", label: "In the carry-on", short: "Projects", at: 0.505 },
  { id: "people", label: "A little layover", short: "Life", at: 0.755 },
  { id: "contact", label: "The next departure", short: "Contact", at: 0.94 },
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
