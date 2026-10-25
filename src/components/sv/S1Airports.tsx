"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { GateSign, Kid, Plane, Terminal } from "./art";
import { Apron, Sky, Stars, Painted } from "./world";
import { SEG, useSeg, useStepped, useVW } from "./timeline";
import { Chroma, BangAt } from "./ui";

const CITIES = ["TORONTO", "DUBAI", "KARACHI"];

/* Segment 1: night ramp. The camera dollies right along the apron; the
   terminal (far, soft) slides slower than the signs (near, sharp). A plane
   rolls past on stepped frames with echo copies. Three gates light up. */
export function S1Airports({ t }: { t: MotionValue<number> }) {
  const { opacity, p } = useSeg(t, SEG.airports);
  const vw = useVW();

  // camera
  const camX = useTransform(p, [0, 1], [0, -vw * 0.55]);
  const farX = useTransform(p, [0, 1], [0, -vw * 0.18]);
  const nearX = useTransform(p, [0, 1], [0, -vw * 0.9]);
  const zoom = useTransform(p, [0, 0.5, 1], [1.04, 1, 1.02]);

  // depth of field: far layer soft at first, sharpens when the camera settles on the gates
  const farDof = useTransform(p, [0, 0.5, 1], [7, 4, 6]);
  const nearDof = useTransform(p, [0, 0.4, 1], [6, 2, 8]);

  // plane rolls past (stepped 12fps feel)
  const planeRaw = useTransform(p, [0.05, 0.75], [vw * 1.1, -vw * 0.9]);
  const planeX = useStepped(planeRaw, 22);
  const bob = useTransform(p, (v) => (Math.floor(v * 90) % 3) * 2 - 2);

  // gates light up one by one
  const g0 = useTransform(p, [0.3, 0.34], [0, 1]);
  const g1 = useTransform(p, [0.44, 0.48], [0, 1]);
  const g2 = useTransform(p, [0.58, 0.62], [0, 1]);
  const gates = [g0, g1, g2];

  // kid walks in late, stepped
  const kidRaw = useTransform(p, [0.55, 1], [-260, vw * 0.25]);
  const kidX = useStepped(kidRaw, 18);
  const kidOp = useTransform(p, [0.5, 0.56], [0, 1]);

  // departures board lettering (in-world type) changes city
  const cityIdx = useTransform(p, (v) => Math.min(2, Math.max(0, Math.floor((v - 0.28) / 0.16))));
  const cityOp = useTransform(p, [0.26, 0.3], [0, 1]);

  return (
    <motion.div className="seg seg-airports" style={{ opacity }}>
      <Sky p={p} from="night" to="night" />
      <Stars />
      <motion.div className="world" style={{ scale: zoom }}>
        <motion.div className="layer far" style={{ x: farX }}>
          <Chroma amount={farDof} className="terminal-wrap" render={(m) => <Terminal mono={m} />} />
          <div className="far-glow" aria-hidden="true" />
        </motion.div>

        <motion.div className="layer mid" style={{ x: camX }}>
          <Apron tone="night" />
          <motion.div className="board-world" style={{ opacity: cityOp }}>
            <span className="bw-k">Departures · now serving</span>
            <CityWord idx={cityIdx} />
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
          <motion.div className="roll-plane" style={{ x: planeX, y: bob }}>
            <span className="echo e2" aria-hidden="true"><Plane id="rp2" mono="#2a1f5a" /></span>
            <span className="echo e1" aria-hidden="true"><Plane id="rp1" mono="#3b2d7a" /></span>
            <Plane id="rp" className="roll-plane-svg" />
            <div className="roll-reflect" aria-hidden="true"><Plane id="rpr" mono="#1a1d4a" /></div>
          </motion.div>
          <motion.div className="kid-walk" style={{ x: kidX, opacity: kidOp }}>
            <span className="echo e1" aria-hidden="true"><Kid mono="#2a1f5a" /></span>
            <Kid className="kid-svg" />
          </motion.div>
        </motion.div>

        <motion.div className="layer near" style={{ x: nearX }}>
          <Painted className="apron-tag">AMMAR ADAM</Painted>
          <Chroma amount={nearDof} className="near-curb" render={(m) => <div className="curb" style={m ? { borderTopColor: m, background: "transparent" } : undefined} />} />
        </motion.div>
      </motion.div>
      <BangAt t={t} at={0.148} hold={0.03} text="RRRMMMM" size={54} rotate={-6} color="#fff6ea" burst="#ff2e88" className="bang-roll" />
    </motion.div>
  );
}

function CityWord({ idx }: { idx: MotionValue<number> }) {
  const [ci, setCi] = useState(0);
  useMotionValueEvent(idx, "change", (v) => setCi(v));
  const word = CITIES[ci];
  return (
    <span className="bw-city" key={word}>
      {word.split("").map((ch, k) => (
        <span key={`${word}-${k}`} className="bw-ch" style={{ ["--i" as string]: k }}>{ch}</span>
      ))}
    </span>
  );
}
