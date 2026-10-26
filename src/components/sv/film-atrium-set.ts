import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { FilmMaterialPalette } from "./film-materials";
import { createSetBuilder, type FilmSet, type SetVector } from "./film-set-builder";

/** A closed, cambered enamel wing: its ridge, underside and tapered edge are
 * separate faces, so the silhouette and warm/cool planes survive camera motion.
 */
function wing(span: number, chord: number, lift: number, camber: number, sweep = .25, thickness = .07, ridge = .23) {
  const positions: number[] = [], indices: number[] = [], along = 20, across = 6;
  for (let shell = 0; shell < 2; shell++) for (let u = 0; u <= along; u++) for (let v = 0; v <= across; v++) {
    const t = u / along, q = v / across, taper = .08 + .92 * (1 - t ** 1.35);
    const arch = Math.sin(t * Math.PI) * camber;
    const fold = Math.sin(q * Math.PI) * taper * ridge;
    positions.push(span * t, t * lift + arch + (shell ? -thickness * taper : fold), (q - .5) * chord * taper + sweep * t * t);
  }
  const row = across + 1, layer = (along + 1) * row;
  for (let shell = 0; shell < 2; shell++) for (let u = 0; u < along; u++) for (let v = 0; v < across; v++) {
    const a = shell * layer + u * row + v, b = a + row;
    if (shell) indices.push(a, a + 1, b, a + 1, b + 1, b);
    else indices.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const seam = (a: number, b: number) => indices.push(a, a + layer, b, b, a + layer, b + layer);
  for (let u = 0; u < along; u++) { seam(u * row, (u + 1) * row); seam((u + 1) * row + across, u * row + across); }
  for (let v = 0; v < across; v++) { seam(v + 1, v); seam(along * row + v, along * row + v + 1); }
  for (let i = 0; i < indices.length; i += 3) { const b = indices[i + 1]; indices[i + 1] = indices[i + 2]; indices[i + 2] = b; }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

function extrusion(shape: THREE.Shape, depth: number, bevel = .035) {
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, curveSegments: 18, bevelEnabled: bevel > 0, bevelSegments: 2, bevelSize: bevel, bevelThickness: bevel, steps: 1 });
  geometry.translate(0, 0, -depth / 2); return geometry;
}

