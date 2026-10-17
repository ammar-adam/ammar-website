"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { hero, homeCities } from "@/data/journey";
import { siteConfig } from "@/data/site";

const ease = [0.22, 1, 0.36, 1] as const;

const stampStyles = [
  { rotate: -9, x: "7%", y: "14%", shape: "round" },
  { rotate: 7, x: "50%", y: "36%", shape: "rect" },
  { rotate: -4, x: "10%", y: "62%", shape: "oval" },
] as const;

export function CheckIn({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const passY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const passRot = useTransform(scrollYProgress, [0, 1], [-3, -10]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Gentle pointer tilt on the passport.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 140, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 140, damping: 18 });

  const go = ready ? "show" : "hide";
  const words = hero.name.split(" ");

  return (
    <section id="check-in" ref={ref} className="checkin">
      <motion.div className="ci-copy" style={{ y: textY, opacity: fade }}>
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 8 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
        >
          {homeCities.map((c) => c.code).join("  ·  ")}
        </motion.p>
        <h1 className="ci-name" aria-label={hero.name}>
          {words.map((w, i) => (
            <span className="mask" key={w}>
              <motion.span
                className={i === 1 ? "it" : undefined}
                variants={{ hide: { y: "110%" }, show: { y: "0%" } }}
                initial="hide"
                animate={go}
                transition={{ duration: 1.1, ease, delay: 0.15 + i * 0.12 }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          className="ci-lede"
          initial={{ opacity: 0, y: 14 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease, delay: 0.45 }}
        >
          {hero.lede}
        </motion.p>
        <motion.div
          className="ci-actions"
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <a href="#departures" className="btn-depart">
            Start the trip
            <span className="btn-arrow" aria-hidden>↓</span>
          </a>
          <div className="socials">
            <a href={siteConfig.socialLinks.email}>Email</a>
            <a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a href={siteConfig.socialLinks.github} target="_blank" rel="noreferrer">GitHub</a>
            <a href={siteConfig.socialLinks.x} target="_blank" rel="noreferrer">X</a>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="ci-passport-wrap"
        style={{ y: passY, rotate: passRot }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
      >
        <motion.div
          className="passport"
          style={{ rotateX: rx, rotateY: ry }}
          initial={{ opacity: 0, y: 60, rotate: 4 }}
          animate={ready ? { opacity: 1, y: 0, rotate: 0 } : {}}
          transition={{ duration: 1.2, ease, delay: 0.2 }}
        >
          <div className="pp-page pp-data">
            <div className="pp-title">
              <span>Passport · Passeport</span>
              <span>AFA</span>
            </div>
            <div className="pp-body">
              <div className="pp-photo">
                <img src="/passport-photo.jpg" alt="Ammar Adam" />
              </div>
              <dl className="pp-fields">
                <div><dt>Surname</dt><dd>Adam</dd></div>
                <div><dt>Given name</dt><dd>Ammar</dd></div>
                <div><dt>Program</dt><dd>CS &amp; Finance</dd></div>
                <div><dt>Issued by</dt><dd>U. of Waterloo</dd></div>
                <div><dt>Home</dt><dd>YYZ·DXB·KHI</dd></div>
              </dl>
            </div>
            <div className="pp-mrz" aria-hidden>
              <span>P&lt;AFAADAM&lt;&lt;AMMAR&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</span>
              <span>YYZ&lt;DXB&lt;KHI&lt;&lt;CSFIN&lt;&lt;WATERLOO&lt;&lt;&lt;&lt;2A</span>
            </div>
          </div>
          <div className="pp-page pp-visa">
            <span className="pp-visa-label">Entries</span>
            {homeCities.map((c, i) => {
              const s = stampStyles[i];
              return (
                <motion.div
                  key={c.code}
                  className={`stamp stamp-${s.shape} stamp-${i}`}
                  style={{ left: s.x, top: s.y }}
                  initial={{ opacity: 0, scale: 1.9, rotate: s.rotate - 14 }}
                  animate={ready ? { opacity: 1, scale: 1, rotate: s.rotate } : {}}
                  transition={{ type: "spring", stiffness: 520, damping: 22, mass: 0.9, delay: 1.0 + i * 0.38 }}
                >
                  <span className="stamp-code">{c.code}</span>
                  <span className="stamp-city">{c.city}</span>
                  <span className="stamp-note">Home</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <motion.div className="ci-scroll" aria-hidden style={{ opacity: fade }}>
        <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 1.6, duration: 0.8 }}>
          <span>Scroll</span>
          <i />
        </motion.div>
      </motion.div>
    </section>
  );
}
