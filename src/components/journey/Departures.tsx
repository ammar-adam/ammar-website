"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { arrivals } from "@/data/arrivals";
import { Flap } from "./Flap";
import { Fade } from "./Reveal";
import { Sign } from "./Sign";

const ease = [0.22, 1, 0.36, 1] as const;
const times = ["09:10", "11:35", "13:50", "15:05", "16:40", "18:20", "20:55"];

const shortName = (name: string) => name.replace("Waterloo Tech Week / ", "");

/** Experience as a departures list. Hover or tap a row and that flight boards. */
export function Departures() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="departures" className="stop">
      <Sign
        as="header"
        items={[{ href: "#departures", label: "Departures", sub: "Where I've worked", arrow: "→" }]}
        aside={<span>{arrivals.length} flights · 2022–2026</span>}
      />

      <Fade className="list" delay={0.15}>
        <div className="list-cols" aria-hidden>
          <span>Time</span><span>Destination</span><span>Role</span><span>City</span><span>Status</span>
        </div>
        <ol className="rows">
          {arrivals.map((a, i) => {
            const isOpen = open === i;
            return (
              <li key={a.slug} className={`row ${isOpen ? "is-open" : ""}`} onMouseEnter={() => setOpen(i)} onMouseLeave={() => setOpen(null)}>
                <button className="row-main" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                  <span className="r-time">{times[i]}</span>
                  <span className="r-dest">{shortName(a.from)}</span>
                  <span className="r-role">{a.title}</span>
                  <span className="r-city">{a.origin}</span>
                  <span className="r-status">
                    <Flap value={isOpen ? "Boarding" : "On time"} length={8} stagger={18} step={24} className="flap-list" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="row-detail"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease }}
                    >
                      <div className="row-detail-inner">
                        <p>{a.impact}</p>
                        <span className="row-meta">
                          {a.detailTitle ?? a.title}
                          {a.fromUrl && (
                            <> · <a href={a.fromUrl} target="_blank" rel="noreferrer">{shortName(a.from)} ↗</a></>
                          )}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ol>
      </Fade>
    </section>
  );
}
