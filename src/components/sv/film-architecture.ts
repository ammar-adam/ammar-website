import * as THREE from "three";

export type FilmArchitectureMaterials = Record<
  "ink" | "steel" | "ivory" | "coral" | "cyan" | "gold" | "floor" | "wall" |
  "dark" | "walnut" | "sage" | "glass" | "warmLight" | "coolLight",
  THREE.Material
>;

type V3 = readonly [number, number, number];
type MaterialName = keyof FilmArchitectureMaterials;
type Placement = { matrix: THREE.Matrix4; tint?: THREE.Color };
type Batch = {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  cast: boolean;
  receive: boolean;
  placements: Placement[];
};
const ZONES = [
  { name: "arrival-hall", near: 14, far: -17 },
  { name: "check-in-hall", near: -17, far: -32 },
  { name: "security-hall", near: -32, far: -50 },
  { name: "concourse-hall", near: -50, far: -85 },
  { name: "gate-hall", near: -85, far: -104 },
] as const;

/** Real, camera-traversable architecture. Palette materials remain caller-owned. */
export function createFilmArchitecture(materials: FilmArchitectureMaterials, invalidate?: () => void) {
  const root = new THREE.Group();
  root.name = "film-airport-architecture";
  const geometries = new Set<THREE.BufferGeometry>();
  const instances: THREE.InstancedMesh[] = [];
  const rooms = ZONES.map(zone => {
    const group = new THREE.Group();
    group.name = zone.name;
    group.userData = { near: zone.near, far: zone.far };
    root.add(group);
    return { group, batches: new Map<string, Batch>() };
  });
  const owned = <T extends THREE.BufferGeometry>(geometry: T) => { geometries.add(geometry); return geometry; };
  const box = owned(new THREE.BoxGeometry(1, 1, 1));
  const cylinder = owned(new THREE.CylinderGeometry(1, 1, 1, 14, 1));
  const dummy = new THREE.Object3D();
  const yAxis = new THREE.Vector3(0, 1, 0);
  const start = new THREE.Vector3(), end = new THREE.Vector3();
  const zoneAt = (z: number) => z <= ZONES[4].far ? 4 : Math.max(0, ZONES.findIndex(zone => z <= zone.near && z > zone.far));

  function place(geometry: THREE.BufferGeometry, material: MaterialName, position: V3, scale: V3 = [1, 1, 1], rotation: V3 = [0, 0, 0], cast = false, tint?: THREE.Color, zone = zoneAt(position[2])) {
    dummy.position.set(...position); dummy.scale.set(...scale); dummy.rotation.set(...rotation); dummy.updateMatrix();
    addMatrix(geometry, material, dummy.matrix, cast, tint, zone);
  }
  function addMatrix(geometry: THREE.BufferGeometry, material: MaterialName, matrix: THREE.Matrix4, cast: boolean, tint: THREE.Color | undefined, zone: number) {
    const receive = material !== "glass" && material !== "warmLight" && material !== "coolLight";
    const key = `${geometry.id}:${materials[material].uuid}:${Number(cast)}:${Number(receive)}`;
    let batch = rooms[zone].batches.get(key);
    if (!batch) {
      batch = { geometry, material: materials[material], cast, receive, placements: [] };
      rooms[zone].batches.set(key, batch);
    }
    batch.placements.push({ matrix: matrix.clone(), tint });
  }
  function block(material: MaterialName, dimensions: V3, position: V3, cast = false, zone = zoneAt(position[2])) {
    place(box, material, position, dimensions, [0, 0, 0], cast, undefined, zone);
  }
  function rod(material: MaterialName, a: V3, b: V3, radius: number, cast = false, zone = zoneAt((a[2] + b[2]) / 2)) {
    start.set(...a); end.set(...b);
    dummy.position.copy(start).add(end).multiplyScalar(.5);
    dummy.scale.set(radius, start.distanceTo(end), radius);
    dummy.quaternion.setFromUnitVectors(yAxis, end.sub(start).normalize()); dummy.updateMatrix();
    addMatrix(cylinder, material, dummy.matrix, cast, undefined, zone);
  }
  function roundedProfile(width: number, height: number, radius: number) {
    const shape = new THREE.Shape(), x = -width / 2, y = -height / 2, r = Math.min(radius, width / 2, height / 2);
    shape.moveTo(x + r, y); shape.lineTo(x + width - r, y); shape.quadraticCurveTo(x + width, y, x + width, y + r);
    shape.lineTo(x + width, y + height - r); shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    shape.lineTo(x + r, y + height); shape.quadraticCurveTo(x, y + height, x, y + height - r);
    shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y); shape.closePath();
    return shape;
  }
  function extrude(shape: THREE.Shape, depth: number, bevel = .025) {
    const geometry = owned(new THREE.ExtrudeGeometry(shape, {
      depth, steps: 1, curveSegments: 16, bevelEnabled: bevel > 0,
      bevelSegments: 2, bevelSize: bevel, bevelThickness: bevel,
    }));
    geometry.translate(0, 0, -depth / 2);
    return geometry;
  }

  // Each rib is an extruded curved beam, with a small bevel that catches the key.
  // The parabolic soffit reaches 11.6m, while the glazed eaves are 8m high.
  const roofY = (x: number) => 8 + 3.6 * (1 - (x / 14) ** 2);
  const archShape = new THREE.Shape();
  archShape.moveTo(-14, roofY(-14));
  for (let step = 1; step <= 64; step++) { const x = -14 + step * 28 / 64; archShape.lineTo(x, roofY(x)); }
  for (let step = 64; step >= 0; step--) { const x = -14 + step * 28 / 64; archShape.lineTo(x, roofY(x) - .27); }
  archShape.closePath();
  const arch = extrude(archShape, .32, .035);
  const pillar = extrude(roundedProfile(.43, 7.95, .16), .54, .035);

  function roofPanel(left: number, right: number, length: number) {
    const positions: number[] = [], indices: number[] = [], steps = 26;
    for (let row = 0; row < 2; row++) for (let col = 0; col <= steps; col++) {
      const x = left + (right - left) * col / steps;
      positions.push(x, roofY(x) + .075, (row - .5) * length);
    }
    for (let col = 0; col < steps; col++) { const a = col, b = col + steps + 1; indices.push(a, a + 1, b, a + 1, b + 1, b); }
    const geometry = owned(new THREE.BufferGeometry());
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
    return geometry;
  }
  const timberCeiling = roofPanel(-10.8, 6.7, 6.14);
  const leftCeiling = roofPanel(-14, -10.8, 6.14);
  const clerestory = roofPanel(6.7, 14, 6.14);

  for (let z = 12.8; z > -104; z -= 6.4) {
    const zone = zoneAt(z);
    place(arch, "ivory", [0, 0, z], [1, 1, 1], [0, 0, 0], true, undefined, zone);
    place(pillar, "ivory", [-13.66, 3.975, z], [1, 1, 1], [0, 0, 0], true, undefined, zone);
    // The splayed right column forms a proper knee below the roof rib.
    rod("steel", [12.90, .15, z], [13.72, 7.90, z], .115, true, zone);
    rod("steel", [13.42, 5.75, z], [11.72, 8.72, z], .065, false, zone);
    block("steel", [.60, .08, .70], [12.91, .045, z], false, zone);
    if (z - 3.2 < -104) continue;
    const panelZ = z - 3.2, panelZone = zoneAt(panelZ);
    place(timberCeiling, "ivory", [0, 0, panelZ], [1, 1, 1], [0, 0, 0], false, undefined, panelZone);
    place(leftCeiling, "ivory", [0, 0, panelZ], [1, 1, 1], [0, 0, 0], false, undefined, panelZone);
    place(clerestory, "glass", [0, 0, panelZ], [1, 1, 1], [0, 0, 0], false, undefined, panelZone);
    // Ceiling seams and slender cross bars; no luminous neon outlines.
    for (const x of [-9.7, -5.1, -.5, 4.1, 8.7, 12.2]) {
      const y = roofY(x) - .025;
      block(x > 6 ? "steel" : "ivory", [.045, .055, 6.12], [x, y, panelZ], false, panelZone);
    }
    // Continuous glazing remains physically behind the columns, with real mullions.
    block("glass", [.035, 7.65, 6.16], [13.94, 4.06, panelZ], false, panelZone);
    block("steel", [.075, 7.82, .075], [13.90, 4.02, z], true, zone);
  }

  // Large quiet stone slabs use tiny staggered joints, rather than a high-contrast grid.
  ZONES.forEach((zone, index) => {
    const length = zone.near - zone.far, center = (zone.near + zone.far) / 2;
    block("floor", [28, .18, length], [0, -.135, center], false, index);
    const slabLength = 5.75, rows = Math.ceil(length / slabLength);
    for (let lane = 0; lane < 7; lane++) for (let row = -1; row < rows; row++) {
      const start = zone.near - row * slabLength - (lane % 2) * slabLength / 2;
      const near = Math.min(zone.near, start);
      const far = Math.max(zone.far, start - slabLength);
      if (near - far < .02) continue;
      const tone = .965 + ((lane * 13 + row * 7) % 9) * .004;
      place(box, "floor", [-12 + lane * 4, -.027, (near + far) / 2], [3.989, .045, near - far - .012], [0, 0, 0], false, new THREE.Color(tone, tone, tone), index);
    }
    // Brass expansion joints quietly carry the eye along the route.
    for (const x of [-5.92, 5.92]) block("gold", [.014, .009, length], [x, .001, center], false, index);
    // A low stone sill and three horizontal window rails give the glazing thickness.
    block("ivory", [.38, .22, length], [13.80, .11, center], false, index);
    for (const y of [2.05, 5.25, 7.87]) block("steel", [.075, .065, length], [13.90, y, center], false, index);
    // Neutral perimeter walls sit behind the shop fronts, with a walnut dado.
    block("wall", [.26, 7.82, length], [-14.02, 3.91, center], false, index);
    block("walnut", [.08, .56, length], [-13.84, .28, center], false, index);
    block("steel", [.05, .035, length], [-13.78, .59, center], false, index);
    // Recessed ceiling practicals have visible housings, diffusers, and suspension.
    for (let z = zone.near - 3.3; z > zone.far + 1; z -= 7.7) {
      const y = 8.55;
      block("ivory", [3.5, .14, .38], [-5.4, y, z], false, index);
      block("warmLight", [3.13, .025, .24], [-5.4, y - .083, z], false, index);
      for (const x of [-6.7, -4.1]) rod("steel", [x, y + .05, z], [x, roofY(x) - .12, z], .014, false, index);
    }
  });

  // Proper vaulted vestibules separate the spaces. Openings follow the authored camera.
  // The wall has thickness; the curved reveal, return jambs and floor threshold are geometry.
  for (const portal of [{ z: -31, left: 8, right: 13, zone: 1 }, { z: -49, left: -13, right: -4, zone: 2 }, { z: -84, left: 7, right: 12, zone: 3 }]) {
    const wall = new THREE.Shape();
    wall.moveTo(-14, -.06); wall.lineTo(14, -.06); wall.lineTo(14, roofY(14));
    for (let step = 63; step >= 0; step--) { const x = -14 + step * 28 / 64; wall.lineTo(x, roofY(x)); }
    wall.closePath();
    const opening = new THREE.Path(), left = portal.left, right = portal.right;
    opening.moveTo(left, .018); opening.lineTo(left, 3.85); opening.quadraticCurveTo((left + right) / 2, 5.20, right, 3.85); opening.lineTo(right, .018); opening.closePath();
    wall.holes.push(opening);
    const wallGeometry = extrude(wall, .68, .035);
    place(wallGeometry, "wall", [0, 0, portal.z], [1, 1, 1], [0, 0, 0], true, undefined, portal.zone);
    const reveal = new THREE.Shape();
    reveal.moveTo(left - .13, 0); reveal.lineTo(left - .13, 3.93); reveal.quadraticCurveTo((left + right) / 2, 5.40, right + .13, 3.93); reveal.lineTo(right + .13, 0); reveal.lineTo(right, 0); reveal.lineTo(right, 3.85); reveal.quadraticCurveTo((left + right) / 2, 5.20, left, 3.85); reveal.lineTo(left, 0); reveal.closePath();
    place(extrude(reveal, .80, .02), "ivory", [0, 0, portal.z], [1, 1, 1], [0, 0, 0], false, undefined, portal.zone);
    for (const x of [left - .16, right + .16]) block("wall", [.30, 3.82, 2.4], [x, 1.91, portal.z - .55], false, portal.zone);
    block("gold", [right - left, .014, .035], [(right + left) / 2, .011, portal.z + .40], false, portal.zone);
    // The broad wall receives scale from a low ledge and widely spaced stone reveals.
    for (let x = -13.5; x < 13.5; x += 3.45) {
      if (x > left - .4 && x < right + .4) continue;
      block("ivory", [.055, 6.85, .045], [x, 3.44, portal.z + .385], false, portal.zone);
    }
  }

  // A deep, curved shopfront soffit gives the concourse a human-scaled left edge.
  const soffit = extrude(roundedProfile(1.35, .36, .16), 9.3, .025);
  for (const z of [-57.0, -67.5, -78.0]) {
    place(soffit, "ivory", [-12.42, 5.65, z], [1, 1, 1], [0, 0, 0], false, undefined, 3);
    block("warmLight", [.07, .028, 8.7], [-11.88, 5.43, z], false, 3);
  }

  // Airport seating has a continuous curved shell, recessed underframe and tubular arms.
  const seatProfile = new THREE.Shape();
  seatProfile.moveTo(-.47, .53); seatProfile.quadraticCurveTo(-.47, .40, -.30, .40);
  seatProfile.lineTo(.24, .40); seatProfile.quadraticCurveTo(.40, .41, .44, .63);
  seatProfile.lineTo(.55, 1.29); seatProfile.quadraticCurveTo(.56, 1.37, .48, 1.38);
  seatProfile.lineTo(.43, 1.38); seatProfile.quadraticCurveTo(.38, 1.38, .36, 1.29);
  seatProfile.lineTo(.27, .68); seatProfile.quadraticCurveTo(.25, .56, .12, .55);
  seatProfile.lineTo(-.47, .55); seatProfile.closePath();
  const seat = extrude(seatProfile, .65, .018);
  const armCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-.40, .60, 0), new THREE.Vector3(-.37, .77, 0), new THREE.Vector3(.12, .80, 0), new THREE.Vector3(.36, .77, 0)]);
  const arm = owned(new THREE.TubeGeometry(armCurve, 15, .025, 8, false));
  for (const bank of [{ x: 10.8, z: 4 }, { x: 10.8, z: -7 }, { x: 10.8, z: -57 }, { x: 10.8, z: -68 }, { x: 10.8, z: -79 }, { x: 10.6, z: -95 }, { x: -10.3, z: -95 }]) {
    const zone = zoneAt(bank.z), facing = bank.x < 0 ? Math.PI : 0;
    for (let index = -1; index <= 1; index++) {
      const z = bank.z + index * .84;
      place(seat, index === 0 ? "sage" : "dark", [bank.x, 0, z], [1, 1, 1], [0, facing, 0], false, undefined, zone);
      for (const side of [-.36, .36]) place(arm, "steel", [bank.x, 0, z + side], [1, 1, 1], [0, facing, 0], false, undefined, zone);
    }
    block("steel", [.11, .12, 2.5], [bank.x, .34, bank.z], false, zone);
    for (const z of [bank.z - .85, bank.z + .85]) {
      rod("steel", [bank.x, .36, z], [bank.x - .26, .06, z], .034, false, zone);
      rod("steel", [bank.x, .36, z], [bank.x + .26, .06, z], .034, false, zone);
    }
  }

  // A handful of tall planted vessels soften the perimeter without cluttering the route.
  const vessel = owned(new THREE.LatheGeometry([new THREE.Vector2(.43, .03), new THREE.Vector2(.47, .08), new THREE.Vector2(.55, .86), new THREE.Vector2(.61, 1.04), new THREE.Vector2(.60, 1.09), new THREE.Vector2(.54, 1.09), new THREE.Vector2(.49, .87)], 28));
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0); leafShape.bezierCurveTo(-.34, .32, -.35, .75, 0, 1.14); leafShape.bezierCurveTo(.35, .75, .34, .32, 0, 0);
  const leaf = extrude(leafShape, .014, .005), leafPositions = leaf.getAttribute("position");
  for (let i = 0; i < leafPositions.count; i++) leafPositions.setZ(i, leafPositions.getZ(i) + .18 * Math.sin(leafPositions.getY(i) / 1.14 * Math.PI));
  leaf.computeVertexNormals();
  for (const planter of [{ x: -11.8, z: 3 }, { x: -11.8, z: -11 }, { x: 11.3, z: -16 }, { x: -11.6, z: -36 }, { x: 11.8, z: -53.5 }, { x: 11.8, z: -72.7 }, { x: -11.1, z: -89.5 }]) {
    const zone = zoneAt(planter.z);
    place(vessel, "ivory", [planter.x, 0, planter.z], [1, 1, 1], [0, 0, 0], false, undefined, zone);
    place(cylinder, "dark", [planter.x, .97, planter.z], [.52, .04, .52], [0, 0, 0], false, undefined, zone);
    for (let stem = 0; stem < 3; stem++) {
      const angle = stem * 2.4, height = 2.1 + stem * .37, dx = Math.cos(angle) * .22, dz = Math.sin(angle) * .22;
      rod("walnut", [planter.x, .93, planter.z], [planter.x + dx, height, planter.z + dz], .025, false, zone);
      for (let frond = 0; frond < 5; frond++) {
        const yaw = frond * Math.PI * 2 / 5 + angle;
        place(leaf, "sage", [planter.x + dx, height - .14, planter.z + dz], [.85, .80 + (frond % 2) * .16, 1], [.80 + stem * .08, yaw, .12], false, undefined, zone);
      }
    }
  }

  // Room-sized batches have independent bounds. The caller may hide distant rooms;
  // each active+next pair remains below fifty architecture draw calls.
  rooms.forEach(({ group, batches }) => {
    for (const batch of batches.values()) {
      const instance = new THREE.InstancedMesh(batch.geometry, batch.material, batch.placements.length);
      batch.placements.forEach((placement, index) => {
        instance.setMatrixAt(index, placement.matrix);
        if (placement.tint) instance.setColorAt(index, placement.tint);
      });
      instance.instanceMatrix.needsUpdate = true;
      instance.castShadow = batch.cast; instance.receiveShadow = batch.receive;
      instance.computeBoundingBox(); instance.computeBoundingSphere();
      group.add(instance); instances.push(instance);
    }
    group.userData.drawCalls = batches.size;
  });
  let activeRoom = -1;
  const update = (progress: number) => {
    const index = progress < .24 ? 0 : progress < .45 ? 1 : progress < .65 ? 2 : progress < .86 ? 3 : 4;
    if (index === activeRoom) return;
    activeRoom = index;
    rooms.forEach((room, roomIndex) => { room.group.visible = roomIndex === index || roomIndex === index + 1; });
  };
  root.userData.rooms = rooms.map(room => ({ name: room.group.name, drawCalls: room.batches.size }));
  invalidate?.();
  return {
    root, update,
    dispose() {
      for (const instance of instances) instance.dispose();
      for (const geometry of geometries) geometry.dispose();
      root.clear();
    },
  };
}
