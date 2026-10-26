import * as THREE from "three";

/** One closed, layered roast for the existing vertical spit. Caller owns geometry.
 * Vertex colours need a white painted material with vertexColors enabled.
 * 1,320 triangles, fewer than the fifteen cylinders this replaces; no textures.
 */
export function createShawarmaGeometry(): THREE.BufferGeometry {
  const rows = 32, sides = 20;
  const positions: number[] = [], colours: number[] = [], indices: number[] = [];
  const roast = new THREE.Color("#a97548"), char = new THREE.Color("#51311f");
  const carved = new THREE.Color("#d5b583"), pigment = new THREE.Color();
  const smooth = (low: number, high: number, value: number) => THREE.MathUtils.smoothstep(value, low, high);
  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    // Broader at the shoulder and narrower at the shaved lower end. Closely
    // spaced alternating ridges describe compressed slices, not separate disks.
    const profile = .32 + .43 * Math.sin(t * Math.PI * .62) ** .85;
    const layer = (row % 2 === 0 ? .019 : -.015) * Math.sin(Math.PI * t);
    for (let side = 0; side <= sides; side++) {
      const theta = side / sides * Math.PI * 2;
      const shoulder = Math.sin(theta * 3 + t * 4) * .033 + Math.sin(theta * 7 - t * 9) * .013;
      const cutFace = smooth(.72, .96, Math.cos(theta - .65)) * smooth(.10, .35, t) * (1 - smooth(.79, .97, t));
      const radius = (profile + layer) * (1 + shoulder - cutFace * .055);
      const edge = Math.sin(theta * 4 + row * .84) * .012 * Math.sin(t * Math.PI);
      positions.push(Math.cos(theta) * radius, -1.16 + t * 2.38 + edge, Math.sin(theta) * radius);
      // Uneven roasting and pale newly carved meat are broad pigment patches,
      // while thin browned slice edges remain irregular around the circumference.
      const toasted = smooth(-.20, .74, Math.sin(theta * 4.0 + t * 12.0) * .53 + Math.cos(theta * 7.0 - t * 16.0) * .30);
      const slice = (row % 2 === 0 ? .08 : 0) * (.6 + .4 * Math.sin(theta * 3 + t));
      pigment.copy(roast).lerp(char, toasted * .69 + slice).lerp(carved, cutFace * .72);
      const glint = .96 + .04 * Math.sin(theta * 9 + row * 2.2);
      colours.push(pigment.r * glint, pigment.g * glint, pigment.b * glint);
    }
  }
  for (let row = 0; row < rows; row++) for (let side = 0; side < sides; side++) {
    const a = row * (sides + 1) + side, b = a + sides + 1;
    indices.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const bottom = positions.length / 3, top = bottom + 1;
  positions.push(0, -1.16, 0, 0, 1.22, 0);
  colours.push(char.r, char.g, char.b, roast.r, roast.g, roast.b);
  for (let side = 0; side < sides; side++) {
    indices.push(bottom, side, side + 1);
    const a = rows * (sides + 1) + side;
    indices.push(top, a + 1, a);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  // Weld shading across the UV-free seam without removing its wrap vertices.
  const normals = geometry.getAttribute("normal"), seam = new THREE.Vector3();
  for (let row = 0; row <= rows; row++) {
    const first = row * (sides + 1), last = first + sides;
    seam.set(normals.getX(first) + normals.getX(last), normals.getY(first) + normals.getY(last), normals.getZ(first) + normals.getZ(last)).normalize();
    normals.setXYZ(first, seam.x, seam.y, seam.z); normals.setXYZ(last, seam.x, seam.y, seam.z);
  }
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  return geometry;
}
