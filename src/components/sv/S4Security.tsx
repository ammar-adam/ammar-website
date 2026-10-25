"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { projects, type Project } from "@/data/departures";
import { Tub, XrayBag } from "./art";
import { SEG, useHoldDolly, useHoldIndex, useSeg, useVW } from "./timeline";
import { LinkPill, BangAt } from "./ui";
import { SegRoot } from "./SegRoot";

const DEVICE: Record<string, "laptop" | "phone"> = {
  rocketship: "laptop",
  canadaclip: "phone",
  "risk-optimized-equity-system": "laptop",
  backseat: "phone",
};
const LIGHT = new Set(["canadaclip", "risk-optimized-equity-system"]);
const shot = (p: Project) => (p.slug === "canadaclip" ? "https://img.youtube.com/vi/JzYwfPrcPtM/maxresdefault.jpg" : p.screenshot);

/* Segment 4: the security lane. The X-ray screen shows a real bag (laptop,
   phone, folder, car key) as the scan line passes; then grey tubs roll along
   the belt, each holding the project on a device, while the officer's CRT on
   the right prints the readout for whichever tub the camera is parked on. */
export function S4Security({ t }: { t: MotionValue<number> }) {
  const seg = useSeg(t, SEG.security);
  const { p } = seg;
  const vw = useVW();
  const mobile = vw < 720;
  const W = mobile ? vw * 0.86 : Math.min(520, vw * 0.4);
  const GAP = mobile ? vw * 0.1 : 90;
  const laneCenter = mobile ? vw / 2 : vw * 0.34;
  const stops = projects.map((_, k) => laneCenter - (k * (W + GAP) + W / 2));
  const x = useHoldDolly(p, stops, 0.34, 0.99, 0.6, vw + W);
  const xStep = useTransform(x, (v) => Math.round(v / 6) * 6);
  const hold = useHoldIndex(p, projects.length, 0.34, 0.99);

  const scan = useTransform(p, [0.02, 0.26], ["-3%", "103%"]);
  const scanIdx = useTransform(p, (v) => Math.max(0, Math.min(4, Math.floor((v - 0.04) / 0.055) + 1)));
  const [shown, setShown] = useState(0);
  useMotionValueEvent(scanIdx, "change", (v) => setShown(v));
  const screenOp = useTransform(p, [0, 0.03, 0.3, 0.36], [0, 1, 1, 0.35]);
  const screenY = useTransform(p, [0.28, 0.36], [0, -30]);
  const screenScale = useTransform(p, [0.28, 0.36], [1, 0.74]);
  const rollers = useTransform(p, [0, 1], [0, -600]);
  const rollStep = useTransform(rollers, (v) => Math.round(v / 14) * 14);
  const crtOp = useTransform(p, [0.3, 0.36], [0, 1]);

  return (
    <SegRoot seg={seg} className="seg-security">
      <div className="lane-bg" aria-hidden="true" />
      <div className="lane-light" aria-hidden="true" />
      <div className="lane-floor" aria-hidden="true" />

      <motion.div className="xray" style={{ opacity: screenOp, y: screenY, scale: screenScale }}>
        <div className="xray-housing" aria-hidden="true"><span>X-RAY · LANE 02</span></div>
        <div className="xray-screen">
          <motion.div className="xray-scan" style={{ left: scan }} aria-hidden="true" />
          <XrayBag className="xray-bag" shown={shown} />
          <div className="xray-hud"><span>LANE 02</span><span>{Math.min(shown, 4)} / 4 ITEMS</span><span className="blink">● REC</span></div>
        </div>
      </motion.div>

      <div className="belt" aria-hidden="true">
        <motion.div className="belt-rollers" style={{ x: rollStep }} />
      </div>
      <motion.div className="tray-row" style={{ x: xStep, ["--w" as string]: `${W}px`, ["--gap" as string]: `${GAP}px` }}>
        {projects.map((pr, k) => (
          <TrayItem key={pr.slug} pr={pr} k={k} />
        ))}
      </motion.div>

      <motion.aside className="crt" style={{ opacity: crtOp }} aria-live="polite">
        <div className="crt-bezel">
          <div className="crt-screen" key={hold}>
            <span className="crt-k">ITEM {hold + 1} / 4 · {projects[hold].flightCode} · CLEARED</span>
            <h3 className="crt-name">{projects[hold].name}</h3>
            <p className="crt-route">{projects[hold].routeName}</p>
            <p className="crt-line">{projects[hold].shortDesc}</p>
            <div className="pills">
              {projects[hold].seats[0].links?.map((l) => <LinkPill key={l.url} href={l.url} className="pill-crt">{l.label}</LinkPill>)}
            </div>
            <span className="crt-cursor" aria-hidden="true" />
          </div>
        </div>
        <div className="crt-foot" aria-hidden="true" />
      </motion.aside>

      <BangAt t={t} at={0.513} hold={0.022} text="BZZZT" size={40} rotate={-6} color="#0d0b14" burst="#5de9ff" className="bang-xray sfx" />
      <BangAt t={t} at={0.558} hold={0.02} text="KA-CHUNK" size={38} rotate={-7} color="#fff6ea" burst="#ff2e88" className="bang-tray sfx-keep" />
    </SegRoot>
  );
}

function TrayItem({ pr, k }: { pr: Project; k: number }) {
  const dev = DEVICE[pr.slug];
  return (
    <div className="tray">
      <div className={`device device-${dev} ${LIGHT.has(pr.slug) ? "device-light" : ""}`}>
        <div className="device-screen">
          <img src={shot(pr)} alt={`${pr.name} screenshot`} width={640} height={400} decoding="async" loading="lazy" />
          <span className="device-glow" aria-hidden="true" />
        </div>
        {dev === "laptop" && <span className="device-base" aria-hidden="true" />}
        {dev === "phone" && <span className="device-notch" aria-hidden="true" />}
      </div>
      <Tub className="tub" />
      <span className="tray-no" aria-hidden="true">{k + 1}</span>
    </div>
  );
}
