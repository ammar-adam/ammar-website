"use client";

import { useEffect, useRef, useState } from "react";

const chars = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:/.-&";

function indexOf(char: string) {
  const i = chars.indexOf(char);
  return i < 0 ? 0 : i;
}

/** One split-flap cell. Steps through the drum until it reaches `target`. */
function Cell({ target, delay, step }: { target: string; delay: number; step: number }) {
  const [shown, setShown] = useState(" ");
  const [prev, setPrev] = useState(" ");
  const [flips, setFlips] = useState(0);
  const current = useRef(" ");

  useEffect(() => {
    let timer: number | undefined;
    const start = window.setTimeout(function tick() {
      if (current.current === target) return;
      const next = chars[(indexOf(current.current) + 1) % chars.length];
      setPrev(current.current);
      current.current = next;
      setShown(next);
      setFlips((n) => n + 1);
      timer = window.setTimeout(tick, step);
    }, delay);
    return () => {
      window.clearTimeout(start);
      if (timer) window.clearTimeout(timer);
    };
  }, [target, delay, step]);

  return (
    <span className="flap-cell" aria-hidden>
      <span className="flap-half flap-top"><span>{shown}</span></span>
      <span className="flap-half flap-bot"><span>{shown}</span></span>
      {flips > 0 && (
        <>
          <span className="flap-leaf flap-leaf-top" key={`t${flips}`}><span>{prev}</span></span>
          <span className="flap-leaf flap-leaf-bot" key={`b${flips}`}><span>{shown}</span></span>
        </>
      )}
    </span>
  );
}

export function Flap({
  value,
  length,
  delay = 0,
  stagger = 24,
  step = 38,
  className = "",
}: {
  value: string;
  length?: number;
  delay?: number;
  stagger?: number;
  step?: number;
  className?: string;
}) {
  const text = value.toUpperCase();
  const size = length ?? text.length;
  const padded = text.slice(0, size).padEnd(size, " ");
  return (
    <span className={`flap ${className}`} role="text" aria-label={value}>
      {Array.from(padded).map((ch, i) => (
        <Cell key={i} target={chars.includes(ch) ? ch : " "} delay={delay + i * stagger} step={step} />
      ))}
    </span>
  );
}
