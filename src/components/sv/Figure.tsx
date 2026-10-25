"use client";

import { memo } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { figureAt, stepOf, BEATS, SWINGS, type FigureState, type Pose, type SwingState } from "./geometry";

/* ------------------------------------------------------------------ */
/* Key drawings. ViewBox 0 0 120 170; the hand that holds the line is at (60,6)
   for the attached poses. Everything is currentColor so one symbol can be the
   body, a rim light, or a halftone fill.                                */

const L = { fill: "none", stroke: "currentColor", strokeWidth: 9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const T = { ...L, strokeWidth: 18 };

function PoseBody({ head, torso, bag, limbs, arm }: { head: [number, number]; torso: string; bag: [number, number, number, number]; limbs: string[]; arm?: string }) {
  return (
    <g fill="currentColor">
      {arm && <path d={arm} {...L} strokeWidth={8} />}
      <circle cx={head[0]} cy={head[1]} r={13} />
      <path d={`M ${head[0] - 14} ${head[1]} a 14 14 0 0 1 28 0`} {...L} strokeWidth={4} />
      <rect x={head[0] - 17} y={head[1] - 4} width={7} height={12} rx={3} />
      <rect x={head[0] + 10} y={head[1] - 4} width={7} height={12} rx={3} />
      <path d={torso} {...T} />
      <rect x={bag[0]} y={bag[1]} width={bag[2]} height={bag[3]} rx={7} />
      {limbs.map((d, i) => (
        <path key={i} d={d} {...L} />
      ))}
    </g>
  );
}

const POSES: Record<Exclude<Pose, null>, React.ReactNode> = {
  crouch: <PoseBody arm="M60 6 L58 44" head={[52, 52]} torso="M58 66 L62 96" bag={[66, 64, 20, 30]} limbs={["M60 96 L40 104 L44 126", "M62 96 L72 108 L60 128", "M56 70 L34 84 L40 98"]} />,
  drop: <PoseBody arm="M60 6 L60 46" head={[60, 56]} torso="M60 70 L62 106" bag={[68, 68, 20, 32]} limbs={["M60 106 L44 130 L36 156", "M64 106 L54 136 L50 162", "M58 74 L40 96 L30 112"]} />,
  bottom: <PoseBody arm="M60 6 L52 40" head={[108, 62]} torso="M56 52 L96 70" bag={[66, 30, 24, 18]} limbs={["M58 56 L78 78 L60 96", "M62 58 L90 80 L78 100", "M90 68 L104 90 L96 110"]} />,
  rise: <PoseBody arm="M60 6 L64 44" head={[84, 50]} torso="M70 58 L54 90" bag={[38, 62, 20, 30]} limbs={["M54 90 L70 100 L58 118", "M56 92 L78 106 L70 124", "M72 60 L94 74 L86 96"]} />,
  release: <PoseBody arm="M46 6 L52 40" head={[62, 48]} torso="M60 60 L76 94" bag={[38, 66, 22, 32]} limbs={["M76 94 L96 120 L90 150", "M74 96 L60 124 L48 150", "M64 62 L90 46 L110 30"]} />,
  apex: <PoseBody head={[60, 140]} torso="M60 126 L60 86" bag={[68, 86, 20, 32]} limbs={["M60 86 L36 54 L26 20", "M62 86 L86 56 L98 22", "M56 120 L30 104 L14 118", "M64 120 L90 106 L106 120"]} />,
  land: <PoseBody head={[60, 88]} torso="M60 102 L60 124" bag={[68, 100, 20, 26]} limbs={["M56 124 L30 138 L20 164", "M64 124 L90 138 L100 164", "M54 106 L34 128 L26 160", "M66 106 L86 128 L94 160"]} />,
  low: <PoseBody head={[64, 98]} torso="M60 112 L56 136" bag={[66, 108, 20, 26]} limbs={["M56 136 L36 150 L28 164", "M58 136 L80 150 L92 164", "M58 116 L40 136 L44 164", "M66 118 L84 134"]} />,
  stand: <PoseBody head={[60, 70]} torso="M60 84 L60 116" bag={[68, 84, 20, 30]} limbs={["M56 116 L46 140 L44 164", "M64 116 L72 140 L70 164", "M54 90 L42 112", "M66 90 L80 112 L76 124"]} />,
  runA: <PoseBody head={[68, 60]} torso="M66 76 L52 106" bag={[36, 70, 22, 30]} limbs={["M52 106 L80 120 L90 150", "M50 108 L30 124 L14 150", "M64 80 L90 92 L100 74", "M62 80 L40 96 L24 86"]} />,
  runB: <PoseBody head={[68, 62]} torso="M66 78 L52 108" bag={[36, 72, 22, 30]} limbs={["M52 108 L66 138 L70 164", "M50 110 L32 134 L44 160", "M64 82 L84 100 L78 118", "M62 82 L42 88 L26 100"]} />,
  /* one drawn in-between: body stretched along the arc, lower legs doubled */
  smear: (
    <g fill="currentColor">
      <path d="M60 6 L48 42" {...L} strokeWidth={8} />
      <path d="M24 72 L104 52" {...T} strokeWidth={16} />
      <circle cx={112} cy={48} r={12} />
      <rect x={70} y={32} width={24} height={16} rx={6} />
      <path d="M62 66 L52 96 L40 116" {...L} />
      <path d="M50 70 L40 100 L28 120" {...L} opacity={0.4} />
      <path d="M38 74 L28 104 L16 124" {...L} opacity={0.25} />
      <path d="M90 70 L104 90 L96 110" {...L} />
    </g>
  ),
};

const POSE_IDS = Object.keys(POSES) as Array<Exclude<Pose, null>>;

export const PoseSymbols = memo(function PoseSymbols() {
  return (
    <>
      {POSE_IDS.map((id) => (
        <symbol key={id} id={`pose-${id}`} viewBox="0 0 120 170">
          {POSES[id]}
        </symbol>
      ))}
    </>
  );
});

/* ------------------------------------------------------------------ */

const LAST = BEATS.length - 1;

/** Where the figure is at this scroll state: mid-swing choreography, or held on the cornice at the end. */
function stateToFigure(s: SwingState, mobile: boolean, lag = 0): FigureState | null {
  if (s.index >= 0 && s.kind) {
    const t = s.phase - lag;
    if (t < 0) return null;
    return figureAt(s.kind, t, mobile);
  }
  if (lag === 0 && s.beat === LAST) return { ...figureAt("landing", 1, mobile), pose: "stand", speed: 0 };
  return null;
}

/** Web anchor: the CN Tower's shaft top (under the antenna) in whichever far-layer copy is nearest the frame centre. */
function anchorFor(s: SwingState, m: Metrics) {
  const farH = (m.mobile ? 0.4 : 0.68) * m.vh;
  const farBottom = (m.mobile ? 0.18 : 0.1) * m.vh;
  const copyW = 4 * farH;
  const layerLeft = m.mobile ? -0.24 * m.vh : -0.04 * m.vw;
  const layerX = layerLeft + (-s.travel * 9 * m.vw) / 100;
  const towerX = (1040 / 3600) * copyW;
  const topY = m.vh - farBottom - (750 / 900) * farH;
  let best = 0;
  let bestD = Infinity;
  for (let c = 0; c < 2; c++) {
    const x = layerX + c * copyW + towerX;
    const d = Math.abs(x - m.vw * 0.5);
    if (d < bestD) {
      bestD = d;
      best = x;
    }
  }
  return { x: best, y: topY };
}

interface Metrics {
  vw: number;
  vh: number;
  mobile: boolean;
}

/** Pixel box for a figure state. Grounded poses stand on the Union cornice. */
function box(f: FigureState | null, m: Metrics) {
  const figH = (m.mobile ? 20 : 28) * 0.01 * m.vh;
  const figW = (figH * 120) / 170;
  if (!f || !f.pose) return { x: -9999, y: -9999, figH, figW, handX: 0, handY: 0 };
  const grounded = f.pose === "land" || f.pose === "low" || f.pose === "stand";
  const facade = m.mobile ? 120 : 200;
  const cornice = m.vh - facade + (m.mobile ? 13 : 22);
  const x = (f.x / 100) * m.vw - figW / 2;
  const y = grounded ? cornice - figH : (f.y / 100) * m.vh - (6 / 170) * figH;
  return { x, y, figH, figW, handX: x + figW / 2, handY: y + (6 / 170) * figH };
}

/**
 * The swinger: six key drawings stepped at 8fps while the camera glides, two echoes on
 * true previous poses, one smear in-between, a web anchored to the nearest Bay Street
 * tower top, tangent speed lines, and a landing crouch with a dust puff at Union.
 */
export function Swinger({ state, vw, vh, mobile }: { state: MotionValue<SwingState>; vw: number; vh: number; mobile: boolean }) {
  const m: Metrics = { vw, vh, mobile };
  const fig = useTransform(state, (s) => stateToFigure(s, mobile));
  const e1 = useTransform(state, (s) => stateToFigure(s, mobile, 1 / 8));
  const e2 = useTransform(state, (s) => stateToFigure(s, mobile, 2 / 8));

  const anchor = useTransform(state, (s) => anchorFor(s, m));

  const main = useTransform(fig, (f) => box(f, m));
  const hand = useTransform(main, (b) => ({ x: b.handX, y: b.handY }));
  const webOn = useTransform(fig, (f) => (f && f.web ? 1 : 0));
  const slackOn = useTransform(fig, (f) => (f && f.slack ? 1 : 0));
  const x1 = useTransform(anchor, (a) => a.x);
  const y1 = useTransform(anchor, (a) => a.y);
  const x2 = useTransform(hand, (h) => h.x);
  const y2 = useTransform(hand, (h) => h.y);
  const slackD = useTransform(state, (S) => {
    const A = anchorFor(S, m);
    const B = box(stateToFigure(S, mobile), m);
    const wob = stepOf(S.phase) % 2 ? 40 : -30;
    return `M ${A.x} ${A.y} Q ${(A.x + B.handX) / 2} ${(A.y + B.handY) / 2 + wob} ${B.handX} ${B.handY}`;
  });

  /* speed lines: tapered, along the tangent, trailing the figure, re-seeded every step */
  const speedOp = useTransform(fig, (f) => (f && f.pose && f.speed > 0.35 ? Math.min(1, (f.speed - 0.35) * 1.6) : 0));
  const speedTf = useTransform(state, (S) => {
    const F = stateToFigure(S, mobile);
    if (!F || !F.pose) return "translate(-9999px, 0)";
    const B = box(F, m);
    const deg = ((F.angle * 180) / Math.PI) * (F.flip ? -1 : 1) + (F.flip ? 180 : 0);
    const seed = stepOf(S.phase);
    const jitter = ((seed * 37) % 11) - 5;
    return `translate(${B.x + B.figW / 2}px, ${B.y + B.figH / 2}px) rotate(${deg}deg) translate(0, ${jitter * 4}px) scaleY(${seed % 2 ? 1 : -1})`;
  });

  const dustOp = useTransform(state, (s) => (s.kind === "landing" && s.phase >= 0.85 && s.phase < 0.95 ? 1 : 0));
  const dustTf = useTransform(main, (b) => `translate(${b.x + b.figW / 2 - 90}px, ${b.y + b.figH - 24}px)`);

  return (
    <div className="sv-fx" aria-hidden="true">
      <svg className="sv-webline">
        <motion.line x1={x1} y1={y1} x2={x2} y2={y2} style={{ opacity: webOn }} />
        <motion.path d={slackD} style={{ opacity: slackOn }} />
      </svg>
      <motion.div className="sv-speed" style={{ transform: speedTf, opacity: speedOp }}>
        <SpeedLines vmin={Math.min(vw, vh)} />
      </motion.div>
      <FigureSvg fig={e2} m={m} className="sv-fig sv-fig-echo sv-fig-echo-2" />
      <FigureSvg fig={e1} m={m} className="sv-fig sv-fig-echo sv-fig-echo-1" />
      <FigureSvg fig={fig} m={m} className="sv-fig sv-fig-main" rim />
      <motion.svg className="sv-dust" viewBox="0 0 180 48" style={{ opacity: dustOp, transform: dustTf }}>
        <ellipse cx="90" cy="30" rx="86" ry="16" fill="#3a3f7a" opacity="0.8" />
        <ellipse cx="90" cy="30" rx="86" ry="16" fill="url(#dots)" opacity="0.8" />
        <ellipse cx="40" cy="18" rx="22" ry="10" fill="#3a3f7a" />
        <ellipse cx="140" cy="16" rx="26" ry="11" fill="#3a3f7a" />
      </motion.svg>
    </div>
  );
}

function FigureSvg({ fig, m, className, rim = false }: { fig: MotionValue<FigureState | null>; m: Metrics; className: string; rim?: boolean }) {
  const tf = useTransform(fig, (F) => {
    const B = box(F, m);
    return `translate(${B.x}px, ${B.y}px) scaleX(${F && F.flip ? -1 : 1})`;
  });
  const w = ((m.mobile ? 20 : 28) * 0.01 * m.vh * 120) / 170;
  const h = (m.mobile ? 20 : 28) * 0.01 * m.vh;
  return (
    <motion.svg className={className} viewBox="0 0 120 170" width={w} height={h} style={{ transform: tf }}>
      {POSE_IDS.map((id) => (
        <PoseUse key={id} id={id} fig={fig} rim={rim} />
      ))}
    </motion.svg>
  );
}

function PoseUse({ id, fig, rim }: { id: Exclude<Pose, null>; fig: MotionValue<FigureState | null>; rim: boolean }) {
  const display = useTransform(fig, (f) => (f && f.pose === id ? "inline" : "none"));
  return (
    <motion.g style={{ display }}>
      {rim && (
        <>
          <use href={`#pose-${id}`} x={-2.5} className="sv-rim-m" />
          <use href={`#pose-${id}`} x={2.5} className="sv-rim-c" />
        </>
      )}
      <use href={`#pose-${id}`} className="sv-body" />
      {rim && <use href={`#pose-${id}`} className="sv-body-dots" mask="url(#lowerHalf)" />}
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
    lines.push(<polygon key={i} points={`${start},${y - 2.2} ${start},${y + 2.2} ${start - len},${y}`} className={i % 2 ? "sv-sl-m" : "sv-sl-c"} />);
  }
  return (
    <svg className="sv-speed-svg" viewBox={`${-vmin} ${-vmin / 2} ${vmin * 1.2} ${vmin}`} width={vmin * 1.2} height={vmin} style={{ marginLeft: -vmin, marginTop: -vmin / 2 }}>
      {lines}
    </svg>
  );
}

export { SWINGS };
