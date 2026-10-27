import * as THREE from "three";

export interface FilmMaterialPalette {
  ink: THREE.MeshStandardMaterial; steel: THREE.MeshStandardMaterial;
  ivory: THREE.MeshStandardMaterial; coral: THREE.MeshStandardMaterial;
  cyan: THREE.MeshStandardMaterial; gold: THREE.MeshStandardMaterial;
  floor: THREE.MeshStandardMaterial; wall: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial; walnut: THREE.MeshStandardMaterial;
  sage: THREE.MeshStandardMaterial; skin: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  warmLight: THREE.MeshBasicMaterial; coolLight: THREE.MeshBasicMaterial;
}
export interface FilmMaterials {
  materials: FilmMaterialPalette;
  texture: THREE.Texture;
  createSurface: (color: string, options?: Omit<Surface, "color">) => THREE.MeshStandardMaterial;
  dispose: () => void;
}
type Surface = { color: string; roughness?: number; metalness?: number; paint?: number; scale?: number; bands?: number; rim?: number; drawing?: number; kind?: number };

const VERTEX_FIELDS = /* glsl */`
attribute vec2 paintUV;
varying vec2 vFilmPaintUV;
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
vFilmPaintUV = paintUV;
vFilmWorldPosition = (filmMetricMatrix * vec4(transformed, 1.0)).xyz;
`;
const FRAGMENT_FIELDS = /* glsl */`
varying vec2 vFilmPaintUV;
varying vec3 vFilmWorldPosition;
uniform sampler2D uFilmBrush;
uniform float uFilmPaintStrength, uFilmScale, uFilmRim, uFilmSurface;
`;
const PIGMENT = /* glsl */`
// Paint follows an authored surface chart. The atlas has one brush direction;
// there is no world projection, rotated layer, position hash, or screen noise.
vec2 filmUV = vFilmPaintUV * uFilmScale;
float filmStroke = (texture2D(uFilmBrush, filmUV).r - 0.5) * 2.0;
float filmDepth = length(vViewPosition);
float filmDepthPaint = mix(1.0, 0.15, smoothstep(8.0, 45.0, filmDepth));
`;
const PRINT_SHADOW = /* glsl */`
#if defined(USE_SHADOWMAP) && defined(SHADOWMAP_TYPE_PCF)
float filmPrintShadow(sampler2DShadow shadowMap, vec2 shadowMapSize, float intensity, float bias, float radius, vec4 coord) {
 coord.xyz /= coord.w; coord.z += bias;
 if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0 || coord.z > 1.0) return 1.0;
 vec2 spread = vec2(1.0) / shadowMapSize * max(radius, 0.5) * 0.45;
 float coverage = texture(shadowMap, vec3(coord.xy, coord.z)) * 0.60
  + texture(shadowMap, vec3(coord.xy + vec2(spread.x, 0.0), coord.z)) * 0.10
  + texture(shadowMap, vec3(coord.xy - vec2(spread.x, 0.0), coord.z)) * 0.10
  + texture(shadowMap, vec3(coord.xy + vec2(0.0, spread.y), coord.z)) * 0.10
  + texture(shadowMap, vec3(coord.xy - vec2(0.0, spread.y), coord.z)) * 0.10;
 return mix(1.0, smoothstep(0.10, 0.90, coverage), intensity);
}
#endif
`;
const LIGHTING = /* glsl */`
float filmAlbedo = max(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.015);
float filmDirect = dot(reflectedLight.directDiffuse, vec3(0.2126, 0.7152, 0.0722));
float filmExposure = max(0.0, filmDirect / filmAlbedo);
float filmFacingKey = 0.0;
#if NUM_DIR_LIGHTS > 0
 filmFacingKey = max(0.0, dot(normal, directionalLights[0].direction));
#endif
// Bristles occur only at a curved terminator, a cast-shadow edge, or a local
// falloff. Fully illuminated and fully occluded planes remain uninterrupted.
float filmAvailable = smoothstep(0.025, 0.10, filmExposure);
float filmTerminator = smoothstep(0.12, 0.18, filmFacingKey) * (1.0 - smoothstep(0.40, 0.48, filmFacingKey));
float filmFalloff = smoothstep(0.05, 0.15, filmExposure) * (1.0 - smoothstep(0.42, 0.65, filmExposure));
float filmShadowEdge = smoothstep(0.002, 0.035, fwidth(filmExposure));
float filmPaintMask = max(filmTerminator * filmAvailable, filmFalloff * max(0.50, filmShadowEdge)) * filmDepthPaint;
float filmPigment = filmStroke * uFilmPaintStrength * filmPaintMask;
float filmPaintedExposure = max(0.0, filmExposure + filmPigment * 0.18);
float filmAA = clamp(fwidth(filmPaintedExposure) * 0.45, 0.002, 0.012);
float filmBand = 0.10
 + 0.22 * smoothstep(0.18 - filmAA, 0.18 + filmAA, filmPaintedExposure)
 + 0.30 * smoothstep(0.42 - filmAA, 0.42 + filmAA, filmPaintedExposure)
 + 0.38 * smoothstep(0.70 - filmAA, 0.70 + filmAA, filmPaintedExposure);
vec3 filmKeyPlane = reflectedLight.directDiffuse * filmBand / max(filmExposure, 0.0001);
vec3 filmShadowPlane = mix(diffuseColor.rgb * vec3(0.15, 0.21, 0.48), vec3(0.020, 0.033, 0.092), 0.38);
reflectedLight.directDiffuse = mix(filmShadowPlane, filmKeyPlane, smoothstep(0.08, 0.62, filmExposure));
float filmLit = smoothstep(0.16, 0.70, filmExposure);
// The actual key supplies the warm hue. Only the reflected/shadow side is blue.
reflectedLight.indirectDiffuse *= mix(vec3(0.72, 0.78, 1.16), vec3(0.96, 0.98, 1.0), filmLit);
reflectedLight.indirectDiffuse += diffuseColor.rgb * vec3(0.014, 0.019, 0.047) * (1.0 - filmLit);
vec3 filmPigmentTint = mix(vec3(0.94, 0.96, 1.04), vec3(1.04, 1.015, 0.97), filmStroke * 0.5 + 0.5);
filmPigmentTint = mix(vec3(1.0), filmPigmentTint, abs(filmPigment) * 0.65);
reflectedLight.directDiffuse *= (1.0 + filmPigment * 0.18) * filmPigmentTint;
reflectedLight.indirectDiffuse *= (1.0 + filmPigment * 0.12) * filmPigmentTint;
// Suppress the narrow physical lobe that can create a white-violet floor streak.
// Tile keeps its directional light/shadow planes, but has no mirror-like lobe.
if (uFilmSurface > 0.5 && uFilmSurface < 1.5) {
 reflectedLight.directSpecular = vec3(0.0); reflectedLight.indirectSpecular = vec3(0.0);
} else {
 float filmSpecular = dot(reflectedLight.directSpecular, vec3(0.2126, 0.7152, 0.0722));
 float filmSpecularBand = 0.035 * smoothstep(0.03, 0.045, filmSpecular) + 0.065 * smoothstep(0.14, 0.17, filmSpecular);
 reflectedLight.directSpecular *= filmSpecularBand / max(filmSpecular, 0.0001);
 reflectedLight.indirectSpecular *= 0.22;
}
float filmFacing = clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0);
`;
const RIM = /* glsl */`
float filmEdge = pow(1.0 - filmFacing, 4.0);
float filmWindowSide = smoothstep(0.25, 0.72, filmFacingKey);
outgoingLight += vec3(0.32, 0.17, 0.055) * filmEdge * filmWindowSide * filmAvailable * uFilmRim;
`;

