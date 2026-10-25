"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Plane } from "./art";
import { SEG, useSeg } from "./timeline";
import { Chroma } from "./ui";
import { Sky, Stars, Painted } from "./world";

const LINES = [
  "Liverpool since I was ten.",
  "Paddington 2 is the best film ever made.",
  "I'll talk about airline economics until you stop me.",
  "Mango matcha. Shawarma.",
];

/* Segment 6: off the clock. One quiet frame. Dawn over Dubai in orange and
   violet, a plane hanging in slow motion, the lines painted on the sky. */
export function S6Off({ t }: { t: MotionValue<number> }) {
  const { opacity, p } = useSeg(t, SEG.off);
  const planeY = useTransform(p, [0, 1], [30, -30]);
  const planeX = useTransform(p, [0, 1], ["-6%", "6%"]);
  const dof = useTransform(p, [0, 0.5, 1], [5, 1, 4]);
  const sun = useTransform(p, [0, 1], [40, -20]);
  return (
    <motion.div className="seg seg-off" style={{ opacity }}>
      <Sky p={p} from="dusk" to="dawn" />
      <Stars className="stars-faint" />
      <motion.div className="sun" style={{ y: sun }} aria-hidden="true" />
      <div className="dubai" aria-hidden="true">
        <svg viewBox="0 0 1600 400" preserveAspectRatio="xMidYMax slice">
          <path d="M0 400 L0 330 L60 330 L60 290 L110 290 L110 330 L180 330 L180 250 L230 250 L230 330 L300 330 L300 300 L360 300 L360 330 L420 330 L420 200 L440 200 L450 160 L470 160 L480 120 L500 60 L510 0 L520 60 L540 120 L550 160 L570 160 L580 200 L600 200 L600 330 L680 330 L680 280 L740 280 L740 330 L800 330 L800 240 L830 240 L860 180 L880 240 L910 240 L910 330 L990 330 L990 300 L1040 300 L1040 330 L1120 330 L1120 220 L1150 220 L1160 190 L1180 220 L1210 220 L1210 330 L1290 330 L1290 290 L1340 290 L1340 330 L1420 330 L1420 260 L1470 260 L1470 330 L1540 330 L1540 310 L1600 310 L1600 400 Z" fill="#1a0f2e" stroke="#0d0b14" strokeWidth="5" strokeLinejoin="round" />
          <path d="M0 400 L1600 400 L1600 352 L0 352 Z" fill="#0d0a1c" />
          <g fill="#ffb64a" opacity="0.85">
            {Array.from({ length: 40 }, (_, i) => <rect key={i} x={70 + ((i * 137) % 1480)} y={262 + ((i * 53) % 60)} width="6" height="8" />)}
          </g>
        </svg>
      </div>
      <motion.div className="off-plane" style={{ x: planeX, y: planeY }}>
        <Chroma amount={dof} render={(m) => <Plane id={m ? `op-${m.slice(1)}` : "op"} mono={m} accent="#2a1a4d" />} />
      </motion.div>
      <div className="off-copy">
        <span className="off-k">Off the clock</span>
        {LINES.map((l, k) => (
          <OffLine key={l} text={l} k={k} p={p} />
        ))}
      </div>
    </motion.div>
  );
}

function OffLine({ text, k, p }: { text: string; k: number; p: MotionValue<number> }) {
  const at = 0.12 + k * 0.16;
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
