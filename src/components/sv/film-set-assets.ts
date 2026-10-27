import * as THREE from "three";
import manifest from "@/data/terminalSets.generated.json";
import type { FilmMaterialPalette } from "./film-materials";
import type { FilmSet } from "./film-set-builder";
import { ensurePaintUV } from "./film-paint-uv";

type SetName = "atrium" | "concourse" | "airside";
type Axis = "x" | "y" | "z";
type Motion = { channels: { axis: Axis; offset: number; amplitude?: number; frequency?: number; phase?: number; linear?: number }[]; reducedRotation: [number, number, number] };
type NodeRecord = {
  type: "group" | "mesh"; name: string; position: [number, number, number];
  quaternion: [number, number, number, number]; scale: [number, number, number];
  geometry?: number; material?: keyof FilmMaterialPalette; castShadow?: boolean;
  receiveShadow?: boolean; visible?: boolean; userData?: Record<string, unknown>; children: NodeRecord[];
};
type GeometryRecord = { positionOffset: number; positionCount: number; normalOffset: number; normalCount: number; paintUVOffset?: number; paintUVCount?: number; indexOffset?: number; indexCount?: number; indexType?: "uint32" };
type Header = { version: number; roots: NodeRecord[]; geometries: GeometryRecord[] };
type PreparedSet = { header: Header; buffer: ArrayBuffer; start: number };
const requests = new Map<SetName, Promise<PreparedSet>>();

async function prepare(name: SetName): Promise<PreparedSet> {
  let request = requests.get(name);
  if (!request) {
    request = (async () => {
      const asset = manifest[name];
      const response = await fetch(`${asset.url}?v=${asset.hash}`, { cache: "force-cache" });
      if (!response.ok) throw new Error(`Set ${name}: HTTP ${response.status}`);
      let buffer = await response.arrayBuffer();
      const signature = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 2));
      if (signature[0] === 31 && signature[1] === 139) {
        const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream("gzip"));
        buffer = await new Response(stream).arrayBuffer();
      }
      const length = new DataView(buffer).getUint32(0, true);
      const header = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 4, length))) as Header;
      if (header.version !== 1) throw new Error(`Unsupported set version ${header.version}`);
      return { header, buffer, start: Math.ceil((4 + length) / 4) * 4 };
    })();
    requests.set(name, request);
    void request.catch(() => { if (requests.get(name) === request) requests.delete(name); });
  }
  return request;
}

/** Network/decompression only: safe to overlap with the buffered opening film. */
export function prepareTerminalSetGeometry() { return prepare("atrium").then(() => undefined); }

function instantiate({ header, buffer, start }: PreparedSet, palette: FilmMaterialPalette): FilmSet {
  const geometry = header.geometries.map(record => {
    const item = new THREE.BufferGeometry();
    item.setAttribute("position", new THREE.BufferAttribute(new Float32Array(buffer, start + record.positionOffset, record.positionCount), 3));
    item.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(buffer, start + record.normalOffset, record.normalCount), 3));
    if (record.indexOffset !== undefined && record.indexCount) item.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer, start + record.indexOffset, record.indexCount), 1));
    if (record.paintUVOffset !== undefined && record.paintUVCount) item.setAttribute("paintUV", new THREE.BufferAttribute(new Float32Array(buffer, start + record.paintUVOffset, record.paintUVCount), 2));
    ensurePaintUV(item);
    item.computeBoundingBox(); item.computeBoundingSphere();
    return item;
  });
  const moving: { object: THREE.Object3D; motion: Motion }[] = [];
  const node = (record: NodeRecord): THREE.Object3D => {
    const object = record.type === "mesh"
      ? new THREE.Mesh(geometry[record.geometry!], palette[record.material!]) : new THREE.Group();
    object.name = record.name; object.position.fromArray(record.position);
    object.quaternion.fromArray(record.quaternion); object.scale.fromArray(record.scale);
    object.castShadow = record.castShadow ?? false; object.receiveShadow = record.receiveShadow ?? false; object.visible = record.visible !== false;
    object.userData = { ...record.userData };
    if (object.userData.setMotion) moving.push({ object, motion: object.userData.setMotion as Motion });
    for (const child of record.children) object.add(node(child));
    return object;
  };
  const groups = header.roots.map(record => node(record) as THREE.Group);
  let disposed = false;
  return {
    groups,
    update(time, reduced) {
      for (const { object, motion } of moving) {
        if (reduced) { object.rotation.set(...motion.reducedRotation); continue; }
        for (const channel of motion.channels) object.rotation[channel.axis] = channel.offset
          + (channel.amplitude ?? 0) * Math.sin(time * (channel.frequency ?? 0) + (channel.phase ?? 0))
          + time * (channel.linear ?? 0);
      }
    },
    dispose() { if (disposed) return; disposed = true; geometry.forEach(item => item.dispose()); groups.forEach(group => group.clear()); },
  };
}

export async function loadFilmSet(name: SetName, palette: FilmMaterialPalette): Promise<FilmSet> {
  try { return instantiate(await prepare(name), palette); }
  catch (error) {
    // Retain the authored construction path for a failed asset or an older
    // browser without native gzip streams. It is deliberately off the hot path.
    console.warn(`Using procedural ${name} set fallback.`, error);
    const set = name === "atrium" ? (await import("./film-atrium-set")).createAtriumSet(palette)
      : name === "concourse" ? (await import("./film-concourse-set")).createConcourseSet(palette)
      : (await import("./film-airside-set")).createAirsideSet(palette);
    for (const root of set.groups) root.traverse(object => { if (object instanceof THREE.Mesh) ensurePaintUV(object.geometry); });
    return set;
  }
}
