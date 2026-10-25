"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { loungeRoomContent } from "@/data/loungeRoom";
import { pad2 } from "@/components/home/shared";
import { Officer, Traveller } from "./Figures";
import "./scene.css";
import "./passport.css";

const ease = [0.22, 1, 0.36, 1] as const;
const photos = loungeRoomContent.photos.items.map((m) => ({ src: m.src.replace("/ABOUT", "/thumbs/ABOUT"), caption: m.caption }));
const PER = 3;
const spreads = Array.from({ length: Math.ceil(photos.length / PER) }, (_, i) => photos.slice(i * PER, i * PER + PER));
const n = spreads.length;
const STAMPS = ["YYZ", "DXB", "KHI", "YKF", "SFO", "YYZ", "DXB", "KHI", "YKF"];
const CITIES: Record<string, string> = { YYZ: "Toronto", DXB: "Dubai", KHI: "Karachi", YKF: "Waterloo", SFO: "San Francisco" };
const TAIL = 100;
const TRAVEL = n * 20 + 30;

/**
 * 03 · Passport control. The passport is the photo album. Scrolling turns
 * the pages; each spread gets a stamp and three pictures.
 */
export function Passport() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const end = 1 - TAIL / (TRAVEL + TAIL);
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  useMotionValueEvent(p, "change", (v) => {
    const t = Math.min(1, Math.max(0, v / end));
    const i = Math.min(n - 1, Math.floor(t * n));
    setIdx((cur) => {
      if (cur === i) return cur;
      setDir(i > cur ? 1 : -1);
      return i;
    });
  });
  const spread = spreads[idx];
  const code = STAMPS[idx % STAMPS.length];

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / n) * end * span, behavior: "smooth" });
  };

  return (
    <section id="passport" ref={ref} className="scn pp" style={{ height: `${TRAVEL + TAIL}svh` }}>
      <div className="scn-stage">
        <div className="scn-ceiling" aria-hidden>
          <div className="scn-truss" />
          <div className="scn-lights">{Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ left: `${i * 9}%` }} />)}</div>
        </div>

        {/* back wall: the booths */}
        <div className="pp-wall" aria-hidden>
          <div className="scn-sign" style={{ left: "5%" }}><span className="scn-sign-arrow">↓</span> PASSPORT CONTROL</div>
          <div className="scn-sign scn-sign-title" style={{ left: "35%" }}>ALL PASSPORTS <span className="scn-sign-sub">· pictures from the last few years</span></div>
          <div className="scn-sign" style={{ left: "76%" }}>GATE D <span className="scn-sign-arrow">→</span></div>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`pp-booth ${i === 1 ? "on" : ""}`} style={{ left: `${12 + i * 30}%` }}>
              <span className="pp-booth-no">{i + 2}</span>
              <span className="pp-booth-glass" />
              <span className="pp-booth-light" />
              <span className="pp-booth-officer"><Officer /></span>
            </div>
          ))}
        </div>

        <div className="scn-floor pp-floor" aria-hidden />

        {/* the queue behind you */}
        <div className="pp-queue" aria-hidden>
          <span className="scn-stanchions pp-stanchions"><i /><b /><i /><b /><i /><b /><i /></span>
          <span className="pp-person" style={{ left: "6%" }}><Traveller variant={1} /></span>
          <span className="pp-person" style={{ left: "16%" }}><Traveller variant={2} /></span>
          <span className="pp-person" style={{ left: "72%" }}><Traveller variant={0} /></span>
          <span className="pp-person pp-person-kid" style={{ left: "81%" }}><Traveller variant={3} /></span>
        </div>

        {/* the counter and the passport */}
        <div className="pp-counter" aria-hidden />
        <div className="pp-book">
          <div className="pp-cover" aria-hidden />
          <div className="pp-pages">
            {/* left page: the stamps so far */}
            <div className="pp-page pp-page-l">
              <span className="pp-page-head">AFA INTERNATIONAL · ENTRIES</span>
              <div className="pp-stamps">
                {STAMPS.slice(0, idx + 1).map((c, i) => (
                  <motion.span
                    key={i}
                    className={`pp-stamp pp-stamp-${i % 3}`}
                    style={{ left: `${(i % 3) * 32 + 4}%`, top: `${Math.floor(i / 3) * 30 + 12}%` }}
                    initial={{ opacity: 0, scale: 1.8, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: [-8, 6, -4][i % 3] }}
                    transition={{ type: "spring", stiffness: 520, damping: 22, mass: 0.9 }}
                  >
                    <b>{c}</b><small>{CITIES[c]}</small><em>ADMITTED</em>
                  </motion.span>
                ))}
              </div>
              <span className="pp-page-no">{pad2(idx * 2 + 1)}</span>
            </div>

            {/* right page: this spread's photos; turns as you scroll */}
            <div className="pp-page pp-page-r">
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.div
                  key={idx}
                  className="pp-leaf"
                  custom={dir}
                  variants={{ enter: (d: number) => ({ rotateY: d > 0 ? 90 : -90, opacity: 0.6 }), on: { rotateY: 0, opacity: 1 }, exit: (d: number) => ({ rotateY: d > 0 ? -90 : 90, opacity: 0.6 }) }}
                  initial="enter"
                  animate="on"
                  exit="exit"
                  transition={{ duration: 0.55, ease }}
                >
                  <span className="pp-page-head">{code} · {CITIES[code].toUpperCase()} · {pad2(idx + 1)} / {pad2(n)}</span>
                  <div className={`pp-photos pp-photos-${spread.length}`}>
                    {spread.map((ph, i) => (
                      <figure key={ph.src} className={`pp-photo pp-photo-${i}`}>
                        <img src={ph.src} alt={ph.caption} loading="lazy" />
                        <figcaption>{ph.caption}</figcaption>
                      </figure>
                    ))}
                  </div>
                  <span className="pp-page-no">{pad2(idx * 2 + 2)}</span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="pp-spine" aria-hidden />
        </div>

        {/* the officer's hand with the stamp */}
        <motion.div className="pp-hand" aria-hidden key={idx} initial={{ y: -70, rotate: -6 }} animate={{ y: [-70, 0, -40] }} transition={{ duration: 0.7, times: [0, 0.4, 1], ease }}>
          <span className="pp-hand-arm" /><span className="pp-hand-stamp" />
        </motion.div>

        <nav className="pp-index" aria-label="Pages">
          {spreads.map((_, i) => (
            <button key={i} type="button" className={i === idx ? "on" : i < idx ? "done" : ""} onClick={() => jump(i)} aria-label={`Page ${i + 1}`} />
          ))}
        </nav>

        <div className="scn-hud">
          <span>03 · PASSPORT CONTROL · BOOTH 3</span>
          <span>PAGE {pad2(idx + 1)} / {pad2(n)}</span>
          <span className="scn-hud-hint">SCROLL TO TURN THE PAGE</span>
        </div>
      </div>
    </section>
  );
}
