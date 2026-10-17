"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Flap } from "./Flap";

const frames = [
  ["YYZ", "TORONTO"],
  ["DXB", "DUBAI"],
  ["KHI", "KARACHI"],
  ["AFA", "AMMAR ADAM"],
] as const;

// Decided once per page load, so a double-run effect can't mark the visit as seen and skip the board.
let firstVisit: boolean | null = null;
function isFirstVisit() {
  if (firstVisit === null) {
    try {
      firstVisit = sessionStorage.getItem("afa-boarded") !== "1";
      sessionStorage.setItem("afa-boarded", "1");
    } catch {
      firstVisit = true;
    }
  }
  return firstVisit;
}

/** Opening board: flips through the three home cities, then lands on the name. Once per session. */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [frame, setFrame] = useState(0);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const seen = !isFirstVisit();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      const id = window.setTimeout(() => setOpen(false), 0);
      return () => window.clearTimeout(id);
    }
    const ids = [
      window.setTimeout(() => setFrame(1), 620),
      window.setTimeout(() => setFrame(2), 1180),
      window.setTimeout(() => setFrame(3), 1740),
      window.setTimeout(() => setOpen(false), 2900),
    ];
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, []);

  const [code, city] = frames[frame];
  const final = frame === frames.length - 1;

  return (
    <AnimatePresence onExitComplete={onDone}>
      {open && (
        <motion.div
          className="preloader"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            className="pl-board"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pl-head">
              <span><i className="pl-dot" />Departures</span>
              <span>{final ? "Now boarding" : "Connecting"}</span>
            </div>
            <div className="pl-row">
              <Flap value={code} length={3} step={26} stagger={30} className="flap-lg flap-amber" />
              <Flap value={city} length={10} step={26} stagger={22} className="flap-lg" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
