"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Spot, Painted } from "./world";
import { SEG, useSeg } from "./timeline";
import { Cmyk } from "./ui";

/* Segment 0: cold open. Black. One sodium light swings on, the name is
   tagged on the wall under it, the camera pushes in. */
export function S0Cold({ t }: { t: MotionValue<number> }) {
  const { opacity, p } = useSeg(t, SEG.cold, 0.006);
  const lightOn = useTransform(p, [0.05, 0.12, 0.14, 0.2, 0.22, 0.3], [0, 1, 0.2, 1, 0.6, 1]);
  const lightStep = useTransform(lightOn, (v) => Math.round(v * 4) / 4);
  const scale = useTransform(p, [0, 1], [1, 1.18]);
  const tagOp = useTransform(p, [0.28, 0.34], [0, 1]);
  const tagStep = useTransform(tagOp, (v) => Math.round(v * 3) / 3);
  const kick = useTransform(p, [0.6, 0.7], [0, 1]);
  return (
    <motion.div className="seg seg-cold" style={{ opacity }}>
      <motion.div className="cold-world" style={{ scale }}>
        <motion.div style={{ opacity: lightStep }}>
          <Spot className="cold-spot" tone="warm" />
        </motion.div>
        <div className="cold-wall" aria-hidden="true" />
        <motion.div className="cold-tag" style={{ opacity: tagStep }}>
          <Painted className="cold-paint"><Cmyk as="h1" text="AMMAR ADAM" className="cold-name" /></Painted>
          <motion.span className="cold-issue" style={{ opacity: kick }}>Issue #20 · Waterloo · 2026</motion.span>
        </motion.div>
        <div className="cold-floor" aria-hidden="true" />
      </motion.div>
    </motion.div>
  );
}
