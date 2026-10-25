"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { loungeRoomContent } from "@/data/loungeRoom";
import { pad2 } from "@/components/home/shared";
import { useCamera, useViewport } from "./camera";
import { GatePlane, Traveller, Trolley } from "./Figures";
import "./scene.css";
import "./concourse.css";

const photos = loungeRoomContent.photos.items.map((m) => ({ src: m.src.replace("/ABOUT", "/thumbs/ABOUT"), caption: m.caption }));
const n = photos.length;
const geo = (vw: number) => {
  const LB = vw < 900 ? Math.round(vw * 0.76) : 360;
  const GAP = vw < 900 ? 22 : 54;
  const PAD = vw < 900 ? Math.round(vw * 0.12) : 420;
  return { LB, GAP, PAD, WORLD: PAD * 2 + n * (LB + GAP) - GAP };
};
const TAIL = 100;
const TRAVEL = 250;

/** 03 · Concourse C. A moving walkway past your photos, hung as lightboxes. */
export function Concourse() {
  const ref = useRef<HTMLElement>(null);
  const vw = useViewport();
  const { LB, GAP, PAD, WORLD } = geo(vw);
  const { camX, mid, back, signs, floor, front } = useCamera(ref, WORLD, vw, TAIL / (TRAVEL + TAIL));
  const [idx, setIdx] = useState(0);
  useMotionValueEvent(camX, "change", (c) => {
    const i = Math.max(0, Math.min(n - 1, Math.round((c - PAD - LB / 2) / (LB + GAP))));
    setIdx((x) => (x === i ? x : i));
  });

  return (
    <section id="concourse" ref={ref} className="scn cw" style={{ height: `${TRAVEL + TAIL}svh` }}>
      <div className="scn-stage">
        <div className="scn-ceiling" aria-hidden>
          <div className="scn-truss" />
          <motion.div className="scn-lights" style={{ x: back }}>{Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ left: `${i * 9}%` }} />)}</motion.div>
        </div>

        {/* glass wall onto the apron: planes at the gates */}
        <motion.div className="cw-back" style={{ x: back }} aria-hidden>
          <div className="cw-sky" />
          <div className="cw-apron">
            <div className="cw-plane" style={{ left: "6%" }}><GatePlane /></div>
            <div className="cw-plane" style={{ left: "46%" }}><GatePlane /></div>
            <div className="cw-plane cw-plane-taxi" style={{ left: "90%" }}><GatePlane bridge={false} /></div>
          </div>
          <div className="cw-mullions" />
        </motion.div>

        <motion.div className="cw-signs" style={{ x: signs }} aria-hidden>
          <div className="scn-sign" style={{ left: "4%" }}><span className="scn-sign-arrow">→</span> GATES C12–C30</div>
          <div className="scn-sign scn-sign-title" style={{ left: "26%" }}>ALONG THE WAY <span className="scn-sign-sub">· pictures from the last few years</span></div>
          <div className="scn-sign" style={{ left: "52%" }}>MATCHA · ICED COFFEE <span className="scn-sign-arrow">↓</span></div>
          <div className="scn-sign" style={{ left: "76%" }}>GATE D <span className="scn-sign-arrow">→</span></div>
          <div className="scn-sign" style={{ left: "98%" }}>SHAWARMA · OPEN 24H</div>
        </motion.div>

        {/* the lightboxes */}
        <motion.div className="cw-wall" style={{ x: mid, width: WORLD }}>
          {photos.map((ph, i) => (
            <figure key={ph.src} className={`cw-box ${i === idx ? "on" : ""}`} style={{ left: PAD + i * (LB + GAP), width: LB }}>
              <div className="cw-box-frame"><img src={ph.src} alt={ph.caption} loading="lazy" /></div>
              <figcaption><b>{pad2(i + 1)}</b><span>{ph.caption}</span><small>AFA · CONCOURSE C</small></figcaption>
            </figure>
          ))}
        </motion.div>

        {/* the walkway: rails, plates, the people riding it */}
        <div className="cw-walkway" aria-hidden>
          <span className="cw-rail" />
          <motion.div className="cw-plates" style={{ x: floor }} />
          <span className="cw-rail cw-rail-low" />
          <span className="cw-rider" style={{ left: "22%" }}><Traveller variant={2} /></span>
          <span className="cw-rider" style={{ left: "62%" }}><Traveller variant={0} /></span>
          <span className="cw-rider cw-rider-kid" style={{ left: "70%" }}><Traveller variant={3} /></span>
        </div>
        <motion.div className="scn-floor cw-floor" style={{ x: floor }} aria-hidden />

        {/* foreground: the café kiosk and a trolley going past */}
        <motion.div className="cw-front" style={{ x: front }} aria-hidden>
          <div className="cw-kiosk" style={{ left: WORLD * 0.42 }}>
            <span className="cw-awning" />
            <span className="cw-kiosk-sign">MATCHA · ICED COFFEE</span>
            <span className="cw-kiosk-counter" />
            <span className="cw-cups"><i /><i /><i /></span>
          </div>
          <span className="cw-trolley" style={{ left: WORLD * 0.78 }}><Trolley /></span>
        </motion.div>

        <div className="scn-hud">
          <span>03 · CONCOURSE C</span>
          <span>PHOTO {pad2(idx + 1)} / {pad2(n)}</span>
          <span className="scn-hud-hint">MOVING WALKWAY · HOLD THE HANDRAIL</span>
        </div>
      </div>
    </section>
  );
}
