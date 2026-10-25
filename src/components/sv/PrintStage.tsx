"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import type { SwingState } from "./geometry";
import { PLATES, plateForBeat, platesNear, type Plate, type Shot } from "./plates";

/**
 * The film's print process, in real time. One WebGL2 canvas behind the DOM.
 *
 * Inputs per plate: the photograph, an offline edge-preserving "paint" bake, and a
 * feathered depth matte. Per frame: depth-weighted parallax, a restrained filmic grade,
 * posterisation of the paint bake scaled by depth (foreground painterly, far windows
 * crisp), haze that lifts and flattens the far distance, an R/B misregistration keyed on
 * circle-of-confusion from a focus depth (radial from the focus point, never on
 * highlights or in-focus subjects), a fine 45° halftone only where shadow turns to light,
 * hatching and ink only in the near depth, paper grain, and the cover title drawn into
 * the sky so the CN Tower occludes it. Falls back to a filtered <img> without WebGL2.
 */

const VERT = `#version 300 es
in vec2 a; out vec2 v; void main(){ v = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v; out vec4 o;
uniform sampler2D uPlate;   // the photograph
uniform sampler2D uPaintT;  // edge-preserving bake
uniform sampler2D uDepth;   // feathered depth matte, 0 sky .. 1 near
uniform sampler2D uTitle;   // cover title, alpha in .a
uniform vec2 uRes;
uniform vec2 uPlateAspect;  // plate w/h, canvas w/h
uniform float uZoom;
uniform vec2 uPan;
uniform float uDip;
uniform float uRot;         // radians, around frame centre
uniform float uFocus;       // focus depth 0..1
uniform float uDofAmt;      // px of misregistration at |depth - focus| = 1
uniform vec2 uFocusUv;      // radial centre of the split, canvas uv
uniform vec3 uShadow;       // additive shadow tint
uniform vec3 uHigh;         // highlight multiplier
uniform vec3 uHazeCol;
uniform float uHaze;
uniform float uNight;       // 1 = night grade (hue-selective cool push)
uniform float uDark;        // cold open
uniform float uGrain;
uniform vec4 uTitleRect;    // x, y, w, h in canvas uv (0 = top)
uniform float uTitleOn;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
float dots(vec2 px, float ang, float cell, float r){
  float s = sin(ang), c = cos(ang); vec2 q = mat2(c, -s, s, c) * px;
  vec2 g = fract(q / cell) - 0.5; float d = length(g) * cell;
  return 1.0 - smoothstep(r - 0.6, r + 0.6, d); }
float hue(vec3 c){
  float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b)), d = mx - mn;
  if (d < 1e-4) return 0.0;
  float h = (mx == c.r) ? mod((c.g - c.b) / d, 6.0) : (mx == c.g) ? (c.b - c.r) / d + 2.0 : (c.r - c.g) / d + 4.0;
  return h * 60.0; }

// cover-fit plate uv for a canvas uv (0 = top), with overscan zoom and a parallax offset
vec2 plateUv(vec2 uv, vec2 off){
  float pa = uPlateAspect.x, ca = uPlateAspect.y;
  vec2 c = (uv - 0.5) / uZoom + 0.5 + off;
  if (ca > pa) { c.y = (c.y - 0.5) * (pa / ca) + 0.5; } else { c.x = (c.x - 0.5) * (ca / pa) + 0.5; }
  return clamp(c, vec2(0.001), vec2(0.999));
}

void main(){
  vec2 uv0 = vec2(v.x, 1.0 - v.y);
  // camera roll around the centre
  float cs = cos(uRot), sn = sin(uRot);
  vec2 ar = vec2(uPlateAspect.y, 1.0);
  vec2 uv = (mat2(cs, -sn, sn, cs) * ((uv0 - 0.5) * ar)) / ar + 0.5;
  // depth first (sampled through the unparallaxed camera), then depth-weighted parallax
  float depth = texture(uDepth, plateUv(uv, vec2(0.0, uDip))).r;
  vec2 off = uPan * mix(0.2, 1.0, depth) + vec2(0.0, uDip);
  vec2 p = plateUv(uv, off);
  vec3 raw = texture(uPlate, p).rgb;
  vec3 pnt = texture(uPaintT, p).rgb;
  // posterise the paint bake, scaled by depth; the sky stays smooth, far windows stay crisp
  float Lp = lum(pnt);
  float levels = 6.0;
  float q = floor(Lp * levels) / levels + smoothstep(0.42, 0.58, fract(Lp * levels)) / levels;
  vec3 post = pnt * (q + 0.04) / (Lp + 0.04);
  float postAmt = (0.4 * depth + 0.1) * smoothstep(0.06, 0.2, depth);
  vec3 col = mix(pnt, post, postAmt);
  col = mix(col, raw, (1.0 - depth) * 0.45 * smoothstep(0.5, 0.85, lum(raw)));
  // filmic grade: restrained, hazy, not cranked
  float L = lum(col);
  float sat = mix(1.15, 0.9, smoothstep(0.7, 1.0, L));
  col = mix(vec3(L), col, sat);
  col = col / (col + 0.18) * 1.1;
  col = mix(col, col * col * (3.0 - 2.0 * col), 0.5);
  col = max(col - 0.04, 0.0) * 1.04;
  L = lum(col);
  col += uShadow * 0.12 * (1.0 - smoothstep(0.0, 0.35, L));
  col = mix(col, col * uHigh, smoothstep(0.55, 0.95, L));
  // night: only the blue-violet hues move toward cyan/magenta; windows stay amber
  float h = hue(col);
  float coolW = smoothstep(195.0, 210.0, h) * (1.0 - smoothstep(275.0, 290.0, h)) * smoothstep(0.08, 0.3, L);
  col = mix(col, col * vec3(0.92, 0.98, 1.16), coolW * uNight * 0.6);
  // atmospheric haze: the far distance lifts toward the haze colour and loses contrast
  float haze = smoothstep(0.55, 0.95, 1.0 - depth) * uHaze;
  col = mix(col, uHazeCol, haze);
  col = mix(vec3(lum(col)), col, 1.0 - 0.3 * haze);
  // chromatic split as depth of field: keyed on circle of confusion, radial from the focus point,
  // only on out-of-focus edges, never on highlights. R one way, B the other, G untouched.
  float dd = abs(depth - uFocus);
  float coc = dd < 0.08 ? 0.0 : dd * uDofAmt;
  vec2 dir = normalize(uv - uFocusUv + vec2(1e-4));
  vec2 dpx = dir * coc / uRes;
  float Lx = lum(texture(uPaintT, plateUv(uv + vec2(2.0 / uRes.x, 0.0), off)).rgb);
  float Ly = lum(texture(uPaintT, plateUv(uv + vec2(0.0, 2.0 / uRes.y), off)).rgb);
  float edgeStrength = clamp((abs(Lp - Lx) + abs(Lp - Ly)) * 4.0, 0.0, 1.0);
  float k = smoothstep(0.25, 0.6, coc / 3.0) * (1.0 - smoothstep(0.75, 0.92, L)) * max(edgeStrength, 0.35);
  float rr = texture(uPaintT, plateUv(uv + dpx, off)).r;
  float bb = texture(uPaintT, plateUv(uv - dpx, off)).b;
  col.r = mix(col.r, rr * (col.r + 0.02) / (pnt.r + 0.02), k);
  col.b = mix(col.b, bb * (col.b + 0.02) / (pnt.b + 0.02), k);
  // halftone: fine 45° screen, only where shadow turns to light, as a darker shadow hue
  vec2 px = v * uRes;
  float cell = 4.5 * uRes.y / 1080.0;
  float m = smoothstep(0.03, 0.10, L) * (1.0 - smoothstep(0.32, 0.45, L));
  float r = cell * 0.5 * sqrt(1.0 - L);
  float dt = dots(px, 0.7854, cell, r);
  col = mix(col, col * vec3(0.55, 0.5, 0.75), dt * m * 0.6 * (0.4 + 0.6 * depth));
  // hatching: near depth, mid-darks, faint
  float hatchW = step(0.6, depth) * smoothstep(0.12, 0.16, L) * (1.0 - smoothstep(0.26, 0.3, L));
  float hatch = step(0.75, fract((px.x + px.y) / 4.0));
  col *= 1.0 - hatch * hatchW * 0.08;
  // ink: silhouettes from the depth matte plus paint luminance steps, near depth only
  vec2 e = 1.5 / uRes;
  float dX = texture(uDepth, plateUv(uv + vec2(e.x, 0.0), vec2(0.0, uDip))).r;
  float dY = texture(uDepth, plateUv(uv + vec2(0.0, e.y), vec2(0.0, uDip))).r;
  float dEdge = clamp((abs(depth - dX) + abs(depth - dY)) * 6.0, 0.0, 1.0);
  float lEdge = step(0.45, abs(Lp - Lx) + abs(Lp - Ly));
  float ink = max(dEdge * clamp(edgeStrength * 2.5, 0.0, 1.0), lEdge * smoothstep(0.55, 0.75, depth));
  col *= 1.0 - ink * 0.5;
  // paper grain, isotropic
  vec2 gp = uv * uRes / 3.0;
  float g = 0.6 * noise(gp * 0.6) + 0.4 * noise(gp * 3.1);
  col *= 1.0 - uGrain * (g - 0.5) * 2.0;
  // the title lives in the sky, behind the tower
  if (uTitleOn > 0.5) {
    vec2 tu = (uv0 - uTitleRect.xy) / uTitleRect.zw;
    if (tu.x > 0.0 && tu.x < 1.0 && tu.y > 0.0 && tu.y < 1.0) {
      float a = texture(uTitle, tu).a;
      float aR = texture(uTitle, tu - vec2(2.0 / (uRes.x * uTitleRect.z), 0.0)).a;
      float aC = texture(uTitle, tu + vec2(2.0 / (uRes.x * uTitleRect.z), 0.0)).a;
      float skyMask = 1.0 - smoothstep(0.1, 0.18, depth);
      vec3 skyCol = texture(uPaintT, plateUv(uv + vec2(0.0, -0.12), off)).rgb;
      vec3 fill = mix(skyCol, vec3(1.0, 0.97, 0.92), 0.84);
      float aD = texture(uTitle, tu + vec2(0.0, 1.5 / (uRes.y * uTitleRect.w))).a;
      float under = clamp(aD - a, 0.0, 1.0);
      float lower = smoothstep(0.62, 0.72, tu.y);
      fill *= 1.0 - dots(px, 0.7854, 4.0, 1.4) * lower * 0.35;
      vec3 t = col;
      t = mix(t, vec3(0.95, 0.2, 0.25), aR * (1.0 - a) * 0.9);
      t = mix(t, vec3(0.1, 0.85, 1.0), aC * (1.0 - a) * 0.9);
      t = mix(t, vec3(0.12, 0.09, 0.18), under * 0.7);
      t = mix(t, fill, a);
      col = mix(col, t, skyMask);
    }
  }
  // vignette, cold open
  float vig = smoothstep(1.35, 0.3, length(v - 0.5) * 1.3);
  col *= mix(0.86, 1.0, vig);
  col *= 1.0 - uDark * (1.0 - smoothstep(0.0, 1.0, 1.0 - length((v - vec2(0.55, 0.6)) * vec2(0.8, 1.2))));
  o = vec4(col, 1.0);
}`;

