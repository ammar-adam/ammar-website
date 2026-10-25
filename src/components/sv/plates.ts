import { BEATS, SWINGS, type SwingState } from "./geometry";
import creditsJson from "./credits.json";

/**
 * Photographic plates and how the camera and print process treat each one.
 * uv coordinates are plate-relative, 0 = top-left. Sources and licences in /PLATES.md
 * and /credits.
 */
export interface Plate {
  id: string;
  credit: string;
  hero?: boolean;
  night: boolean;
  grade: { shadow: [number, number, number]; high: [number, number, number] };
  hazeCol: [number, number, number];
  haze: number;
  zoom: number;
  rest: [number, number];
  restMobile: [number, number];
  /** key light side for the figure's rim */
  key: "left" | "right";
  /** web anchor (a tower top) and its depth */
  anchor?: { uv: [number, number]; depth: number };
  /** where feet land, and its depth */
  perch?: { uv: [number, number]; depth: number };
  /** content surfaces: four plate-uv corners TL, TR, BR, BL and a depth */
  surfaces?: Record<string, { quad: Array<[number, number]>; depth: number }>;
  /** narrower quads for a portrait viewport */
  surfacesMobile?: Record<string, { quad: Array<[number, number]>; depth: number }>;
}

const credits = creditsJson as Array<{ id: string; author: string; license: string }>;
const cr = (id: string) => {
  const c = credits.find((x) => x.id === id);
  return c ? `${c.author.replace(/ from .*$/, "")}, ${c.license}` : id;
};

const GOLD = { shadow: [0.1, 0.16, 0.22] as [number, number, number], high: [1.06, 1.0, 0.9] as [number, number, number] };
const NIGHT = { shadow: [0.1, 0.06, 0.22] as [number, number, number], high: [1.04, 0.98, 1.06] as [number, number, number] };

