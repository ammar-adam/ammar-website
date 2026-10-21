"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { Flap } from "@/components/home/Flap";
import { CODES, host, pad2 } from "@/components/home/shared";
import { BeltBag, GatePlane, Traveller } from "./Figures";
import "./hall.css";

const ease = [0.22, 1, 0.36, 1] as const;
const shortName = (s: string) => s.replace("Waterloo Tech Week / ", "");

const n = arrivals.length;
const geo = (vw: number) => {
  const DESK_W = vw < 900 ? Math.round(vw * 0.86) : 560;
  const PAD = vw < 900 ? Math.round(vw * 0.07) : 360;
  return { DESK_W, PAD, WORLD: PAD * 2 + DESK_W * n };
};

/**
 * Check-in hall. One full-bleed illustrated scene. Scrolling pans the camera
 * along the counter: seven desks, one per role. The role lives in the scene,
 * on the desk's screen and on the tag that prints when you reach it.
 */
export function CheckInHall() {
  const ref = useRef<HTMLElement>(null);
  const [vw, setVw] = useState(1440);
  useEffect(() => {
    const on = () => setVw(window.innerWidth);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  const { DESK_W, PAD, WORLD } = geo(vw);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(p, { stiffness: 70, damping: 24, mass: 0.7 });
  // The camera: where its centre is in world px.
  const camX = useTransform(smooth, [0, 1], [vw / 2, WORLD - vw / 2]);
  const mid = useTransform(camX, (c) => vw / 2 - c);
  const back = useTransform(camX, (c) => (vw / 2 - c) * 0.3);
  const front = useTransform(camX, (c) => (vw / 2 - c) * 1.35);
  const floor = useTransform(camX, (c) => (vw / 2 - c) * 1.1);

  const [desk, setDesk] = useState(0);
  useMotionValueEvent(camX, "change", (c) => {
    const i = Math.round((c - PAD - DESK_W / 2) / DESK_W);
    const next = Math.max(0, Math.min(n - 1, i));
    setDesk((d) => (d === next ? d : next));
  });
  const a = arrivals[desk];
  const code = CODES[a.origin] ?? "AFA";

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    const target = PAD + DESK_W * i + DESK_W / 2; // world x of desk centre
    const t = (target - vw / 2) / (WORLD - vw);
    window.scrollTo({ top: top + Math.max(0, Math.min(1, t)) * span, behavior: "smooth" });
  };

  return (
    <section ref={ref} className="hl" style={{ height: `${n * 60 + 100}svh` }}>
      <div className="hl-stage">
        {/* Ceiling: trusses and lights */}
        <div className="hl-ceiling" aria-hidden>
          <div className="hl-truss" />
          <motion.div className="hl-lights" style={{ x: back }}>
            {Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ left: `${i * 9}%` }} />)}
          </motion.div>
        </div>

        {/* Back wall: glass, sky, apron and the plane at the gate */}
        <motion.div className="hl-back" style={{ x: back }} aria-hidden>
          <div className="hl-sky" />
          <div className="hl-apron">
            <div className="hl-plane-wrap" style={{ left: "18%" }}><GatePlane /></div>
            <div className="hl-plane-wrap hl-plane-far" style={{ left: "64%" }}><GatePlane /></div>
          </div>
          <div className="hl-mullions" />
          <div className="hl-sill" />
        </motion.div>

        {/* Hanging signs */}
        <motion.div className="hl-signs" style={{ x: back }} aria-hidden>
          <div className="hl-sign" style={{ left: "6%" }}>
            <span className="hl-sign-arrow">↓</span> CHECK-IN · ROWS A–D
          </div>
          <div className="hl-sign hl-sign-title" style={{ left: "34%" }}>
            WHERE I&apos;VE WORKED <span className="hl-sign-sub">· seven desks, one per role</span>
          </div>
          <div className="hl-sign" style={{ left: "74%" }}>
            SECURITY <span className="hl-sign-arrow">→</span>
          </div>
        </motion.div>

        {/* Belt behind the counter, bags riding along on their own */}
        <div className="hl-beltwrap" aria-hidden>
          <motion.div className="hl-belt" style={{ x: mid }}>
            <div className="hl-belt-bags">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="hl-bbag-slot" style={{ ["--i" as string]: i }}>
                  <BeltBag tone={(i % 3) as 0 | 1 | 2} />
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* The counter: seven desks */}
        <motion.div className="hl-counter" style={{ x: mid, width: WORLD }} aria-label="Check-in desks">
          {arrivals.map((b, i) => {
            const on = i === desk;
            return (
              <div key={b.slug} className={`hl-desk ${on ? "on" : ""}`} style={{ left: PAD + DESK_W * i, width: DESK_W }}>
                <div className="hl-screen">
                  <div className="hl-screen-top"><i className={on ? "live" : ""} />DESK {pad2(i + 1)}</div>
                  <div className="hl-screen-main">
                    <span className="hl-screen-co"><Flap value={on ? shortName(b.from).toUpperCase().slice(0, 14) : ""} length={14} perChar={18} stepMs={30} /></span>
                    <span className="hl-screen-row">{CODES[b.origin] ?? "AFA"} · {b.origin.toUpperCase()}</span>
                  </div>
                  <div className="hl-screen-foot">{on ? "NOW SERVING" : "OPEN"}</div>
                </div>
                <span className="hl-pole" />
                <div className="hl-top" />
                <div className="hl-front">
                  <span className="hl-no">{i + 1}</span>
                  <span className="hl-front-panel" />
                </div>
                <div className="hl-scale" />
                <button type="button" className="hl-desk-hit" onClick={() => jump(i)} aria-label={`Desk ${i + 1}: ${b.from}`} />
              </div>
            );
          })}
        </motion.div>

        {/* The printed tag: the role, in the scene */}
        <div className="hl-tagdock">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={a.slug}
              className="hl-tag"
              initial={{ clipPath: "inset(0 0 100% 0)", y: -10 }}
              animate={{ clipPath: "inset(0 0 0% 0)", y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.6, ease }}
            >
              <span className="hl-tag-hole" />
              <header>
                <span className="hl-tag-code">{code}</span>
                <span className="hl-tag-meta">{a.origin.toUpperCase()} · DESK {pad2(desk + 1)} · BAG {pad2(desk + 1)}/{pad2(n)}</span>
              </header>
              <h2>{a.from}</h2>
              <p className="hl-tag-role">{a.detailTitle ?? a.title}</p>
              <p className="hl-tag-impact">{a.impact}</p>
              <p className="hl-tag-details">{a.details}</p>
              <div className="hl-tag-links">
                {a.fromUrl && <a href={a.fromUrl} target="_blank" rel="noreferrer">{host(a.fromUrl)} ↗</a>}
                {a.links?.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
                ))}
              </div>
              <span className="hl-tag-bar" />
            </motion.article>
          </AnimatePresence>
        </div>

        {/* Floor */}
        <motion.div className="hl-floor" style={{ x: floor }} aria-hidden />

        {/* Foreground: the queue, closest to the camera */}
        <motion.div className="hl-front-layer" style={{ x: front }} aria-hidden>
          <span className="hl-person" style={{ left: 140 }}><Traveller variant={0} /></span>
          <span className="hl-person" style={{ left: 980 }}><Traveller variant={2} /></span>
          <span className="hl-person hl-person-kid" style={{ left: 1120 }}><Traveller variant={3} /></span>
          <span className="hl-person" style={{ left: 2200 }}><Traveller variant={1} /></span>
          <span className="hl-person" style={{ left: 3300 }}><Traveller variant={0} /></span>
          <span className="hl-person" style={{ left: 4200 }}><Traveller variant={2} /></span>
          <span className="hl-stanchions" style={{ left: 420, width: 520 }}><i /><b /><i /><b /><i /></span>
          <span className="hl-stanchions" style={{ left: 2640, width: 520 }}><i /><b /><i /><b /><i /></span>
        </motion.div>

        {/* Your bag rides with you */}
        <div className="hl-mybag" aria-hidden>
          <svg viewBox="0 0 120 150">
            <rect x="44" y="6" width="32" height="22" rx="10" fill="none" strokeWidth="7" stroke="currentColor" className="hl-ink" />
            <rect x="10" y="24" width="100" height="112" rx="14" className="hl-my1" />
            <rect x="22" y="36" width="76" height="88" rx="8" className="hl-my2" />
            <path d="M10 64h100" className="hl-ink" strokeWidth="3" stroke="currentColor" />
            <rect x="48" y="56" width="24" height="16" rx="4" className="hl-ink" />
            <circle cx="30" cy="140" r="6" className="hl-ink" /><circle cx="90" cy="140" r="6" className="hl-ink" />
          </svg>
          <span className="hl-mytag">{code}</span>
        </div>

        {/* Where you are */}
        <div className="hl-hud">
          <span>CHECK-IN · HALL A</span>
          <span>DESK {pad2(desk + 1)} / {pad2(n)}</span>
          <span className="hl-hud-hint">SCROLL TO WALK ALONG THE COUNTER</span>
        </div>
      </div>
    </section>
  );
}
