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
  roll: number;
  crop?: [number, number];
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

const NIGHT: Grade = { shadow: [0.025, 0.25, 0.37], high: [1.0, 0.81, 0.48], hazeCol: [0.07, 0.29, 0.39], haze: 0.055, night: 0.04 };
const TERMINAL: Grade = { shadow: [0.03, 0.23, 0.32], high: [1.0, 0.76, 0.43], hazeCol: [0.59, 0.39, 0.25], haze: 0.045, night: 0.0 };
const SECURITY: Grade = { shadow: [0.025, 0.23, 0.34], high: [1.0, 0.83, 0.55], hazeCol: [0.11, 0.34, 0.43], haze: 0.06, night: 0.0 };
const GOLDEN: Grade = { shadow: [0.035, 0.25, 0.34], high: [1.0, 0.82, 0.48], hazeCol: [0.91, 0.50, 0.29], haze: 0.085, night: 0.0 };

type ShotKey = {
  at: number; zoom: number; travel: number; focusDepth: number;
  pan?: [number, number]; roll?: number; dof?: number;
};

// Camera beats share the story's local progress. The world remains fluid while
// the character and typography can hold frames independently above the plate.
const shot = (focus: [number, number], keys: ShotKey[], anchor?: [number, number]) => (p: number): Camera => {
  const v = Math.max(0, Math.min(1, p));
  const next = keys.findIndex((key) => key.at >= v);
  const b = keys[next < 0 ? keys.length - 1 : next];
  const a = keys[Math.max(0, (next < 0 ? keys.length - 1 : next) - 1)];
  const fraction = a === b ? 0 : (v - a.at) / (b.at - a.at);
  const eased = fraction * fraction * (3 - 2 * fraction);
  const mix = (from: number, to: number) => from + (to - from) * eased;
  const zoom = mix(a.zoom, b.zoom);
  return {
    pan: [mix(a.pan?.[0] ?? 0, b.pan?.[0] ?? 0), mix(a.pan?.[1] ?? 0, b.pan?.[1] ?? 0)],
    zoom, travel: mix(a.travel, b.travel), focusDepth: mix(a.focusDepth, b.focusDepth),
    dof: mix(a.dof ?? 4.5, b.dof ?? 4.5), roll: mix(a.roll ?? 0, b.roll ?? 0), focusUv: focus,
    // Keep the concourse vanishing point attached to the photo corridor's axis.
    crop: anchor ? [anchor[0] + (0.5 - focus[0]) / zoom, anchor[1] + (0.5 - focus[1]) / zoom] : undefined,
  };
};

