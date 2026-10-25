"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";

/* The timeline. One scroll track, t in [0,1]. Segments are ranges of t the
   camera travels through; cuts between them are hard, with a short band where
   the outgoing picture is sliced and displaced before the swap. */

export const SEG = {
  hero: [0, 0.08],
  gates: [0.08, 0.24],
  checkin: [0.24, 0.56],
  security: [0.56, 0.74],
  gate: [0.74, 0.87],
  boarding: [0.87, 1],
} as const satisfies Record<string, readonly [number, number]>;

export const CUTS = [0.08, 0.24, 0.56, 0.74, 0.87];
export const BAND = 0.006;

export const ANCHORS = [
  { id: "experience", label: "Experience", t: 0.246 },
  { id: "projects", label: "The bag", t: 0.566 },
  { id: "photos", label: "People", t: 0.746 },
  { id: "resume", label: "Resume", t: 0.9 },
];

export interface Line {
  a: number;
  b: number;
  text: string;
  x: string;
  y: string;
  align?: "left" | "center";
  mobileTop?: boolean;
}

/** The narration, verbatim, one line on screen at a time, placed near its subject. */
export const LINES: Line[] = [
  { a: -0.02, b: 0.075, text: "Alright. Let's do this one more time.", x: "6vw", y: "84vh" },
  { a: 0.085, b: 0.115, text: "My name is Ammar Adam.", x: "6vw", y: "12vh" },
  { a: 0.12, b: 0.15, text: "Born and raised in Toronto.", x: "6vw", y: "12vh" },
  { a: 0.155, b: 0.2, text: "Most of my family is a long flight away. I got very good at airports.", x: "6vw", y: "12vh" },
  { a: 0.205, b: 0.238, text: "I still think they're the best places on Earth.", x: "6vw", y: "12vh" },
  { a: 0.245, b: 0.268, text: "Right now my days go to a few things.", x: "50%", y: "7vh", align: "center" },
  { a: 0.28, b: 0.325, text: "Waterloo Tech Week and Hack the North, which I help run.", x: "50%", y: "7vh", align: "center" },
  { a: 0.338, b: 0.383, text: "The Waterloo Venture Group, where thirteen hundred students try to build things.", x: "50%", y: "7vh", align: "center" },
  { a: 0.395, b: 0.44, text: "And OpenAI, where I look for the best student projects in North America and back them.", x: "50%", y: "7vh", align: "center" },
  { a: 0.452, b: 0.497, text: "Technically I'm still shipping AI tools at Sagard too.", x: "50%", y: "7vh", align: "center" },
  { a: 0.507, b: 0.532, text: "Before that: Alpen Capital at sixteen, then DataStealth.", x: "50%", y: "7vh", align: "center" },
  { a: 0.535, b: 0.558, text: "Both changed what I thought I was allowed to try.", x: "50%", y: "7vh", align: "center" },
  { a: 0.565, b: 0.6, text: "This is what's in the bag.", x: "6vw", y: "9vh", mobileTop: true },
  { a: 0.705, b: 0.722, text: "The pattern: I like building things, and I like doing it with people.", x: "6vw", y: "9vh", mobileTop: true },
  { a: 0.724, b: 0.739, text: "One day it'll be my own company. Working on it.", x: "6vw", y: "9vh", mobileTop: true },
  { a: 0.745, b: 0.78, text: "Some of the people.", x: "6vw", y: "12vh" },
  { a: 0.88, b: 0.93, text: "That's the story so far. Scan the pass for the long version.", x: "6vw", y: "82vh", mobileTop: true },
];

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

export function useStepped(v: MotionValue<number>, size: number) {
  return useTransform(v, (x) => Math.round(x / size) * size);
}

/** Camera dolly with holds on each stop (px), parked for `hold` of each stop's share of [a,b]. */
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

export function useHoldIndex(p: MotionValue<number>, n: number, a: number, b: number) {
  const calc = (v: number) => Math.max(0, Math.min(n - 1, Math.floor(((v - a) / (b - a)) * n)));
  const [i, setI] = useState(() => calc(p.get()));
  useMotionValueEvent(p, "change", (v) => {
    const next = calc(v);
    if (next !== i) setI(next);
  });
  return i;
}
