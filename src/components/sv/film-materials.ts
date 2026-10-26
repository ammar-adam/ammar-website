import * as THREE from "three";

export interface FilmMaterialPalette {
  ink: THREE.MeshStandardMaterial;
  steel: THREE.MeshStandardMaterial;
  ivory: THREE.MeshStandardMaterial;
  coral: THREE.MeshStandardMaterial;
  cyan: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  floor: THREE.MeshStandardMaterial;
  wall: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  walnut: THREE.MeshStandardMaterial;
  sage: THREE.MeshStandardMaterial;
  skin: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  warmLight: THREE.MeshBasicMaterial;
  coolLight: THREE.MeshBasicMaterial;
}

export interface FilmMaterials {
  materials: FilmMaterialPalette;
  /** Shared grayscale pigment data. Owned and disposed by this factory. */
  texture: THREE.Texture;
  /** Reuses the paint shader and shared maps; caller owns the returned material. */
  createSurface: (color: string, options?: Omit<Surface, "color">) => THREE.MeshStandardMaterial;
  dispose: () => void;
}

type Surface = {
  color: string;
  roughness?: number;
  metalness?: number;
  paint?: number;
  scale?: number;
  bands?: number;
  rim?: number;
  drawing?: number;
  kind?: number;
};

const VERTEX_FIELDS = /* glsl */`
varying vec3 vFilmPosition;
varying vec3 vFilmNormal;
varying vec3 vFilmWorldPosition;
`;

const VERTEX_POSITION = /* glsl */`
mat4 filmMetricMatrix = modelMatrix;
#ifdef USE_BATCHING
  filmMetricMatrix = filmMetricMatrix * batchingMatrix;
#endif
#ifdef USE_INSTANCING
  filmMetricMatrix = filmMetricMatrix * instanceMatrix;
#endif
// Physical scale, local orientation: marks follow rotating/moving objects.
vec3 filmMetric = vec3(length(filmMetricMatrix[0].xyz), length(filmMetricMatrix[1].xyz), length(filmMetricMatrix[2].xyz));
vFilmPosition = transformed * filmMetric;
vFilmWorldPosition = (filmMetricMatrix * vec4(transformed, 1.0)).xyz;
`;

const FRAGMENT_FIELDS = /* glsl */`
varying vec3 vFilmPosition;
varying vec3 vFilmNormal;
uniform sampler2D uFilmPaint;
uniform sampler2D uFilmBrush;
uniform float uFilmPaintStrength;
uniform float uFilmScale;
uniform float uFilmBands;
uniform float uFilmRim;
uniform float uFilmDrawing;
uniform float uFilmSurface;
varying vec3 vFilmWorldPosition;
#ifdef FILM_FLOOR
uniform sampler2D uFilmCityReflection;
#endif

float filmRandom(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 filmSurfaceUV(vec3 point, vec3 surfaceNormal) {
  vec3 n = abs(normalize(surfaceNormal));
  return n.x > n.y && n.x > n.z ? point.zy : (n.y > n.z ? point.xz : point.xy);
}
// A tiny authored stroke atlas provides irregular pigment shapes without the
// aligned rows that procedural line grids create on large architectural faces.
float filmBrush(vec2 uv, float density, float seed) {
  float angle = seed * 0.037;
  vec2 p = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv * density;
  return (texture2D(uFilmBrush, p + vec2(seed * 0.13, seed * 0.21)).r - 0.5) * 4.0;
}
`;

const PIGMENT = /* glsl */`
vec2 filmUV = filmSurfaceUV(vFilmPosition, vFilmNormal);
float filmFine = texture2D(uFilmPaint, filmUV * uFilmScale).g - 0.75;
float filmBroad = filmBrush(filmUV, 0.30, 0.0) + filmBrush(filmUV, 0.82, 19.0) * 0.35;
// Pigment is brushed across the form rather than added as screen-space noise.
// The same small atlas supplies broad loaded-brush marks and finer dry edges.
float filmSurfacePaint = filmBroad;
if (uFilmSurface > 2.5 && uFilmSurface < 3.5) {
  // Long restrained grain makes walnut read as veneer, not brown plastic.
  filmSurfacePaint = filmBrush(filmUV * vec2(3.8, 0.18), 0.72, 8.0) * 0.70 + filmBroad * 0.40;
} else if (uFilmSurface > 1.5 && uFilmSurface < 2.5) {
  // Plaster retains a little of the painter's downward brush direction.
  filmSurfacePaint += filmBrush(filmUV * vec2(2.8, 0.22), 0.62, 11.0) * 0.35;
}
float filmPigmentValue = 1.0 + (filmSurfacePaint * 0.15 + filmFine * 0.025) * uFilmPaintStrength;
diffuseColor.rgb *= filmPigmentValue;
diffuseColor.rgb *= vec3(1.0 + filmSurfacePaint * 0.030, 1.0 + filmSurfacePaint * 0.012, 1.0 - filmSurfacePaint * 0.040);
`;

