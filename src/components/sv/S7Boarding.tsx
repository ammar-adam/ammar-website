"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { siteConfig } from "@/data/site";
import { SEG, useSeg, useVW } from "./timeline";
import { SegRoot } from "./SegRoot";

const RESUME = "/Ammar_Adam.pdf";

/* Segment 6: boarding. The pass lies on the gate counter at an angle with
   the stub torn; contact is printed in the stub. Scanning is a real link
   (the PDF opens on the click), and the takeoff plays here: the pass drops
   away, the runway plate pushes in and darkens (fx -> Film), and
   "See you out there." comes up on the sky. */
export function S7Boarding({ t, fx }: { t: MotionValue<number>; fx: MotionValue<number> }) {
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
    timers.current.push(window.setTimeout(() => { setPhase("takeoff"); fx.set(1); }, 450));
    timers.current.push(window.setTimeout(() => setPhase("done"), 2600));
  };

  const passX = useTransform(p, [0.3, 0.6], ["0%", mobile ? "0%" : "-26%"]);
  const passS = useTransform(p, [0, 0.3, 0.6], [0.96, 1, mobile ? 0.84 : 0.9]);
  const skyOp = useTransform(p, [0.5, 0.6], [0, 1]);
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
      <div className="glass glass-boarding" aria-hidden="true" />
      <div className="gate-counter" aria-hidden="true" />

      <motion.div className="pass-wrap" style={{ x: passX, scale: passS }}>
        <div className="pass-lie">
          <div className="pass">
            <div className="pass-main">
              <div className="pass-head"><span className="pass-air">AFA AIR</span><span className="pass-k">Boarding pass</span></div>
              <div className="pass-route">
                <div><span className="pass-k">From</span><span className="pass-code">YKF</span><span className="pass-v">Waterloo</span></div>
                <span className="pass-arrow" aria-hidden="true" />
                <div className="pass-to"><span className="pass-k">To</span><span className="pass-code">???</span><span className="pass-v">Wherever&apos;s next</span></div>
              </div>
              <dl className="pass-grid">
                <div><dt>Passenger</dt><dd>ADAM / AMMAR</dd></div>
                <div><dt>Flight</dt><dd>THE NEXT ONE</dd></div>
                <div><dt>Seat</dt><dd>Window</dd></div>
                <div><dt>Class</dt><dd>CS &amp; Finance</dd></div>
                <div><dt>Status</dt><dd>Boarding</dd></div>
                <div><dt>Bags</dt><dd>Carry-on only</dd></div>
              </dl>
              <a className="scan-btn" href={RESUME} target="_blank" rel="noreferrer" onClick={scan} aria-label="Scan boarding pass: opens the resume PDF in a new tab">
                <span className="barcode" aria-hidden="true" />
                <span className="scan-laser" aria-hidden="true" />
                <span className="scan-label">{phase === "idle" ? "Scan to open resume" : phase === "done" ? "Scan again" : "Scanning..."}</span>
              </a>
            </div>
            <div className="pass-stub">
              <span className="pass-air">AFA AIR</span>
              <span className="stub-seat">Window</span>
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
          <span className="pass-shadow" aria-hidden="true" />
        </div>
      </motion.div>

      <motion.div className="sky-type" style={{ opacity: skyStep }}>
        <h2 className="sky-h2">See you out there.</h2>
      </motion.div>

      <div className="takeoff" aria-hidden="true">
        <div className="takeoff-lights" />
        <h2 className="sky-h2 takeoff-type">See you out there.</h2>
      </div>
    </SegRoot>
  );
}
