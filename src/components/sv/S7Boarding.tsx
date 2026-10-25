"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { siteConfig } from "@/data/site";
import { Hand, Plane, PlaneClimb } from "./art";
import { SEG, useSeg, useVW } from "./timeline";
import { Bang, Cmyk } from "./ui";
import { Painted } from "./world";
import { SegRoot } from "./SegRoot";

const RESUME = "/Ammar_Adam.pdf";

/* Segment 7: boarding. The pass is an object in a hand, lit by the gate
   screen; contacts are printed in the stub. Scanning is a real link (the PDF
   opens in a new tab on the click itself, inside the activation window) and
   the takeoff plays here: hard cut to the runway, the nose-up pose climbs
   bottom-left to top-right at 12 fps with outline echoes on the two fastest
   steps, then SEE YOU OUT THERE lights up on the sky. */
export function S7Boarding({ t }: { t: MotionValue<number> }) {
  const seg = useSeg(t, SEG.boarding);
  const { p } = seg;
  const vw = useVW();
  const mobile = vw < 720;
  const [phase, setPhase] = useState<"idle" | "scan" | "takeoff" | "done">("idle");
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const scan = () => {
    if (phase === "scan" || phase === "takeoff") return;
    setPhase("scan");
    timers.current.push(window.setTimeout(() => setPhase("takeoff"), 450));
    timers.current.push(window.setTimeout(() => setPhase("done"), 2600));
  };

  const passX = useTransform(p, [0.3, 0.6], ["0%", mobile ? "0%" : "-30%"]);
  const passS = useTransform(p, [0, 0.3, 0.6], [0.96, 1, mobile ? 0.82 : 0.86]);
  const skyOp = useTransform(p, [0.46, 0.56], [0, 1]);
  const skyStep = useTransform(skyOp, (v) => Math.round(v * 3) / 3);

  const s = siteConfig.socialLinks;
  const contacts = [
    { label: "Email", href: s.email, text: "ammar.adam@uwaterloo.ca" },
    { label: "LinkedIn", href: s.linkedin, text: "in/ammar-adam" },
    { label: "GitHub", href: s.github, text: "ammar-adam" },
    { label: "X", href: s.x, text: "@ammaradam_5807" },
    { label: "Webring", href: "https://uwaterloo.network", text: "uwaterloo.network" },
    { label: "Resume", href: RESUME, text: "Ammar_Adam.pdf" },
  ];

  return (
    <SegRoot seg={seg} className={`seg-boarding ph-${phase}`}>
      <div className="runway-lights" aria-hidden="true" />
      <div className="glass glass-boarding" aria-hidden="true" />
      <div className="gate-screen-light" aria-hidden="true" />

      <motion.div className="pass-wrap" style={{ x: passX, scale: passS }}>
        <div className="pass-tilt">
          <div className="pass">
            <div className="pass-main">
              <div className="pass-head"><span className="pass-air">AFA AIR</span><span className="pass-k">Boarding pass</span></div>
              <div className="pass-route">
                <div><span className="pass-k">From</span><span className="pass-code">YKF</span><span className="pass-v">Waterloo</span></div>
                <Plane className="pass-plane" id="pp" />
                <div className="pass-to"><span className="pass-k">To</span><span className="pass-code">???</span><span className="pass-v">Wherever&apos;s next</span></div>
              </div>
              <dl className="pass-grid">
                <div><dt>Passenger</dt><dd>ADAM / AMMAR</dd></div>
                <div><dt>Flight</dt><dd>AA 2026</dd></div>
                <div><dt>Seat</dt><dd>2A</dd></div>
                <div><dt>Class</dt><dd>CS &amp; Finance</dd></div>
                <div><dt>Status</dt><dd>2nd year</dd></div>
                <div><dt>Bags</dt><dd>7 roles · 4 projects</dd></div>
              </dl>
              <a className="scan-btn" href={RESUME} target="_blank" rel="noreferrer" onClick={scan} aria-label="Scan boarding pass: opens the resume PDF in a new tab">
                <span className="barcode" aria-hidden="true" />
                <span className="scan-laser" aria-hidden="true" />
                <span className="scan-label">{phase === "idle" ? "Scan to open resume" : phase === "done" ? "Scan again" : "Scanning..."}</span>
              </a>
            </div>
            <div className="pass-stub">
              <span className="pass-air">AFA AIR</span>
              <span className="stub-seat">2A</span>
              <dl className="stub-fields">
                {contacts.map((c) => (
                  <div key={c.label}>
                    <dt>{c.label}</dt>
                    <dd><a href={c.href} target={c.href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer">{c.text}</a></dd>
                  </div>
                ))}
              </dl>
            </div>
            <span className="pass-crease" aria-hidden="true" />
          </div>
        </div>
        <Hand className="hand" />
      </motion.div>

      <motion.div className="sky-type" style={{ opacity: skyStep }}>
        <Painted className="sky-painted"><Cmyk as="h2" text="SEE YOU OUT THERE." className="sky-h2" /></Painted>
      </motion.div>

      <div className="takeoff" aria-hidden="true">
        <div className="takeoff-sky" />
        <div className="takeoff-runway" />
        <div className="takeoff-lights" />
        <span className="to-echo to-c"><PlaneClimb id="toc" mono="#19d9ff" outline /></span>
        <span className="to-echo to-m"><PlaneClimb id="tom" mono="#ff2e88" outline /></span>
        <PlaneClimb className="takeoff-plane" id="to0" />
        <Painted className="takeoff-type"><Cmyk as="span" text="SEE YOU OUT THERE." className="sky-h2" /></Painted>
        <Bang text="BEEP" className="beep" rotate={-8} size={60} color="#0d0b14" burst="#5de9ff" />
      </div>
    </SegRoot>
  );
}
