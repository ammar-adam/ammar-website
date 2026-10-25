"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { arrivals, type Arrival } from "@/data/arrivals";
import { SEG, useHoldDolly, useSeg, useVW } from "./timeline";
import { LinkPill, BangAt } from "./ui";
import { Hatch } from "./world";

const TAG: Record<string, string> = { Dubai: "DXB", Mississauga: "YYZ", Toronto: "YYZ", Waterloo: "YKF" };
const EARLY = ["alpen-capital", "datastealth", "sagard", "waterloo-venture", "hack-the-north"];

/* Segment 2: the check-in hall. Warm sodium light, a long row of desks. The
   camera dollies along the hall and each desk's light comes on as we reach it. */
export function S2CheckIn({ t }: { t: MotionValue<number> }) {
  const { opacity, p } = useSeg(t, SEG.checkin);
  const vw = useVW();
  const desks = EARLY.map((s) => arrivals.find((a) => a.slug === s)!).filter(Boolean);
  const W = Math.min(430, vw * 0.84);
  const GAP = Math.min(56, vw * 0.06);
  const total = desks.length * (W + GAP) - GAP;
  const pad = Math.max(24, (vw - W) / 2);
  const x = useHoldDolly(p, desks.length, 0.04, 0.98, 0.62, pad, -(total - vw + pad));
  const ceilX = useTransform(p, [0, 1], [0, -vw * 0.3]);
  const floorX = useTransform(p, [0, 1], [0, -vw * 0.7]);

  return (
    <motion.div className="seg seg-checkin" style={{ opacity }}>
      <div className="hall-bg" aria-hidden="true" />
      <motion.div className="hall-ceiling" style={{ x: ceilX }} aria-hidden="true" />
      <motion.div className="hall-floor" style={{ x: floorX }} aria-hidden="true" />
      <motion.div className="desk-row" style={{ x, ["--w" as string]: `${W}px`, ["--gap" as string]: `${GAP}px` }}>
        {desks.map((a, k) => (
          <Desk key={a.slug} a={a} k={k} n={desks.length} p={p} />
        ))}
      </motion.div>
      <BangAt t={t} at={0.262} hold={0.02} text="BRRRT" size={40} rotate={8} color="#0d0b14" burst="#ffd36b" className="bang-tag" />
    </motion.div>
  );
}

function Desk({ a, k, n, p }: { a: Arrival; k: number; n: number; p: MotionValue<number> }) {
  // each desk lights up as the camera reaches it
  const at = 0.04 + (k * 0.94) / n;
  const lit = useTransform(p, [at - 0.02, at + 0.03], [0, 1]);
  const litStep = useTransform(lit, (v) => Math.round(v * 3) / 3);
  const tagY = useTransform(p, [at + 0.03, at + 0.07], [-40, 0]);
  const tagStep = useTransform(tagY, (v) => Math.round(v / 10) * 10);
  return (
    <motion.article className="desk" style={{ ["--lit" as string]: litStep }}>
      <motion.div className="desk-lamp" style={{ opacity: litStep }} aria-hidden="true" />
      <div className="desk-sign">
        <span className="desk-no">{String(k + 1).padStart(2, "0")}</span>
        <span className="desk-open">Check-in · {a.origin}</span>
      </div>
      <div className="desk-img">
        {a.image && <img src={a.image} alt="" width={480} height={300} decoding="async" />}
        <Hatch className="desk-hatch" />
        <motion.span className="tag" style={{ y: tagStep }}>{TAG[a.origin] ?? a.origin.slice(0, 3).toUpperCase()}</motion.span>
      </div>
      <div className="desk-body">
        <h3 className="desk-co"><a href={a.fromUrl} target="_blank" rel="noreferrer">{a.from}</a></h3>
        <p className="desk-role">{a.detailTitle ?? a.title}</p>
        <p className="desk-line">{a.impact}</p>
        {a.links && (
          <div className="pills">
            {a.links.map((l) => <LinkPill key={l.url} href={l.url}>{l.label}</LinkPill>)}
          </div>
        )}
      </div>
      <div className="desk-counter" aria-hidden="true" />
    </motion.article>
  );
}
