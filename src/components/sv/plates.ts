/* Plate scenes for the Film canvas. One photographic plate per segment
   (paint-baked colour + depth matte in public/plates), a camera function of
   local progress, a restrained per-scene grade, and for the hero the title
   rectangle the shader sets into the far field so the near field occludes it. */

import { SEG } from "./timeline";

export interface Camera {
  pan: [number, number];
  zoom: number;
  focusDepth: number;
  dof: number;
  focusUv: [number, number];
}

export interface Grade {
  shadow: [number, number, number];
  high: [number, number, number];
  hazeCol: [number, number, number];
  haze: number;
  night: number;
}

export interface Scene {
  id: string;
  range: readonly [number, number];
  plate?: string;
  rest: [number, number];
  restMobile?: [number, number];
  gain?: number;
  camera: (p: number) => Camera;
  grade: Grade;
  bands: number;
  post: number;
  paint: number;
  bg: [number, number, number];
  /** title rect in stage uv (x, y, w), drawn into the plate behind near depth */
  title?: [number, number, number];
  titleMobile?: [number, number, number];
}

const ease = (p: number) => p * p * (3 - 2 * p);

const NIGHT: Grade = { shadow: [0.1, 0.06, 0.22], high: [1.04, 0.98, 1.06], hazeCol: [0.16, 0.12, 0.3], haze: 0.22, night: 0.35 };
const GOLDEN: Grade = { shadow: [0.1, 0.16, 0.22], high: [1.06, 1.0, 0.9], hazeCol: [0.82, 0.6, 0.46], haze: 0.28, night: 0.08 };
const WARM: Grade = { shadow: [0.12, 0.08, 0.2], high: [1.06, 1.0, 0.92], hazeCol: [0.5, 0.36, 0.4], haze: 0.2, night: 0.3 };
const COLD: Grade = { shadow: [0.04, 0.14, 0.24], high: [0.94, 1.0, 1.06], hazeCol: [0.12, 0.3, 0.4], haze: 0.25, night: 0.3 };
const DUSK: Grade = { shadow: [0.1, 0.08, 0.22], high: [1.06, 0.98, 0.94], hazeCol: [0.7, 0.45, 0.55], haze: 0.3, night: 0.1 };

const dwell = (o: { pan?: [number, number]; zoom?: [number, number]; rack?: [number, number]; dof?: number; focusUv?: [number, number] }) => (p: number): Camera => {
  const e = ease(p);
  const rack = o.rack ?? [0.3, 0.3];
  const f = rack[0] + (rack[1] - rack[0]) * Math.min(1, Math.max(0, (p - 0.35) / 0.3));
  return {
    pan: [(o.pan?.[0] ?? 0) * e, (o.pan?.[1] ?? 0) * e],
    zoom: (o.zoom?.[0] ?? 1) + ((o.zoom?.[1] ?? 1) - (o.zoom?.[0] ?? 1)) * e,
    focusDepth: f,
    dof: o.dof ?? 3,
    focusUv: o.focusUv ?? [0.5, 0.5],
  };
};

export const SCENES: Scene[] = [
  {
    id: "hero", range: SEG.hero, plate: "hero", rest: [0.45, 0.5], restMobile: [0.5, 0.5], gain: 0.95,
    camera: dwell({ pan: [-0.02, 0.0], zoom: [1.0, 1.1], rack: [0.3, 0.3], dof: 3, focusUv: [0.4, 0.55] }),
    grade: NIGHT, bands: 6, post: 1, paint: 0.04, bg: [0.03, 0.02, 0.07],
    title: [0.06, 0.2, 0.74], titleMobile: [0.04, 0.16, 0.92],
  },
  {
    id: "gates", range: SEG.gates, plate: "ramp", rest: [0.45, 0.5], restMobile: [0.42, 0.5], gain: 0.9,
    camera: dwell({ pan: [-0.05, 0.0], zoom: [1.06, 1.0], rack: [0.3, 0.75], dof: 3.5, focusUv: [0.5, 0.55] }),
    grade: NIGHT, bands: 6, post: 1, paint: 0.04, bg: [0.03, 0.02, 0.07],
  },
  {
    id: "checkin", range: SEG.checkin, plate: "hall", rest: [0.5, 0.5], restMobile: [0.5, 0.5], gain: 0.72,
    camera: dwell({ pan: [-0.04, 0.0], zoom: [1.0, 1.06], rack: [0.7, 0.7], dof: 3, focusUv: [0.5, 0.5] }),
    grade: WARM, bands: 6, post: 1, paint: 0.04, bg: [0.07, 0.04, 0.12],
  },
  {
    id: "security", range: SEG.security, plate: "lane", rest: [0.5, 0.5], restMobile: [0.5, 0.5], gain: 0.75,
    camera: dwell({ pan: [-0.03, 0.01], zoom: [1.0, 1.08], rack: [0.6, 0.6], dof: 3, focusUv: [0.4, 0.5] }),
    grade: COLD, bands: 5, post: 1, paint: 0.04, bg: [0.01, 0.03, 0.06],
  },
  {
    id: "gate", range: SEG.gate, plate: "dawn", rest: [0.5, 0.45], restMobile: [0.55, 0.45], gain: 0.9,
    camera: dwell({ pan: [-0.03, 0.0], zoom: [1.0, 1.08], rack: [0.8, 0.3], dof: 3.5, focusUv: [0.5, 0.45] }),
    grade: GOLDEN, bands: 6, post: 1, paint: 0.04, bg: [0.1, 0.06, 0.2],
  },
  {
    id: "boarding", range: SEG.boarding, plate: "runway", rest: [0.5, 0.55], restMobile: [0.5, 0.55], gain: 0.95,
    camera: dwell({ pan: [-0.03, 0.0], zoom: [1.0, 1.08], rack: [0.3, 0.3], dof: 3, focusUv: [0.5, 0.5] }),
    grade: DUSK, bands: 6, post: 1, paint: 0.04, bg: [0.03, 0.02, 0.07],
  },
];

export const PLATE_NAMES = Array.from(new Set(SCENES.flatMap((s) => (s.plate ? [s.plate] : []))));

export interface PlateCredit { id: string; title: string; author: string; source: string; licence: string }
export { PLATE_CREDITS } from "./plateCredits";
