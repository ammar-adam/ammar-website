/**
 * Scroll geometry for the swing. Everything is in viewport heights (vh) of scroll so
 * the camera, the figure and the pinned beats agree on where each moment lives.
 *
 * The page is one pinned screen. Each beat dwells for `dwell` vh of scroll; before each
 * beat (except the cover) the camera swings for that swing's own length and kind.
 */

export type SwingKind = "low" | "lateral" | "freefall" | "run" | "whip" | "landing";

export const BEATS = [
  { id: "cover", dwell: 60, swing: 0, kind: "low" as SwingKind },
  { id: "origins", dwell: 60, swing: 30, kind: "low" as SwingKind },
  { id: "roles", dwell: 100, swing: 35, kind: "lateral" as SwingKind },
  { id: "spotlight", dwell: 60, swing: 60, kind: "freefall" as SwingKind },
  { id: "projects", dwell: 90, swing: 30, kind: "run" as SwingKind },
  { id: "photos", dwell: 80, swing: 25, kind: "whip" as SwingKind },
  { id: "offclock", dwell: 45, swing: 20, kind: "whip" as SwingKind },
  { id: "landing", dwell: 60, swing: 45, kind: "landing" as SwingKind },
] as const;

export type SectionId = (typeof BEATS)[number]["id"];

/** Scroll offset (vh) at which each beat lands. */
export const STARTS: number[] = BEATS.reduce<number[]>((acc, b, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + BEATS[i - 1].dwell + b.swing);
  return acc;
}, []);

/** Max scroll offset, in vh. */
export const SCROLL_VH = STARTS[STARTS.length - 1] + BEATS[BEATS.length - 1].dwell;
/** Document height, in vh. */
export const TOTAL_VH = SCROLL_VH + 100;

export interface SwingDef {
  a: number;
  b: number;
  kind: SwingKind;
  /** how far the city pans during this swing, in "swing units" */
  weight: number;
  /** beat index this swing lands on */
  to: number;
}

const WEIGHT: Record<SwingKind, number> = { low: 1, lateral: 1.4, freefall: 0.3, run: 1, whip: 2.2, landing: 0.5 };

export const SWINGS: SwingDef[] = BEATS.slice(1).map((b, i) => ({
  a: STARTS[i + 1] - b.swing,
  b: STARTS[i + 1],
  kind: b.kind,
  weight: WEIGHT[b.kind],
  to: i + 1,
}));

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
  kind: SwingKind | null;
  /** cumulative smooth travel; swings pan, dwells dolly slowly */
  travel: number;
  /** beat currently pinned (or the beat we are swinging towards) */
  beat: number;
  /** 0..1 through the pinned beat's dwell */
  p: number;
}

export function swingState(yVh: number): SwingState {
  let travel = 0;
  let intensity = 0;
  let phase = 0;
  let index = -1;
  let kind: SwingKind | null = null;
  SWINGS.forEach((s, i) => {
    const t = clamp01((yVh - s.a) / (s.b - s.a));
    travel += smooth(t) * s.weight;
    if (t > 0 && t < 1) {
      intensity = Math.sin(Math.PI * t);
      phase = t;
      index = i;
      kind = s.kind;
    }
  });
  /* slow dolly while the camera rests on a beat */
  let beat = 0;
  let p = 0;
  BEATS.forEach((b, i) => {
    const q = clamp01((yVh - STARTS[i]) / b.dwell);
    travel += 0.12 * q;
    if (yVh >= STARTS[i]) {
      beat = i;
      p = q;
    }
  });
  if (index >= 0) beat = SWINGS[index].to;
  return { intensity, phase, index, kind, travel, beat, p };
}

export function beat(id: SectionId) {
  const i = BEATS.findIndex((b) => b.id === id);
  return { index: i, start: STARTS[i], dwell: BEATS[i].dwell, swing: BEATS[i].swing, first: i === 0, last: i === BEATS.length - 1 };
}

/**
 * Panel cut for a beat: hard pops, no easing. Returns on/off and a stepped scale.
 * The beat cuts in at the last 12% of the swing before it and cuts out 12% into the swing after it.
 */