export const PLATES: Plate[] = [
  {
    id: "dusk-a", credit: cr("dusk-a"), hero: true, night: false, grade: GOLD, hazeCol: [0.82, 0.58, 0.48], haze: 0.2, zoom: 1.08, rest: [0.0, 0.02], restMobile: [-0.12, 0.0], key: "left",
    anchor: { uv: [0.377, 0.09], depth: 0.3 },
  },
  {
    id: "gardiner", credit: cr("gardiner"), night: false, grade: GOLD, hazeCol: [0.78, 0.5, 0.42], haze: 0.2, zoom: 1.08, rest: [0.0, 0.0], restMobile: [0.1, 0.0], key: "left",
    anchor: { uv: [0.96, 0.1], depth: 1 },
    surfaces: { board: { quad: [[0.06, 0.1], [0.44, 0.08], [0.44, 0.44], [0.06, 0.46]], depth: 0.1 } },
    surfacesMobile: { board: { quad: [[0.42, 0.14], [0.6, 0.13], [0.6, 0.5], [0.42, 0.51]], depth: 0.1 } },
  },
  {
    id: "polson", credit: cr("polson"), night: false, grade: { shadow: [0.1, 0.12, 0.24], high: [1.04, 1.0, 0.98] }, hazeCol: [0.7, 0.62, 0.7], haze: 0.18, zoom: 1.08, rest: [0.0, 0.02], restMobile: [1.0, 0.02], key: "right",
    anchor: { uv: [0.237, 0.27], depth: 0.3 },
    surfaces: { wall: { quad: [[0.5, 0.33], [0.9, 0.3], [0.9, 0.72], [0.5, 0.72]], depth: 0.3 } },
    surfacesMobile: { wall: { quad: [[0.55, 0.28], [0.72, 0.26], [0.72, 0.7], [0.55, 0.72]], depth: 0.3 } },
  },
  {
    id: "night-unsplash", credit: cr("night-unsplash"), night: true, grade: NIGHT, hazeCol: [0.22, 0.14, 0.34], haze: 0.2, zoom: 1.08, rest: [0.0, 0.0], restMobile: [-0.08, 0.0], key: "right",
    surfaces: {
      face: { quad: [[0.3, 0.4], [0.62, 0.44], [0.6, 0.9], [0.28, 0.88]], depth: 0.8 },
      sign: { quad: [[0.64, 0.7], [0.84, 0.68], [0.84, 0.9], [0.64, 0.92]], depth: 0.6 },
    },
    surfacesMobile: {
      face: { quad: [[0.37, 0.3], [0.59, 0.32], [0.59, 0.52], [0.37, 0.5]], depth: 0.8 },
      sign: { quad: [[0.39, 0.56], [0.57, 0.56], [0.57, 0.7], [0.39, 0.71]], depth: 0.6 },
    },
  },
  {
    id: "dundas", credit: cr("dundas"), night: true, grade: NIGHT, hazeCol: [0.2, 0.14, 0.32], haze: 0.15, zoom: 1.55, rest: [-0.06, -0.12], restMobile: [-1.41, -0.14], key: "left",
    surfaces: { screen: { quad: [[0.19, 0.38], [0.31, 0.35], [0.31, 0.6], [0.2, 0.63]], depth: 0.5 } },
    surfacesMobile: { screen: { quad: [[0.18, 0.32], [0.3, 0.3], [0.3, 0.62], [0.18, 0.65]], depth: 0.5 } },
  },
  {
    id: "night-2025", credit: cr("night-2025"), night: true, grade: NIGHT, hazeCol: [0.24, 0.16, 0.34], haze: 0.22, zoom: 1.06, rest: [0.0, 0.0], restMobile: [0.0, 0.0], key: "left",
  },
  {
    id: "by-night", credit: cr("by-night"), night: true, grade: { shadow: [0.12, 0.07, 0.2], high: [1.08, 0.98, 0.88] }, hazeCol: [0.2, 0.12, 0.2], haze: 0.1, zoom: 1.06, rest: [0.0, 0.0], restMobile: [1.25, 0.0], key: "left",
    surfaces: { wall: { quad: [[0.78, 0.24], [0.99, 0.08], [0.99, 0.86], [0.78, 0.76]], depth: 1 } },
    surfacesMobile: { wall: { quad: [[0.8, 0.2], [0.97, 0.1], [0.97, 0.86], [0.8, 0.78]], depth: 1 } },
  },
  {
    id: "gfx-pano", credit: cr("gfx-pano"), hero: true, night: true, grade: { shadow: [0.1, 0.08, 0.22], high: [1.06, 1.0, 0.9] }, hazeCol: [0.3, 0.22, 0.26], haze: 0.2, zoom: 1.08, rest: [0.31, 0.02], restMobile: [0.42, 0.02], key: "right",
    anchor: { uv: [0.56, 0.3], depth: 0.3 },
    perch: { uv: [0.8, 0.7], depth: 1 },
  },
  {
    id: "aerial-night", credit: cr("aerial-night"), night: true, grade: NIGHT, hazeCol: [0.2, 0.14, 0.3], haze: 0.25, zoom: 1.1, rest: [0.0, 0.0], restMobile: [0.0, 0.0], key: "left",
  },
];

export const BY_BEAT: Record<(typeof BEATS)[number]["id"], string> = {
  cover: "dusk-a",
  origins: "gardiner",
  roles: "polson",
  spotlight: "night-unsplash",
  projects: "dundas",
  photos: "night-2025",
  offclock: "by-night",
  landing: "gfx-pano",
};

export const byId = new Map(PLATES.map((p) => [p.id, p]));
export const plateOf = (beat: (typeof BEATS)[number]["id"]) => byId.get(BY_BEAT[beat])!;

