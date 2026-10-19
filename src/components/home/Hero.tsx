"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import { Fade, Lines } from "@/components/shell/Reveal";
import { Flap } from "./Flap";
import { ease, SOCIALS, STOPS, WindowSky } from "./shared";

/** Hall: name, the arched window, and a quiet departures strip as the way in. */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const live = useInView(stripRef, { once: true, amount: 0.3 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yRaw = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const y = useSpring(yRaw, { stiffness: 90, damping: 24, mass: 0.6 });

  return (
    <section id="hall" ref={ref} className="va-scene va-hall">
      <div className="wrap va-hero">
        <div className="va-hero-copy">
          <Fade className="kicker" delay={0.05} y={10}>AFA INTERNATIONAL · TERMINAL 1</Fade>
          <Lines as="h1" className="va-h1" delay={0.15}>{["Ammar", "Adam"]}</Lines>
          <Fade className="va-sub" delay={0.5}>
            <p>CS &amp; Finance at Waterloo. Building AI tools at Sagard, scouting student builders for OpenAI, shipping things on the side.</p>
          </Fade>
          <Fade className="va-socials" delay={0.65} y={10}>
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
            ))}
          </Fade>
        </div>

        <motion.div className="va-hero-window" style={{ y }}>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease, delay: 0.3 }}>
            <div className="window">
              <WindowSky />
              <div className="win-frame" />
              <div className="flight-card">
                <div className="fc-top">
                  <span className="fc-route">AFA · NOW BOARDING</span>
                  <span className="fc-status">ON TIME</span>
                </div>
                <div className="fc-bar">
                  <motion.i initial={{ width: 0 }} animate={{ width: "42%" }} transition={{ duration: 1.4, ease, delay: 0.9 }} />
                </div>
                <div className="fc-sub">
                  <span>YYZ → TBD</span>
                  <span>GATE A · SEAT 2A</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.nav
        className="wrap va-strip"
        ref={stripRef}
        aria-label="Gates"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease, delay: 0.75 }}
      >
        {STOPS.map((s, i) => (
          <a key={s.id} href={`#${s.id}`} className="va-strip-row">
            <span className="va-strip-gate">{s.gate}</span>
            <span className="va-strip-dest"><Flap value={live ? s.dest : ""} length={10} perChar={22} stepMs={32 + i * 2} /></span>
            <span className="va-strip-info">{s.info}</span>
            <span className={`va-strip-status ${s.status === "ON TIME" ? "ok" : "hot"}`}><i />{s.status}</span>
          </a>
        ))}
      </motion.nav>
    </section>
  );
}
