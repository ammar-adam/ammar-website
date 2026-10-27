import * as THREE from "three";
import type { FilmMaterialPalette } from "./film-materials";
import type { FilmSet } from "./film-set-builder";
import { ensurePaintUV } from "./film-paint-uv";
import { createReferenceAssembly, printBase, printText, REFERENCE_BLUE, REFERENCE_CREAM, REFERENCE_GOLD, REFERENCE_INK, type PropReference } from "./film-reference-props";

/** Personal belongings occupy an inspection return and the waiting bench. The
 * four project trays and their conveyor route remain clear. */
export function createSecurityReferences(palette: FilmMaterialPalette, references: readonly PropReference[], invalidate: () => void): FilmSet {
  const assemblies: ReturnType<typeof createReferenceAssembly>[] = [];
  const animatedGeometry: THREE.BufferGeometry[] = [];
  let bat: THREE.Group | undefined;
  const add = (id: string, build: (assembly: ReturnType<typeof createReferenceAssembly>) => void) => {
    const row = references.find(reference => reference.id === id); if (!row) return;
    const assembly = createReferenceAssembly(palette, row); build(assembly); assembly.finish(); assemblies.push(assembly);
  };

  add("security-bat-flip", ({ root, set }) => {
    // A short return belt is physically separate from the project-bearing lane.
    set.box([.91, .15, 1.56], [0, .75, 0], "dark", [0, 0, 0], .07);
    for (const side of [-1, 1]) {
      set.box([.06, .16, 1.58], [side * .47, .80, 0], "ivory", [0, 0, 0], .02);
      for (const z of [-.57, .57]) set.rod([side * .35, .04, z], [side * .35, .69, z], .035, "steel");
    }
    for (let roller = 0; roller < 10; roller++) set.rod([-.41, .85, -.68 + roller * .15], [.41, .85, -.68 + roller * .15], .034, "steel");
    bat = new THREE.Group(); bat.name = "bautista-bat-flip"; root.add(bat); bat.position.set(0, 1.45, .15);
    const points = [[.025, -.55], [.036, -.53], [.023, -.48], [.022, -.24], [.035, -.08], [.067, .20], [.075, .42], [.067, .51], [.03, .55]].map(([radius, y]) => new THREE.Vector2(radius, y));
    const bodyGeometry = ensurePaintUV(new THREE.LatheGeometry(points, 12)); animatedGeometry.push(bodyGeometry);
    const body = new THREE.Mesh(bodyGeometry, palette.walnut); body.castShadow = body.receiveShadow = true; bat.add(body);
    const gripGeometry = ensurePaintUV(new THREE.CylinderGeometry(.026, .026, .30, 12)); animatedGeometry.push(gripGeometry);
    const grip = new THREE.Mesh(gripGeometry, palette.ink); grip.position.y = -.34; grip.castShadow = grip.receiveShadow = true; bat.add(grip);
    const bandGeometry = ensurePaintUV(new THREE.CylinderGeometry(.028, .028, .025, 12)); animatedGeometry.push(bandGeometry);
    const band = new THREE.Mesh(bandGeometry, palette.gold); band.position.y = -.18; bat.add(band);
  });

  add("security-corner-newspaper", ({ set, print }) => {
    // A compact bench stays to the right of the detector and outside the aisle.
    set.box([1.44, .10, .63], [0, .49, .05], "walnut", [0, 0, 0], .035);
    for (const x of [-.54, .54]) {
      set.rod([x, .06, .24], [x, .49, .24], .035, "steel"); set.rod([x, .06, -.18], [x, 1.11, -.18], .035, "steel");
    }
    set.box([1.42, .31, .055], [0, .96, -.18], "walnut", [0, 0, 0], .03);
    // One folded paper lies on the seat, below the project screen sightline.
    set.box([.56, .39, .010], [-.15, .551, .06], "ivory", [-Math.PI / 2, 0, .06]);
    print(.54, .37, (ctx, w, h) => {
      printBase(ctx, w, h); ctx.fillStyle = REFERENCE_INK; ctx.fillRect(w * .065, h * .04, w * .87, h * .015);
      printText(ctx, "CORNER", h * .205, w * .065, h * .18);
      printText(ctx, "TAKEN QUICKLY", h * .16, w * .065, h * .39);
      ctx.fillStyle = REFERENCE_BLUE; ctx.fillRect(w * .065, h * .53, w * .39, h * .36);
      ctx.strokeStyle = REFERENCE_GOLD; ctx.lineWidth = 3; ctx.strokeRect(w * .11, h * .59, w * .28, h * .21);
      for (let column = 0; column < 2; column++) for (let line = 0; line < 6; line++) { ctx.fillStyle = REFERENCE_INK; ctx.fillRect(w * (.52 + column * .225), h * (.55 + line * .061), w * .17, h * .009); }
      ctx.fillStyle = "rgba(13,15,31,.12)"; ctx.fillRect(w * .49, 0, w * .012, h);
    }, [{ text: "CORNER", height: .076, center: [-.05, .118, 0] }, { text: "TAKEN QUICKLY", height: .059, center: [0, .041, 0] }], [-.15, .559, .06], [-Math.PI / 2, 0, .06]);
    // The corner flag leans beside the bench, entirely below its backrest.
    // Its former tall pole intruded into the project-photo sightline.
    set.add(new THREE.CylinderGeometry(.095, .13, .045, 12), "steel", [.95, .03, -.20]);
    set.rod([.95, .05, -.20], [.81, .96, -.20], .014, "ivory");
    const flag = new THREE.Shape(); flag.moveTo(0, 0); flag.lineTo(.30, -.045); flag.lineTo(.02, -.22); flag.closePath();
    set.add(new THREE.ExtrudeGeometry(flag, { depth: .012, bevelEnabled: false, steps: 1 }), "coral", [.81, .96, -.19]);
  });

  add("security-cap-wand", ({ set }) => {
    set.box([.88, .035, .59], [0, .025, 0], "ivory", [0, 0, 0], .045);
    for (const x of [-.44, .44]) set.box([.035, .13, .59], [x, .085, 0], "steel", [0, 0, 0], .018);
    for (const z of [-.295, .295]) set.box([.85, .13, .035], [0, .085, z], "steel", [0, 0, 0], .018);
    set.add(new THREE.SphereGeometry(.20, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), "cyan", [-.14, .08, -.02], [0, -.22, 0], [1, .80, 1]);
    const brim = new THREE.Shape(); brim.absellipse(0, 0, .22, .16, 0, Math.PI * 2, false, 0);
    set.add(new THREE.ExtrudeGeometry(brim, { depth: .014, bevelEnabled: false }), "cyan", [-.14, .07, .12], [-Math.PI / 2, 0, 0]);
    set.add(new THREE.SphereGeometry(.022, 8, 6), "dark", [-.14, .245, -.02]);
    set.rod([.16, .10, -.25], [.35, .10, .22], .016, "walnut");
    set.rod([.29, .10, .08], [.35, .10, .22], .025, "dark");
    for (let ring = 0; ring < 3; ring++) set.add(new THREE.SphereGeometry(.027, 8, 5), "gold", [.30 + ring * .016, .10, .10 + ring * .04]);
  });

  add("security-yellow-umbrella", ({ set }) => {
    set.rod([0, .06, 0], [.16, 1.48, 0], .014, "steel");
    set.add(new THREE.ConeGeometry(.14, 1.07, 8), "gold", [.07, .63, 0], [0, 0, -.11]);
    for (let n = 0; n < 5; n++) { const angle = n / 5 * Math.PI * 2; set.rod([.015, .12, 0], [.105 + Math.cos(angle) * .11, 1.09, Math.sin(angle) * .11], .004, "walnut"); }
    set.add(new THREE.TorusGeometry(.082, .023, 7, 14, Math.PI * 1.25), "dark", [.225, 1.48, 0], [0, 0, -.11]);
    set.box([.25, .035, .22], [0, .025, 0], "steel", [0, 0, 0], .025);
  });

  add("security-xray-biscuits", ({ set, print }) => {
    set.rod([0, .04, -.08], [0, .63, -.08], .04, "steel");
    set.box([.48, .06, .36], [0, .035, -.08], "dark", [0, 0, 0], .03);
    set.box([1.18, .85, .11], [0, .68, -.03], "ink", [0, 0, 0], .045);
    print(1.06, .73, (ctx, w, h) => {
      printBase(ctx, w, h, true);
      ctx.strokeStyle = REFERENCE_BLUE; ctx.lineWidth = 4; ctx.strokeRect(w * .07, h * .10, w * .86, h * .79);
      ctx.fillStyle = REFERENCE_BLUE; ctx.fillRect(w * .15, h * .23, w * .70, h * .54);
      // Plain typesetting is deliberately unlike a commercial wrapper logo.
      printText(ctx, "Oreo", h * .23, w * .23, h * .43, REFERENCE_CREAM);
      ctx.fillStyle = REFERENCE_INK; ctx.beginPath(); ctx.ellipse(w * .69, h * .65, w * .085, h * .052, -.15, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = REFERENCE_CREAM; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w * .61, h * .66); ctx.lineTo(w * .77, h * .64); ctx.stroke();
    }, [{ text: "Oreo", height: .168, center: [-.16, .051, 0] }], [0, .68, .03], [0, 0, 0], true);
  });

  let lastFrame = -1;
  const update = (time: number, reduced: boolean) => {
    const frame = reduced ? 0 : Math.floor(time * 12); if (frame === lastFrame) return; lastFrame = frame;
    if (bat) { const cycle = (frame / 12 * .38) % 1; bat.rotation.set(.12, -.18, -.85 + cycle * Math.PI * 2); bat.position.y = 1.40 + Math.sin(cycle * Math.PI) * .22; }
  };
  update(0, true); queueMicrotask(invalidate);
  return { groups: assemblies.map(assembly => assembly.root), update, dispose() { assemblies.forEach(assembly => assembly.dispose()); animatedGeometry.forEach(geometry => geometry.dispose()); } };
}
