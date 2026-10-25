"use client";

import { Fragment, memo } from "react";

/* Deterministic pseudo-random so the skyline is identical on server and client. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const W = 3600;
const H = 900;
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

/**
 * A rendered tower: flat base colour, a lit face, halftone in the shadow side,
 * hatching at the foot, and an ink line on top. Painted, not printed.
 */
function Building({ b, fill, stroke, windows, base = H, lit = "#ffb020" }: { b: Block; fill: string; stroke: string; windows?: boolean; base?: number; lit?: string }) {
  const top = base - b.h;
  const shade = Math.round(b.w * 0.42);
  return (
    <g>
      <rect x={b.x} y={top} width={b.w} height={b.h} fill={fill} stroke={stroke} strokeWidth={3} strokeLinejoin="round" />
      {/* lit edge from the street lamps below */}
      <rect x={b.x + 3} y={top + 3} width={Math.max(4, b.w * 0.14)} height={b.h - 6} fill={lit} opacity={0.14} />
      {/* shadow side: halftone shading */}
      <rect x={b.x + b.w - shade} y={top + 4} width={shade - 3} height={b.h - 6} fill="url(#dots)" opacity={0.55} />
      {/* foot: hatching */}
      <rect x={b.x + 3} y={base - Math.min(b.h * 0.3, 120)} width={b.w - 6} height={Math.min(b.h * 0.3, 120) - 3} fill="url(#hatch)" opacity={0.5} />
      {b.cap === "step" && (
        <rect x={Math.round(b.x + b.w * 0.2)} y={Math.round(top - b.w * 0.18)} width={Math.round(b.w * 0.6)} height={Math.round(b.w * 0.18 + 6)} fill={fill} stroke={stroke} strokeWidth={3} />
      )}
      {b.cap === "spire" && (
        <polygon points={`${Math.round(b.x + b.w / 2 - 5)},${top} ${Math.round(b.x + b.w / 2 + 5)},${top} ${Math.round(b.x + b.w / 2)},${Math.round(top - 60 - b.w * 0.3)}`} fill={stroke} />
      )}
      {windows && <rect x={b.x + 10} y={top + 18} width={b.w - 20} height={b.h - 30} fill="url(#win)" opacity={0.95} />}
    </g>
  );
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
      <rect x={cx - 64} y={336} width={128} height={14} fill="#19d3ff" stroke="none" opacity={0.75} />
      <rect x={cx - 11} y={150} width={22} height={160} />
      <rect x={cx - 30} y={176} width={60} height={30} rx={8} />
      <polygon points={`${cx - 7},${150} ${cx - 3},${26} ${cx + 3},${26} ${cx + 7},${150}`} />
      {/* the beacon: lit, with a soft halo */}
      <circle cx={cx} cy={22} r={26} fill="url(#beacon)" stroke="none" className="sv-beacon" />
      <circle cx={cx} cy={22} r={7} fill="#ff2d8d" stroke="none" />
      {/* pod lights */}
      <rect x={cx - 72} y={360} width={144} height={6} fill="#ff2d8d" stroke="none" opacity={0.8} />
    </g>
  );
}

function Dome({ x, fill, stroke }: { x: number; fill: string; stroke: string }) {
  const w = 360;
  return (
    <g stroke={stroke} strokeWidth={4} fill={fill}>
      <path d={`M ${x} ${H} Q ${x + w / 2} ${H - 300} ${x + w} ${H} Z`} />
      <path d={`M ${x + 20} ${H} Q ${x + w / 2} ${H - 270} ${x + w - 100} ${H} Z`} fill="url(#dots)" opacity={0.5} stroke="none" />
      <path d={`M ${x + 50} ${H} Q ${x + w / 2} ${H - 250} ${x + w - 50} ${H}`} fill="none" />
      <path d={`M ${x + 120} ${H} Q ${x + w / 2} ${H - 170} ${x + w - 120} ${H}`} fill="none" />
      <line x1={x + w / 2} y1={H - 150} x2={x + w / 2} y2={H} />
      <rect x={x + 20} y={H - 40} width={w - 40} height={40} />
      <rect x={x + 40} y={H - 30} width={w - 80} height={8} fill="#ffb020" stroke="none" opacity={0.7} />
    </g>
  );
}

