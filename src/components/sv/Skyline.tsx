"use client";

import { Fragment, memo } from "react";
import { PoseSymbols } from "./Figure";

/* Deterministic pseudo-random so the skyline is identical on server and client. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const W = 3600;
export const H = 900;
/** Ground line for the near layer; below it is wet street with reflections. */
const G = 820;

interface Block {
  x: number;
  w: number;
  h: number;
  cap?: "flat" | "step" | "spire";
}

function blocks(seed: number, minW: number, maxW: number, minH: number, maxH: number, gap: number): Block[] {
  const r = rng(seed);
  const out: Block[] = [];
  let x = -40;
  while (x < W + 40) {
    const w = Math.round(minW + r() * (maxW - minW));
    const h = Math.round(minH + r() * (maxH - minH));
    const c = r();
    out.push({ x, w, h, cap: c < 0.55 ? "flat" : c < 0.85 ? "step" : "spire" });
    x += w + Math.round(gap * (0.4 + r()));
  }
  return out;
}

/* --- Per-building windows: ~35% lit, uneven floors, a few light spills --- */
function Windows({ b, seed, base }: { b: Block; seed: number; base: number }) {
  const r = rng(seed);
  const top = base - b.h;
  const cols = Math.max(1, Math.floor((b.w - 16) / 22));
  const rows = Math.max(1, Math.floor((b.h - 30) / 30));
  const out: React.ReactNode[] = [];
  const spills: React.ReactNode[] = [];
  let n = 0;
  for (let row = 0; row < rows && n < 14; row++) {
    if (r() < 0.22) continue; // dark floor
    const floorLit = 0.2 + r() * 0.35;
    for (let col = 0; col < cols && n < 14; col++) {
      if (r() > floorLit) continue;
      const c = r();
      const fill = c < 0.7 ? "#ffb54a" : c < 0.9 ? "#ffd98f" : "#6fd8ff";
      const x = b.x + 8 + col * 22 + 4;
      const y = top + 18 + row * 30 + 6;
      out.push(<rect key={n} x={x} y={y} width={10} height={14} fill={fill} className={n % 7 === 3 ? "sv-win-blink" : undefined} style={n % 7 === 3 ? { animationDelay: `${(r() * 4).toFixed(1)}s` } : undefined} />);
      if (n % 6 === 0) out.push(<rect key={`h${n}`} x={x} y={y} width={10} height={1.5} fill="#ffd27a" />);
      if (spills.length < 2 && r() < 0.3) spills.push(<rect key={`s${n}`} x={x - 3} y={y + 14} width={16} height={Math.min(60, base - y - 14)} fill={fill} opacity={0.14} />);
      n++;
    }
  }
  return (
    <>
      {spills}
      {out}
    </>
  );
}

/**
 * A rendered tower: flat base colour, a lit edge, halftone in the shadow side,
 * hatching at the foot, and an ink line on top. Painted, not printed.
 */
function Building({ b, fill, stroke, seed, base = H, lit = "#ffb020", windows }: { b: Block; fill: string; stroke: string; seed: number; base?: number; lit?: string; windows?: boolean }) {
  const top = base - b.h;
  const shade = Math.round(b.w * 0.42);
  return (
    <g>
      <rect x={b.x} y={top} width={b.w} height={b.h} fill={fill} stroke={stroke} strokeWidth={3} strokeLinejoin="round" />
      <rect x={b.x + 3} y={top + 3} width={Math.max(4, b.w * 0.12)} height={b.h - 6} fill={lit} opacity={0.12} />
      <rect x={b.x + b.w - shade} y={top + 4} width={shade - 3} height={b.h - 6} fill="url(#dots)" opacity={0.5} />
      <rect x={b.x + 3} y={base - Math.min(b.h * 0.3, 120)} width={b.w - 6} height={Math.min(b.h * 0.3, 120) - 3} fill="url(#hatch)" opacity={0.45} />
      {b.cap === "step" && (
        <rect x={Math.round(b.x + b.w * 0.2)} y={Math.round(top - b.w * 0.18)} width={Math.round(b.w * 0.6)} height={Math.round(b.w * 0.18 + 6)} fill={fill} stroke={stroke} strokeWidth={3} />
      )}
      {b.cap === "spire" && (
        <polygon points={`${Math.round(b.x + b.w / 2 - 5)},${top} ${Math.round(b.x + b.w / 2 + 5)},${top} ${Math.round(b.x + b.w / 2)},${Math.round(top - 60 - b.w * 0.3)}`} fill={stroke} />
      )}
      {windows && <Windows b={b} seed={seed} base={base} />}
    </g>
  );
}

