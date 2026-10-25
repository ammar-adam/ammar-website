"use client";

import { memo } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { figureAt, stepOf, BEATS, SWINGS, type FigureState, type Pose, type SwingState } from "./geometry";
import { plateForBeat, plateOf, type Shot } from "./plates";
import { project, type Cam } from "./camera";

/* ------------------------------------------------------------------ */
/* Key drawings as filled shapes: tapered limbs, mitten hands, sneakers,
   a hood, a backpack with a strap. ViewBox 0 0 120 170; the hand holding
   the line is at (60, 6) for attached poses.                            */

type Pt = [number, number];

/** A tapered limb through a polyline, as one filled path. */
function limb(pts: Pt[], w: number[]): string {
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const nx = -dy * w[i];
    const ny = dx * w[i];
    left.push([pts[i][0] + nx, pts[i][1] + ny]);
    right.push([pts[i][0] - nx, pts[i][1] - ny]);
  }
  const f = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  return `M ${f(left[0])} ${left.slice(1).map((p) => `L ${f(p)}`).join(" ")} L ${f(right[right.length - 1])} ${right.slice(0, -1).reverse().map((p) => `L ${f(p)}`).join(" ")} Z`;
}

interface Joints {
  head: Pt;
  tilt?: number; // degrees, hood lean
  neck: Pt;
  hip: Pt;
  armL: Pt[]; // shoulder, elbow, hand
  armR: Pt[];
  legL: Pt[]; // hip, knee, foot
  legR: Pt[];
  line?: Pt; // hand on the web line
}

function Body({ j, mirror = false }: { j: Joints; mirror?: boolean }) {
  const torso = limb([j.neck, j.hip], [12, 9]);
  const arm = (a: Pt[]) => limb(a, [6.5, 5, 4]);
  const leg = (l: Pt[]) => limb(l, [7, 5.5, 4.5]);
  const bagC: Pt = [j.neck[0] + (j.hip[0] - j.neck[0]) * 0.4 + (mirror ? -11 : 11), j.neck[1] + (j.hip[1] - j.neck[1]) * 0.4];
  const shoe = (l: Pt[]) => {
    const f = l[l.length - 1];
    const k = l[l.length - 2];
    const a = Math.atan2(f[1] - k[1], f[0] - k[0]);
    const deg = Math.round((a * 180) / Math.PI);
    return (
      <g transform={`translate(${f[0]} ${f[1]}) rotate(${deg})`}>
        <rect x={-4} y={-5} width={16} height={10} rx={4} />
        <rect x={-4} y={2} width={16} height={3.5} rx={1.5} fill="var(--sole, currentColor)" />
      </g>
    );
  };
  const hand = (a: Pt[]) => <circle cx={a[2][0]} cy={a[2][1]} r={5} />;
  return (
    <g fill="var(--fill, currentColor)">
      {/* back arm and back leg first */}
      <path d={arm(j.armR)} />
      {hand(j.armR)}
      <path d={leg(j.legR)} />
      {shoe(j.legR)}
      {/* backpack */}
      <rect x={bagC[0] - 9} y={bagC[1] - 12} width={18} height={26} rx={6} />
      <path d={torso} />
      <path d={limb([[j.neck[0] - 5, j.neck[1] + 2], [j.hip[0] - 3, j.hip[1] - 4]], [2, 2])} fill="var(--strap, currentColor)" />
      {/* front leg, front arm */}
      <path d={leg(j.legL)} />
      {shoe(j.legL)}
      <path d={arm(j.armL)} />
      {hand(j.armL)}
      {/* hood + head */}
      <g transform={`translate(${j.head[0]} ${j.head[1]}) rotate(${j.tilt ?? 0})`}>
        <path d="M -14 4 C -15 -10 -7 -16 0 -16 C 8 -16 15 -9 14 4 C 13 10 8 13 0 13 C -8 13 -13 10 -14 4 Z" />
        <ellipse cx={mirror ? -6 : 6} cy={-1} rx={5.2} ry={4} fill="var(--lens, currentColor)" />
        <ellipse cx={mirror ? 3 : -3} cy={0} rx={3} ry={2.6} fill="var(--lens, currentColor)" opacity={0.85} />
      </g>
      {j.line && <path d={limb([j.line, j.armL[0]], [3, 5])} opacity={0} />}
    </g>
  );
}

