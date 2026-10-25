"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { BAND, glitchFrame } from "./timeline";
import { PLATE_NAMES, SCENES, type Scene } from "./plates";

/* One WebGL2 canvas behind the DOM. Pass 1 cover-fits the scene's plate
   (paint-baked colour + depth matte, two render targets). Pass 2 is the
   print process keyed on depth: parallax by depth, haze on the far field,
   posterise the paint texture scaled by depth, a filmic grade with additive
   shadow tint, chromatic split only off the focus plane and radial from the
   focus point, a fine halftone in the shadow transitions, ink from depth
   silhouettes, isotropic paper grain, vignette, and the sliced glitch on
   cuts. Renders only when t changes; pauses when the tab is hidden. */

const VS = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FS_LAYER = `#version 300 es
precision highp float;
in vec2 vUv;
layout(location = 0) out vec4 oCol;
layout(location = 1) out vec4 oDep;
uniform sampler2D uTex, uDep;
uniform vec2 uRes, uTexSize, uFocus;
uniform float uScale, uGain;
vec2 mapUv(vec2 uv){
  float ca = uRes.x / uRes.y; float ta = uTexSize.x / uTexSize.y;
  vec2 span = (ta > ca) ? vec2(ca / ta, 1.0) : vec2(1.0, ta / ca);
  return uFocus + (uv - 0.5) / uScale * span;
}
void main(){
  vec2 t = mapUv(vec2(vUv.x, 1.0 - vUv.y));
  vec2 e = smoothstep(vec2(0.0), vec2(0.015), t) * (1.0 - smoothstep(vec2(0.985), vec2(1.0), t));
  float a = e.x * e.y;
  oCol = vec4(texture(uTex, t).rgb * uGain * a, a);
  oDep = vec4(texture(uDep, t).r, 0.0, 0.0, a);
}`;