const PRINT_SHADOW = /* glsl */`
#if defined(USE_SHADOWMAP) && defined(SHADOWMAP_TYPE_PCF)
// A narrow stable five-tap shadow keeps the mullion and arch shapes sharp.
// The only halftone screen lives in the final post pass, never in this material.
float filmPrintShadow(sampler2DShadow shadowMap, vec2 shadowMapSize, float intensity, float bias, float radius, vec4 coord) {
  coord.xyz /= coord.w;
  coord.z += bias;
  if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0 || coord.z > 1.0) return 1.0;
  vec2 spread = vec2(1.0) / shadowMapSize * max(radius, 1.0) * 0.65;
  float coverage = texture(shadowMap, vec3(coord.xy, coord.z)) * 0.50
    + texture(shadowMap, vec3(coord.xy + vec2(spread.x, 0.0), coord.z)) * 0.125
    + texture(shadowMap, vec3(coord.xy - vec2(spread.x, 0.0), coord.z)) * 0.125
    + texture(shadowMap, vec3(coord.xy + vec2(0.0, spread.y), coord.z)) * 0.125
    + texture(shadowMap, vec3(coord.xy - vec2(0.0, spread.y), coord.z)) * 0.125;
  return mix(1.0, smoothstep(0.12, 0.88, coverage), intensity);
}
#endif
`;

const LIGHTING = /* glsl */`
// Four deliberate light values, driven by the actual lights and cast shadows.
// Narrow AA at each boundary keeps hard painted planes stable while moving.
float filmAlbedo = max(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.015);
float filmDirect = dot(reflectedLight.directDiffuse, vec3(0.2126, 0.7152, 0.0722));
float filmExposure = filmDirect / filmAlbedo;
float filmBoundaryVariation = smoothstep(0.0003, 0.008, fwidth(filmExposure));
float filmPaintedExposure = max(0.0, filmExposure + filmBroad * 0.025 * uFilmPaintStrength * filmBoundaryVariation);
float filmBandAA = clamp(fwidth(filmPaintedExposure) * 0.6, 0.004, 0.018);
float filmBanded = 0.31 * smoothstep(0.13 - filmBandAA, 0.13 + filmBandAA, filmPaintedExposure)
  + 0.46 * smoothstep(0.46 - filmBandAA, 0.46 + filmBandAA, filmPaintedExposure)
  + 0.57 * smoothstep(0.93 - filmBandAA, 0.93 + filmBandAA, filmPaintedExposure);
float filmBandGain = mix(filmExposure, filmBanded, uFilmBands) / max(filmExposure, 0.0001);
reflectedLight.directDiffuse *= filmBandGain;
float filmLit = smoothstep(0.18, 0.83, filmExposure);
reflectedLight.directDiffuse *= mix(vec3(0.65, 0.83, 1.25), vec3(1.035, 1.0, 0.95), filmLit);
// The shadow side carries violet/teal reflected colour, never neutral grey.
reflectedLight.indirectDiffuse *= mix(vec3(0.84, 1.15, 1.85), vec3(0.91, 1.0, 1.04), filmLit);
// A cool lower ramp value retains painted colour in shadow without lifting
// the entire room's ambient light or washing out the window-key contrast.
reflectedLight.indirectDiffuse += diffuseColor.rgb * vec3(0.014, 0.026, 0.057) * (1.0 - filmLit);
float filmFacing = clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0);
// Metal and varnish keep a physical broad sheen; other highlights resolve into
// small painted shapes. Ink contours are a consistent pixel width in post.
float filmSpecular = dot(reflectedLight.directSpecular, vec3(0.2126, 0.7152, 0.0722));
float filmSpecularEdge = filmBroad * 0.003 * uFilmPaintStrength;
float filmSpecularPaint = 0.025 * smoothstep(0.012 + filmSpecularEdge, 0.018 + filmSpecularEdge, filmSpecular)
  + 0.085 * smoothstep(0.055 + filmSpecularEdge, 0.064 + filmSpecularEdge, filmSpecular)
  + 0.18 * smoothstep(0.14, 0.16, filmSpecular);
float filmMatteHighlight = uFilmSurface > 0.5 && uFilmSurface < 1.5 ? 0.12 : (uFilmSurface > 3.5 ? 0.26 : 0.78);
reflectedLight.directSpecular *= mix(filmSpecular, filmSpecularPaint, filmMatteHighlight) / max(filmSpecular, 0.0001);
`;

