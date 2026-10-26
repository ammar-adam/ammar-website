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
};

const VERTEX_FIELDS = /* glsl */`
varying vec3 vFilmPosition;
varying vec3 vFilmNormal;
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
float filmBroad = filmBrush(filmUV, 0.17, 0.0) + filmBrush(filmUV, 0.43, 19.0) * 0.32;
// The original paint image now only breaks pigment edges, avoiding dirty stone.
float filmPigmentValue = 1.0 + (filmBroad * 0.105 + filmFine * 0.22) * uFilmPaintStrength;
diffuseColor.rgb *= filmPigmentValue;
diffuseColor.rgb *= vec3(1.0 + filmBroad * 0.028, 1.0, 1.0 - filmBroad * 0.04);
`;

const PRINT_SHADOW = /* glsl */`
#if defined(USE_SHADOWMAP) && defined(SHADOWMAP_TYPE_PCF)
// Five deterministic hardware-PCF taps replace the stock per-pixel random disk.
// A small object-bound screen tone carries the transition. Both its density and
// the shadow test are antialiased; distant marks collapse to their mean value.
float filmPrintShadow(sampler2DShadow shadowMap, vec2 shadowMapSize, float intensity, float bias, float radius, vec4 coord) {
  coord.xyz /= coord.w;
  coord.z += bias;
  if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0 || coord.z > 1.0) return 1.0;
  vec2 texel = vec2(1.0) / shadowMapSize;
  vec2 paperUV = filmSurfaceUV(vFilmPosition, vFilmNormal);
  float dryEdge = filmBrush(paperUV, 0.43, 19.0) * 0.22;
  vec2 at = coord.xy + texel * vec2(dryEdge, dryEdge * 0.6);
  vec2 spread = texel * max(radius, 1.0) * 1.7;
  float coverage = texture(shadowMap, vec3(at, coord.z)) * 0.40
    + texture(shadowMap, vec3(at + vec2(spread.x, 0.0), coord.z)) * 0.15
    + texture(shadowMap, vec3(at - vec2(spread.x, 0.0), coord.z)) * 0.15
    + texture(shadowMap, vec3(at + vec2(0.0, spread.y), coord.z)) * 0.15
    + texture(shadowMap, vec3(at - vec2(0.0, spread.y), coord.z)) * 0.15;
  vec2 grid = mat2(0.819, -0.574, 0.574, 0.819) * paperUV * 20.0;
  float gridAA = max(length(fwidth(grid)) * 0.56, 0.018);
  float distanceToDot = length(fract(grid) - 0.5);
  float dotRadius = sqrt(max(0.0, 1.0 - coverage)) * 0.59;
  float printLight = smoothstep(dotRadius - gridAA, dotRadius + gridAA, distanceToDot);
  float transition = smoothstep(0.04, 0.22, coverage) * (1.0 - smoothstep(0.78, 0.96, coverage));
  float resolvable = 1.0 - smoothstep(0.28, 0.72, length(fwidth(grid)));
  float selectedMark = smoothstep(-0.045, 0.09, filmBrush(paperUV, 0.21, 43.0));
  float drawn = mix(smoothstep(0.18, 0.82, coverage), printLight, transition * resolvable * selectedMark * uFilmDrawing * 0.72);
  return mix(1.0, drawn, intensity);
}
#endif
`;

