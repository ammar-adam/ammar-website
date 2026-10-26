import * as THREE from "three";
import type { FilmMaterialPalette } from "./film-materials";
import { createSetBuilder, type FilmSet, type SetMaterial, type SetVector } from "./film-set-builder";

type Builder = ReturnType<typeof createSetBuilder>;
const lathe = (profile: number[][], segments = 16) => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);
function roundProfile(w: number, h: number, r: number) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
function extrusion(shape: THREE.Shape, depth: number, bevel = .015) {
  const g = new THREE.ExtrudeGeometry(shape, {depth, steps: 1, curveSegments: 6, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1});
  g.translate(0, 0, -depth / 2); return g;
}
function curve(builder: Builder, points: SetVector[], radius: number, material: SetMaterial) {
  builder.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), Math.max(8, points.length * 3), radius, 6, false), material);
}
function plate(b: Builder, x: number, y: number, z: number, radius = .23) {
  b.add(lathe([[0, 0], [.68, 0], [.94, .05], [1, .10], [.96, .13], [.73, .07], [0, .07]]), "ivory", [x, y, z], [0, 0, 0], [radius, radius, radius]);
}
function cup(b: Builder, x: number, y: number, z: number, material: SetMaterial = "ivory", size = 1) {
  b.add(lathe([[.063, 0], [.075, .015], [.091, .17], [.088, .182], [.073, .18], [.061, .026], [0, .026]], 14), material, [x, y, z], [0, 0, 0], [size, size, size]);
  b.add(new THREE.TorusGeometry(.052 * size, .013 * size, 5, 12), material, [x + .098 * size, y + .102 * size, z]);
  b.add(new THREE.CircleGeometry(.071 * size, 14), "sage", [x, y + .165 * size, z], [-Math.PI / 2, 0, 0], [1, 1, 1], false);
}
function book(b: Builder, x: number, y: number, z: number, w: number, d: number, material: SetMaterial, yaw = 0) {
  b.box([w, .045, d], [x, y + .032, z], "ivory", [0, yaw, 0]);
  for (const offset of [0, .062]) b.box([w + .018, .012, d + .025], [x, y + offset, z], material, [0, yaw, 0]);
}
function countertopMenu(b: Builder, x: number, z: number, material: SetMaterial) {
  b.add(extrusion(roundProfile(.61, .83, .045), .032), material, [x, 1.77, z], [-.15, 0, 0]);
  b.rod([x - .23, 1.32, z - .23], [x - .23, 2.14, z + .03], .015, "gold");
  b.rod([x + .23, 1.32, z - .23], [x + .23, 2.14, z + .03], .015, "gold");
  for (let line = 0; line < 5; line++) b.box([line === 0 ? .34 : .40 - line * .025, .012, .006], [x - .035, 2.02 - line * .105, z + .055], line === 0 ? "gold" : "ivory");
}

// Reframe a complete prop cluster without splitting its physical relationships.
function offsetBuilder(b: Builder, dx: number, dz: number): Builder {
  const point = (v: SetVector): SetVector => [v[0] + dx, v[1], v[2] + dz];
  return { ...b,
    add: (g, m, p = [0, 0, 0], r = [0, 0, 0], scale = [1, 1, 1], cast = true) => b.add(g, m, point(p), r, scale, cast),
    box: (size, p, m, r = [0, 0, 0], bevel = 0) => b.box(size, point(p), m, r, bevel),
    rod: (a, c, radius, m) => b.rod(point(a), point(c), radius, m),
  };
}
function returnCounter(b: Builder, x: number, z: number, width: number, depth: number, material: SetMaterial) {
  // Rounded, floor-supported end cap: the display is part of a real service desk.
  b.add(extrusion(roundProfile(width - .14, depth - .14, .30), .12, .015), "dark", [x, .20, z], [Math.PI / 2, 0, 0]);
  b.add(extrusion(roundProfile(width - .08, depth - .08, .32), 1.02, .02), material, [x, .74, z], [Math.PI / 2, 0, 0]);
  b.add(extrusion(roundProfile(width, depth, .34), .04, .008), "gold", [x, 1.245, z], [Math.PI / 2, 0, 0]);
  b.add(extrusion(roundProfile(width + .025, depth + .025, .35), .07, .012), "ivory", [x, 1.285, z], [Math.PI / 2, 0, 0]);
  for (let flute = 0; flute < 7; flute++) {
    const at = z - depth * .28 + flute * depth * .56 / 6;
    b.rod([x + width * .5 - .035, .39, at], [x + width * .5 - .035, 1.13, at], .015, "gold");
  }
}

