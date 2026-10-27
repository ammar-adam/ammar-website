import * as THREE from "three";
import type { FilmMaterialPalette } from "./film-materials";
import { ensurePaintUV } from "./film-paint-uv";
import { createSetBuilder, type FilmSet, type SetMaterial, type SetVector } from "./film-set-builder";

export type FilmArtRoom = "checkin" | "security" | "concourse" | "gate";
type Builder = ReturnType<typeof createSetBuilder>;
type Local = ReturnType<typeof localSurface>;

/** A small local coordinate system for wall-mounted work. Paint charts are set
 * before the piece is rotated onto the wall, so brush direction follows form. */
function localSurface(set: Builder, origin: SetVector, rotation: SetVector = [0, 0, 0]) {
  const frame = new THREE.Matrix4().compose(new THREE.Vector3(...origin), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(1, 1, 1));
  const transform = new THREE.Object3D();
  const add = (geometry: THREE.BufferGeometry, material: SetMaterial, position: SetVector = [0, 0, 0], rotate: SetVector = [0, 0, 0], scale: SetVector = [1, 1, 1], cast = true) => {
    ensurePaintUV(geometry); transform.position.set(...position); transform.rotation.set(...rotate); transform.scale.set(...scale); transform.updateMatrix();
    geometry.applyMatrix4(transform.matrix).applyMatrix4(frame); set.add(geometry, material, [0, 0, 0], [0, 0, 0], [1, 1, 1], cast);
  };
  const box = (size: SetVector, position: SetVector, material: SetMaterial, rotate: SetVector = [0, 0, 0], cast = true) => add(new THREE.BoxGeometry(...size), material, position, rotate, [1, 1, 1], cast);
  const rod = (a: SetVector, b: SetVector, radius: number, material: SetMaterial, cast = true) => {
    const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b), axis = to.clone().sub(from);
    const shape = new THREE.CylinderGeometry(radius, radius, axis.length(), 8);
    shape.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.normalize()));
    add(shape, material, from.add(to).multiplyScalar(.5).toArray() as [number, number, number], [0, 0, 0], [1, 1, 1], cast);
  };
  return { add, box, rod };
}

function roundedPath(width: number, height: number, radius: number, path: THREE.Shape | THREE.Path) {
  const x = -width / 2, y = -height / 2;
  path.moveTo(x + radius, y); path.lineTo(x + width - radius, y); path.quadraticCurveTo(x + width, y, x + width, y + radius);
  path.lineTo(x + width, y + height - radius); path.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  path.lineTo(x + radius, y + height); path.quadraticCurveTo(x, y + height, x, y + height - radius);
  path.lineTo(x, y + radius); path.quadraticCurveTo(x, y, x + radius, y); path.closePath(); return path;
}
function relief(shape: THREE.Shape, depth: number, bevel = .018) {
  return new THREE.ExtrudeGeometry(shape, { depth, steps: 1, curveSegments: 5, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1 });
}
function frame(width: number, height: number, border: number, depth: number) {
  const shape = roundedPath(width, height, .16, new THREE.Shape()) as THREE.Shape;
  shape.holes.push(roundedPath(width - border * 2, height - border * 2, .09, new THREE.Path()));
  return relief(shape, depth);
}

/** A continuous relief, rather than scattered shapes: a low waterfront datum,
 * overlapping city masses and one slender tower align with the exterior's light. */
function cityRelief(surface: Local, width: number, height: number, version: number) {
  surface.box([width + .20, height + .20, .10], [0, 0, -.08], "dark", [0, 0, 0], false);
  surface.add(frame(width + .24, height + .24, .075, .07), "gold", [0, 0, -.025]);
  const profiles = [
    [.28, .37, .31, .48, .69, .42, .87, .56, .35, .46, .31],
    [.31, .46, .39, .58, .37, .76, .92, .61, .44, .55, .31],
    [.22, .37, .51, .33, .46, .60, .39, .72, .47, .32, .25],
  ];
  for (let layer = 0; layer < 2; layer++) {
    const levels = profiles[(version + layer) % profiles.length], cell = width / levels.length;
    const shape = new THREE.Shape(); shape.moveTo(-width / 2, -height * .42);
    levels.forEach((level, index) => {
      const x = -width / 2 + index * cell, y = -height * .30 + level * height * (layer ? .56 : .84);
      shape.lineTo(x, y); shape.lineTo(x + cell * .74, y); shape.lineTo(x + cell * .74, y - height * .09); shape.lineTo(x + cell, y - height * .09);
    });
    shape.lineTo(width / 2, -height * .42); shape.closePath();
    surface.add(relief(shape, layer ? .18 : .09), layer ? "ivory" : "steel", [0, 0, .02 + layer * .13]);
  }
  // One calm curved horizon is a carved ledge, never a floating swoosh.
  const shore = new THREE.Shape(); shore.moveTo(-width * .5, -height * .38);
  shore.quadraticCurveTo(-width * .12, -height * .19, width * .5, -height * .31);
  shore.lineTo(width * .5, -height * .37); shore.quadraticCurveTo(-width * .12, -height * .26, -width * .5, -height * .44); shore.closePath();
  surface.add(relief(shore, .10, .012), "walnut", [0, 0, .36]);
  const x = width * (version === 1 ? .18 : -.19), foot = -height * .25;
  surface.rod([x, foot, .44], [x, height * .42, .44], .025, "gold");
  const crown = Math.min(width * .036, height * .15);
  surface.add(new THREE.CylinderGeometry(crown, crown * 1.25, .08, 12), "gold", [x, height * .24, .44]);
  surface.box([width * .92, .035, .025], [0, -height * .45, .42], "gold");
}