export function cutState(yVh: number, id: SectionId): { on: boolean; scale: number; p: number } {
  const b = beat(id);
  const next = BEATS[b.index + 1];
  const inAt = b.start - b.swing * 0.12;
  const outAt = next ? b.start + b.dwell + next.swing * 0.12 : Infinity;
  const on = (b.first || yVh >= inAt) && (b.last || yVh < outAt);
  let scale = 1;
  if (!b.first && yVh < b.start - b.swing * 0.08) scale = 0.9;
  else if (!b.first && yVh < b.start - b.swing * 0.04) scale = 1.02;
  else if (!b.last && next && yVh > b.start + b.dwell + next.swing * 0.06) scale = 1.02;
  const p = clamp01((yVh - b.start) / b.dwell);
  return { on, scale, p };
}

/* ------------------------------------------------------------------ */
/* Figure choreography                                                  */

export type Pose = "crouch" | "drop" | "bottom" | "rise" | "release" | "apex" | "smear" | "land" | "low" | "stand" | "runA" | "runB" | null;

export interface FigureState {
  pose: Pose;
  /** hand (or body reference point) position, in vw / vh */
  x: number;
  y: number;
  /** web attached */
  web: boolean;
  /** slack frame after release */
  slack: boolean;
  /** faces left (mirrored) */
  flip: boolean;
  /** tangent of motion, radians, for the speed lines */
  angle: number;
  /** 0..1 how fast we are moving, for the speed lines */
  speed: number;
}

export const stepOf = (t: number) => Math.floor(clamp01(t) * 8 + 1e-6);

/** Pose and position at phase t for a swing kind. `landingHoldY` = where the figure stands at the end. */
export function figureAt(kind: SwingKind, t: number, mobile: boolean): FigureState {
  const s = stepOf(t);
  const none: FigureState = { pose: null, x: 50, y: 40, web: false, slack: false, flip: false, angle: 0, speed: 0 };
  /* the hand hangs below the CN Tower anchor (33vh desktop, 49vh mobile) */
  const yTop = mobile ? 24 : 22;
  const dip = mobile ? 12 : 16;

  if (kind === "whip") return none;

  if (kind === "freefall") {
    const e = t * t;
    const x = 62 - 14 * t;
    const y = -8 + 82 * e;
    const pose: Pose = s % 4 < 2 ? "apex" : "release";
    return { pose, x, y, web: false, slack: false, flip: false, angle: Math.PI / 2, speed: Math.min(1, t * 1.4) };
  }

  if (kind === "run") {
    const x = 18 + 64 * t;
    const y = mobile ? 50 : 46;
    return { pose: s % 2 ? "runB" : "runA", x, y, web: false, slack: false, flip: false, angle: 0, speed: 0.6 };
  }

  const flip = false;
  const span = mobile ? 50 : 44;
  const x0 = 28;
  const dir = 1;
  const x = x0 + dir * span * t;
  const flat = kind === "lateral";
  const y = flat ? yTop + 6 : yTop + dip * Math.sin(Math.PI * t);
  const dy = flat ? 0 : dip * Math.PI * Math.cos(Math.PI * t);
  const angle = Math.atan2(dy * (mobile ? 0.5 : 0.62), dir * span);
  const speed = flat ? 0.7 : Math.sin(Math.PI * t);

  let pose: Pose;
  if (flat) pose = s < 2 ? "drop" : s < 6 ? "bottom" : "rise";
  else pose = s === 0 ? "crouch" : s < 3 ? "drop" : s === 3 ? "smear" : s < 5 ? "bottom" : "rise";

  if (t >= 0.8) {
    pose = t < 0.85 ? "release" : "apex";
    if (kind === "landing") {
      if (t >= 0.95) pose = "stand";
      else if (t >= 0.9) pose = "low";
      else if (t >= 0.85) pose = "land";
    }
  }
  const web = t < 0.8;
  const slack = t >= 0.8 && t < 0.86;
  return { pose, x, y, web, slack, flip, angle, speed };
}