const FS_POST = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uTex, uDep;
uniform vec2 uRes, uPan, uFocusUv;
uniform vec3 uBg, uShadow, uHigh, uHazeCol;
uniform float uHaze, uFocusD, uDofAmt, uPaint, uBands, uPost, uNight;
uniform float uGlitch;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
mat2 rot(float a){ float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
void main(){
  vec2 uv = vUv;
  vec2 px = uv * uRes;
  // glitch: displace slices of the picture
  if (uGlitch >= 1.0) {
    float f = uGlitch; float y = 1.0 - uv.y; float shift = 0.0;
    if (f < 1.5) { if ((y > 0.18 && y < 0.30) || (y > 0.55 && y < 0.70)) shift = 10.0; }
    else if (f < 2.5) { if ((y > 0.10 && y < 0.40) || (y > 0.60 && y < 0.80)) shift = -14.0; }
    else if (f < 3.5) { if ((y > 0.25 && y < 0.45) || (y > 0.50 && y < 0.85)) shift = 16.0; }
    else if (f < 4.5) { if ((y > 0.20 && y < 0.35) || (y > 0.65 && y < 0.95)) shift = -8.0; }
    uv.x += shift / uRes.x;
  }
  // depth-keyed parallax: near moves with the camera, sky barely
  float d0 = texture(uDep, uv).r;
  vec2 puv = uv + uPan * mix(0.2, 1.0, d0);
  vec4 s = texture(uTex, puv);
  float d = texture(uDep, puv).r;
  vec3 c = mix(uBg, s.rgb, s.a);
  float L = lum(c);
  // posterise the paint texture, scaled by depth; never the sky
  vec3 q = c * uBands; vec3 fl = floor(q); vec3 fr = fract(q);
  vec3 post = (fl + smoothstep(0.42, 0.58, fr)) / uBands;
  float pw = (uPost * 0.55 * d + 0.15) * smoothstep(0.06, 0.2, d);
  c = mix(c, post, pw);
  // haze on the far field, lowers contrast
  float haze = smoothstep(0.55, 0.95, 1.0 - d) * uHaze;
  c = mix(c, uHazeCol, haze);
  c = mix(vec3(lum(c)), c, 1.0 - 0.3 * haze);
  // filmic grade
  L = lum(c);
  float sat = mix(1.15, 0.9, smoothstep(0.7, 1.0, L));
  c = mix(vec3(L), c, sat);
  c = mix(c, c / (c + 0.18) * 1.18, 0.45);
  c = max(c - 0.04, 0.0) / 0.96;
  L = lum(c);
  c += uShadow * 0.12 * (1.0 - smoothstep(0.0, 0.35, L));
  c = mix(c, c * uHigh, smoothstep(0.55, 0.95, L));
  c *= mix(1.0, 0.62, uNight * (1.0 - L * 0.6));
  L = lum(c);
  // chromatic split: only off the focus plane, radial from the focus point, R and B only
  float coc = abs(d - uFocusD);
  coc = max(0.0, coc - 0.08) * uDofAmt;
  vec2 g = vec2(texture(uDep, uv + vec2(1.5 / uRes.x, 0.0)).r - texture(uDep, uv - vec2(1.5 / uRes.x, 0.0)).r,
                texture(uDep, uv + vec2(0.0, 1.5 / uRes.y)).r - texture(uDep, uv - vec2(0.0, 1.5 / uRes.y)).r);
  float edge = clamp(length(g) * 6.0 + 0.35, 0.0, 1.0);
  float k = smoothstep(0.25, 0.6, coc / 3.0) * (1.0 - smoothstep(0.75, 0.92, L)) * edge;
  vec2 dir = normalize(uv - uFocusUv + vec2(0.0001));
  vec2 off = dir * coc / uRes;
  float r2 = texture(uTex, puv + off).r;
  float b2 = texture(uTex, puv - off).b;
  c.r = mix(c.r, r2, k);
  c.b = mix(c.b, b2, k);
  // fine halftone only in the shadow transition band, tinted, weighted near
  float cell = 4.5 * uRes.y / 1080.0;
  vec2 hp = rot(0.785398) * px / cell;
  float dd = length(fract(hp) - 0.5) * cell;
  float m = smoothstep(0.03, 0.10, L) * (1.0 - smoothstep(0.32, 0.45, L));
  float rad = cell * 0.5 * sqrt(1.0 - L);
  float dot1 = 1.0 - smoothstep(rad - 0.7, rad + 0.3, dd);
  c = mix(c, c * vec3(0.55, 0.5, 0.75), dot1 * m * 0.6 * (0.4 + 0.6 * d));
  // hatching: near depth, dark mids only, faint
  float h = fract((px.x + px.y) * 0.5 / 4.0);
  float line = 1.0 - smoothstep(0.1, 0.25, abs(h - 0.5));
  float hm = step(0.6, d) * smoothstep(0.12, 0.16, L) * (1.0 - smoothstep(0.26, 0.3, L));
  c *= 1.0 - line * hm * 0.08;
  // ink from depth silhouettes, near only
  float ink = smoothstep(0.08, 0.2, length(g)) * smoothstep(0.35, 0.6, d);
  c = mix(c, vec3(0.02, 0.012, 0.05), ink * 0.5);
  // isotropic paper grain
  float grain = vnoise(px * 0.6) + vnoise(px * 3.1) - 1.0;
  c *= 1.0 + grain * uPaint;
  // vignette
  vec2 vv = vUv - 0.5; c *= 1.0 - dot(vv, vv) * 0.45;
  if (uGlitch >= 1.0) {
    float y = 1.0 - vUv.y; float f = uGlitch;
    float e1 = (f < 1.5) ? 0.18 : (f < 2.5) ? 0.40 : (f < 3.5) ? 0.25 : 0.35;
    float e2 = (f < 1.5) ? 0.70 : (f < 2.5) ? 0.80 : (f < 3.5) ? 0.85 : 0.65;
    if (abs(y - e1) < 0.006) c = mix(c, vec3(0.1, 0.85, 1.0), 0.8);
    if (abs(y - e2) < 0.005) c = mix(c, vec3(1.0, 0.18, 0.53), 0.8);
  }
  o = vec4(c, 1.0);
}`;

type Tex = { tex: WebGLTexture; dep: WebGLTexture; w: number; h: number; ready: boolean; loading: boolean };

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
    const ucache = new Map<string, WebGLUniformLocation | null>();
    const U = (pr: WebGLProgram, name: string) => {
      const k = (pr === pLayer ? "L:" : "P:") + name;
      if (!ucache.has(k)) ucache.set(k, gl.getUniformLocation(pr, name));
      return ucache.get(k) ?? null;
    };
    const texParams = () => {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };

    // two render targets: colour and depth
    const fbo = gl.createFramebuffer();
    const fboCol = gl.createTexture()!;
    const fboDep = gl.createTexture()!;
    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (w === W && h === H) return;
      W = w; H = h; canvas.width = w; canvas.height = h;
      for (const tx of [fboCol, fboDep]) {
        gl.bindTexture(gl.TEXTURE_2D, tx);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        texParams();
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboCol, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, fboDep, 0);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      dirty.current = true;
    };

    // plates: load the current scene's plate and its neighbours first, the rest on idle
    const small = window.innerWidth < 720;
    const size = small ? 1600 : 2000;
    const texes = new Map<string, Tex>();
    const makeTex = (fill: number[]) => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(fill));
      return tex;
    };
    for (const name of PLATE_NAMES) texes.set(name, { tex: makeTex([20, 14, 40, 255]), dep: makeTex([128, 0, 0, 255]), w: 1, h: 1, ready: false, loading: false });
    const flag = window as Window & { __filmTotal?: number; __filmReady?: number };
    flag.__filmTotal = PLATE_NAMES.length; flag.__filmReady = 0;
    const upload = (tex: WebGLTexture, img: HTMLImageElement) => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      texParams();
    };
    const load = (name: string) => {
      const e = texes.get(name);
      if (!e || e.loading) return;
      e.loading = true;
      const img = new Image(); img.decoding = "async";
      const dep = new Image(); dep.decoding = "async";
      let n = 0;
      const done = () => { if (++n === 2) { e.w = img.naturalWidth; e.h = img.naturalHeight; e.ready = true; dirty.current = true; flag.__filmReady = [...texes.values()].filter((x) => x.ready).length; } };
      img.onload = () => { upload(e.tex, img); done(); };
      dep.onload = () => { upload(e.dep, dep); done(); };
      img.src = `/plates/${name}-paint-${size}.webp`;
      dep.src = `/plates/${name}-depth.webp`;
    };
    const sceneIndex = (v: number) => Math.max(0, SCENES.findIndex((s) => v < s.range[1]) === -1 ? SCENES.length - 1 : SCENES.findIndex((s) => v < s.range[1]));
    const ensure = (v: number) => {
      const i = sceneIndex(v);
      for (const j of [i, i + 1, i - 1]) { const s = SCENES[j]; if (s?.plate) load(s.plate); }
    };
    ensure(t.get());
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    idle(() => { for (const name of PLATE_NAMES) load(name); });

    const sceneAt = (v: number): { scene: Scene; glitch: number } => {
      for (const s of SCENES) {
        const [, b] = s.range;
        if (v < b + BAND * 0.66 || b >= 1) return { scene: s, glitch: b >= 1 ? -1 : glitchFrame(v, b) };
      }
      return { scene: SCENES[SCENES.length - 1], glitch: -1 };
    };

    const render = () => {
      const v = t.get();
      ensure(v);
      const { scene, glitch } = sceneAt(v);
      const [a, b] = scene.range;
      const p = Math.max(0, Math.min(1, (v - a) / (b - a)));
      const cam = scene.camera(p);

      // pass 1: plate into colour + depth targets
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const tx = scene.plate ? texes.get(scene.plate) : undefined;
      if (tx && tx.ready) {
        gl.useProgram(pLayer);
        bindQuad(pLayer);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tx.tex); gl.uniform1i(U(pLayer, "uTex"), 0);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tx.dep); gl.uniform1i(U(pLayer, "uDep"), 1);
        gl.uniform2f(U(pLayer, "uRes"), W, H);
        gl.uniform2f(U(pLayer, "uTexSize"), tx.w, tx.h);
        const f = small && scene.restMobile ? scene.restMobile : scene.rest;
        gl.uniform2f(U(pLayer, "uFocus"), f[0], f[1]);
        gl.uniform1f(U(pLayer, "uScale"), cam.zoom);
        gl.uniform1f(U(pLayer, "uGain"), scene.gain ?? 1);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      // pass 2: print process to the screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(pPost);
      bindQuad(pPost);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fboCol); gl.uniform1i(U(pPost, "uTex"), 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, fboDep); gl.uniform1i(U(pPost, "uDep"), 1);
      gl.uniform2f(U(pPost, "uRes"), W, H);
      gl.uniform2f(U(pPost, "uPan"), cam.pan[0], cam.pan[1]);
      gl.uniform2f(U(pPost, "uFocusUv"), cam.focusUv[0], 1 - cam.focusUv[1]);
      gl.uniform3f(U(pPost, "uBg"), scene.bg[0], scene.bg[1], scene.bg[2]);
      const g = scene.grade;
      gl.uniform3f(U(pPost, "uShadow"), g.shadow[0], g.shadow[1], g.shadow[2]);
      gl.uniform3f(U(pPost, "uHigh"), g.high[0], g.high[1], g.high[2]);
      gl.uniform3f(U(pPost, "uHazeCol"), g.hazeCol[0], g.hazeCol[1], g.hazeCol[2]);
      gl.uniform1f(U(pPost, "uHaze"), g.haze);
      gl.uniform1f(U(pPost, "uNight"), g.night);
      gl.uniform1f(U(pPost, "uFocusD"), cam.focusDepth);
      gl.uniform1f(U(pPost, "uDofAmt"), cam.dof * (W / 1440));
      gl.uniform1f(U(pPost, "uPaint"), scene.paint);
      gl.uniform1f(U(pPost, "uBands"), scene.bands);
      gl.uniform1f(U(pPost, "uPost"), scene.post);
      gl.uniform1f(U(pPost, "uGlitch"), glitch);
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
    const onResize = () => { dirty.current = true; };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [t]);

  return <canvas ref={ref} className="film" aria-hidden="true" />;
}
