"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { GateSign, Kid } from "./art";
import { SEG, useSeg, useStepped, useVW } from "./timeline";
import { SegRoot } from "./SegRoot";

const CITIES = [
  { city: "TORONTO", code: "YYZ", status: "ON TIME" },
  { city: "DUBAI", code: "DXB", status: "BOARDING" },
  { city: "KARACHI", code: "KHI", status: "ON TIME" },
];

/* Segment 1: the homage to the three airports, nothing said. The kid walks
   across the night ramp; as the third line lands the YYZ, DXB and KHI gate
   signs light up in turn and the split-flap row cycles the three cities.
   The last line holds on the wide with all three lit. */
export function S1Gates({ t }: { t: MotionValue<number> }) {
  const seg = useSeg(t, SEG.gates);
  const { p } = seg;
  const vw = useVW();

  // signs light up during the third line (t .155-.2 -> p .47-.75)
  const g0 = useTransform(p, [0.5, 0.53], [0, 1]);
  const g1 = useTransform(p, [0.6, 0.63], [0, 1]);
  const g2 = useTransform(p, [0.7, 0.73], [0, 1]);
  const gates = [g0, g1, g2];
  const rowY = useTransform(p, [0.44, 0.5], [40, 0]);
  const rowYs = useTransform(rowY, (v) => Math.round(v / 8) * 8);
  const rowOp = useTransform(p, [0.44, 0.5], [0, 1]);

  // the kid walks in from the left and stops in the lower third
  const kidRaw = useTransform(p, [0.05, 0.6], [-vw * 0.2, vw * 0.05]);
  const kidX = useStepped(kidRaw, 24);
  const walking = useTransform(p, (v) => (v < 0.6 ? "walk" : "stand"));
  const [state, setState] = useState("walk");
  useMotionValueEvent(walking, "change", (v) => setState(v));

  const cityIdx = useTransform(p, (v) => Math.min(2, Math.max(0, Math.floor((v - 0.48) / 0.1))));

  return (
    <SegRoot seg={seg} className="seg-gates">
      <motion.div className="flap-row" style={{ opacity: rowOp, y: rowYs }}>
        <FlapRow idx={cityIdx} />
      </motion.div>
      <div className="gates-row">
        {[
          { code: "YYZ", city: "Toronto", tone: "cyan" as const },
          { code: "DXB", city: "Dubai", tone: "amber" as const },
          { code: "KHI", city: "Karachi", tone: "mag" as const },
        ].map((g, i) => (
          <motion.div key={g.code} className="gate-slot" style={{ opacity: gates[i] }}>
            <GateSign {...g} />
          </motion.div>
        ))}
      </div>
      <motion.div className={`kid-walk ${state}`} style={{ x: kidX }}>
        <span className="kid-shadow" aria-hidden="true" />
        <span className="kid-echo ke2" aria-hidden="true"><Kid mono="#0b0820" /></span>
        <span className="kid-echo ke1" aria-hidden="true"><Kid mono="#0b0820" /></span>
        <Kid className="kid-svg" rim="#ffb46a" />
        <span className="kid-reflect" aria-hidden="true"><Kid mono="#2a1d4a" /></span>
      </motion.div>
    </SegRoot>
  );
}

function FlapRow({ idx }: { idx: MotionValue<number> }) {
  const [ci, setCi] = useState(0);
  useMotionValueEvent(idx, "change", (v) => setCi(v));
  const c = CITIES[ci];
  const cells = [c.city.padEnd(8, " "), c.code, c.status.padEnd(8, " ")];
  return (
    <div className="flaps" key={ci}>
      <span className="flaps-k">Departures</span>
      {cells.map((cell, j) => (
        <span key={j} className="flaps-cell">
          {cell.split("").map((ch, k) => (
            <span key={`${ci}-${j}-${k}`} className="flap" style={{ ["--i" as string]: k + j * 3 }}>{ch}</span>
          ))}
        </span>
      ))}
    </div>
  );
}
