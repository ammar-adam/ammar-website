"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { boardingPassConfig } from "@/data/boardingPass";
import { siteConfig } from "@/data/site";
import { Sign } from "./Sign";

const ease = [0.22, 1, 0.36, 1] as const;

/** Deterministic bar widths so the barcode never shifts between renders. */
const bars = Array.from("AMMARADAMYYZDXBKHICSFIN2A").flatMap((ch, i) => {
  const c = ch.charCodeAt(0) + i * 7;
  return [1 + (c % 3), 1 + ((c >> 2) % 2), 1 + ((c >> 1) % 4), 1 + ((c >> 3) % 2)];
});

const contacts = [
  { label: "Email", value: "ammar.adam@uwaterloo.ca", href: siteConfig.socialLinks.email },
  { label: "LinkedIn", value: "in/ammar-adam", href: siteConfig.socialLinks.linkedin },
  { label: "GitHub", value: "ammar-adam", href: siteConfig.socialLinks.github },
  { label: "X", value: "@ammaradam_5807", href: siteConfig.socialLinks.x },
];

export function Boarding() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: true });

  return (
    <section id="boarding" className="stop stop-last">
      <Sign
        as="header"
        items={[{ href: "#boarding", label: "Boarding", sub: "Say hello", arrow: "→" }]}
        aside={<span>Last call</span>}
      />

      <div className="pass-stage" ref={ref}>
        <motion.div
          className="pass"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease }}
        >
          <div className="pass-main">
            <div className="pass-top">
              <span>AFA International</span>
              <span>Boarding pass</span>
            </div>
            <div className="pass-route">
              <div>
                <small>From</small>
                <b>YYZ</b>
                <span>Toronto</span>
              </div>
              <div className="pass-path" aria-hidden>
                <motion.i
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : {}}
                  transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.4 }}
                />
              </div>
              <div className="to">
                <small>To</small>
                <b>TBD</b>
                <span>What&apos;s next</span>
              </div>
            </div>
            <dl className="pass-fields">
              <div><dt>Passenger</dt><dd>{boardingPassConfig.displayName}</dd></div>
              <div><dt>Class</dt><dd>CS &amp; Finance</dd></div>
              <div><dt>Seat</dt><dd>2A</dd></div>
              <div><dt>Gate</dt><dd>Waterloo</dd></div>
            </dl>
            <a className="barcode" href={boardingPassConfig.resumeFileUrl} target="_blank" rel="noreferrer">
              <span className="bars" aria-hidden>
                {bars.map((w, i) => <i key={i} style={{ width: w, marginRight: i % 2 ? 2 : 1 }} />)}
                <span className="laser" />
              </span>
              <span className="barcode-cta">Scan for resume ↗</span>
            </a>
          </div>

          <motion.div
            className="pass-stub"
            initial={{ x: 0 }}
            animate={inView ? { x: 12, rotate: 1.4, y: 4 } : {}}
            transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.9 }}
          >
            <span className="stub-title">Reach me</span>
            {contacts.map((c) => (
              <a key={c.label} href={c.href} target={c.href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer">
                <small>{c.label}</small>
                {c.value}
              </a>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <footer className="foot">
        <span>Thanks for flying with me.</span>
        <a href="https://uwaterloo.network" target="_blank" rel="noreferrer" className="webring">
          <img src="https://uwaterloo.network/icon.svg" alt="" width={16} height={16} />
          uwaterloo.network
        </a>
        <span>Toronto · Dubai · Karachi</span>
      </footer>
    </section>
  );
}