/** Real recessed volume with a top diffuser, a shaped sill and a small original
 * architectural maquette. No extra lights, textures or emissive perimeter. */
function niche(surface: Local, width: number, height: number, version: number) {
  surface.box([width, height, .06], [0, 0, -.09], "dark", [0, 0, 0], false);
  surface.add(frame(width + .18, height + .18, .14, .38), "ivory", [0, 0, -.06]);
  surface.box([width * .79, .045, .21], [0, height * .5 - .11, .16], "warmLight", [0, 0, 0], false);
  surface.box([width * .85, .10, .41], [0, -height * .5 + .12, .12], "walnut");
  const floor = -height * .5 + .19;
  if (version === 0) {
    for (const [i, h] of [.56, 1.13, .79].entries()) {
      const x = (i - 1) * width * .20;
      surface.box([width * .17, h, .22], [x, floor + h / 2, .16], i === 1 ? "ivory" : "steel");
      surface.box([width * .18, .055, .25], [x, floor + h + .025, .16], "gold");
    }
    surface.rod([-width * .32, floor + .30, .31], [width * .31, floor + .64, .31], .035, "gold");
  } else if (version === 1) {
    const radius = Math.min(width * .31, height * .27);
    surface.add(new THREE.TorusGeometry(radius, .065, 6, 28, Math.PI * 1.64), "gold", [0, floor + radius + .12, .16], [0, .18, -.22]);
    surface.add(new THREE.SphereGeometry(radius * .37, 12, 8), "ivory", [radius * .22, floor + radius * .70, .17]);
    surface.box([radius * 1.70, .10, .29], [0, floor + .04, .16], "steel");
  } else {
    const arch = new THREE.Shape(); arch.moveTo(-width * .31, floor); arch.lineTo(-width * .31, floor + height * .47);
    arch.quadraticCurveTo(0, floor + height * .81, width * .31, floor + height * .47); arch.lineTo(width * .31, floor); arch.lineTo(width * .19, floor);
    arch.lineTo(width * .19, floor + height * .41); arch.quadraticCurveTo(0, floor + height * .62, -width * .19, floor + height * .41); arch.lineTo(-width * .19, floor); arch.closePath();
    surface.add(relief(arch, .19), "gold", [0, 0, .14]);
    surface.box([width * .29, height * .22, .23], [0, floor + height * .11, .16], "steel");
  }
}

/** Shaped acoustic/light baffles hang below the large vault. The folded edge
 * casts a broad shadow and the rods terminate at the existing roof profile. */
function ceilingBaffle(set: Builder, center: SetVector, width: number, depth: number, rise: number, finish: SetMaterial, yaw = 0) {
  const surface = localSurface(set, center, [0, yaw, 0]);
  const shape = new THREE.Shape(); shape.moveTo(-width * .5, 0);
  shape.quadraticCurveTo(-width * .20, rise * .95, width * .12, rise);
  shape.quadraticCurveTo(width * .36, rise * .90, width * .5, rise * .30);
  shape.lineTo(width * .5, rise * .30 - .15); shape.quadraticCurveTo(width * .36, rise * .90 - .15, width * .12, rise - .15);
  shape.quadraticCurveTo(-width * .20, rise * .95 - .15, -width * .5, -.15); shape.closePath();
  const geometry = relief(shape, depth, .025); geometry.translate(0, 0, -depth / 2);
  surface.add(geometry, finish);
  surface.box([width * .68, .026, depth * .36], [0, -.155 + rise * .74, 0], "gold", [0, 0, 0], false);
  for (const x of [-width * .32, width * .30]) {
    const worldX = center[0] + Math.cos(yaw) * x, roof = 8 + 3.6 * (1 - (worldX / 14) ** 2);
    surface.rod([x, rise + .06, 0], [x, roof - center[1] - .20, 0], .018, "steel", false);
  }
}