/** Waterloo's E7: a glass box with a sloped face, and Hack the North's stairs down from it. */
function E7({ x, stroke, base }: { x: number; stroke: string; base: number }) {
  return (
    <g stroke={stroke} strokeWidth={3} strokeLinejoin="round">
      <polygon points={`${x},${base} ${x},${base - 330} ${x + 260},${base - 410} ${x + 320},${base - 330} ${x + 320},${base}`} fill="#0e6f8a" />
      <polygon points={`${x + 8},${base - 320} ${x + 250},${base - 395} ${x + 250},${base - 20} ${x + 8},${base - 20}`} fill="url(#glass)" stroke="none" />
      <polygon points={`${x + 320},${base} ${x + 320},${base - 330} ${x + 420},${base - 300} ${x + 420},${base}`} fill="#083f4f" />
      <polygon points={`${x + 320},${base} ${x + 320},${base - 330} ${x + 420},${base - 300} ${x + 420},${base}`} fill="url(#dots)" opacity={0.5} stroke="none" />
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={x + 420 + i * 38} y={base - 170 + i * 24} width={40} height={170 - i * 24} fill="#2a1248" />
      ))}
      <rect x={x + 420} y={base - 190} width={48} height={22} fill="#e3242b" />
      <text x={x + 130} y={base - 150} textAnchor="middle" fontFamily="var(--font-display)" fontSize={90} fill="#19d3ff" stroke="none" opacity={0.9}>
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
          <rect x={x - 16} y={y + 40} width={32} height={G - y - 40} fill="#1d0f3a" />
          <rect x={x - 16} y={y + 40} width={32} height={G - y - 40} fill="url(#hatch)" opacity={0.6} stroke="none" />
          <rect x={x - 46} y={y + 36} width={92} height={28} fill="#120a26" />
        </Fragment>
      ))}
      <rect x={x1} y={y} width={x2 - x1} height={44} fill="#120a26" />
      <rect x={x1} y={y - 10} width={x2 - x1} height={10} fill="#3b1a5e" />
      {/* sodium lamps along the deck */}
      {pillars.map((x) => (
        <g key={x} stroke="none">
          <rect x={x + 100} y={y - 70} width={4} height={60} fill={stroke} />
          <circle cx={x + 102} cy={y - 72} r={34} fill="url(#sodium)" />
          <circle cx={x + 102} cy={y - 72} r={6} fill="#ffd27a" />
        </g>
      ))}
      {/* headlights and tail lights */}
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
      <rect x={x1} y={y} width={x2 - x1} height={60 + (H - G)} fill="#0a2740" />
      {waves.map((x, i) => (
        <path key={x} d={`M ${x} ${y + 24 + (i % 2) * 14} q 22 -14 44 0 q 22 14 44 0`} fill="none" stroke="#19d3ff" strokeWidth={3} opacity={0.8} />
      ))}
      {/* reflected city light on the water */}
      {waves.map((x, i) => (
        <rect key={`r${x}`} x={x + 20} y={y + 50} width={6} height={40 + (i % 3) * 20} fill={i % 2 ? "#ff2d8d" : "#ffb020"} opacity={0.5} stroke="none" />
      ))}
      <polygon points={`${x1 + 300},${y + 4} ${x1 + 420},${y + 4} ${x1 + 400},${y + 30} ${x1 + 320},${y + 30}`} fill="#f6efdc" />
      <rect x={x1 + 330} y={y - 30} width={60} height={34} fill="#f6efdc" />
      <rect x={x1 + 340} y={y - 22} width={40} height={12} fill="#19d3ff" stroke="none" />
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
      <rect key={x} x={x + Math.round(r() * 40)} y={G + 4} width={Math.round(4 + r() * 10)} height={Math.round(30 + r() * 50)} fill={c < 0.4 ? "#ffb020" : c < 0.7 ? "#ff2d8d" : "#19d3ff"} opacity={0.22 + r() * 0.2} />,
    );
  }
  return (
    <g>
      <rect x={x1} y={G} width={x2 - x1} height={H - G} fill="url(#asphalt)" />
      {streaks}
      <rect x={x1} y={G} width={x2 - x1} height={3} fill="#f6efdc" opacity={0.35} />
    </g>
  );
}

