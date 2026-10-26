import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { FilmMaterialPalette } from "./film-materials";

export type SetVector = readonly [number, number, number];
export type SetMaterial = keyof FilmMaterialPalette;
export interface FilmSet {
  groups: THREE.Group[];
  update: (time: number, reduced: boolean) => void;
  dispose: () => void;
}

/** Static physical set dressing, merged per material and shadow mode.
 * add() consumes its geometry. Palette materials remain caller-owned.
 * Keep animated parts outside these buckets and dispose their geometry separately.
 */
export function createSetBuilder(palette: FilmMaterialPalette, name: string) {
  const root = new THREE.Group(); root.name = name;
  const batches = new Map<string, { material: THREE.Material; cast: boolean; parts: THREE.BufferGeometry[] }>();
  const owned = new Set<THREE.BufferGeometry>();
  let completed = false, disposed = false;
  const transform = new THREE.Object3D();
  const add = (source: THREE.BufferGeometry, material: SetMaterial, position: SetVector = [0, 0, 0], rotation: SetVector = [0, 0, 0], scale: SetVector = [1, 1, 1], cast = true) => {
    if (completed) throw new Error(`Cannot add to finished set ${name}`);
    transform.position.set(...position); transform.rotation.set(...rotation); transform.scale.set(...scale); transform.updateMatrix();
    const geometry = source.index ? source.toNonIndexed() : source;
    if (geometry !== source) source.dispose();
    geometry.deleteAttribute("uv"); geometry.deleteAttribute("color");
    if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
    geometry.applyMatrix4(transform.matrix);
    const key = `${palette[material].uuid}:${Number(cast)}`;
    let batch = batches.get(key);
    if (!batch) { batch = { material: palette[material], cast, parts: [] }; batches.set(key, batch); }
    batch.parts.push(geometry);
  };
  const box = (size: SetVector, position: SetVector, material: SetMaterial, rotation: SetVector = [0, 0, 0], bevel = 0) => {
    const geometry = bevel > 0
      ? new RoundedBoxGeometry(...size, 1, Math.min(bevel, Math.min(...size) * .33))
      : new THREE.BoxGeometry(...size);
    add(geometry, material, position, rotation);
  };
  const rod = (a: SetVector, b: SetVector, radius: number, material: SetMaterial) => {
    const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b);
    const direction = to.clone().sub(from), length = direction.length();
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 10);
    geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()));
    const center = from.add(to).multiplyScalar(.5);
    add(geometry, material, center.toArray() as [number, number, number]);
  };
  const finish = () => {
    if (completed) return root;
    completed = true;
    for (const { material, cast, parts } of batches.values()) {
      const geometry = mergeGeometries(parts, false);
      parts.forEach(part => part.dispose());
      if (!geometry) throw new Error(`Incompatible set geometry in ${name}`);
      owned.add(geometry); geometry.computeBoundingBox(); geometry.computeBoundingSphere();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `${name}-${material.name}`; mesh.castShadow = cast; mesh.receiveShadow = true;
      root.add(mesh);
    }
    batches.clear();
    root.userData.setDressing = true;
    return root;
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    for (const batch of batches.values()) batch.parts.forEach(part => part.dispose());
    batches.clear(); owned.forEach(geometry => geometry.dispose()); owned.clear(); root.clear();
  };
  return { root, add, box, rod, finish, dispose };
}
