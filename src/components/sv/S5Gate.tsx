"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { loungeRoomContent } from "@/data/loungeRoom";
import { Plane } from "./art";
import { SEG, useSeg, useVW } from "./timeline";
import { SegRoot } from "./SegRoot";

const thumb = (src: string) => src.replace("/ABOUT", "/thumbs/ABOUT");
const PICK = [0, 1, 2, 5, 6, 8, 10, 11, 13, 15, 18, 19, 20, 21, 23, 24];
const sentence = (s: string) => s.replace(/\s+—\s+/g, ". ").replace(/^\w/, (c) => c.toUpperCase());

/* Segment 5: the gate. A concourse glass wall at night, a plane parked small
   and far on a jet bridge behind haze, and a row of backlit lightboxes along
   the glass that the camera dollies past, reflected in the polished floor. */
export function S5Gate({ t }: { t: MotionValue<number> }) {
  const seg = useSeg(t, SEG.gate);
  const { p } = seg;
  const vw = useVW();
  const items = PICK.map((i) => loungeRoomContent.photos.items[i]).filter(Boolean);
  const W = Math.min(300, vw * 0.62);
  const GAP = 26;
  const total = items.length * (W + GAP) - GAP;
  const x = useTransform(p, [0.06, 0.96], [vw * 0.6, -(total - vw * 0.4)]);
  const farX = useTransform(p, [0, 1], [0, -vw * 0.12]);

  return (
    <SegRoot seg={seg} className="seg-gate">
      <motion.div className="layer far gate-far" style={{ x: farX }}>
        <Plane className="gate-plane" id="gp" light="gate" />
        <div className="jetbridge" aria-hidden="true" />
      </motion.div>
      <div className="glass" aria-hidden="true" />
      <div className="gate-sign-world">
        <span>Gate B22</span>
        <span className="gsw-sub">Boarding · people and places</span>
      </div>
      <motion.div className="strip" style={{ x, ["--w" as string]: `${W}px`, ["--gap" as string]: `${GAP}px` }}>
        {items.map((ph) => (
          <figure className="lightbox" key={ph.src}>
            <img src={thumb(ph.src)} alt={ph.caption} width={320} height={320} decoding="async" loading="lazy" />
            <figcaption>{sentence(ph.caption)}</figcaption>
          </figure>
        ))}
      </motion.div>
      <motion.div className="strip strip-refl" style={{ x, ["--w" as string]: `${W}px`, ["--gap" as string]: `${GAP}px` }} aria-hidden="true">
        {items.map((ph) => (
          <figure className="lightbox" key={`r-${ph.src}`}>
            <img src={thumb(ph.src)} alt="" width={320} height={320} decoding="async" loading="lazy" />
            <figcaption>{sentence(ph.caption)}</figcaption>
          </figure>
        ))}
      </motion.div>
      <div className="gate-floor" aria-hidden="true" />
    </SegRoot>
  );
}