/* --- Shared defs: patterns and lights --- */
function Defs() {
  return (
    <defs>
      <pattern id="win" width="22" height="30" patternUnits="userSpaceOnUse">
        <rect x="4" y="6" width="10" height="14" fill="#ffb020" />
        <rect x="4" y="6" width="10" height="4" fill="#ffd27a" />
      </pattern>
      <pattern id="glass" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="#19d3ff" opacity="0.9" />
        <line x1="0" y1="40" x2="40" y2="0" stroke="#083f4f" strokeWidth="2" />
        <line x1="0" y1="20" x2="40" y2="20" stroke="#083f4f" strokeWidth="2" />
      </pattern>
      <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="5" r="2.2" fill="#05040c" />
      </pattern>
      <pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
        <line x1="0" y1="0" x2="0" y2="12" stroke="#05040c" strokeWidth="2" />
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
      <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1a1030" />
        <stop offset="1" stopColor="#05040c" />
      </linearGradient>
    </defs>
  );
}

/* --- Layers --- */

const FAR = blocks(7, 70, 160, 200, 520, 30);
const MID = blocks(23, 110, 240, 170, 460, 60);
const NEAR = blocks(99, 90, 190, 120, 260, 120);

export const FarLayer = memo(function FarLayer() {
  const fill = "#2a1248";
  const stroke = "#1a0b2e";
  return (
    <svg className="sv-layer-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMax meet" aria-hidden="true">
      <Defs />
      {FAR.map((b, i) => (
        <Building key={i} b={b} fill={fill} stroke={stroke} lit="#ff2d8d" />
      ))}
      <Dome x={760} fill="#3b1a5e" stroke={stroke} />
      <CNTower cx={1040} fill="#3b1a5e" stroke={stroke} />
    </svg>
  );
});

export const MidLayer = memo(function MidLayer() {
  const stroke = "#05040c";
  return (
    <svg className="sv-layer-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMax meet" aria-hidden="true">
      <Defs />
      {MID.filter((b) => b.x < 2500 || b.x > 3150).map((b, i) => (
        <Building key={i} b={b} fill={i % 3 === 0 ? "#1d0f3a" : "#120a26"} stroke={stroke} windows />
      ))}
      <Building b={{ x: 1560, w: 200, h: 760, cap: "step" }} fill="#120a26" stroke={stroke} windows />
      <Building b={{ x: 1830, w: 170, h: 840, cap: "spire" }} fill="#1d0f3a" stroke={stroke} windows />
      <Building b={{ x: 2060, w: 230, h: 700, cap: "flat" }} fill="#120a26" stroke={stroke} windows />
      {/* a lit sign on the tallest tower */}
      <rect x={1838} y={110} width={154} height={44} fill="#05040c" />
      <text x={1915} y={144} textAnchor="middle" fontFamily="var(--font-display)" fontSize={34} letterSpacing={3} fill="#ff2d8d">
        BAY ST
      </text>
      <E7 x={2560} stroke={stroke} base={H} />
    </svg>
  );
});

export const NearLayer = memo(function NearLayer() {
  const stroke = "#05040c";
  return (
    <svg className="sv-layer-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMax meet" aria-hidden="true">
      <Defs />
      {NEAR.filter((b) => b.x > 900 && b.x < 2400).map((b, i) => (
        <Building key={i} b={b} fill="#0b0618" stroke="#1d0f3a" base={G} lit="#19d3ff" />
      ))}
      <WetStreet x1={900} x2={W + 40} />
      <Harbour x1={-40} x2={900} stroke={stroke} />
      <Gardiner x1={900} x2={2500} stroke={stroke} />
      <Streetcar x={1300} stroke={stroke} />
    </svg>
  );
});

/** Union Station's colonnade, lit for the landing beat. Drawn in-scene so it is always under the ending. */
export function UnionFacade() {
  return (
    <svg className="sv-union" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <Defs />
      <rect x="0" y="40" width="1440" height="160" fill="#1a1030" />
      <rect x="0" y="40" width="1440" height="160" fill="url(#hatch)" opacity="0.35" />
      <rect x="-20" y="22" width="1480" height="22" fill="#2a1248" stroke="#05040c" strokeWidth="3" />
      <rect x="40" y="6" width="1360" height="18" fill="#120a26" stroke="#05040c" strokeWidth="3" />
      {Array.from({ length: 22 }).map((_, i) => (
        <g key={i}>
          <rect x={60 + i * 62} y={48} width={28} height={152} fill="#efe4c6" stroke="#05040c" strokeWidth="3" />
          <rect x={74 + i * 62} y={48} width={14} height={152} fill="url(#dots)" opacity="0.55" />
          <rect x={92 + i * 62} y={120} width={26} height={80} fill="#ffb020" opacity="0.75" />
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