const J: Record<Exclude<Pose, null>, Joints> = {
  crouch: { head: [56, 54], tilt: -10, neck: [58, 66], hip: [62, 96], armL: [[60, 68], [46, 84], [50, 100]], armR: [[60, 6], [60, 30], [58, 48]], legL: [[62, 96], [42, 108], [46, 132]], legR: [[62, 96], [76, 110], [62, 134]] },
  drop: { head: [60, 56], tilt: 0, neck: [60, 70], hip: [62, 106], armL: [[60, 72], [42, 92], [32, 110]], armR: [[60, 6], [60, 40], [60, 58]], legL: [[62, 106], [46, 132], [38, 158]], legR: [[62, 106], [56, 138], [52, 164]] },
  bottom: { head: [106, 58], tilt: 60, neck: [94, 66], hip: [58, 54], armL: [[90, 70], [84, 92], [70, 104]], armR: [[60, 6], [54, 32], [62, 50]], legL: [[58, 54], [76, 78], [60, 98]], legR: [[58, 54], [88, 80], [80, 102]] },
  rise: { head: [84, 50], tilt: 30, neck: [74, 60], hip: [54, 92], armL: [[72, 62], [94, 76], [88, 98]], armR: [[60, 6], [64, 30], [66, 48]], legL: [[54, 92], [72, 102], [60, 122]], legR: [[54, 92], [78, 108], [72, 128]] },
  release: { head: [62, 48], tilt: 12, neck: [62, 62], hip: [76, 94], armL: [[64, 64], [90, 46], [112, 30]], armR: [[46, 10], [52, 40], [58, 58]], legL: [[76, 94], [96, 120], [92, 150]], legR: [[76, 94], [60, 124], [48, 152]] },
  apex: { head: [60, 140], tilt: 180, neck: [60, 126], hip: [60, 88], armL: [[58, 122], [30, 106], [14, 118]], armR: [[62, 122], [90, 108], [106, 120]], legL: [[60, 88], [36, 56], [26, 22]], legR: [[60, 88], [86, 56], [98, 22]] },
  land: { head: [60, 90], tilt: 0, neck: [60, 104], hip: [60, 124], armL: [[58, 106], [34, 128], [26, 158]], armR: [[62, 106], [86, 128], [94, 158]], legL: [[60, 124], [30, 138], [20, 164]], legR: [[60, 124], [90, 138], [100, 164]] },
  low: { head: [64, 100], tilt: -8, neck: [62, 114], hip: [56, 138], armL: [[60, 118], [40, 138], [44, 164]], armR: [[64, 118], [84, 134], [88, 150]], legL: [[56, 138], [36, 150], [28, 164]], legR: [[56, 138], [80, 150], [92, 164]] },
  stand: { head: [60, 72], tilt: 0, neck: [60, 86], hip: [60, 118], armL: [[58, 90], [44, 112], [48, 128]], armR: [[62, 90], [78, 112], [74, 126]], legL: [[60, 118], [48, 142], [44, 164]], legR: [[60, 118], [72, 142], [70, 164]] },
  runA: { head: [68, 60], tilt: 14, neck: [66, 76], hip: [52, 106], armL: [[64, 80], [90, 92], [100, 74]], armR: [[64, 80], [40, 96], [24, 86]], legL: [[52, 106], [80, 120], [90, 150]], legR: [[52, 106], [30, 124], [14, 150]] },
  runB: { head: [68, 62], tilt: 14, neck: [66, 78], hip: [52, 108], armL: [[64, 82], [84, 100], [78, 118]], armR: [[64, 82], [42, 88], [26, 100]], legL: [[52, 108], [66, 138], [70, 164]], legR: [[52, 108], [32, 134], [44, 160]] },
  smear: { head: [110, 50], tilt: 70, neck: [96, 58], hip: [30, 70], armL: [[90, 64], [100, 90], [96, 110]], armR: [[60, 6], [52, 30], [62, 44]], legL: [[30, 70], [50, 98], [40, 118]], legR: [[30, 70], [40, 102], [26, 122]] },
};

