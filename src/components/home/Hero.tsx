"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import { Fade, Lines } from "@/components/shell/Reveal";
import { Flap } from "./Flap";
import { ease, SOCIALS, STOPS, WindowSky } from "./shared";

/** Hall: name, the arched window, and the departures board as the way in. */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const live = useInView(boardRef, { once: true, amount: 0.3 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yRaw = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const y = useSpring(yRaw, { stiffness: 90, damping: 24, mass: 0.6 });

  return (
    <section id="hall" ref={ref} className="va-hall">
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
                  <span>GATE D · SEAT 2A</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="wrap"
        ref={boardRef}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease, delay: 0.7 }}
      >
        <nav className="fboard va-board" aria-label="Sections">
          <div className="fboard-head">
            <span className="fh-l"><span className="fh-dot" />DEPARTURES · TERMINAL 1</span>
            <span className="fh-clock">AFA</span>
          </div>
          <div className="fboard-cols va-board-cols">
            <span>TIME</span><span>DESTINATION</span><span>WHERE</span><span>STATUS</span>
          </div>
          {STOPS.map((s) => (
            <a className="fboard-row va-board-row" href={`#${s.id}`} key={s.id}>
              <span className="fr-time">{s.time}</span>
              <Flap value={live ? s.dest : ""} length={10} perChar={34} stepMs={36} />
              <span className="fr-info">{s.where}</span>
              <span className={`fr-status ${s.status === "ON TIME" ? "st-green" : "st-amber"}`}>
                <i />{s.status}<span className="fr-arrow">→</span>
              </span>
            </a>
          ))}
        </nav>
      </motion.div>
    </section>
  );
}