interface Gl {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram;
  u: Record<string, WebGLUniformLocation | null>;
  tex: Map<string, WebGLTexture>;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
  return s;
}

function makeTex(gl: WebGL2RenderingContext, src: TexImageSource, fmt: number) {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, fmt, fmt, gl.UNSIGNED_BYTE, src);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

/** Render the cover title to a canvas so the shader can set it into the sky. */
function titleTexture(gl: WebGL2RenderingContext, text: string, family: string, w: number) {
  const c = document.createElement("canvas");
  const h = Math.round(w * 0.3);
  c.width = w;
  c.height = h;
  const x = c.getContext("2d")!;
  x.clearRect(0, 0, w, h);
  x.fillStyle = "#fff";
  x.textAlign = "center";
  x.textBaseline = "middle";
  let size = Math.round(h * 0.86);
  x.font = `${size}px ${family}`;
  while (x.measureText(text).width > w * 0.96 && size > 20) {
    size -= 4;
    x.font = `${size}px ${family}`;
  }
  x.fillText(text, w / 2, h / 2 + size * 0.04);
  return { tex: makeTex(gl, c, gl.RGBA), aspect: w / h };
}

export const TITLE_TEXT = "AMMAR ADAM";

export function PrintStage({ state, mobile }: { state: MotionValue<SwingState>; mobile: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const fallback = useRef<HTMLDivElement>(null);
  const credit = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, preserveDrawingBuffer: false, powerPreference: "high-performance" });
    if (!gl) {
      fallback.current?.classList.add("sv-plate-fallback-on");
      return;
    }
    let ctx: Gl;
    try {
      const prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link");
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const a = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      const names = ["uPlate", "uPaintT", "uDepth", "uTitle", "uRes", "uPlateAspect", "uZoom", "uPan", "uDip", "uRot", "uFocus", "uDofAmt", "uFocusUv", "uShadow", "uHigh", "uHazeCol", "uHaze", "uNight", "uDark", "uGrain", "uTitleRect", "uTitleOn"];
      const u: Gl["u"] = {};
      names.forEach((n) => (u[n] = gl.getUniformLocation(prog, n)));
      gl.uniform1i(u.uPlate, 0);
      gl.uniform1i(u.uPaintT, 1);
      gl.uniform1i(u.uDepth, 2);
      gl.uniform1i(u.uTitle, 3);
      ctx = { gl, prog, u, tex: new Map() };
    } catch (e) {
      console.warn("print shader failed, falling back", e);
      fallback.current?.classList.add("sv-plate-fallback-on");
      return;
    }

    /* textures: the current beat's plates first, the rest when idle */
    const sizes = new Map<string, [number, number]>();
    const loading = new Set<string>();
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const load = (src: string) =>
      new Promise<HTMLImageElement>((res, rej) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = src;
      });
    const ensure = (plate: Plate) => {
      if (ctx.tex.has(plate.id) || loading.has(plate.id)) return;
      loading.add(plate.id);
      const size = plate.hero && !mobile && window.innerWidth * dpr > 1700 ? 2400 : 1600;
      Promise.all([load(`/plates/${plate.id}-${size}.webp`), load(`/plates/${plate.id}-paint.webp`), load(`/plates/${plate.id}-depth.webp`)])
        .then(([img, paint, depth]) => {
          ctx.tex.set(plate.id, makeTex(gl, img, gl.RGB));
          ctx.tex.set(plate.id + ":paint", makeTex(gl, paint, gl.RGB));
          ctx.tex.set(plate.id + ":depth", makeTex(gl, depth, gl.RGB));
          sizes.set(plate.id, [img.naturalWidth, img.naturalHeight]);
          dirty = true;
        })
        .catch(() => loading.delete(plate.id));
    };
    platesNear(state.get()).forEach(ensure);
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    idle(() => PLATES.forEach(ensure));

    /* the cover title, rendered once the display face is ready */
    let title: { tex: WebGLTexture; aspect: number } | null = null;
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;visibility:hidden;font-family:var(--font-anton),Impact,sans-serif";
    probe.textContent = TITLE_TEXT;
    document.body.appendChild(probe);
    const family = getComputedStyle(probe).fontFamily;
    document.fonts.load(`120px ${family}`).then(() => {
      title = titleTexture(gl, TITLE_TEXT, family, 1600);
      probe.remove();
      dirty = true;
    });

    let dirty = true;
    let raf = 0;
    let hidden = document.hidden;
    const resize = () => {
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        dirty = true;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    let lastId = "";
    const unsub = state.on("change", (s) => {
      dirty = true;
      platesNear(s).forEach(ensure);
    });
    const onVis = () => {
      hidden = document.hidden;
      if (!hidden) dirty = true;
    };
    document.addEventListener("visibilitychange", onVis);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (hidden || !dirty) return;
      const s = state.get();
      const shot: Shot = plateForBeat(s, mobile);
      const t = ctx.tex.get(shot.plate.id);
      if (!t) return;
      dirty = false;
      if (shot.plate.id !== lastId) {
        lastId = shot.plate.id;
        if (credit.current) credit.current.textContent = `Plate: ${shot.plate.credit}, modified`;
      }
      const [pw, ph] = sizes.get(shot.plate.id)!;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, ctx.tex.get(shot.plate.id + ":paint")!);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, ctx.tex.get(shot.plate.id + ":depth")!);
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, title ? title.tex : t);
      gl.uniform2f(ctx.u.uRes, canvas.width, canvas.height);
      gl.uniform2f(ctx.u.uPlateAspect, pw / ph, canvas.width / canvas.height);
      gl.uniform1f(ctx.u.uZoom, shot.zoom);
      gl.uniform2f(ctx.u.uPan, shot.pan[0], shot.pan[1]);
      gl.uniform1f(ctx.u.uDip, shot.dip);
      gl.uniform1f(ctx.u.uRot, shot.rot);
      gl.uniform1f(ctx.u.uFocus, shot.focus);
      gl.uniform1f(ctx.u.uDofAmt, shot.dofAmt * dpr);
      gl.uniform2f(ctx.u.uFocusUv, shot.focusUv[0], shot.focusUv[1]);
      gl.uniform3f(ctx.u.uShadow, ...shot.plate.grade.shadow);
      gl.uniform3f(ctx.u.uHigh, ...shot.plate.grade.high);
      gl.uniform3f(ctx.u.uHazeCol, ...shot.plate.hazeCol);
      gl.uniform1f(ctx.u.uHaze, shot.plate.haze);
      gl.uniform1f(ctx.u.uNight, shot.plate.night ? 1 : 0);
      gl.uniform1f(ctx.u.uDark, shot.dark);
      gl.uniform1f(ctx.u.uGrain, 0.04);
      const tw = shot.title ? shot.title.w : 0;
      const th = title ? tw / title.aspect / (canvas.height / canvas.width) : 0;
      gl.uniform4f(ctx.u.uTitleRect, shot.title ? shot.title.x - tw / 2 : 0, shot.title ? shot.title.y - th / 2 : 0, tw, th);
      gl.uniform1f(ctx.u.uTitleOn, shot.title && title ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      unsub();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      ctx.tex.forEach((tx) => gl.deleteTexture(tx));
      probe.remove();
    };
  }, [state, mobile]);

  return (
    <div className="sv-plates" aria-hidden="true">
      <canvas ref={ref} className="sv-plate-canvas" />
      <div ref={fallback} className="sv-plate-fallback">
        <img src={`/plates/${PLATES[0].id}-1600.webp`} alt="" />
      </div>
      <div ref={credit} className="sv-plate-credit" />
    </div>
  );
}
