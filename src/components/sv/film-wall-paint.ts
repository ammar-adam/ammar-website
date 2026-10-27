import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { FilmMaterialPalette } from "./film-materials";
import { ensurePaintUV } from "./film-paint-uv";
import type { FilmArtRoom } from "./film-room-art";

type V3 = readonly [number, number, number];
let atlas: Promise<THREE.Texture> | undefined;
let leases = 0;
function acquireAtlas() {
  leases++;
  atlas ??= new THREE.TextureLoader().loadAsync("/art/terminal-graffiti-v1.webp").then(texture => {
    texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
    texture.name = "Original four-city graffiti atlas";
    return texture;
  });
  return atlas;
}
function releaseAtlas() {
  if (--leases > 0) return;
  const old = atlas; atlas = undefined;
  void old?.then(texture => texture.dispose(), () => {});
}

/** City artwork hangs on shallow plaster panels with clean steel boundaries.
 * The pigment and mat receive the same light and shadows as the solid wall. */
export async function createWallPaint(palette: FilmMaterialPalette, room: FilmArtRoom) {
  const root = new THREE.Group(); root.name = `wall-paint-${room}`;
  const geometry: THREE.BufferGeometry[] = [], materials: THREE.Material[] = [];
  let disposed = false;
  let paint: THREE.Texture;
  try { paint = await acquireAtlas(); }
  catch { releaseAtlas(); return { root, dispose() {} }; }

  // A restrained, deterministic plaster finish under the painted art. The
  // grain lives in surface UVs, so it never swims as the camera moves.
  const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#d8d0c2"; ctx.fillRect(0, 0, 1024, 512);
  let seed = 731;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let n = 0; n < 9000; n++) {
    ctx.fillStyle = n % 3 ? "rgba(29,34,62,.055)" : "rgba(255,241,211,.16)";
    ctx.fillRect(random() * 1024, random() * 512, 1 + random() * 8, .5 + random() * 1.3);
  }
  // Broken roller drag, with quiet vertical panel joints instead of screen noise.
  ctx.strokeStyle = "rgba(36,42,67,.14)"; ctx.lineWidth = 1.2;
  for (const x of [128, 384, 640, 896]) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke(); }
  for (let n = 0; n < 54; n++) {
    ctx.fillStyle = "rgba(255,237,208,.065)";
    ctx.fillRect(random() * 900, random() * 512, 15 + random() * 190, 1 + random() * 3);
  }
  const plaster = new THREE.CanvasTexture(canvas); plaster.colorSpace = THREE.SRGBColorSpace; plaster.anisotropy = 4;
  function finish(map: THREE.Texture, decal = false) {
    const material = palette.wall.clone();
    material.onBeforeCompile = palette.wall.onBeforeCompile;
    material.customProgramCacheKey = palette.wall.customProgramCacheKey;
    material.map = map; material.color.set("#ffffff"); material.roughness = 1; material.metalness = 0;
    material.polygonOffset = true; material.polygonOffsetFactor = -1; material.polygonOffsetUnits = -1;
    if (decal) { material.alphaTest = .035; material.alphaToCoverage = true; material.depthWrite = false; }
    materials.push(material); return material;
  }
  const undercoat = finish(plaster), pigment = finish(paint, true);
  function plane(width: number, height: number, position: V3, yaw: number, material: THREE.Material, quadrant?: number) {
    const shape = new THREE.PlaneGeometry(width, height); ensurePaintUV(shape);
    if (quadrant !== undefined) {
      const uv = shape.getAttribute("uv");
      const left = quadrant % 2 * .5, bottom = quadrant < 2 ? .5 : 0;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, left + uv.getX(i) * .5, bottom + uv.getY(i) * .5);
    }
    geometry.push(shape);
    const mesh = new THREE.Mesh(shape, material); mesh.position.set(...position); mesh.rotation.y = yaw;
    mesh.receiveShadow = true; mesh.name = quadrant === undefined ? "textured-plaster" : "sprayed-city-art";
    root.add(mesh);
  }
  function framedMural(width: number, height: number, position: V3, yaw: number, quadrant: number) {
    const offset = (depth: number): V3 => [position[0] + Math.sin(yaw) * depth, position[1], position[2] + Math.cos(yaw) * depth];
    // The opaque mat contains the atlas's irregular paint edge. A narrow
    // physical frame gives the whole installation one rectangular silhouette.
    plane(width + .30, height + .30, offset(-.025), yaw, undercoat);
    plane(width, height, position, yaw, pigment, quadrant);
    const frame = new THREE.Group(); frame.name = "city-mural-frame";
    frame.position.set(...offset(.025)); frame.rotation.y = yaw; root.add(frame);
    const rails: THREE.BufferGeometry[] = [];
    const rail = (size: V3, center: V3) => {
      const shape = ensurePaintUV(new THREE.BoxGeometry(...size));
      shape.translate(...center); rails.push(shape);
    };
    for (const side of [-1, 1]) {
      rail([width + .40, .10, .12], [0, side * (height / 2 + .15), 0]);
      rail([.10, height + .20, .12], [side * (width / 2 + .15), 0, 0]);
    }
    const shape = mergeGeometries(rails, false); rails.forEach(rail => rail.dispose());
    if (shape) {
      geometry.push(shape);
      const mesh = new THREE.Mesh(shape, palette.steel);
      mesh.castShadow = mesh.receiveShadow = true; frame.add(mesh);
    }
  }
  if (room === "checkin") {
    plane(19, 8.6, [-2, 5.2, -30.55], 0, undercoat);
    framedMural(16.4, 8.2, [-2.1, 5.45, -30.50], 0, 1);
  } else if (room === "security") {
    plane(17, 8.4, [4.7, 5.1, -48.55], 0, undercoat);
    framedMural(16.4, 8.2, [4.7, 5.3, -48.50], 0, 0);
  } else if (room === "concourse") {
    // Above the cinema posters, below the roof. Existing doorway stays open.
    plane(18.5, 4.1, [-3.35, 7.2, -83.55], 0, undercoat);
    framedMural(11.0, 5.5, [-3.6, 7.55, -83.50], 0, 2);
  } else {
    // The rear is glass: place paint on the solid return and high transom,
    // leaving the departing aircraft and the entire window opening clear.
    plane(10.4, 7.7, [-13.32, 4.8, -97.2], Math.PI / 2, undercoat);
    framedMural(10.2, 5.1, [-13.26, 5.25, -97.2], Math.PI / 2, 3);
    // No new backing or frame over the rear glazing/takeoff sightline.
    plane(9.8, 2.3, [-.8, 9.8, -103.50], 0, pigment, 3);
  }
  root.userData.artRoom = room;
  return { root, dispose() {
    if (disposed) return; disposed = true;
    geometry.forEach(item => item.dispose()); materials.forEach(item => item.dispose()); plaster.dispose(); releaseAtlas(); root.clear();
  } };
}