export function createAtriumSet(palette: FilmMaterialPalette): FilmSet {
  const arrival = createSetBuilder(palette, "arrival-wing-mobile-set");
  const checkin = createSetBuilder(palette, "checkin-sculptural-set");
  const dynamicGeometry = new Set<THREE.BufferGeometry>();
  let disposed = false;

  // The mobile hangs above the entire flight envelope. Nothing below 8.65m
  // enters the central atrium; the low camera dives underneath its folded forms.
  const rightWing = wing(1.8, 1.22, .45, .32, .30);
  const leftWing = rightWing.clone(); leftWing.scale(-1, 1, 1);
  const mirrorIndices = leftWing.index!;
  for (let i = 0; i < mirrorIndices.count; i += 3) { const b = mirrorIndices.getX(i + 1); mirrorIndices.setX(i + 1, mirrorIndices.getX(i + 2)); mirrorIndices.setX(i + 2, b); }
  leftWing.computeVertexNormals();
  const foldedWings = mergeGeometries([rightWing, leftWing], false)!; rightWing.dispose(); leftWing.dispose(); dynamicGeometry.add(foldedWings);
  const spine = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, -.06, -.70), new THREE.Vector3(0, .09, -.15), new THREE.Vector3(0, .05, .74)]), 12, .032, 7, false); dynamicGeometry.add(spine);
  const mobilePositions: SetVector[] = [[-4.0, 9.15, 9.2], [-1.4, 9.55, 3.25], [-4.2, 9.35, -3.2], [1.2, 9.70, -3.2], [-.7, 9.30, -9.6]];
  const mobiles = mobilePositions.map((position, i) => {
    const pivot = new THREE.Group(); pivot.name = `folded-wing-mobile-${i + 1}`; pivot.position.set(...position);
    const scale = i === 0 ? .8 : i === 3 ? .72 : 1; pivot.scale.setScalar(scale);
    const body = new THREE.Mesh(foldedWings, i % 3 === 0 ? palette.ivory : i % 3 === 1 ? palette.gold : palette.cyan);
    body.castShadow = body.receiveShadow = true; pivot.add(body);
    const keel = new THREE.Mesh(spine, palette.gold); keel.castShadow = keel.receiveShadow = true; pivot.add(keel);
    arrival.root.add(pivot);
    const roof = 8 + 3.6 * (1 - (position[0] / 14) ** 2);
    arrival.rod([position[0], roof - .15, position[2]], [position[0], position[1] + .08, position[2]], .012, "steel");
    arrival.add(new THREE.SphereGeometry(.065, 10, 7), "gold", [position[0], position[1] + .12, position[2]]);
    return { pivot, yaw: -.24 + i * .36, phase: i * 1.31 };
  });

  // A freestanding, layered wing relief is mounted BEHIND the Alpen desk.
  // Its 0.8m depth creates real overlaps and cast shadows; no wall illustration.
  const relief = [
    { x: -10.0, y: 3.95, z: -29.60, span: 7.0, chord: 1.95, lift: 1.75, camber: .60, tilt: .46, material: "ivory" as const },
    { x: -7.2, y: 4.30, z: -29.35, span: 8.6, chord: 2.30, lift: 2.10, camber: .74, tilt: .64, material: "gold" as const },
    { x: -3.4, y: 4.78, z: -29.20, span: 10.0, chord: 2.15, lift: 2.12, camber: .66, tilt: .52, material: "ivory" as const },
    { x: .35, y: 4.37, z: -28.60, span: 6.25, chord: 1.65, lift: 1.60, camber: .64, tilt: .72, material: "cyan" as const },
  ];
  for (const panel of relief) {
    checkin.add(wing(panel.span, panel.chord, panel.lift, panel.camber, .32, .18, .36), panel.material, [panel.x, panel.y, panel.z], [panel.tilt, 0, 0]);
    const rotation = new THREE.Euler(panel.tilt, 0, 0), origin = new THREE.Vector3(panel.x, panel.y, panel.z);
    const points = Array.from({ length: 20 }, (_, i) => { const t = i / 19, taper = .08 + .92 * (1 - t ** 1.35); return new THREE.Vector3(panel.span * t, panel.lift * t + Math.sin(t * Math.PI) * panel.camber, -panel.chord * taper * .5 + .32 * t * t).applyEuler(rotation).add(origin); });
    checkin.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, .026, 6, false), "steel");
    for (const fraction of [.12, .55]) {
      const mount = new THREE.Vector3(panel.span * fraction, panel.lift * fraction + Math.sin(fraction * Math.PI) * panel.camber - .15, .32 * fraction * fraction).applyEuler(rotation).add(origin);
      checkin.rod([mount.x, mount.y, -30.64], [mount.x, mount.y, mount.z], .045, "gold");
    }
  }
  // Mounting spine and three sculpted base fins establish the relief as an object.
  checkin.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-10.4, 3.50, -30.35), new THREE.Vector3(-7.7, 4.1, -30.25), new THREE.Vector3(-4.3, 4.55, -30.15), new THREE.Vector3(1, 5.1, -30.12)]), 36, .11, 10, false), "steel");

  // Two sculpted self-check-in terminals stand left of the walking route.
  // Their curved one-piece shell, recessed screen, paper slot and ribbed foot
  // are modelled at human scale, not represented by another text placard.
  const kioskSide = new THREE.Shape();
  kioskSide.moveTo(-.32, .10); kioskSide.quadraticCurveTo(-.46, .11, -.43, .27);
  kioskSide.bezierCurveTo(-.40, .66, -.14, .90, -.19, 1.30);
  kioskSide.lineTo(-.34, 1.83); kioskSide.quadraticCurveTo(-.35, 1.98, -.18, 1.99);
  kioskSide.lineTo(.29, 1.95); kioskSide.quadraticCurveTo(.41, 1.93, .40, 1.79);
  kioskSide.lineTo(.30, 1.23); kioskSide.bezierCurveTo(.23, .88, .12, .57, .37, .27);
  kioskSide.quadraticCurveTo(.48, .11, .27, .10); kioskSide.closePath();
  const kiosks = [{ x: -4.0, z: -22.1, yaw: .22 }, { x: -1.80, z: -24.15, yaw: -.10 }];
  for (const kiosk of kiosks) {
    const local = (x: number, y: number, z: number): SetVector => [kiosk.x + x * Math.cos(kiosk.yaw) + z * Math.sin(kiosk.yaw), y, kiosk.z - x * Math.sin(kiosk.yaw) + z * Math.cos(kiosk.yaw)];
    checkin.add(extrusion(kioskSide, .66, .045), "ivory", [kiosk.x, 0, kiosk.z], [0, Math.PI / 2 + kiosk.yaw, 0]);
    checkin.box([.82, .08, .74], local(0, .085, .01), "steel", [0, kiosk.yaw, 0], .08);
    checkin.box([.61, .62, .075], local(0, 1.60, .29), "ink", [-.13, kiosk.yaw, 0], .045);
    checkin.box([.51, .50, .016], local(0, 1.60, .338), "dark", [-.13, kiosk.yaw, 0], .025);
    checkin.box([.35, .035, .012], local(0, 1.77, .379), "coolLight", [-.13, kiosk.yaw, 0], .008);
    for (let line = 0; line < 3; line++) checkin.box([.22 - line * .035, .014, .012], local(-.045, 1.66 - line * .09, .36 - line * .012), "ivory", [-.13, kiosk.yaw, 0]);
    checkin.box([.36, .045, .06], local(0, 1.02, .27), "ink", [0, kiosk.yaw, 0], .012);
    checkin.box([.32, .025, .14], local(0, .985, .32), "gold", [0, kiosk.yaw, 0], .008);
    for (let rib = 0; rib < 5; rib++) checkin.box([.026, .29, .028], local(-.20 + rib * .10, .33, .28), "cyan", [0, kiosk.yaw, 0], .005);
  }
  // A short, curved queue rail creates foreground depth without blocking anyone.
  const queuePoints: SetVector[] = [[-5.4, 0, -20.5], [-3.7, 0, -20.9], [-2.7, 0, -22.0]];
  for (const [x, , z] of queuePoints) {
    checkin.add(new THREE.CylinderGeometry(.22, .29, .06, 20), "steel", [x, .045, z]);
    checkin.rod([x, .09, z], [x, 1.04, z], .032, "gold");
    checkin.add(new THREE.SphereGeometry(.065, 12, 8), "ivory", [x, 1.05, z]);
  }
  for (let i = 0; i < queuePoints.length - 1; i++) {
    const a = queuePoints[i], b = queuePoints[i + 1];
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(a[0], .98, a[2]), new THREE.Vector3((a[0] + b[0]) / 2, .84, (a[2] + b[2]) / 2), new THREE.Vector3(b[0], .98, b[2])]);
    checkin.add(new THREE.TubeGeometry(curve, 18, .034, 7, false), "dark");
  }
  arrival.finish(); checkin.finish();
  for (const { pivot, yaw, phase } of mobiles) {
    pivot.userData.setMotion = {
      channels: [
        { axis: "x", offset: .06, amplitude: .055, frequency: .27, phase },
        { axis: "y", offset: yaw, amplitude: .12, frequency: .16, phase },
        { axis: "z", offset: 0, amplitude: .045, frequency: .21, phase },
      ],
      reducedRotation: [.06 + Math.sin(phase) * .055, yaw + Math.sin(phase) * .12, Math.sin(phase) * .045],
    };
  }
  const update = (time: number, reduced: boolean) => {
    const t = reduced ? 0 : time;
    for (const { pivot, yaw, phase } of mobiles) pivot.rotation.set(.06 + Math.sin(t * .27 + phase) * .055, yaw + Math.sin(t * .16 + phase) * .12, Math.sin(t * .21 + phase) * .045);
  };
  update(0, true);
  return { groups: [arrival.root, checkin.root], update, dispose() { if (disposed) return; disposed = true; dynamicGeometry.forEach(geometry => geometry.dispose()); arrival.dispose(); checkin.dispose(); } };
}
