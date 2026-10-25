/**
 * The camera on the CPU: the same cover-fit + overscan + parallax mapping the shader
 * uses, so DOM things (the web anchor, the figure's perch, content surfaces) stick to
 * points in the photograph.
 */
import type { Shot } from "./plates";

export interface Cam {
  shot: Shot;
  vw: number;
  vh: number;
  plateAspect: number;
}

/** Plate uv (0 = top-left) at a given depth -> canvas px. Inverse of the shader's plateUv. */
export function project(uv: [number, number], depth: number, cam: Cam): [number, number] {
  const { shot, vw, vh, plateAspect: pa } = cam;
  const ca = vw / vh;
  const off: [number, number] = [shot.pan[0] * (0.2 + 0.8 * depth), shot.pan[1] * (0.2 + 0.8 * depth) + shot.dip];
  let cx = uv[0];
  let cy = uv[1];
  if (ca > pa) cy = (cy - 0.5) * (ca / pa) + 0.5;
  else cx = (cx - 0.5) * (pa / ca) + 0.5;
  let x = (cx - off[0] - 0.5) * shot.zoom + 0.5;
  let y = (cy - off[1] - 0.5) * shot.zoom + 0.5;
  /* undo the roll */
  if (shot.rot) {
    const cs = Math.cos(-shot.rot);
    const sn = Math.sin(-shot.rot);
    const ax = (x - 0.5) * ca;
    const ay = y - 0.5;
    x = (cs * ax - sn * ay) / ca + 0.5;
    y = sn * ax + cs * ay + 0.5;
  }
  return [x * vw, y * vh];
}

/** Homography from the unit square (0,0)-(1,1) to four screen points, as a CSS matrix3d for an element of size w×h. */
export function matrix3d(pts: Array<[number, number]>, w: number, h: number): string {
  const [p0, p1, p2, p3] = pts; // TL, TR, BR, BL
  const sx = [0, w, w, 0];
  const sy = [0, 0, h, h];
  const dx = [p0[0], p1[0], p2[0], p3[0]];
  const dy = [p0[1], p1[1], p2[1], p3[1]];
  /* solve the 8 unknowns of the projective map with Gaussian elimination */
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    A.push([sx[i], sy[i], 1, 0, 0, 0, -sx[i] * dx[i], -sy[i] * dx[i]]);
    b.push(dx[i]);
    A.push([0, 0, 0, sx[i], sy[i], 1, -sx[i] * dy[i], -sy[i] * dy[i]]);
    b.push(dy[i]);
  }
  const n = 8;
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    [A[c], A[piv]] = [A[piv], A[c]];
    [b[c], b[piv]] = [b[piv], b[c]];
    const d = A[c][c] || 1e-9;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = A[r][c] / d;
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const h8 = b.map((v, i) => v / (A[i][i] || 1e-9));
  const [a, bb, c, d, e, f, g, hh] = h8;
  /* column-major 4x4 with z dropped */
  return `matrix3d(${a},${d},0,${g},${bb},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
}
