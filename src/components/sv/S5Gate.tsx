"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { loungeRoomContent } from "@/data/loungeRoom";
import { Plane } from "./art";
import { SEG, useSeg, useVW } from "./timeline";
import { Chroma } from "./ui";
import { Sky, Stars } from "./world";

const thumb = (src: string) => src.replace("/ABOUT", "/thumbs/ABOUT");
const PICK = [0, 1, 2, 5, 6, 8, 10, 11, 13, 15, 18, 19, 20, 21, 23, 24];

/* Segment 5: the gate. A glass wall at night, a plane parked at the jet
   bridge behind it (soft), and a filmstrip of photos stuck to the glass that
   the camera dollies along. */
export function S5Gate({ t }: { t: MotionValue<number> }) {
  const { opacity, p } = useSeg(t, SEG.gate);
  const vw = useVW();
  const items = PICK.map((i) => loungeRoomContent.photos.items[i]).filter(Boolean);
  const W = Math.min(300, vw * 0.62);
  const GAP = 22;
  const total = items.length * (W + GAP) - GAP;
  const x = useTransform(p, [0.08, 0.96], [vw * 0.6, -(total - vw * 0.4)]);
  const farX = useTransform(p, [0, 1], [0, -vw * 0.25]);
  const farDof = useTransform(p, [0, 1], [6, 5]);
  const wobble = useTransform(p, (v) => (Math.floor(v * 120) % 2) * 2);

  return (
    <motion.div className="seg seg-gate" style={{ opacity }}>
      <Sky p={p} from="night" to="dusk" />
      <Stars />
      <motion.div className="layer far gate-far" style={{ x: farX }}>
        <Chroma amount={farDof} className="gate-plane" render={(m) => <Plane id={m ? `gp-${m.slice(1)}` : "gp"} mono={m} />} />
        <div className="jetbridge" aria-hidden="true" />
        <div className="apron-glow" aria-hidden="true" />
      </motion.div>
      <div className="glass" aria-hidden="true" />
      <motion.div className="strip" style={{ x, ["--w" as string]: `${W}px`, ["--gap" as string]: `${GAP}px`, y: wobble }}>
        {items.map((ph, k) => (
          <figure className="still" key={ph.src} style={{ ["--tilt" as string]: `${((k * 7) % 5) - 2}deg` }}>
            <img src={thumb(ph.src)} alt={ph.caption} width={320} height={320} decoding="async" loading="lazy" />
            <figcaption>{ph.caption}</figcaption>
            <span className="still-tape" aria-hidden="true" />
          </figure>
        ))}
      </motion.div>
      <div className="gate-sign-world">
        <span>Gate B22</span>
        <span className="gsw-sub">Boarding · people and places</span>
      </div>
    </motion.div>
  );
}
