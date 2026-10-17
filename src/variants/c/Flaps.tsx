"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Split-flap text for variant C. Copied from src/legacy/FlapText.tsx with two changes:
 * - `animate={false}` renders the final characters statically (reduced motion, or before the
 *   board has come into view), no leaves, no timers.
 * - no periodic re-flip cycle; the board flips in once and then sits still.
 * Cells use the old `.sf-*` styles from globals.css.
 */

/* One ring of characters, no duplicates (the legacy ring had "-" twice, which trapped cells in a -/+ loop). */
const chars = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&·-/";

function charIndex(char: string) {
  const index = chars.indexOf((char || " ").toUpperCase());
  return index < 0 ? 0 : index;
}

/* Start a handful of positions before the target so every cell settles within ~10 flips. */
function startChar(target: string) {
  const steps = 5 + Math.floor(Math.random() * 6);
  return chars[(charIndex(target) - steps + chars.length) % chars.length];
}

function FlapChar({ target, stepMs, startDelay }: { target: string; stepMs: number; startDelay: number }) {
  const [shown, setShown] = useState(() => startChar(target));
  const [previous, setPrevious] = useState(" ");
  const [key, setKey] = useState(0);
  const current = useRef(shown);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const finalChar = (target || " ").toUpperCase();
    const delay = window.setTimeout(() => {
      const tick = () => {
        if (current.current === finalChar) return;
        const next = chars[(charIndex(current.current) + 1) % chars.length];
        setPrevious(current.current);
        current.current = next;
        setShown(next);
        setKey((value) => value + 1);
        timer.current = window.setTimeout(tick, stepMs);
      };
      tick();
    }, startDelay);
    return () => {
      window.clearTimeout(delay);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [target, stepMs, startDelay]);

  return (
    <span className="sf-cell">
      <span className="sf-half sf-half--top"><span className="sf-g">{shown}</span></span>
      <span className="sf-half sf-half--bottom"><span className="sf-g">{shown}</span></span>
      <span className="sf-leaf sf-leaf--top" key={`top-${key}`}><span className="sf-g">{previous}</span></span>
      <span className="sf-leaf sf-leaf--bottom" key={`bottom-${key}`}><span className="sf-g">{shown}</span></span>
    </span>
  );
}

function StaticChar({ target }: { target: string }) {
  const c = (target || " ").toUpperCase();
  return (
    <span className="sf-cell">
      <span className="sf-half sf-half--top"><span className="sf-g">{c}</span></span>
      <span className="sf-half sf-half--bottom"><span className="sf-g">{c}</span></span>
    </span>
  );
}

export function Flaps({
  value,
  length,
  animate = true,
  baseDelay = 0,
  perChar = 22,
  stepMs = 34,
  className = "",
}: {
  value: string;
  length?: number;
  animate?: boolean;
  baseDelay?: number;
  perChar?: number;
  stepMs?: number;
  className?: string;
}) {
  const text = value.toUpperCase();
  const size = length ?? text.length;
  const padded = text.slice(0, size).padEnd(size, " ");
  return (
    <span className={`sf-word ${className}`} aria-label={value}>
      {Array.from({ length: size }).map((_, index) =>
        animate ? (
          <FlapChar key={index} target={padded[index]} stepMs={stepMs} startDelay={baseDelay + index * perChar} />
        ) : (
          <StaticChar key={index} target={padded[index]} />
        ),
      )}
    </span>
  );
}
