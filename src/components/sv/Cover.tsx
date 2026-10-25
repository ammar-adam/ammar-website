"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Plane, SpeedLines } from "./art";
import { Bang, Caption, Cmyk, Kicker } from "./ui";

/* Beat 1: the comic cover. Smooth camera (the plane rides the scroll),
   stepped everything else. */
export function Cover() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const planeX = useTransform(scrollYProgress, [0, 1], ["0%", "70%"]);
  const planeY = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  return (
    <section ref={ref} id="cover" className="cover ht" aria-label="Cover">
      <div className="cover-rays" aria-hidden="true" />
      <div className="cover-top">
        <Kicker>Issue #20 · Waterloo · 2026</Kicker>
        <Kicker className="kick-right">$0.00 · Approved by nobody</Kicker>
      </div>

      <motion.div className="cover-title" style={{ y: titleY }}>
        <Cmyk as="h1" text="AMMAR" className="cover-h1" />
        <Cmyk as="span" text="ADAM" className="cover-h1 cover-h1b" />
      </motion.div>

      <motion.div className="cover-plane" style={{ x: planeX, y: planeY }}>
        <SpeedLines className="cover-speed" />
        <span className="cover-echo e2" aria-hidden="true"><Plane id="cover-pl2" /></span>
        <span className="cover-echo e1" aria-hidden="true"><Plane id="cover-pl1" /></span>
        <Plane className="cover-plane-svg" id="cover-pl" />
        <Bang text="FWOOSH" className="cover-fwoosh" rotate={-12} size={64} color="var(--sv-paper)" burst="var(--sv-mag)" />
      </motion.div>

      <div className="cover-bottom">
        <Caption tone="yellow" size="lg" rotate={-1.5} className="cover-cap">
          Alright. Let&apos;s do this one more time.
        </Caption>
        <Caption tone="cream" size="sm" rotate={1} className="cover-sub">
          CS &amp; Finance at Waterloo. AI at Sagard. Builder Lead at OpenAI. Grew up in three airports.
        </Caption>
      </div>

      <nav className="cover-nav" aria-label="Jump to">
        <a href="#checkin">Experience</a>
        <a href="#security">Projects</a>
        <a href="#gate">Photos</a>
        <a href="#boarding">Resume</a>
      </nav>

      <div className="cover-scroll" aria-hidden="true">
        <span>scroll</span>
        <i />
      </div>
    </section>
  );
}
