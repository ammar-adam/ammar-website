"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { projects } from "@/data/departures";
import { ease, jumpToStep, pad2, SceneHead, shotFor, Suitcase, useStepFrom, Walker } from "./shared";

const INTRO = 0.2; // the tray rides through the machine, then items step

/**
 * 02 · Security. A lane: queue, divest table, X-ray, bag check. Your tray
 * goes through; the monitor shows what's inside (the projects) and the
 * officer lays each one out on the bag-check table.
 */
export function Security() {
  const ref = useRef<HTMLElement>(null);
  const n = projects.length;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Tray: divest table → into the machine → out onto bag check.
  const trayX = useTransform(p, [0, INTRO * 0.45, INTRO * 0.6, INTRO], ["0%", "190%", "190%", "380%"]);
  const queue = useTransform(p, [0, INTRO], ["0px", "26px"]);
  const scanning = useTransform(p, [INTRO * 0.4, INTRO * 0.5, INTRO * 0.7, INTRO * 0.8], [0, 1, 1, 0]);
  const phase = useStepFrom(p, 2, 0, INTRO);
  const sel = useStepFrom(p, n, INTRO, 1);
  const ready = phase === 1;
  const proj = projects[sel];
  const links = proj.seats[0]?.links ?? [];

  return (
    <section id="security" ref={ref} className="va-pinwrap va-pin-sec">
      <div className="va-pin">
        <div className="wrap">
          <SceneHead
            no="02"
            title="Security"
            where="Lane 2"
            sub="What I've built. Everything in the bag gets checked."
            hint={ready ? <>Item {pad2(sel + 1)} / {pad2(n)} · scroll to check the next</> : "Your tray is going through"}
            skip="security"
          />

          {/* The lane */}
          <div className="sc-stage" aria-hidden>
            <div className="sc-sign"><i className="va-led" />SECURITY · LANE 2 · LAPTOPS OUT</div>
            <motion.div className="sc-queue" style={{ x: queue }}>
              <span className="sc-person sc-person-1"><Walker variant={1} /></span>
              <span className="sc-person sc-person-2"><Walker /></span>
              <span className="sc-person sc-person-3"><Walker variant={1} /></span>
            </motion.div>
            <div className="sc-stanchions"><span /><i /><span /><i /><span /></div>

            <div className="sc-rollers sc-rollers-in" />
            <div className="sc-machine">
              <span className="sc-machine-label">X-RAY</span>
              <motion.span className="sc-machine-light" style={{ opacity: scanning }} />
              <span className="sc-curtain sc-curtain-l" /><span className="sc-curtain sc-curtain-r" />
            </div>
            <div className="sc-rollers sc-rollers-out" />
            <div className="sc-check"><span>BAG CHECK</span></div>

            <motion.div className="sc-tray" style={{ x: trayX }}>
              <Suitcase finish="navy" code="AA" className="sc-bag" />
            </motion.div>
            <div className="ci-floor" />
          </div>

          <div className="sc-panels">
            {/* X-ray monitor */}
            <div className="va-mon">
              <div className="va-mon-top">
                <span><i className="va-led" />X-RAY · LANE 2</span>
                <span className="va-mon-id">{ready ? `ITEM ${pad2(sel + 1)} / ${pad2(n)}` : "SCANNING"}</span>
              </div>
              <div className="va-screen">
                <div className="va-screen-grid" />
                <div className="va-xbag">
                  <span className="va-xbag-handle" />
                  {projects.map((q, i) => {
                    const on = ready && i === sel;
                    return (
                      <button
                        key={q.slug}
                        type="button"
                        className={`va-xitem va-xitem-${i} ${on ? "on" : ""} ${ready && !on ? "off" : ""}`}
                        onClick={() => jumpToStep(ref.current, i, n, INTRO, 1)}
                        aria-label={`Check ${q.name}`}
                        aria-pressed={on}
                      >
                        <img src={shotFor(q)} alt="" draggable={false} loading="lazy" />
                        <span className="va-xitem-reticle" aria-hidden><i /><i /><i /><i /></span>
                        <span className="va-xitem-tag">{pad2(i + 1)}</span>
                      </button>
                    );
                  })}
                </div>
                <span className="va-xscan" aria-hidden />
              </div>
            </div>

            {/* Bag-check table: the item, laid out whole */}
            <div className="sc-table">
              <div className="sc-table-head">
                <span>BAG CHECK</span>
                <span>{ready ? `ITEM ${pad2(sel + 1)} · CLEARED` : "WAITING FOR TRAY"}</span>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                {ready ? (
                  <motion.div
                    key={proj.slug}
                    className="sc-item"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease }}
                  >
                    <div className="sc-shot">
                      <img src={shotFor(proj)} alt={`${proj.name} screenshot`} />
                    </div>
                    <div className="sc-item-meta">
                      <span className="claim-tag">{proj.flightCode} · {proj.year}</span>
                      <span className={`sticker stat ${proj.status === "Boarding" ? "s-board" : "s-dep"}`}>{proj.status}</span>
                    </div>
                    <h3 className="sc-item-name">{proj.name}</h3>
                    <p className="sc-item-route">{proj.routeName}</p>
                    <p className="sc-item-note">{proj.shortDesc}</p>
                    <div className="sc-item-links">
                      {links.map((l) => (
                        <a key={l.url} className="btn" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="wait" className="sc-wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Four items inside. Keep scrolling.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
