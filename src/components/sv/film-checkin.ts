import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { FilmMaterialPalette } from "./film-materials";

export interface FilmCheckinState {
  time?: number;
  progress?: number;
  selectedIndex?: number;
  reduced?: boolean;
}

export interface FilmCheckin {
  root: THREE.Group;
  /** Front-facing image area 3.52 × .94m. Add caller-owned display meshes here. */
  boardAnchor: THREE.Group;
  /** Front-facing image area .94 × .54m; follows the monitor's restrained tilt. */
  monitorAnchor: THREE.Group;
  update: (state: FilmCheckinState) => void;
  dispose: () => void;
}

function footprint() {
  // Shape Y becomes negative world Z: the long sculpted face looks toward +Z.
  const shape = new THREE.Shape();
  shape.moveTo(-3.12, .65);
  shape.bezierCurveTo(-3.75, .25, -3.65, -.77, -2.85, -1.05);
  shape.bezierCurveTo(-1.45, -1.43, .45, -.94, 1.55, -.75);
  shape.bezierCurveTo(2.35, -.62, 2.85, -.43, 2.9, .10);
  shape.bezierCurveTo(2.96, .52, 2.62, .76, 2.1, .76);
  shape.lineTo(-3.12, .65);
  shape.closePath();
  return shape;
}

function frontRibbon() {
  const shape = new THREE.Shape();
  shape.moveTo(-3.54, .02);
  shape.bezierCurveTo(-3.65, -.65, -3.24, -1.00, -2.85, -1.135);
  shape.bezierCurveTo(-1.45, -1.515, .45, -1.025, 1.55, -.835);
  shape.bezierCurveTo(2.35, -.705, 2.95, -.515, 2.995, .10);
  shape.lineTo(2.86, .10);
  shape.bezierCurveTo(2.81, -.40, 2.31, -.57, 1.52, -.70);
  shape.bezierCurveTo(.44, -.89, -1.45, -1.38, -2.82, -1.00);
  shape.bezierCurveTo(-3.15, -.88, -3.51, -.59, -3.41, .02);
  shape.closePath();
  return shape;
}

