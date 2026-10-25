"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { boardingPassConfig } from "@/data/boardingPass";
import { SOCIALS } from "@/components/home/shared";
import { BeltBag, GatePlane, Traveller } from "./Figures";
import "./scene.css";
import "./gate.css";

const TAKEOFF_MS = 3400; // the resume opens once the plane has gone

/**
 * 04 · Gate D. Your plane at the bridge, the gate desk, the boarding pass in
 * your hand. Scan it: the bridge pulls back, the plane rolls and climbs out
 * of the window, and the resume opens.
 */
export function Gate() {
  const [boarded, setBoarded] = useState(false);

  const scan = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (boarded) return;
    setBoarded(true);
    window.setTimeout(() => {
      const w = window.open(boardingPassConfig.resumeFileUrl, "_blank");
      if (w) w.opener = null;
      else window.location.assign(boardingPassConfig.resumeFileUrl);
    }, TAKEOFF_MS);
  };

  return (
    <section id="boarding" className={`scn gt ${boarded ? "boarded" : ""}`}>
      <div className="scn-stage gt-stage">
        <div className="scn-ceiling" aria-hidden>
          <div className="scn-truss" />
          <div className="scn-lights">{Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ left: `${i * 9}%` }} />)}</div>
        </div>

        {/* the window: sky, apron, your plane */}
        <div className="gt-glass" aria-hidden>
          <div className="gt-sky"><span className="gt-cloud gt-cloud-1" /><span className="gt-cloud gt-cloud-2" /><span className="gt-cloud gt-cloud-3" /></div>
          <div className="gt-apron" />
          <motion.div className="gt-bridge" animate={boarded ? { scaleX: 0.3 } : { scaleX: 1 }} transition={{ duration: 0.9, ease: [0.6, 0, 0.3, 1] }} />
          <motion.div
            className="gt-plane"
            animate={boarded ? { x: "95vw", y: "-46vh", rotate: -9 } : { x: 0, y: 0, rotate: 0 }}
            transition={{ duration: 3.2, delay: 0.5, ease: [0.55, 0, 0.3, 1] }}
          >
            <GatePlane bridge={false} />
          </motion.div>
          <div className="gt-mullions" />
        </div>

        <div className="gt-signs" aria-hidden>
          <div className="scn-sign" style={{ left: "4%" }}><span className="scn-sign-arrow">↓</span> GATE D</div>
          <div className="scn-sign scn-sign-title" style={{ left: "30%" }}>{boarded ? "BOARDING COMPLETE" : "NOW BOARDING"} <span className="scn-sign-sub">· YYZ → TBD · seat 2A</span></div>
        </div>

        {/* gate desk with its screen */}
        <div className="gt-desk" aria-hidden>
          <div className="gt-desk-screen">
            <span className="gt-ds-top"><i className="scn-led" />GATE D</span>
            <span className="gt-ds-route">YYZ → TBD</span>
            <span className="gt-ds-row"><span>AFA 001</span><span>{boarded ? "DEPARTED" : "BOARDING"}</span></span>
            <span className="gt-ds-row dim"><span>SEAT 2A</span><span>GROUP 1</span></span>
          </div>
          <span className="gt-desk-pole" />
          <div className="gt-desk-top" />
          <div className="gt-desk-front"><span>D</span></div>
          <span className="gt-agent"><Traveller variant={1} /></span>
        </div>

        <div className="scn-floor gt-floor" aria-hidden />

        {/* seats in the foreground */}
        <div className="gt-seats" aria-hidden>
          {Array.from({ length: 7 }).map((_, i) => <span key={i} className="gt-seat" style={{ left: `${2 + i * 9}%` }} />)}
          <span className="gt-seatbag" style={{ left: "12%" }}><BeltBag tone={1} /></span>
          <span className="gt-seatbag" style={{ left: "48%" }}><BeltBag tone={2} /></span>
          <span className="gt-waiting" style={{ left: "30%" }}><Traveller variant={2} /></span>
        </div>

        {/* the boarding pass, in your hand */}
        <div className="gt-pass-wrap">
          <div className="pass gt-pass">
            <div className="pass-main">
              <div className="pm-head">
                <span className="pm-wm"><img src="/airport-icons/plane-side.svg" alt="" />AFA INTERNATIONAL</span>
                <span className="pm-cls">BOARDING PASS</span>
              </div>
              <div className="pass-route">
                <div><div className="pr-code">{boardingPassConfig.from}</div><div className="pr-lbl">Toronto</div></div>
                <div className="pr-mid">→</div>
                <div className="pr-r"><div className="pr-code">TBD</div><div className="pr-lbl">Next adventure</div></div>
              </div>
              <div className="pass-fields">
                <div className="pass-field"><div className="pf-k">Passenger</div><div className="pf-v">{boardingPassConfig.displayName}</div></div>
                <div className="pass-field"><div className="pf-k">Seat</div><div className="pf-v">2A</div></div>
                <div className="pass-field"><div className="pf-k">Status</div><div className="pf-v pf-accent">{boarded ? "Boarded" : "Boarding"}</div></div>
              </div>
              <AnimatePresence>
                {boarded && (
                  <motion.span className="gt-stamp" aria-hidden initial={{ opacity: 0, scale: 1.8, rotate: -18 }} animate={{ opacity: 1, scale: 1, rotate: -12 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 520, damping: 22, mass: 0.9 }}>
                    BOARDED
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <motion.div className="pass-stub" animate={boarded ? { x: 30, y: 10, rotate: 4, opacity: 0.92 } : { x: 0, y: 0, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 140, damping: 16 }}>
              <div className="ps-k">Passenger</div>
              <div className="ps-v">{boardingPassConfig.displayName}</div>
              <div className="ps-k">Contact</div>
              <div className="gt-stub-links">
                {SOCIALS.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>)}
              </div>
              <a className={`scan-btn ${boarded ? "scanning" : ""}`} href={boardingPassConfig.resumeFileUrl} target="_blank" rel="noreferrer" aria-label="Scan boarding pass: open resume (PDF)" onClick={scan}>
                <span className="scan-frame"><span className="ps-bar" /><span className="scan-laser" /></span>
                <span className="scan-hint">{boarded ? "BOARDED · OPENING RESUME" : "SCAN FOR RESUME"}</span>
              </a>
            </motion.div>
          </div>
        </div>

        <div className="scn-hud">
          <span>04 · GATE D · BOARDING</span>
          <span>{boarded ? "DEPARTED · ENJOY THE FLIGHT" : "FINAL CALL"}</span>
          <span className="scn-hud-hint">SCAN THE BARCODE TO BOARD</span>
        </div>

        <footer className="gt-foot">
          <span>Thanks for flying with me.</span>
          <a href="https://uwaterloo.network" target="_blank" rel="noreferrer"><img src="https://uwaterloo.network/icon.svg" alt="" />uwaterloo.network</a>
          <span>Toronto · Dubai · Karachi</span>
        </footer>
      </div>
    </section>
  );
}
