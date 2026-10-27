import * as THREE from "three";
import type { FilmMaterialPalette } from "./film-materials";
import { protectFilmRegistration } from "./terminal-post";
import { ensurePaintUV } from "./film-paint-uv";
import { createSetBuilder, type SetVector } from "./film-set-builder";

/** Structural subset of the central registry, so every placement lives in data. */
export interface PropReference {
  id: string;
  stop: string;
  position: SetVector;
  rotation: SetVector;
  scale: SetVector;
  priority: "A" | "B";
  note: string;
  dwell?: number;
  label?: string;
}
export type ReferencePrint = { text: string; height: number; center?: SetVector };
export const REFERENCE_INK = "#0d0f1f";
export const REFERENCE_CREAM = "#f4ecd8";
export const REFERENCE_BLUE = "#3a4f8a";
export const REFERENCE_RED = "#ff514e";
export const REFERENCE_GOLD = "#ffd9a0";

/** Static shapes merge by palette material. Printed matter remains a physical,
 * light-receiving surface, with its actual glyph size exposed for projection QA. */
export function createReferenceAssembly(palette: FilmMaterialPalette, row: PropReference) {
  const set = createSetBuilder(palette, `reference-${row.id}`);
  const root = set.root;
  root.position.set(...row.position); root.rotation.set(...row.rotation); root.scale.set(...row.scale);
  root.userData = { referenceId: row.id, referenceLabel: row.note, referencePriority: row.priority, referenceDwell: row.dwell, referenceStop: row.stop };
  const textures: THREE.Texture[] = [], materials: THREE.Material[] = [], geometries: THREE.BufferGeometry[] = [];
  let disposed = false;
  const print = (
    width: number, height: number,
    draw: (context: CanvasRenderingContext2D, width: number, height: number) => void,
    words: readonly ReferencePrint[], position: SetVector, rotation: SetVector = [0, 0, 0], screen = false,
  ) => {
    const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = Math.max(128, Math.min(1024, Math.round(1024 * height / width)));
    const context = canvas.getContext("2d");
    if (context) draw(context, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
    textures.push(texture);
    const material = screen
      ? new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff, toneMapped: true })
      : new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff, roughness: .86, metalness: 0 });
    if (material instanceof THREE.MeshStandardMaterial) {
      material.onBeforeCompile = palette.wall.onBeforeCompile;
      material.customProgramCacheKey = palette.wall.customProgramCacheKey;
      material.userData.film = palette.wall.userData.film;
    }
    protectFilmRegistration(material);materials.push(material);
    const geometry = ensurePaintUV(new THREE.PlaneGeometry(1, 1)); geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, material); mesh.scale.set(width, height, 1); mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.receiveShadow = !screen;
    mesh.name = `reference-print-${row.id}`;
    mesh.userData = { referenceId: row.id, referenceText: words.map(word => ({ text: word.text, height: word.height, unitHeight: word.height / height, center: word.center ? [word.center[0] / width, word.center[1] / height, word.center[2]] : [0, 0, 0] })), referenceSurface: screen ? "screen" : "printed" };
    root.add(mesh); return mesh;
  };
  const finish = () => {
    set.finish(); root.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(root);
    root.userData.referenceBounds = { min: bounds.min.toArray(), max: bounds.max.toArray() };
    return root;
  };
  const dispose = () => {
    if (disposed) return; disposed = true;
    textures.forEach(texture => texture.dispose()); materials.forEach(material => material.dispose()); geometries.forEach(geometry => geometry.dispose()); set.dispose();
  };
  return { root, set, print, finish, dispose };
}

export function printBase(context: CanvasRenderingContext2D, width: number, height: number, dark = false) {
  context.fillStyle = dark ? REFERENCE_INK : REFERENCE_CREAM; context.fillRect(0, 0, width, height);
  context.fillStyle = dark ? REFERENCE_CREAM : REFERENCE_INK;
  context.textBaseline = "middle"; context.textAlign = "left";
}
export function printText(context: CanvasRenderingContext2D, text: string, pixels: number, x: number, y: number, color = REFERENCE_INK) {
  context.fillStyle = color; context.font = `700 ${pixels}px Inter, Arial, sans-serif`; context.fillText(text, x, y);
}
