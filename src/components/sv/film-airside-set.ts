import * as THREE from "three";
import type { FilmMaterialPalette } from "./film-materials";
import { createSetBuilder, type FilmSet, type SetMaterial, type SetVector } from "./film-set-builder";

type Builder = ReturnType<typeof createSetBuilder>;

function roundedPath(width: number, height: number, radius: number, path: THREE.Shape | THREE.Path, y = 0) {
  const x = -width / 2, bottom = y - height / 2, right = width / 2, top = y + height / 2;
  path.moveTo(x + radius, bottom); path.lineTo(right - radius, bottom);
  path.quadraticCurveTo(right, bottom, right, bottom + radius); path.lineTo(right, top - radius);
  path.quadraticCurveTo(right, top, right - radius, top); path.lineTo(x + radius, top);
  path.quadraticCurveTo(x, top, x, top - radius); path.lineTo(x, bottom + radius);
  path.quadraticCurveTo(x, bottom, x + radius, bottom); path.closePath();
  return path;
}

function frame(width: number, height: number, depth: number, border: number, radius = .14) {
  const shape = roundedPath(width, height, radius, new THREE.Shape()) as THREE.Shape;
  const hole = roundedPath(width - border * 2, height - border * 2, Math.max(.025, radius - border * .5), new THREE.Path());
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, steps: 1, bevelEnabled: true, bevelSize: .018, bevelThickness: .018, bevelSegments: 1, curveSegments: 6 });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

// Open-bottom enclosure: rounded upper corners are above the full-height
// rectangular walking clearance. There is deliberately no threshold crossbar.
function screeningHousing() {
  const shape = new THREE.Shape();
  const outside = 1.83, inside = 1.30, bottom = .05, top = 3.53;
  const outerRadius = .30, innerTop = 3.12, innerRadius = .13;
  shape.moveTo(-outside, bottom);
  shape.lineTo(-outside, top - outerRadius);
  shape.quadraticCurveTo(-outside, top, -outside + outerRadius, top);
  shape.lineTo(outside - outerRadius, top);
  shape.quadraticCurveTo(outside, top, outside, top - outerRadius);
  shape.lineTo(outside, bottom);
  shape.lineTo(inside, bottom);
  shape.lineTo(inside, innerTop - innerRadius);
  shape.quadraticCurveTo(inside, innerTop, inside - innerRadius, innerTop);
  shape.lineTo(-inside + innerRadius, innerTop);
  shape.quadraticCurveTo(-inside, innerTop, -inside, innerTop - innerRadius);
  shape.lineTo(-inside, bottom);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: .44, steps: 1, bevelEnabled: true, bevelSize: .018,
    bevelThickness: .018, bevelSegments: 2, curveSegments: 8,
  });
  geometry.translate(0, 0, -.22);
  return geometry;
}

function wheel(set: Builder, x: number, y: number, z: number, radius = .11, width = .07) {
  set.add(new THREE.CylinderGeometry(radius, radius, width, 16), "ink", [x, y, z], [0, 0, Math.PI / 2]);
  set.add(new THREE.CylinderGeometry(radius * .48, radius * .48, width + .012, 12), "steel", [x, y, z], [0, 0, Math.PI / 2]);
}

function emptyTray(set: Builder, x: number, y: number, z: number, material: SetMaterial = "cyan") {
  // A recessed basin, not a filled box: the rim and the floor are separate solids.
  set.box([1.16, .035, .76], [x, y + .018, z], material, [0, 0, 0], .07);
  set.add(frame(1.20, .80, .16, .055, .12), material, [x, y + .105, z], [-Math.PI / 2, 0, 0]);
  for (const side of [-1, 1]) set.box([.27, .045, .07], [x, y + .18, z + side * .39], "steel", [0, 0, 0], .015);
}

function luggage(set: Builder, x: number, z: number, finish: SetMaterial, height = .84) {
  set.box([.62, height, .42], [x, height / 2 + .13, z], finish, [0, 0, 0], .09);
  for (const side of [-1, 1]) {
    wheel(set, x + side * .25, .09, z - .14, .075, .05);
    set.rod([x + side * .11, height + .12, z], [x + side * .11, height + .48, z], .012, "steel");
  }
  set.box([.28, .04, .055], [x, height + .48, z], "ink", [0, 0, 0], .014);
  for (let n = 0; n < 5; n++) set.box([.022, height * .68, .018], [x - .22 + n * .11, height / 2 + .13, z + .218], "gold", [0, 0, 0], .005);
  set.box([.115, .20, .012], [x + .19, height - .04, z + .231], "ivory", [0, 0, -.12], .012);
}