const POSE_IDS = Object.keys(J) as Array<Exclude<Pose, null>>;

/** The key drawings as symbols, once, plus the masks for the cel shadow and rim. */
export const PoseDefs = memo(function PoseDefs() {
  return (
    <svg width="0" height="0" className="sv-defs" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="figDots" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="1.3" fill="#fff" />
        </pattern>
        <linearGradient id="shadeL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.42" stopColor="#000" />
          <stop offset="0.52" stopColor="#fff" />
        </linearGradient>
        <linearGradient id="shadeR" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0.42" stopColor="#000" />
          <stop offset="0.52" stopColor="#fff" />
        </linearGradient>
        <linearGradient id="bandL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.36" stopColor="#000" />
          <stop offset="0.44" stopColor="#fff" />
          <stop offset="0.52" stopColor="#000" />
        </linearGradient>
        <linearGradient id="bandR" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0.36" stopColor="#000" />
          <stop offset="0.44" stopColor="#fff" />
          <stop offset="0.52" stopColor="#000" />
        </linearGradient>
        <mask id="shadowKeyLeft" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#shadeL)" /></mask>
        <mask id="shadowKeyRight" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#shadeR)" /></mask>
        <mask id="rimKeyLeft" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#shadeR)" /></mask>
        <mask id="rimKeyRight" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#shadeL)" /></mask>
        <mask id="bandKeyLeft" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#bandL)" /></mask>
        <mask id="bandKeyRight" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#bandR)" /></mask>
        {POSE_IDS.map((id) => (
          <symbol key={id} id={`pose-${id}`} viewBox="0 0 120 170" overflow="visible">
            <Body j={J[id]} />
          </symbol>
        ))}
      </defs>
    </svg>
  );
});

/* ------------------------------------------------------------------ */

const LAST = BEATS.length - 1;
const ASPECT: Record<string, number> = { "dusk-a": 1.5, gardiner: 1.5, polson: 1.5, "night-unsplash": 1.498, dundas: 1.5, "night-2025": 1.333, "by-night": 1.5, "gfx-pano": 2.708, "aerial-night": 1.334 };

interface Metrics {
  vw: number;
  vh: number;
  mobile: boolean;
}

const cam = (shot: Shot, m: Metrics): Cam => ({ shot, vw: m.vw, vh: m.vh, plateAspect: ASPECT[shot.plate.id] ?? 1.5 });

/** Where the figure is at this scroll state: mid-swing choreography, or held on the perch at the end. */
function stateToFigure(s: SwingState, m: Metrics, lag = 0): FigureState | null {
  if (s.index >= 0 && s.kind) {
    const t = s.phase - lag;
    if (t < 0) return null;
    const f = figureAt(s.kind, t, m.mobile);
    if (s.kind === "landing" && f.pose) {
      /* the landing swing flies from the left edge to the rooftop perch */
      const shot = plateForBeat(s, m.mobile);
      const perch = shot.plate.perch;
      if (perch) {
        const [px] = project(perch.uv, perch.depth, cam(shot, m));
        const pxVw = (px / m.vw) * 100;
        f.x = 16 + (pxVw - 16) * Math.min(1, t / 0.85);
        f.flip = false;
      }
    }
    return f;
  }
  if (lag === 0 && s.beat === LAST) return { ...figureAt("landing", 1, m.mobile), pose: s.p < 0.12 ? "low" : "stand", speed: 0, flip: false };
  return null;
}

/** Pixel box for a figure state. Grounded poses stand on the plate's perch. */
function box(f: FigureState | null, s: SwingState, m: Metrics) {
  const figH = (m.mobile ? 30 : 42) * 0.01 * m.vh;
  const figW = (figH * 120) / 170;
  if (!f || !f.pose) return { x: -9999, y: -9999, figH, figW, handX: 0, handY: 0, feetX: 0, feetY: 0 };
  const grounded = f.pose === "land" || f.pose === "low" || f.pose === "stand";
  let x = (f.x / 100) * m.vw - figW / 2;
  let y = (f.y / 100) * m.vh - (6 / 170) * figH;
  if (grounded) {
    const shot = plateForBeat(s, m.mobile);
    const perch = shot.plate.perch ?? plateOf("landing").perch!;
    const [px, py] = project(perch.uv, perch.depth, cam(shot, m));
    x = px - figW / 2;
    y = py - figH * (164 / 170);
  }
  return { x, y, figH, figW, handX: x + figW / 2, handY: y + (6 / 170) * figH, feetX: x + figW / 2, feetY: y + figH * (164 / 170) };
}

