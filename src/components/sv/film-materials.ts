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
// Tiles share an uninterrupted underpainting; it cannot repeat once per slab.
if (uFilmSurface > 0.5 && uFilmSurface < 1.5) filmUV = vFilmWorldPosition.xz;
vec3 filmPaintData = texture2D(uFilmPaint, filmUV * uFilmScale).rgb;
float filmFine = filmPaintData.g - 0.75;
// The painted source bends broad stroke edges by centimetres and pulls pigment
// from their bodies. There is no added random screen grain or tiled hatch.
vec2 filmStrokeUV = filmUV + (filmPaintData.rb - vec2(0.75)) * vec2(0.46, -0.39);
float filmBroad = filmBrush(filmStrokeUV, 0.115, 0.0) + filmBrush(filmStrokeUV, 0.273, 19.0) * 0.27;
float filmSurfacePaint = filmBroad;
if (uFilmSurface > 2.5 && uFilmSurface < 3.5) {
  // Loaded strokes run with the timber grain; isolated light streaks show varnish.
  filmSurfacePaint = filmBrush(filmStrokeUV * vec2(3.2, 0.19), 0.48, 8.0) * 0.72 + filmBroad * 0.24;
} else if (uFilmSurface > 1.5 && uFilmSurface < 2.5) {
  filmSurfacePaint = filmBrush(filmStrokeUV * vec2(0.9, 1.35), 0.15, 0.0) + filmBroad * 0.18;
}
filmSurfacePaint *= clamp(0.78 + filmFine * 2.1, 0.28, 1.08);
// Broad loaded-brush planes expose the cool undercoat beside a warm pigment
// ridge. Fine texture only roughens their edges; it never becomes a dirt layer.
float filmLoaded = smoothstep(0.10, 0.46, filmSurfacePaint);
float filmUnderpaint = smoothstep(0.06, 0.42, -filmSurfacePaint);
float filmPigmentStrength = uFilmPaintStrength;
if (uFilmSurface > 0.5 && uFilmSurface < 1.5) filmPigmentStrength *= 0.35;
float filmFineStrength = uFilmSurface > 1.5 && uFilmSurface < 2.5 ? 0.12 : 0.045;
float filmPigmentValue = 1.0 + (filmSurfacePaint * 0.27 + filmFine * filmFineStrength) * filmPigmentStrength;
diffuseColor.rgb *= filmPigmentValue;
diffuseColor.rgb *= mix(vec3(1.0), vec3(1.13, 1.045, 0.83), filmLoaded * filmPigmentStrength * 0.56);
diffuseColor.rgb *= mix(vec3(1.0), vec3(0.78, 0.91, 1.15), filmUnderpaint * filmPigmentStrength * 0.62);
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
reflectedLight.directDiffuse *= mix(vec3(0.45, 0.80, 1.52), vec3(1.055, 1.0, 0.91), filmLit);
// The shadow side carries violet/teal reflected colour, never neutral grey.
reflectedLight.indirectDiffuse *= mix(vec3(0.70, 1.13, 2.10), vec3(0.88, 1.0, 1.07), filmLit);
// A cool lower ramp value retains painted colour in shadow without lifting
// the entire room's ambient light or washing out the window-key contrast.
reflectedLight.indirectDiffuse += diffuseColor.rgb * mix(vec3(0.025, 0.044, 0.12), vec3(0.023, 0.068, 0.10), filmLoaded) * (1.0 - filmLit);
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
    // A handful of long loaded marks, each with a broad body and a ragged end.
    // Their negative space is as important as the strokes: no all-over hatch.
    const marks = [
      [12, 66, 282, 96, -.12, true], [326, 96, 246, 132, .09, false],
      [192, 264, 312, 112, -.07, true], [464, 332, 238, 148, .18, false],
      [51, 452, 266, 94, .11, false], [340, 495, 225, 83, -.16, true],
      [436, 184, 152, 42, .06, true], [108, 344, 174, 48, -.13, false],
    ] as const;
    for (const [x, y, length, width, angle, light] of marks) {
      const tone = light ? "#e4e4e4" : "#292929";
      const opacity = light ? .76 : .62;
      const top = Array.from({ length: 33 }, (_, n) => [-length / 2 + n * length / 32, -width * (.40 + random() * .12) * (.66 + .34 * Math.sin(n / 32 * Math.PI))]);
      const bottom = Array.from({ length: 33 }, (_, n) => [length / 2 - n * length / 32, width * (.38 + random() * .11) * (.66 + .34 * Math.sin(n / 32 * Math.PI))]);
      for (const dx of [-512, 0, 512]) for (const dy of [-512, 0, 512]) {
        context.save(); context.translate(x + dx, y + dy); context.rotate(angle);
        context.beginPath(); context.moveTo(top[0][0], top[0][1]);
        [...top.slice(1), ...bottom].forEach(([px, py]) => context.lineTo(px, py));
        context.closePath(); context.globalAlpha = opacity;
        const loading = context.createLinearGradient(-length * .5, 0, length * .5, 0);
        loading.addColorStop(0, `${tone}2b`); loading.addColorStop(.13, `${tone}ed`);
        loading.addColorStop(.47, `${tone}d4`); loading.addColorStop(.79, `${tone}83`); loading.addColorStop(1, `${tone}00`);
        context.fillStyle = loading; context.fill();
        context.clip();
        // Pigment pulls off the brush at the end in a few uneven ribbons.
        context.strokeStyle = "#808080";
        for (let bristle = 0; bristle < 36; bristle++) {
          const across = (bristle / 35 - .5) * width * .90;
          const begin = length * (-.14 + random() * .46);
          context.globalAlpha = .22 + random() * .43; context.lineWidth = .45 + random() * 2.2;
          context.beginPath(); context.moveTo(begin, across);
          context.quadraticCurveTo(length * .32, across + (random() - .5) * 2.7, length * .56, across + width * .018); context.stroke();
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
    material.customProgramCacheKey = () => "film-painted-standard-v6-dry-pigment";
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
    steel: painted("steel", { color: "#357c8a", roughness: 0.33, metalness: 0.48, paint: 0.65, rim: 0.30, kind: 4 }),
    ivory: painted("ivory", { color: "#ead4a3", roughness: 0.59, paint: 0.85 }),
    coral: painted("coral", { color: "#cb6244", roughness: 0.64, paint: 0.65 }),
    cyan: painted("cyan", { color: "#438f99", roughness: 0.48, metalness: 0.12, paint: 0.55 }),
    gold: painted("gold", { color: "#d7a341", roughness: 0.29, metalness: 0.56, paint: 0.50, rim: 0.22, kind: 4 }),
    floor: painted("floor", { color: "#547e9b", roughness: 0.26, metalness: 0.16, paint: 0.64, scale: 0.36, bands: 0.96, rim: 0.04, drawing: 0.15, kind: 1 }),
    wall: painted("wall", { color: "#b8cec1", roughness: 0.88, paint: 0.94, bands: 1.0, kind: 2 }),
    dark: painted("dark", { color: "#213c70", roughness: 0.72, paint: 0.62, rim: 0.19 }),
    walnut: painted("walnut", { color: "#a76536", roughness: 0.47, paint: 0.82, scale: 0.55, rim: 0.09, kind: 3 }),
    sage: painted("sage", { color: "#568d7f", roughness: 0.89, paint: 0.68, rim: 0.12 }),
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
