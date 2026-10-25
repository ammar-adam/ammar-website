"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Spot, Painted } from "./world";
import { SEG, useSeg } from "./timeline";
import { Cmyk } from "./ui";
import { SegRoot } from "./SegRoot";

/* Segment 0: cold open. A void with a faint speckle. One sodium light flickers
   on (time-based, so no one lands on black), the name is tagged on the wall
   under it, the camera pushes in. */
export function S0Cold({ t }: { t: MotionValue<number> }) {
  const seg = useSeg(t, SEG.cold);
  const { p } = seg;
  const scale = useTransform(p, [0, 1], [1, 1.16]);
  const tagOp = useTransform(p, [0.0, 0.06], [0.34, 1]);
  const tagStep = useTransform(tagOp, (v) => Math.round(v * 3) / 3);
  return (
    <SegRoot seg={seg} className="seg-cold">
      <div className="void-speckle" aria-hidden="true" />
      <motion.div className="cold-world" style={{ scale }}>
        <div className="cold-light">
          <Spot className="cold-spot" tone="warm" />
        </div>
        <div className="cold-wall" aria-hidden="true" />
        <motion.div className="cold-tag" style={{ opacity: tagStep }}>
          <Painted className="cold-paint"><Cmyk as="h1" text="AMMAR ADAM" className="cold-name" /></Painted>
        </motion.div>
        <div className="cold-floor" aria-hidden="true" />
      </motion.div>
    </SegRoot>
  );
}
