"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";

/* The timeline. One scroll track, t in [0,1]. Segments are ranges of t that the
   camera travels through; cuts between them are hard, with a 1.2% band where
   the outgoing picture is sliced and displaced before the swap. */

export const SEG = {
  cold: [0, 0.06],
  airports: [0.06, 0.21],
  checkin: [0.21, 0.35],
  big: [0.35, 0.51],
  security: [0.51, 0.65],
  gate: [0.65, 0.77],
  off: [0.77, 0.87],
  boarding: [0.87, 1],
} as const satisfies Record<string, readonly [number, number]>;

export const CUTS = [0.06, 0.21, 0.35, 0.51, 0.65, 0.77, 0.87];
export const BAND = 0.006;

/** Anchors: where the quiet nav jumps to (as t). */
export const ANCHORS = [
  { id: "experience", label: "Experience", t: 0.216 },
  { id: "projects", label: "Projects", t: 0.516 },
  { id: "photos", label: "Photos", t: 0.656 },
  { id: "resume", label: "Resume", t: 0.9 },
];

export interface Line {
  a: number;
  b: number;
  text: string;
  /** Position in the frame (CSS lengths). */
  x: string;
  y: string;
  align?: "left" | "center";
  /** On phones the caption moves to the top when content fills the lower half. */
  mobileTop?: boolean;
}

/** The narration. One line on screen at a time, placed in the set. */
export const LINES: Line[] = [
  { a: 0.008, b: 0.055, text: "Alright. Let's do this one more time.", x: "50%", y: "64%", align: "center" },
  { a: 0.07, b: 0.105, text: "My name is Ammar Adam.", x: "8vw", y: "14vh" },
  { a: 0.11, b: 0.16, text: "I grew up between three airports. Toronto, Dubai, Karachi.", x: "8vw", y: "14vh" },
  { a: 0.165, b: 0.205, text: "Somewhere in there, airports became my favourite places on Earth.", x: "8vw", y: "14vh" },
  { a: 0.213, b: 0.232, text: "At sixteen I was the youngest intern at Alpen Capital. M&A, in Dubai.", x: "50%", y: "6vh", align: "center" },
  { a: 0.234, b: 0.252, text: "Then product engineering at DataStealth.", x: "50%", y: "6vh", align: "center" },
  { a: 0.26, b: 0.276, text: "Then AI at Sagard, building tools for lawyers.", x: "50%", y: "6vh", align: "center" },
  { a: 0.278, b: 0.297, text: "At Waterloo I run the Venture Group. Thirteen hundred people. Thirty placed into startups.", x: "50%", y: "6vh", align: "center" },
  { a: 0.305, b: 0.345, text: "I help run Tech Week and Hack the North. September is not a sleeping month.", x: "50%", y: "6vh", align: "center" },
  { a: 0.36, b: 0.42, text: "For the past year I've been one of five Founding Builder Leads for OpenAI in North America.", x: "50%", y: "5vh", align: "center" },
  { a: 0.445, b: 0.5, text: "Pear VC made me a fellow. I still don't fully believe either sentence.", x: "50%", y: "5vh", align: "center" },
  { a: 0.515, b: 0.552, text: "This is what's in the bag.", x: "6vw", y: "9vh", mobileTop: true },
  { a: 0.66, b: 0.71, text: "The people who made the last few years. And too many sunsets.", x: "6vw", y: "12vh" },
  { a: 0.88, b: 0.93, text: "That's the story so far. Scan the pass for the long version.", x: "7vw", y: "80vh", mobileTop: true },
];

/* Glitch frames inside the exit band: slices of the outgoing picture, displaced. */
const CLIPS = [
  "none",
  "polygon(0 0,100% 0,100% 18%,0 18%,0 30%,100% 30%,100% 55%,0 55%,0 70%,100% 70%,100% 100%,0 100%)",
  "polygon(0 10%,100% 10%,100% 40%,0 40%,0 60%,100% 60%,100% 80%,0 80%)",
  "polygon(0 0,100% 0,100% 25%,0 25%,0 45%,100% 45%,100% 50%,0 50%,0 85%,100% 85%,100% 100%,0 100%)",
  "polygon(0 20%,100% 20%,100% 35%,0 35%,0 65%,100% 65%,100% 95%,0 95%)",
  "polygon(0 0,0 0,0 0)",
];
const JX = [0, 10, -14, 16, -8, 0];
export const GLITCH_FRAMES = 6;

