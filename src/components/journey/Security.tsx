"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/departures";

const ease = [0.22, 1, 0.36, 1] as const;

type Dims = { width: number; card: number; step: number; arch: number };
const initialDims: Dims = { width: 1200, card: 360, step: 420, arch: 300 };

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Maps scroll progress to a belt offset. The belt eases between items and
 * stops for a moment with each one inside the scanner.
 */
function beltX(p: number, n: number, d: Dims) {
  const cx = d.width / 2;
  const centered = (i: number) => cx - i * d.step - d.card / 2;
  const start = centered(0) + d.width * 0.62;
  const end = centered(n - 1) - d.width * 0.62;
  const stops = [start];
  for (let i = 0; i < n; i++) stops.push(centered(i), centered(i));
  stops.push(end);
  // Segments alternate move, dwell, move, dwell ... move.
  const segs = stops.length - 1;
  const t = Math.min(0.99999, Math.max(0, p)) * segs;
  const k = Math.floor(t);
  const f = t - k;
  return stops[k] + (stops[k + 1] - stops[k]) * smooth(f);
}

function hasImage(p: Project) {
  return /\.(png|jpe?g|webp)$/i.test(p.screenshot);
}

function TrayContent({ p }: { p: Project }) {
  return hasImage(p) ? (
    <img src={p.screenshot} alt="" draggable={false} />
  ) : (
    <div className="tray-fallback">
      <span>{p.name}</span>
      <small>{p.routeName}</small>
    </div>
  );
}

function Tray({ p, i, x, dims }: { p: Project; i: number; x: MotionValue<number>; dims: React.RefObject<Dims> }) {
  const clip = useTransform(x, (tx) => {
    const d = dims.current;
    const left = tx + i * d.step;
    const archL = d.width / 2 - d.arch / 2;
    const archR = d.width / 2 + d.arch / 2;
    const l = Math.min(d.card, Math.max(0, archL - left));
    const r = Math.min(d.card, Math.max(0, left + d.card - archR));
    return `inset(-4% ${r}px -4% ${l}px)`;
  });
  const cleared = useTransform(x, (tx) => {
    const d = dims.current;
    const center = tx + i * d.step + d.card / 2;
    return center < d.width / 2 - d.arch * 0.5 ? 1 : 0;
  });

  const href = p.seats[0]?.links?.[0]?.url;

  return (
    <div className="tray">
      <a className="tray-bin" href={href} target="_blank" rel="noreferrer" aria-label={`${p.name}: open project`}>
        <div className="tray-shot"><TrayContent p={p} /></div>
        <motion.div className="tray-shot tray-xray" style={{ clipPath: clip }} aria-hidden>
          <TrayContent p={p} />
        </motion.div>
      </a>
      <div className="tray-label">
        <span className="tray-name">{p.name}</span>
        <span className="tray-year">{p.year}</span>
        <motion.span className="tray-cleared" style={{ opacity: cleared }}>Cleared</motion.span>
      </div>
    </div>
  );
}

export function Security() {
  const ref = useRef<HTMLElement>(null);
  const beltRef = useRef<HTMLDivElement>(null);
  const dims = useRef<Dims>(initialDims);
  const n = projects.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useMotionValue(beltX(0, n, initialDims));
  const [active, setActive] = useState(0);

  const update = (p: number) => {
    const d = dims.current;
    const tx = beltX(p, n, d);
    x.set(tx);
    const nearest = Math.round((d.width / 2 - d.card / 2 - tx) / d.step);
    const next = Math.min(n - 1, Math.max(0, nearest));
    setActive((cur) => (cur === next ? cur : next));
  };

  useMotionValueEvent(scrollYProgress, "change", update);

  useEffect(() => {
    const el = beltRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      // Measure rendered boxes; the CSS sizes are clamp() expressions.
      const trays = el.querySelectorAll<HTMLElement>(".tray");
      const scanner = el.querySelector<HTMLElement>(".scanner");
      if (trays.length < 2 || !scanner) return;
      const card = trays[0].offsetWidth;
      const step = trays[1].offsetLeft - trays[0].offsetLeft;
      dims.current = { width: el.clientWidth, card, step, arch: scanner.offsetWidth };
      update(scrollYProgress.get());
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const p = projects[active];
  const rollers = useTransform(x, (tx) => `${tx}px 0`);

  return (
    <section id="security" ref={ref} className="security" style={{ height: `${n * 70 + 120}svh` }}>
      <div className="sec-sticky">
        <div className="sec-head">
          <p className="eyebrow">Security</p>
          <h2>Things I&apos;ve built. <em>Bags through the scanner.</em></h2>
        </div>

        <div className="belt" ref={beltRef}>
          <div className="scanner" aria-hidden>
            <div className="scanner-hood"><span>X-ray</span><i className="scanner-led" /></div>
            <div className="scanner-tunnel"><i className="scanner-beam" /></div>
            <div className="scanner-curtain" />
          </div>
          <motion.div className="belt-track" style={{ x }}>
            {projects.map((proj, i) => (
              <Tray key={proj.slug} p={proj} i={i} x={x} dims={dims} />
            ))}
          </motion.div>
          <motion.div className="belt-rollers" style={{ backgroundPosition: rollers }} aria-hidden />
        </div>

        <div className="monitor">
          <div className="monitor-head">
            <span>Bag {String(active + 1).padStart(2, "0")} of {String(n).padStart(2, "0")}</span>
            <span className="monitor-dots" aria-hidden>
              {projects.map((q, i) => <i key={q.slug} className={i <= active ? "on" : ""} />)}
            </span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={p.slug}
              className="monitor-body"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease }}
            >
              <div className="monitor-title">
                <h3>{p.name}</h3>
                <span>{p.routeName}</span>
              </div>
              <p>{p.shortDesc}</p>
              <div className="monitor-links">
                {p.seats[0]?.links?.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
