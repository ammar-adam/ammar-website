"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { SEG, useSeg } from "./timeline";
import { Painted } from "./world";
import { SegRoot } from "./SegRoot";

const LINES = [
  "Liverpool since I was ten.",
  "Paddington 2 is the best film ever made.",
  "I'll talk about airline economics until you stop me.",
  "Mango matcha. Shawarma.",
];

/* Segment 6: off the clock. One quiet painted frame: dawn over Dubai, the sun
   off-frame behind the skyline, clouds lit from below, a plane climbing far
   away. The lines come in at p .1/.25/.4/.55; the last 40% holds with only
   the cloud light drifting. */
export function S6Off({ t }: { t: MotionValue<number> }) {
  const seg = useSeg(t, SEG.off);
  const { p } = seg;
  return (
    <SegRoot seg={seg} className="seg-off">
      <div className="off-band" aria-hidden="true" />
      <div className="off-copy">
        <span className="off-k">Off the clock</span>
        {LINES.map((l, k) => (
          <OffLine key={l} text={l} k={k} p={p} />
        ))}
      </div>
    </SegRoot>
  );
}

function OffLine({ text, k, p }: { text: string; k: number; p: MotionValue<number> }) {
  const at = 0.1 + k * 0.15;
  const op = useTransform(p, [at, at + 0.04], [0, 1]);
  const step = useTransform(op, (v) => Math.round(v * 3) / 3);
  const x = useTransform(p, [at, at + 0.04], [-30, 0]);
  const xs = useTransform(x, (v) => Math.round(v / 10) * 10);
  return (
    <motion.div style={{ opacity: step, x: xs }}>
      <Painted className={`off-line ol${k}`}>{text}</Painted>
    </motion.div>
  );
}
