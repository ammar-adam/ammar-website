"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { GateSign, Kid, Plane } from "./art";
import { SEG, useHoldDolly, useSeg, useStepped, useVW } from "./timeline";
import { BangAt } from "./ui";
import { SegRoot } from "./SegRoot";

const CITIES = [
  { city: "TORONTO", code: "YYZ", flight: "AA 416", status: "ON TIME" },
  { city: "DUBAI", code: "DXB", flight: "EK 242", status: "BOARDING" },
  { city: "KARACHI", code: "KHI", flight: "PK 784", status: "ON TIME" },
];

/* Segment 1: night ramp. The camera parks on each of three gate signs in turn
   (hold-dolly), the terminal slides slower behind (soft), a plane rolls past
   nose-first on stepped frames with its smear behind the tail, and the kid
   walks into frame in screen space. Then a pull-back shows all three lit. */
export function S1Airports({ t }: { t: MotionValue<number> }) {
  const seg = useSeg(t, SEG.airports);
  const { p } = seg;
  const vw = useVW();

  // camera: three holds, then pull back
  const camX = useHoldDolly(p, [0, -vw * 0.5, -vw * 1.0], 0.25, 0.85, 0.55);
  const zoom = useTransform(p, [0.85, 1], [1, 0.72]);

  // plane rolls past, nose left, stepped; smear only while it moves
  const planeRaw = useTransform(p, [0.05, 0.75], [vw * 1.1, -vw * 0.9]);
  const planeX = useStepped(planeRaw, 22);
  const bob = useTransform(p, (v) => (Math.floor(v * 90) % 3) * 2 - 2);
  const echoOp = useTransform(p, [0.05, 0.08, 0.7, 0.75], [0, 1, 1, 0]);

  // gates light up as the camera reaches each hold
  const g0 = useTransform(p, [0.27, 0.3], [0, 1]);
  const g1 = useTransform(p, [0.47, 0.5], [0, 1]);
  const g2 = useTransform(p, [0.67, 0.7], [0, 1]);
  const gates = [g0, g1, g2];

  // kid in screen space: walks 15% -> 45% of the frame over p .55-1, 8fps steps
  const kidRaw = useTransform(p, [0.55, 1], [vw * 0.15, vw * 0.45]);
  const kidX = useStepped(kidRaw, 24);
  const kidOp = useTransform(p, [0.52, 0.56], [0, 1]);

  // split-flap row: city cycles with the holds
  const cityIdx = useTransform(p, (v) => Math.min(2, Math.max(0, Math.floor((v - 0.25) / 0.2))));
  const boardOp = useTransform(p, [0.2, 0.25], [0, 1]);

  return (
    <SegRoot seg={seg} className="seg-airports">
      <motion.div className="world ramp-world" style={{ scale: zoom }}>

        <motion.div className="layer mid" style={{ x: camX }}>
          <motion.div className="flap-row" style={{ opacity: boardOp }}>
            <FlapRow idx={cityIdx} />
          </motion.div>
          {[
            { code: "YYZ", city: "Toronto", tone: "cyan" as const },
            { code: "DXB", city: "Dubai", tone: "amber" as const },
            { code: "KHI", city: "Karachi", tone: "mag" as const },
          ].map((g, i) => (
            <motion.div key={g.code} className="gate-slot" style={{ opacity: gates[i], left: `${50 + i * 50}vw` }}>
              <GateSign {...g} />
            </motion.div>
          ))}
          <motion.div className="roll-plane" style={{ x: planeX, y: bob }}>
            <motion.span className="echo e2" style={{ opacity: echoOp }} aria-hidden="true"><Plane id="rp2" mono="#2a1f5a" flip /></motion.span>
            <motion.span className="echo e1" style={{ opacity: echoOp }} aria-hidden="true"><Plane id="rp1" mono="#3b2d7a" flip /></motion.span>
            <Plane id="rp" className="roll-plane-svg" light="ramp" flip />
            <div className="roll-reflect" aria-hidden="true"><Plane id="rpr" mono="#2a1d4a" flip /></div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div className="kid-walk" style={{ x: kidX, opacity: kidOp }}>
        <span className="kid-shadow" aria-hidden="true" />
        <span className="kid-echo ke2" aria-hidden="true"><Kid mono="#0b0820" /></span>
        <span className="kid-echo ke1" aria-hidden="true"><Kid mono="#0b0820" /></span>
        <Kid className="kid-svg" rim="#ffb46a" />
        <span className="kid-reflect" aria-hidden="true"><Kid mono="#2a1d4a" /></span>
      </motion.div>
      <BangAt t={t} at={0.128} hold={0.025} text="RRRMMMM" size={54} rotate={-6} color="#fff6ea" burst="#ff2e88" className="bang-roll sfx" />
    </SegRoot>
  );
}

function FlapRow({ idx }: { idx: MotionValue<number> }) {
  const [ci, setCi] = useState(0);
  useMotionValueEvent(idx, "change", (v) => setCi(v));
  const c = CITIES[ci];
  const cells = [c.flight, c.city.padEnd(8, " "), c.code, c.status.padEnd(8, " ")];
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
