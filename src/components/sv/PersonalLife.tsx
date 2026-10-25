"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { loungeRoomContent } from "@/data/loungeRoom";
import { photoFraming } from "./photo-framing";
import "./personal-life.css";

const PHOTOS = loungeRoomContent.photos.items;
const BAY_GAP = 460;
const TRAVEL = BAY_GAP * 12;

type PersonalLifeProps = {
  p: MotionValue<number>;
  reduced: boolean;
  onGallery: (index?: number) => void;
};

export function PersonalLife({ p, reduced, onGallery }: PersonalLifeProps) {
  const journey = useTransform(p, [.06, .91], [0, 1], { clamp: true });
  const [bay, setBay] = useState(() => Math.min(12, Math.round(journey.get() * 12)));
  const [still, setStill] = useState(0);
  const currentBay = useTransform(journey, (value) => Math.min(12, Math.round(value * 12)));
  useMotionValueEvent(currentBay, "change", setBay);
  const gateScale = useTransform(journey, [0, 1], [0.65, 1.08]);
  const gateY = useTransform(journey, [0, 1], [0, -8]);
  const frame = reduced ? still : bay * 2;

  return <div className={`cw-scene ${reduced ? "cw-reduced" : ""}`}>
    <div className="cw-depth-shade" aria-hidden="true" />
    <div className="cw-heading">
      <p className="sv-eyebrow">03 / CAMERA ROLL</p>
      <h2>And off<br /><span>the clock?</span></h2>
      <p className="cw-walk-note">A few moments worth keeping.</p>
    </div>
    <div className="cw-frame-count" aria-live="off"><span>{String(frame + 1).padStart(2, "0")}{!reduced && frame < 24 ? `—${String(frame + 2).padStart(2, "0")}` : ""}</span><small> / 25 PHOTOS</small></div>

    {!reduced ? <>
      <div className="cw-walkway-bed" aria-hidden="true" />
      <motion.div className="cw-gate" style={{ scale: gateScale, y: gateY }} aria-hidden="true"><span>GATES</span><strong>04—05 <b>↑</b></strong></motion.div>
      <div className="cw-world">
        {Array.from({ length: 22 }, (_, index) => <WalkwayTread key={index} p={journey} index={index} />)}
        {PHOTOS.map((photo, index) => <CorridorPhoto key={photo.src} p={journey} index={index} active={Math.floor(index / 2) === bay} onGallery={onGallery} />)}
        {Array.from({ length: 10 }, (_, index) => <RailLight key={index} p={journey} index={index} />)}
      </div>
      <div className="cw-glass cw-glass-left" aria-hidden="true" /><div className="cw-glass cw-glass-right" aria-hidden="true" />
      <div className="cw-handrail cw-handrail-left" aria-hidden="true" /><div className="cw-handrail cw-handrail-right" aria-hidden="true" />
      <div className="cw-walkway-front" aria-hidden="true"><span>KEEP RIGHT</span><i>↑</i></div>
    </> : <div className="cw-still-gallery">
      <button type="button" className="cw-still-photo" onClick={() => onGallery(still)} aria-label={`Open photo gallery: ${PHOTOS[still].caption}`}><img src={PHOTOS[still].src} alt={PHOTOS[still].caption} width={900} height={700} /><span>{PHOTOS[still].caption}<b aria-hidden="true">↗</b></span></button>
      <div className="cw-still-nav"><button type="button" aria-label="Previous photo" onClick={() => setStill((still + PHOTOS.length - 1) % PHOTOS.length)}>←</button><span>{String(still + 1).padStart(2, "0")} / 25</span><button type="button" aria-label="Next photo" onClick={() => setStill((still + 1) % PHOTOS.length)}>→</button></div>
    </div>}

    <div className="cw-discoveries">
      <div className="cw-scene-object cw-bag"><img src="/art/carryon-easter-eggs.webp" alt="A carry-on with a 66 football shirt, a soccer ball, a Raptors cap, a Toronto postcard and a Mississauga luggage tag" width={900} height={900} loading="lazy" /></div>
      <div className="cw-scene-object cw-cafe">
        <img className="cw-cafe-matcha" src="/art/matcha-v1.webp" alt="Mango matcha" title="Mango matcha" width={700} height={700} loading="lazy" />
        <img className="cw-cafe-shawarma" src="/art/shawarma-v1.webp" alt="Chicken shawarma" title="Chicken shawarma" width={700} height={700} loading="lazy" />
        <img className="cw-cafe-nihari" src="/art/nihari.webp" alt="Nihari" title="Nihari" width={700} height={700} loading="lazy" />
      </div>
      <div className="cw-scene-object cw-screen"><img src="/art/film-v1.webp" alt="Paddington 2 on a small gate screen" title="Paddington 2" width={700} height={700} loading="lazy" /></div>
    </div>
    <button type="button" className="cw-gallery-button" onClick={() => onGallery(frame)}><span>Open photo gallery <small>· 25 photos</small></span><b aria-hidden="true">↗</b></button>
  </div>;
}

function CorridorPhoto({ p, index, active, onGallery }: { p: MotionValue<number>; index: number; active: boolean; onGallery: (index?: number) => void }) {
  const station = Math.floor(index / 2);
  const side = index % 2 === 0 ? -1 : 1;
  const depth = useTransform(p, (value) => value * TRAVEL - station * BAY_GAP - 280);
  const transform = useTransform(depth, (z) => `translate3d(calc(var(--cw-span) * ${side}), var(--cw-photo-y), ${z}px) rotateY(${side * -13}deg)`);
  const opacity = useTransform(depth, [-2300, -1750, -850, -120, 140], [0, .18, 1, 1, 0]);
  const visibility = useTransform(depth, (z) => z < -2300 || z > 160 ? "hidden" as const : "visible" as const);
  const photo = PHOTOS[index];
  return <motion.button type="button" className="cw-photo" data-photo-index={index} style={{ transform, opacity, visibility, pointerEvents: active ? "auto" : "none" }} tabIndex={active ? 0 : -1} onClick={() => onGallery(index)} aria-label={`Open photo ${index + 1} of 25: ${photo.caption}`}>
    <span className="cw-photo-top"><span>AA / {String(index + 1).padStart(2, "0")}</span><i aria-hidden="true">↗</i></span>
    <img src={photo.src} alt={photo.caption} style={photoFraming(photo.src)} width={900} height={800} loading={index < 4 ? "eager" : "lazy"} decoding="async" />
    <span className="cw-photo-caption">{photo.caption}</span>
    <span className="cw-photo-pole" aria-hidden="true" />
  </motion.button>;
}

function WalkwayTread({ p, index }: { p: MotionValue<number>; index: number }) {
  const transform = useTransform(p, (value) => `translate3d(0, var(--cw-floor-y), ${(value * TRAVEL % 240) - index * 240}px) rotateX(72deg)`);
  const opacity = index > 15 ? (22 - index) / 16 : .48;
  return <motion.div className="cw-tread" style={{ transform, opacity }} aria-hidden="true" />;
}

function RailLight({ p, index }: { p: MotionValue<number>; index: number }) {
  const transform = useTransform(p, (value) => `translate3d(0, var(--cw-rail-y), ${(value * TRAVEL % 460) - index * 460}px)`);
  return <motion.div className="cw-rail-light" style={{ transform }} aria-hidden="true"><span /><span /></motion.div>;
}
