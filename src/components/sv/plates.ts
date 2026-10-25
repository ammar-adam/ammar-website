/* Photographic camera setups. Each shot moves through the terminal rather
   than floating in place; the nearest depth planes travel slightly faster. */

import { SEG } from "./timeline";

export interface Camera {
  pan: [number, number];
  zoom: number;
  travel: number;
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
  plate: string;
  rest: [number, number];
  restMobile?: [number, number];
  gain: number;
  camera: (p: number) => Camera;
  grade: Grade;
  bands: number;
  post: number;
  paint: number;
  bg: [number, number, number];
}

const NIGHT: Grade = { shadow: [0.025, 0.23, 0.35], high: [1.0, 0.81, 0.48], hazeCol: [0.07, 0.29, 0.39], haze: 0.065, night: 0.08 };
const TERMINAL: Grade = { shadow: [0.03, 0.20, 0.29], high: [1.0, 0.76, 0.43], hazeCol: [0.59, 0.39, 0.25], haze: 0.055, night: 0.0 };
const SECURITY: Grade = { shadow: [0.025, 0.23, 0.34], high: [1.0, 0.83, 0.55], hazeCol: [0.11, 0.34, 0.43], haze: 0.06, night: 0.0 };
const GOLDEN: Grade = { shadow: [0.035, 0.25, 0.34], high: [1.0, 0.82, 0.48], hazeCol: [0.91, 0.50, 0.29], haze: 0.085, night: 0.0 };

const move = (o: {
  pan: [number, number]; zoom: [number, number];
  rack: [number, number]; focus: [number, number]; dof?: number;
}) => (p: number): Camera => {
  const v = Math.max(0, Math.min(1, p));
  const e = v * 0.2 + v * v * (3 - 2 * v) * 0.8;
  const rack = Math.max(0, Math.min(1, (v - 0.2) / 0.65));
  return {
    pan: [o.pan[0] * (e - 0.35), o.pan[1] * e],
    zoom: o.zoom[0] + (o.zoom[1] - o.zoom[0]) * e,
    travel: e,
    focusDepth: o.rack[0] + (o.rack[1] - o.rack[0]) * rack,
    dof: o.dof ?? 3.2,
    focusUv: o.focus,
  };
};

export const SCENES: Scene[] = [
  {
    id: "hero", range: SEG.hero, plate: "hero", rest: [0.47, 0.48], restMobile: [0.46, 0.5], gain: 1.15,
    camera: move({ pan: [-0.032, 0.004], zoom: [1.055, 1.22], rack: [0.3, 0.48], focus: [0.43, 0.58] }),
    grade: NIGHT, bands: 6, post: 0.92, paint: 0.15, bg: [0.018, 0.037, 0.065],
  },
  {
    id: "checkin", range: SEG.checkin, plate: "hall", rest: [0.5, 0.47], restMobile: [0.5, 0.48], gain: 1.04,
    camera: move({ pan: [-0.045, 0.007], zoom: [1.06, 1.34], rack: [0.72, 0.42], focus: [0.5, 0.46], dof: 3.5 }),
    grade: TERMINAL, bands: 6, post: 0.9, paint: 0.13, bg: [0.02, 0.04, 0.06],
  },
  {
    id: "security", range: SEG.security, plate: "lane", rest: [0.5, 0.48], restMobile: [0.55, 0.48], gain: 1.06,
    camera: move({ pan: [-0.065, 0.006], zoom: [1.07, 1.29], rack: [0.7, 0.45], focus: [0.55, 0.5] }),
    grade: SECURITY, bands: 6, post: 0.92, paint: 0.14, bg: [0.015, 0.04, 0.065],
  },
  {
    id: "gate", range: SEG.gate, plate: "dawn", rest: [0.5, 0.47], restMobile: [0.5, 0.47], gain: 1.08,
    camera: move({ pan: [-0.042, -0.007], zoom: [1.06, 1.22], rack: [0.72, 0.28], focus: [0.5, 0.47], dof: 3.8 }),
    grade: GOLDEN, bands: 7, post: 0.88, paint: 0.12, bg: [0.04, 0.065, 0.08],
  },
  {
    id: "boarding", range: SEG.boarding, plate: "runway", rest: [0.5, 0.52], restMobile: [0.52, 0.52], gain: 1.02,
    camera: move({ pan: [-0.035, -0.018], zoom: [1.06, 1.27], rack: [0.45, 0.22], focus: [0.5, 0.48], dof: 3.8 }),
    grade: GOLDEN, bands: 7, post: 0.9, paint: 0.13, bg: [0.025, 0.045, 0.065],
  },
];

export const PLATE_NAMES = Array.from(new Set(SCENES.map((scene) => scene.plate)));

export interface PlateCredit { id: string; title: string; author: string; source: string; licence: string }
export { PLATE_CREDITS } from "./plateCredits";