/** Physical screening equipment, gate furnishings and low apron service vehicles.
 * Every opaque surface shares the existing palette. No image planes or new lights.
 */
export function createAirsideSet(palette: FilmMaterialPalette): FilmSet {
  const security = createSetBuilder(palette, "security-equipment-set");
  const gate = createSetBuilder(palette, "gate-equipment-set");
  const apron = createSetBuilder(palette, "apron-service-set");
  let disposed = false;

  // The walkthrough detector is a manufactured enamel enclosure, not three
  // bare bars. Its inner face stays outside x[.04, 2.56] / y[.03, 2.95].
  // The rounded upper shell catches the window key; the petrol side covers
  // break up its depth without outlining the opening in emissive strips.
  security.add(screeningHousing(), "ivory", [1.3, 0, -42.678]);
  for (const side of [-1, 1]) {
    const x = 1.3 + side * 1.57;
    security.box([.39, 2.20, .055], [x, 1.58, -42.45], "steel", [0, 0, 0], .055);
    security.box([.29, 2.06, .048], [x, 1.58, -42.415], "cyan", [0, 0, 0], .045);
    // A raised shoulder and shallow access lid give the front a layered profile.
    security.box([.33, .18, .07], [x, 2.77, -42.435], "ivory", [0, 0, 0], .045);
    security.box([.24, .37, .025], [x, .82, -42.384], "steel", [0, 0, 0], .035);
    for (const y of [.72, .91]) security.add(new THREE.CylinderGeometry(.018, .018, .012, 8), "gold", [x + side * .075, y, -42.367], [Math.PI / 2, 0, 0]);
    // Feet widen away from the opening. Even their beveled faces leave the
    // full original aisle unobstructed, including at floor level.
    security.box([.68, .20, .70], [1.3 + side * 1.64, .11, -42.77], "steel", [0, 0, 0], .07);
    security.box([.56, .24, .57], [1.3 + side * 1.60, .22, -42.74], "ivory", [0, 0, 0], .07);
    // Two small recessed status lenses; no text or luminous perimeter.
    security.add(new THREE.CylinderGeometry(.082, .082, .035, 16), "dark", [x, 2.48, -42.405], [Math.PI / 2, 0, 0]);
    security.add(new THREE.SphereGeometry(.049, 12, 8), side < 0 ? "coolLight" : "warmLight", [x, 2.48, -42.385], [0, 0, 0], [1, 1, .32], false);
  }
  // An inset hood seam and sunlit enamel lip give the thick top its own planes.
  security.box([2.62, .075, .025], [1.3, 3.30, -42.425], "steel", [0, 0, 0], .018);
  security.box([2.40, .06, .035], [1.3, 3.40, -42.425], "ivory", [0, 0, 0], .018);

  // The existing conveyor remains open. A thick rounded collar, side service
  // pod and exposed cable conduits give the scanner a manufactured silhouette.
  security.add(frame(2.62, 2.30, .23, .33, .31), "ivory", [6.2, 1.40, -41.36]);
  security.add(frame(2.43, 2.10, .09, .23, .24), "steel", [6.2, 1.40, -41.20]);
  security.add(frame(2.08, 1.76, .07, .075, .15), "dark", [6.2, 1.40, -41.13]);
  security.box([.52, 1.45, 1.78], [7.70, 1.14, -43.1], "cyan", [0, 0, 0], .12);
  security.box([.08, .83, 1.18], [7.99, 1.15, -43.1], "dark", [0, 0, 0], .025);
  for (let n = 0; n < 8; n++) security.box([.045, .035, 1.0], [8.04, .86 + n * .085, -43.1], "steel");
  security.rod([7.71, .45, -42.37], [7.71, .27, -42.37], .045, "steel");
  security.rod([7.71, .27, -42.37], [7.71, .27, -44.5], .045, "steel");
  security.box([.39, .09, .24], [7.72, .30, -44.47], "ink", [0, 0, 0], .04);
  // Front emergency stop and a ribbed tread below the scanner's service door.
  security.add(new THREE.CylinderGeometry(.082, .082, .047, 14), "coral", [7.39, 1.91, -41.20], [Math.PI / 2, 0, 0]);
  security.add(new THREE.CylinderGeometry(.115, .115, .025, 14), "gold", [7.39, 1.91, -41.24], [Math.PI / 2, 0, 0]);
  for (let n = 0; n < 7; n++) security.box([.06, .025, .44], [7.54 + n * .09, .22, -42.65], "steel");

  // The tall return stack and inspection lamp are to the screen's right, clearly
  // visible from the authored .53 camera without covering the project image.
  const trayX = 8.17, trayZ = -39.95;
  security.box([1.34, .10, 1.03], [trayX, .32, trayZ], "dark", [0, 0, 0], .055);
  for (const x of [trayX - .53, trayX + .53]) for (const z of [trayZ - .37, trayZ + .37]) {
    wheel(security, x, .14, z, .12, .075);
    security.rod([x, .28, z], [x, 1.03, z], .035, "steel");
  }
  security.box([1.33, .07, .98], [trayX, 1.02, trayZ], "steel", [0, 0, 0], .04);
  for (let n = 0; n < 5; n++) emptyTray(security, trayX, 1.07 + n * .13, trayZ, n % 2 ? "ivory" : "cyan");
  for (const x of [trayX - .59, trayX + .59]) security.rod([x, .8, trayZ - .49], [x, 1.94, trayZ - .49], .025, "steel");
  security.rod([trayX - .59, 1.94, trayZ - .49], [trayX + .59, 1.94, trayZ - .49], .03, "dark");

  security.box([2.0, .10, 1.12], [9.05, 1.10, -42.04], "ivory", [0, 0, 0], .06);
  security.box([1.18, .97, .94], [9.38, .57, -42.04], "dark", [0, 0, 0], .09);
  for (let n = 0; n < 3; n++) {
    security.box([1.02, .23, .035], [9.38, .35 + n * .25, -41.55], "steel", [0, 0, 0], .025);
    security.rod([9.20, .38 + n * .25, -41.50], [9.56, .38 + n * .25, -41.50], .016, "gold");
  }
  security.rod([8.25, .05, -42.37], [8.25, 1.05, -42.37], .035, "steel");
  security.rod([8.25, .05, -41.7], [8.25, 1.05, -41.7], .035, "steel");
  security.add(new THREE.CylinderGeometry(.23, .27, .08, 20), "steel", [8.65, 1.19, -42.04]);
  const lampJoints: SetVector[] = [[8.65, 1.25, -42.04], [8.55, 2.05, -41.84], [7.73, 2.78, -41.24]];
  for (let n = 0; n < 2; n++) {
    security.rod(lampJoints[n], lampJoints[n + 1], .044, "dark");
    const a = lampJoints[n], b = lampJoints[n + 1];
    security.rod([a[0] + .07, a[1], a[2]], [b[0] + .07, b[1], b[2]], .019, "gold");
  }
  for (const point of lampJoints) security.add(new THREE.SphereGeometry(.085, 12, 8), "steel", point);
  security.add(new THREE.CylinderGeometry(.13, .31, .23, 20), "cyan", [7.73, 2.65, -41.24], [0, 0, .16]);
  security.add(new THREE.CylinderGeometry(.245, .245, .024, 20), "warmLight", [7.71, 2.53, -41.24], [0, 0, .16], [1, 1, 1], false);
  // A folded form tray, handheld wand and coiled lead are small functional details.
  security.box([.54, .055, .38], [9.18, 1.19, -41.92], "gold", [0, .14, 0], .025);
  for (let n = 0; n < 3; n++) security.box([.46, .008, .30], [9.16 + n * .012, 1.225 + n * .009, -41.90], "ivory", [0, .14, 0]);
  security.rod([9.65, 1.21, -42.20], [9.86, 1.21, -41.75], .042, "ink");
  security.add(new THREE.TorusGeometry(.15, .012, 5, 22), "ink", [9.66, 1.18, -42.22], [Math.PI / 2, 0, 0]);

  // Queue hardware lives well left of the detector and authored walking lane.
  for (const x of [-9.4, -5.2]) for (const z of [-36.2, -39.0, -41.8]) {
    security.add(new THREE.CylinderGeometry(.23, .26, .07, 16), "dark", [x, .045, z]);
    security.rod([x, .08, z], [x, 1.02, z], .036, "steel");
    security.add(new THREE.CylinderGeometry(.075, .075, .16, 14), "gold", [x, 1.03, z]);
  }
  for (const z of [-36.2, -39.0, -41.8]) security.box([4.15, .075, .025], [-7.3, 1.06, z], "coral");

  // Sculpted gate reader: weighted foot, tapered enclosure, angled scan head,
  // separate passport shelf and narrow luminous approval slit.
  gate.add(new THREE.CylinderGeometry(.38, .48, .10, 20), "dark", [2.75, .06, -97.5]);
  gate.add(new THREE.CylinderGeometry(.18, .29, 1.25, 6), "steel", [2.75, .70, -97.5], [0, Math.PI / 6, 0]);
  gate.box([.70, .47, .43], [2.75, 1.48, -97.49], "ivory", [-.22, 0, 0], .10);
  gate.box([.49, .26, .032], [2.75, 1.49, -97.253], "ink", [-.22, 0, 0], .04);
  gate.box([.29, .11, .012], [2.75, 1.47, -97.222], "cyan", [-.22, 0, 0], .025);
  gate.box([.57, .04, .42], [2.75, 1.10, -97.20], "dark", [0, 0, 0], .045);
  gate.add(new THREE.BoxGeometry(.45, .022, .022), "coolLight", [2.75, 1.28, -97.265], [0, 0, 0], [1, 1, 1], false);
  gate.rod([2.75, .14, -97.62], [2.75, 1.24, -97.62], .018, "gold");

  // Slatted privacy returns attach beside the existing desk, never to the gate aisle.
  for (const x of [-7.15, -2.85]) {
    gate.box([.14, .12, 1.72], [x, .08, -95.35], "dark", [0, 0, 0], .04);
    for (let n = 0; n < 9; n++) gate.box([.085, 1.57, .09], [x, .86, -96.10 + n * .185], n % 3 ? "walnut" : "gold", [0, -.20, 0], .015);
    gate.box([.14, .06, 1.75], [x, 1.67, -95.35], "steel", [0, 0, 0], .02);
  }
  gate.box([.60, .09, .43], [-5.76, 1.30, -94.9], "steel", [0, .12, 0], .035);
  gate.box([.46, .37, .12], [-5.76, 1.55, -95.02], "ink", [-.14, .12, 0], .045);
  gate.box([.35, .24, .022], [-5.75, 1.56, -94.948], "cyan", [-.14, .12, 0], .025);
  gate.box([.36, .17, .38], [-4.32, 1.33, -94.92], "ivory", [0, 0, 0], .035);
  gate.box([.29, .018, .12], [-4.32, 1.36, -94.718], "ink");
  gate.box([.21, .006, .21], [-4.32, 1.27, -94.58], "ivory", [-.12, 0, 0]);

  luggage(gate, 5.75, -91.15, "coral", .80);
  luggage(gate, -6.40, -91.10, "sage", .70);
  gate.add(new THREE.CapsuleGeometry(.20, .40, 4, 12), "dark", [5.74, 1.11, -91.15], [0, 0, Math.PI / 2]);
  gate.add(new THREE.TorusGeometry(.15, .018, 6, 18, Math.PI), "gold", [5.74, 1.34, -91.15]);

  // A real viewing scope on the right window ledge, aimed out over the apron.
  gate.add(new THREE.CylinderGeometry(.26, .32, .075, 18), "dark", [12.1, .07, -99.5]);
  gate.add(new THREE.CylinderGeometry(.06, .11, 1.28, 16), "steel", [12.1, .73, -99.5]);
  gate.add(new THREE.SphereGeometry(.13, 12, 8), "gold", [12.1, 1.38, -99.5]);
  for (const z of [-99.63, -99.37]) {
    gate.add(new THREE.CylinderGeometry(.105, .135, .62, 16), "steel", [12.28, 1.52, z], [0, 0, -Math.PI / 2]);
    gate.add(new THREE.CylinderGeometry(.075, .075, .09, 14), "ink", [11.94, 1.52, z], [0, 0, -Math.PI / 2]);
    gate.add(new THREE.CylinderGeometry(.112, .112, .025, 16), "cyan", [12.60, 1.52, z], [0, 0, -Math.PI / 2]);
  }
  gate.rod([12.22, 1.36, -99.70], [12.0, 1.22, -99.70], .025, "dark");

  // Low apron equipment stays below the aircraft silhouette and away from
  // the central jetway. Tug nose points +X; towbar reaches toward the nose gear.
  const tx = 5.4, tz = -128;
  apron.box([3.25, .46, 1.75], [tx, .63, tz], "gold", [0, 0, 0], .16);
  apron.box([3.49, .22, 1.85], [tx, .39, tz], "dark", [0, 0, 0], .08);
  apron.box([1.35, .42, 1.62], [tx + .73, 1.02, tz], "ivory", [0, 0, 0], .12);
  apron.box([1.12, .14, 1.82], [tx - .63, 2.06, tz], "gold", [0, 0, 0], .05);
  for (const x of [tx - 1.12, tx - .16]) for (const z of [tz - .78, tz + .78]) apron.rod([x, .85, z], [x, 2.01, z], .055, "steel");
  apron.box([.09, .79, 1.46], [tx - .18, 1.55, tz], "glass", [0, 0, -.08]);
  apron.box([.58, .23, .75], [tx - .69, 1.06, tz], "dark", [0, 0, 0], .06);
  apron.box([.13, .60, .75], [tx - 1.0, 1.35, tz], "dark", [0, 0, -.10], .05);
  apron.rod([tx - .33, 1.0, tz], [tx - .22, 1.46, tz], .035, "steel");
  apron.add(new THREE.TorusGeometry(.18, .023, 6, 16), "ink", [tx - .22, 1.46, tz], [0, Math.PI / 2 - .25, 0]);
  for (const x of [tx - 1.03, tx + 1.02]) for (const z of [tz - .89, tz + .89]) {
    apron.add(new THREE.CylinderGeometry(.33, .33, .22, 18), "ink", [x, .34, z], [Math.PI / 2, 0, 0]);
    apron.add(new THREE.CylinderGeometry(.17, .17, .235, 14), "steel", [x, .34, z], [Math.PI / 2, 0, 0]);
  }
  for (const z of [tz - .57, tz + .57]) apron.add(new THREE.CylinderGeometry(.105, .105, .04, 12), "warmLight", [tx + 1.65, .81, z], [0, 0, -Math.PI / 2], [1, 1, 1], false);
  apron.rod([tx - 1.76, .32, tz], [1.03, .32, tz], .085, "gold");
  apron.add(new THREE.CylinderGeometry(.15, .15, .10, 12), "steel", [tx - 1.76, .34, tz]);
  apron.rod([1.03, .32, tz], [.16, .34, tz - .30], .045, "steel");
  apron.rod([1.03, .32, tz], [.16, .34, tz + .30], .045, "steel");
  apron.add(new THREE.TorusGeometry(.12, .028, 6, 16), "steel", [.10, .34, tz], [Math.PI / 2, 0, 0]);

  // A baggage dolly with a folded weather cover and its own articulated hitch.
  const cx = -7.2, cz = -117.1;
  apron.box([3.8, .15, 2.0], [cx, .61, cz], "steel", [0, .06, 0], .06);
  for (const x of [cx - 1.25, cx + 1.25]) for (const z of [cz - .87, cz + .87]) {
    apron.add(new THREE.CylinderGeometry(.28, .28, .15, 16), "ink", [x, .29, z], [Math.PI / 2, 0, 0]);
    apron.add(new THREE.CylinderGeometry(.11, .11, .17, 12), "gold", [x, .29, z], [Math.PI / 2, 0, 0]);
  }
  for (const z of [cz - .96, cz + .96]) {
    apron.rod([cx - 1.8, .7, z], [cx - 1.8, 1.53, z], .042, "steel");
    apron.rod([cx + 1.8, .7, z], [cx + 1.8, 1.53, z], .042, "steel");
    apron.rod([cx - 1.8, 1.53, z], [cx + 1.8, 1.53, z], .04, "steel");
  }
  apron.box([2.9, .65, 1.40], [cx, 1.02, cz], "cyan", [0, .06, 0], .20);
  for (let n = 0; n < 4; n++) apron.box([.07, .69, 1.44], [cx - 1.1 + n * .73, 1.03, cz], "dark", [0, .06, 0], .02);
  apron.rod([cx + 1.94, .40, cz], [cx + 3.0, .25, cz + .36], .048, "gold");
  apron.add(new THREE.TorusGeometry(.11, .023, 6, 14), "steel", [cx + 3.05, .25, cz + .38], [Math.PI / 2, 0, 0]);

  const groups = [security.finish(), gate.finish(), apron.finish()];
  // One moving beacon lens gives the parked equipment a restrained live detail.
  const beaconGeometry = new THREE.CylinderGeometry(.065, .065, .13, 10, 1, false, 0, Math.PI * .75);
  const beacon = new THREE.Mesh(beaconGeometry, palette.warmLight);
  beacon.position.set(tx - .63, 2.23, tz); groups[2].add(beacon);
  beacon.userData.setMotion = {
    channels: [{ axis: "y", offset: 0, linear: 2.1 }],
    reducedRotation: [0, .5, 0],
  };
  return {
    groups,
    update(time, reduced) { beacon.rotation.y = reduced ? .5 : time * 2.1; },
    dispose() { if (disposed) return; disposed = true; beaconGeometry.dispose(); security.dispose(); gate.dispose(); apron.dispose(); },
  };
}
