"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { Flap } from "./Flap";
import { CODES, ease, host, jumpToStep, pad2, useStepFrom } from "./shared";

const shortName = (s: string) => s.replace("Waterloo Tech Week / ", "");

/**
 * Check-in · bag drop. Your roles are the bags. Scrolling brings each one to
 * the desk, prints its tag, opens its ticket, and sends it off on the belt.
 */
export function BagDrop() {
  const ref = useRef<HTMLElement>(null);
  const n = arrivals.length;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(p, { stiffness: 170, damping: 30, mass: 0.4 });
  const sel = useStepFrom(p, n);
  const a = arrivals[sel];
  const code = CODES[a.origin] ?? "AFA";

  // Bags are measured (their width changes on phones).
  const trackRef = useRef<HTMLDivElement>(null);
  const dims = useRef({ w: 212, step: 238, cw: 1180 });
  useEffect(() => {
    const el = trackRef.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const measure = () => {
      const bags = el.querySelectorAll<HTMLElement>(".bag");
      if (bags.length > 1) dims.current = { w: bags[0].offsetWidth, step: bags[1].offsetLeft - bags[0].offsetLeft, cw: box.clientWidth };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  // The active bag parks at the desk (centre); the belt eases between bags and dwells on each.
  const beltX = useTransform(smooth, (v) => {
    const t = Math.min(0.999, Math.max(0, v)) * n; // fractional step
    const k = Math.floor(t);
    const f = t - k;
    // Each step: arrive in the first 20%, dwell at the desk for 60%, leave in the last 20%.
    const smooth = (x: number) => x * x * (3 - 2 * x);
    const offset = f < 0.2 ? 0.5 * smooth(f / 0.2) - 0.5 : f > 0.8 ? 0.5 * smooth((f - 0.8) / 0.2) : 0;
    const i = Math.max(0, Math.min(n - 1, k + offset));
    const { w, step, cw } = dims.current;
    return cw / 2 - (w / 2 + i * step);
  });

  return (
    <section id="checkin" ref={ref} className="va-scene va-pinwrap va-pinwrap-drop">
      <div className="va-pin">
        <div className="wrap">
          <div className="va-scene-head">
            <span className="kicker">GATE A · CHECK-IN · EXPERIENCE</span>
            <small>Desk 4 · Bag {pad2(sel + 1)} / {pad2(n)} · Scroll to drop the next one</small>
          </div>

          <div className="va-desk">
            <div className="va-desk-sign">
              <span><i className="va-led" />CHECK-IN · DESK 4</span>
              <span>BAG DROP · {pad2(n)} BAGS</span>
            </div>

            <div className="va-counter" aria-hidden>
              <span className="va-counter-top" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={a.slug}
                  className="va-tagprint"
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.45, ease }}
                >
                  <span className="va-tagprint-code"><Flap value={code} length={3} perChar={40} stepMs={30} /></span>
                  <span className="va-tagprint-co">{shortName(a.from).toUpperCase()}</span>
                  <span className="va-tagprint-bar" />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="carousel va-carousel">
              <div className="belt-tex" aria-hidden />
              <motion.div className="belt-track va-belt-track" ref={trackRef} style={{ x: beltX }}>
                {arrivals.map((b, i) => (
                  <button
                    key={b.slug}
                    type="button"
                    className={`bag va-bag ${sel === i ? "sel" : ""} ${i < sel ? "dropped" : ""}`}
                    aria-pressed={sel === i}
                    onClick={() => jumpToStep(ref.current, i, n)}
                  >
                    {b.image ? <img className="b-img" src={b.image} alt="" loading="lazy" /> : <div className="b-img" />}
                    <span className="b-tag">{CODES[b.origin] ?? "AFA"}</span>
                    <div className="b-body">
                      <div className="b-from">{shortName(b.from)}</div>
                      <div className="b-title">{b.title}</div>
                      <div className="b-strip" aria-hidden />
                    </div>
                  </button>
                ))}
              </motion.div>
              <div className="belt-rollers" aria-hidden />
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={a.slug}
              className="va-ticket"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease }}
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
