"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";

/* The timeline. One scroll track, t in [0,1]. Segments are ranges of t that the
   camera travels through; cuts between them are glitch bands. */

export const SEG = {
  cold: [0, 0.07],
  airports: [0.07, 0.23],
  checkin: [0.23, 0.44],
  big: [0.44, 0.56],
  security: [0.56, 0.72],
  gate: [0.72, 0.84],
  off: [0.84, 0.895],
  boarding: [0.895, 1],
} as const satisfies Record<string, readonly [number, number]>;

export const CUTS = [0.07, 0.23, 0.44, 0.56, 0.72, 0.84, 0.895];

/** Anchors: where the quiet nav jumps to (as t). */
export const ANCHORS = [
  { id: "experience", label: "Experience", t: 0.245 },
  { id: "projects", label: "Projects", t: 0.575 },
  { id: "photos", label: "Photos", t: 0.735 },
  { id: "resume", label: "Resume", t: 0.93 },
];

export interface Line { a: number; b: number; text: string }

/** The narration. One line on screen at a time. */
export const LINES: Line[] = [
  { a: 0.012, b: 0.062, text: "Alright. Let's do this one more time." },
  { a: 0.08, b: 0.12, text: "My name is Ammar Adam." },
  { a: 0.125, b: 0.175, text: "I grew up between three airports. Toronto, Dubai, Karachi." },
  { a: 0.18, b: 0.225, text: "Somewhere in there I decided airports were the most interesting places on Earth." },
  { a: 0.24, b: 0.29, text: "At sixteen I was the youngest intern at Alpen Capital, doing M&A in Dubai." },
  { a: 0.296, b: 0.35, text: "Then product engineering at DataStealth. Then AI at Sagard, building tools for lawyers." },
  { a: 0.356, b: 0.395, text: "At Waterloo I run the Venture Group. Thirteen hundred people. Thirty placed into startups." },
  { a: 0.40, b: 0.436, text: "I help run Tech Week and Hack the North, which is a very polite way of saying I don't sleep in September." },
  { a: 0.45, b: 0.502, text: "And for the past year I've been one of five Founding Builder Leads for OpenAI in North America." },
  { a: 0.508, b: 0.556, text: "Pear VC made me a fellow. I still don't fully believe either sentence." },
  { a: 0.57, b: 0.625, text: "This is what's in the bag." },
  { a: 0.73, b: 0.785, text: "Some of the people and places that made the last few years." },
  { a: 0.905, b: 0.95, text: "That's the story so far. Scan the pass for the long version." },
];

/** Local progress + opacity for a segment. */
export function useSeg(t: MotionValue<number>, range: readonly [number, number], fade = 0.012) {
  const [a, b] = range;
  const opacity = useTransform(t, [a - fade, a + fade, b - fade, b + fade], [0.002, 1, 1, 0.002]);
  const p = useTransform(t, [a, b], [0, 1], { clamp: true });
  return { opacity, p, a, b };
}

/** True when t is near the segment, so we only mount what is on or next to screen. */
export function useActive(t: MotionValue<number>, range: readonly [number, number], pad = 0.1) {
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

/** Quantised version of a motion value (px steps = drawn frames, 12fps feel). */
export function useStepped(v: MotionValue<number>, size: number) {
  return useTransform(v, (x) => Math.round(x / size) * size);
}

/**
 * Camera dolly with holds: the camera parks on each of n stops for `hold` of
 * each stop's share of [a,b], then moves to the next. Stops are evenly spaced
 * from `from` to `to` (px). `enterFrom` is where the row sits before `a`.
 */
export function useHoldDolly(p: MotionValue<number>, n: number, a: number, b: number, hold: number, from: number, to: number, enterFrom?: number) {
  const input: number[] = [];
  const output: number[] = [];
  const seg = (b - a) / n;
  if (enterFrom !== undefined) { input.push(a - 0.08); output.push(enterFrom); }
  for (let k = 0; k < n; k++) {
    const pos = n === 1 ? from : from + ((to - from) * k) / (n - 1);
    const s = a + k * seg;
    input.push(s, Math.min(b, s + seg * hold));
    output.push(pos, pos);
  }
  return useTransform(p, input, output, { clamp: true });
}
