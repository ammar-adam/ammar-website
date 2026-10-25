import { BEATS, SWINGS, type SwingState } from "./geometry";

/**
 * Photographic plates and how the camera and print process treat each one.
 * horizon: [sky bottom, far bottom] in plate uv from the top. grade: shadow and
 * highlight tints. Sources and licences in /PLATES.md.
 */
export interface Plate {
  id: string;
  horizon: [number, number];
  grade: { shadow: [number, number, number]; high: [number, number, number] };
  levels?: number;
  /** default framing: zoom (overscan) and resting pan in uv */
  zoom: number;
  rest: [number, number];
}

export const PLATES: Plate[] = [
  // cover: golden hour from the islands, CN Tower and the dome
  { id: "dusk-a", horizon: [0.62, 0.84], grade: { shadow: [0.3, 0.2, 0.5], high: [1.14, 1.0, 0.86] }, levels: 6, zoom: 1.14, rest: [0.02, 0.02] },
  // origins: blue hour from Snake Island
  { id: "dusk-snake", horizon: [0.46, 0.73], grade: { shadow: [0.25, 0.32, 0.65], high: [0.95, 0.98, 1.1] }, levels: 6, zoom: 1.12, rest: [0, 0.04] },
  // roles: Bay Street towers at night from above
  { id: "bay-se", horizon: [0.08, 0.6], grade: { shadow: [0.3, 0.22, 0.6], high: [1.1, 0.95, 0.85] }, levels: 6, zoom: 1.1, rest: [0, 0] },
  // the big one: looking down a tilted Bay Street, the leap
  { id: "bay-south", horizon: [0.2, 0.7], grade: { shadow: [0.32, 0.18, 0.62], high: [0.9, 0.92, 1.15] }, levels: 5, zoom: 1.12, rest: [0, 0] },
  // projects: a rooftop at blue hour, downtown on the horizon
  { id: "night-pano", horizon: [0.5, 0.62], grade: { shadow: [0.22, 0.26, 0.62], high: [1.05, 0.98, 0.9] }, levels: 6, zoom: 1.0, rest: [0, 0] },
  // photos: Yonge-Dundas from above
  { id: "dundas", horizon: [0.02, 0.55], grade: { shadow: [0.3, 0.22, 0.58], high: [1.0, 0.95, 1.08] }, levels: 6, zoom: 1.08, rest: [0, 0] },
  // off the clock: the Gardiner at dusk from a window
  { id: "gardiner", horizon: [0.5, 0.72], grade: { shadow: [0.2, 0.25, 0.6], high: [1.12, 0.95, 0.8] }, levels: 6, zoom: 1.08, rest: [0, 0.02] },
  // landing: Union Station's roof at night
  { id: "union-roof", horizon: [0.45, 0.75], grade: { shadow: [0.34, 0.26, 0.55], high: [1.12, 1.0, 0.86] }, levels: 6, zoom: 1.06, rest: [0, 0.02] },
  // the whip pans: the whole city at night from the west
  { id: "aerial-night", horizon: [0.5, 0.75], grade: { shadow: [0.22, 0.2, 0.55], high: [1.05, 0.98, 0.9] }, levels: 5, zoom: 1.1, rest: [0, 0] },
];

const BY_BEAT: Record<(typeof BEATS)[number]["id"], string> = {
  cover: "dusk-a",
  origins: "dusk-snake",
  roles: "bay-se",
  spotlight: "bay-south",
  projects: "night-pano",
  photos: "dundas",
  offclock: "gardiner",
  landing: "union-roof",
};

const byId = new Map(PLATES.map((p) => [p.id, p]));

export interface Shot {
  plate: Plate;
  zoom: number;
  pan: [number, number];
  dip: number;
  dof: [number, number, number];
  dark: number;
}

/**
 * The camera for a scroll state: which plate, how far it has panned (a slow dolly
 * during a dwell, a real move during a swing), how it dips, and how much each depth
 * band misregisters. Whip pans cut to the aerial plate mid-swing.
 */
export function plateForBeat(s: SwingState): Shot {
  const beatId = BEATS[s.beat].id;
  let plate = byId.get(BY_BEAT[beatId])!;
  let pan: [number, number] = [plate.rest[0], plate.rest[1]];
  let dip = 0;
  let dof: [number, number, number] = [2.5, 1, 4];
  let zoom = plate.zoom;
  let dark = beatId === "cover" ? Math.max(0, 0.32 - s.p * 0.8) : 0;

  if (s.index >= 0 && s.kind) {
    const t = s.phase;
    const sw = SWINGS[s.index];
    const from = byId.get(BY_BEAT[BEATS[sw.to - 1].id])!;
    if (s.kind === "whip") {
      // first half: whip the old plate out; second half: whip the new one in
      if (t < 0.5) {
        plate = from;
        pan = [from.rest[0] + t * 0.6, from.rest[1]];
      } else {
        pan = [plate.rest[0] - (1 - t) * 0.6, plate.rest[1]];
      }
      dof = [6, 7, 9];
      zoom = plate.zoom + 0.08;
    } else if (s.kind === "freefall") {
      plate = t < 0.3 ? from : plate;
      dip = t < 0.3 ? 0 : -(t - 0.3) * 0.18;
      zoom = plate.zoom + (t < 0.3 ? 0 : (t - 0.3) * 0.25);
      dof = [2 + t * 3, 1.5 + t * 2.5, 3 + t * 5];
    } else if (s.kind === "run") {
      plate = t < 0.4 ? from : plate;
      pan = [plate.rest[0] + (t - 0.4) * 0.1, plate.rest[1]];
      dof = [4, 2, 7];
    } else {
      // low / lateral / landing: cross from the old plate to the new one at the midpoint
      plate = t < 0.5 ? from : plate;
      const k = t < 0.5 ? t : t - 1; // -0.5..0.5 around the cut
      pan = [plate.rest[0] + k * 0.12, plate.rest[1]];
      dip = -Math.sin(Math.PI * t) * 0.05;
      const i = Math.sin(Math.PI * t);
      dof = [2 + i * 3, 1 + i * 1.5, 4 + i * 4];
      zoom = plate.zoom + i * 0.04;
    }
    dark = 0;
  } else {
    // dwell: a slow dolly across the plate
    pan = [plate.rest[0] + s.p * 0.05, plate.rest[1] + s.p * 0.01];
  }
  return { plate, zoom, pan, dip, dof, dark };
}