const RIM = /* glsl */`
// A restrained cool reflected edge, present only where the surface is lit.
float filmEdge = pow(1.0 - filmFacing, 4.0);
float filmAvailableLight = clamp(dot(totalDiffuse, vec3(0.2126, 0.7152, 0.0722)) * 2.0, 0.0, 1.0);
outgoingLight += vec3(0.10, 0.20, 0.23) * filmEdge * uFilmRim * filmAvailableLight;
#ifdef FILM_FLOOR
// Project the existing painted exterior through the real window plane. This
// floor-only reflection costs three filtered samples, not another scene pass.
vec3 filmReflectionRay = reflect(normalize(vFilmWorldPosition - cameraPosition), vec3(0.0, 1.0, 0.0));
float filmWindowDistance = (13.94 - vFilmWorldPosition.x) / max(filmReflectionRay.x, 0.0001);
vec3 filmWindowHit = vFilmWorldPosition + filmReflectionRay * filmWindowDistance;
float filmWindowMask = smoothstep(0.03, 0.18, filmReflectionRay.x)
  * smoothstep(0.10, 1.15, filmWindowHit.y) * (1.0 - smoothstep(6.9, 8.3, filmWindowHit.y))
  * smoothstep(-104.0, -101.0, filmWindowHit.z) * (1.0 - smoothstep(11.0, 14.0, filmWindowHit.z));
float filmCityDistance = (220.0 - vFilmWorldPosition.x) / max(filmReflectionRay.x, 0.0001);
vec3 filmCityHit = vFilmWorldPosition + filmReflectionRay * filmCityDistance;
vec2 filmCityUV = vec2((filmCityHit.z + 75.0) / 620.0 + 0.5, (filmCityHit.y - 88.0) / 348.75 + 0.5);
filmWindowMask *= smoothstep(0.0, 0.08, filmCityUV.x) * (1.0 - smoothstep(0.92, 1.0, filmCityUV.x))
  * smoothstep(0.0, 0.08, filmCityUV.y) * (1.0 - smoothstep(0.92, 1.0, filmCityUV.y));
vec3 filmCityReflection = texture2D(uFilmCityReflection, filmCityUV, 2.3).rgb * 0.5
  + texture2D(uFilmCityReflection, filmCityUV + vec2(0.0025, 0.004), 2.3).rgb * 0.25
  + texture2D(uFilmCityReflection, filmCityUV - vec2(0.0025, 0.004), 2.3).rgb * 0.25;
float filmReflectionFresnel = pow(1.0 - abs(filmReflectionRay.y), 3.0);
outgoingLight = mix(outgoingLight, filmCityReflection * vec3(0.91, 0.98, 1.05), filmWindowMask * (0.075 + 0.12 * filmReflectionFresnel));
#endif
`;

/**
 * Lit painted surfaces for real geometry. Brush marks use physical object-space
 * coordinates, independent of stretched UVs. No vertex displacement
 * means stock depth/shadow passes stay exact for meshes, instances and skinning.
 *
 * Light with one warm shadow-casting directional key (~3–4), a restrained cool
 * fill (~0.4–0.7), and a hemisphere (~0.25–0.45). Enable renderer shadows and mesh
 * castShadow/receiveShadow. A neutral environment map helps bronze/steel reflect.
 * Avoid large ambient intensities or emissive walls; those erase the volume.
 */
