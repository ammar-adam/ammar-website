"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import { projects } from "@/data/departures";
import { ease, jumpToStep, pad2, shotFor, useStepFrom } from "./shared";

/**
 * Security · the X-ray is the scene. Your bag is on the screen; the items
 * inside are the projects. Scroll (or click an item) to inspect each one.
 */
export function Security() {
  const ref = useRef<HTMLElement>(null);
  const n = projects.length;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(p, { stiffness: 150, damping: 28, mass: 0.45 });

  const INTRO = 0.1; // the bag slides onto the screen, then items step
  const bagX = useTransform(smooth, [0, INTRO], ["-115%", "0%"]);
  const bagIn = useTransform(smooth, [INTRO * 0.7, INTRO], [0, 1]);
  const waiting = useTransform(smooth, [0, INTRO * 0.8], [1, 0]);
  // Trays in the queue shuffle forward as the bag goes in.
  const queueX = useTransform(smooth, [0, INTRO], ["0%", "38%"]);
  const loaded = useStepFrom(p, 2, 0, INTRO) === 1;
  const sel = useStepFrom(p, n, INTRO, 1);
  const inside = useInView(ref, { amount: 0.1 });
  const active = inside && loaded;
  const proj = projects[sel];
  const links = proj.seats[0]?.links ?? [];

  return (
    <section id="security" ref={ref} className="va-scene va-pinwrap va-pinwrap-sec">
      <div className="va-pin">
        <div className="wrap">
          <div className="va-scene-head">
            <span className="kicker">GATE B · SECURITY · PROJECTS</span>
            <small aria-live="polite">{active ? `Item ${pad2(sel + 1)} of ${pad2(n)} · Scroll to inspect` : "Join the line · Lane 2"}</small>
          </div>

          {/* The line: stanchions and ribbon along the top */}
          <div className="va-line" aria-hidden>
            <span className="va-post" /><span className="va-ribbon" /><span className="va-post" /><span className="va-ribbon" /><span className="va-post" /><span className="va-ribbon" /><span className="va-post" />
            <span className="va-line-sign">LANE 2 · LAPTOPS OUT · LIQUIDS IN TRAYS</span>
          </div>

          <div className="va-xr">
            {/* Tray lane feeding the scanner */}
            <div className="va-lane" aria-hidden>
              <motion.div className="va-lane-trays" style={{ x: queueX }}>
                <span className="va-trayq va-trayq-bag"><i /><b>AA</b></span>
                <span className="va-trayq"><i /></span>
                <span className="va-trayq"><i /></span>
              </motion.div>
              <span className="va-lane-belt" />
            </div>

            {/* The X-ray monitor */}
            <div className="va-mon">
              <div className="va-mon-top">
                <span><i className="va-led" />X-RAY · LANE 2</span>
                <span className="va-mon-id">BAG AA-YYZ-2A</span>
              </div>
              <div className="va-screen">
                <div className="va-screen-grid" />
                <motion.div className="va-screen-wait" style={{ opacity: waiting }} aria-hidden>
                  <span>WAITING FOR BAG</span>
                  <i />
                </motion.div>
                <motion.div className="va-xbag" style={{ x: bagX, opacity: bagIn }}>
                  <span className="va-xbag-handle" aria-hidden />
                  {projects.map((q, i) => {
                    const on = active && i === sel;
                    return (
                      <button
                        key={q.slug}
                        type="button"
                        className={`va-xitem va-xitem-${i} ${on ? "on" : ""} ${active && !on ? "off" : ""}`}
                        onClick={() => jumpToStep(ref.current, i, n, INTRO, 1)}
                        aria-label={`Inspect ${q.name}`}
                        aria-pressed={on}
                      >
                        <img src={shotFor(q)} alt="" draggable={false} loading="lazy" />
                        <span className="va-xitem-reticle" aria-hidden><i /><i /><i /><i /></span>
                        <span className="va-xitem-tag">ITEM {pad2(i + 1)}</span>
                      </button>
                    );
                  })}
                </motion.div>
                <span className="va-xscan" aria-hidden />
              </div>
              <div className="va-mon-bottom">
                <span>ITEMS {pad2(n)}</span>
                <span>THREAT · NONE</span>
                <span className="va-mon-status">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={active ? proj.slug : "wait"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
                      {active ? `ITEM ${pad2(sel + 1)} · ${proj.name.toUpperCase()} · CLEARED` : "SCANNING"}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
            </div>

            {/* The inspection tray */}
            <div className="va-tray">
              <div className="va-tray-head">
                <span>INSPECTION TRAY</span>
                <span>{active ? `ITEM ${pad2(sel + 1)} / ${pad2(n)}` : "EMPTY"}</span>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                {active ? (
                  <motion.div
                    key={proj.slug}
                    className="va-tray-body"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.45, ease }}
                  >
                    <img className="va-tray-photo" src={shotFor(proj)} alt={`${proj.name} screenshot`} />
                    <div className="va-tray-meta">
                      <span className="claim-tag">{proj.flightCode} · {proj.year}</span>
                      <span className={`sticker stat ${proj.status === "Boarding" ? "s-board" : "s-dep"}`}>{proj.status}</span>
                    </div>
                    <h3 className="va-tray-name">{proj.name}</h3>
                    <p className="va-tray-route">{proj.routeName}</p>
                    <p className="va-tray-note">{proj.shortDesc}</p>
                    <div className="va-tray-links">
                      {links.map((l) => (
                        <a key={l.url} className="btn" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" className="va-tray-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <span>Scroll to send your bag through.</span>
                    <small>Four items inside. Each one opens here.</small>
                  </motion.div>
                )}
              </AnimatePresence>
              <ol className="va-tray-index" aria-hidden>
                {projects.map((q, i) => (
                  <li key={q.slug} className={active && i === sel ? "on" : active && i < sel ? "done" : ""}>{pad2(i + 1)}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
