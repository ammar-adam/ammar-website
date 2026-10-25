"use client";

import "./sv.css";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ANCHORS, CUTS, LINES, SEG, useActive, type Line } from "./timeline";
import { S0Cold } from "./S0Cold";
import { S1Airports } from "./S1Airports";
import { S2CheckIn } from "./S2CheckIn";
import { S3Big } from "./S3Big";
import { S4Security } from "./S4Security";
import { S5Gate } from "./S5Gate";
import { S6Off } from "./S6Off";
import { S7Boarding } from "./S7Boarding";

/* Issue #20, the movie. One pinned stage inside a tall scroll track; scroll
   scrubs the timeline (t). Segments are ranges of t the camera travels
   through; cuts between them are glitch bands. */
export function SpiderVerse() {
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  // camera is smooth; content keys off the raw value so it never lags a hard stop
  const t = useSpring(scrollYProgress, { stiffness: 220, damping: 34, mass: 0.6, restDelta: 0.0005 });

  return (
    <main className="sv">
      <div className="track" ref={track}>
        {ANCHORS.map((a) => (
          <span key={a.id} id={a.id} className="anchor" style={{ top: `${a.t * 100}%` }} aria-hidden="true" />
        ))}
        <div className="stage">
          <Gated t={t} range={SEG.cold}><S0Cold t={t} /></Gated>
          <Gated t={t} range={SEG.airports}><S1Airports t={t} /></Gated>
          <Gated t={t} range={SEG.checkin}><S2CheckIn t={t} /></Gated>
          <Gated t={t} range={SEG.big}><S3Big t={t} /></Gated>
          <Gated t={t} range={SEG.security}><S4Security t={t} /></Gated>
          <Gated t={t} range={SEG.gate}><S5Gate t={t} /></Gated>
          <Gated t={t} range={SEG.off}><S6Off t={t} /></Gated>
          <Gated t={t} range={SEG.boarding}><S7Boarding t={t} /></Gated>

          <Narration t={t} />
          <GlitchCut t={t} />
          <Grain />
          <Nav t={t} />
        </div>
      </div>
    </main>
  );
}

/** Mounts a segment when t is near it, and warms every segment once the
    first paint has settled so later cuts do not pay a mount cost. */
function Gated({ t, range, children }: { t: MotionValue<number>; range: readonly [number, number]; children: React.ReactNode }) {
  const active = useActive(t, range);
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setWarm(true), 2500);
    return () => window.clearTimeout(id);
  }, []);
  return active || warm ? <>{children}</> : null;
}

function Narration({ t }: { t: MotionValue<number> }) {
  return (
    <div className="narration" aria-live="polite">
      {LINES.map((l) => (
        <Caption key={l.a} t={t} line={l} />
      ))}
    </div>
  );
}

function Caption({ t, line }: { t: MotionValue<number>; line: Line }) {
  const { a, b, text } = line;
  const f = 0.006;
  const opacity = useTransform(t, [a - f, a + f, b - f, b + f], [0, 1, 1, 0]);
  const step = useTransform(opacity, (v) => Math.round(v * 3) / 3);
  const y = useTransform(t, [a - f, a + f, b - f, b + f], [14, 0, -4, -18]);
  const ys = useTransform(y, (v) => Math.round(v / 4) * 4);
  const active = useActive(t, [a, b], 0.03);
  if (!active) return null;
  return (
    <motion.p className="cap" style={{ opacity: step, y: ys }}>
      {text}
    </motion.p>
  );
}

/** RGB-split slice band at every cut. */
function GlitchCut({ t }: { t: MotionValue<number> }) {
  const w = 0.008;
  const input: number[] = [];
  const output: number[] = [];
  for (const c of CUTS) {
    input.push(c - w, c - w * 0.5, c + w * 0.5, c + w);
    output.push(0, 1, 1, 0);
  }
  const opacity = useTransform(t, input, output);
  const active = useTransform(opacity, (v) => (v > 0.01 ? 1 : 0));
  return (
    <motion.div className="glitch" style={{ opacity, display: useTransform(active, (v) => (v ? "block" : "none")) }} aria-hidden="true">
      <div className="glitch-c" />
      <div className="glitch-m" />
      <div className="glitch-k" />
      <div className="glitch-slices" />
    </motion.div>
  );
}

function Grain() {
  return <div className="grain" aria-hidden="true" />;
}

function Nav({ t }: { t: MotionValue<number> }) {
  const w = useTransform(t, (v) => `${(v * 100).toFixed(2)}%`);
  return (
    <>
      <nav className="nav" aria-label="Jump to">
        <a className="nav-home" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          Issue #20
        </a>
        {ANCHORS.map((a) => (
          <a key={a.id} href={`#${a.id}`}>{a.label}</a>
        ))}
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