/** Four coordinated physical installations; call only as each room approaches.
 * Fixed geometry merges into a small number of palette/shadow batches per room. */
export function createFilmRoomArt(palette: FilmMaterialPalette, room: FilmArtRoom): FilmSet {
  const set = createSetBuilder(palette, `architectural-art-${room}`);
  const front = (position: SetVector) => localSurface(set, position);
  const left = (position: SetVector) => localSurface(set, position, [0, Math.PI / 2, 0]);

  if (room === "checkin") {
    // A folded canopy and tall city casting grow from the scale of the check-in
    // hall. Everything stops well before the right-hand exit x[8,13].
    for (let n = 0; n < 4; n++) ceilingBaffle(set, [-1.25 + n * .38, 6.8 + n * .14, -25.1 - n * 1.32], 12.4 - n * 1.0, .46, .68, n % 2 ? "ivory" : "steel", -.07);
    cityRelief(front([-2.15, 5.0, -30.47]), 16.0, 4.3, 0);
    cityRelief(left([-13.35, 4.20, -25.1]), 7.8, 3.9, 1);
    niche(left([-13.25, 3.40, -19.5]), 2.30, 3.1, 0);
  } else if (room === "security") {
    // The measured spacing echoes the screening lane's engineered rhythm.
    for (let n = 0; n < 5; n++) ceilingBaffle(set, [3.9, 6.85 + (n % 2) * .10, -39.9 - n * 1.48], 10.6, .34, .38, n % 2 ? "ivory" : "steel");
    cityRelief(front([4.50, 5.20, -48.47]), 14.8, 3.6, 1);
    const chart = left([-13.30, 4.0, -41.1]);
    cityRelief(chart, 7.5, 3.8, 2);
    niche(left([-13.25, 3.55, -35.4]), 2.4, 3.2, 1);
  } else if (room === "concourse") {
    // Paired fins and a continuous high frieze bind the three retail bays. They
    // remain above the signs and photographs, and leave the right glazing open.
    for (const z of [-58.5, -69.3, -80.0]) {
      ceilingBaffle(set, [-.8, 7.20, z], 9.2, .56, .60, "ivory", -.15);
      ceilingBaffle(set, [-.15, 7.58, z - 1.25], 7.9, .36, .48, "steel", -.15);
    }
    for (const [index, z] of [-61.22, -72.22, -83.22].entries()) cityRelief(front([-9.2, 5.83, z]), 8.25, .87, index);
    // These sit in the unused far-left ends of the kitchen and souvenir walls.
    niche(front([-12.40, 3.67, -61.12]), 1.55, 2.15, 2);
    niche(front([-12.40, 3.67, -83.12]), 1.55, 2.15, 0);
    cityRelief(left([-13.25, 7.38, -67.6]), 26.5, .82, 2);
    // Movie posters and 05 wayfinding end below y5; this upper relief clears both.
    cityRelief(front([-3.5, 7.05, -83.45]), 17.5, 1.55, 0);
  } else {
    // Quiet broad sails settle the final room. Rear detailing stays entirely on
    // the solid transom above y9, preserving glass, aircraft and painted skyline.
    ceilingBaffle(set, [-2.1, 7.20, -96.3], 12.6, .72, .58, "ivory", .08);
    ceilingBaffle(set, [-.8, 7.72, -99.1], 10.2, .43, .48, "steel", .08);
    cityRelief(left([-13.30, 4.2, -96.7]), 8.6, 4.4, 0);
    niche(left([-13.24, 3.55, -89.7]), 2.65, 3.35, 2);
    for (const x of [-6.9, 6.9]) cityRelief(front([x, 9.45, -103.82]), 4.4, .62, x < 0 ? 1 : 2);
    // Substantial collar pieces add depth to existing rear mullions, not glass.
    for (const x of [-10.5, -7, -3.5, 3.5, 7, 10.5]) {
      set.box([.24, .32, .27], [x, 9.21, -103.91], "ivory");
      set.box([.27, .055, .29], [x, 9.40, -103.90], "gold");
    }
  }

  const root = set.finish(); root.userData.architecturalArt = room;
  root.userData.drawCalls = root.children.length;
  root.userData.design = room === "checkin" ? "Folded city canopy" : room === "security" ? "Measured screening ribs" : room === "concourse" ? "Connected retail frieze" : "Quiet horizon sails";
  return { groups: [root], update() {}, dispose: set.dispose };
}
