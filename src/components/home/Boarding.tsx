"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Fade } from "@/components/shell/Reveal";
import { boardingPassConfig } from "@/data/boardingPass";
import { ease, SceneHead, SOCIALS } from "./shared";

const TAKEOFF_MS = 2600; // the resume opens once the plane is gone

/**
 * 04 · Boarding. The pass. Scanning the barcode boards you: laser, stamp, stub
 * torn, the sky climbs and the plane crosses the page. Then the resume opens.
 */
export function Boarding() {
  const [boarded, setBoarded] = useState(false);

  const scan = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new tab, etc.) behave normally.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (boarded) return;
    setBoarded(true);
    window.setTimeout(() => {
      // No "noopener" feature string: with it, window.open always returns null.
      const w = window.open(boardingPassConfig.resumeFileUrl, "_blank");
      if (w) w.opener = null;
      // If the browser blocks the delayed tab, open it here instead.
      else window.location.assign(boardingPassConfig.resumeFileUrl);
    }, TAKEOFF_MS);
  };

  useEffect(() => {
    if (!boarded) return;
    document.documentElement.dataset.takeoff = "1";
    const id = window.setTimeout(() => {
      delete document.documentElement.dataset.takeoff;
      setBoarded(false);
    }, 5200);
    return () => {
      window.clearTimeout(id);
      delete document.documentElement.dataset.takeoff;
    };
  }, [boarded]);

  return (
    <section id="boarding" className="va-boarding">
      <div className="wrap">
        <SceneHead
          no="04"
          title="Boarding"
          where="Gate D"
          sub="Resume and contact. Scan the barcode to board."
          hint={boarded ? "Boarded · enjoy the flight" : "Final call"}
        />

        <Fade amount={0.2}>
          <div className={`pass va-pass ${boarded ? "boarded" : ""}`}>
            <div className="pass-main">
              <div className="pm-head">
                <span className="pm-wm"><img src="/airport-icons/plane-side.svg" alt="" />AFA INTERNATIONAL</span>
                <span className="pm-cls">BOARDING PASS</span>
              </div>
              <div className="pass-route">
                <div>
                  <div className="pr-code">{boardingPassConfig.from}</div>
                  <div className="pr-lbl">Toronto</div>
                </div>
                <div className="pr-mid">→</div>
                <div className="pr-r">
                  <div className="pr-code">TBD</div>
                  <div className="pr-lbl">Next adventure</div>
                </div>
              </div>
              <div className="pass-fields">
                <div className="pass-field">
                  <div className="pf-k">Passenger</div>
                  <div className="pf-v">{boardingPassConfig.displayName}</div>
                </div>
                <div className="pass-field">
                  <div className="pf-k">Seat</div>
                  <div className="pf-v">2A</div>
                </div>
                <div className="pass-field">
                  <div className="pf-k">Status</div>
                  <div className="pf-v pf-accent">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span key={boarded ? "b" : "n"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
                        {boarded ? "Boarded" : "Boarding"}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <AnimatePresence>
                {boarded && (
                  <motion.span
                    className="va-stamp"
                    aria-hidden
                    initial={{ opacity: 0, scale: 1.8, rotate: -18 }}
                    animate={{ opacity: 1, scale: 1, rotate: -12 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 520, damping: 22, mass: 0.9 }}
                  >
                    BOARDED
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              className="pass-stub"
              animate={boarded ? { x: 36, y: 10, rotate: 4, opacity: 0.92 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 16 }}
            >
              <div className="ps-k">Passenger</div>
              <div className="ps-v">{boardingPassConfig.displayName}</div>
              <div className="ps-k">Contact</div>
              <div className="va-stub-links">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
                ))}
              </div>
              <a
                className={`scan-btn ${boarded ? "scanning" : ""}`}
                href={boardingPassConfig.resumeFileUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Scan boarding pass: open resume (PDF)"
                onClick={scan}
              >
                <span className="scan-frame">
                  <span className="ps-bar" />
                  <span className="scan-laser" />
                </span>
                <span className="scan-hint">{boarded ? "BOARDED · OPENING RESUME" : "SCAN FOR RESUME"}</span>
              </a>
            </motion.div>
          </div>
        </Fade>

        <footer className="va-foot">
          <span>Thanks for flying with me.</span>
          <a href="https://uwaterloo.network" target="_blank" rel="noreferrer">
            <img src="https://uwaterloo.network/icon.svg" alt="" />uwaterloo.network
          </a>
          <span>Toronto · Dubai · Karachi</span>
        </footer>
      </div>

      {/* Takeoff: the plane climbs out across the whole page */}
      <AnimatePresence>
        {boarded && (
          <motion.div className="va-takeoff" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <motion.img
              src="/airport-icons/plane-side.svg"
              alt=""
              initial={{ x: "-20vw", y: "40vh", rotate: 0, scale: 0.9 }}
              animate={{ x: "115vw", y: "-30vh", rotate: -16, scale: 1.3 }}
              transition={{ duration: 3.6, ease: [0.55, 0.05, 0.3, 1] }}
            />
            <motion.span className="va-takeoff-note" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6, ease }}>
              BOARDING COMPLETE · YYZ → TBD · ENJOY THE FLIGHT
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
