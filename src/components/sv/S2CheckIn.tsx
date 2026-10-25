"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { arrivals, type Arrival } from "@/data/arrivals";
import { Counter } from "./art";
import { SEG, useHoldDolly, useSeg, useVW } from "./timeline";
import { LinkPill, BangAt } from "./ui";
import { SegRoot } from "./SegRoot";

const TAG: Record<string, string> = { Dubai: "DXB", Mississauga: "YYZ", Toronto: "YYZ", Waterloo: "YKF" };
const SHORT: Record<string, string> = { "hack-the-north": "Tech Week / HTN", "waterloo-venture": "Waterloo VG" };
const GROUPS = [["alpen-capital", "datastealth"], ["sagard", "waterloo-venture"], ["hack-the-north"]];
const LIT = [0.07, 0.18, 0.36, 0.48, 0.68];

/* Segment 2: the check-in hall. Three camera holds along a row of counters.
   Each counter is an object in the set: a backlit LED header, a lightbox
   poster on the back wall, role and line printed as vinyl on the counter's
   front face. Lamps come on as the camera arrives. */
export function S2CheckIn({ t }: { t: MotionValue<number> }) {
  const seg = useSeg(t, SEG.checkin);
  const { p } = seg;
  const vw = useVW();
  const mobile = vw < 720;
  const W = mobile ? vw * 0.86 : Math.min(400, vw * 0.3);
  const GAP = mobile ? vw * 0.07 : 36;
  const GGAP = mobile ? vw * 0.07 : 120;

  // layout: x of each desk, and the centre of each group
  const desks: { a: Arrival; x: number; k: number }[] = [];
  const centers: number[] = [];
  let x = 0;
  let k = 0;
  for (const g of GROUPS) {
    const start = x;
    for (const slug of g) {
      const a = arrivals.find((d) => d.slug === slug)!;
      desks.push({ a, x, k });
      k++;
      x += W + GAP;
    }
    x -= GAP;
    centers.push((start + x) / 2);
    x += GGAP;
  }
  const stops = mobile ? desks.map((d) => vw / 2 - (d.x + W / 2)) : centers.map((c) => vw / 2 - c);
  const camX = useHoldDolly(p, stops, 0.04, 0.98, 0.62);
  const ceilX = useTransform(camX, (v) => v * 0.3);
  const floorX = useTransform(camX, (v) => v * 0.7);

  return (
    <SegRoot seg={seg} className="seg-checkin">
      <div className="hall-shade" aria-hidden="true" />
      <motion.div className="hall-ceiling" style={{ x: ceilX }} aria-hidden="true" />
      <motion.div className="hall-floor" style={{ x: floorX }} aria-hidden="true" />
      <motion.div className="desk-row" style={{ x: camX, ["--w" as string]: `${W}px` }}>
        {desks.map((d) => (
          <Desk key={d.a.slug} a={d.a} k={d.k} x={d.x} p={p} />
        ))}
      </motion.div>
      <BangAt t={t} at={0.236} hold={0.02} text="BRRRT" size={40} rotate={8} color="#0d0b14" burst="#ffd36b" className="bang-tag sfx" />
    </SegRoot>
  );
}

function Desk({ a, k, x, p }: { a: Arrival; k: number; x: number; p: MotionValue<number> }) {
  const at = LIT[k];
  const lit = useTransform(p, [at - 0.02, at + 0.02], [0, 1]);
  const litStep = useTransform(lit, (v) => Math.round(v * 3) / 3);
  const tagY = useTransform(p, [at + 0.02, at + 0.06], [-36, 0]);
  const tagStep = useTransform(tagY, (v) => Math.round(v / 9) * 9);
  return (
    <motion.article className="desk" style={{ left: x, ["--lit" as string]: litStep }}>
      <motion.div className="desk-lamp" style={{ opacity: litStep }} aria-hidden="true" />
      <h3 className="led">
        <span className="led-glow" aria-hidden="true" />
        <a href={a.fromUrl} target="_blank" rel="noreferrer">
          <span className="led-no">{String(k + 1).padStart(2, "0")}</span> · {SHORT[a.slug] ?? a.from} · {TAG[a.origin] ?? a.origin.slice(0, 3).toUpperCase()}
        </a>
      </h3>
      <div className="poster">
        {a.image && <img src={a.image} alt="" width={480} height={270} decoding="async" />}
        <span className="poster-spill" aria-hidden="true" />
      </div>
      <div className="counter">
        <Counter className="counter-svg" />
        <motion.span className="tag" style={{ y: tagStep }}>{TAG[a.origin] ?? a.origin.slice(0, 3).toUpperCase()}</motion.span>
        <div className="vinyl">
          <p className="vinyl-role">{a.detailTitle ?? a.title}</p>
          <p className="vinyl-line">{a.impact}</p>
          {a.links && (
            <div className="pills">
              {a.links.map((l) => <LinkPill key={l.url} href={l.url} className="pill-vinyl">{l.label}</LinkPill>)}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
