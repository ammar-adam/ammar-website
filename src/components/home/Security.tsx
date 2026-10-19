"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Fade } from "@/components/shell/Reveal";
import { projects } from "@/data/departures";
import { ease, pad2, shotFor } from "./shared";

/**
 * Security · one object: the X-ray screen. Your bag is on it; the four scans
 * inside are the projects. Hover one and it scans amber; click and the screen
 * opens it: the real screenshot fills the screen with its details.
 */
export function Security() {
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const n = projects.length;
  const focus = open ?? hover;
  const current = focus === null ? null : projects[focus];

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section id="security" className="va-scene va-sec">
      <div className="wrap">
        <Fade className="kicker" y={10} amount={0.4}>GATE B · SECURITY · WHAT I&apos;VE BUILT</Fade>

        <Fade className="va-mon" amount={0.25} y={24}>
          <div className="va-mon-top">
            <span><i className="va-led" />X-RAY · LANE 2</span>
            <span className="va-mon-id">BAG AA-YYZ-2A · {pad2(n)} ITEMS</span>
          </div>

          <div className={`va-screen ${open !== null ? "is-open" : ""}`}>
            <div className="va-screen-grid" aria-hidden />
            <div className="va-xbag" aria-hidden={open !== null}>
              <span className="va-xbag-handle" aria-hidden />
              {projects.map((q, i) => {
                const on = focus === i;
                return (
                  <button
                    key={q.slug}
                    type="button"
                    className={`va-xitem va-xitem-${i} ${on ? "on" : ""} ${focus !== null && !on ? "off" : ""}`}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    onClick={() => setOpen(i)}
                    aria-label={`Open ${q.name}`}
                    tabIndex={open === null ? 0 : -1}
                  >
                    <img src={shotFor(q)} alt="" draggable={false} loading="lazy" />
                    <span className="va-xitem-reticle" aria-hidden><i /><i /><i /><i /></span>
                    <span className="va-xitem-tag">{pad2(i + 1)} · {q.name.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
            <span className="va-xscan" aria-hidden />

            <AnimatePresence>
              {open !== null && (
                <motion.div
                  key={projects[open].slug}
                  className="va-open"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease }}
                >
                  <motion.img
                    src={shotFor(projects[open])}
                    alt={`${projects[open].name} screenshot`}
                    initial={{ scale: 1.06 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.2, ease }}
                  />
                  <div className="va-open-bar">
                    <div className="va-open-text">
                      <span className="va-open-no">ITEM {pad2(open + 1)} · {projects[open].flightCode} · {projects[open].year}</span>
                      <h3>{projects[open].name}</h3>
                      <p>{projects[open].shortDesc}</p>
                    </div>
                    <div className="va-open-actions">
                      {(projects[open].seats[0]?.links ?? []).map((l) => (
                        <a key={l.url} className="btn" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                      ))}
                      <button type="button" className="btn va-open-close" onClick={() => setOpen(null)}>← Back to scan</button>
                    </div>
                  </div>
                  <div className="va-open-nav" aria-label="Other items">
                    {projects.map((q, i) => (
                      <button key={q.slug} type="button" className={i === open ? "on" : ""} onClick={() => setOpen(i)} aria-label={q.name}>{pad2(i + 1)}</button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="va-mon-bottom">
            <span>THREAT · NONE</span>
            <span className="va-mon-status">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={current ? current.slug + (open !== null ? "o" : "h") : "idle"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                  {current ? `${open !== null ? "OPENED" : "INSPECTING"} · ${current.name.toUpperCase()} · CLEARED` : "HOVER AN ITEM · CLICK TO OPEN"}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
        </Fade>
      </div>
    </section>
  );
}