/** Flat silhouette path for a list of blocks (one node for the whole layer). */
function silhouette(bs: Block[], base = H) {
  return bs
    .map((b) => {
      const top = base - b.h;
      let d = `M${b.x} ${base}V${top}H${b.x + b.w}V${base}Z`;
      if (b.cap === "step") d += `M${Math.round(b.x + b.w * 0.2)} ${top}V${Math.round(top - b.w * 0.18)}H${Math.round(b.x + b.w * 0.8)}V${top}Z`;
      if (b.cap === "spire") d += `M${Math.round(b.x + b.w / 2 - 5)} ${top}L${Math.round(b.x + b.w / 2)} ${Math.round(top - 60 - b.w * 0.3)}L${Math.round(b.x + b.w / 2 + 5)} ${top}Z`;
      return d;
    })
    .join("");
}

/* --- Landmarks --- */

function CNTower({ cx, fill, stroke }: { cx: number; fill: string; stroke: string }) {
  return (
    <g stroke={stroke} strokeWidth={4} strokeLinejoin="round" fill={fill}>
      <polygon points={`${cx - 78},${H} ${cx - 16},${430} ${cx + 16},${430} ${cx + 78},${H}`} />
      <polygon points={`${cx - 36},${H} ${cx - 10},${440} ${cx + 10},${440} ${cx + 36},${H}`} fill="url(#dots)" opacity={0.6} stroke="none" />
      <rect x={cx - 92} y={388} width={184} height={20} rx={8} />
      <rect x={cx - 76} y={316} width={152} height={74} rx={14} />
      <rect x={cx - 60} y={300} width={120} height={22} rx={8} />
      <rect x={cx - 64} y={336} width={128} height={14} fill="#6fd8ff" stroke="none" opacity={0.7} />
      <rect x={cx - 11} y={150} width={22} height={160} />
      <rect x={cx - 30} y={176} width={60} height={30} rx={8} />
      <polygon points={`${cx - 7},${150} ${cx - 3},${26} ${cx + 3},${26} ${cx + 7},${150}`} />
      <circle cx={cx} cy={22} r={26} fill="url(#beacon)" stroke="none" className="sv-beacon" />
      <circle cx={cx} cy={22} r={7} fill="#ff2d8d" stroke="none" />
      <rect x={cx - 72} y={360} width={144} height={6} fill="#ff2d8d" stroke="none" opacity={0.7} />
    </g>
  );
}
const CN_SIL = (cx: number) => `M${cx - 78} ${H}L${cx - 16} 430H${cx + 16}L${cx + 78} ${H}ZM${cx - 92} 388H${cx + 92}V408H${cx - 92}ZM${cx - 76} 316H${cx + 76}V390H${cx - 76}ZM${cx - 11} 150H${cx + 11}V316H${cx - 11}ZM${cx - 30} 176H${cx + 30}V206H${cx - 30}ZM${cx - 7} 150L${cx - 3} 26H${cx + 3}L${cx + 7} 150Z`;