const LIGHTING = /* glsl */`
// Work on the real shadowed diffuse light; specular highlights remain physical.
float filmAlbedo = max(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.025);
float filmDirect = dot(reflectedLight.directDiffuse, vec3(0.2126, 0.7152, 0.0722));
float filmExposure = filmDirect / filmAlbedo;
// Deliberately broad value planes. Brush edges perturb their boundaries while
// the real light and shadow still determine which face belongs to each plane.
float filmBoundaryVariation = smoothstep(0.0003, 0.008, fwidth(filmExposure));
float filmPaintedExposure = max(0.0, filmExposure + (filmBroad * 0.018 + filmFine * 0.035) * uFilmPaintStrength * filmBoundaryVariation);
float filmBanded = 0.13 * smoothstep(0.020, 0.065, filmPaintedExposure)
  + 0.35 * smoothstep(0.22, 0.27, filmPaintedExposure)
  + 0.53 * smoothstep(0.60, 0.66, filmPaintedExposure)
  + 0.57 * smoothstep(1.11, 1.18, filmPaintedExposure);
float filmBandGain = mix(filmExposure, filmBanded, uFilmBands) / max(filmExposure, 0.0001);
reflectedLight.directDiffuse *= filmBandGain;
float filmLit = smoothstep(0.09, 0.72, filmExposure);
reflectedLight.directDiffuse *= mix(vec3(0.62, 0.67, 1.18), vec3(1.045, 1.0, 0.91), filmLit);
reflectedLight.indirectDiffuse *= mix(vec3(0.63, 0.65, 1.26), vec3(0.98, 1.0, 1.02), filmLit);
// Object-anchored broken hatch marks only in the lit-to-shadow transition.
float filmHatchPhase = (filmUV.x * 0.67 + filmUV.y) * 10.0;
float filmHatchDistance = abs(fract(filmHatchPhase) - 0.5);
float filmHatchAA = max(fwidth(filmHatchPhase), 0.035);
float filmHatch = 1.0 - smoothstep(0.055, 0.055 + filmHatchAA, filmHatchDistance);
float filmHatchPatch = smoothstep(0.06, 0.40, abs(filmBrush(filmUV, 0.49, 43.0)));
float filmTransition = smoothstep(0.055, 0.14, filmExposure) * (1.0 - smoothstep(0.36, 0.54, filmExposure));
float filmLightVariation = smoothstep(0.0008, 0.012, fwidth(filmExposure));
float filmHatchInk = filmHatch * filmHatchPatch * filmTransition * filmLightVariation * uFilmPaintStrength;
reflectedLight.directDiffuse *= 1.0 - filmHatchInk * 0.35;
reflectedLight.indirectDiffuse *= 1.0 - filmHatchInk * 0.26;
float filmFacing = clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0);
float filmContour = (1.0 - smoothstep(0.035, 0.19, filmFacing)) * (0.55 + 0.45 * smoothstep(-0.05, 0.28, filmBroad));
reflectedLight.directDiffuse *= 1.0 - filmContour * 0.43 * uFilmDrawing;
reflectedLight.indirectDiffuse *= 1.0 - filmContour * 0.43 * uFilmDrawing;
// Each curved lit form has a deliberate secondary pencil crease just inside
// the silhouette. Pigment breaks its length; floors never acquire a hatch grid.
float filmCrease = smoothstep(0.19, 0.23, filmFacing) * (1.0 - smoothstep(0.25, 0.29, filmFacing));
filmCrease *= smoothstep(0.015, 0.11, filmBroad) * uFilmDrawing;
reflectedLight.directDiffuse *= 1.0 - filmCrease * 0.22;
reflectedLight.indirectDiffuse *= 1.0 - filmCrease * 0.22;
// A highlight is a painted value shape, not the smooth center of a plastic
// microfacet lobe. Only its boundary gets dry-brush breakup, never the floor.
float filmSpecular = dot(reflectedLight.directSpecular, vec3(0.2126, 0.7152, 0.0722));
float filmSpecularEdge = filmBroad * 0.004 * uFilmPaintStrength;
float filmSpecularPaint = 0.024 * smoothstep(0.012 + filmSpecularEdge, 0.018 + filmSpecularEdge, filmSpecular)
  + 0.068 * smoothstep(0.052 + filmSpecularEdge, 0.063 + filmSpecularEdge, filmSpecular)
  + 0.15 * smoothstep(0.14, 0.16, filmSpecular);
reflectedLight.directSpecular *= mix(filmSpecular, filmSpecularPaint, 0.76 * uFilmDrawing) / max(filmSpecular, 0.0001);
`;

