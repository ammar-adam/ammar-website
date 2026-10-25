/* Plate scenes for the Film canvas. One photographic plate per segment
   (paint-baked colour + depth matte in public/plates), a camera function of
   local progress, and a restrained per-scene grade. Credits in
   public/plates/PLATES.md and at /credits. */

import { SEG } from "./timeline";

export interface Camera {
  /** pan in stage uv (near depth moves by this, sky by 20% of it) */
  pan: [number, number];
  zoom: number;
  /** depth value (0 sky .. 1 near) that is in focus */
  focusDepth: number;
  /** chromatic split in px off the focus plane */
  dof: number;
  /** focus point in stage uv (0,0 top-left), split direction is radial from it */
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
  /** crop anchor on the plate (0..1) at rest, and on phones */
  rest: [number, number];
  restMobile?: [number, number];
  gain?: number;
  camera: (p: number) => Camera;
  grade: Grade;
  bands: number;
  post: number;
  paint: number;
  bg: [number, number, number];
}

const ease = (p: number) => p * p * (3 - 2 * p);

const NIGHT: Grade = { shadow: [0.1, 0.06, 0.22], high: [1.04, 0.98, 1.06], hazeCol: [0.16, 0.12, 0.3], haze: 0.2, night: 0.55 };
const RAMP: Grade = { shadow: [0.14, 0.08, 0.34], high: [0.78, 0.7, 0.96], hazeCol: [0.12, 0.08, 0.26], haze: 0.32, night: 1.0 };
const GOLDEN: Grade = { shadow: [0.1, 0.16, 0.22], high: [1.06, 1.0, 0.9], hazeCol: [0.82, 0.6, 0.46], haze: 0.28, night: 0.08 };
const WARM: Grade = { shadow: [0.12, 0.08, 0.2], high: [1.06, 1.0, 0.92], hazeCol: [0.5, 0.36, 0.4], haze: 0.22, night: 0.15 };
const COLD: Grade = { shadow: [0.04, 0.14, 0.24], high: [0.94, 1.0, 1.06], hazeCol: [0.12, 0.3, 0.4], haze: 0.25, night: 0.3 };
const DUSK: Grade = { shadow: [0.1, 0.08, 0.22], high: [1.06, 0.98, 0.94], hazeCol: [0.7, 0.45, 0.55], haze: 0.3, night: 0.1 };

/** A dwell with one camera idea: push-in, rack focus (far -> near), or both. */
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
  { id: "cold", range: SEG.cold, rest: [0.5, 0.5], camera: dwell({}), grade: NIGHT, bands: 6, post: 0, paint: 0.03, bg: [0.02, 0.016, 0.035] },
  {
    id: "airports", range: SEG.airports, plate: "ramp", rest: [0.5, 0.55], restMobile: [0.45, 0.55], gain: 0.4,
    // ramp: hold on the far terminal, then rack focus to the kid in the near field
    camera: dwell({ pan: [-0.06, 0.0], zoom: [1.0, 1.12], rack: [0.25, 0.85], dof: 3.5, focusUv: [0.5, 0.55] }),
    grade: RAMP, bands: 6, post: 1, paint: 0.04, bg: [0.03, 0.02, 0.07],
  },
  {
    id: "checkin", range: SEG.checkin, plate: "hall", rest: [0.5, 0.45], restMobile: [0.5, 0.45], gain: 0.9,
    camera: dwell({ pan: [-0.05, 0.0], zoom: [1.0, 1.06], rack: [0.65, 0.65], dof: 3, focusUv: [0.5, 0.5] }),
    grade: WARM, bands: 6, post: 1, paint: 0.04, bg: [0.07, 0.04, 0.12],
  },
  {
    id: "big", range: SEG.big, plate: "stage", rest: [0.5, 0.3], gain: 0.6,
    camera: dwell({ pan: [0.02, 0.0], zoom: [1.04, 1.1], rack: [0.5, 0.5], dof: 4, focusUv: [0.5, 0.5] }),
    grade: NIGHT, bands: 5, post: 1, paint: 0.04, bg: [0.02, 0.015, 0.035],
  },
  {
    id: "security", range: SEG.security, plate: "lane", rest: [0.5, 0.5], restMobile: [0.5, 0.5], gain: 0.8,
    camera: dwell({ pan: [-0.03, 0.01], zoom: [1.0, 1.08], rack: [0.6, 0.6], dof: 3, focusUv: [0.4, 0.5] }),
    grade: COLD, bands: 5, post: 1, paint: 0.04, bg: [0.01, 0.03, 0.06],
  },
  {
    id: "gate", range: SEG.gate, plate: "gate", rest: [0.5, 0.5], restMobile: [0.55, 0.5], gain: 0.95,
    // gate: focus on the photos' plane (near glass) then rack out to the parked plane
    camera: dwell({ pan: [-0.05, 0.0], zoom: [1.0, 1.05], rack: [0.8, 0.3], dof: 3.5, focusUv: [0.6, 0.45] }),
    grade: DUSK, bands: 6, post: 1, paint: 0.04, bg: [0.06, 0.03, 0.12],
  },
  {
    id: "off", range: SEG.off, plate: "dawn", rest: [0.5, 0.45], restMobile: [0.55, 0.45], gain: 0.88,
    camera: dwell({ pan: [-0.02, 0.0], zoom: [1.0, 1.12], rack: [0.3, 0.3], dof: 3, focusUv: [0.5, 0.45] }),
    grade: GOLDEN, bands: 6, post: 1, paint: 0.04, bg: [0.1, 0.06, 0.2],
  },
  {
    id: "boarding", range: SEG.boarding, plate: "runway", rest: [0.5, 0.5], restMobile: [0.5, 0.5], gain: 0.95,
    camera: dwell({ pan: [-0.04, 0.0], zoom: [1.0, 1.08], rack: [0.3, 0.3], dof: 3, focusUv: [0.5, 0.5] }),
    grade: DUSK, bands: 6, post: 1, paint: 0.04, bg: [0.03, 0.02, 0.07],
  },
];

export const PLATE_NAMES = Array.from(new Set(SCENES.flatMap((s) => (s.plate ? [s.plate] : []))));

/** Where each plate came from (shown at /credits). Filled by the bake step. */
export interface PlateCredit { id: string; title: string; author: string; source: string; licence: string }
export { PLATE_CREDITS } from "./plateCredits";