function Dome({ x, fill, stroke }: { x: number; fill: string; stroke: string }) {
  const w = 360;
  return (
    <g stroke={stroke} strokeWidth={4} fill={fill}>
      <path d={`M ${x} ${H} Q ${x + w / 2} ${H - 300} ${x + w} ${H} Z`} />
      <path d={`M ${x + 20} ${H} Q ${x + w / 2} ${H - 270} ${x + w - 100} ${H} Z`} fill="url(#dots)" opacity={0.5} stroke="none" />
      <path d={`M ${x + 50} ${H} Q ${x + w / 2} ${H - 250} ${x + w - 50} ${H}`} fill="none" />
      <path d={`M ${x + 120} ${H} Q ${x + w / 2} ${H - 170} ${x + w - 120} ${H}`} fill="none" />
      <rect x={x + 20} y={H - 40} width={w - 40} height={40} />
      <rect x={x + 40} y={H - 30} width={w - 80} height={8} fill="#ffb020" stroke="none" opacity={0.6} />
    </g>
  );
}
const DOME_SIL = (x: number) => `M${x} ${H}Q${x + 180} ${H - 300} ${x + 360} ${H}Z`;

/** Waterloo's E7: a glass box with a sloped face, and Hack the North's stairs down from it. */
function E7({ x, stroke, base }: { x: number; stroke: string; base: number }) {
  return (
    <g stroke={stroke} strokeWidth={3} strokeLinejoin="round">
      <polygon points={`${x},${base} ${x},${base - 330} ${x + 260},${base - 410} ${x + 320},${base - 330} ${x + 320},${base}`} fill="#0e4f6a" />
      <polygon points={`${x + 8},${base - 320} ${x + 250},${base - 395} ${x + 250},${base - 20} ${x + 8},${base - 20}`} fill="url(#glass)" stroke="none" />
      <polygon points={`${x + 320},${base} ${x + 320},${base - 330} ${x + 420},${base - 300} ${x + 420},${base}`} fill="#072e3d" />
      <polygon points={`${x + 320},${base} ${x + 320},${base - 330} ${x + 420},${base - 300} ${x + 420},${base}`} fill="url(#dots)" opacity={0.5} stroke="none" />
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={x + 420 + i * 38} y={base - 170 + i * 24} width={40} height={170 - i * 24} fill="#1d1440" />
      ))}
      <rect x={x + 420} y={base - 190} width={48} height={22} fill="#e3242b" />
      <text x={x + 130} y={base - 150} textAnchor="middle" fontFamily="var(--font-display)" fontSize={90} fill="#6fd8ff" stroke="none" opacity={0.85}>
        E7
      </text>
    </g>
  );
}

function Gardiner({ x1, x2, stroke }: { x1: number; x2: number; stroke: string }) {
  const y = G - 260;
  const pillars = [];
  for (let x = x1 + 60; x < x2; x += 230) pillars.push(x);
  return (
    <g stroke={stroke} strokeWidth={3}>
      {pillars.map((x) => (
        <Fragment key={x}>
          <rect x={x - 16} y={y + 40} width={32} height={G - y - 40} fill="#12102c" />
          <rect x={x - 16} y={y + 40} width={32} height={G - y - 40} fill="url(#hatch)" opacity={0.6} stroke="none" />
          <rect x={x - 46} y={y + 36} width={92} height={28} fill="#0b0a22" />
        </Fragment>
      ))}
      <rect x={x1} y={y} width={x2 - x1} height={44} fill="#0b0a22" />
      <rect x={x1} y={y - 10} width={x2 - x1} height={10} fill="#2a2a5e" />
      {pillars.map((x) => (
        <g key={x} stroke="none">
          <rect x={x + 100} y={y - 70} width={4} height={60} fill={stroke} />
          <circle cx={x + 102} cy={y - 72} r={34} fill="url(#sodium)" />
          <circle cx={x + 102} cy={y - 72} r={6} fill="#ffd27a" />
        </g>
      ))}
      {pillars.map((x, i) => (
        <g key={x} fill={i % 2 ? "#ffd27a" : "#e3242b"} stroke="none">
          <circle cx={x + 50} cy={y - 20} r={6} />
          <circle cx={x + 70} cy={y - 20} r={6} />
        </g>
      ))}
    </g>
  );
}