const RIM = /* glsl */`
// A restrained cool reflected edge, present only where the surface is lit.
float filmEdge = pow(1.0 - filmFacing, 4.0);
float filmAvailableLight = clamp(dot(totalDiffuse, vec3(0.2126, 0.7152, 0.0722)) * 2.0, 0.0, 1.0);
outgoingLight += vec3(0.10, 0.20, 0.23) * filmEdge * uFilmRim * filmAvailableLight;
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
      const length = 65 + random() * 245, width = 7 + random() * 34;
      const angle = (random() - .5) * 1.04 + (i % 9 === 0 ? 1.15 : 0);
      const tone = random() > .5 ? "#d3d3d3" : "#333333";
      const opacity = .14 + random() * .22;
      const top = Array.from({ length: 10 }, (_, n) => [-length / 2 + n * length / 9, -width * (.34 + random() * .10) * (.22 + .78 * Math.sin(n / 9 * Math.PI))]);
      const bottom = Array.from({ length: 10 }, (_, n) => [length / 2 - n * length / 9, width * (.30 + random() * .10) * (.22 + .78 * Math.sin(n / 9 * Math.PI))]);
      for (const dx of [-512, 0, 512]) for (const dy of [-512, 0, 512]) {
        context.save(); context.translate(x + dx, y + dy); context.rotate(angle);
        context.beginPath(); context.moveTo(top[0][0], top[0][1]);
        [...top.slice(1), ...bottom].forEach(([px, py]) => context.lineTo(px, py));
        context.closePath(); context.globalAlpha = opacity; context.fillStyle = tone; context.fill();
        context.clip(); context.strokeStyle = tone; context.globalAlpha = opacity * .38; context.lineWidth = .8;
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
    paintUniform.value = loaded;
    invalidate();
  }, undefined, () => { if (!disposed) invalidate(); });
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
    const uniforms = {
      uFilmPaint: paintUniform,
      uFilmBrush: { value: brushTexture },
      uFilmPaintStrength: { value: surface.paint ?? 0.75 },
      uFilmScale: { value: surface.scale ?? 0.40 },
      uFilmBands: { value: surface.bands ?? 0.82 },
      uFilmRim: { value: surface.rim ?? 0.27 },
      uFilmDrawing: { value: surface.drawing ?? 0.85 },
    };
    // These uniform objects may be adjusted without creating shader variants.
    material.userData.film = uniforms;
    material.customProgramCacheKey = () => "film-painted-standard-v4.1";
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
        ))
        .replace("#include <map_fragment>", `#include <map_fragment>\n${PIGMENT}`)
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor + filmFine * uFilmPaintStrength * 0.35, 0.16, 1.0);")
        .replace("#include <aomap_fragment>", `#include <aomap_fragment>\n${LIGHTING}`)
        .replace("#include <opaque_fragment>", `${RIM}\n#include <opaque_fragment>`);
    };
    return material;
  };

  const materials: FilmMaterialPalette = {
    ink: painted("ink", { color: "#111c2d", roughness: 0.84, paint: 0.45, rim: 0.10 }),
    steel: painted("steel", { color: "#385472", roughness: 0.61, metalness: 0.24, paint: 0.72, rim: 0.38 }),
    ivory: painted("ivory", { color: "#edddc3", roughness: 0.78, paint: 0.78 }),
    coral: painted("coral", { color: "#ac5548", roughness: 0.64, paint: 0.65 }),
    cyan: painted("cyan", { color: "#79a9ad", roughness: 0.48, metalness: 0.12, paint: 0.55 }),
    gold: painted("gold", { color: "#bd9259", roughness: 0.48, metalness: 0.40, paint: 0.52, rim: 0.24 }),
    floor: painted("floor", { color: "#8b918e", roughness: 0.60, metalness: 0.04, paint: 0.30, scale: 0.32, bands: 0.62, rim: 0.08, drawing: 0.15 }),
    wall: painted("wall", { color: "#e4dcd0", roughness: 0.86, paint: 0.48, bands: 0.80 }),
    dark: painted("dark", { color: "#253853", roughness: 0.72, paint: 0.62, rim: 0.19 }),
    walnut: painted("walnut", { color: "#83533c", roughness: 0.75, paint: 0.78, scale: 0.55, rim: 0.12 }),
    sage: painted("sage", { color: "#7e8b77", roughness: 0.89, paint: 0.68, rim: 0.12 }),
    skin: painted("skin", { color: "#b98466", roughness: 0.82, paint: 0.12, scale: 0.8, bands: 0.16, rim: 0.10, drawing: 0.35 }),
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
