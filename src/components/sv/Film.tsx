"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import { PLATE_NAMES, SCENES, type Camera, type Scene } from "./plates";

/* The photographs supply real airport architecture. A depth-aware camera,
   restrained print registration and ink/amber grade turn them into shots.
   Rendering is driven by scroll, image loads and resize, never an idle loop. */
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
void main(){
  float ca = uRes.x / uRes.y, ta = uTexSize.x / uTexSize.y;
  vec2 span = ((ta > ca) ? vec2(ca / ta, 1.0) : vec2(1.0, ta / ca)) / uScale;
  vec2 centre = clamp(uFocus, span * 0.5, vec2(1.0) - span * 0.5);
  vec2 uv = centre + (vec2(vUv.x, 1.0 - vUv.y) - 0.5) * span;
  oCol = vec4(texture(uTex, uv).rgb * uGain, 1.0);
  oDep = vec4(texture(uDep, uv).r, 0.0, 0.0, 1.0);
}`;

const FS_POST = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uTex, uDep;
uniform vec2 uRes, uPan, uFocusUv;
uniform vec3 uShadow, uHigh, uHazeCol;
uniform float uTravel, uHaze, uFocusD, uDofAmt, uPaint, uBands, uPost, uNight, uDark;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
void main(){
  vec2 px = vUv * uRes;
  float depth = texture(uDep, vUv).r;
  // A forward dolly magnifies the foreground more than the distant terminal.
  vec2 uv = uFocusUv + (vUv - uFocusUv) / (1.0 + uTravel * depth * 0.065);
  uv += uPan * mix(0.16, 1.0, depth);
  uv = clamp(uv, vec2(0.001), vec2(0.999));
  vec3 source = texture(uTex, uv).rgb;
  float d = texture(uDep, uv).r;
  vec3 c = source;
  float L = lum(c);
  // Quantise light, not every RGB channel: retain the photographic palette.
  float q = L * uBands;
  float painted = (floor(q) + smoothstep(0.32, 0.68, fract(q))) / uBands;
  c *= (mix(L, painted, uPost * mix(0.28, 0.65, d)) + 0.018) / (L + 0.018);
  float haze = (1.0 - smoothstep(0.12, 0.58, d)) * uHaze;
  c = mix(c, uHazeCol, haze);
  c = max(vec3(0.0), (c - 0.045) * 1.12);
  L = lum(c);
  c = mix(vec3(L), c, 0.94);
  float shadow = 1.0 - smoothstep(0.055, 0.43, L);
  c = mix(c, uShadow * (0.34 + L * 2.0), shadow * 0.36);
  c *= mix(vec3(1.0), uHigh, smoothstep(0.32, 0.9, L));
  c *= 1.0 - uNight * 0.3;
  L = lum(c);
  vec2 texel = 1.5 / uRes;
  vec2 edge = vec2(
    texture(uDep, uv + vec2(texel.x, 0)).r - texture(uDep, uv - vec2(texel.x, 0)).r,
    texture(uDep, uv + vec2(0, texel.y)).r - texture(uDep, uv - vec2(0, texel.y)).r
  );
  // Registration slips only away from the focal plane and at depth edges.
  float coc = max(0.0, abs(d - uFocusD) - 0.12) * uDofAmt;
  vec2 direction = normalize(uv - uFocusUv + vec2(0.0001));
  vec2 off = direction * coc / uRes;
  float split = smoothstep(0.12, 1.4, coc) * (0.2 + clamp(length(edge) * 5.0, 0.0, 0.8));
  split *= 1.0 - smoothstep(0.65, 0.95, L);
  c.r += (texture(uTex, uv + off).r - source.r) * split * 0.8;
  c.b += (texture(uTex, uv - off).b - source.b) * split * 0.8;
  // Halftone lives in shadow transitions, never as an all-over comic overlay.
  float cell = max(2.2, 4.0 * uRes.y / 1080.0);
  vec2 grid = mat2(0.7071, -0.7071, 0.7071, 0.7071) * px / cell;
  float dots = length(fract(grid) - 0.5) * cell;
  float radius = cell * 0.44 * sqrt(max(0.0, 1.0 - L));
  float mask = smoothstep(0.045, 0.13, L) * (1.0 - smoothstep(0.29, 0.44, L));
  float inkDot = 1.0 - smoothstep(radius - 0.45, radius + 0.45, dots);
  c *= 1.0 - inkDot * mask * (0.22 + d * 0.16);
  float inkEdge = smoothstep(0.11, 0.3, length(edge)) * smoothstep(0.3, 0.65, d);
  c = mix(c, vec3(0.012, 0.029, 0.048), inkEdge * 0.4);
  float grain = noise(px * 0.68) * 0.65 + noise(px * 0.12) * 0.35 - 0.5;
  c *= 1.0 + grain * uPaint * 2.0;
  vec2 vignette = vUv - 0.5;
  c *= 1.0 - dot(vignette, vignette) * 0.48;
  o = vec4(max(c, vec3(0.0)) * (1.0 - uDark), 1.0);
}`;

