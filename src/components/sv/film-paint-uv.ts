import * as THREE from "three";

/** Preserve authored charts. Curved architecture supplies arc-length paintUV;
 * ordinary primitives use their own surface UVs. The fallback is baked once in
 * a triangle's local tangent plane, so no shader projects pigment through space.
 */
export function ensurePaintUV<T extends THREE.BufferGeometry>(geometry: T): T {
  if (geometry.hasAttribute("paintUV")) return geometry;
  const uv = geometry.getAttribute("uv");
  if (uv) {
    geometry.setAttribute("paintUV", new THREE.BufferAttribute(new Float32Array(uv.array), 2));
    return geometry;
  }
  if (geometry.index) {
    const expanded = geometry.toNonIndexed();
    geometry.copy(expanded); expanded.dispose();
  }
  const position = geometry.getAttribute("position");
  const chart = new Float32Array(position.count * 2);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const normal = new THREE.Vector3(), edge = new THREE.Vector3();
  const tangent = new THREE.Vector3(), bitangent = new THREE.Vector3();
  for (let i = 0; i < position.count; i += 3) {
    a.fromBufferAttribute(position, i); b.fromBufferAttribute(position, i + 1); c.fromBufferAttribute(position, i + 2);
    normal.crossVectors(edge.copy(b).sub(a), c.clone().sub(a)).normalize();
    // A single local U direction for each face family; V follows its tangent.
    tangent.set(Math.abs(normal.x) > .85 ? 0 : 1, 0, Math.abs(normal.x) > .85 ? 1 : 0);
    tangent.addScaledVector(normal, -tangent.dot(normal)).normalize();
    bitangent.crossVectors(normal, tangent).normalize();
    for (let corner = 0; corner < 3; corner++) {
      edge.fromBufferAttribute(position, i + corner);
      chart[(i + corner) * 2] = edge.dot(tangent);
      chart[(i + corner) * 2 + 1] = edge.dot(bitangent);
    }
  }
  geometry.setAttribute("paintUV", new THREE.BufferAttribute(chart, 2));
  return geometry;
}
