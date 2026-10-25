"use client";

import "./sv.css";
import { useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ANCHORS, CUTS, LINES, SEG, glitchFrame, useActive, useVW, type Line } from "./timeline";
import { Film } from "./Film";
import { S0Cold } from "./S0Cold";
import { S1Airports } from "./S1Airports";
import { S2CheckIn } from "./S2CheckIn";
import { S3Big } from "./S3Big";
import { S4Security } from "./S4Security";
import { S5Gate } from "./S5Gate";
import { S6Off } from "./S6Off";
import { S7Boarding } from "./S7Boarding";

/* Ammar's intro, the movie. One pinned stage inside a tall scroll track;
   scroll scrubs the timeline (t). Segments are ranges of t the camera travels
   through; cuts between them are hard, with a short sliced-picture glitch. */
export function SpiderVerse() {
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const t = useSpring(scrollYProgress, { stiffness: 220, damping: 34, mass: 0.6, restDelta: 0.0005 });
  // caption parallax: the lag between the camera spring and the raw scroll
  const par = useTransform([t, scrollYProgress], ([a, b]) => Math.max(-10, Math.min(10, ((a as number) - (b as number)) * 600)));

  return (
    <main className="sv">
      <div className="track" ref={track}>
        {ANCHORS.map((a) => (
          <span key={a.id} id={a.id} className="anchor" style={{ top: `${a.t * 100}%` }} aria-hidden="true" />
        ))}
        <div className="stage">
          <Film t={t} />
          <Gated t={t} range={SEG.cold}><S0Cold t={t} /></Gated>
          <Gated t={t} range={SEG.airports}><S1Airports t={t} /></Gated>
          <Gated t={t} range={SEG.checkin}><S2CheckIn t={t} /></Gated>
          <Gated t={t} range={SEG.big}><S3Big t={t} /></Gated>
          <Gated t={t} range={SEG.security}><S4Security t={t} /></Gated>
          <Gated t={t} range={SEG.gate}><S5Gate t={t} /></Gated>
          <Gated t={t} range={SEG.off}><S6Off t={t} /></Gated>
          <Gated t={t} range={SEG.boarding}><S7Boarding t={t} /></Gated>

          <Narration t={t} par={par} />
          <GlitchCut t={t} />
          <Nav t={t} />
        </div>
      </div>
    </main>
  );
}

/** Mounts the current segment and its neighbours only. */
function Gated({ t, range, children }: { t: MotionValue<number>; range: readonly [number, number]; children: React.ReactNode }) {
  const active = useActive(t, range);
  return active ? <>{children}</> : null;
}

function Narration({ t, par }: { t: MotionValue<number>; par: MotionValue<number> }) {
  const vw = useVW();
  return (
    <div className="narration" aria-live="polite">
      {LINES.map((l) => (
        <Caption key={l.a} t={t} par={par} line={l} mobile={vw < 720} />
      ))}
    </div>
  );
}

function Caption({ t, par, line, mobile }: { t: MotionValue<number>; par: MotionValue<number>; line: Line; mobile: boolean }) {
  const { a, b, text } = line;
  const f = 0.004;
  const opacity = useTransform(t, [a - f, a + f, b - f, b + f], [0, 1, 1, 0]);
  const step = useTransform(opacity, (v) => Math.round(v * 3) / 3);
  const rise = useTransform(t, [a - f, a + f, b - f, b + f], [10, 0, -3, -12]);
  const y = useTransform([rise, par], ([r, p]) => Math.round(((r as number) + (p as number)) / 3) * 3);
  const active = useActive(t, [a, b], 0.03);
  if (!active) return null;
  const top = mobile && line.mobileTop ? "9vh" : line.y;
  const left = mobile ? (line.align === "center" ? "50%" : "5vw") : line.x;
  return (
    <motion.p className={`cap ${line.align === "center" ? "cap-center" : ""}`} style={{ opacity: step, y, left, top }}>
      {text}
    </motion.p>
  );
}

/* Cyan / magenta slivers at the slice edges during a cut. */
const SLICES: { top: number; h: number; x: number; c: "c" | "m" }[][] = [
  [],
  [{ top: 18, h: 1.2, x: -6, c: "c" }, { top: 55, h: 0.8, x: 6, c: "m" }, { top: 70, h: 1.4, x: -6, c: "c" }],
  [{ top: 10, h: 1, x: 6, c: "m" }, { top: 40, h: 1.4, x: -6, c: "c" }, { top: 80, h: 0.8, x: 6, c: "m" }],
  [{ top: 25, h: 1.2, x: -6, c: "m" }, { top: 50, h: 0.6, x: 6, c: "c" }, { top: 85, h: 1.2, x: -6, c: "m" }],
  [{ top: 35, h: 1, x: 6, c: "c" }, { top: 65, h: 1.2, x: -6, c: "m" }, { top: 95, h: 0.8, x: 6, c: "c" }],
  [],
];

function GlitchCut({ t }: { t: MotionValue<number> }) {
  const frame = useTransform(t, (v) => {
    for (const c of CUTS) { const f = glitchFrame(v, c); if (f >= 0) return f; }
    return -1;
  });
  return (
    <div className="glitch" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <Sliver key={i} frame={frame} i={i} />
      ))}
    </div>
  );
}

function Sliver({ frame, i }: { frame: MotionValue<number>; i: number }) {
  const get = (f: number) => (f > 0 ? SLICES[f][i] : undefined);
  const top = useTransform(frame, (f) => `${get(f)?.top ?? 0}%`);
  const height = useTransform(frame, (f) => `${get(f)?.h ?? 0}%`);
  const x = useTransform(frame, (f) => get(f)?.x ?? 0);
  const opacity = useTransform(frame, (f) => (get(f) ? 0.8 : 0));
  const background = useTransform(frame, (f) => (get(f)?.c === "m" ? "#ff2e88" : "#19d9ff"));
  return <motion.div className="sliver" style={{ top, height, x, opacity, background }} />;
}

function Nav({ t }: { t: MotionValue<number> }) {
  const w = useTransform(t, (v) => `${(v * 100).toFixed(2)}%`);
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className={`nav ${open ? "open" : ""}`} aria-label="Jump to">
        <a className="nav-home" href="#top" onClick={(e) => { e.preventDefault(); setOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          Ammar Adam
        </a>
        <button type="button" className="nav-menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>Menu</button>
        <div className="nav-links">
          {ANCHORS.map((a) => (
            <a key={a.id} href={`#${a.id}`} onClick={() => setOpen(false)}>{a.label}</a>
          ))}
        </div>
      </nav>
      <div className="progress" aria-hidden="true">
        <motion.div className="progress-bar" style={{ width: w }} />
        {CUTS.map((c) => (
          <span key={c} className="progress-cut" style={{ left: `${c * 100}%` }} />
        ))}
      </div>
    </>
  );
}