export function createFilmMaterials(invalidate: () => void): FilmMaterials {
  let disposed = false;
  // This small reusable pigment map contains only brush marks, never scene art.
  // Strokes wrap at the boundary and are generated once, not on animation frames.
  const brushCanvas = document.createElement("canvas");
  brushCanvas.width = brushCanvas.height = 512;
  const context = brushCanvas.getContext("2d");
  if (context) {
    context.fillStyle = "#808080"; context.fillRect(0, 0, 512, 512);
    let seed = 731982;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 42; i++) {
      const x = random() * 512, y = random() * 512;
      const length = 55 + random() * 125, width = 28 + random() * 62;
      const angle = (random() - .5) * .38 + (i % 11 === 0 ? .55 : 0);
      const tone = random() > .5 ? "#d3d3d3" : "#333333";
      const opacity = .10 + random() * .16;
      const top = Array.from({ length: 10 }, (_, n) => [-length / 2 + n * length / 9, -width * (.34 + random() * .10) * (.22 + .78 * Math.sin(n / 9 * Math.PI))]);
      const bottom = Array.from({ length: 10 }, (_, n) => [length / 2 - n * length / 9, width * (.30 + random() * .10) * (.22 + .78 * Math.sin(n / 9 * Math.PI))]);
      for (const dx of [-512, 0, 512]) for (const dy of [-512, 0, 512]) {
        context.save(); context.translate(x + dx, y + dy); context.rotate(angle);
        context.beginPath(); context.moveTo(top[0][0], top[0][1]);
        [...top.slice(1), ...bottom].forEach(([px, py]) => context.lineTo(px, py));
        context.closePath(); context.globalAlpha = opacity; context.fillStyle = tone; context.fill();
        context.clip(); context.strokeStyle = tone; context.globalAlpha = opacity * .12; context.lineWidth = .8;
        for (let bristle = -2; bristle <= 2; bristle++) {
          context.beginPath(); context.moveTo(-length * .48, bristle * width * .13);
          context.lineTo(length * .44, bristle * width * .13 + width * .08); context.stroke();
        }
        context.restore();
      }
    }
  }
  const brushTexture = new THREE.CanvasTexture(brushCanvas);
  brushTexture.colorSpace = THREE.NoColorSpace;
  brushTexture.wrapS = brushTexture.wrapT = THREE.RepeatWrapping;
  brushTexture.anisotropy = 4;
  const placeholder = new THREE.DataTexture(new Uint8Array([191, 191, 191, 255]), 1, 1, THREE.RGBAFormat);
  placeholder.needsUpdate = true;
  const paintUniform = { value: placeholder as THREE.Texture };
  const texture = new THREE.TextureLoader().load("/art/terminal-paint-material.webp", loaded => {
    if (disposed) { loaded.dispose(); return; }
    loaded.userData.settled = true;
    paintUniform.value = loaded;
    invalidate();
  }, undefined, () => { texture.userData.settled = true; if (!disposed) invalidate(); });
  // This is pigment variation data, not albedo: keep its grayscale values linear.
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;

  const painted = (name: string, surface: Surface) => {
    const material = new THREE.MeshStandardMaterial({
      color: surface.color,
      roughness: surface.roughness ?? 0.72,
      metalness: surface.metalness ?? 0.04,
      dithering: true,
    });
    material.name = `film-${name}`;
    if (surface.kind === 1) material.defines = { ...material.defines, FILM_FLOOR: 1 };
    const uniforms = {
      uFilmPaint: paintUniform,
      uFilmBrush: { value: brushTexture },
      uFilmPaintStrength: { value: surface.paint ?? 0.75 },
      uFilmScale: { value: surface.scale ?? 0.40 },
      uFilmBands: { value: surface.bands ?? 1.0 },
      uFilmRim: { value: surface.rim ?? 0.27 },
      uFilmDrawing: { value: surface.drawing ?? 0.85 },
      uFilmSurface: { value: surface.kind ?? 0 },
      uFilmCityReflection: { value: placeholder as THREE.Texture },
    };
    // These uniform objects may be adjusted without creating shader variants.
    material.userData.film = uniforms;
    material.customProgramCacheKey = () => "film-painted-standard-v5-proof3";
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${VERTEX_FIELDS}`)
        .replace("#include <defaultnormal_vertex>", "#include <defaultnormal_vertex>\nvFilmNormal = normalize(objectNormal);")
        .replace("#include <project_vertex>", `${VERTEX_POSITION}\n#include <project_vertex>`);
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>\n${FRAGMENT_FIELDS}`)
        .replace("#include <shadowmap_pars_fragment>", `#include <shadowmap_pars_fragment>\n${PRINT_SHADOW}`)
        .replace("#include <lights_fragment_begin>", THREE.ShaderChunk.lights_fragment_begin.replace(
          "getShadow( directionalShadowMap[ i ]",
          `\n#if defined(SHADOWMAP_TYPE_PCF)\nfilmPrintShadow( directionalShadowMap[ i ]\n#else\ngetShadow( directionalShadowMap[ i ]\n#endif\n`,
        ).replace(
          "getDirectionalLightInfo( directionalLight, directLight );",
          `getDirectionalLightInfo( directionalLight, directLight );
#if UNROLLED_LOOP_INDEX == 0
// The window key loses energy across the room; coloured fill stays intact.
directLight.color *= mix(0.40, 1.0, smoothstep(-12.0, 13.0, vFilmWorldPosition.x));
#endif`,
        ))
        .replace("#include <map_fragment>", `#include <map_fragment>\n${PIGMENT}`)
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor + (filmFine * 0.12 + filmSurfacePaint * 0.030) * uFilmPaintStrength, 0.16, 1.0);")
        .replace("#include <aomap_fragment>", `#include <aomap_fragment>\n${LIGHTING}`)
        .replace("#include <opaque_fragment>", `${RIM}\n#include <opaque_fragment>`);
    };
    return material;
  };

  const materials: FilmMaterialPalette = {
    ink: painted("ink", { color: "#111c2d", roughness: 0.84, paint: 0.45, rim: 0.10 }),
    steel: painted("steel", { color: "#527b88", roughness: 0.33, metalness: 0.48, paint: 0.65, rim: 0.30, kind: 4 }),
    ivory: painted("ivory", { color: "#e6d7bb", roughness: 0.59, paint: 0.85 }),
    coral: painted("coral", { color: "#ac5548", roughness: 0.64, paint: 0.65 }),
    cyan: painted("cyan", { color: "#79a9ad", roughness: 0.48, metalness: 0.12, paint: 0.55 }),
    gold: painted("gold", { color: "#d1a56d", roughness: 0.29, metalness: 0.56, paint: 0.50, rim: 0.22, kind: 4 }),
    floor: painted("floor", { color: "#829caf", roughness: 0.26, metalness: 0.16, paint: 0.64, scale: 0.36, bands: 0.96, rim: 0.04, drawing: 0.15, kind: 1 }),
    wall: painted("wall", { color: "#d8d5c4", roughness: 0.88, paint: 0.72, bands: 1.0, kind: 2 }),
    dark: painted("dark", { color: "#253853", roughness: 0.72, paint: 0.62, rim: 0.19 }),
    walnut: painted("walnut", { color: "#946746", roughness: 0.47, paint: 0.82, scale: 0.55, rim: 0.09, kind: 3 }),
    sage: painted("sage", { color: "#7e8b77", roughness: 0.89, paint: 0.68, rim: 0.12 }),
    skin: painted("skin", { color: "#b98466", roughness: 0.82, paint: 0.14, scale: 0.8, bands: 0.90, rim: 0.10, drawing: 0.35 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#aacacc", roughness: 0.13, metalness: 0, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide, ior: 1.45, clearcoat: 0.35, clearcoatRoughness: 0.18 }),
    warmLight: new THREE.MeshBasicMaterial({ color: "#ffe0ad", toneMapped: false }),
    coolLight: new THREE.MeshBasicMaterial({ color: "#c4e2e0", toneMapped: false }),
  };
  materials.glass.name = "film-glass";
  materials.warmLight.name = "film-warm-practical";
  materials.coolLight.name = "film-cool-practical";

  return {
    materials,
    texture,
    createSurface: (color, options = {}) => painted("custom", { ...options, color }),
    dispose() {
      if (disposed) return;
      disposed = true;
      Object.values(materials).forEach(material => material.dispose());
      placeholder.dispose();
      brushTexture.dispose();
      texture.dispose();
    },
  };
}