export function glitchFrame(v: number, cut: number) {
  if (v < cut - BAND || v > cut + BAND) return -1;
  return Math.min(GLITCH_FRAMES - 1, Math.floor(((v - (cut - BAND)) / (2 * BAND)) * GLITCH_FRAMES));
}

/** Local progress, hard-cut opacity, glitch slices and z-order for a segment. */
export function useSeg(t: MotionValue<number>, range: readonly [number, number]) {
  const [a, b] = range;
  const start = a === 0 ? -1 : a - BAND;
  const end = b >= 1 ? 2 : b + BAND;
  const opacity = useTransform(t, [start - 0.0001, start, end - 0.0001, end], [0, 1, 1, 0]);
  const visibility = useTransform(opacity, (v) => (v > 0 ? "visible" : "hidden"));
  const p = useTransform(t, [a, b], [0, 1], { clamp: true });
  const frame = useTransform(t, (v) => (b >= 1 ? -1 : glitchFrame(v, b)));
  const clipPath = useTransform(frame, (f) => (f <= 0 ? "none" : CLIPS[f]));
  const x = useTransform(frame, (f) => (f < 0 ? 0 : JX[f]));
  const zIndex = useTransform(frame, (f) => (f >= 0 ? 3 : 1));
  const active = useTransform(t, (v) => (v >= start && v <= end ? "true" : "false"));
  return { opacity, visibility, p, a, b, clipPath, x, zIndex, active };
}

/** True when t is near the segment (mount the current one and the next). */
export function useActive(t: MotionValue<number>, range: readonly [number, number], pad = 0.12) {
  const [a, b] = range;
  const inRange = (v: number) => v >= a - pad && v <= b + pad;
  const [active, setActive] = useState(() => inRange(t.get()));
  useMotionValueEvent(t, "change", (v) => {
    const next = inRange(v);
    if (next !== active) setActive(next);
  });
  return active;
}

/** Viewport width, for camera dolly math. */
export function useVW() {
  const [vw, setVW] = useState(1440);
  useEffect(() => {
    const on = () => setVW(window.innerWidth);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vw;
}

/** Quantised version of a motion value (px steps = drawn frames). */
export function useStepped(v: MotionValue<number>, size: number) {
  return useTransform(v, (x) => Math.round(x / size) * size);
}

/**
 * Camera dolly with holds: the camera parks on each of n stops for `hold` of
 * each stop's share of [a,b], then moves to the next. `stops` are the x
 * positions (px) of each stop; `enterFrom` is where the row sits before `a`.
 */
export function useHoldDolly(p: MotionValue<number>, stops: number[], a: number, b: number, hold: number, enterFrom?: number) {
  const input: number[] = [];
  const output: number[] = [];
  const n = stops.length;
  const seg = (b - a) / n;
  if (enterFrom !== undefined) { input.push(a - 0.08); output.push(enterFrom); }
  for (let k = 0; k < n; k++) {
    const s = a + k * seg;
    input.push(s, Math.min(b, s + seg * hold));
    output.push(stops[k], stops[k]);
  }
  return useTransform(p, input, output, { clamp: true });
}

/** Evenly spaced stops from `from` to `to`. */
export function spaced(n: number, from: number, to: number) {
  return Array.from({ length: n }, (_, k) => (n === 1 ? from : from + ((to - from) * k) / (n - 1)));
}

/** Index of the current hold (React state), for things printed on the set per stop. */
export function useHoldIndex(p: MotionValue<number>, n: number, a: number, b: number) {
  const calc = (v: number) => Math.max(0, Math.min(n - 1, Math.floor(((v - a) / (b - a)) * n)));
  const [i, setI] = useState(() => calc(p.get()));
  useMotionValueEvent(p, "change", (v) => {
    const next = calc(v);
    if (next !== i) setI(next);
  });
  return i;
}