function Streetcar({ x, stroke }: { x: number; stroke: string }) {
  const y = G - 150;
  return (
    <g stroke={stroke} strokeWidth={3} strokeLinejoin="round">
      <line x1={x + 120} y1={y - 60} x2={x + 150} y2={y} stroke={stroke} />
      <rect x={x} y={y} width={300} height={110} rx={22} fill="#e3242b" />
      <rect x={x + 180} y={y + 4} width={116} height={102} rx={18} fill="url(#dots)" stroke="none" opacity={0.45} />
      <rect x={x + 8} y={y + 40} width={284} height={20} fill="#f6efdc" stroke="none" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={x + 22 + i * 54} y={y + 16} width={38} height={28} rx={4} fill="#ffd27a" />
      ))}
      <circle cx={x + 60} cy={y + 112} r={14} fill={stroke} />
      <circle cx={x + 240} cy={y + 112} r={14} fill={stroke} />
      <text x={x + 150} y={y + 92} textAnchor="middle" fontFamily="var(--font-display)" fontSize={30} fill="#f6efdc" stroke="none">
        504 KING
      </text>
    </g>
  );
}

function Harbour({ x1, x2, stroke }: { x1: number; x2: number; stroke: string }) {
  const y = G - 60;
  const waves = [];
  for (let x = x1; x < x2; x += 90) waves.push(x);
  return (
    <g stroke={stroke} strokeWidth={3}>
      <rect x={x1} y={y} width={x2 - x1} height={60 + (H - G)} fill="#071a30" />
      {waves.map((x, i) => (
        <path key={x} d={`M ${x} ${y + 24 + (i % 2) * 14} q 22 -14 44 0 q 22 14 44 0`} fill="none" stroke="#3aa6c9" strokeWidth={3} opacity={0.7} />
      ))}
      {waves.map((x, i) => (
        <rect key={`r${x}`} x={x + 20} y={y + 50} width={6} height={40 + (i % 3) * 20} fill={i % 2 ? "#ff2d8d" : "#ffb020"} opacity={0.45} stroke="none" />
      ))}
      <polygon points={`${x1 + 300},${y + 4} ${x1 + 420},${y + 4} ${x1 + 400},${y + 30} ${x1 + 320},${y + 30}`} fill="#f6efdc" />
      <rect x={x1 + 330} y={y - 30} width={60} height={34} fill="#f6efdc" />
      <rect x={x1 + 340} y={y - 22} width={40} height={12} fill="#6fd8ff" stroke="none" />
    </g>
  );
}

/** Wet street: dark asphalt with the lights above smeared downward. */
function WetStreet({ x1, x2 }: { x1: number; x2: number }) {
  const streaks = [];
  const r = rng(5);
  for (let x = x1; x < x2; x += 70) {
    const c = r();
    streaks.push(
      <rect key={x} x={x + Math.round(r() * 40)} y={G + 4} width={Math.round(4 + r() * 10)} height={Math.round(30 + r() * 50)} fill={c < 0.4 ? "#ffb020" : c < 0.7 ? "#ff2d8d" : "#6fd8ff"} opacity={0.22 + r() * 0.2} />,
    );
  }
  return (
    <g>
      <rect x={x1} y={G} width={x2 - x1} height={H - G} fill="url(#asphalt)" />
      {streaks}
      <rect x={x1} y={G} width={x2 - x1} height={3} fill="#f6efdc" opacity={0.3} />
    </g>
  );
}

/* --- Clouds lit from below by the city --- */
const CLOUDS: Array<{ x: number; y: number; s: number }> = [
  { x: 300, y: 140, s: 1.3 },
  { x: 1300, y: 90, s: 1 },
  { x: 2200, y: 170, s: 1.6 },
  { x: 3100, y: 110, s: 1.1 },
];
function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  const top = "M0 60 C 20 20, 70 10, 110 34 C 130 8, 190 10, 210 40 C 250 24, 300 40, 300 70 C 320 72, 330 100, 300 104 L 10 104 C -16 100, -16 72, 0 60 Z";
  const under = "M4 84 C 60 72, 120 92, 170 80 C 220 68, 270 86, 300 80 C 320 84, 330 100, 300 104 L 10 104 C -10 100, -8 90, 4 84 Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={top} fill="#3a3f7a" />
      <path d={under} fill="#ff8a4a" opacity={0.5} />
      <path d={under} fill="url(#dots)" opacity={0.55} />
    </g>
  );
}

