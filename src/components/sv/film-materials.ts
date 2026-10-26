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
};

const VERTEX_FIELDS = /* glsl */`
varying vec3 vFilmPosition;
varying vec3 vFilmNormal;
`;

const VERTEX_POSITION = /* glsl */`
vec4 filmPosition = vec4(transformed, 1.0);
#ifdef USE_BATCHING
  filmPosition = batchingMatrix * filmPosition;
#endif
#ifdef USE_INSTANCING
  filmPosition = instanceMatrix * filmPosition;
#endif
vFilmPosition = (modelMatrix * filmPosition).xyz;
`;

const FRAGMENT_FIELDS = /* glsl */`
varying vec3 vFilmPosition;
varying vec3 vFilmNormal;
uniform sampler2D uFilmPaint;
uniform float uFilmPaintStrength;
uniform float uFilmScale;
uniform float uFilmBands;
uniform float uFilmRim;

// Three fine projections plus one broad scumble; no screen-space noise or dots.
vec2 filmPigment(vec3 point, vec3 surfaceNormal) {
  vec3 weights = pow(abs(normalize(surfaceNormal)), vec3(6.0));
  weights /= max(dot(weights, vec3(1.0)), 0.0001);
  vec3 p = point * uFilmScale;
  float fine = texture2D(uFilmPaint, p.yz).g * weights.x
    + texture2D(uFilmPaint, p.xz).g * weights.y
    + texture2D(uFilmPaint, p.xy).g * weights.z;
  vec2 broadUV = weights.x > weights.y && weights.x > weights.z ? p.yz
    : (weights.y > weights.z ? p.xz : p.xy);
  broadUV = mat2(0.80, -0.60, 0.60, 0.80) * broadUV * 0.21 + vec2(0.31, 0.67);
  return vec2(fine, texture2D(uFilmPaint, broadUV).g);
}
`;

const PIGMENT = /* glsl */`
vec2 filmPaint = filmPigment(vFilmPosition, vFilmNormal);
float filmFine = filmPaint.x - 0.75;
float filmBroad = filmPaint.y - 0.75;
float filmPigmentValue = clamp(1.0 + (filmFine * 2.3 + filmBroad * 0.9) * uFilmPaintStrength, 0.72, 1.22);
diffuseColor.rgb *= filmPigmentValue;
// Slight temperature shifts sit inside the paint, rather than over the image.
diffuseColor.rgb *= vec3(1.0 + filmBroad * 0.30, 1.0, 1.0 - filmBroad * 0.35);
`;

const LIGHTING = /* glsl */`
// Work on the real shadowed diffuse light; specular highlights remain physical.
float filmAlbedo = max(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.025);
float filmDirect = dot(reflectedLight.directDiffuse, vec3(0.2126, 0.7152, 0.0722));
float filmExposure = filmDirect / filmAlbedo;
float filmSteps = filmExposure * 4.0;
float filmBanded = (floor(filmSteps) + smoothstep(0.25, 0.75, fract(filmSteps))) * 0.25;
float filmBandGain = mix(filmExposure, filmBanded, uFilmBands) / max(filmExposure, 0.0001);
reflectedLight.directDiffuse *= filmBandGain;
float filmLit = smoothstep(0.06, 0.65, filmExposure);
reflectedLight.directDiffuse *= mix(vec3(0.84, 0.88, 1.03), vec3(1.025, 1.0, 0.96), filmLit);
reflectedLight.indirectDiffuse *= mix(vec3(0.74, 0.82, 1.08), vec3(1.0), filmLit);
float filmFacing = clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0);
float filmContour = 1.0 - smoothstep(0.035, 0.22, filmFacing);
reflectedLight.directDiffuse *= 1.0 - filmContour * 0.075;
reflectedLight.indirectDiffuse *= 1.0 - filmContour * 0.075;
`;

