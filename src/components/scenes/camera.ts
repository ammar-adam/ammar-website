"use client";

import { useEffect, useState, type RefObject } from "react";
import { useScroll, useSpring, useTransform } from "framer-motion";

export function useViewport() {
  const [vw, setVw] = useState(1440);
  useEffect(() => {
    const on = () => setVw(window.innerWidth);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vw;
}

/**
 * A side-scrolling camera for a pinned scene. `world` is the scene width in px;
 * the camera centre runs from vw/2 to world - vw/2 over the section's scroll,
 * finishing `tail` (a fraction) before the end, since the next scene covers
 * the last 100svh.
 */
export function useCamera(ref: RefObject<HTMLElement | null>, world: number, vw: number, tail = 0) {
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(p, { stiffness: 70, damping: 24, mass: 0.7 });
  const end = Math.max(0.05, 1 - tail);
  const camX = useTransform(smooth, [0, end], [vw / 2, Math.max(vw / 2, world - vw / 2)]);
  const mid = useTransform(camX, (c) => vw / 2 - c);
  const back = useTransform(camX, (c) => (vw / 2 - c) * 0.28);
  const signs = useTransform(camX, (c) => (vw / 2 - c) * 0.36);
  const floor = useTransform(camX, (c) => (vw / 2 - c) * 1.12);
  const front = useTransform(camX, (c) => (vw / 2 - c) * 1.38);
  const jump = (worldX: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    const t = ((worldX - vw / 2) / Math.max(1, world - vw)) * end;
    window.scrollTo({ top: top + Math.max(0, Math.min(end, t)) * span, behavior: "smooth" });
  };
  return { p, smooth, camX, mid, back, signs, floor, front, jump };
}
