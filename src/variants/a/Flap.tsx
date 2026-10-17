"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Split-flap text, copied from src/legacy/FlapText.tsx (uses the `.sf-*` styles in globals).
 * Difference: no periodic re-flap. Cells only flip when `value` changes, so a board with
 * seven live rows stays calm until something actually happens.
 */
/* Every glyph appears once: the legacy drum listed "-" twice, so any cell that cycled past
   "+" bounced between "+" and "-" forever (the garbled statuses on the old board). */
const chars = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:/.-";

function charIndex(char: string) {
  const index = chars.indexOf((char || " ").toUpperCase());
  return index < 0 ? 0 : index;
}

function FlapChar({ target, stepMs, startDelay }: { target: string; stepMs: number; startDelay: number }) {
  const [shown, setShown] = useState(" ");
  const [previous, setPrevious] = useState(" ");
  const [key, setKey] = useState(0);
  const current = useRef(" ");
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
        setKey((v) => v + 1);
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
      <span className="sf-leaf sf-leaf--top" key={`t-${key}`}><span className="sf-g">{previous}</span></span>
      <span className="sf-leaf sf-leaf--bottom" key={`b-${key}`}><span className="sf-g">{shown}</span></span>
    </span>
  );
}

export function Flap({
  value,
  length,
  perChar = 26,
  stepMs = 38,
  className = "",
}: {
  value: string;
  length?: number;
  perChar?: number;
  stepMs?: number;
  className?: string;
}) {
  const text = value.toUpperCase();
  const size = length ?? text.length;
  const padded = text.slice(0, size).padEnd(size, " ");
  return (
    <span className={`sf-word ${className}`} aria-label={value}>
      {Array.from({ length: size }).map((_, i) => (
        <FlapChar key={i} target={padded[i]} stepMs={stepMs} startDelay={i * perChar} />
      ))}
    </span>
  );
}
