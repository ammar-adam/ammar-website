/* Plate scenes for the Film canvas. Each segment has photographic layers
   (the owner's own photos) that the camera parallaxes; the print process
   (posterise, halftone in shadows, chromatic split as depth of field,
   hatching, paint texture, grade) is applied per frame by the shader. */

import { SEG } from "./timeline";

export interface Layer {
  /** plate name in public/plates (name-1600.webp / name-800.webp) */
  plate: string;
  /** chromatic split in px for this layer as a function of local progress; 0 = in focus */
  dof: (p: number) => number;
  /** horizontal pan in viewport widths (parallax), and zoom about the focus point */
  x?: (p: number) => number;
  y?: (p: number) => number;
  scale?: (p: number) => number;
  /** which part of the plate to frame when it is cropped: 0 = top/left, 1 = bottom/right */
  focus?: [number, number];
  /** vertical soft mask in stage uv (0 = bottom, 1 = top): [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd] */
  mask?: [number, number, number, number];
  /** per-layer brightness */
  gain?: number;
}

export interface Grade {
  shadow: [number, number, number];
  high: [number, number, number];
  sat: number;
  lift: number;
  gamma: number;
  /** overall darkness, 0..1 */
  night: number;
}

export interface Scene {
  id: string;
  range: readonly [number, number];
  layers: Layer[];
  grade: Grade;
  bands: number;
  halftone: number;
  hatch: number;
  paint: number;
  /** solid colour drawn before the layers */
  bg: [number, number, number];
}

const lin = (a: number, b: number) => (p: number) => a + (b - a) * p;

const NIGHT: Grade = { shadow: [0.3, 0.2, 0.72], high: [1.0, 0.8, 0.66], sat: 1.35, lift: 0.02, gamma: 1.0, night: 0.42 };
const WARM: Grade = { shadow: [0.4, 0.22, 0.5], high: [1.0, 0.88, 0.68], sat: 1.1, lift: 0.0, gamma: 1.12, night: 0.6 };
const DARK: Grade = { shadow: [0.2, 0.1, 0.35], high: [1.0, 0.95, 0.85], sat: 1.0, lift: 0.0, gamma: 1.1, night: 0.75 };
const COLD: Grade = { shadow: [0.05, 0.3, 0.55], high: [0.7, 0.95, 1.0], sat: 0.9, lift: 0.02, gamma: 1.05, night: 0.7 };
const DUSK: Grade = { shadow: [0.3, 0.18, 0.55], high: [1.0, 0.82, 0.6], sat: 1.3, lift: 0.03, gamma: 0.98, night: 0.2 };
const GOLD: Grade = { shadow: [0.22, 0.26, 0.55], high: [1.0, 0.82, 0.58], sat: 1.4, lift: 0.03, gamma: 0.98, night: 0.2 };

export const SCENES: Scene[] = [
  {
    id: "cold",
    range: SEG.cold,
    layers: [],
    grade: DARK,
    bands: 6, halftone: 0.2, hatch: 0, paint: 0.1,
    bg: [0.02, 0.016, 0.035],
  },
  {
    id: "airports",
    range: SEG.airports,
    layers: [
      // sky + far skyline: soft, slow
      { plate: "ramp", dof: lin(6, 3), x: lin(0, -0.05), scale: () => 1.12, focus: [0.5, 0.4], mask: [0.3, 0.4, 1.1, 1.2], gain: 1.15 },
      // apron: the dark foreground of the same plate, sharper, faster
      { plate: "window", dof: () => 1.5, x: lin(0, -0.14), scale: () => 1.3, focus: [0.5, 0.7], mask: [-0.2, -0.1, 0.28, 0.36], gain: 0.28 },
    ],
    grade: NIGHT,
    bands: 6, halftone: 0.9, hatch: 0.5, paint: 0.14,
    bg: [0.03, 0.02, 0.07],
  },
  {
    id: "checkin",
    range: SEG.checkin,
    layers: [
      { plate: "hall", dof: lin(5, 5), x: lin(0, -0.08), scale: () => 1.18, focus: [0.5, 0.15], gain: 0.42 },
    ],
    grade: WARM,
    bands: 5, halftone: 1.0, hatch: 0.7, paint: 0.16,
    bg: [0.07, 0.04, 0.12],
  },
  {
    id: "big",
    range: SEG.big,
    layers: [
      { plate: "stage", dof: () => 4, x: lin(0.02, -0.04), scale: () => 1.1, focus: [0.5, 0.3], gain: 0.55 },
    ],
    grade: DARK,
    bands: 5, halftone: 1.0, hatch: 0.4, paint: 0.14,
    bg: [0.02, 0.015, 0.035],
  },
  {
    id: "security",
    range: SEG.security,
    layers: [
      { plate: "lane", dof: () => 5, x: lin(0, -0.05), y: lin(0, 0.04), scale: () => 1.25, focus: [0.5, 0.65], gain: 0.5 },
    ],
    grade: COLD,
    bands: 5, halftone: 1.0, hatch: 0.6, paint: 0.14,
    bg: [0.01, 0.03, 0.06],
  },
  {
    id: "gate",
    range: SEG.gate,
    layers: [
      { plate: "window", dof: lin(5, 4), x: lin(0, -0.1), scale: () => 1.15, focus: [0.5, 0.5], gain: 0.9 },
    ],
    grade: DUSK,
    bands: 6, halftone: 0.8, hatch: 0.4, paint: 0.14,
    bg: [0.06, 0.03, 0.12],
  },
  {
    id: "off",
    range: SEG.off,
    layers: [
      { plate: "dusk", dof: lin(5, 2), x: lin(0.02, -0.03), scale: lin(1.08, 1.14), focus: [0.45, 0.42], gain: 1.0 },
    ],
    grade: GOLD,
    bands: 6, halftone: 0.75, hatch: 0.5, paint: 0.16,
    bg: [0.1, 0.06, 0.2],
  },
  {
    id: "boarding",
    range: SEG.boarding,
    layers: [
      { plate: "sunset", dof: lin(5, 4), x: lin(0, -0.06), scale: () => 1.12, focus: [0.5, 0.5], gain: 0.85 },
    ],
    grade: NIGHT,
    bands: 6, halftone: 0.85, hatch: 0.5, paint: 0.14,
    bg: [0.03, 0.02, 0.07],
  },
];

export const PLATE_NAMES = Array.from(new Set(SCENES.flatMap((s) => s.layers.map((l) => l.plate))));
