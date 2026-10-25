"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { Flap } from "@/components/home/Flap";
import { CODES, host, pad2 } from "@/components/home/shared";
import { useCamera, useViewport } from "./camera";
import { BeltBag, Traveller } from "./Figures";
import { GatePlane } from "./Figures";
import "./scene.css";
import "./checkin.css";

const ease = [0.22, 1, 0.36, 1] as const;
const shortName = (s: string) => s.replace("Waterloo Tech Week / ", "");
const n = arrivals.length;
const geo = (vw: number) => {
  const DESK_W = vw < 900 ? Math.round(vw * 0.86) : 560;
  const PAD = vw < 900 ? Math.round(vw * 0.07) : 360;
  return { DESK_W, PAD, WORLD: PAD * 2 + DESK_W * n };
};
const TAIL = 100; // svh covered by the next scene
const TRAVEL = n * 44 + 40;

/** 01 · Check-in hall. The camera pans along seven desks, one per role. */
export function CheckIn() {
  const ref = useRef<HTMLElement>(null);
  const vw = useViewport();
  const { DESK_W, PAD, WORLD } = geo(vw);
  const { camX, mid, back, floor, front, jump } = useCamera(ref, WORLD, vw, TAIL / (TRAVEL + TAIL));

  const [desk, setDesk] = useState(0);
  useMotionValueEvent(camX, "change", (c) => {
    const i = Math.round((c - PAD - DESK_W / 2) / DESK_W);
    const next = Math.max(0, Math.min(n - 1, i));
    setDesk((d) => (d === next ? d : next));
  });
  const a = arrivals[desk];
  const code = CODES[a.origin] ?? "AFA";

  return (
    <section id="checkin" ref={ref} className="scn hl" style={{ height: `${TRAVEL + TAIL}svh` }}>
      <div className="scn-stage">
        <div className="scn-ceiling" aria-hidden>
          <div className="scn-truss" />
          <motion.div className="scn-lights" style={{ x: back }}>
            {Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ left: `${i * 9}%` }} />)}
          </motion.div>
        </div>

        <motion.div className="hl-back" style={{ x: back }} aria-hidden>
          <div className="hl-sky" />
          <div className="hl-apron">
            <div className="hl-plane-wrap" style={{ left: "18%" }}><GatePlane /></div>
            <div className="hl-plane-wrap hl-plane-far" style={{ left: "64%" }}><GatePlane /></div>
          </div>
          <div className="hl-mullions" />
          <div className="hl-sill" />
        </motion.div>

        <motion.div className="hl-signs" style={{ x: back }} aria-hidden>
          <div className="scn-sign" style={{ left: "6%" }}><span className="scn-sign-arrow">↓</span> CHECK-IN · ROWS A–D</div>
          <div className="scn-sign scn-sign-title" style={{ left: "34%" }}>WHERE I&apos;VE WORKED <span className="scn-sign-sub">· seven desks, one per role</span></div>
          <div className="scn-sign" style={{ left: "74%" }}>SECURITY <span className="scn-sign-arrow">→</span></div>
        </motion.div>

        <div className="hl-beltwrap" aria-hidden>
          <motion.div className="hl-belt" style={{ x: mid }}>
            <div className="hl-belt-bags">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="hl-bbag-slot" style={{ ["--i" as string]: i }}><BeltBag tone={(i % 3) as 0 | 1 | 2} /></span>
              ))}
            </div>
          </motion.div>
        </div>

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
                <div className="hl-front"><span className="hl-no">{i + 1}</span><span className="hl-front-panel" /></div>
                <div className="hl-scale" />
                <button type="button" className="hl-desk-hit" onClick={() => jump(PAD + DESK_W * i + DESK_W / 2)} aria-label={`Desk ${i + 1}: ${b.from}`} />
              </div>
            );
          })}
        </motion.div>

        <div className="scn-dock">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={a.slug}
              className="scn-card"
              initial={{ clipPath: "inset(0 0 100% 0)", y: -10 }}
              animate={{ clipPath: "inset(0 0 0% 0)", y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.6, ease }}
            >
              <span className="scn-card-hole" />
              <header>
                <span className="scn-card-code">{code}</span>
                <span className="scn-card-meta">{a.origin.toUpperCase()} · DESK {pad2(desk + 1)} · BAG {pad2(desk + 1)}/{pad2(n)}</span>
              </header>
              <h2>{a.from}</h2>
              <p className="scn-card-role">{a.detailTitle ?? a.title}</p>
              <p className="scn-card-impact">{a.impact}</p>
              <p className="scn-card-details">{a.details}</p>
              <div className="scn-card-links">
                {a.fromUrl && <a href={a.fromUrl} target="_blank" rel="noreferrer">{host(a.fromUrl)} ↗</a>}
                {a.links?.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
                ))}
              </div>
              <span className="scn-card-bar" />
            </motion.article>
          </AnimatePresence>
        </div>

        <motion.div className="scn-floor" style={{ x: floor }} aria-hidden />

        <motion.div className="hl-front-layer" style={{ x: front }} aria-hidden>
          <span className="hl-person" style={{ left: 140 }}><Traveller variant={0} /></span>
          <span className="hl-person" style={{ left: 980 }}><Traveller variant={2} /></span>
          <span className="hl-person hl-person-kid" style={{ left: 1120 }}><Traveller variant={3} /></span>
          <span className="hl-person" style={{ left: 2200 }}><Traveller variant={1} /></span>
          <span className="hl-person" style={{ left: 3300 }}><Traveller variant={0} /></span>
          <span className="hl-person" style={{ left: 4200 }}><Traveller variant={2} /></span>
          <span className="scn-stanchions hl-stanchions" style={{ left: 420, width: 520 }}><i /><b /><i /><b /><i /></span>
          <span className="scn-stanchions hl-stanchions" style={{ left: 2640, width: 520 }}><i /><b /><i /><b /><i /></span>
        </motion.div>

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

        <div className="scn-hud">
          <span>01 · CHECK-IN · HALL A</span>
          <span>DESK {pad2(desk + 1)} / {pad2(n)}</span>
          <span className="scn-hud-hint">SCROLL TO WALK ALONG THE COUNTER</span>
        </div>
      </div>
    </section>
  );
}