/** A small aligned brush atlas is data, not scene artwork. It is attached to
 * authored surface coordinates and only exposed where the lighting changes. */
export function createFilmMaterials(invalidate: () => void): FilmMaterials {
  let disposed = false;
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 512;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#808080"; context.fillRect(0, 0, 512, 512);
    const strokes = [[22, 62, 260, 30, true], [130, 171, 310, 37, false], [35, 286, 360, 27, true], [208, 420, 274, 35, false]] as const;
    for (const [x, y, length, width, light] of strokes) {
      for (const shift of [-512, 0, 512]) {
        context.save(); context.translate(x + shift, y);
        context.beginPath(); context.moveTo(0, 0); context.bezierCurveTo(length * .12, -width * .46, length * .65, -width * .38, length, -width * .03);
        context.bezierCurveTo(length * .78, width * .14, length * .22, width * .47, 0, width * .10); context.closePath();
        const loading = context.createLinearGradient(0, 0, length, 0);
        loading.addColorStop(0, light ? "#b5b5b5" : "#626262"); loading.addColorStop(.35, light ? "#d5d5d5" : "#444444"); loading.addColorStop(1, "#808080");
        context.fillStyle = loading; context.fill(); context.clip();
        context.strokeStyle = "#808080"; context.lineWidth = 1;
        for (let bristle = 0; bristle < 7; bristle++) {
          const across = (bristle - 3) * width / 10;
          context.beginPath(); context.moveTo(length * (.39 + bristle * .028), across);
          context.quadraticCurveTo(length * .72, across + width * .02, length, across); context.stroke();
        }
        context.restore();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = 4;
  texture.userData.settled = true;
  const painted = (name: string, surface: Surface) => {
    const material = new THREE.MeshStandardMaterial({color: surface.color, roughness: surface.roughness ?? .76, metalness: surface.metalness ?? .02});
    material.name = `film-${name}`;
    const uniforms = {
      uFilmBrush: {value: texture}, uFilmPaintStrength: {value: surface.paint ?? .62},
      uFilmScale: {value: surface.scale ?? 2.3}, uFilmRim: {value: surface.rim ?? .20}, uFilmSurface: {value: surface.kind ?? 0},
    };
    material.userData.film = uniforms;
    material.customProgramCacheKey = () => "film-surface-paint-v8-cool-shadow";
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader.replace("#include <common>", `#include <common>\n${VERTEX_FIELDS}`).replace("#include <project_vertex>", `${VERTEX_POSITION}\n#include <project_vertex>`);
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>\n${FRAGMENT_FIELDS}`)
        .replace("#include <shadowmap_pars_fragment>", `#include <shadowmap_pars_fragment>\n${PRINT_SHADOW}`)
        .replace("#include <lights_fragment_begin>", THREE.ShaderChunk.lights_fragment_begin.replace("getShadow( directionalShadowMap[ i ]", `\n#if defined(SHADOWMAP_TYPE_PCF)\nfilmPrintShadow( directionalShadowMap[ i ]\n#else\ngetShadow( directionalShadowMap[ i ]\n#endif\n`).replace("getDirectionalLightInfo( directionalLight, directLight );", `getDirectionalLightInfo( directionalLight, directLight );\n#if UNROLLED_LOOP_INDEX == 0\ndirectLight.color *= mix(0.56, 1.0, smoothstep(-12.0, 13.0, vFilmWorldPosition.x));\n#endif`))
        .replace("#include <map_fragment>", `#include <map_fragment>\n${PIGMENT}`)
        .replace("#include <aomap_fragment>", `#include <aomap_fragment>\n${LIGHTING}`)
        .replace("#include <opaque_fragment>", `${RIM}\n#include <opaque_fragment>`);
    };
    return material;
  };
  const materials: FilmMaterialPalette = {
    ink: painted("ink", {color:"#0d0f1f",paint:.22,rim:.08}),
    steel: painted("steel", {color:"#3a4f8a",roughness:.54,metalness:.20,paint:.45,kind:4}),
    ivory: painted("ivory", {color:"#f4ecd8",roughness:.69,paint:.60}),
    coral: painted("coral", {color:"#ff514e",roughness:.71,paint:.50}),
    cyan: painted("cyan", {color:"#3a4f8a",roughness:.72,paint:.56}),
    gold: painted("gold", {color:"#ffd9a0",roughness:.55,metalness:.18,paint:.42,kind:4}),
    floor: painted("floor", {color:"#c7bdad",roughness:.88,metalness:0,paint:.46,scale:4.0,rim:0,kind:1}),
    wall: painted("wall", {color:"#f4ecd8",roughness:.92,paint:.70,scale:3.2,kind:2}),
    dark: painted("dark", {color:"#2b3566",roughness:.82,paint:.50,rim:.16}),
    walnut: painted("walnut", {color:"#b1845f",roughness:.73,paint:.58,scale:3.4,kind:3}),
    sage: painted("sage", {color:"#d8d1bd",roughness:.90,paint:.58}),
    skin: painted("skin", {color:"#b98466",roughness:.87,paint:.12,rim:.12}),
    glass: new THREE.MeshPhysicalMaterial({color:"#ffd9a0",roughness:.28,metalness:0,transparent:true,opacity:.10,depthWrite:false,side:THREE.DoubleSide,ior:1.45,clearcoat:0}),
    warmLight: new THREE.MeshBasicMaterial({color:"#ffd9a0",toneMapped:false}),
    coolLight: new THREE.MeshBasicMaterial({color:"#f4ecd8",toneMapped:false}),
  };
  materials.glass.name="film-glass";materials.warmLight.name="film-warm-practical";materials.coolLight.name="film-cool-practical";
  queueMicrotask(()=>{if(!disposed)invalidate();});
  return {materials,texture,createSurface:(color,options={})=>painted("custom",{...options,color}),dispose(){if(disposed)return;disposed=true;Object.values(materials).forEach(material=>material.dispose());texture.dispose();}};
}
