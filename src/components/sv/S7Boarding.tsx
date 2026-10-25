"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { siteConfig } from "@/data/site";
import { Plane, SpeedLines, Krackle } from "./art";
import { SEG, useSeg, useVW } from "./timeline";
import { Bang, Cmyk } from "./ui";
import { Sky, Stars, Painted } from "./world";

const RESUME = "/Ammar_Adam.pdf";

/* Segment 7: boarding. Night glass, the pass in hand. Scan: laser, glitch,
   the plane climbs out through the night with echo copies, SEE YOU OUT THERE
   lights up on the sky, the resume opens. At rest the final frame shows the
   pass, the sky type and the contact links. */
export function S7Boarding({ t }: { t: MotionValue<number> }) {
  const { opacity, p } = useSeg(t, SEG.boarding, 0.008);
  const [phase, setPhase] = useState<"idle" | "scan" | "takeoff" | "done">("idle");
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const scan = () => {
    if (phase === "scan" || phase === "takeoff") return;
    setPhase("scan");
    timers.current.push(window.setTimeout(() => setPhase("takeoff"), 450));
    timers.current.push(window.setTimeout(() => { window.open(RESUME, "_blank", "noopener"); setPhase("done"); }, 2500));
  };

  const vw = useVW();
  const mobile = vw < 720;
  const passX = useTransform(p, [0.3, 0.6], ["0%", mobile ? "0%" : "-36%"]);
  const passS = useTransform(p, [0, 0.3, 0.6], [0.96, 1, mobile ? 0.8 : 0.84]);
  const skyOp = useTransform(p, [0.42, 0.52], [0, 1]);
  const skyStep = useTransform(skyOp, (v) => Math.round(v * 3) / 3);
  const linksOp = useTransform(p, [0.56, 0.66], [0, 1]);
  const linksY = useTransform(p, [0.56, 0.66], [30, 0]);

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
    <motion.div className={`seg seg-boarding ph-${phase}`} style={{ opacity }}>
      <Sky p={p} from="night" to="night" />
      <Stars />
      <div className="runway-far" aria-hidden="true" />
      <div className="glass glass-boarding" aria-hidden="true" />

      <motion.div className="pass-wrap" style={{ x: passX, scale: passS }}>
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
            <button type="button" className="scan-btn" onClick={scan} aria-label="Scan boarding pass to open resume (PDF)">
              <span className="barcode" aria-hidden="true" />
              <span className="scan-laser" aria-hidden="true" />
              <span className="scan-label">{phase === "idle" ? "Scan to open resume" : phase === "done" ? "Scan again" : "Scanning..."}</span>
            </button>
            <a className="pass-fallback" href={RESUME} target="_blank" rel="noreferrer">Or just open the PDF</a>
          </div>
          <div className="pass-stub">
            <span className="pass-air">AFA AIR</span>
            <span className="stub-seat">2A</span>
            <span className="stub-code">YKF → ???</span>
          </div>
        </div>
      </motion.div>

      <motion.div className="sky-type" style={{ opacity: skyStep }}>
        <Painted className="sky-painted"><Cmyk as="h2" text="SEE YOU OUT THERE." className="sky-h2" /></Painted>
        <motion.ul className="contacts" style={{ opacity: linksOp, y: linksY }}>
          {contacts.map((c) => (
            <li key={c.label}>
              <a href={c.href} target={c.href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer">
                <b>{c.label}</b><span>{c.text}</span>
              </a>
            </li>
          ))}
        </motion.ul>
      </motion.div>

      <div className="takeoff" aria-hidden="true">
        <div className="glitch-flash" />
        <SpeedLines className="takeoff-speed" n={9} color="#fff6ea" />
        <span className="takeoff-echo e3"><Plane id="to3" mono="#2a1f5a" /></span>
        <span className="takeoff-echo e2"><Plane id="to2" mono="#4a2c8a" /></span>
        <span className="takeoff-echo e1"><Plane id="to1" mono="#8a3fb8" /></span>
        <Plane className="takeoff-plane" id="to0" />
        <Krackle className="takeoff-krackle" seed={5} color="#fff6ea" />
        <Bang text="BOARDING!" className="takeoff-bang" rotate={-10} size={78} color="#fff6ea" burst="#ea2a2f" />
      </div>
    </motion.div>
  );
}
