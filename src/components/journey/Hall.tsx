"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { hero, signage } from "@/data/journey";
import { Lines } from "./Reveal";
import { Sign } from "./Sign";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hall() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const fade = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section id="hall" ref={ref} className="hall">
      <div className="glass-rail" aria-hidden />
      <motion.div className="hall-inner" style={{ y: textY, opacity: fade }}>
        <motion.p className="kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }}>
          {hero.kicker}
        </motion.p>
        <Lines as="h1" className="hall-name" delay={0.25} stagger={0.1} amount={0.1}>
          {hero.name.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </Lines>
        <motion.p
          className="hall-voice"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.75 }}
        >
          {hero.voice}
        </motion.p>
      </motion.div>
      <div className="hall-sign">
        <Sign items={signage} delay={0.9} />
      </div>
    </section>
  );
}
