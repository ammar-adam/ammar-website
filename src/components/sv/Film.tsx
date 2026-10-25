"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import { PLATE_NAMES, SCENES, type Camera, type Scene } from "./plates";

/* Real architecture supplies the perspective; painted value planes, broken
   contours and off-focus colour registration supply the illustrated light.
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
uniform float uScale, uGain, uRoll;
void main(){
  float ca = uRes.x / uRes.y, ta = uTexSize.x / uTexSize.y;
  vec2 span = ((ta > ca) ? vec2(ca / ta, 1.0) : vec2(1.0, ta / ca)) / uScale;
  vec2 centre = clamp(uFocus, span * 0.5, vec2(1.0) - span * 0.5);
  vec2 screen = vec2(vUv.x, 1.0 - vUv.y) - 0.5;
  screen.x *= ca;
  screen = mat2(cos(uRoll), -sin(uRoll), sin(uRoll), cos(uRoll)) * screen;
  screen.x /= ca;
  vec2 uv = centre + screen * span;
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
  float depth = texture(uDep, vUv).r;
  // A forward dolly magnifies the foreground more than the distant terminal.
  vec2 uv = uFocusUv + (vUv - uFocusUv) / (1.0 + uTravel * depth * 0.085);
  uv += uPan * mix(0.16, 1.0, depth);
  uv = clamp(uv, vec2(0.001), vec2(0.999));
  vec3 source = texture(uTex, uv).rgb;
  float d = texture(uDep, uv).r;
  vec2 texel = 1.7 / uRes;
  vec3 left = texture(uTex, uv - vec2(texel.x, 0)).rgb;
  vec3 right = texture(uTex, uv + vec2(texel.x, 0)).rgb;
  vec3 down = texture(uTex, uv - vec2(0, texel.y)).rgb;
  vec3 up = texture(uTex, uv + vec2(0, texel.y)).rgb;
  vec2 edge = vec2(lum(right) - lum(left), lum(up) - lum(down));
  float edgeSize = length(edge);
  // Remove camera micro-detail within a plane, without softening silhouettes.
  vec3 c = mix(source, (source * 2.0 + left + right + up + down) / 6.0,
    (1.0 - smoothstep(0.035, 0.17, edgeSize)) * 0.65);
  float L = lum(c);
  // Long, broken paint marks disturb the contour of the light, not the camera.
  // These coordinates travel with the plate so the surface never boils at rest.
  vec2 paper = uv * uRes;
  vec2 brushUv = mat2(0.94, -0.342, 0.342, 0.94) * paper;
  float brush = noise(brushUv * vec2(0.013, 0.16));
  float pigment = noise(paper * 0.052) * 0.6 + brush * 0.4;
  float q = clamp(L + (pigment - 0.5) * uPaint * 0.42, 0.0, 1.0) * uBands;
  float painted = (floor(q) + smoothstep(0.43, 0.57, fract(q))) / uBands;
  float value = mix(L, painted, uPost);
  c *= (value + 0.025) / (L + 0.025);
  L = lum(c);
  c = mix(vec3(L), c, 1.22);
  // Ink-blue shadow shapes oppose coral / amber light. The light is coloured,
  // rather than a translucent tint spread over the entire photograph.
  float shadow = 1.0 - smoothstep(0.10, 0.48, L);
  vec3 cool = uShadow * (0.22 + L * 2.7);
  c = mix(c, cool, shadow * 0.67);
  float warm = smoothstep(0.30, 0.86, L);
  vec3 key = mix(vec3(0.94, 0.29, 0.18), uHigh, smoothstep(0.22, 0.76, L));
  // Fluorescent greens in the source become deliberately painted warm light.
  float fluorescent = smoothstep(0.015, 0.15, source.g - source.b)
    * smoothstep(0.02, 0.11, source.g - source.r) * smoothstep(0.12, 0.34, L);
  warm = max(warm, fluorescent * 0.9);
  c = mix(c, key * (0.37 + L * 0.73), warm * 0.56);
  float haze = (1.0 - smoothstep(0.10, 0.58, d)) * uHaze;
  c = mix(c, uHazeCol, haze);
  c *= 1.0 - uNight * 0.14;
  // A rough ink contour and one lit rim: no uniform cartoon outline.
  float broken = smoothstep(0.20, 0.72, brush);
  float contour = smoothstep(0.055, 0.24, edgeSize) * mix(0.26, 0.72, broken);
  c = mix(c, uShadow * 0.18, contour * 0.5);
  float rim = smoothstep(0.09, 0.28, max(0.0, edge.x - edge.y * 0.65));
  c += vec3(0.05, 0.34, 0.39) * rim * broken * (1.0 - warm) * 0.52;
  // The lens registers cyan / red at off-focus boundaries only, never a blur.
  float coc = max(0.0, abs(d - uFocusD) - 0.12) * uDofAmt;
  vec2 direction = normalize(uv - uFocusUv + vec2(0.0001));
  vec2 off = direction * coc * 1.45 / uRes;
  float split = smoothstep(0.12, 1.65, coc) * smoothstep(0.025, 0.16, edgeSize);
  c.r += (texture(uTex, uv + off).r - source.r) * split * 1.1;
  c.gb += (texture(uTex, uv - off).gb - source.gb) * split * 0.85;
  // Print texture is confined to broken patches at shadow transitions.
  // Deep ink, light areas and the atmospheric distance remain clean.
  float cell = max(3.0, 5.4 * uRes.y / 1080.0);
  vec2 grid = mat2(0.7071, -0.7071, 0.7071, 0.7071) * paper / cell;
  float dots = length(fract(grid) - 0.5) * cell;
  float radius = cell * mix(0.34, 0.17, smoothstep(0.14, 0.42, L));
  float mask = smoothstep(0.10, 0.19, L) * (1.0 - smoothstep(0.32, 0.43, L));
  mask *= smoothstep(0.24, 0.58, d) * smoothstep(0.35, 0.62, pigment);
  float inkDot = 1.0 - smoothstep(radius - 0.4, radius + 0.4, dots);
  c = mix(c, uShadow * 0.25, inkDot * mask * 0.52);
  float hatch = 1.0 - smoothstep(0.08, 0.22, abs(fract(brushUv.y / 5.5) - 0.5));
  c += vec3(0.25, 0.34, 0.28) * hatch * mask * broken * 0.11;
  c *= 1.0 + (pigment - 0.5) * uPaint * 0.62;
  vec2 vignette = vUv - 0.5;
  c *= 1.0 - dot(vignette, vignette) * 0.25;
  o = vec4(clamp(c, 0.0, 1.0) * (1.0 - uDark), 1.0);
}`;

type PlateTexture = { color: WebGLTexture; depth: WebGLTexture; width: number; height: number; ready: boolean; loading: boolean };
type Renderer = { draw: (scene: Scene, camera: Camera, effect: number) => void; dispose: () => void };

function sceneAt(progress: number) {
  return SCENES.find((scene) => progress < scene.range[1]) ?? SCENES[SCENES.length - 1];
}

export function Film({ t, fx, departure }: { t: MotionValue<number>; fx: MotionValue<number>; departure: MotionValue<number> }) {
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
      const flight = scene.id === "boarding" && !motionPreference.matches ? departure.get() : 0;
      camera.zoom += flight * .24;
      camera.travel += flight * .9;
      camera.roll -= Math.sin(flight * Math.PI) * 1.7;
      camera.pan = [camera.pan[0] + flight * .025, camera.pan[1] + flight * .055];
      root.dataset.departure = flight.toFixed(3);
      const small = root.clientWidth < 720;
      const plate = `/plates/${scene.plate}-paint-${small ? 1600 : 2000}.webp`;
      if (fallbackPlate !== plate) {
        fallback.style.backgroundImage = `linear-gradient(180deg, rgba(6, 19, 31, 0.16), rgba(4, 15, 27, 0.33)), url("${plate}")`;
        fallbackPlate = plate;
      }
      const rest = camera.crop ?? (small && scene.restMobile ? scene.restMobile : scene.rest);
      fallback.style.backgroundPosition = `${rest[0] * 100}% ${rest[1] * 100}%`;
      fallback.style.transformOrigin = `${camera.focusUv[0] * 100}% ${camera.focusUv[1] * 100}%`;
      fallback.style.transform = `translate3d(${-camera.pan[0] * 100}%, ${camera.pan[1] * 100}%, 0) scale(${camera.zoom * (1 + effect * 0.085)}) rotate(${camera.roll}deg)`;
      fallback.style.filter = `saturate(1.35) contrast(1.2) brightness(${1.04 - effect * 0.18})`;
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
            const rest = camera.crop ?? (root.clientWidth < 720 && scene.restMobile ? scene.restMobile : scene.rest);
            gl.uniform2f(uniform(layer, "uFocus"), rest[0], rest[1]);
            gl.uniform1f(uniform(layer, "uScale"), camera.zoom * (1 + effect * 0.085)); gl.uniform1f(uniform(layer, "uGain"), scene.gain);
            gl.uniform1f(uniform(layer, "uRoll"), camera.roll * Math.PI / 180);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.useProgram(post); quad(post);
            bind(0, colorTarget, post, "uTex"); bind(1, depthTarget, post, "uDep");
            gl.uniform2f(uniform(post, "uRes"), width, height); gl.uniform2f(uniform(post, "uPan"), camera.pan[0] + effect * 0.008, camera.pan[1] + effect * 0.012);
            gl.uniform2f(uniform(post, "uFocusUv"), camera.focusUv[0], 1 - camera.focusUv[1]);
            const grade = scene.grade;
            gl.uniform3f(uniform(post, "uShadow"), ...grade.shadow); gl.uniform3f(uniform(post, "uHigh"), ...grade.high); gl.uniform3f(uniform(post, "uHazeCol"), ...grade.hazeCol);
            gl.uniform1f(uniform(post, "uTravel"), camera.travel); gl.uniform1f(uniform(post, "uHaze"), grade.haze); gl.uniform1f(uniform(post, "uNight"), grade.night);
            gl.uniform1f(uniform(post, "uDark"), effect * 0.18); gl.uniform1f(uniform(post, "uFocusD"), camera.focusDepth);
            gl.uniform1f(uniform(post, "uDofAmt"), (camera.dof + effect * 9) * width / 1440);
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
    const stopT = t.on("change", schedule), stopFx = fx.on("change", schedule), stopDeparture = departure.on("change", schedule);
    schedule();
    return () => {
      disposed = true; cancelAnimationFrame(frame); stopT(); stopFx(); stopDeparture(); observer.disconnect();
      canvas.removeEventListener("webglcontextlost", lost); canvas.removeEventListener("webglcontextrestored", restored);
      document.removeEventListener("visibilitychange", visibility); window.removeEventListener("resize", schedule);
      motionPreference.removeEventListener("change", schedule);
      renderer?.dispose();
    };
  }, [t, fx, departure]);

  return (
    <div ref={rootRef} className="film" aria-hidden="true" style={{ overflow: "hidden", pointerEvents: "none", background: "#071523" }}>
      <div ref={fallbackRef} style={{ position: "absolute", inset: "-3%", backgroundImage: 'linear-gradient(180deg, rgba(6,19,31,.16), rgba(4,15,27,.33)), url("/plates/hero-paint-1600.webp")', backgroundSize: "cover", backgroundPosition: "center", willChange: "transform" }} />
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%", opacity: 0 }} />
    </div>
  );
}
