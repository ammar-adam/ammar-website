"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { gateBeats, moments } from "@/data/journey";
import { Flap } from "./Flap";

const ease = [0.22, 1, 0.36, 1] as const;

export function Airliner({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 60" aria-hidden>
      <path className="al-tail" d="M16 26 L6 4 h11 l22 22 Z" />
      <path className="al-stab" d="M12 31 L0 37 h20 l8 -5 Z" />
      <path className="al-body" d="M8 30c0-4 4-6 12-6h138c16 0 29 3 36 7-6 4-17 6-30 6H24C14 37 8 34 8 30Z" />
      <path className="al-wing" d="M82 33h38l-22 15h-12Z" />
      <rect className="al-engine" x="90" y="39" width="24" height="8" rx="4" />
      <g className="al-windows">
        {Array.from({ length: 21 }).map((_, i) => (
          <rect key={i} x={40 + i * 6} y="27.5" width="2.6" height="3.4" rx="1.2" />
        ))}
        <path d="M181 28.5h7.5c1.8.7 3 1.3 3.8 2h-11.3Z" />
      </g>
      <circle className="al-strobe" cx="8" cy="5" r="1.8" />
      <circle className="al-beacon" cx="100" cy="37.6" r="1.4" />
    </svg>
  );
}

/**
 * The gate. The section pins and scrolling moves the clock outside the window
 * from afternoon to night while three short beats about me play beside it.
 */
export function Gate() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [beat, setBeat] = useState(0);

  useMotionValueEvent(p, "change", (v) => {
    const next = v < 0.36 ? 0 : v < 0.7 ? 1 : 2;
    setBeat((cur) => (cur === next ? cur : next));
  });

  const dusk = useTransform(p, [0.18, 0.5, 0.72], [0, 1, 0]);
  const night = useTransform(p, [0.5, 0.85], [0, 1]);
  const sunY = useTransform(p, [0, 0.62], ["14%", "92%"]);
  const sunScale = useTransform(p, [0, 0.62], [1, 1.35]);
  const stars = useTransform(p, [0.6, 0.9], [0, 1]);
  const clouds = useTransform(p, [0, 0.5, 0.9], [0.85, 0.55, 0.12]);
  const cityLights = useTransform(p, [0.45, 0.8], [0, 1]);
  const planeX = useTransform(p, [0.08, 0.7, 0.98], ["-30%", "52%", "128%"]);
  const planeY = useTransform(p, [0.62, 0.98], ["0%", "-420%"]);
  const planeRot = useTransform(p, [0.6, 0.72, 0.98], [0, -9, -12]);
  const reflect = useTransform(p, [0, 1], ["-20%", "60%"]);

  const b = gateBeats[beat];

  return (
    <section id="gate" className="gate">
      <div className="gate-pin" ref={ref}>
        <div className="gate-sticky">
          <div className="sec-head">
            <p className="eyebrow">Gate</p>
            <h2>A bit about me, <em>while we wait.</em></h2>
          </div>

          <div className="gate-grid">
            <div className="gate-window">
              <div className="gw-sky">
                <div className="gw-layer gw-day" />
                <motion.div className="gw-layer gw-dusk" style={{ opacity: dusk }} />
                <motion.div className="gw-layer gw-night" style={{ opacity: night }} />
                <motion.div className="gw-stars" style={{ opacity: stars }} />
                <motion.div className="gw-sun" style={{ top: sunY, scale: sunScale }} />
                <motion.video
                  className="gw-clouds"
                  style={{ opacity: clouds }}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  src="https://videos.pexels.com/video-files/9669392/9669392-hd_1080_1920_30fps.mp4"
                />
                <div className="gw-ground">
                  <svg className="gw-horizon" viewBox="0 0 400 40" preserveAspectRatio="xMidYMax slice" aria-hidden>
                    <path d="M0 40V30h40v-4h70v4h30V24h6v6h50v-8h90v8h28v-3h30v3h56v10Z" />
                    <path d="M262 40V14h-4l3-8h16l3 8h-4v26Z" />
                    <rect x="259" y="2" width="20" height="5" rx="1" />
                  </svg>
                  <motion.div className="gw-city-lights" style={{ opacity: cityLights }} />
                  <div className="gw-runway" />
                  <motion.div className="gw-edge-lights" style={{ opacity: cityLights }} />
                </div>
                <motion.div className="gw-plane" style={{ left: planeX, y: planeY, rotate: planeRot }}>
                  <Airliner />
                </motion.div>
              </div>
              <motion.div className="gw-glare" style={{ x: reflect }} aria-hidden />
              <div className="gw-mullions" aria-hidden><i /><i /></div>
              <div className="gw-sign">
                <span className="gw-sign-gate">A2</span>
                <span className="gw-sign-dest">Waterloo&nbsp;→&nbsp;What&apos;s next</span>
                <Flap value={b.time} length={5} stagger={30} step={30} className="flap-sm flap-amber" />
              </div>
            </div>

            <div className="gate-beats">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={beat}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, ease }}
                >
                  <h3>{b.title}</h3>
                  <p>{b.body}</p>
                </motion.div>
              </AnimatePresence>
              <ol className="beat-dots" aria-hidden>
                {gateBeats.map((g, i) => (
                  <li key={g.time} className={i === beat ? "on" : ""}>{g.time}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="moments">
        <div className="moments-head">
          <p className="eyebrow">Camera roll</p>
          <p className="moments-note">Some of the people and places along the way.</p>
        </div>
        <div className="moments-track">
          <div className="moments-run">
            {[...moments, ...moments].map((m, i) => (
              <figure key={i} className="moment" aria-hidden={i >= moments.length}>
                <img src={m.src} alt={i < moments.length ? m.caption : ""} loading="lazy" />
                <figcaption>{m.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