/** Customer front +Z; floor y=0. Geometry is owned here, shared materials are not. */
export function createFilmCheckin(materials: FilmMaterialPalette): FilmCheckin {
  const root = new THREE.Group();
  root.name = "sculpted-checkin-island";
  const batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const owned = new Set<THREE.BufferGeometry>();
  const instances: THREE.InstancedMesh[] = [];
  let disposed = false;
  const add = (source: THREE.BufferGeometry, material: THREE.Material) => {
    const geometry = source.index ? source.toNonIndexed() : source;
    if (geometry !== source) source.dispose();
    geometry.deleteAttribute("uv");
    if (!geometry.attributes.normal) geometry.computeVertexNormals();
    const bucket = batches.get(material) ?? [];
    bucket.push(geometry); batches.set(material, bucket);
  };
  const roundBox = (w: number, h: number, d: number, radius = .04) => new RoundedBoxGeometry(w, h, d, 3, Math.min(radius, w / 3, h / 3, d / 3));
  const box = (w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number, radius = .04) => {
    const geometry = roundBox(w, h, d, radius); geometry.translate(x, y, z); add(geometry, material);
  };
  const plan = (shape: THREE.Shape, y: number, height: number, bevel: number, material: THREE.Material, scale = 1) => {
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, curveSegments: 32, steps: 1, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3 });
    geometry.rotateX(-Math.PI / 2); geometry.scale(scale, 1, scale); geometry.translate(0, y, 0); add(geometry, material);
  };
  const tube = (points: THREE.Vector3[], radius: number, material: THREE.Material, segments = 40) => {
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, radius, 8, false), material);
  };
  const dynamicMesh = (geometry: THREE.BufferGeometry, material: THREE.Material, parent = root) => {
    owned.add(geometry);
    const mesh = new THREE.Mesh(geometry, material); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };

  // A curved stone shell over an inset plinth gives the island a continuous silhouette.
  plan(footprint(), .04, .12, .025, materials.ink, .94);
  plan(footprint(), .20, .82, .065, materials.ivory);
  plan(frontRibbon(), .25, .64, .025, materials.cyan);
  // The curved fascia is glazed petrol enamel with hand-finished oak fins.
  // These follow the actual shell instead of drawing a flat stripe over it.
  const fasciaCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-2.85, .56, 1.145), new THREE.Vector3(-1.45, .56, 1.525),
    new THREE.Vector3(.45, .56, 1.035), new THREE.Vector3(1.55, .56, .845),
  );
  for (let i = 0; i < 35; i++) {
    const t = i / 34, point = fasciaCurve.getPoint(t), tangent = fasciaCurve.getTangent(t);
    const fin = roundBox(i % 7 === 0 ? .055 : .032, .53, .055, .009);
    fin.rotateY(-Math.atan2(tangent.z, tangent.x));
    fin.translate(point.x, point.y, point.z + .025);
    add(fin, i % 7 === 0 ? materials.gold : materials.walnut);
  }
  const faceAccent = fasciaCurve.getPoints(46).map(point => new THREE.Vector3(point.x, .78, point.z + .045));
  tube(faceAccent, .014, materials.ivory, 46);
  plan(frontRibbon(), .93, .025, .010, materials.gold);
  plan(frontRibbon(), .18, .028, .006, materials.gold);
  plan(footprint(), 1.055, .115, .055, materials.ivory, 1.035);

  // Recessed employee worktop, service drawer, and a small accessible concierge ledge.
  box(2.22, .09, .73, materials.walnut, .25, .93, -.82, .035);
  box(2.0, .075, .035, materials.gold, .25, .89, -1.18, .012);
  box(1.05, .44, .05, materials.dark, -.15, .61, -.82, .025);
  box(.36, .025, .05, materials.gold, -.15, .75, -.87, .01);
  const lowerLedge = roundBox(1.35, .10, .75, .04);
  lowerLedge.rotateY(-.18); lowerLedge.translate(-2.7, .83, .64); add(lowerLedge, materials.ivory);
  const reader = roundBox(.43, .08, .30, .025);
  reader.rotateX(-.20); reader.translate(-.75, 1.24, .61); add(reader, materials.dark);
  box(.27, .015, .17, materials.glass, -.75, 1.29, .59, .008);
  // A recently handled passport and tagging supplies make this a working desk.
  // Every piece joins the existing material batches, including the printed marks.
  const passportTransform = new THREE.Matrix4().makeRotationY(-.22);
  passportTransform.setPosition(-1.40, 1.236, .62);
  const passportPart = (w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material, lifted = false) => {
    const geometry = roundBox(w, h, d, .005);
    geometry.translate(x, y, z);
    if (lifted) geometry.rotateZ(.38);
    geometry.applyMatrix4(passportTransform); add(geometry, material);
  };
  passportPart(.32, .018, .45, -.16, 0, 0, materials.ink);
  passportPart(.32, .018, .45, .16, 0, 0, materials.ink, true);
  passportPart(.29, .017, .415, -.155, .017, 0, materials.ivory);
  passportPart(.29, .017, .415, .155, .017, 0, materials.ivory, true);
  passportPart(.025, .022, .44, 0, .008, 0, materials.walnut);
  // A photo block, ruled fields and page edges; no invented identity text.
  passportPart(.075, .003, .096, -.218, .027, .060, materials.steel);
  for (let i = 0; i < 4; i++) {
    passportPart(.115 - i * .010, .003, .007, -.105, .027, .085 - i * .035, materials.gold);
    passportPart(.20, .003, .005, .155, .027, .135 - i * .045, materials.gold, true);
  }
  passportPart(.27, .003, .008, -.155, .027, -.165, materials.dark);
  passportPart(.27, .003, .008, .155, .027, -.165, materials.dark, true);

  // A hollow paper roll with a short loose tail curling toward the customer.
  const rollCenter = new THREE.Vector3(.30, 1.343, .48);
  const roll = new THREE.CylinderGeometry(.112, .112, .19, 24);
  roll.rotateZ(Math.PI / 2); roll.translate(rollCenter.x, rollCenter.y, rollCenter.z); add(roll, materials.ivory);
  for (const side of [-1, 1]) {
    const core = new THREE.CylinderGeometry(.036, .036, .003, 16);
    core.rotateZ(Math.PI / 2); core.translate(.30 + side * .097, 1.343, .48); add(core, materials.dark);
    for (const radius of [.064, .091]) {
      const edge = new THREE.TorusGeometry(radius, .0018, 3, 24);
      edge.rotateY(Math.PI / 2); edge.translate(.30 + side * .097, 1.343, .48); add(edge, materials.gold);
    }
  }
  const paperStrip = (points: readonly (readonly [number, number, number])[], width: number, material: THREE.Material) => {
    const vertices: number[] = [], indices: number[] = [];
    points.forEach(([x, y, z]) => vertices.push(x - width / 2, y, z, x + width / 2, y, z));
    for (let i = 0; i < points.length - 1; i++) { const a = i * 2; indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); add(geometry, material);
  };
  paperStrip([[.30, 1.236, .49], [.30, 1.239, .63], [.30, 1.244, .79], [.30, 1.28, .85]], .18, materials.ivory);
  for (let i = 0; i < 7; i++) box(.009 + (i % 2) * .005, .003, .055, materials.ink, .242 + i * .018, 1.247, .75, .001);

  // One folded tag beside the reader, with a raised perforated end and coral tab.
  paperStrip([[-.17, 1.237, .43], [-.17, 1.24, .65], [-.17, 1.30, .72]], .25, materials.ivory);
  box(.045, .004, .15, materials.coral, -.268, 1.243, .53, .001);
  for (let i = 0; i < 5; i++) box(.008, .003, .047, materials.ink, -.20 + i * .019, 1.245, .56, .001);
  // Polished corners at the reader's contact edge, rather than all-over dirt.
  box(.072, .004, .012, materials.steel, -.88, 1.253, .757, .002);
  box(.030, .004, .012, materials.steel, -.63, 1.253, .757, .002);

  // A stepped sign housing grows from two curved structural masts.
  for (const x of [-1.58, 1.58]) {
    tube([new THREE.Vector3(x, .92, -.68), new THREE.Vector3(x, 1.85, -.83), new THREE.Vector3(x, 2.70, -1.10), new THREE.Vector3(x, 3.31, -1.15)], .046, materials.steel, 28);
  }
  box(3.94, 1.28, .25, materials.ivory, 0, 3.30, -1.20, .07);
  box(3.84, 1.18, .23, materials.dark, 0, 3.30, -1.15, .07);
  // Enamel face, worn brass shoulders and a painted reverse, all real thickness.
  for (const x of [-1.99, 1.99]) box(.075, 1.05, .30, materials.gold, x, 3.30, -1.17, .022);
  box(3.68, .055, .30, materials.cyan, 0, 2.64, -1.18, .018);
  box(3.89, .07, .25, materials.ivory, 0, 3.94, -1.17, .025);
  box(3.63, .025, .04, materials.gold, 0, 3.87, -1.015, .008);
  box(1.42, .16, .16, materials.steel, 1.08, 4.04, -1.17, .045);
  const boardAnchor = new THREE.Group(); boardAnchor.name = "checkin-board-content";
  boardAnchor.position.set(0, 3.30, -1.018); root.add(boardAnchor);
  const indicators: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    box(.11, .035, .025, materials.ink, -.34 + i * .17, 2.66, -1.012, .008);
    const light = dynamicMesh(roundBox(.11, .035, .025, .008), materials.warmLight);
    light.position.set(-.34 + i * .17, 2.66, -.996); indicators.push(light);
  }

  // Customer-facing monitor, on a sculpted tilted support instead of a floating card.
  tube([new THREE.Vector3(1.15, 1.04, -.25), new THREE.Vector3(1.17, 1.27, -.30), new THREE.Vector3(1.15, 1.53, -.20)], .055, materials.steel, 16);
  box(.40, .055, .30, materials.dark, 1.15, 1.08, -.25, .025);
  const monitorPivot = new THREE.Group(); monitorPivot.position.set(1.15, 1.55, -.2); root.add(monitorPivot);
  dynamicMesh(roundBox(1.09, .69, .15, .045), materials.ink, monitorPivot);
  const monitorAnchor = new THREE.Group(); monitorAnchor.name = "checkin-monitor-content";
  monitorAnchor.position.z = .084; monitorPivot.add(monitorAnchor);

  // Inset weighing platform and a continuous low belt, physically joined to the island.
  box(1.46, .36, 4.55, materials.dark, 3.55, .23, -1.44, .13);
  box(1.27, .08, 1.52, materials.steel, 3.55, .47, .30, .035);
  box(1.10, .02, 1.36, materials.ink, 3.55, .52, .30, .025);
  for (const x of [2.84, 4.26]) {
    box(.12, .29, 4.45, materials.ivory, x, .52, -1.45, .045);
    box(.035, .025, 4.12, materials.gold, x, .68, -1.48, .008);
  }
  box(.16, .66, .16, materials.steel, 4.35, .77, .43, .025);
  box(.34, .20, .10, materials.ink, 4.35, 1.12, .46, .025);
  box(.24, .08, .012, materials.coolLight, 4.35, 1.13, .519, .006);
  const treadGeometry = roundBox(1.11, .045, .18, .012); owned.add(treadGeometry);
  const treads = new THREE.InstancedMesh(treadGeometry, materials.steel, 22);
  treads.castShadow = treads.receiveShadow = true; instances.push(treads); root.add(treads);
  // Fixed bounds contain every tread over the full .205m wrap cycle.
  treads.boundingSphere = new THREE.Sphere(new THREE.Vector3(3.55, .565, -1.50), 2.5);
  const dummy = new THREE.Object3D();

  const suitcase = new THREE.Group(); root.add(suitcase);
  const caseBody = dynamicMesh(roundBox(.72, .80, .47, .12), materials.coral, suitcase); caseBody.position.y = .44;
  const caseSeam = dynamicMesh(roundBox(.735, .052, .48, .018), materials.gold, suitcase); caseSeam.position.y = .44;
  for (const x of [-.25, .25]) {
    const wheel = dynamicMesh(new THREE.CylinderGeometry(.065, .065, .07, 12), materials.ink, suitcase);
    wheel.rotation.x = Math.PI / 2; wheel.position.set(x, .065, .14);
  }
  const handle = dynamicMesh(roundBox(.27, .065, .09, .026), materials.dark, suitcase); handle.position.y = .90;
  const tag = dynamicMesh(roundBox(.115, .24, .012, .012), materials.ivory, suitcase); tag.position.set(.19, .72, .247); tag.rotation.z = -.15;

  for (const [material, parts] of batches) {
    const geometry = mergeGeometries(parts, false); parts.forEach(part => part.dispose());
    if (!geometry) throw new Error("Check-in geometry attributes could not be merged.");
    dynamicMesh(geometry, material).name = `checkin-${material.name || material.type}`;
  }
  batches.clear();

  const update = (state: FilmCheckinState) => {
    const time = state.reduced ? 0 : state.time ?? 0;
    const progress = state.reduced ? 0 : THREE.MathUtils.clamp(state.progress ?? 0, 0, 1);
    const index = THREE.MathUtils.clamp(Math.round(state.selectedIndex ?? 0), 0, 4);
    indicators.forEach((indicator, i) => { indicator.visible = i === index; });
    monitorPivot.rotation.y = state.reduced ? 0 : Math.sin(progress * Math.PI) * -.07;
    const shift = (time * .48 + progress * .24) % .205;
    for (let i = 0; i < 22; i++) {
      dummy.position.set(3.55, .565, .75 - i * .205 - shift);
      dummy.updateMatrix(); treads.setMatrixAt(i, dummy.matrix);
    }
    treads.instanceMatrix.needsUpdate = true;
    const cycle = (time * .055 + progress * .26) % 1;
    const moving = THREE.MathUtils.smoothstep(cycle, .20, .94);
    suitcase.position.set(3.55, .60, .42 - moving * 3.62);
    suitcase.rotation.y = -.08 + Math.sin(moving * Math.PI) * .11;
  };
  update({ reduced: true });

  return {
    root, boardAnchor, monitorAnchor, update,
    dispose() {
      if (disposed) return;
      disposed = true;
      instances.forEach(instance => instance.dispose());
      owned.forEach(geometry => geometry.dispose());
      root.clear();
    },
  };
}