type PlateTexture = { color: WebGLTexture; depth: WebGLTexture; width: number; height: number; ready: boolean; loading: boolean };
type Renderer = { draw: (scene: Scene, camera: Camera, effect: number) => void; dispose: () => void };

function sceneAt(progress: number) {
  return SCENES.find((scene) => progress < scene.range[1]) ?? SCENES[SCENES.length - 1];
}

export function Film({ t, fx }: { t: MotionValue<number>; fx: MotionValue<number> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current, canvas = canvasRef.current, fallback = fallbackRef.current;
    if (!root || !canvas || !fallback) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false, contextLost = false, frame = 0;
    let renderer: Renderer | null = null;
    let fallbackPlate = "";
    const markFallback = () => { canvas.style.opacity = "0"; root.dataset.fallback = "1"; };

    const draw = () => {
      frame = 0;
      if (disposed || document.hidden) return;
      const progress = t.get(), effect = motionPreference.matches ? 0 : Math.max(0, Math.min(1, fx.get()));
      const scene = sceneAt(progress);
      const local = Math.max(0, Math.min(1, (progress - scene.range[0]) / (scene.range[1] - scene.range[0])));
      const camera = scene.camera(motionPreference.matches ? 0.35 : local);
      const small = root.clientWidth < 720;
      const plate = `/plates/${scene.plate}-paint-${small ? 1600 : 2000}.webp`;
      if (fallbackPlate !== plate) {
        fallback.style.backgroundImage = `linear-gradient(180deg, rgba(6, 19, 31, 0.16), rgba(4, 15, 27, 0.33)), url("${plate}")`;
        fallbackPlate = plate;
      }
      const rest = small && scene.restMobile ? scene.restMobile : scene.rest;
      fallback.style.backgroundPosition = `${rest[0] * 100}% ${rest[1] * 100}%`;
      fallback.style.transformOrigin = `${camera.focusUv[0] * 100}% ${camera.focusUv[1] * 100}%`;
      fallback.style.transform = `translate3d(${-camera.pan[0] * 100}%, ${camera.pan[1] * 100}%, 0) scale(${camera.zoom * (1 + effect * 0.3)})`;
      fallback.style.filter = `saturate(0.85) contrast(1.13) brightness(${1 - effect * 0.5})`;
      root.dataset.scene = scene.id;
      if (renderer && !contextLost) renderer.draw(scene, camera, effect);
    };
    const schedule = () => {
      if (!disposed && !document.hidden && !frame) frame = requestAnimationFrame(draw);
    };

    const createRenderer = (gl: WebGL2RenderingContext): Renderer | null => {
      const textures: WebGLTexture[] = [], programs: WebGLProgram[] = [], shaders: WebGLShader[] = [];
      const images: HTMLImageElement[] = [];
      let buffer: WebGLBuffer | null = null, framebuffer: WebGLFramebuffer | null = null;
      let dead = false, preload = 0;
      const cleanup = () => {
        if (dead) return;
        dead = true;
        window.clearTimeout(preload);
        for (const image of images) { image.onload = null; image.onerror = null; }
        // Context loss releases GPU objects itself. Old handles must never be
        // deleted against the restored context, which owns new resources.
        if (contextLost || gl.isContextLost()) return;
        for (const texture of textures) gl.deleteTexture(texture);
        for (const program of programs) gl.deleteProgram(program);
        for (const shader of shaders) gl.deleteShader(shader);
        gl.deleteBuffer(buffer); gl.deleteFramebuffer(framebuffer);
      };
      try {
        const compile = (kind: number, source: string) => {
          const shader = gl.createShader(kind);
          if (!shader) throw new Error("Unable to create film shader");
          shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "Film shader compilation failed");
          return shader;
        };
        const vertex = compile(gl.VERTEX_SHADER, VS);
        const program = (source: string) => {
          const p = gl.createProgram();
          if (!p) throw new Error("Unable to create film program");
          programs.push(p); gl.attachShader(p, vertex); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, source)); gl.linkProgram(p);
          if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "Film program link failed");
          return p;
        };
        const layer = program(FS_LAYER), post = program(FS_POST);
        buffer = gl.createBuffer(); framebuffer = gl.createFramebuffer();
        if (!buffer || !framebuffer) throw new Error("Unable to allocate film buffers");
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const quad = (p: WebGLProgram) => {
          const pos = gl.getAttribLocation(p, "aPos");
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
        };
        const cache = new Map<string, WebGLUniformLocation | null>();
        const uniform = (p: WebGLProgram, name: string) => {
          const key = (p === layer ? "l" : "p") + name;
          if (!cache.has(key)) cache.set(key, gl.getUniformLocation(p, name));
          return cache.get(key) ?? null;
        };
        const parameters = () => {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        };
        const texture = () => {
          const tx = gl.createTexture();
          if (!tx) throw new Error("Unable to allocate film texture");
          textures.push(tx); gl.bindTexture(gl.TEXTURE_2D, tx); parameters();
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([12, 25, 40, 255]));
          return tx;
        };
        const colorTarget = texture(), depthTarget = texture();
        const plates = new Map<string, PlateTexture>();
        for (const name of PLATE_NAMES) plates.set(name, { color: texture(), depth: texture(), width: 1, height: 1, ready: false, loading: false });
        const flags = window as Window & { __filmTotal?: number; __filmReady?: number };
        flags.__filmTotal = PLATE_NAMES.length; flags.__filmReady = 0;
        const size = root.clientWidth < 720 ? 1600 : 2000;
        const load = (name: string) => {
          const entry = plates.get(name);
          if (!entry || entry.loading || dead) return;
          entry.loading = true;
          let loaded = 0;
          for (const [target, url] of [[entry.color, `/plates/${name}-paint-${size}.webp`], [entry.depth, `/plates/${name}-depth.webp`]] as const) {
            const image = new Image(); image.decoding = "async"; images.push(image);
            image.onload = () => {
              if (dead || contextLost) return;
              gl.bindTexture(gl.TEXTURE_2D, target); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); parameters();
              if (target === entry.color) { entry.width = image.naturalWidth; entry.height = image.naturalHeight; }
              if (++loaded === 2) {
                entry.ready = true; flags.__filmReady = [...plates.values()].filter((value) => value.ready).length;
                schedule();
              }
            };
            image.onerror = schedule;
            image.src = url;
          }
        };
        preload = window.setTimeout(() => { if (!dead) for (const name of PLATE_NAMES) load(name); }, 900);
        let width = 0, height = 0;
        const bind = (unit: number, tx: WebGLTexture, p: WebGLProgram, name: string) => {
          gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tx); gl.uniform1i(uniform(p, name), unit);
        };
        return {
          dispose: cleanup,
          draw(scene, camera, effect) {
            if (dead) return;
            const index = SCENES.indexOf(scene);
            for (const i of [index, index + 1, index - 1]) if (SCENES[i]) load(SCENES[i].plate);
            const plate = plates.get(scene.plate);
            if (!plate?.ready) { markFallback(); return; }
            const dpr = Math.min(1.5, window.devicePixelRatio || 1);
            const w = Math.max(1, Math.round(root.clientWidth * dpr)), h = Math.max(1, Math.round(root.clientHeight * dpr));
            if (w !== width || h !== height) {
              width = w; height = h; canvas.width = w; canvas.height = h;
              for (const tx of [colorTarget, depthTarget]) {
                gl.bindTexture(gl.TEXTURE_2D, tx); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
              }
              gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
              gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTarget, 0);
              gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, depthTarget, 0);
              gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
              if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) { markFallback(); return; }
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); gl.viewport(0, 0, width, height);
            gl.useProgram(layer); quad(layer);
            bind(0, plate.color, layer, "uTex"); bind(1, plate.depth, layer, "uDep");
            gl.uniform2f(uniform(layer, "uRes"), width, height); gl.uniform2f(uniform(layer, "uTexSize"), plate.width, plate.height);
            const rest = root.clientWidth < 720 && scene.restMobile ? scene.restMobile : scene.rest;
            gl.uniform2f(uniform(layer, "uFocus"), rest[0], rest[1]);
            gl.uniform1f(uniform(layer, "uScale"), camera.zoom * (1 + effect * 0.3)); gl.uniform1f(uniform(layer, "uGain"), scene.gain);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.useProgram(post); quad(post);
            bind(0, colorTarget, post, "uTex"); bind(1, depthTarget, post, "uDep");
            gl.uniform2f(uniform(post, "uRes"), width, height); gl.uniform2f(uniform(post, "uPan"), camera.pan[0], camera.pan[1] + effect * 0.025);
            gl.uniform2f(uniform(post, "uFocusUv"), camera.focusUv[0], 1 - camera.focusUv[1]);
            const grade = scene.grade;
            gl.uniform3f(uniform(post, "uShadow"), ...grade.shadow); gl.uniform3f(uniform(post, "uHigh"), ...grade.high); gl.uniform3f(uniform(post, "uHazeCol"), ...grade.hazeCol);
            gl.uniform1f(uniform(post, "uTravel"), camera.travel); gl.uniform1f(uniform(post, "uHaze"), grade.haze); gl.uniform1f(uniform(post, "uNight"), grade.night);
            gl.uniform1f(uniform(post, "uDark"), effect * 0.5); gl.uniform1f(uniform(post, "uFocusD"), camera.focusDepth);
            gl.uniform1f(uniform(post, "uDofAmt"), (camera.dof + effect * 3) * width / 1440);
            gl.uniform1f(uniform(post, "uPaint"), scene.paint); gl.uniform1f(uniform(post, "uBands"), scene.bands); gl.uniform1f(uniform(post, "uPost"), scene.post);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            canvas.style.opacity = "1"; root.dataset.fallback = "0";
          },
        };
      } catch (error) {
        console.warn("Airport film is using its photographic fallback.", error);
        cleanup(); markFallback(); return null;
      }
    };

    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, preserveDrawingBuffer: false, powerPreference: "high-performance" });
    if (gl) renderer = createRenderer(gl); else markFallback();
    const lost = (event: Event) => {
      event.preventDefault(); contextLost = true; renderer?.dispose(); renderer = null;
      markFallback(); schedule();
    };
    const restored = () => {
      if (disposed || !gl) return;
      renderer?.dispose(); contextLost = false; renderer = createRenderer(gl); schedule();
    };
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else schedule();
    };
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("resize", schedule);
    motionPreference.addEventListener("change", schedule);
    const observer = new ResizeObserver(schedule); observer.observe(root);
    const stopT = t.on("change", schedule), stopFx = fx.on("change", schedule);
    schedule();
    return () => {
      disposed = true; cancelAnimationFrame(frame); stopT(); stopFx(); observer.disconnect();
      canvas.removeEventListener("webglcontextlost", lost); canvas.removeEventListener("webglcontextrestored", restored);
      document.removeEventListener("visibilitychange", visibility); window.removeEventListener("resize", schedule);
      motionPreference.removeEventListener("change", schedule);
      renderer?.dispose();
    };
  }, [t, fx]);

  return (
    <div ref={rootRef} className="film" aria-hidden="true" style={{ overflow: "hidden", pointerEvents: "none", background: "#071523" }}>
      <div ref={fallbackRef} style={{ position: "absolute", inset: "-3%", backgroundImage: 'linear-gradient(180deg, rgba(6,19,31,.16), rgba(4,15,27,.33)), url("/plates/hero-paint-1600.webp")', backgroundSize: "cover", backgroundPosition: "center", willChange: "transform" }} />
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%", opacity: 0 }} />
    </div>
  );
}