/** Web anchor: a real tower top in the current plate, projected through the camera. */
function anchorFor(s: SwingState, m: Metrics) {
  const shot = plateForBeat(s, m.mobile);
  const a = shot.plate.anchor ?? (s.index >= 0 ? plateOf(BEATS[SWINGS[s.index].to].id).anchor : undefined);
  if (!a) return { x: m.vw * 0.4, y: -40 };
  const [x, y] = project(a.uv, a.depth, cam(shot, m));
  return { x, y };
}

/**
 * The swinger: key drawings stepped at 8fps while the camera glides, two echoes on true
 * previous poses, one smear in-between, a web anchored to a tower in the plate, tangent
 * speed lines, and a landing on a real rooftop with a contact shadow and a dust puff.
 */
export function Swinger({ state, vw, vh, mobile }: { state: MotionValue<SwingState>; vw: number; vh: number; mobile: boolean }) {
  const m: Metrics = { vw, vh, mobile };
  const fig = useTransform(state, (s) => stateToFigure(s, m));
  const e1 = useTransform(state, (s) => stateToFigure(s, m, 1 / 8));
  const e2 = useTransform(state, (s) => stateToFigure(s, m, 2 / 8));

  const webOn = useTransform(fig, (f) => (f && f.web ? 1 : 0));
  const slackOn = useTransform(fig, (f) => (f && f.slack ? 1 : 0));
  const webD = useTransform(state, (S) => {
    const A = anchorFor(S, m);
    const B = box(stateToFigure(S, m), S, m);
    return `M ${A.x} ${A.y} L ${B.handX} ${B.handY}`;
  });
  const slackD = useTransform(state, (S) => {
    const A = anchorFor(S, m);
    const B = box(stateToFigure(S, m), S, m);
    const wob = stepOf(S.phase) % 2 ? 40 : -30;
    return `M ${A.x} ${A.y} Q ${(A.x + B.handX) / 2} ${(A.y + B.handY) / 2 + wob} ${B.handX} ${B.handY}`;
  });

  const speedOp = useTransform(fig, (f) => (f && f.pose && f.speed > 0.35 ? Math.min(1, (f.speed - 0.35) * 1.6) : 0));
  const speedTf = useTransform(state, (S) => {
    const F = stateToFigure(S, m);
    if (!F || !F.pose) return "translate(-9999px, 0)";
    const B = box(F, S, m);
    const deg = ((F.angle * 180) / Math.PI) * (F.flip ? -1 : 1) + (F.flip ? 180 : 0);
    const seed = stepOf(S.phase);
    const jitter = ((seed * 37) % 11) - 5;
    return `translate(${B.x + B.figW / 2}px, ${B.y + B.figH / 2}px) rotate(${deg}deg) translate(0, ${jitter * 4}px) scaleY(${seed % 2 ? 1 : -1})`;
  });

  const dustOp = useTransform(state, (s) => (s.kind === "landing" && s.phase >= 0.85 && s.phase < 0.95 ? 1 : 0));
  const contactOp = useTransform(fig, (f) => (f && (f.pose === "land" || f.pose === "low" || f.pose === "stand") ? 1 : 0));
  const feetTf = useTransform(state, (S) => {
    const B = box(stateToFigure(S, m), S, m);
    return `translate(${B.feetX - B.figW * 0.6}px, ${B.feetY - 10}px) scaleX(${B.figW / 150})`;
  });

  return (
    <div className="sv-fx" aria-hidden="true">
      <svg className="sv-webline">
        <motion.path d={webD} style={{ opacity: webOn }} />
        <motion.path d={slackD} style={{ opacity: slackOn }} />
      </svg>
      <motion.div className="sv-speed" style={{ transform: speedTf, opacity: speedOp }}>
        <SpeedLines vmin={Math.min(vw, vh)} />
      </motion.div>
      <motion.svg className="sv-footshadow" viewBox="0 0 180 48" style={{ opacity: contactOp, transform: feetTf }}>
        <ellipse cx="90" cy="28" rx="80" ry="12" fill="rgba(10,6,24,0.6)" />
        <ellipse cx="90" cy="28" rx="80" ry="12" fill="url(#figDots)" opacity="0.35" />
      </motion.svg>
      <motion.svg className="sv-dust" viewBox="0 0 180 48" style={{ opacity: dustOp, transform: feetTf }}>
        <ellipse cx="90" cy="30" rx="86" ry="16" fill="#3a3f7a" opacity="0.8" />
        <ellipse cx="90" cy="30" rx="86" ry="16" fill="url(#figDots)" opacity="0.5" />
        <ellipse cx="40" cy="18" rx="22" ry="10" fill="#3a3f7a" />
        <ellipse cx="140" cy="16" rx="26" ry="11" fill="#3a3f7a" />
      </motion.svg>
      <FigureSvg fig={e2} state={state} m={m} className="sv-fig sv-fig-echo sv-fig-echo-2" />
      <FigureSvg fig={e1} state={state} m={m} className="sv-fig sv-fig-echo sv-fig-echo-1" />
      <FigureSvg fig={fig} state={state} m={m} className="sv-fig sv-fig-main" full />
    </div>
  );
}

