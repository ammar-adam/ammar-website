"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { KidBack } from "./art";
import { SEG, useSeg } from "./timeline";
import { SegRoot } from "./SegRoot";

/* Segment 0: the hero. Night apron plate; the kid stands foreground, back to
   us, bag beside him, watching the plane. "AMMAR ADAM" is set into the plate
   by the shader (Film.tsx) so the building occludes its right end. His bag
   tag flaps in the wind; no scroll hint. */
export function S0Hero({ t }: { t: MotionValue<number> }) {
  const seg = useSeg(t, SEG.hero);
  const { p } = seg;
  const y = useTransform(p, [0, 1], [0, 14]);
  const ys = useTransform(y, (v) => Math.round(v / 3) * 3);
  const scale = useTransform(p, [0, 1], [1, 1.06]);
  return (
    <SegRoot seg={seg} className="seg-hero">
      <motion.div className="hero-kid" style={{ y: ys, scale }}>
        <span className="kid-shadow" aria-hidden="true" />
        <KidBack className="hero-kid-svg" rim="#ffb46a" />
      </motion.div>
    </SegRoot>
  );
}