/* --- Shared defs: patterns, lights, and every layer drawn once as a symbol --- */

const FAR = blocks(7, 70, 160, 200, 520, 30);
const MID = blocks(23, 110, 240, 170, 460, 60).filter((b) => b.x < 2500 || b.x > 3150);
const BAY: Block[] = [
  { x: 1560, w: 200, h: 760, cap: "step" },
  { x: 1830, w: 170, h: 840, cap: "spire" },
  { x: 2060, w: 230, h: 700, cap: "flat" },
];
const NEAR = blocks(99, 90, 190, 120, 260, 120).filter((b) => b.x > 900 && b.x < 2400);

export const SkyDefs = memo(function SkyDefs() {
  const ink = "#05040c";
  return (
    <svg width="0" height="0" className="sv-defs" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="glass" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#3aa6c9" opacity="0.9" />
          <line x1="0" y1="40" x2="40" y2="0" stroke="#072e3d" strokeWidth="2" />
          <line x1="0" y1="20" x2="40" y2="20" stroke="#072e3d" strokeWidth="2" />
        </pattern>
        <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="2.2" fill="#05040c" />
        </pattern>
        <pattern id="dotsLight" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="1.6" fill="#3a3f7a" />
        </pattern>
        <pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="12" stroke="#05040c" strokeWidth="2" />
        </pattern>
        <pattern id="brick" width="30" height="14" patternUnits="userSpaceOnUse">
          <rect width="30" height="14" fill="none" />
          <line x1="0" y1="0" x2="30" y2="0" stroke="#05040c" strokeWidth="1.5" />
          <line x1="15" y1="0" x2="15" y2="7" stroke="#05040c" strokeWidth="1.5" />
          <line x1="0" y1="7" x2="30" y2="7" stroke="#05040c" strokeWidth="1.5" />
          <line x1="0" y1="7" x2="0" y2="14" stroke="#05040c" strokeWidth="1.5" />
        </pattern>
        <radialGradient id="sodium">
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="#ffb020" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffb020" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="beacon">
          <stop offset="0" stopColor="#ff2d8d" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff2d8d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="warm">
          <stop offset="0" stopColor="#ffd98f" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ff8a4a" stopOpacity="0.6" />
        </radialGradient>
        <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141230" />
          <stop offset="1" stopColor="#05040c" />
        </linearGradient>
        <linearGradient id="column" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f6efdc" />
          <stop offset="0.6" stopColor="#d9cfae" />
          <stop offset="1" stopColor="#7a6a52" />
        </linearGradient>
        <linearGradient id="halfMask" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id="lowerHalf" maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill="url(#halfMask)" />
        </mask>

        {/* the city, drawn once */}
        <symbol id="sym-clouds" viewBox={`0 0 ${W} 400`}>
          {CLOUDS.map((c, i) => (
            <Cloud key={i} {...c} />
          ))}
        </symbol>
        <symbol id="sym-far" viewBox={`0 0 ${W} ${H}`}>
          {FAR.map((b, i) => (
            <Building key={i} b={b} fill="#3b3a78" stroke="#2a2a5e" seed={100 + i} lit="#ff2d8d" />
          ))}
          <Dome x={760} fill="#44458a" stroke="#2a2a5e" />
          <CNTower cx={1040} fill="#44458a" stroke="#2a2a5e" />
        </symbol>
        <symbol id="sil-far" viewBox={`0 0 ${W} ${H}`}>
          <path d={silhouette(FAR) + DOME_SIL(760) + CN_SIL(1040)} fill="currentColor" />
        </symbol>
        <symbol id="sym-mid" viewBox={`0 0 ${W} ${H}`}>
          {MID.map((b, i) => (
            <Building key={i} b={b} fill={i % 3 === 0 ? "#1d1a44" : "#141230"} stroke={ink} seed={200 + i} windows />
          ))}
          {BAY.map((b, i) => (
            <Building key={`bay${i}`} b={b} fill={i === 1 ? "#1d1a44" : "#141230"} stroke={ink} seed={300 + i} windows />
          ))}
          <rect x={1838} y={110} width={154} height={44} fill={ink} />
          <text x={1915} y={144} textAnchor="middle" fontFamily="var(--font-display)" fontSize={34} letterSpacing={3} fill="#ff2d8d">
            BAY ST
          </text>
          <E7 x={2560} stroke={ink} base={H} />
        </symbol>
        <symbol id="sym-near" viewBox={`0 0 ${W} ${H}`}>
          {NEAR.map((b, i) => (
            <Building key={i} b={b} fill="#07061a" stroke="#141230" seed={400 + i} base={G} lit="#6fd8ff" />
          ))}
          <WetStreet x1={900} x2={W + 40} />
          <Harbour x1={-40} x2={900} stroke={ink} />
          <Gardiner x1={900} x2={2500} stroke={ink} />
          <Streetcar x={1300} stroke={ink} />
        </symbol>
        <symbol id="sil-near" viewBox={`0 0 ${W} ${H}`}>
          <path d={silhouette(NEAR, G) + `M900 ${G - 270}H2500V${G - 216}H900ZM1300 ${G - 150}H1600V${G - 40}H1300Z`} fill="currentColor" />
        </symbol>
        <PoseSymbols />
      </defs>
    </svg>
  );
});

