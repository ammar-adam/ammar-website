"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { BAND, glitchFrame } from "./timeline";
import { PLATE_NAMES, SCENES, type Scene } from "./plates";

/* One WebGL2 canvas behind the DOM. Pass 1 composites the current scene's
   photographic layers (cover-fit, parallax, per-layer chromatic split as depth
   of field, soft vertical masks) into a framebuffer. Pass 2 is the print
   process: posterise, halftone in the shadows, hatching in the mid-darks,
   paint texture with a tiny UV warp, grade, vignette, and the sliced glitch
   on cuts. Renders only when t changes; pauses when the tab is hidden. */

const VS = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FS_LAYER = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uTex;
uniform vec2 uRes;      // canvas px
uniform vec2 uTexSize;  // texture px
uniform vec2 uFocus;    // 0..1 crop anchor
uniform vec2 uPan;      // in viewport fractions
uniform float uScale;
uniform float uDof;     // px
uniform vec4 uMask;     // fadeIn0, fadeIn1, fadeOut0, fadeOut1 (uv.y, 0 bottom)
uniform float uGain;
vec2 mapUv(vec2 uv){
  float ca = uRes.x / uRes.y; float ta = uTexSize.x / uTexSize.y;
  vec2 span = (ta > ca) ? vec2(ca / ta, 1.0) : vec2(1.0, ta / ca);
  vec2 c = uv - 0.5;
  c /= uScale;
  c -= uPan;
  vec2 t = uFocus + c * span;
  return t;
}
void main(){
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 t = mapUv(uv);
  float dx = uDof / uRes.x;
  float r = texture(uTex, t + vec2(-dx, 0.0)).r;
  float g = texture(uTex, t).g;
  float b = texture(uTex, t + vec2(dx, 0.0)).b;
  vec3 c = vec3(r, g, b) * uGain;
  float a = smoothstep(uMask.x, uMask.y, vUv.y) * (1.0 - smoothstep(uMask.z, uMask.w, vUv.y));
  // soft edges where the plate runs out
  vec2 e = smoothstep(vec2(0.0), vec2(0.02), t) * (1.0 - smoothstep(vec2(0.98), vec2(1.0), t));
  a *= e.x * e.y;
  o = vec4(c * a, a);
}`;

const FS_POST = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec3 uBg;
uniform float uBands, uHalf, uHatch, uPaint, uSat, uLift, uGamma, uNight, uTime;
uniform vec3 uShadow, uHigh;
uniform float uGlitch;  // -1 or frame 0..5
uniform float uBlackout; // 0..1 fade to black in the cold open
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for(int i=0;i<4;i++){ v += a*vnoise(p); p = p*2.03 + 17.0; a *= 0.5; } return v; }
mat2 rot(float a){ float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
void main(){
  vec2 uv = vUv;
  vec2 px = uv * uRes;
  // glitch: displace slices of the picture, cyan/magenta duplicates at the edges
  if (uGlitch >= 1.0) {
    float f = uGlitch;
    float y = 1.0 - uv.y;
    float shift = 0.0;
    if (f < 1.5) { if ((y > 0.18 && y < 0.30) || (y > 0.55 && y < 0.70)) shift = 10.0; }
    else if (f < 2.5) { if ((y > 0.10 && y < 0.40) || (y > 0.60 && y < 0.80)) shift = -14.0; }
    else if (f < 3.5) { if ((y > 0.25 && y < 0.45) || (y > 0.50 && y < 0.85)) shift = 16.0; }
    else if (f < 4.5) { if ((y > 0.20 && y < 0.35) || (y > 0.65 && y < 0.95)) shift = -8.0; }
    uv.x += shift / uRes.x;
  }
  // paint: brush/paper noise warps the uv slightly so edges look hand-made
  float n = fbm(px * 0.012);
  float n2 = fbm(px * 0.05 + 31.0);
  uv += (vec2(n, n2) - 0.5) * (1.8 / uRes.x) * (uPaint * 10.0);
  vec4 s = texture(uTex, uv);
  vec3 c = mix(uBg, s.rgb, s.a);
  // posterise with soft band edges, keep some detail
  vec3 q = c * uBands; vec3 fl = floor(q); vec3 fr = fract(q);
  vec3 soft = smoothstep(0.3, 0.7, fr);
  c = mix(c, (fl + soft) / uBands, 0.72);
  float L = lum(c);
  // grade
  vec3 sh = mix(uShadow * 1.7, vec3(1.0), smoothstep(0.0, 0.55, L));
  vec3 hi = mix(vec3(1.0), uHigh, smoothstep(0.4, 1.0, L));
  c *= sh * hi;
  c = (c - 0.5) * 1.12 + 0.5;
  c = mix(vec3(lum(c)), c, uSat);
  c = pow(max(c + uLift, 0.0), vec3(uGamma));
  c *= mix(1.0, 0.72, uNight * (1.0 - L));
  L = lum(c);
  // halftone in the shadows only: 45 degree dot screen, dots grow with darkness,
  // printed in the shadow tint rather than black
  vec2 hp = rot(0.785398) * px / 6.5;
  float d = length(fract(hp) - 0.5);
  float dark = 1.0 - L;
  float rad = smoothstep(0.42, 0.04, L) * 0.5 * dark;
  float dot1 = 1.0 - smoothstep(rad - 0.06, rad + 0.03, d);
  c = mix(c, c * 0.35 * mix(vec3(1.0), uShadow * 1.8, 0.6), dot1 * uHalf * 0.85);
  // cyan / magenta screens, deep shadows only, offset angles
  float deep = smoothstep(0.26, 0.04, L);
  vec2 hc = rot(0.2618) * px / 6.5; float dc = length(fract(hc) - 0.5);
  float radc = deep * 0.28;
  float dotc = 1.0 - smoothstep(radc - 0.05, radc + 0.02, dc);
  c += vec3(0.0, 0.3, 0.45) * dotc * uHalf * 0.3;
  vec2 hm = rot(1.309) * px / 6.5; float dm = length(fract(hm) - 0.5);
  float dotm = 1.0 - smoothstep(radc - 0.05, radc + 0.02, dm);
  c += vec3(0.45, 0.0, 0.3) * dotm * uHalf * 0.26;
  // hatching in the mid-darks
  float h = fract((px.x + px.y) * 0.5 / 5.0);
  float line = 1.0 - smoothstep(0.08, 0.2, abs(h - 0.5));
  float midDark = smoothstep(0.18, 0.3, L) * (1.0 - smoothstep(0.42, 0.58, L));
  c *= 1.0 - line * midDark * uHatch * 0.28;
  // paint texture multiply
  c *= 1.0 - (n - 0.5) * uPaint * 1.6;
  c *= 1.0 - (n2 - 0.5) * uPaint * 0.8;
  // vignette
  vec2 vv = vUv - 0.5; c *= 1.0 - dot(vv, vv) * 0.55;
  // glitch colour slivers
  if (uGlitch >= 1.0) {
    float y = 1.0 - vUv.y;
    float f = uGlitch;
    float e1 = (f < 1.5) ? 0.18 : (f < 2.5) ? 0.40 : (f < 3.5) ? 0.25 : 0.35;
    float e2 = (f < 1.5) ? 0.70 : (f < 2.5) ? 0.80 : (f < 3.5) ? 0.85 : 0.65;
    if (abs(y - e1) < 0.006) c = mix(c, vec3(0.1, 0.85, 1.0), 0.8);
    if (abs(y - e2) < 0.005) c = mix(c, vec3(1.0, 0.18, 0.53), 0.8);
  }
  c = mix(c, vec3(0.0), uBlackout);
  o = vec4(c, 1.0);
}`;

