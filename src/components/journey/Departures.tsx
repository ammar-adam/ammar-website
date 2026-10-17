"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import { arrivals } from "@/data/arrivals";
import { Flap } from "./Flap";

const ease = [0.22, 1, 0.36, 1] as const;

function status(i: number, active: number) {
  if (i < active) return "Departed";
  if (i === active) return "Boarding";
  return "Scheduled";
}

/**
 * Experience as a departures board. The section pins while you scroll; each
 * stretch of scroll boards the next flight and the previous one departs.
 */
export function Departures() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = arrivals.length;

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(n - 1, Math.max(0, Math.floor(p * n * 0.999)));
    setActive((cur) => (cur === next ? cur : next));
  });

  const jumpTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / n) * travel, behavior: "smooth" });
  };

  const a = arrivals[active];

  return (
    <section id="departures" ref={ref} className="departures" style={{ height: `${n * 62 + 100}svh` }}>
      <div className="dep-sticky">
        <div className="sec-head">
          <p className="eyebrow">Departures</p>
          <h2>Where I&apos;ve worked, <em>in order.</em></h2>
        </div>

        <div className="dep-grid">
          <div className="board">
            <div className="board-head">
              <span><i className="pl-dot" />Departures</span>
              <span className="board-count">
                {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
              </span>
            </div>
            <div className="board-cols" aria-hidden>
              <span>#</span><span>Company</span><span>Role</span><span>City</span><span>Status</span>
            </div>
            <ol className="board-rows">
              {arrivals.map((row, i) => {
                const st = status(i, active);
                return (
                  <li key={row.slug} className={`board-row is-${st.toLowerCase()}`}>
                    <button onClick={() => jumpTo(i)} aria-current={i === active ? "step" : undefined}>
                      <span className="br-no">{String(i + 1).padStart(2, "0")}</span>
                      <span className="br-co">{row.from.replace("Waterloo Tech Week / ", "")}</span>
                      <span className="br-role">{row.title}</span>
                      <span className="br-city">{row.origin}</span>
                      <span className="br-st">
                        <Flap value={st} length={9} stagger={20} step={28} className="flap-sm" />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="dep-detail">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.article
                key={a.slug}
                className="dd-card"
                initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -30, filter: "blur(6px)" }}
                transition={{ duration: 0.6, ease }}
              >
                {a.image && (
                  <div className="dd-photo">
                    <motion.img
                      src={a.image}
                      alt={a.from}
                      initial={{ scale: 1.12 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.4, ease }}
                    />
                    <span className="dd-tag">{a.origin}</span>
                  </div>
                )}
                <div className="dd-body">
                  <p className="dd-co">
                    {a.fromUrl ? <a href={a.fromUrl} target="_blank" rel="noreferrer">{a.from} ↗</a> : a.from}
                  </p>
                  <h3>{a.detailTitle ?? a.title}</h3>
                  <p className="dd-impact">{a.impact}</p>
                  <p className="dd-details">{a.details}</p>
                  {a.links && (
                    <div className="dd-links">
                      {a.links.map((l) => (
                        <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
