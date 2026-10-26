import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { FilmMaterialPalette } from "./film-materials";

export interface FilmAircraft {
  root: THREE.Group;
  dispose: () => void;
}

type WingSection = { span: number; leading: number; trailing: number; height: number; thickness: number };
type Point = readonly [number, number];

/** Closed, cambered airfoil loft, rather than a zero-thickness triangular wing. */
function wing(sections: WingSection[], side: number) {
  const profile: Point[] = [[0, 0], [.025, .32], [.09, .72], [.25, 1], [.48, .78], [.74, .34], [.94, .06], [1, -.025], [.74, -.11], [.48, -.29], [.25, -.40], [.09, -.31], [.025, -.16]];
  const vertices: number[] = [], indices: number[] = [];
  const count = profile.length;
  sections.forEach(section => profile.forEach(([along, height]) => {
    vertices.push(THREE.MathUtils.lerp(section.leading, section.trailing, along), section.height + height * section.thickness, section.span * side);
  }));
  for (let row = 0; row < sections.length - 1; row++) {
    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      const a = row * count + i, b = row * count + next, c = (row + 1) * count + next, d = (row + 1) * count + i;
      indices.push(a, b, d, b, c, d);
    }
  }
  const end = (sections.length - 1) * count;
  for (let i = 1; i < count - 1; i++) indices.push(0, i + 1, i, end, end + i, end + i + 1);
  if (side < 0) for (let i = 0; i < indices.length; i += 3) [indices[i + 1], indices[i + 2]] = [indices[i + 2], indices[i + 1]];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function extruded(points: readonly Point[], depth: number, bevel: number) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, steps: 1, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 5 });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

/**
 * Original 24m airliner: nose +X, span 20m along Z, wheel baseline y=-3.5m.
 * Merged by shared palette material (five opaque batches). No image planes.
 * The owner animates root; this factory owns geometry, never shared materials.
 */