function FigureSvg({ fig, state, m, className, full = false }: { fig: MotionValue<FigureState | null>; state: MotionValue<SwingState>; m: Metrics; className: string; full?: boolean }) {
  const tf = useTransform(state, (S) => {
    const F = stateToFigure(S, m, className.includes("echo-2") ? 2 / 8 : className.includes("echo-1") ? 1 / 8 : 0);
    const B = box(F, S, m);
    return `translate(${B.x}px, ${B.y}px) scaleX(${F && F.flip ? -1 : 1})`;
  });
  const w = ((m.mobile ? 30 : 42) * 0.01 * m.vh * 120) / 170;
  const h = (m.mobile ? 30 : 42) * 0.01 * m.vh;
  return (
    <motion.svg className={className} viewBox="0 0 120 170" width={w} height={h} style={{ transform: tf }}>
      {POSE_IDS.map((id) => (
        <PoseUse key={id} id={id} fig={fig} full={full} />
      ))}
    </motion.svg>
  );
}

/** One pose: ink silhouette, flat base, hard cel shadow away from the key light, a halftone band at the terminator, a rim on the lit side. */
function PoseUse({ id, fig, full }: { id: Exclude<Pose, null>; fig: MotionValue<FigureState | null>; full: boolean }) {
  const display = useTransform(fig, (f) => (f && f.pose === id ? "inline" : "none"));
  const href = `#pose-${id}`;
  return (
    <motion.g style={{ display }}>
      <use href={href} className="sv-l-ink" />
      {full && <use href={href} className="sv-l-rim" />}
      <use href={href} className="sv-l-base" />
      {full && (
        <>
          <use href={href} className="sv-l-shadow" />
          <use href={href} className="sv-l-band" />
          <use href={href} className="sv-l-detail" />
        </>
      )}
    </motion.g>
  );
}

function SpeedLines({ vmin }: { vmin: number }) {
  const lines = [];
  const n = 12;
  for (let i = 0; i < n; i++) {
    const y = ((i / (n - 1)) * 2 - 1) * 0.22 * vmin;
    const start = -(0.3 + (i % 3) * 0.06) * vmin;
    const len = (0.3 + ((i * 7) % 5) * 0.09) * vmin;
    lines.push(<polygon key={i} points={`${start},${y - 1.6} ${start},${y + 1.6} ${start - len},${y}`} className={i % 2 ? "sv-sl-m" : "sv-sl-c"} />);
  }
  return (
    <svg className="sv-speed-svg" viewBox={`${-vmin} ${-vmin / 2} ${vmin * 1.2} ${vmin}`} width={vmin * 1.2} height={vmin} style={{ marginLeft: -vmin, marginTop: -vmin / 2 }}>
      {lines}
    </svg>
  );
}
