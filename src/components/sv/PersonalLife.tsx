"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { loungeRoomContent } from "@/data/loungeRoom";
import "./personal-life.css";

type PersonalLifeProps = {
  p: MotionValue<number>;
  reduced: boolean;
  onGallery: (index?: number) => void;
};

const PICKS = [
  { src: "/ABOUT1.jpg", label: "Jeju Island", position: "center" },
  { src: "/ABOUT11.jpg", label: "Mango matcha", position: "center 65%" },
  { src: "/ABOUT25.jpg", label: "World Cup", position: "center 70%" },
].map((pick) => ({
  ...pick,
  index: loungeRoomContent.photos.items.findIndex((photo) => photo.src === pick.src),
  caption: loungeRoomContent.photos.items.find((photo) => photo.src === pick.src)!.caption,
}));

export function PersonalLife({ p, reduced, onGallery }: PersonalLifeProps) {
  const tableY = useTransform(p, [0, 1], [reduced ? 0 : 8, reduced ? 0 : -6]);
  const photosY = useTransform(p, [0, 1], [reduced ? 0 : 10, reduced ? 0 : -8]);
  const photoTurn = useTransform(p, [0, 1], [reduced ? 0 : -1.2, reduced ? 0 : 1.2]);

  return <div className="pl-scene">
    <div className="pl-light-slice" aria-hidden="true" />
    <div className="pl-layout">
      <div className="pl-heading">
        <p className="sv-eyebrow">03 / A FEW FAVOURITES</p>
        <h2>Away from <br /><span>the laptop.</span></h2>
      </div>
      <motion.div className="pl-table" style={{ y: tableY }}>
        <div className="pl-table-plane" aria-hidden="true" />
        <div className="pl-table-edge" aria-hidden="true" />
        <div className="pl-object pl-football">
          <img className="pl-prop" src="/art/jersey-v1.webp" width={700} height={700} alt="" aria-hidden="true" loading="lazy" />
          <p><span>FOOTBALL</span>Liverpool &amp; Trent</p>
        </div>
        <div className="pl-object pl-film">
          <img className="pl-prop" src="/art/film-v1.webp" width={700} height={700} alt="" aria-hidden="true" loading="lazy" />
          <p><span>FILM</span>Paddington 2</p>
        </div>
        <div className="pl-object pl-drink">
          <img className="pl-prop" src="/art/matcha-v1.webp" width={700} height={700} alt="" aria-hidden="true" loading="lazy" />
          <p><span>DRINK ORDER</span>Mango matcha</p>
        </div>
        <div className="pl-object pl-food">
          <img className="pl-prop" src="/art/shawarma-v1.webp" width={700} height={700} alt="" aria-hidden="true" loading="lazy" />
          <p><span>FOOD ORDER</span>Chicken shawarma</p>
        </div>
      </motion.div>
      <motion.div className="pl-memories" style={{ y: photosY, rotate: photoTurn }}>
        <div className="pl-photo-pile">
          {PICKS.map((photo, index) => <button
            type="button"
            className={`pl-photo pl-photo-${index + 1}`}
            key={photo.src}
            onClick={() => onGallery(photo.index)}
            aria-label={`Open photo gallery: ${photo.caption}`}
          >
            <img src={photo.src} alt={photo.caption} width={600} height={800} loading="lazy" style={{ objectPosition: photo.position }} />
            <span>{photo.label}<b aria-hidden="true">↗</b></span>
          </button>)}
        </div>
        <button type="button" className="pl-gallery-button" onClick={() => onGallery(0)}>
          <span>Open photo gallery <small>· {loungeRoomContent.photos.items.length} photos</small></span><b aria-hidden="true">↗</b>
        </button>
      </motion.div>
    </div>
  </div>;
}