export interface Shot {
  plate: Plate;
  zoom: number;
  pan: [number, number];
  dip: number;
  rot: number;
  focus: number;
  dofAmt: number;
  focusUv: [number, number];
  dark: number;
  /** cover title: centre x, y and width in canvas uv */
  title: { x: number; y: number; w: number } | null;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * The camera for a scroll state. Every dwell does one camera idea (a push, a rack focus
 * or a tilt); swings move for real; whip pans cut through the aerial plate.
 */
export function plateForBeat(s: SwingState, mobile: boolean): Shot {
  const beatId = BEATS[s.beat].id;
  let plate = plateOf(beatId);
  const rest = (p: Plate) => (mobile ? p.restMobile : p.rest);
  let pan: [number, number] = [...rest(plate)] as [number, number];
  let dip = 0;
  let rot = 0;
  let zoom = plate.zoom;
  let focus = 0.3;
  let dofAmt = 3;
  let focusUv: [number, number] = [0.5, 0.5];
  let dark = 0;
  let title: Shot["title"] = null;
  const p = s.p;

  if (s.index >= 0 && s.kind) {
    const t = s.phase;
    const sw = SWINGS[s.index];
    const from = plateOf(BEATS[sw.to - 1].id);
    const i = Math.sin(Math.PI * t);
    if (s.kind === "whip") {
      if (t < 0.5) {
        plate = from;
        pan = [rest(from)[0] + t * 0.5, rest(from)[1]];
      } else {
        pan = [rest(plate)[0] - (1 - t) * 0.5, rest(plate)[1]];
      }
      dofAmt = 6;
      focus = 1;
      zoom = plate.zoom + 0.06;
    } else if (s.kind === "freefall") {
      plate = t < 0.3 ? from : plate;
      const k = Math.max(0, (t - 0.3) / 0.7);
      dip = -k * 0.14;
      zoom = plate.zoom + k * 0.3;
      rot = (k * 12 * Math.PI) / 180;
      focus = lerp(0.3, 0.85, k);
      dofAmt = 3 + k * 3;
      focusUv = [0.42, 0.6];
    } else if (s.kind === "run") {
      plate = t < 0.4 ? from : plate;
      pan = [rest(plate)[0] + (t - 0.4) * 0.08, rest(plate)[1]];
      focus = plate === from ? 0.8 : 0.5;
    } else {
      plate = t < 0.5 ? from : plate;
      const k = t < 0.5 ? t : t - 1;
      pan = [rest(plate)[0] + k * 0.1, rest(plate)[1]];
      dip = -i * 0.04;
      zoom = plate.zoom + i * 0.03;
      focus = 0.3;
      dofAmt = 3 + i * 3;
      if (s.kind === "landing") focus = t > 0.5 ? lerp(0.3, 1, (t - 0.5) * 2) : 0.3;
    }
  } else {
    /* dwells: one camera idea each */
    switch (beatId) {
      case "cover":
        zoom = plate.zoom + ease(p) * 0.12;
        focus = lerp(0.3, 0.55, p);
        dark = Math.max(0, 0.3 - p * 0.9);
        title = { x: mobile ? 0.58 : 0.52, y: mobile ? 0.3 : 0.33, w: mobile ? 0.8 : 0.78 };
        break;
      case "origins":
        dip = lerp(-0.03, 0.03, ease(p));
        focus = 0.3;
        break;
      case "roles":
        focus = lerp(0.3, 0.9, ease(p)); // rack focus: the boats and the towers trade sharpness
        dofAmt = 4;
        focusUv = [0.6, 0.6];
        break;
      case "spotlight":
        rot = (12 * Math.PI) / 180;
        zoom = plate.zoom + 0.3 + ease(p) * 0.08;
        dip = -0.14;
        focus = 0.85;
        focusUv = [0.42, 0.6];
        break;
      case "projects":
        zoom = plate.zoom + ease(p) * 0.15;
        focus = 0.5;
        break;
      case "photos":
        pan = [rest(plate)[0] + ease(p) * 0.08, rest(plate)[1]];
        focus = 1;
        break;
      case "offclock":
        dip = lerp(0.02, -0.02, ease(p));
        focus = 1;
        break;
      case "landing":
        zoom = plate.zoom + ease(p) * 0.08;
        focus = lerp(1, 0.3, ease(p));
        break;
    }
  }
  return { plate, zoom, pan, dip, rot, focus, dofAmt, focusUv, dark, title };
}

/** Plates worth having in memory for this scroll state: the current beat and its neighbours. */
export function platesNear(s: SwingState): Plate[] {
  const ids = new Set<string>();
  for (let i = Math.max(0, s.beat - 1); i <= Math.min(BEATS.length - 1, s.beat + 1); i++) ids.add(BY_BEAT[BEATS[i].id]);
  ids.add("aerial-night");
  return [...ids].map((id) => byId.get(id)!);
}