type Tex = { tex: WebGLTexture; w: number; h: number; ready: boolean };

export function Film({ t }: { t: MotionValue<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dirty = useRef(true);
  useMotionValueEvent(t, "change", () => { dirty.current = true; });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, preserveDrawingBuffer: false, powerPreference: "high-performance" });
    if (!gl) { canvas.dataset.fallback = "1"; return; }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh));
      return sh;
    };
    const program = (fs: string) => {
      const pr = gl.createProgram()!;
      gl.attachShader(pr, compile(gl.VERTEX_SHADER, VS));
      gl.attachShader(pr, compile(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(pr));
      return pr;
    };
    const pLayer = program(FS_LAYER);
    const pPost = program(FS_POST);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const bindQuad = (pr: WebGLProgram) => {
      const loc = gl.getAttribLocation(pr, "aPos");
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    };
    const U = (pr: WebGLProgram, name: string) => gl.getUniformLocation(pr, name);

    // framebuffer for the composite
    const fbo = gl.createFramebuffer();
    const fboTex = gl.createTexture()!;
    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (w === W && h === H) return;
      W = w; H = h; canvas.width = w; canvas.height = h;
      gl.bindTexture(gl.TEXTURE_2D, fboTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      dirty.current = true;
    };

    // plates
    const small = window.innerWidth < 720;
    const texes = new Map<string, Tex>();
    for (const name of PLATE_NAMES) {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 14, 40, 255]));
      const entry: Tex = { tex, w: 1, h: 1, ready: false };
      texes.set(name, entry);
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        entry.w = img.naturalWidth; entry.h = img.naturalHeight; entry.ready = true;
        dirty.current = true;
      };
      img.src = `/plates/${name}-${small ? 800 : 1600}.webp`;
    }

    const sceneAt = (v: number): { scene: Scene; glitch: number } => {
      for (const s of SCENES) {
        const [, b] = s.range;
        // the plate swaps on the last glitch frame, like the DOM
        if (v < b + BAND * 0.66 || b >= 1) return { scene: s, glitch: b >= 1 ? -1 : glitchFrame(v, b) };
      }
      const last = SCENES[SCENES.length - 1];
      return { scene: last, glitch: -1 };
    };

    const render = () => {
      const v = t.get();
      const { scene, glitch } = sceneAt(v);
      const [a, b] = scene.range;
      const p = Math.max(0, Math.min(1, (v - a) / (b - a)));

      // pass 1: layers into the fbo
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(pLayer);
      bindQuad(pLayer);
      for (const L of scene.layers) {
        const tx = texes.get(L.plate);
        if (!tx || !tx.ready) continue;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tx.tex);
        gl.uniform1i(U(pLayer, "uTex"), 0);
        gl.uniform2f(U(pLayer, "uRes"), W, H);
        gl.uniform2f(U(pLayer, "uTexSize"), tx.w, tx.h);
        const f = L.focus ?? [0.5, 0.5];
        gl.uniform2f(U(pLayer, "uFocus"), f[0], f[1]);
        gl.uniform2f(U(pLayer, "uPan"), L.x ? L.x(p) : 0, L.y ? L.y(p) : 0);
        gl.uniform1f(U(pLayer, "uScale"), L.scale ? L.scale(p) : 1);
        gl.uniform1f(U(pLayer, "uDof"), L.dof(p) * (W / 1440));
        const m = L.mask ?? [-1, -0.5, 1.5, 2];
        gl.uniform4f(U(pLayer, "uMask"), m[0], m[1], m[2], m[3]);
        gl.uniform1f(U(pLayer, "uGain"), L.gain ?? 1);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      gl.disable(gl.BLEND);

      // pass 2: print process to the screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(pPost);
      bindQuad(pPost);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboTex);
      gl.uniform1i(U(pPost, "uTex"), 0);
      gl.uniform2f(U(pPost, "uRes"), W, H);
      gl.uniform3f(U(pPost, "uBg"), scene.bg[0], scene.bg[1], scene.bg[2]);
      gl.uniform1f(U(pPost, "uBands"), scene.bands);
      gl.uniform1f(U(pPost, "uHalf"), scene.halftone);
      gl.uniform1f(U(pPost, "uHatch"), scene.hatch);
      gl.uniform1f(U(pPost, "uPaint"), scene.paint);
      const g = scene.grade;
      gl.uniform1f(U(pPost, "uSat"), g.sat);
      gl.uniform1f(U(pPost, "uLift"), g.lift);
      gl.uniform1f(U(pPost, "uGamma"), g.gamma);
      gl.uniform1f(U(pPost, "uNight"), g.night);
      gl.uniform3f(U(pPost, "uShadow"), g.shadow[0], g.shadow[1], g.shadow[2]);
      gl.uniform3f(U(pPost, "uHigh"), g.high[0], g.high[1], g.high[2]);
      gl.uniform1f(U(pPost, "uGlitch"), glitch);
      gl.uniform1f(U(pPost, "uTime"), performance.now() / 1000);
      gl.uniform1f(U(pPost, "uBlackout"), 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    let raf = 0;
    let running = true;
    const loop = () => {
      if (!running) return;
      resize();
      if (dirty.current) { dirty.current = false; render(); }
      raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!running) { running = true; dirty.current = true; raf = requestAnimationFrame(loop); }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", () => { dirty.current = true; });
    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [t]);

  return <canvas ref={ref} className="film" aria-hidden="true" />;
}