export const SCENES: Scene[] = [
  {
    id: "hero", range: SEG.hero, plate: "hero", rest: [0.47, 0.48], restMobile: [0.46, 0.5], gain: 1.15,
    camera: shot([0.5, 0.55], [
      { at: 0, zoom: 1.23, travel: 0.3, focusDepth: 0.65, pan: [0.024, -0.012], roll: -0.55 },
      { at: 0.025, zoom: 1.23, travel: 0.3, focusDepth: 0.65, pan: [0.024, -0.012], roll: -0.55 },
      { at: 0.075, zoom: 1.29, travel: 0.56, focusDepth: 0.52, pan: [0.035, -0.025], roll: -3.5 },
      { at: 0.15, zoom: 1.4, travel: 0.92, focusDepth: 0.7, pan: [-0.028, 0.023], roll: 4.2 },
      { at: 0.205, zoom: 1.24, travel: 0.55, focusDepth: 0.43, pan: [-0.016, 0.012], roll: 2.2 },
      { at: 0.285, zoom: 1.15, travel: 0.18, focusDepth: 0.3, pan: [0.015, -0.012], roll: -2.8 },
      { at: 0.34, zoom: 1.2, travel: 0.38, focusDepth: 0.34, pan: [0, 0], roll: 0 },
      { at: 0.49, zoom: 1.14, travel: 0.24, focusDepth: 0.45, pan: [-0.018, 0.003], roll: 0.28 },
      { at: 0.64, zoom: 1.22, travel: 0.56, focusDepth: 0.65, pan: [-0.032, 0.008], roll: 0.48 },
      { at: 0.80, zoom: 1.2, travel: 0.38, focusDepth: 0.38, pan: [0.025, -0.015], roll: -3.2 },
      { at: 0.89, zoom: 1.37, travel: 1.05, focusDepth: 0.65, pan: [-0.022, 0.028], roll: 4.8 },
      { at: 0.94, zoom: 1.32, travel: 0.85, focusDepth: 0.45, pan: [-0.034, 0.016], roll: 2.5 },
      { at: 1, zoom: 1.48, travel: 1.5, focusDepth: 0.2, pan: [-0.035, -0.028], roll: -3.8, dof: 6.5 },
    ]),
    grade: NIGHT, bands: 7, post: 0.82, paint: 0.15, bg: [0.018, 0.037, 0.065],
  },
  {
    id: "checkin", range: SEG.checkin, plate: "hall", rest: [0.5, 0.47], restMobile: [0.5, 0.48], gain: 1.04,
    camera: shot([0.5, 0.44], [
      { at: 0, zoom: 1.08, travel: 0.1, focusDepth: 0.7, pan: [0.028, 0] },
      { at: 0.72, zoom: 1.28, travel: 0.85, focusDepth: 0.42, pan: [-0.027, 0.008] },
      { at: 1, zoom: 1.39, travel: 1.3, focusDepth: 0.28, pan: [-0.035, 0.01] },
    ]),
    grade: TERMINAL, bands: 7, post: 0.8, paint: 0.13, bg: [0.02, 0.04, 0.06],
  },
  {
    id: "security", range: SEG.security, plate: "lane", rest: [0.5, 0.48], restMobile: [0.55, 0.48], gain: 1.06,
    camera: shot([0.54, 0.51], [
      { at: 0, zoom: 1.3, travel: 0.35, focusDepth: 0.72, pan: [0.045, 0.004], roll: 0.35 },
      { at: 0.75, zoom: 1.16, travel: 0.65, focusDepth: 0.42, pan: [-0.035, -0.004], roll: -0.2 },
      { at: 1, zoom: 1.25, travel: 1, focusDepth: 0.34, pan: [-0.046, 0.004] },
    ]),
    grade: SECURITY, bands: 7, post: 0.82, paint: 0.14, bg: [0.015, 0.04, 0.065],
  },
  {
    id: "gate", range: SEG.gate, plate: "hall", rest: [0.5, 0.49], restMobile: [0.5, 0.49], gain: 1.07,
    camera: shot([0.5, 0.44], [
      { at: 0, zoom: 1.04, travel: 0, focusDepth: 0.68, dof: 4 },
      { at: 1, zoom: 1.48, travel: 1.35, focusDepth: 0.26, dof: 5.5 },
    ], [0.5, 0.44]),
    grade: TERMINAL, bands: 8, post: 0.78, paint: 0.12, bg: [0.04, 0.065, 0.08],
  },
  {
    id: "boarding", range: SEG.boarding, plate: "runway", rest: [0.5, 0.52], restMobile: [0.52, 0.52], gain: 1.02,
    camera: shot([0.5, 0.48], [
      { at: 0, zoom: 1.3, travel: 0.9, focusDepth: 0.5, pan: [-0.016, 0.012], roll: 0.3 },
      { at: 0.6, zoom: 1.12, travel: 0.2, focusDepth: 0.3, pan: [0, 0] },
      { at: 1, zoom: 1.12, travel: 0.2, focusDepth: 0.3, pan: [0, 0] },
    ]),
    grade: GOLDEN, bands: 8, post: 0.8, paint: 0.13, bg: [0.025, 0.045, 0.065],
  },
];

export const PLATE_NAMES = Array.from(new Set(SCENES.map((scene) => scene.plate)));

export interface PlateCredit { id: string; title: string; author: string; source: string; licence: string }
export { PLATE_CREDITS } from "./plateCredits";
