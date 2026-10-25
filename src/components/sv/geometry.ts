/**
 * Scroll geometry for the swing. Everything is in viewport heights (vh) of scroll so
 * the camera, the figure and the pinned beats agree on where each moment lives.
 *
 * The page is one pinned screen. Each beat dwells for `dwell` vh of scroll, and
 * between beats the camera swings for SWING vh with no panels on screen.
 */

export const SWING = 40;

export const BEATS = [
  { id: "cover", dwell: 80 },
  { id: "origins", dwell: 70 },
  { id: "roles", dwell: 110 },
  { id: "projects", dwell: 90 },
  { id: "photos", dwell: 90 },
  { id: "offclock", dwell: 50 },
  { id: "landing", dwell: 60 },
] as const;

export type SectionId = (typeof BEATS)[number]["id"];

export const STARTS: number[] = BEATS.reduce<number[]>((acc, b, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + BEATS[i - 1].dwell + SWING);
  return acc;
}, []);

/** Max scroll offset, in vh. */
export const SCROLL_VH = STARTS[STARTS.length - 1] + BEATS[BEATS.length - 1].dwell;
/** Document height, in vh. */
export const TOTAL_VH = SCROLL_VH + 100;

/** Each swing is the SWING vh of scroll before a beat lands. */
export const SWINGS: Array<[number, number]> = STARTS.slice(1).map((s) => [s - SWING, s]);

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

export interface SwingState {
  /** 0 at rest, 1 at the bottom of the arc */
  intensity: number;
  /** 0..1 through the current swing, 0 when pinned */
  phase: number;
  /** which swing (0-based), -1 when pinned */
  index: number;
  /** cumulative smooth travel, 0..SWINGS.length */
  travel: number;
}

export function swingState(yVh: number): SwingState {
  let travel = 0;
  let intensity = 0;
  let phase = 0;
  let index = -1;
  SWINGS.forEach(([a, b], i) => {
    const t = clamp01((yVh - a) / (b - a));
    travel += smooth(t);
    if (t > 0 && t < 1) {
      intensity = Math.sin(Math.PI * t);
      phase = t;
      index = i;
    }
  });
  return { intensity, phase, index, travel };
}

export function beat(id: SectionId) {
  const i = BEATS.findIndex((b) => b.id === id);
  return { index: i, start: STARTS[i], dwell: BEATS[i].dwell, first: i === 0, last: i === BEATS.length - 1 };
}

/**
 * Panel cut for a beat: hard pops, no easing. Returns on/off and a stepped scale.
 * The beat cuts in at 85% of the swing before it and cuts out 15% into the swing after it.
 */
export function cutState(yVh: number, id: SectionId): { on: boolean; scale: number; p: number } {
  const b = beat(id);
  const inAt = b.start - SWING * 0.15;
  const outAt = b.start + b.dwell + SWING * 0.15;
  const on = (b.first || yVh >= inAt) && (b.last || yVh < outAt);
  let scale = 1;
  if (!b.first && yVh < b.start - SWING * 0.1) scale = 0.72;
  else if (!b.first && yVh < b.start - SWING * 0.05) scale = 1.04;
  else if (!b.last && yVh > b.start + b.dwell + SWING * 0.06) scale = 1.06;
  const p = clamp01((yVh - b.start) / b.dwell);
  return { on, scale, p };
}
