"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { loungeRoomContent } from "@/data/loungeRoom";
import { GateTV, Jersey, MatchaCup, ShawarmaBox } from "./art";
import { SEG, useSeg, useVW } from "./timeline";
import { SegRoot } from "./SegRoot";

const thumb = (src: string) => src.replace("/ABOUT", "/thumbs/ABOUT");
/** the owner's picks, in this order; never repeated elsewhere */
const PICK = ["/ABOUT22.jpg", "/ABOUT24.jpg", "/ABOUT21.jpg", "/ABOUT26.jpg", "/ABOUT27.jpg", "/ABOUT25.jpg", "/ABOUT6.jpg", "/ABOUT19.jpg", "/ABOUT1.jpg", "/ABOUT10.jpg", "/ABOUT9.jpg", "/ABOUT12.jpg"];
const sentence = (s: string) => s.replace(/\s+—\s+/g, ". ").replace(/^\w/, (c) => c.toUpperCase());

/* Segment 5: the gate at dawn. Lightboxes with the people dolly along the
   glass; the props sit in the gate seating in the foreground: a gate TV
   playing a bear in a blue duffle coat, a shawarma box on a seat, a mango
   matcha by the bag, a folded jersey over the seat back. Never pointed at. */
export function S5Gate({ t }: { t: MotionValue<number> }) {
  const seg = useSeg(t, SEG.gate);
  const { p } = seg;
  const vw = useVW();
  const all = loungeRoomContent.photos.items;
  const items = PICK.map((src) => all.find((i) => i.src === src)).filter((i): i is (typeof all)[number] => !!i);
  const W = Math.min(300, vw * 0.62);
  const GAP = 26;
  const total = items.length * (W + GAP) - GAP;
  const x = useTransform(p, [0.08, 0.96], [vw * 0.6, -(total - vw * 0.4)]);
  const seatX = useTransform(p, [0, 1], [0, -vw * 0.06]);

  return (
    <SegRoot seg={seg} className="seg-gate">
      <div className="glass" aria-hidden="true" />
      <motion.div className="strip" style={{ x, ["--w" as string]: `${W}px`, ["--gap" as string]: `${GAP}px` }}>
        {items.map((ph) => (
          <figure className="lightbox" key={ph.src}>
            <img src={thumb(ph.src)} alt={ph.caption} width={320} height={320} decoding="async" loading="lazy" />
            <figcaption>{sentence(ph.caption)}</figcaption>
          </figure>
        ))}
      </motion.div>
      <motion.div className="strip strip-refl" style={{ x, ["--w" as string]: `${W}px`, ["--gap" as string]: `${GAP}px` }} aria-hidden="true">
        {items.map((ph) => (
          <figure className="lightbox" key={`r-${ph.src}`}>
            <img src={thumb(ph.src)} alt="" width={320} height={320} decoding="async" loading="lazy" />
            <figcaption>{sentence(ph.caption)}</figcaption>
          </figure>
        ))}
      </motion.div>
      <div className="gate-floor" aria-hidden="true" />
      <motion.div className="seats" style={{ x: seatX }} aria-hidden="true">
        <GateTV className="prop prop-tv" />
        <div className="seat-row">
          <span className="seat" /><span className="seat" /><span className="seat" /><span className="seat" />
          <Jersey className="prop prop-jersey" />
          <ShawarmaBox className="prop prop-shawarma" />
        </div>
        <div className="seat-bag">
          <span className="seat-bag-body" />
          <MatchaCup className="prop prop-matcha" />
        </div>
      </motion.div>
    </SegRoot>
  );
}
