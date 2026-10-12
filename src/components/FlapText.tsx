"use client";

import { useEffect, useRef, useState } from "react";

const chars = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:/.-+->!&";

function charIndex(char: string) {
  const index = chars.indexOf((char || " ").toUpperCase());
  return index < 0 ? 0 : index;
}

function FlapChar({ target, stepMs = 45, startDelay = 0 }: { target: string; stepMs?: number; startDelay?: number }) {
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

export function FlapText({
  value,
  length,
  baseDelay = 0,
  perChar = 28,
  stepMs = 45,
  className = "",
}: {
  value: string;
  length?: number;
  baseDelay?: number;
  perChar?: number;
  stepMs?: number;
  className?: string;
}) {
  const [cycle, setCycle] = useState(0);
  const text = value.toUpperCase();
  const size = length ?? text.length;
  const padded = text.slice(0, size).padEnd(size, " ");

  useEffect(() => {
    const id = window.setInterval(() => setCycle((value) => value + 1), 5600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={`sf-word ${className}`}>
      {Array.from({ length: size }).map((_, index) => (
        <FlapChar
          key={`${cycle}-${index}`}
          target={padded[index]}
          stepMs={stepMs}
          startDelay={baseDelay + index * perChar}
        />
      ))}
    </span>
  );
}
