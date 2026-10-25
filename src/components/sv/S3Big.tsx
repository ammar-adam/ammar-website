"use client";

import { motion, useMotionTemplate, useTransform, type MotionValue } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { SEG, useSeg } from "./timeline";
import { Painted } from "./world";
import { SegRoot } from "./SegRoot";

/* Segment 3: the hall goes black. One spotlight with falloff and a floor pool;
   only what the cone touches is visible (a masked black overlay follows it).
   Inside the cone the company name stands on the floor as painted type with a
   framed print. The swing is three 8 fps steps with one smear frame. */
export function S3Big({ t }: { t: MotionValue<number> }) {
  const seg = useSeg(t, SEG.big);
  const { p } = seg;
  const openai = arrivals.find((a) => a.slug === "openai")!;
  const pear = arrivals.find((a) => a.slug === "pear-vc")!;

  // spot centre in % of stage width: hold left, three stepped frames, settle right
  const sx = useTransform(p, (v) => {
    if (v < 0.48) return 32;
    if (v < 0.5) return 44;
    if (v < 0.52) return 62;
    if (v < 0.54) return 71;
    return 68;
  });
  const sxPct = useTransform(sx, (v) => `${v}%`);
  const smear = useTransform(p, (v) => (v >= 0.5 && v < 0.54 ? 1.7 : 1));
  const smearOp = useTransform(p, (v) => (v >= 0.5 && v < 0.54 ? 0.5 : 1));
  const spotOn = useTransform(p, [0.02, 0.06, 0.08, 0.12], [0, 1, 0.3, 1]);
  const spotStep = useTransform(spotOn, (v) => Math.round(v * 4) / 4);
  const mask = useMotionTemplate`radial-gradient(ellipse 26vw 40vh at ${sxPct} 55%, transparent 60%, #000 100%)`;
  const maskOp = useTransform(spotStep, (v) => 0.85 * v + (1 - v) * 0.98);

  const c1 = useTransform(p, [0.06, 0.1, 0.49, 0.5], [0, 1, 1, 0]);
  const c2 = useTransform(p, [0.53, 0.56], [0, 1]);
  const slam = useTransform(p, [0.53, 0.56], [1.25, 1]);
  const slamStep = useTransform(slam, (v) => Math.round(v * 6) / 6);
  const dust = useTransform(p, [0, 1], [0, -80]);

  return (
    <SegRoot seg={seg} className="seg-big">
      <div className="dark-hall" aria-hidden="true" />
      <motion.div className="spot-rig" style={{ left: sxPct, scaleX: smear, opacity: smearOp }}>
        <motion.div className="cone" style={{ opacity: spotStep }} aria-hidden="true">
          <motion.div className="dust" style={{ y: dust }} />
        </motion.div>
        <motion.div className="pool" style={{ opacity: spotStep }} aria-hidden="true" />
      </motion.div>

      <div className="lit-stage">
        <motion.div className="lit lit-left" style={{ opacity: c1 }}>
          <figure className="print print-l">
            <img src={openai.image} alt="OpenAI DevDay with the Builder Lead cohort" width={420} height={260} decoding="async" />
          </figure>
          <Painted className="floor-type">
            <a href={openai.fromUrl} target="_blank" rel="noreferrer">OPENAI</a>
          </Painted>
          <p className="floor-line">{openai.detailTitle}. {openai.impact} {openai.details}</p>
        </motion.div>
        <motion.div className="lit lit-right" style={{ opacity: c2, scale: slamStep }}>
          <figure className="print print-r">
            <img src={pear.image} alt="Pear VC fellows" width={420} height={260} decoding="async" />
          </figure>
          <Painted className="floor-type">
            <a href={pear.fromUrl} target="_blank" rel="noreferrer">PEAR VC</a>
          </Painted>
          <p className="floor-line">{pear.detailTitle}. {pear.impact} {pear.details}</p>
        </motion.div>
      </div>

      <motion.div className="dark-mask" style={{ maskImage: mask, WebkitMaskImage: mask, opacity: maskOp }} aria-hidden="true" />
    </SegRoot>
  );
}
