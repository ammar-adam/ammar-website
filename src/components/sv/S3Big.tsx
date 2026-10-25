"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { Krackle } from "./art";
import { SEG, useSeg, useVW } from "./timeline";
import { Spot, Hatch } from "./world";

/* Segment 3: the hall goes dark. One spotlight. OpenAI, then Pear. A slow
   hang where only the light moves. */
export function S3Big({ t }: { t: MotionValue<number> }) {
  const { opacity, p } = useSeg(t, SEG.big);
  const openai = arrivals.find((a) => a.slug === "openai")!;
  const pear = arrivals.find((a) => a.slug === "pear-vc")!;
  const vw = useVW();
  const side = vw < 720 ? "0%" : "16%";
  const nside = vw < 720 ? "0%" : "-16%";

  const spotX = useTransform(p, [0, 0.45, 0.55, 1], ["-18%", "-18%", "18%", "18%"]);
  const spotOn = useTransform(p, [0.02, 0.08, 0.1, 0.14], [0, 1, 0.3, 1]);
  const spotStep = useTransform(spotOn, (v) => Math.round(v * 4) / 4);
  const c1 = useTransform(p, [0.08, 0.14, 0.46, 0.52], [0.002, 1, 1, 0.002]);
  const c2 = useTransform(p, [0.5, 0.56], [0.002, 1]);
  const c1y = useTransform(p, [0.08, 0.14], [40, 0]);
  const c2y = useTransform(p, [0.5, 0.56], [40, 0]);
  const c1s = useTransform(c1y, (v) => Math.round(v / 8) * 8);
  const c2s = useTransform(c2y, (v) => Math.round(v / 8) * 8);
  const dust = useTransform(p, [0, 1], [0, -60]);

  return (
    <motion.div className="seg seg-big" style={{ opacity }}>
      <div className="dark-hall" aria-hidden="true" />
      <motion.div className="spot-rig" style={{ x: spotX, opacity: spotStep }}>
        <Spot className="big-spot" tone="white" />
        <motion.div className="dust" style={{ y: dust }} aria-hidden="true" />
      </motion.div>
      <div className="big-stage">
        <motion.article className="big-card" style={{ opacity: c1, y: c1s, x: nside }}>
          <Krackle className="big-krackle" seed={2} color="#ff2e88" />
          <div className="big-img">
            <img src={openai.image} alt="" width={720} height={420} decoding="async" />
            <Hatch className="desk-hatch" />
          </div>
          <div className="big-body">
            <span className="big-k">Gate 1 of 5 · North America</span>
            <h3 className="big-co"><a href={openai.fromUrl} target="_blank" rel="noreferrer">{openai.from}</a></h3>
            <p className="big-role">{openai.detailTitle}</p>
            <p className="big-line">{openai.impact} {openai.details}</p>
          </div>
        </motion.article>
        <motion.article className="big-card" style={{ opacity: c2, y: c2s, x: side }}>
          <Krackle className="big-krackle" seed={4} color="#19d9ff" />
          <div className="big-img">
            <img src={pear.image} alt="" width={720} height={420} decoding="async" />
            <Hatch className="desk-hatch" />
          </div>
          <div className="big-body">
            <span className="big-k">Palo Alto · 50 of 650</span>
            <h3 className="big-co"><a href={pear.fromUrl} target="_blank" rel="noreferrer">{pear.from}</a></h3>
            <p className="big-role">{pear.detailTitle}</p>
            <p className="big-line">{pear.impact} {pear.details}</p>
          </div>
        </motion.article>
      </div>
    </motion.div>
  );
}
