"use client";

import { useState, useEffect } from "react";

export function TerminalClock({ className = "" }: { className?: string }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <time
      dateTime={new Date().toISOString()}
      className={`font-mono text-sm tabular-nums ${className}`}
      aria-label={`Terminal time: ${time}`}
    >
      {time}
    </time>
  );
}