const RIM = /* glsl */`
// A restrained cool reflected edge, present only where the surface is lit.
float filmEdge = pow(1.0 - filmFacing, 4.0);
float filmAvailableLight = clamp(dot(totalDiffuse, vec3(0.2126, 0.7152, 0.0722)) * 2.0, 0.0, 1.0);
outgoingLight += vec3(0.10, 0.20, 0.23) * filmEdge * uFilmRim * filmAvailableLight;
`;

/**
 * Lit painted surfaces for real geometry. Units are metres: pigment repeats every
 * ~2.5m, independent of stretched UVs and instance scale. No vertex displacement
 * means stock depth/shadow passes stay exact for meshes, instances and skinning.
 *
 * Light with one warm shadow-casting directional key (~3–4), a restrained cool
 * fill (~0.4–0.7), and a hemisphere (~0.25–0.45). Enable renderer shadows and mesh
 * castShadow/receiveShadow. A neutral environment map helps bronze/steel reflect.
 * Avoid large ambient intensities or emissive walls; those erase the volume.
 */
export function createFilmMaterials(invalidate: () => void): FilmMaterials {
  let disposed = false;
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
      uFilmPaintStrength: { value: surface.paint ?? 0.75 },
      uFilmScale: { value: surface.scale ?? 0.40 },
      uFilmBands: { value: surface.bands ?? 0.22 },
      uFilmRim: { value: surface.rim ?? 0.20 },
    };
    // These uniform objects may be adjusted without creating shader variants.
    material.userData.film = uniforms;
    material.customProgramCacheKey = () => "film-painted-standard-v1";
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${VERTEX_FIELDS}`)
        .replace("#include <defaultnormal_vertex>", "#include <defaultnormal_vertex>\nvFilmNormal = inverseTransformDirection(transformedNormal, viewMatrix);")
        .replace("#include <project_vertex>", `${VERTEX_POSITION}\n#include <project_vertex>`);
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>\n${FRAGMENT_FIELDS}`)
        .replace("#include <map_fragment>", `#include <map_fragment>\n${PIGMENT}`)
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor + filmFine * uFilmPaintStrength * 0.35, 0.16, 1.0);")
        .replace("#include <aomap_fragment>", `#include <aomap_fragment>\n${LIGHTING}`)
        .replace("#include <opaque_fragment>", `${RIM}\n#include <opaque_fragment>`);
    };
    return material;
  };

  const materials: FilmMaterialPalette = {
    ink: painted("ink", { color: "#111c2d", roughness: 0.84, paint: 0.45, rim: 0.10 }),
    steel: painted("steel", { color: "#334960", roughness: 0.46, metalness: 0.42, paint: 0.56, rim: 0.32 }),
    ivory: painted("ivory", { color: "#e4d5bc", roughness: 0.75, paint: 0.78 }),
    coral: painted("coral", { color: "#ac5548", roughness: 0.64, paint: 0.65 }),
    cyan: painted("cyan", { color: "#79a9ad", roughness: 0.48, metalness: 0.12, paint: 0.55 }),
    gold: painted("gold", { color: "#b38a52", roughness: 0.38, metalness: 0.62, paint: 0.42, rim: 0.24 }),
    floor: painted("floor", { color: "#68727a", roughness: 0.35, metalness: 0.10, paint: 0.55, scale: 0.32, rim: 0.08 }),
    wall: painted("wall", { color: "#c8c4b6", roughness: 0.83, paint: 0.90, bands: 0.26 }),
    dark: painted("dark", { color: "#223246", roughness: 0.68, paint: 0.52, rim: 0.15 }),
    walnut: painted("walnut", { color: "#73503b", roughness: 0.66, paint: 0.84, scale: 0.55, rim: 0.12 }),
    sage: painted("sage", { color: "#7e8b77", roughness: 0.89, paint: 0.68, rim: 0.12 }),
    skin: painted("skin", { color: "#b98466", roughness: 0.82, paint: 0.12, scale: 0.8, bands: 0.16, rim: 0.10 }),
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
      texture.dispose();
    },
  };
}
