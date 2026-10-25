"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { arrivals, type Arrival } from "@/data/arrivals";
import { SEG, useHoldDolly, useSeg, useVW } from "./timeline";
import { LinkPill } from "./ui";
import { SegRoot } from "./SegRoot";

const TAG: Record<string, string> = { Dubai: "DXB", Mississauga: "YYZ", Toronto: "YYZ", Waterloo: "YKF", "San Francisco": "SFO" };
/** four counters for now, two smaller ones further down the hall for how he got here */
const NOW = ["hack-the-north", "waterloo-venture", "openai", "sagard"];
const PAST = ["alpen-capital", "datastealth"];
const SHORT: Record<string, string> = { "hack-the-north": "Tech Week / Hack the North", "waterloo-venture": "Waterloo Venture Group" };

/* Segments 2 and 3: the check-in hall. Five camera holds: one per "now"
   counter, then one on the two smaller "before that" counters. Each counter
   is a surface in the set: LED header (company link), lightbox poster, the
   role and one line printed on the counter face. Lamps come on as the camera
   arrives; Sagard's a little lower. */
export function S2CheckIn({ t }: { t: MotionValue<number> }) {
  const seg = useSeg(t, SEG.checkin);
  const { p } = seg;
  const vw = useVW();
  const mobile = vw < 720;
  const W = mobile ? vw * 0.86 : Math.min(400, vw * 0.3);
  const SW = mobile ? vw * 0.7 : Math.min(300, vw * 0.22);
  const GAP = mobile ? vw * 0.07 : 48;

  const desks: { a: Arrival; x: number; k: number; w: number; small: boolean }[] = [];
  let x = 0;
  NOW.forEach((slug, k) => {
    desks.push({ a: arrivals.find((d) => d.slug === slug)!, x, k, w: W, small: false });
    x += W + GAP;
  });
  x += mobile ? 0 : 80;
  const pastStart = x;
  PAST.forEach((slug, i) => {
    desks.push({ a: arrivals.find((d) => d.slug === slug)!, x, k: NOW.length + i, w: SW, small: true });
    x += SW + GAP;
  });
  const pastCenter = (pastStart + x - GAP) / 2;
  const stops = mobile
    ? desks.map((d) => vw / 2 - (d.x + d.w / 2))
    : [...NOW.map((_, k) => vw / 2 - (k * (W + GAP) + W / 2)), vw / 2 - pastCenter];
  const camX = useHoldDolly(p, stops, 0.1, 1.0, 0.62);
  const ceilX = useTransform(camX, (v) => v * 0.3);
  const floorX = useTransform(camX, (v) => v * 0.7);

  return (
    <SegRoot seg={seg} className="seg-checkin">
      <div className="hall-shade" aria-hidden="true" />
      <motion.div className="hall-ceiling" style={{ x: ceilX }} aria-hidden="true" />
      <motion.div className="hall-floor" style={{ x: floorX }} aria-hidden="true" />
      <motion.div className="desk-row" style={{ x: camX }}>
        {desks.map((d) => (
          <Desk key={d.a.slug} a={d.a} k={d.k} x={d.x} w={d.w} small={d.small} p={p} mobile={mobile} />
        ))}
      </motion.div>
    </SegRoot>
  );
}

const LIT = [0.14, 0.32, 0.5, 0.68, 0.86, 0.9];
const LIT_LEVEL: Record<string, number> = { sagard: 0.7 };

function Desk({ a, k, x, w, small, p, mobile }: { a: Arrival; k: number; x: number; w: number; small: boolean; p: MotionValue<number>; mobile: boolean }) {
  const at = mobile ? 0.1 + (k * 0.9) / 6 + 0.04 : LIT[k];
  const level = LIT_LEVEL[a.slug] ?? 1;
  const lit = useTransform(p, [at - 0.02, at + 0.02], [0, level]);
  const litStep = useTransform(lit, (v) => Math.round(v * 3) / 3);
  const tagY = useTransform(p, [at + 0.02, at + 0.06], [-36, 0]);
  const tagStep = useTransform(tagY, (v) => Math.round(v / 9) * 9);
  return (
    <motion.article className={`desk ${small ? "desk-small" : ""}`} style={{ left: x, width: w, ["--lit" as string]: litStep }}>
      <motion.div className="desk-lamp" style={{ opacity: litStep }} aria-hidden="true" />
      <h3 className="led">
        <span className="led-glow" aria-hidden="true" />
        <a href={a.fromUrl} target="_blank" rel="noreferrer">{SHORT[a.slug] ?? a.from}</a>
      </h3>
      <div className="poster">
        {a.image && <img src={a.image} alt="" width={480} height={270} decoding="async" />}
        <span className="poster-spill" aria-hidden="true" />
      </div>
      <div className="counter">
        <motion.span className="tag" style={{ y: tagStep }}>{TAG[a.origin] ?? a.origin.slice(0, 3).toUpperCase()}</motion.span>
        <div className="vinyl">
          <p className="vinyl-role">{a.detailTitle ?? a.title}</p>
          {!small && <p className="vinyl-line">{a.impact}</p>}
          {!small && a.links && (
            <div className="pills">
              {a.links.map((l) => <LinkPill key={l.url} href={l.url} className="pill-vinyl">{l.label}</LinkPill>)}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
