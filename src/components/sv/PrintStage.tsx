"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import type { SwingState } from "./geometry";
import { PLATES, plateForBeat, type Plate } from "./plates";

/**
 * The film's print process, in real time. One WebGL2 canvas behind the DOM: the current
 * photographic plate is split into sky / far / near bands by its horizon lines, each band
 * parallaxed by the camera and misregistered (R/B split) by its own depth of field, then
 * posterised, halftoned in the shadows, hatched in the mid-darks, warped and multiplied by a
 * brush texture, and graded per segment. Falls back to a filtered <img> without WebGL2.
 */

const VERT = `#version 300 es
in vec2 a; out vec2 v; void main(){ v = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v; out vec4 o;
uniform sampler2D uPlate;
uniform vec2 uRes;        // canvas px
uniform vec2 uPlateAspect;// plate w/h, canvas w/h
uniform float uZoom;      // overscan so the pan never shows an edge
uniform vec2 uPan;        // camera pan in uv (applied per band by depth)
uniform float uDip;       // camera dip in uv
uniform vec3 uHorizon;    // sky bottom, far bottom (in plate uv, 0 = top), softness
uniform vec3 uDof;        // misregistration px per band: sky, far, near
uniform vec3 uShadow;     // grade: shadow tint
uniform vec3 uHigh;       // grade: highlight tint
uniform float uLevels;    // posterise levels
uniform float uHalf;      // halftone strength
uniform float uPaint;     // paint texture strength
uniform float uDark;      // cold-open darkness 0..1
uniform float uTime;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float brush(vec2 p){ // stretched strokes: anisotropic noise
  return 0.55*noise(vec2(p.x*0.35, p.y*2.2)) + 0.3*noise(vec2(p.x*0.9+7.3, p.y*5.1)) + 0.15*noise(p*9.0); }
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
float dots(vec2 px, float ang, float cell, float r){
  float s = sin(ang), c = cos(ang); vec2 q = mat2(c, -s, s, c) * px;
  vec2 g = fract(q / cell) - 0.5; float d = length(g) * cell;
  return 1.0 - smoothstep(r - 0.7, r + 0.7, d); }

// cover-fit plate uv for a canvas uv, with overscan zoom and a per-band offset
vec2 plateUv(vec2 uv, vec2 off){
  float pa = uPlateAspect.x, ca = uPlateAspect.y;
  vec2 c = (uv - 0.5) / uZoom + 0.5 + off;
  if (ca > pa) { c.y = (c.y - 0.5) * (pa / ca) + 0.5; } else { c.x = (c.x - 0.5) * (ca / pa) + 0.5; }
  return clamp(c, vec2(0.001), vec2(0.999));
}

vec3 fetch(vec2 uv, vec2 off, vec2 d){ return vec3(texture(uPlate, plateUv(uv + d, off)).r, texture(uPlate, plateUv(uv, off)).g, texture(uPlate, plateUv(uv - d, off)).b); }

void main(){
  vec2 uv = vec2(v.x, 1.0 - v.y);
  // depth bands from the plate's horizon lines
  float sky = 1.0 - smoothstep(uHorizon.x - uHorizon.z, uHorizon.x + uHorizon.z, uv.y);
  float near = smoothstep(uHorizon.y - uHorizon.z, uHorizon.y + uHorizon.z, uv.y);
  float far = 1.0 - sky - near;
  // parallax: the sky barely moves, the near band moves most; the camera dip lifts everything
  vec2 off = uPan * (0.25*sky + 0.6*far + 1.0*near) + vec2(0.0, uDip);
  // hand-painted edges: a small uv warp from the brush texture
  vec2 bp = uv * uRes / 22.0;
  float b = brush(bp);
  vec2 warp = (vec2(b, brush(bp + 31.7)) - 0.5) * (0.5 / uRes);
  // chromatic split as depth of field: R one way, B the other, per band
  float dpx = uDof.x*sky + uDof.y*far + uDof.z*near;
  vec2 d = vec2(dpx / uRes.x, 0.0);
  vec3 col = fetch(uv + warp, off, d);
  // ink edges: luminance difference across 2px, like a drawn line over the render
  vec2 e = 1.5 / uRes;
  float Lc = lum(col);
  float Lx = lum(fetch(uv + warp + vec2(e.x, 0.0), off, d));
  float Ly = lum(fetch(uv + warp + vec2(0.0, e.y), off, d));
  float edge = clamp((abs(Lc - Lx) + abs(Lc - Ly)) * 2.4 - 0.28, 0.0, 1.0);
  // saturate and open the shadows: the film is bright and dense, not murky
  float L = Lc;
  col = mix(vec3(L), col, 1.5);
  col = pow(max(col, 0.0), vec3(0.82)) * (1.12 + 0.2 * (1.0 - L));
  // posterise luminance into planes, keep hue: colour planes that keep their detail
  float Lq = floor(L * uLevels) / uLevels;
  float fq = fract(L * uLevels);
  float Lp = Lq + smoothstep(0.35, 0.65, fq) / uLevels;
  col *= (Lp + 0.04) / (L + 0.04);
  // grade: lift the shadows toward the tint, warm or cool the highlights
  float sh = 1.0 - smoothstep(0.0, 0.26, L);
  col = mix(col, col * 0.55 + uShadow * 0.5, sh * 0.6);
  col = mix(col, col * uHigh, smoothstep(0.28, 0.85, L));
  // atmospheric perspective: the far band breathes the sky colour
  vec3 skyCol = fetch(vec2(uv.x, max(uHorizon.x - 0.08, 0.02)), off, vec2(0.0));
  col = mix(col, skyCol, far * 0.34 * (1.0 - smoothstep(0.5, 0.9, L)));
  // halftone only in the shadows: dots grow with darkness, two screens
  vec2 px = v * uRes;
  float dark = pow(1.0 - smoothstep(0.03, 0.24, L), 2.0);
  float r = 1.6 + 3.0 * dark;
  float dK = dots(px, 0.7854, 9.0, r);
  float dM = dots(px, 0.2618, 9.0, r * 0.75);
  col *= 1.0 - dK * dark * uHalf * 0.55;
  col += vec3(0.07, -0.02, 0.08) * dM * dark * uHalf;
  // hatching in the mid-darks
  float mid = smoothstep(0.18, 0.28, L) * (1.0 - smoothstep(0.4, 0.52, L));
  float h = step(0.74, fract((px.x + px.y) / 5.0));
  col *= 1.0 - h * mid * 0.16;
  // ink line
  col *= 1.0 - edge * 0.38;
  // paint texture multiply
  col *= 1.0 - uPaint * (b - 0.5) * 2.0;
  // vignette, cold open
  float vig = smoothstep(1.3, 0.3, length(v - 0.5) * 1.3);
  col *= mix(0.84, 1.0, vig);
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

export function PrintStage({ state, mobile }: { state: MotionValue<SwingState>; mobile: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const fallback = useRef<HTMLDivElement>(null);

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
      const names = ["uPlate", "uRes", "uPlateAspect", "uZoom", "uPan", "uDip", "uHorizon", "uDof", "uShadow", "uHigh", "uLevels", "uHalf", "uPaint", "uDark", "uTime"];
      const u: Gl["u"] = {};
      names.forEach((n) => (u[n] = gl.getUniformLocation(prog, n)));
      ctx = { gl, prog, u, tex: new Map() };
    } catch (e) {
      console.warn("print shader failed, falling back", e);
      fallback.current?.classList.add("sv-plate-fallback-on");
      return;
    }

    /* textures: load every plate once (1600px desktop, 800px mobile) */
    const sizes = new Map<string, [number, number]>();
    const loading = new Set<string>();
    const ensure = (plate: Plate) => {
      if (ctx.tex.has(plate.id) || loading.has(plate.id)) return;
      loading.add(plate.id);
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        const t = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        ctx.tex.set(plate.id, t);
        sizes.set(plate.id, [img.naturalWidth, img.naturalHeight]);
        dirty = true;
      };
      img.src = `/plates/${plate.id}-${mobile ? 800 : 1600}.webp`;
    };
    PLATES.forEach(ensure);

    let dirty = true;
    let raf = 0;
    let hidden = document.hidden;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
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
    const unsub = state.on("change", () => {
      dirty = true;
    });
    const onVis = () => {
      hidden = document.hidden;
      if (!hidden) dirty = true;
    };
    document.addEventListener("visibilitychange", onVis);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (hidden || !dirty) return;
      const s = state.get();
      const shot = plateForBeat(s);
      const t = ctx.tex.get(shot.plate.id);
      if (!t) return;
      dirty = false;
      const [pw, ph] = sizes.get(shot.plate.id)!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.uniform1i(ctx.u.uPlate, 0);
      gl.uniform2f(ctx.u.uRes, canvas.width, canvas.height);
      gl.uniform2f(ctx.u.uPlateAspect, pw / ph, canvas.width / canvas.height);
      gl.uniform1f(ctx.u.uZoom, shot.zoom);
      gl.uniform2f(ctx.u.uPan, shot.pan[0], shot.pan[1]);
      gl.uniform1f(ctx.u.uDip, shot.dip);
      gl.uniform3f(ctx.u.uHorizon, shot.plate.horizon[0], shot.plate.horizon[1], 0.06);
      gl.uniform3f(ctx.u.uDof, shot.dof[0], shot.dof[1], shot.dof[2]);
      gl.uniform3f(ctx.u.uShadow, ...shot.plate.grade.shadow);
      gl.uniform3f(ctx.u.uHigh, ...shot.plate.grade.high);
      gl.uniform1f(ctx.u.uLevels, shot.plate.levels ?? 6);
      gl.uniform1f(ctx.u.uHalf, 1.0);
      gl.uniform1f(ctx.u.uPaint, 0.08);
      gl.uniform1f(ctx.u.uDark, shot.dark);
      gl.uniform1f(ctx.u.uTime, now / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      unsub();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      ctx.tex.forEach((t) => gl.deleteTexture(t));
    };
  }, [state, mobile]);

  return (
    <div className="sv-plates" aria-hidden="true">
      <canvas ref={ref} className="sv-plate-canvas" />
      <div ref={fallback} className="sv-plate-fallback">
        <img src={`/plates/${PLATES[0].id}-${mobile ? 800 : 1600}.webp`} alt="" />
      </div>
    </div>
  );
}
