"use client";

import { motion, useScroll, useTransform } from "framer-motion";

const sky = "https://videos.pexels.com/video-files/9669392/9669392-hd_1080_1920_30fps.mp4";

/**
 * The terminal's glass wall. Fixed behind the whole page, so scrolling reads
 * as walking along it: full sky in the hall, a faint glow behind everything else.
 */
export function Glass() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1200], [0, 120]);
  // The window frame belongs to the hall; past it only the sky glows through.
  const frame = useTransform(scrollY, [300, 900], [1, 0]);
  return (
    <motion.div className="glass" style={{ y }} aria-hidden>
      <video className="glass-sky" autoPlay muted loop playsInline preload="metadata" src={sky} />
      <div className="glass-grade" />
      <div className="glass-stars" />
      <motion.div className="glass-mullions" style={{ opacity: frame }} />
    </motion.div>
  );
}
