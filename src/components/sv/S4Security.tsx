"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { projects, type Project } from "@/data/departures";
import { XrayIcon } from "./art";
import { SEG, useHoldDolly, useSeg, useVW } from "./timeline";
import { LinkPill, BangAt } from "./ui";

const ICON: Record<string, "rocket" | "leaf" | "pie" | "car"> = {
  rocketship: "rocket",
  canadaclip: "leaf",
  "risk-optimized-equity-system": "pie",
  backseat: "car",
};
const shot = (p: Project) => (p.slug === "canadaclip" ? "https://img.youtube.com/vi/JzYwfPrcPtM/maxresdefault.jpg" : p.screenshot);

/* Segment 4: the security lane, cold cyan light. The X-ray screen reveals the
   four projects as silhouettes, then the trays roll along the belt past the
   camera with KA-CHUNKs. */
export function S4Security({ t }: { t: MotionValue<number> }) {
  const { opacity, p } = useSeg(t, SEG.security);
  const vw = useVW();
  const W = Math.min(520, vw * 0.86);
  const GAP = Math.min(60, vw * 0.06);
  const total = projects.length * (W + GAP) - GAP;
  const pad = Math.max(24, (vw - W) / 2);
  const x = useHoldDolly(p, projects.length, 0.34, 0.99, 0.6, pad, -(total - vw + pad), vw - 40);
  const xStep = useTransform(x, (v) => Math.round(v / 6) * 6);
  const scan = useTransform(p, [0.02, 0.26], ["-4%", "104%"]);
  const screenOp = useTransform(p, [0, 0.03, 0.3, 0.36], [0, 1, 1, 0.25]);
  const screenY = useTransform(p, [0.26, 0.36], [0, -40]);
  const screenScale = useTransform(p, [0.26, 0.36], [1, 0.72]);
  const rollers = useTransform(p, [0, 1], [0, -600]);
  const rollStep = useTransform(rollers, (v) => Math.round(v / 14) * 14);

  return (
    <motion.div className="seg seg-security" style={{ opacity }}>
      <div className="lane-bg" aria-hidden="true" />
      <div className="lane-light" aria-hidden="true" />
      <motion.div className="xray" style={{ opacity: screenOp, y: screenY, scale: screenScale }}>
        <div className="xray-housing" aria-hidden="true"><span>X-RAY · LANE 02</span></div>
        <div className="xray-screen">
          <motion.div className="xray-scan" style={{ left: scan }} aria-hidden="true" />
          <div className="xray-bag">
            {projects.map((pr, k) => (
              <XrayItem key={pr.slug} pr={pr} k={k} p={p} />
            ))}
          </div>
          <div className="xray-hud"><span>LANE 02</span><span>4 ITEMS · ALL CLEAR</span><span className="blink">● REC</span></div>
        </div>
      </motion.div>
      <div className="belt" aria-hidden="true">
        <motion.div className="belt-rollers" style={{ x: rollStep }} />
      </div>
      <motion.div className="tray-row" style={{ x: xStep, ["--w" as string]: `${W}px`, ["--gap" as string]: `${GAP}px` }}>
        {projects.map((pr, k) => (
          <Tray key={pr.slug} pr={pr} k={k} />
        ))}
      </motion.div>
      <BangAt t={t} at={0.571} hold={0.025} text="BZZZT" size={44} rotate={-6} color="#0d0b14" burst="#5de9ff" className="bang-xray" />
      <BangAt t={t} at={0.616} hold={0.018} text="KA-CHUNK" size={44} rotate={-7} color="#fff6ea" burst="#ff2e88" className="bang-tray" />
      <BangAt t={t} at={0.643} hold={0.018} text="KA-CHUNK" size={44} rotate={6} color="#fff6ea" burst="#ea2a2f" className="bang-tray b" />
      <BangAt t={t} at={0.67} hold={0.018} text="KA-CHUNK" size={44} rotate={-5} color="#fff6ea" burst="#ff2e88" className="bang-tray" />
    </motion.div>
  );
}

function XrayItem({ pr, k, p }: { pr: Project; k: number; p: MotionValue<number> }) {
  const at = 0.05 + k * 0.055;
  const op = useTransform(p, [at, at + 0.02], [0, 1]);
  const step = useTransform(op, (v) => Math.round(v * 3) / 3);
  const sc = useTransform(op, [0, 0.5, 1], [0.6, 1.15, 1]);
  const scStep = useTransform(sc, (v) => Math.round(v * 6) / 6);
  return (
    <motion.div className="xray-item" style={{ opacity: step, scale: scStep }}>
      <XrayIcon kind={ICON[pr.slug]} />
      <span>{pr.name}</span>
    </motion.div>
  );
}

function Tray({ pr, k }: { pr: Project; k: number }) {
  return (
    <article className="tray">
      <div className="tray-shot">
        <img src={shot(pr)} alt={`${pr.name} screenshot`} width={640} height={400} decoding="async" loading="lazy" />
        <span className="tray-code">{pr.flightCode} · {pr.year}</span>
        <XrayIcon kind={ICON[pr.slug]} className="tray-ico" />
      </div>
      <div className="tray-body">
        <h3>{pr.name}</h3>
        <p className="tray-route">{pr.routeName}</p>
        <p className="tray-line">{pr.shortDesc}</p>
        <div className="pills">
          {pr.seats[0].links?.map((l) => <LinkPill key={l.url} href={l.url}>{l.label}</LinkPill>)}
        </div>
      </div>
      <span className="tray-no" aria-hidden="true">{k + 1}</span>
    </article>
  );
}
