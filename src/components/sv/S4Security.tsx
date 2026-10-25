"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { projects } from "@/data/departures";
import { arrivals } from "@/data/arrivals";
import { Tub, XrayBag } from "./art";
import { SEG, useHoldDolly, useHoldIndex, useSeg, useVW } from "./timeline";
import { LinkPill } from "./ui";
import { SegRoot } from "./SegRoot";

interface Item {
  id: string;
  name: string;
  line: string;
  sub?: string;
  image?: string;
  device: "phone" | "laptop" | "photo" | "none";
  links: { label: string; url: string }[];
}

function items(): Item[] {
  const backseat = projects.find((p) => p.slug === "backseat")!;
  const rocket = projects.find((p) => p.slug === "rocketship")!;
  const htn = arrivals.find((a) => a.slug === "hack-the-north")!;
  return [
    { id: "backseat", name: backseat.name, sub: backseat.routeName, line: backseat.shortDesc, image: backseat.screenshot, device: "phone", links: backseat.seats[0].links ?? [] },
    { id: "rocketship", name: rocket.name, sub: rocket.routeName, line: rocket.shortDesc, image: rocket.screenshot, device: "laptop", links: rocket.seats[0].links ?? [] },
    { id: "htn", name: "Hack the North / Tech Week", line: "Seventy events in a week, and the application rubric for the biggest hackathon in Canada.", image: "/ABOUT22.jpg", device: "photo", links: htn.links ?? [] },
    // the owner gave no detail for TCF yet; one short line, flagged in the report
    { id: "tcf", name: "TCF Waterloo", line: "President of the TCF chapter at Waterloo.", device: "none", links: [] },
  ];
}

/* Segment 4: the bag. The X-ray shows four objects as the scan line passes
   (car key, laptop, lanyard, folder), then the tubs roll along the belt and
   the camera parks on each while the officer's monitor prints the readout. */
export function S4Security({ t }: { t: MotionValue<number> }) {
  const seg = useSeg(t, SEG.security);
  const { p } = seg;
  const vw = useVW();
  const mobile = vw < 720;
  const list = items();
  const W = mobile ? vw * 0.86 : Math.min(500, vw * 0.38);
  const GAP = mobile ? vw * 0.1 : 90;
  const laneCenter = mobile ? vw / 2 : vw * 0.34;
  const stops = list.map((_, k) => laneCenter - (k * (W + GAP) + W / 2));
  const x = useHoldDolly(p, stops, 0.3, 0.82, 0.62, vw + W);
  const xStep = useTransform(x, (v) => Math.round(v / 6) * 6);
  const hold = useHoldIndex(p, list.length, 0.3, 0.82);
  const cur = list[hold];

  const scan = useTransform(p, [0.02, 0.24], ["-3%", "103%"]);
  const scanIdx = useTransform(p, (v) => Math.max(0, Math.min(4, Math.floor((v - 0.04) / 0.05) + 1)));
  const [shown, setShown] = useState(0);
  useMotionValueEvent(scanIdx, "change", (v) => setShown(v));
  const screenOp = useTransform(p, [0, 0.03, 0.26, 0.32], [0, 1, 1, 0.35]);
  const screenY = useTransform(p, [0.24, 0.32], [0, -30]);
  const screenScale = useTransform(p, [0.24, 0.32], [1, 0.74]);
  const rollers = useTransform(p, [0, 1], [0, -600]);
  const rollStep = useTransform(rollers, (v) => Math.round(v / 14) * 14);
  const crtOp = useTransform(p, [0.26, 0.32, 0.84, 0.9], [0, 1, 1, 0]);
  const endOp = useTransform(p, [0.84, 0.9], [0, 1]);

  return (
    <SegRoot seg={seg} className="seg-security">
      <div className="lane-bg" aria-hidden="true" />
      <div className="lane-light" aria-hidden="true" />
      <div className="lane-floor" aria-hidden="true" />

      <motion.div className="xray" style={{ opacity: screenOp, y: screenY, scale: screenScale }}>
        <div className="xray-housing" aria-hidden="true"><span>X-RAY</span></div>
        <div className="xray-screen">
          <motion.div className="xray-scan" style={{ left: scan }} aria-hidden="true" />
          <XrayBag className="xray-bag" shown={shown} />
          <div className="xray-hud"><span>LANE</span><span>{shown >= 4 ? "ALL CLEAR" : "SCANNING"}</span><span className="blink">● REC</span></div>
        </div>
      </motion.div>

      <div className="belt" aria-hidden="true">
        <motion.div className="belt-rollers" style={{ x: rollStep }} />
      </div>
      <motion.div className="tray-row" style={{ x: xStep, ["--w" as string]: `${W}px`, ["--gap" as string]: `${GAP}px` }}>
        {list.map((it) => (
          <div className="tray" key={it.id}>
            {it.device !== "none" && (
              <div className={`device device-${it.device}`}>
                <div className="device-screen">
                  {it.image && <img src={it.image} alt={it.name} width={640} height={400} decoding="async" loading="lazy" />}
                </div>
                {it.device === "laptop" && <span className="device-base" aria-hidden="true" />}
                {it.device === "phone" && <span className="device-notch" aria-hidden="true" />}
              </div>
            )}
            {it.device === "none" && <div className="tray-folder" aria-hidden="true"><span /><span /><span /></div>}
            <Tub className="tub" />
          </div>
        ))}
      </motion.div>

      <motion.aside className="crt" style={{ opacity: crtOp }} aria-live="polite">
        <div className="crt-bezel">
          <div className="crt-screen" key={hold}>
            <span className="crt-k">ITEM · CLEARED</span>
            <h3 className="crt-name">{cur.name}</h3>
            {cur.sub && <p className="crt-route">{cur.sub}</p>}
            <p className="crt-line">{cur.line}</p>
            {cur.links.length > 0 && (
              <div className="pills">
                {cur.links.map((l) => <LinkPill key={l.url} href={l.url} className="pill-crt">{l.label}</LinkPill>)}
              </div>
            )}
            <span className="crt-cursor" aria-hidden="true" />
          </div>
        </div>
        <div className="crt-foot" aria-hidden="true" />
      </motion.aside>

      <motion.div className="lane-end" style={{ opacity: endOp }} aria-hidden="true" />
    </SegRoot>
  );
}
