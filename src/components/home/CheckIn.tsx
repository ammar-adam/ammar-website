"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Fade } from "@/components/shell/Reveal";
import { arrivals } from "@/data/arrivals";
import { CODES, ease, host } from "./shared";

const shortName = (s: string) => s.replace("Waterloo Tech Week / ", "");
/* Three suitcase finishes, in the site's palette. */
const FINISH = ["navy", "oat", "amber", "navy", "oat", "navy", "amber"] as const;
const SIZE = ["l", "m", "l", "m", "s", "m", "l"] as const;

/**
 * Check-in · the counter. Your roles are the bags on it. Hover or tap one
 * and it lifts; its ticket appears beside the counter.
 */
export function CheckIn() {
  const [sel, setSel] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? sel;
  const a = arrivals[shown];
  const code = CODES[a.origin] ?? "AFA";

  return (
    <section id="checkin" className="va-scene va-ci">
      <div className="wrap">
        <Fade className="kicker" y={10} amount={0.4}>GATE A · CHECK-IN · WHERE I&apos;VE WORKED</Fade>

        <div className="va-counter-wrap">
          <ul className="va-bags" role="tablist" aria-label="Experience">
            {arrivals.map((b, i) => {
              const on = shown === i;
              return (
                <li key={b.slug}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={sel === i}
                    className={`va-case va-case-${FINISH[i]} va-case-${SIZE[i]} ${on ? "on" : ""}`}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    onClick={() => setSel(i)}
                  >
                    <span className="va-case-handle" aria-hidden />
                    <span className="va-case-body" aria-hidden>
                      <i className="va-case-lidline" />
                      <i className="va-case-lock" />
                    </span>
                    <span className="va-case-wheels" aria-hidden><i /><i /></span>
                    <span className="va-ctag" aria-hidden>
                      <span className="va-ctag-string" />
                      <span className="va-ctag-paper">
                        <b>{CODES[b.origin] ?? "AFA"}</b>
                        <small>{shortName(b.from)}</small>
                      </span>
                    </span>
                    <span className="sr-only">{b.from}, {b.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="va-countertop" aria-hidden><span /></div>
          <div className="va-counterfront" aria-hidden>
            <span className="va-counter-label">CHECK-IN · DESK 4</span>
            <span className="va-counter-label">{String(shown + 1).padStart(2, "0")} / {String(arrivals.length).padStart(2, "0")}</span>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={a.slug}
            className="va-ticket"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="va-ticket-l">
              <span className="claim-tag">{code} · {a.origin.toUpperCase()}</span>
              <div className="va-ticket-co">{a.from}</div>
              <div className="va-ticket-role">{a.detailTitle ?? a.title}</div>
            </div>
            <div className="va-ticket-r">
              <p className="va-ticket-impact">{a.impact}</p>
              <p className="va-ticket-details">{a.details}</p>
              <div className="va-ticket-links">
                {a.fromUrl && <a href={a.fromUrl} target="_blank" rel="noreferrer">{host(a.fromUrl)} ↗</a>}
                {a.links?.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
                ))}
              </div>
            </div>
            <div className="va-ticket-bar" aria-hidden />
          </motion.article>
        </AnimatePresence>
      </div>
    </section>
  );
}
