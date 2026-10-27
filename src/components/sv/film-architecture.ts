import * as THREE from "three";
import { ensurePaintUV } from "./film-paint-uv";

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
type InkBatch = { positions: number[]; normals: number[]; indices: number[]; strokes: number };
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
  const finishTextures: THREE.Texture[] = [];
  const finishMaterials: THREE.Material[] = [];
  const rooms = ZONES.map(zone => {
    const group = new THREE.Group();
    group.name = zone.name;
    group.userData = { near: zone.near, far: zone.far };
    root.add(group);
    return { group, batches: new Map<string, Batch>(), drawing: new Map<MaterialName, InkBatch>() };
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

  // Authored surface drawing, not an all-edges wireframe. Each tapered ribbon
  // rests on its actual architectural face, receives depth occlusion, and is
  // batched with the other strokes in its room. The broken ends are deliberate.
  function stroke(points: V3[], width: number, zone: number, material: MaterialName = "ink", face: V3 = [0, 0, 1]) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)), false, "centripetal");
    const steps = Math.max(6, Math.ceil(curve.getLength() * 5));
    let batch = rooms[zone].drawing.get(material);
    if (!batch) { batch = { positions: [], normals: [], indices: [], strokes: 0 }; rooms[zone].drawing.set(material, batch); }
    const offset = batch.positions.length / 3, normal = new THREE.Vector3(...face).normalize();
    const side = new THREE.Vector3();
    for (let sample = 0; sample <= steps; sample++) {
      const t = sample / steps, point = curve.getPoint(t);
      side.crossVectors(curve.getTangent(t), normal).normalize();
      const pressure = (.12 + .88 * Math.sin(Math.PI * t) ** .38) * (.92 + .08 * Math.sin(t * 23 + points[0][1]));
      for (const sign of [-1, 1]) {
        const edge = point.clone().addScaledVector(side, width * pressure * sign * .5);
        batch.positions.push(edge.x, edge.y, edge.z); batch.normals.push(normal.x, normal.y, normal.z);
      }
      if (sample < steps) { const i = offset + sample * 2; batch.indices.push(i, i + 1, i + 2, i + 1, i + 3, i + 2); }
    }
    batch.strokes++;
  }

  // Thin enamel and terrazzo inlays are geometry on the architectural surface.
  // They share the per-room paint batches and catch the same mullion shadows.
  function inlay(shape: THREE.Shape, material: MaterialName, zone: number, position: V3, rotation: V3 = [0, 0, 0]) {
    const geometry = new THREE.ShapeGeometry(shape, 28);
    geometry.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(1, 1, 1)));
    let batch = rooms[zone].drawing.get(material);
    if (!batch) { batch = { positions: [], normals: [], indices: [], strokes: 0 }; rooms[zone].drawing.set(material, batch); }
    const offset = batch.positions.length / 3;
    const positions = geometry.getAttribute("position"), normals = geometry.getAttribute("normal");
    for (let i = 0; i < positions.count; i++) { batch.positions.push(positions.getX(i), positions.getY(i), positions.getZ(i)); batch.normals.push(normals.getX(i), normals.getY(i), normals.getZ(i)); }
    if (geometry.index) for (let i = 0; i < geometry.index.count; i++) batch.indices.push(offset + geometry.index.getX(i));
    batch.strokes++; geometry.dispose();
  }

  // Each rib is an extruded curved beam, with a small bevel that catches the key.
  // The parabolic soffit reaches 11.6m, while the glazed eaves are 8m high.
  const roofY = (x: number) => 8 + 3.6 * (1 - (x / 14) ** 2);
  const ribThickness = (x: number) => .38 + .48 * (Math.abs(x) / 14) ** 5;
  const archShape = new THREE.Shape();
  archShape.moveTo(-14, roofY(-14));
  for (let step = 1; step <= 64; step++) { const x = -14 + step * 28 / 64; archShape.lineTo(x, roofY(x)); }
  for (let step = 64; step >= 0; step--) { const x = -14 + step * 28 / 64; archShape.lineTo(x, roofY(x) - ribThickness(x)); }
  archShape.closePath();
  // Surface coordinates follow the beam's arc, including its bevel and soffit.
  const archLength=(x:number)=>{const k=7.2/196;return .5*(x*Math.sqrt(1+(k*x)**2)+Math.asinh(k*x)/k);};
  const archUV=(geometry:THREE.BufferGeometry)=>{
    const position=geometry.getAttribute("position"),normal=geometry.getAttribute("normal"),uv=new Float32Array(position.count*2);
    for(let i=0;i<position.count;i++){
      const x=position.getX(i);uv[i*2]=archLength(x)-archLength(-14);
      uv[i*2+1]=Math.abs(normal.getZ(i))>.5?roofY(x)-position.getY(i):position.getZ(i);
    }
    geometry.setAttribute("paintUV",new THREE.BufferAttribute(uv,2));
  };
  const arch = extrude(archShape, .64, .045);
  archUV(arch);
  const archUnderPositions: number[] = [], archUnderIndices: number[] = [];
  for (let row = 0; row < 2; row++) for (let step = 0; step <= 64; step++) {
    const x = -13.96 + step * 27.92 / 64;
    archUnderPositions.push(x, roofY(x) - ribThickness(x) - .006, (row - .5) * .57);
  }
  for (let step = 0; step < 64; step++) { const a = step, b = step + 65; archUnderIndices.push(a, a + 1, b, a + 1, b + 1, b); }
  const archUnderside = owned(new THREE.BufferGeometry());
  archUnderside.setAttribute("position", new THREE.Float32BufferAttribute(archUnderPositions, 3)); archUnderside.setIndex(archUnderIndices); archUnderside.computeVertexNormals(); archUV(archUnderside);
  const pillar = extrude(roundedProfile(.43, 7.95, .16), .54, .035);

  function roofPanel(left: number, right: number, length: number) {
    const positions: number[] = [], indices: number[] = [], steps = 26;
    for (let row = 0; row < 2; row++) for (let col = 0; col <= steps; col++) {
      const x = left + (right - left) * col / steps;
      positions.push(x, roofY(x) + .075, (row - .5) * length);
    }
    for (let col = 0; col < steps; col++) { const a = col, b = col + steps + 1; indices.push(a, a + 1, b, a + 1, b + 1, b); }
    const geometry = owned(new THREE.BufferGeometry());
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); archUV(geometry);
    return geometry;
  }
  const timberCeiling = roofPanel(-10.8, 6.7, 6.14);
  const leftCeiling = roofPanel(-14, -10.8, 6.14);
  const clerestory = roofPanel(6.7, 14, 6.14);

  for (let z = 12.8; z > -104; z -= 6.4) {
    const zone = zoneAt(z);
    place(arch, "ivory", [0, 0, z], [1, 1, 1], [0, 0, 0], true, undefined, zone);
    place(archUnderside, "cyan", [0, 0, z], [1, 1, 1], [0, 0, 0], false, undefined, zone);
    place(pillar, "ivory", [-13.66, 3.975, z], [1, 1, 1], [0, 0, 0], true, undefined, zone);
    // Pressure varies along the underside of each beam; the broad cream face
    // remains quiet. A few double marks describe the thickness of the casting.
    for (const [left, right] of [[-13.4, -9.6], [-8.9, -2.8], [-1.9, 4.7], [5.5, 10.8], [11.5, 13.5]]) {
      const points: V3[] = Array.from({ length: 10 }, (_, index) => {
        const x = left + (right - left) * index / 9;
        return [x, roofY(x) - ribThickness(x) + .044, z + .373];
      });
      stroke(points, .049, zone);
    }
    stroke([[-10.9, roofY(-10.9) - .13, z + .373], [-9.8, roofY(-9.8) - .13, z + .373], [-8.9, roofY(-8.9) - .13, z + .373]], .022, zone, "steel");
    for (const [low, high] of [[.35, 2.35], [2.65, 5.2], [5.65, 7.5]]) {
      stroke([[-13.79, low, z + .307], [-13.785, (low + high) / 2, z + .309], [-13.79, high, z + .307]], .033, zone);
    }
    // The splayed right column forms a proper knee below the roof rib.
    rod("steel", [12.90, .15, z], [13.72, 7.90, z], .115, true, zone);
    rod("steel", [13.42, 5.75, z], [11.72, 8.72, z], .065, false, zone);
    block("steel", [.60, .08, .70], [12.91, .045, z], false, zone);
    if (z - 3.2 < -104) continue;
    const panelZ = z - 3.2, panelZone = zoneAt(panelZ);
    place(timberCeiling, "ivory", [0, 0, panelZ], [1, 1, 1], [0, 0, 0], false, undefined, panelZone);
    place(leftCeiling, "dark", [0, 0, panelZ], [1, 1, 1], [0, 0, 0], false, undefined, panelZone);
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
    block("dark", [28, .18, length], [0, -.135, center], false, index);
    const slabLength = 5.75, rows = Math.ceil(length / slabLength);
    for (let lane = 0; lane < 7; lane++) for (let row = -1; row < rows; row++) {
      const start = zone.near - row * slabLength - (lane % 2) * slabLength / 2;
      const near = Math.min(zone.near, start);
      const far = Math.max(zone.far, start - slabLength);
      if (near - far < .02) continue;
      const tone = .95 + ((lane * 13 + row * 7 + 21) % 9) * .009;
      // Broad slate, warm-stone and sea-glass runs make a designed floor plan.
      const laneTint = [[.78,.78,.83],[.90,.89,.90],[1.02,.99,.94],[1.08,1.04,.96],[1.08,1.04,.96],[1.02,.99,.94],[.94,.94,.95]][lane];
      place(box, "floor", [-12 + lane * 4, -.027, (near + far) / 2], [3.976, .045, near - far - .026], [0, 0, 0], false, new THREE.Color(...laneTint as [number,number,number]).multiplyScalar(tone), index);
    }
    // A single sweeping terrazzo fan per hall echoes the aviation wall inlays.
    const fan = new THREE.Shape();
    fan.moveTo(-8.8, -zone.far - 2.4); fan.bezierCurveTo(-5.6, -zone.far - 5.7, -.6, -zone.far - 7.0, 6.3, -zone.far - 6.0);
    fan.lineTo(6.3, -zone.far - 5.70); fan.bezierCurveTo(-.6, -zone.far - 6.64, -5.5, -zone.far - 5.34, -8.5, -zone.far - 2.2); fan.closePath();
    inlay(fan, "gold", index, [0, .006, 0], [-Math.PI / 2, 0, 0]);
    // Brass expansion joints quietly carry the eye along the route.
    for (const x of [-5.92, 5.92]) block("gold", [.014, .009, length], [x, .001, center], false, index);
    // A low stone sill and three horizontal window rails give the glazing thickness.
    block("ivory", [.38, .22, length], [13.80, .11, center], false, index);
    for (const y of [2.05, 5.25, 7.87]) block("steel", [.075, .065, length], [13.90, y, center], false, index);
    // Sea-glass plaster, a navy base and warm metal replace the blank beige shell.
    block("cyan", [.26, 7.82, length], [-14.02, 3.91, center], false, index);
    block("dark", [.08, .76, length], [-13.84, .38, center], false, index);
    block("steel", [.05, .035, length], [-13.78, .79, center], false, index);
    // Recessed ceiling practicals have visible housings, diffusers, and suspension.
    for (let z = zone.near - 3.3; z > zone.far + 1; z -= 7.7) {
      const y = 8.55;
      block("ivory", [3.5, .14, .38], [-5.4, y, z], false, index);
      block("warmLight", [3.13, .025, .24], [-5.4, y - .083, z], false, index);
      for (const x of [-6.7, -4.1]) rod("steel", [x, y + .05, z], [x, roofY(x) - .12, z], .014, false, index);
    }
  });

  // Individually cast plaster reliefs give the large arrival wall an authored
  // rhythm. Their bowed tops, deep bevels and quiet tints are physical surfaces,
  // so the moving camera sees their thickness and the sun draws contact shadows.
  function plasterPanel(width: number, height: number, rise: number) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2 + .16, .78);
    shape.quadraticCurveTo(-width / 2, .78, -width / 2, .96);
    shape.lineTo(-width / 2, height - rise);
    shape.quadraticCurveTo(-width * .38, height + .12, -width * .17, height);
    shape.lineTo(width / 2 - .16, height - .22);
    shape.quadraticCurveTo(width / 2, height - .23, width / 2, height - .40);
    shape.lineTo(width / 2, .96);
    shape.quadraticCurveTo(width / 2, .78, width / 2 - .16, .78);
    shape.closePath();
    return extrude(shape, .23, .055);
  }
  const widePanel = plasterPanel(7.5, 6.15, .36), narrowPanel = plasterPanel(5.9, 6.42, .51);
  for (const [index, z] of [8.8, -.3, -9.5, -23.4, -40.0].entries()) {
    const zone = zoneAt(z), width = index % 2 ? 5.9 : 7.5;
    const panelFinish: MaterialName = index % 3 === 0 ? "ivory" : index % 3 === 1 ? "steel" : "gold";
    place(index % 2 ? narrowPanel : widePanel, panelFinish, [-13.72, 0, z], [1, 1, 1], [0, Math.PI / 2, 0], true,
      new THREE.Color(.98, 1.0, 1.0), zone);
    // The shadow-side edge is drawn twice only in short, separated stretches.
    for (const [low, high] of [[1.08, 2.67], [3.0, 5.35]]) {
      stroke([[-13.542, low, z + width / 2 - .13], [-13.541, (low + high) / 2, z + width / 2 - .12], [-13.542, high, z + width / 2 - .13]], .033, zone, "ink", [1, 0, 0]);
    }
    stroke([[-13.54, .89, z - width * .40], [-13.54, .88, z], [-13.54, .89, z + width * .40]], .027, zone, "steel", [1, 0, 0]);
  }

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
    // An integrated aviation composition gives each hall its own visible face.
    // The large colour planes stop before the real opening, preserving every
    // approach and doorway. They are lit enamel surfaces, not a pasted poster.
    if (portal.zone !== 1) {
    const fieldLeft = left > 0 ? -13.7 : right + .4, fieldRight = left > 0 ? left - .4 : 13.7;
    const span = fieldRight - fieldLeft, x = (u: number) => fieldLeft + span * u;
    const lower = new THREE.Shape();
    lower.moveTo(x(0), .81); lower.lineTo(x(1), .81); lower.lineTo(x(1), 6.08);
    lower.bezierCurveTo(x(.79), 6.48, x(.43), 4.98, x(0), 5.77); lower.closePath();
    inlay(lower, "cyan", portal.zone, [0, 0, portal.z + .407]);
    const upper = new THREE.Shape();
    upper.moveTo(x(0), 5.83); upper.bezierCurveTo(x(.37), 5.10, x(.76), 6.67, x(1), 6.18);
    upper.lineTo(x(1), 7.74); upper.bezierCurveTo(x(.68), 8.33, x(.31), 7.72, x(0), 7.90); upper.closePath();
    inlay(upper, "dark", portal.zone, [0, 0, portal.z + .410]);
    const rising = new THREE.Shape();
    rising.moveTo(x(0), 1.06); rising.bezierCurveTo(x(.35), 1.83, x(.29), 5.22, x(.77), 7.02);
    rising.bezierCurveTo(x(.86), 7.34, x(.94), 7.43, x(1), 7.38);
    rising.lineTo(x(1), 6.85); rising.bezierCurveTo(x(.61), 6.80, x(.36), 2.10, x(0), 1.44); rising.closePath();
    inlay(rising, "ivory", portal.zone, [0, 0, portal.z + .416]);
    const ochre = new THREE.Shape();
    ochre.moveTo(x(0), 1.63); ochre.bezierCurveTo(x(.31), 2.30, x(.36), 5.27, x(.78), 6.43);
    ochre.bezierCurveTo(x(.86), 6.64, x(.95), 6.67, x(1), 6.53);
    ochre.lineTo(x(1), 6.28); ochre.bezierCurveTo(x(.63), 6.65, x(.35), 2.43, x(0), 1.85); ochre.closePath();
    inlay(ochre, "gold", portal.zone, [0, 0, portal.z + .423]);
    const tail = new THREE.Shape();
    tail.moveTo(x(.03), 7.55); tail.lineTo(x(.08), 7.62); tail.lineTo(x(.26), 4.90);
    tail.bezierCurveTo(x(.18), 4.88, x(.09), 5.05, x(.03), 5.18); tail.closePath();
    inlay(tail, "coral", portal.zone, [0, 0, portal.z + .426]);
    // A narrow warm-metal datum makes the sweeping paint belong to the building.
    block("gold", [span, .042, .03], [(fieldLeft + fieldRight) / 2, .91, portal.z + .435], false, portal.zone);
    }
    const reveal = new THREE.Shape();
    reveal.moveTo(left - .13, 0); reveal.lineTo(left - .13, 3.93); reveal.quadraticCurveTo((left + right) / 2, 5.40, right + .13, 3.93); reveal.lineTo(right + .13, 0); reveal.lineTo(right, 0); reveal.lineTo(right, 3.85); reveal.quadraticCurveTo((left + right) / 2, 5.20, left, 3.85); reveal.lineTo(left, 0); reveal.closePath();
    place(extrude(reveal, .80, .02), "ivory", [0, 0, portal.z], [1, 1, 1], [0, 0, 0], false, undefined, portal.zone);
    for (const x of [left - .16, right + .16]) block("wall", [.30, 3.82, 2.4], [x, 1.91, portal.z - .55], false, portal.zone);
    block("gold", [right - left, .014, .035], [(right + left) / 2, .011, portal.z + .40], false, portal.zone);
    for (const x of [left - .115, right + .115]) {
      stroke([[x, .12, portal.z + .426], [x + .006, 1.55, portal.z + .427], [x, 3.79, portal.z + .426]], .035, portal.zone);
    }
    const doorHead = (from: number, to: number): V3[] => Array.from({ length: 15 }, (_, index) => {
      const t = from + (to - from) * index / 14;
      return [(left - .115) * (1 - t) ** 2 + (left + right) * t * (1 - t) + (right + .115) * t ** 2,
        3.94 * (1 - t) ** 2 + 10.8 * t * (1 - t) + 3.94 * t ** 2, portal.z + .426];
    });
    stroke(doorHead(.015, .43), .040, portal.zone);
    stroke(doorHead(.49, .985), .040, portal.zone);
    // A glazed blue-green base course carries through each hall, while the
    // narrow warm-metal cap catches the window key. Stop it at the real doorway.
    for (const [from, to] of [[-14, left - .18], [right + .18, 14]]) {
      const width = to - from;
      block("dark", [width, .76, .045], [(from + to) / 2, .38, portal.z + .383], false, portal.zone);
      block("gold", [width, .022, .055], [(from + to) / 2, .77, portal.z + .390], false, portal.zone);
    }
    // The broad wall receives scale from a low ledge and widely spaced stone reveals.
    for (let x = -13.5; x < 13.5; x += 3.45) {
      if (x > left - .4 && x < right + .4) continue;
      block("steel", [.025, 6.85, .018], [x, 3.44, portal.z + .440], false, portal.zone);
      stroke([[x + .044, .42, portal.z + .449], [x + .049, 1.62, portal.z + .449], [x + .044, 2.62, portal.z + .410]], .023, portal.zone, "steel");
      stroke([[x + .045, 3.04, portal.z + .449], [x + .049, 4.95, portal.z + .410], [x + .043, 6.58, portal.z + .410]], .023, portal.zone, "steel");
    }
  }

  // Oversized painted gate wayfinding gives the turn a visible destination.
  // It belongs to the existing wall and shares its cast shadows, rather than
  // becoming another UI caption or a new object in the walking lane.
  const gateCanvas = document.createElement("canvas");
  gateCanvas.width = 1536; gateCanvas.height = 640;
  const gatePaint = gateCanvas.getContext("2d");
  if (gatePaint) {
    gatePaint.fillStyle = "#587a83";
    gatePaint.beginPath(); gatePaint.moveTo(28, 135); gatePaint.lineTo(1410, 81);
    gatePaint.lineTo(1506, 494); gatePaint.lineTo(50, 561); gatePaint.closePath(); gatePaint.fill();
    gatePaint.fillStyle = "#f4dfb0"; gatePaint.font = "700 370px Arial";
    gatePaint.fillText("05", 115, 465);
    gatePaint.lineWidth = 41; gatePaint.lineCap = "square"; gatePaint.strokeStyle = "#f4dfb0";
    gatePaint.beginPath(); gatePaint.moveTo(769, 328); gatePaint.lineTo(1310, 328);
    gatePaint.moveTo(1150, 178); gatePaint.lineTo(1310, 328); gatePaint.lineTo(1150, 478); gatePaint.stroke();
    // Short dragged-brush gaps follow the painted shapes; no large scratch grid.
    gatePaint.globalCompositeOperation = "destination-out";
    let seed = 1405;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 280; i++) { gatePaint.globalAlpha = .04 + random() * .10; gatePaint.fillRect(random() * 1536, random() * 640, 7 + random() * 69, 1 + random() * 3); }
  }
  const gateTexture = new THREE.CanvasTexture(gateCanvas); gateTexture.colorSpace = THREE.SRGBColorSpace;
  const gateMaterial = new THREE.MeshStandardMaterial({ map: gateTexture, transparent: true, alphaTest: .06, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  finishTextures.push(gateTexture); finishMaterials.push(gateMaterial);
  const paintedGate = new THREE.Mesh(owned(new THREE.PlaneGeometry(10.8, 4.5)), gateMaterial);
  paintedGate.name = "painted-gate-05-wayfinding"; paintedGate.position.set(-1.5, 3.1, -83.50);
  paintedGate.receiveShadow = true; rooms[3].group.add(paintedGate);

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
      const direction = bank.x < 0 ? -1 : 1;
      stroke([[bank.x + direction * -.40, .542, z + .346], [bank.x + direction * .12, .548, z + .346], [bank.x + direction * .27, .68, z + .346], [bank.x + direction * .37, 1.23, z + .346]], .021, zone);
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

  // Two small drawing batches per room share the existing palette. These add
  // actual surface linework without an extra render pass or per-frame work.
  rooms.forEach(({ group, batches, drawing }) => {
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
    let strokeCount = 0;
    for (const [material, batch] of drawing) {
      const geometry = owned(new THREE.BufferGeometry());
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(batch.positions, 3));
      geometry.setAttribute("normal", new THREE.Float32BufferAttribute(batch.normals, 3));
      geometry.setIndex(batch.indices); geometry.computeBoundingSphere();
      const mesh = new THREE.Mesh(geometry, materials[material]);
      mesh.name = `${group.name}-authored-${material}`;
      mesh.receiveShadow = true;
      group.add(mesh); strokeCount += batch.strokes;
    }
    group.userData.drawCalls = batches.size + drawing.size;
    group.userData.authoredStrokes = strokeCount;
  });
  root.traverse(object=>{if(object instanceof THREE.Mesh)ensurePaintUV(object.geometry);});
  let activeRoom = -1;
  const update = (progress: number, lookingAround = false) => {
    const index = progress < .24 ? 0 : progress < .45 ? 1 : progress < .65 ? 2 : progress < .86 ? 3 : 4;
    const viewKey = index * 2 + Number(lookingAround);
    if (viewKey === activeRoom) return;
    activeRoom = viewKey;
    rooms.forEach((room, roomIndex) => { room.group.visible = roomIndex === index || roomIndex === index + 1 || (lookingAround && roomIndex === index - 1); });
  };
  root.userData.rooms = rooms.map(room => ({ name: room.group.name, drawCalls: room.group.userData.drawCalls, authoredStrokes: room.group.userData.authoredStrokes }));
  invalidate?.();
  return {
    root, update,
    dispose() {
      for (const instance of instances) instance.dispose();
      for (const geometry of geometries) geometry.dispose();
      finishTextures.forEach(texture => texture.dispose());
      finishMaterials.forEach(material => material.dispose());
      root.clear();
    },
  };
}