/** Tangible retail interiors, kept below or above the existing photo rail.
 * Every static part merges by material; only the postcard spindle moves.
 */
export function createConcourseSet(palette: FilmMaterialPalette): FilmSet {
  const kitchen = createSetBuilder(palette, "concourse-kitchen-props");
  const cafe = createSetBuilder(palette, "concourse-cafe-props");
  const news = createSetBuilder(palette, "concourse-newsstand-props");
  const cards = createSetBuilder(palette, "concourse-postcard-spindle");

  // Recessed refrigerator: a real cavity, shelves, inset glazing and proud handle.
  const fx = -7.95, fz = -60.05;
  for (const x of [fx - .79, fx + .79]) kitchen.box([.065, 2.11, .72], [x, 1.18, fz], "steel", [0, 0, 0], .018);
  for (const y of [.16, 2.20]) kitchen.box([1.64, .07, .72], [fx, y, fz], "steel", [0, 0, 0], .018);
  kitchen.box([1.51, 1.97, .045], [fx, 1.20, fz - .34], "ink");
  for (const y of [.57, 1.13, 1.69]) {
    kitchen.box([1.27, .035, .49], [fx, y, fz + .18], "ivory");
    for (let bottle = 0; bottle < 4; bottle++) {
      const x = fx - .47 + bottle * .31;
      kitchen.add(lathe([[.065, 0], [.075, .04], [.073, .26], [.039, .31], [.027, .36], [.027, .41]], 10), bottle % 2 ? "cyan" : "sage", [x, y + .022, fz + .31]);
      kitchen.add(new THREE.CylinderGeometry(.03, .03, .024, 10), "gold", [x, y + .447, fz + .31]);
    }
  }
  kitchen.add(new THREE.BoxGeometry(1.43, 1.82, .024), "glass", [fx, 1.20, fz + .45], [0, 0, 0], [1, 1, 1], false);
  for (const x of [fx - .74, fx + .74]) kitchen.box([.055, 1.91, .06], [x, 1.20, fz + .49], "steel");
  kitchen.rod([fx + .53, .92, fz + .58], [fx + .53, 1.53, fz + .58], .026, "gold");
  kitchen.box([1.34, .025, .025], [fx, 2.10, fz + .48], "coolLight");
  // Bread basket, folded paper and a working cutting board on the existing top.
  returnCounter(kitchen, -5.50, -54.31, 1.90, 1.16, "coral");
  const bread = offsetBuilder(kitchen, 5.40, 2.29);
  bread.add(lathe([[0, 0], [.44, 0], [.62, .14], [.65, .23], [.61, .25], [.57, .16], [.41, .035], [0, .035]], 18), "walnut", [-10.90, 1.32, -56.60], [0, .12, 0], [1, 1, .64]);
  for (let loaf = 0; loaf < 5; loaf++) {
    const x = -11.24 + loaf * .17, yaw = -.35 + loaf * .17;
    bread.add(new THREE.SphereGeometry(1, 10, 6), loaf % 2 ? "gold" : "ivory", [x, 1.54 + (loaf % 2) * .05, -56.59], [0, yaw, .09], [.13, .075, .29]);
    bread.rod([x - .05, 1.61 + (loaf % 2) * .05, -56.68], [x + .03, 1.61 + (loaf % 2) * .05, -56.57], .009, "walnut");
  }
  kitchen.box([.86, .055, .55], [-8.95, 1.35, -56.50], "walnut", [0, -.10, 0], .035);
  const knife = new THREE.Shape(); knife.moveTo(-.25, -.035); knife.lineTo(.18, -.035); knife.lineTo(.27, .025); knife.lineTo(-.25, .06); knife.closePath();
  kitchen.add(extrusion(knife, .012, 0), "steel", [-8.99, 1.39, -56.49], [-Math.PI / 2, 0, -.12]);
  kitchen.box([.20, .055, .07], [-9.29, 1.40, -56.47], "ink", [0, -.12, 0], .015);
  for (let n = 0; n < 4; n++) plate(kitchen, -9.95, 1.32 + n * .035, -56.50, .25);
  kitchen.box([.31, .025, .32], [-8.25, 1.35, -56.55], "ivory", [0, .22, 0]);
  kitchen.box([.32, .018, .15], [-8.25, 1.38, -56.52], "ivory", [.12, .22, 0]);
  countertopMenu(kitchen, -7.35, -56.42, "dark");
  // A curved prep rack carries cookware behind the counter, below the pictures.
  for (const x of [-12.15, -10.35]) kitchen.rod([x, .18, -59.13], [x, 1.98, -59.13], .032, "steel");
  kitchen.rod([-12.15, 1.98, -59.13], [-10.35, 1.98, -59.13], .028, "gold");
  for (let n = 0; n < 3; n++) {
    const x = -11.85 + n * .58;
    kitchen.add(new THREE.TorusGeometry(.055, .008, 5, 10), "steel", [x, 1.92, -59.13]);
    kitchen.rod([x, 1.87, -59.13], [x, 1.52, -59.13], .025, "walnut");
    kitchen.add(new THREE.SphereGeometry(1, 10, 6), "steel", [x, 1.40, -59.13], [0, 0, 0], [.13, .17, .028]);
  }

  // Curved metal service canopy, suspended above the photo rail's upper edge.
  cafe.add(extrusion(roundProfile(5.45, 1.48, .60), .22, .025), "cyan", [-9.45, 5.03, -67.60], [Math.PI / 2, 0, 0]);
  cafe.add(extrusion(roundProfile(5.20, 1.25, .50), .025, .008), "gold", [-9.45, 4.90, -67.60], [Math.PI / 2, 0, 0]);
  cafe.box([4.47, .018, .57], [-9.45, 4.875, -67.60], "warmLight");
  for (const x of [-11.65, -7.25]) for (const z of [-67.94, -67.28]) cafe.rod([x, 5.11, z], [x, 6.50, z], .024, "steel");
  // Espresso body already exists. Add group heads, gauges, portafilters and steam.
  for (const x of [-11.02, -10.50]) {
    cafe.add(new THREE.CylinderGeometry(.12, .13, .10, 14), "steel", [x, 1.73, -66.56], [Math.PI / 2, 0, 0]);
    cafe.rod([x, 1.71, -66.52], [x, 1.65, -66.20], .037, "ink");
    cafe.add(new THREE.TorusGeometry(.082, .015, 6, 14), "gold", [x, 1.98, -66.60]);
    cafe.add(new THREE.CircleGeometry(.068, 14), "ivory", [x, 1.98, -66.595], [0, 0, 0], [1, 1, 1], false);
    cafe.rod([x, 1.98, -66.575], [x + .035, 2.015, -66.575], .007, "ink");
  }
  curve(cafe, [[-10.12, 1.91, -66.62], [-10.02, 1.78, -66.38], [-10.06, 1.47, -66.37]], .016, "steel");
  for (const z of [-67.32, -66.72]) cafe.rod([-11.22, 2.29, z], [-10.19, 2.29, z], .018, "gold");
  for (let n = 0; n < 3; n++) cup(cafe, -11.02 + n * .30, 2.23, -67.0, "ivory", .82);
  // A proper grinder has a hopper, throat, catch fork and a rounded motor housing.
  returnCounter(cafe, -5.50, -70.05, 1.90, 2.45, "cyan");
  const grinder = offsetBuilder(cafe, 6.18, -2.25);
  grinder.add(lathe([[.13, 0], [.18, .06], [.16, .40], [.10, .46]], 16), "coral", [-11.74, 1.32, -67.0]);
  grinder.add(lathe([[.07, 0], [.08, .14], [.22, .21], [.24, .48], [.20, .52]], 16), "glass", [-11.74, 1.75, -67.0], [0, 0, 0], [1, 1, 1], false);
  grinder.add(new THREE.CylinderGeometry(.16, .07, .22, 16), "walnut", [-11.74, 2.01, -67.0]);
  grinder.add(new THREE.CylinderGeometry(.22, .24, .035, 16), "ink", [-11.74, 2.29, -67.0]);
  grinder.rod([-11.84, 1.59, -66.84], [-11.84, 1.59, -66.64], .018, "steel");
  grinder.rod([-11.65, 1.59, -66.84], [-11.65, 1.59, -66.64], .018, "steel");
  // A sloped pastry case is a cavity with two shelves and a rounded glass nose.
  const pastry = offsetBuilder(cafe, 2.13, -3.00);
  pastry.box([1.74, .07, .80], [-7.63, 1.34, -67.58], "walnut", [0, 0, 0], .025);
  pastry.box([1.65, .035, .64], [-7.63, 1.71, -67.63], "ivory");
  pastry.box([1.72, .035, .72], [-7.63, 2.03, -67.67], "gold");
  pastry.add(new THREE.BoxGeometry(1.68, .69, .022), "glass", [-7.63, 1.70, -67.16], [-.18, 0, 0], [1, 1, 1], false);
  for (const x of [-8.50, -6.76]) {
    pastry.add(new THREE.BoxGeometry(.027, .69, .71), "glass", [x, 1.70, -67.58], [0, 0, 0], [1, 1, 1], false);
    pastry.rod([x, 1.37, -67.12], [x, 2.04, -67.24], .019, "steel");
  }
  for (let n = 0; n < 6; n++) {
    const x = -8.18 + (n % 3) * .54, y = n < 3 ? 1.43 : 1.80;
    plate(pastry, x, y - .055, -67.50, .19);
    pastry.add(new THREE.TorusGeometry(.105, .045, 6, 12, Math.PI * 1.45), "gold", [x, y, -67.50], [-Math.PI / 2, 0, .25], [1.25, .65, 1]);
  }
  cup(cafe, -5.08, 1.325, -69.40, "ivory", .90);
  plate(cafe, -5.08, 1.321, -69.40, .16);
  // Things left in use, rather than decorative labels, make the seating inhabited.
  for (const [x, z] of [[6.1, -66.5], [6.4, -70.5], [5.8, -63.3]]) {
    plate(cafe, x - .23, 1.087, z + .14, .14); cup(cafe, x - .23, 1.11, z + .14, "ivory", .78);
    book(cafe, x + .19, 1.09, z - .08, .28, .36, "coral", .25);
  }
  curve(cafe, [[6.32, 1.13, -66.85], [6.45, 1.23, -66.86], [6.61, 1.23, -66.82], [6.70, 1.13, -66.77]], .018, "ink");
  for (const x of [6.32, 6.70]) cafe.add(new THREE.SphereGeometry(1, 10, 6), "dark", [x, 1.14, -66.79], [0, 0, 0], [.048, .06, .072]);

  // A low sculpted souvenir plinth leaves all three photographs unobstructed.
  returnCounter(news, -5.50, -81.35, 2.05, 1.30, "dark");
  const display = offsetBuilder(news, 2.22, -2.95);
  display.add(extrusion(roundProfile(2.05, .94, .28), .16, .025), "walnut", [-7.72, 1.40, -78.58], [Math.PI / 2, 0, 0]);
  // YYZ tower, Dubai's stepped spire and Karachi's domed mausoleum are objects.
  const towers = [[-8.35, 1.51, -78.58], [-7.72, 1.51, -78.58], [-7.04, 1.51, -78.58]] as const;
  const [tx, ty, tz] = towers[0];
  display.add(new THREE.CylinderGeometry(.10, .15, .045, 14), "dark", [tx, ty, tz]);
  display.add(lathe([[.048, 0], [.029, .44], [.025, .70], [.01, .87]], 12), "ivory", [tx, ty + .023, tz]);
  display.add(lathe([[.035, 0], [.12, .035], [.12, .075], [.035, .11]], 14), "gold", [tx, ty + .52, tz]);
  const [dx, dy, dz] = towers[1];
  for (let tier = 0; tier < 5; tier++) display.add(new THREE.CylinderGeometry(.105 - tier * .017, .12 - tier * .017, .145, 6), tier % 2 ? "cyan" : "steel", [dx, dy + .0725 + tier * .132, dz]);
  display.rod([dx, dy + .64, dz], [dx, dy + .84, dz], .009, "gold");
  const [kx, ky, kz] = towers[2];
  display.box([.38, .035, .36], [kx, ky, kz], "dark", [0, 0, 0], .025);
  display.box([.29, .28, .27], [kx, ky + .16, kz], "ivory", [0, 0, 0], .025);
  display.add(new THREE.SphereGeometry(.17, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), "ivory", [kx, ky + .30, kz], [0, 0, 0], [1, .76, 1]);
  for (const offset of [-.075, .075]) display.box([.045, .15, .008], [kx + offset, ky + .14, kz + .142], "dark");
  for (let n = 0; n < 5; n++) book(news, -10.43 + (n % 2) * .09, 1.32 + n * .07, -78.45, .54, .68, n % 2 ? "cyan" : "coral", -.12 + n * .06);
  book(news, -11.41, 1.32, -78.40, .44, .61, "gold", .18);
  countertopMenu(news, -11.30, -78.55, "dark");
  // Freestanding postcard carousel: wire pockets, card thickness and central axle.
  news.add(lathe([[0, 0], [.49, 0], [.47, .06], [.20, .13], [.06, .18]], 18), "dark", [-5.65, .13, -79.55]);
  news.rod([-5.65, .20, -79.55], [-5.65, 2.20, -79.55], .026, "steel");
  for (let side = 0; side < 4; side++) {
    const yaw = side * Math.PI / 2 + .22, normal = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    for (let row = 0; row < 3; row++) {
      const y = .87 + row * .43, x = normal.x * .35, z = normal.z * .35;
      cards.box([.48, .31, .018], [x, y, z], "ivory", [0, yaw, 0]);
      cards.box([.39, .18, .008], [x + normal.x * .014, y + .018, z + normal.z * .014], row === 0 ? "cyan" : row === 1 ? "coral" : "gold", [0, yaw, 0]);
      const tangent = new THREE.Vector3(normal.z, 0, -normal.x);
      const a: SetVector = [x - tangent.x * .26 + normal.x * .035, y - .13, z - tangent.z * .26 + normal.z * .035];
      const b: SetVector = [x + tangent.x * .26 + normal.x * .035, y - .13, z + tangent.z * .26 + normal.z * .035];
      cards.rod(a, b, .012, "gold");
      for (const sign of [-1, 1]) cards.rod([x + tangent.x * .26 * sign, y - .13, z + tangent.z * .26 * sign], [x + tangent.x * .26 * sign, y + .13, z + tangent.z * .26 * sign], .010, "steel");
    }
  }
  const cardGroup = cards.finish(); cardGroup.position.set(-5.65, 0, -79.55);
  cardGroup.userData.setMotion = {
    channels: [{ axis: "y", offset: 0, amplitude: .16, frequency: .12, phase: 0 }],
    reducedRotation: [0, 0, 0],
  };
  const groups = [kitchen.finish(), cafe.finish(), news.finish()]; groups[2].add(cardGroup);
  return { groups, update(time, reduced) { cardGroup.rotation.y = reduced ? 0 : Math.sin(time * .12) * .16; }, dispose() { kitchen.dispose(); cafe.dispose(); news.dispose(); cards.dispose(); } };
}
