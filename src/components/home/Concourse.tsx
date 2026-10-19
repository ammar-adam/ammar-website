"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { loungeRoomContent } from "@/data/loungeRoom";
import { pad2 } from "./shared";

const photos = loungeRoomContent.photos.items.map((m, i) => ({
  src: m.src.replace("/ABOUT", "/thumbs/ABOUT"),
  caption: m.caption,
  // A little variety along the wall: three heights, gentle tilt.
  size: (["m", "l", "s", "m", "l", "m", "s", "l", "m", "s", "l", "m", "m", "s", "l", "m", "s", "m"] as const)[i % 18],
  tilt: [-2, 1.5, -1, 2, -1.5, 1, -2, 1.5, -1, 2, -1.5, 1, -2, 1.5, -1, 2, -1.5, 1][i % 18],
}));

/** Walking figure, side view, flat silhouette. Two variants. */
function Walker({ variant = 0 }: { variant?: 0 | 1 }) {
  return variant === 0 ? (
    <svg viewBox="0 0 60 120" className="va-walker" aria-hidden>
      <circle cx="30" cy="12" r="9" />
      <path d="M22 24h16l6 34-5 2-4-18-2 20 8 38h-8l-8-30-6 30h-8l6-40-3-20-5 16-5-2z" />
      <rect x="44" y="70" width="14" height="22" rx="3" />
      <path d="M50 70v-10" strokeWidth="3" stroke="currentColor" fill="none" />
    </svg>
  ) : (
    <svg viewBox="0 0 60 120" className="va-walker" aria-hidden>
      <circle cx="28" cy="12" r="9" />
      <path d="M20 24h16l4 30 8 6-3 4-10-6-2 18 10 40h-8l-10-32-4 32h-8l6-44-2-18-6 12-4-3z" />
      <rect x="34" y="30" width="12" height="22" rx="4" />
    </svg>
  );
}

/** Baggage trolley with stacked bags, flat silhouette. */
function Trolley() {
  return (
    <svg viewBox="0 0 160 120" className="va-trolley-svg" aria-hidden>
      <path d="M8 112h120l6-72h-8l-5 60H14z" />
      <rect x="30" y="36" width="54" height="40" rx="5" />
      <rect x="38" y="14" width="40" height="22" rx="4" />
      <rect x="88" y="52" width="30" height="24" rx="4" />
      <path d="M8 40h12v72H8z" />
      <circle cx="30" cy="110" r="8" /><circle cx="110" cy="110" r="8" />
    </svg>
  );
}

/**
 * Concourse · a moving walkway past your photos. Scroll carries you along it.
 * Behind: gate signs, a café, people walking, a trolley rolling by.
 */
export function Concourse() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(p, { stiffness: 80, damping: 26, mass: 0.6 });

  // Layers travel at different speeds: wall slowest, photos with you, floor fastest.
  const wallX = useTransform(smooth, [0, 1], ["0%", "-22%"]);
  const peopleX = useTransform(smooth, [0, 1], ["0%", "-35%"]);
  const photosX = useTransform(smooth, [0, 1], ["0%", "-74%"]);
  const floorX = useTransform(smooth, [0, 1], ["0%", "-90%"]);
  const trolleyX = useTransform(smooth, [0, 1], ["105vw", "-30vw"]);
  const idx = useTransform(smooth, (v) => pad2(Math.min(photos.length, Math.max(1, Math.round(v * (photos.length - 1)) + 1))));

  return (
    <section id="concourse" ref={ref} className="va-scene va-pinwrap va-pinwrap-walk">
      <div className="va-pin">
        <div className="wrap">
          <div className="va-scene-head">
            <span className="kicker">GATE C · CONCOURSE · ALONG THE WAY</span>
            <small>Moving walkway · photo <motion.span>{idx}</motion.span> / {pad2(photos.length)}</small>
          </div>
        </div>

        <div className="va-walk">
          {/* Wall: gate signs, café */}
          <motion.div className="va-wall" style={{ x: wallX }} aria-hidden>
            <div className="va-gatesign" style={{ left: "6%" }}><b>C12</b><span>→ Gates C12–C30</span></div>
            <div className="va-cafe" style={{ left: "30%" }}>
              <span className="va-cafe-sign">MATCHA · ICED COFFEE</span>
              <span className="va-cafe-sub">terminal café · open late</span>
            </div>
            <div className="va-gatesign" style={{ left: "58%" }}><b>YYZ</b><span>→ Toronto</span></div>
            <div className="va-gatesign" style={{ left: "78%" }}><b>DXB</b><span>→ Dubai</span></div>
            <div className="va-gatesign" style={{ left: "98%" }}><b>KHI</b><span>→ Karachi</span></div>
            <div className="va-cafe va-cafe-2" style={{ left: "118%" }}>
              <span className="va-cafe-sign">SHAWARMA · OPEN 24H</span>
              <span className="va-cafe-sub">gate C19</span>
            </div>
          </motion.div>

          {/* People walking the other way, at their own pace */}
          <motion.div className="va-people" style={{ x: peopleX }} aria-hidden>
            {[4, 18, 33, 47, 61, 76, 90, 104, 118].map((left, i) => (
              <span key={left} className={`va-person va-person-${i % 3}`} style={{ left: `${left}%` }}>
                <Walker variant={(i % 2) as 0 | 1} />
              </span>
            ))}
          </motion.div>

          {/* Photos along the wall */}
          <motion.div className="va-photos" style={{ x: photosX }}>
            {photos.map((ph, i) => (
              <figure key={ph.src} className={`va-photo va-photo-${ph.size}`} style={{ rotate: `${ph.tilt}deg` }}>
                <img src={ph.src} alt={ph.caption} loading="lazy" />
                <figcaption><b>{pad2(i + 1)}</b>{ph.caption}</figcaption>
              </figure>
            ))}
          </motion.div>

          {/* Trolley rolling past in the foreground */}
          <motion.div className="va-trolley" style={{ x: trolleyX }} aria-hidden>
            <Trolley />
          </motion.div>

          {/* Walkway */}
          <div className="va-walkway" aria-hidden>
            <span className="va-rail va-rail-top" />
            <motion.div className="va-floor" style={{ x: floorX }} />
            <span className="va-rail va-rail-bot" />
            <span className="va-walk-note">PLEASE HOLD THE HANDRAIL · MOVING WALKWAY ENDS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