/* --- Layer instances: one <use> each --- */
const Use = ({ id }: { id: string }) => (
  <svg className="sv-layer-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMax meet" aria-hidden="true">
    <use href={`#${id}`} />
  </svg>
);
export const FarLayer = () => <Use id="sym-far" />;
export const MidLayer = () => <Use id="sym-mid" />;
export const NearLayer = () => <Use id="sym-near" />;
export const FarSil = () => <Use id="sil-far" />;
export const NearSil = () => <Use id="sil-near" />;
export const CloudLayer = () => (
  <svg className="sv-layer-svg" viewBox={`0 0 ${W} 400`} preserveAspectRatio="xMinYMin meet" aria-hidden="true">
    <use href="#sym-clouds" />
  </svg>
);

/** Union Station's colonnade, lit for the landing beat. Drawn in-scene so it is always under the ending. */
export function UnionFacade() {
  return (
    <svg className="sv-union" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <rect x="0" y="40" width="1440" height="160" fill="#1a1636" />
      <rect x="0" y="40" width="1440" height="160" fill="url(#brick)" opacity="0.35" />
      {/* arched windows with a warm interior */}
      {Array.from({ length: 21 }).map((_, i) => (
        <path key={`w${i}`} d={`M ${98 + i * 66} 200 V 110 a 18 18 0 0 1 36 0 V 200 Z`} fill="url(#warm)" />
      ))}
      <rect x="-20" y="22" width="1480" height="22" fill="#2a2a5e" stroke="#05040c" strokeWidth="3" />
      <rect x="40" y="6" width="1360" height="18" fill="#141230" stroke="#05040c" strokeWidth="3" />
      {Array.from({ length: 22 }).map((_, i) => (
        <g key={i}>
          <rect x={60 + i * 66} y={48} width={30} height={152} fill="url(#column)" stroke="#05040c" strokeWidth="2.5" />
          <rect x={76 + i * 66} y={48} width={14} height={152} fill="url(#dots)" opacity="0.5" />
        </g>
      ))}
      <rect x="520" y="-6" width="400" height="34" fill="#05040c" stroke="#ff2d8d" strokeWidth="2" />
      <text x="720" y="20" textAnchor="middle" fontFamily="var(--font-display)" fontSize="24" letterSpacing="8" fill="#ffd27a">
        UNION STATION
      </text>
      {Array.from({ length: 6 }).map((_, i) => (
        <circle key={i} cx={120 + i * 240} cy={70} r={40} fill="url(#sodium)" />
      ))}
    </svg>
  );
}