export function createFilmAircraft(materials: FilmMaterialPalette): FilmAircraft {
  const root = new THREE.Group();
  root.name = "film-aircraft";
  root.userData = { length: 24, wingspan: 20, groundOffset: -3.5, noseAxis: "+X" };
  const batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const finalGeometry: THREE.BufferGeometry[] = [];
  let disposed = false;
  const add = (source: THREE.BufferGeometry, material: THREE.Material) => {
    const geometry = source.index ? source.toNonIndexed() : source;
    if (geometry !== source) source.dispose();
    geometry.deleteAttribute("uv");
    if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
    const bucket = batches.get(material) ?? [];
    bucket.push(geometry);
    batches.set(material, bucket);
  };
  const cylinder = (radiusTop: number, radiusBottom: number, height: number, radial = 24) => new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial, 1);

  // Radius / longitudinal position. A spline supplies the rounded nose and tail.
  const bodyProfile: Point[] = [[0, -12], [.17, -11.6], [.46, -10.5], [.78, -9], [1.03, -7], [1.15, -4], [1.15, 7.0], [1.13, 8.5], [1.03, 9.5], [.86, 10.4], [.60, 11.2], [.30, 11.75], [0, 12]];
  const curve = new THREE.SplineCurve(bodyProfile.map(([radius, x]) => new THREE.Vector2(radius, x)));
  const profile = curve.getPoints(88).map(point => new THREE.Vector2(Math.max(0, point.x), point.y));
  const fuselage = new THREE.LatheGeometry(profile, 48);
  fuselage.rotateZ(-Math.PI / 2);
  add(fuselage, materials.ivory);
  const belly = new THREE.LatheGeometry(profile.map(point => new THREE.Vector2(point.x + .006, point.y)), 20, .86, Math.PI - 1.72);
  belly.rotateZ(-Math.PI / 2);
  add(belly, materials.dark);
  const radiusAt = (x: number) => {
    for (let i = 1; i < profile.length; i++) {
      const a = profile[i - 1], b = profile[i];
      if (x <= b.y) return THREE.MathUtils.lerp(a.x, b.x, (x - a.y) / (b.y - a.y));
    }
    return 0;
  };
  const surfacePoint = (x: number, y: number, side: number, lift = .018) => new THREE.Vector3(x, y, side * (Math.sqrt(Math.max(.005, radiusAt(x) ** 2 - y ** 2)) + lift));

  const mainWing: WingSection[] = [
    { span: .6, leading: 2.1, trailing: -4.1, height: -.55, thickness: .42 },
    { span: 3.5, leading: .5, trailing: -4.55, height: -.48, thickness: .31 },
    { span: 7.3, leading: -2.4, trailing: -5.2, height: -.15, thickness: .17 },
    { span: 10, leading: -4.1, trailing: -5.4, height: .18, thickness: .075 },
  ];
  const tailWing: WingSection[] = [
    { span: .35, leading: -8.0, trailing: -11.7, height: .40, thickness: .15 },
    { span: 1.6, leading: -9.25, trailing: -12.0, height: .61, thickness: .11 },
    { span: 3.1, leading: -10.7, trailing: -12.25, height: .86, thickness: .055 },
  ];
  for (const side of [-1, 1]) {
    add(wing(mainWing, side), materials.ivory);
    add(wing(tailWing, side), materials.ivory);
    const winglet = extruded([[-4.1, .18], [-4.43, 1.1], [-4.79, 1.63], [-5.02, 1.63], [-5.4, .18]], .085, .025);
    winglet.translate(0, 0, side * 9.96);
    add(winglet, materials.dark);
    const wingTip = extruded([[-4.64, 1.35], [-4.79, 1.63], [-5.02, 1.63], [-5.10, 1.35]], .16, .012);
    wingTip.translate(0, 0, side * 9.96);
    add(wingTip, materials.coral);

    // Substantial underwing pylons and rolled nacelle intake lips.
    const pylon = extruded([[-1.0, -.47], [.55, -.41], [1.0, -1.33], [-.85, -1.33]], .20, .04);
    pylon.translate(0, 0, side * 3.25);
    add(pylon, materials.steel);
    const engineProfile = [[.32, -1.3], [.47, -.8], [.58, .2], [.61, .95], [.57, 1.17], [.49, 1.22], [.455, 1.04], [.455, .72]].map(([radius, x]) => new THREE.Vector2(radius, x));
    const nacelle = new THREE.LatheGeometry(engineProfile, 36);
    nacelle.rotateZ(-Math.PI / 2);
    nacelle.translate(.65, -1.48, side * 3.25);
    add(nacelle, materials.ivory);
    const fan = new THREE.CircleGeometry(.455, 32);
    fan.rotateY(Math.PI / 2);
    fan.translate(1.37, -1.48, side * 3.25);
    add(fan, materials.ink);
    for (let blade = 0; blade < 12; blade++) {
      const a = blade / 12 * Math.PI * 2;
      const vane = new THREE.BoxGeometry(.025, .31, .055);
      vane.rotateX(a + .24);
      vane.translate(1.39, -1.48 + Math.cos(a) * .25, side * 3.25 + Math.sin(a) * .25);
      add(vane, materials.steel);
    }
    const hub = new THREE.ConeGeometry(.105, .18, 20);
    hub.rotateZ(-Math.PI / 2);
    hub.translate(1.49, -1.48, side * 3.25);
    add(hub, materials.steel);
    const exhaust = new THREE.CircleGeometry(.32, 24);
    exhaust.rotateY(-Math.PI / 2);
    exhaust.translate(-.66, -1.48, side * 3.25);
    add(exhaust, materials.dark);

    // Cabin windows follow the curved fuselage surface, with actual rounded edges.
    for (let i = 0; i < 22; i++) {
      const x = -6.9 + i * .61;
      const outline: THREE.Vector3[] = [];
      for (let step = 0; step < 16; step++) {
        const angle = step / 16 * Math.PI * 2;
        outline.push(surfacePoint(x + Math.cos(angle) * .155, .42 + Math.sin(angle) * .20, side));
      }
      const center = surfacePoint(x, .42, side, .02);
      const points = [center, ...outline];
      const positions = points.flatMap(point => point.toArray()), indices: number[] = [];
      for (let j = 0; j < 16; j++) indices.push(0, 1 + (side > 0 ? j : (j + 1) % 16), 1 + (side > 0 ? (j + 1) % 16 : j));
      const window = new THREE.BufferGeometry();
      window.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      window.setIndex(indices);
      window.computeVertexNormals();
      add(window, materials.ink);
    }

    // Two discreet cabin doors per side, drawn as fine raised geometry.
    for (const doorX of [-8.05, 7.45]) {
      const doorPoints: THREE.Vector3[] = [];
      const corners: Point[] = [[-.32, -.62], [.32, -.62], [.32, .71], [-.32, .71], [-.32, -.62]];
      for (let edge = 0; edge < 4; edge++) {
        const a = corners[edge], b = corners[edge + 1];
        for (let s = 0; s < 6; s++) doorPoints.push(surfacePoint(doorX + THREE.MathUtils.lerp(a[0], b[0], s / 6), THREE.MathUtils.lerp(a[1], b[1], s / 6), side, .022));
      }
      const path = new THREE.CatmullRomCurve3(doorPoints, true, "centripetal");
      add(new THREE.TubeGeometry(path, 40, .012, 4, true), materials.steel);
    }

    // Sloped cockpit glazing wraps both sides of the rounded nose.
    const cockpitPanels: Point[][] = [[[8.9, .62], [9.9, .59], [10.3, .25], [9.0, .27]], [[10.0, .57], [10.62, .42], [10.9, .13], [10.4, .23]]];
    cockpitPanels.forEach(panel => {
      const positions: number[] = [], indices: number[] = [];
      // Conform the entire pane to the curved nose, not just its four corners.
      for (let row = 0; row <= 4; row++) {
        const v = row / 4;
        for (let col = 0; col <= 8; col++) {
          const u = col / 8;
          const x = THREE.MathUtils.lerp(THREE.MathUtils.lerp(panel[0][0], panel[3][0], v), THREE.MathUtils.lerp(panel[1][0], panel[2][0], v), u);
          const y = THREE.MathUtils.lerp(THREE.MathUtils.lerp(panel[0][1], panel[3][1], v), THREE.MathUtils.lerp(panel[1][1], panel[2][1], v), u);
          positions.push(...surfacePoint(x, y, side, .035).toArray());
          if (row < 4 && col < 8) {
            const a = row * 9 + col, b = a + 1, d = a + 9, c = d + 1;
            indices.push(...(side > 0 ? [a, d, b, b, d, c] : [a, b, d, b, c, d]));
          }
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      add(geometry, materials.ink);
    });
  }

  add(extruded([[-7.8, .76], [-10.58, 4.08], [-11.52, 4.08], [-11.96, .49]], .17, .075), materials.dark);
  add(extruded([[-10.21, 3.63], [-10.58, 4.08], [-11.52, 4.08], [-11.58, 3.63]], .34, .04), materials.coral);

  // Six tires and three struts; the lowest tire touches y=-3.5 exactly.
  for (const gear of [{ x: -2.4, z: -1.30, radius: .40 }, { x: -2.4, z: 1.30, radius: .40 }, { x: 8.0, z: 0, radius: .31 }]) {
    const wheelY = -3.5 + gear.radius;
    const strut = cylinder(.065, .09, 1.85, 12);
    strut.translate(gear.x, wheelY + .925, gear.z);
    add(strut, materials.steel);
    const axle = cylinder(.07, .07, .67, 12);
    axle.rotateX(Math.PI / 2);
    axle.translate(gear.x, wheelY, gear.z);
    add(axle, materials.steel);
    for (const offset of [-.24, .24]) {
      const tire = cylinder(gear.radius, gear.radius, .20, 24);
      tire.rotateX(Math.PI / 2);
      tire.translate(gear.x, wheelY, gear.z + offset);
      add(tire, materials.ink);
      const hub = cylinder(gear.radius * .46, gear.radius * .46, .208, 20);
      hub.rotateX(Math.PI / 2);
      hub.translate(gear.x, wheelY, gear.z + offset);
      add(hub, materials.steel);
    }
  }

  for (const [material, parts] of batches) {
    const geometry = mergeGeometries(parts, false);
    parts.forEach(part => part.dispose());
    if (!geometry) throw new Error("Aircraft geometry attributes could not be merged.");
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    finalGeometry.push(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `aircraft-${material.name || material.type}`;
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
  }
  batches.clear();

  return {
    root,
    dispose() {
      if (disposed) return;
      disposed = true;
      finalGeometry.forEach(geometry => geometry.dispose());
      root.clear();
    },
  };
}
