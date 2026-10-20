"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { loungeRoomContent } from "@/data/loungeRoom";
import { Airliner, pad2, SceneHead, Walker } from "./shared";

const photos = loungeRoomContent.photos.items.map((m, i) => ({
  src: m.src.replace("/ABOUT", "/thumbs/ABOUT"),
  caption: m.caption,
  size: (["m", "l", "s", "m", "l", "m", "s", "l", "m", "s", "l", "m", "m", "s", "l", "m", "s", "m"] as const)[i % 18],
  tilt: [-2, 1.5, -1, 2, -1.5, 1, -2, 1.5, -1, 2, -1.5, 1, -2, 1.5, -1, 2, -1.5, 1][i % 18],
}));

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
 * 03 · Concourse. A moving walkway past your photos. Scroll carries you along;
 * planes cross the windows, people walk the other way, a trolley rolls past.
 */
export function Concourse() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(p, { stiffness: 90, damping: 26, mass: 0.5 });

  // Layers travel at different speeds: wall slowest, photos with you, floor fastest.
  const wallX = useTransform(smooth, [0, 1], ["0%", "-22%"]);
  const photosX = useTransform(smooth, [0, 1], ["0%", "-74%"]);
  const floorX = useTransform(smooth, [0, 1], ["0%", "-90%"]);
  const trolleyX = useTransform(smooth, [0, 1], ["100vw", "-24vw"]);
  const idx = useTransform(smooth, (v) => pad2(Math.min(photos.length, Math.max(1, Math.round(v * (photos.length - 1)) + 1))));

  return (
    <section id="concourse" ref={ref} className="va-pinwrap va-pin-walk">
      <div className="va-pin">
        <div className="wrap">
          <SceneHead
            no="03"
            title="Concourse"
            where="Concourse C"
            sub="Pictures along the way."
            hint={<>Moving walkway · <motion.span>{idx}</motion.span> / {pad2(photos.length)}</>}
            skip="concourse"
          />
        </div>

        <div className="va-walk">
          {/* Windows onto the apron, with planes going about their day */}
          <div className="va-windows" aria-hidden>
            <span className="va-plane va-plane-1"><Airliner /></span>
            <span className="va-plane va-plane-2"><Airliner /></span>
            <span className="va-plane va-plane-3"><Airliner /></span>
            <span className="va-mullions" />
          </div>

          {/* Wall: gate signs, cafés */}
          <motion.div className="va-wall" style={{ x: wallX }} aria-hidden>
            <div className="va-gatesign" style={{ left: "6%" }}><b>C12</b><span>→ Gates C12–C30</span></div>
            <div className="va-cafe" style={{ left: "30%" }}>
              <span className="va-cafe-sign">MATCHA · ICED COFFEE</span>
              <span className="va-cafe-sub">terminal café · open late</span>
            </div>
            <div className="va-gatesign" style={{ left: "58%" }}><b>YYZ</b><span>→ Toronto</span></div>
            <div className="va-gatesign" style={{ left: "78%" }}><b>DXB</b><span>→ Dubai</span></div>
            <div className="va-gatesign" style={{ left: "98%" }}><b>KHI</b><span>→ Karachi</span></div>
            <div className="va-cafe" style={{ left: "118%" }}>
              <span className="va-cafe-sign">SHAWARMA · OPEN 24H</span>
              <span className="va-cafe-sub">gate C19</span>
            </div>
          </motion.div>

          {/* People walking the other way, on their own */}
          <div className="va-people" aria-hidden>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={`va-person va-person-${i}`}>
                <Walker variant={(i % 2) as 0 | 1} />
              </span>
            ))}
          </div>

          {/* Photos along the wall */}
          <motion.div className="va-photos" style={{ x: photosX }}>
            {photos.map((ph, i) => (
              <figure key={ph.src} className={`va-photo va-photo-${ph.size}`} style={{ ["--tilt" as string]: `${ph.tilt}deg`, ["--d" as string]: `${(i % 5) * 0.6}s` }}>
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
            <span className="va-walk-note">PLEASE HOLD THE HANDRAIL · MOVING WALKWAY</span>
          </div>
        </div>
      </div>
    </section>
  );
}
