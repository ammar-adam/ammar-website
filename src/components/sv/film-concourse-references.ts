import * as THREE from "three";
import type { FilmMaterialPalette } from "./film-materials";
import { createSetBuilder, type FilmSet, type SetMaterial, type SetVector } from "./film-set-builder";
import { ensurePaintUV } from "./film-paint-uv";
import { protectFilmRegistration } from "./terminal-post";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/** Structural subset of the central reference registry. No copy lives in this factory. */
export type ConcourseReference = {
  id: string; stop: string; position: SetVector; rotation: SetVector; scale: SetVector;
  priority: "A" | "B"; note: string; text?: readonly string[]; art?: readonly string[]; dwell?: number;
};
type Builder = ReturnType<typeof createSetBuilder>;
type Rig = { root: THREE.Group; torso: THREE.Mesh; head: THREE.Group; leftLeg: THREE.Group; rightLeg: THREE.Group; leftArm: THREE.Group; rightArm: THREE.Group };
const C = { cream: "#f4ecd8", ink: "#0d0f1f", shadow: "#2b3566", blue: "#3a4f8a", warm: "#ffb46a", gold: "#ffd9a0", red: "#ec4e3c" };
const lathe = (points: readonly (readonly [number, number])[], segments = 14) => new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments);

/** Original objects, allusions and quiet airport signs. Loaded only for the concourse. */
export async function createConcourseReferences(palette: FilmMaterialPalette, references: readonly ConcourseReference[], invalidate: () => void): Promise<FilmSet> {
  const records = new Map(references.filter(item => item.stop === "concourse").map(item => [item.id, item]));
  const groups: THREE.Group[] = [], builders: Builder[] = [];
  const geometry = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
  const instances: THREE.InstancedMesh[] = [], animated: ((time: number) => void)[] = [], repaint: (() => void)[] = [];
  let disposed = false;
  const construction: (() => void)[] = [];
  const yieldTask = () => {
    const scheduler = (globalThis as typeof globalThis & { scheduler?: { yield: () => Promise<void> } }).scheduler;
    return scheduler?.yield ? scheduler.yield() : new Promise<void>(resolve => setTimeout(resolve, 0));
  };
  const keep = <T extends THREE.BufferGeometry>(item: T) => { ensurePaintUV(item); geometry.add(item); return item; };
  const sphere = keep(new THREE.SphereGeometry(1, 12, 8));
  const cylinder = keep(new THREE.CylinderGeometry(1, 1, 1, 12));
  const plane = keep(new THREE.PlaneGeometry(1, 1));
  const paletteMaterials = new Set<THREE.Material>(Object.values(palette));
  const moving = (object: THREE.Object3D) => { object.userData.referenceAnimated = true; return object; };
  function combineShared(parent: THREE.Object3D) {
    parent.updateMatrixWorld(true);
    const inverse = parent.matrixWorld.clone().invert(), transform = new THREE.Matrix4();
    const batches = new Map<string, { material: THREE.Material; cast: boolean; receive: boolean; sources: THREE.BufferGeometry[]; objects: THREE.Mesh[] }>();
    parent.traverse(object => {
      if (object === parent || !(object instanceof THREE.Mesh) || object instanceof THREE.InstancedMesh || Array.isArray(object.material) || !paletteMaterials.has(object.material)) return;
      for (let ancestor: THREE.Object3D | null = object; ancestor && ancestor !== parent; ancestor = ancestor.parent) if (ancestor.userData.referenceAnimated) return;
      const key = `${object.material.uuid}:${object.castShadow}:${object.receiveShadow}`;
      let batch = batches.get(key); if (!batch) { batch = { material: object.material, cast: object.castShadow, receive: object.receiveShadow, sources: [], objects: [] }; batches.set(key, batch); }
      const source = object.geometry.index ? object.geometry.toNonIndexed() : new THREE.BufferGeometry().copy(object.geometry);
      ensurePaintUV(source); for (const name of Object.keys(source.attributes)) if (!["position", "normal", "paintUV"].includes(name)) source.deleteAttribute(name);
      transform.multiplyMatrices(inverse, object.matrixWorld); source.applyMatrix4(transform);
      batch.sources.push(source); batch.objects.push(object);
    });
    for (const batch of batches.values()) {
      const combined = mergeGeometries(batch.sources, false); batch.sources.forEach(source => source.dispose());
      if (!combined) throw new Error("Reference material batches have incompatible geometry attributes.");
      geometry.add(combined); combined.computeBoundingBox(); combined.computeBoundingSphere();
      const result = new THREE.Mesh(combined, batch.material); result.castShadow = batch.cast; result.receiveShadow = batch.receive;
      result.name = "reference-material-batch"; batch.objects.forEach(object => object.removeFromParent()); parent.add(result);
    }
  }
  const mesh = (parent: THREE.Object3D, item: THREE.BufferGeometry, material: SetMaterial, position: SetVector = [0, 0, 0], scale: SetVector = [1, 1, 1], rotation: SetVector = [0, 0, 0]) => {
    const result = new THREE.Mesh(item, palette[material]); result.position.set(...position); result.scale.set(...scale); result.rotation.set(...rotation);
    result.castShadow = material !== "glass"; result.receiveShadow = true; parent.add(result); return result;
  };
  const localSphere = (builder: Builder, material: SetMaterial, position: SetVector, scale: SetVector) => builder.add(new THREE.SphereGeometry(1, 12, 8), material, position, [0, 0, 0], scale);
  const arc = (builder: Builder, points: SetVector[], radius: number, material: SetMaterial) => builder.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point))), Math.max(8, points.length * 3), radius, 6, false), material);
  const make = (id: string, draw: (builder: Builder, record: ConcourseReference) => void) => {
    const record = records.get(id); if (!record) return undefined;
    const builder = createSetBuilder(palette, id); builders.push(builder);
    builder.root.userData = { referenceId: id, referenceLabel: record.note, referencePriority: record.priority, referenceDwell: record.dwell };
    // Reserve the original root order, but defer the expensive geometry/paint.
    // No caller consumes make()'s return before the completed set is returned.
    const root = builder.root;
    construction.push(() => {
      draw(builder, record); builder.finish();
      root.position.set(...record.position); root.rotation.set(...record.rotation); root.scale.set(...record.scale);
    });
    groups.push(root); return root;
  };
  function artwork(parent: THREE.Object3D, id: string, width: number, height: number, position: SetVector, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, text: { text: string; pixels: number; y: number }[] = [], rotation: SetVector = [0, 0, 0], resolution: readonly [number, number] = [1024, 640]) {
    const canvas = document.createElement("canvas"); canvas.width = resolution[0]; canvas.height = resolution[1];
    const ctx = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture);
    const paint = () => { if (disposed || !ctx) return; ctx.clearRect(0, 0, canvas.width, canvas.height); draw(ctx, canvas.width, canvas.height); texture.needsUpdate = true; };
    paint(); repaint.push(paint);
    const material = palette.ivory.clone(); material.name = "reference-paper"; material.color.set("#ffffff"); material.map = texture;
    material.roughness = .88; material.metalness = 0; material.side = THREE.DoubleSide;
    material.onBeforeCompile = palette.ivory.onBeforeCompile; material.customProgramCacheKey = () => `${palette.ivory.customProgramCacheKey()}-reference-map`;
    protectFilmRegistration(material); materials.add(material);
    const result = new THREE.Mesh(plane, material); result.position.set(...position); result.rotation.set(...rotation); result.scale.set(width, height, 1); result.receiveShadow = true;
    result.userData = { referenceId: id, referenceText: text.map(item => ({ text: item.text, height: item.pixels / canvas.height * height, unitHeight: item.pixels / canvas.height, center: [0, .5 - item.y / canvas.height, 0] })), referenceSurface: "printed" };
    parent.add(result); return result;
  }
  function sign(builder: Builder, record: ConcourseReference, width: number, height: number, position: SetVector, options: { cream?: boolean; hand?: boolean; size?: number; pad?: number } = {}) {
    const lines = record.text ?? [], size = options.size ?? Math.min(110, 480 / Math.max(1, lines.length)), spacing = 490 / Math.max(1, lines.length), top = 75 + spacing * .5;
    builder.box([width + .10, height + .10, .09], [position[0], position[1], position[2] - .06], "gold");
    return artwork(builder.root, record.id, width, height, position, (ctx, w, h) => {
      ctx.fillStyle = options.cream ? C.cream : C.ink; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = options.cream ? C.ink : C.cream; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `700 ${size}px ${options.hand ? "FilmHand, " : ""}Arial, sans-serif`;
      for (let i = 0; i < lines.length; i++) { ctx.direction = /[\u0600-\u06ff]/.test(lines[i]) ? "rtl" : "ltr"; ctx.fillText(lines[i], w / 2, top + i * spacing, w - (options.pad ?? 70)); }
      ctx.direction = "ltr";
    }, lines.map((text, index) => ({ text, pixels: size, y: top + index * spacing })));
  }
  // Food boards are painted still lifes, with a small menu at their lower edge.
  // Pigment strokes follow the bowl, bread, glass and leaves; the shop keeps its
  // original physical sign size and its cooking props remain the foreground.
  function foodSign(builder: Builder, record: ConcourseReference, width: number, height: number, position: SetVector, kind: "nihari" | "ridgeway" | "matcha" | "dubai" | "thai") {
    const lettering: { text: string; pixels: number; y: number }[] = [];
    const resolution: readonly [number, number] = [1024, Math.round(1024 * height / width)];
    builder.box([width + .10, height + .10, .09], [position[0], position[1], position[2] - .06], "walnut");
    return artwork(builder.root, record.id, width, height, position, (ctx, w, h) => {
      lettering.length = 0;
      const lines = record.text ?? [];
      const ellipse = (x: number, y: number, rx: number, ry: number, color: string, angle = 0) => {
        ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x * w, y * h, rx * w, ry * h, angle, 0, Math.PI * 2); ctx.fill();
      };
      const shape = (points: readonly (readonly [number, number])[], color: string) => {
        ctx.fillStyle = color; ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h)); ctx.closePath(); ctx.fill();
      };
      const stroke = (points: readonly (readonly [number, number])[], color: string, weight: number) => {
        ctx.strokeStyle = color; ctx.lineWidth = h * weight; ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h)); ctx.stroke();
        // Fine broken bristles follow each form, with a little substrate left through.
        ctx.save(); ctx.globalAlpha *= .22; ctx.lineWidth = Math.max(.7, h * weight * .12);
        for (let bristle = 0; bristle < 3; bristle++) {
          ctx.beginPath(); points.forEach(([x, y], index) => {
            const dx = Math.sin(index * 1.7 + bristle * 2.2) * h * weight * .27;
            const dy = (bristle - 1) * h * weight * .42;
            if (index) ctx.lineTo(x * w + dx, y * h + dy); else ctx.moveTo(x * w + dx, y * h + dy);
          }); ctx.stroke();
        }
        ctx.restore();
      };
      const text = (value: string | undefined, x: number, y: number, size: number, span = .90, color = C.cream) => {
        if (!value) return;
        let pixels = h * size;
        const font = () => `700 ${pixels}px FilmHand, Arial, sans-serif`;
        ctx.font = font(); pixels *= Math.min(1, w * span / Math.max(1, ctx.measureText(value).width)); ctx.font = font();
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = color;
        ctx.direction = /[\u0600-\u06ff]/.test(value) ? "rtl" : "ltr";
        ctx.fillText(value, x * w, y * h); ctx.direction = "ltr";
        lettering.push({ text: value, pixels, y: y * h });
      };
      const background = ctx.createLinearGradient(0, 0, w, h);
      background.addColorStop(0, C.shadow); background.addColorStop(.62, C.ink); ctx.fillStyle = background; ctx.fillRect(0, 0, w, h);
      // A cropped arch and one broad dry-brush edge suggest the shop's warm wall.
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.moveTo(.045 * w, .64 * h); ctx.lineTo(.045 * w, .24 * h);
      ctx.bezierCurveTo(.07 * w, -.04 * h, .48 * w, -.05 * h, .53 * w, .20 * h); ctx.lineTo(.53 * w, .64 * h); ctx.closePath(); ctx.fill();
      stroke([[.052, .61], [.056, .25], [.087, .13], [.15, .075]], C.gold, .009);
      const steam = (x: number, y: number) => {
        ctx.strokeStyle = C.cream; ctx.lineWidth = h * .009; ctx.globalAlpha = .62; ctx.beginPath();
        ctx.moveTo(x * w, y * h); ctx.bezierCurveTo((x - .06) * w, (y - .09) * h, (x + .06) * w, (y - .14) * h, x * w, (y - .25) * h); ctx.stroke(); ctx.globalAlpha = 1;
      };
      const bowl = (soup: boolean) => {
        ellipse(.50, .63, .38, .035, C.ink);
        shape([[.15, .36], [.21, .56], [.35, .65], [.65, .65], [.79, .56], [.85, .36]], C.shadow);
        shape([[.16, .37], [.22, .54], [.37, .61], [.45, .61], [.39, .45]], C.blue);
        stroke([[.22, .50], [.31, .57], [.41, .60]], C.cream, .013);
        ellipse(.50, .36, .35, .145, C.gold); ellipse(.50, .36, .323, .12, soup ? C.red : C.warm);
        ellipse(.51, .37, .28, .078, soup ? C.warm : C.gold);
        stroke([[.20, .37], [.28, .44], [.45, .48], [.66, .46], [.79, .38]], C.cream, .009);
      };
      if (kind === "nihari") {
        bowl(true);
        for (const [x, y, turn] of [[.34, .34, -.2], [.54, .38, .3], [.65, .31, -.1]]) {
          ellipse(x, y, .064, .047, C.ink, turn); ellipse(x - .008, y - .009, .052, .034, C.red, turn);
          stroke([[x - .035, y - .012], [x + .02, y + .002]], C.warm, .009);
        }
        // Ginger, herb leaves and a lemon wedge describe a stew, not noodles.
        for (let i = 0; i < 6; i++) stroke([[.41 + i * .026, .31 + i % 2 * .035], [.47 + i * .021, .37 + i % 2 * .025]], C.cream, .008);
        for (const x of [.31, .44, .62, .68]) { ellipse(x, .40 - x * .10, .018, .027, C.shadow, -.6); stroke([[x - .01, .39 - x * .10], [x + .01, .41 - x * .10]], C.gold, .004); }
        shape([[.71, .25], [.79, .30], [.75, .35]], C.gold); steam(.35, .22); steam(.63, .22);
        text(lines[0], .28, .76, .18, .43); text(lines[1], .75, .76, .18, .38, C.gold); text(lines[2], .5, .93, .16, .86);
      } else if (kind === "ridgeway") {
        ellipse(.5, .61, .42, .14, C.shadow); ellipse(.5, .59, .39, .115, C.blue);
        // Folded flatbread with a visible cut face; kafta and arayes sit beside it.
        shape([[.13, .35], [.27, .22], [.48, .59], [.38, .72], [.30, .70]], C.warm);
        shape([[.14, .35], [.24, .28], [.43, .60], [.38, .68], [.31, .67]], C.cream);
        ellipse(.205, .31, .072, .073, C.ink, -.35); ellipse(.205, .30, .060, .059, C.red, -.35);
        for (let i = 0; i < 5; i++) stroke([[.17 + i * .013, .28], [.21 + i * .011, .33]], i % 2 ? C.gold : C.shadow, .014);
        stroke([[.23, .43], [.31, .56], [.36, .59]], C.gold, .014);
        for (let i = 0; i < 3; i++) {
          ellipse(.53 + i * .057, .49 - i * .037, .031, .14, C.ink, -.38); ellipse(.525 + i * .057, .47 - i * .037, .024, .12, C.red, -.38);
          stroke([[.51 + i * .057, .43 - i * .037], [.54 + i * .057, .51 - i * .037]], C.warm, .010);
        }
        shape([[.70, .66], [.81, .28], [.91, .66]], C.warm); shape([[.72, .62], [.81, .34], [.88, .61]], C.gold);
        for (let i = 0; i < 3; i++) stroke([[.755 + i * .034, .52], [.775 + i * .034, .58]], C.red, .012);
        text(lines[0], .54, .105, .18, .87, C.gold);
        const menu = (lines[1] ?? "").split(" · "); menu.forEach((value, i) => text(value, .18 + i * .32, .88, .19, .29));
      } else if (kind === "matcha") {
        ellipse(.54, .71, .22, .055, C.ink);
        shape([[.36, .18], [.68, .18], [.64, .70], [.40, .70]], C.cream);
        shape([[.375, .38], [.66, .38], [.635, .675], [.405, .675]], C.warm);
        shape([[.37, .21], [.665, .21], [.65, .40], [.39, .40]], C.blue);
        shape([[.39, .23], [.64, .23], [.63, .34], [.40, .36]], C.gold);
        ellipse(.52, .19, .16, .04, C.cream); ellipse(.52, .18, .14, .027, C.shadow);
        stroke([[.59, .49], [.61, .045]], C.cream, .018); stroke([[.397, .26], [.42, .62]], C.cream, .009);
        // A mango cheek and small leaf balance the glass without extra words.
        ellipse(.75, .62, .11, .11, C.warm, -.35); shape([[.74, .52], [.82, .42], [.83, .50]], C.shadow);
        stroke([[.70, .59], [.75, .56], [.80, .58]], C.gold, .012);
        text(lines[0], .5, .885, .23, .93);
      } else if (kind === "dubai") {
        // A glazed plate, two hand rolls and a skewer, framed by a palm frond.
        ellipse(.49, .60, .36, .075, C.ink); ellipse(.49, .55, .34, .10, C.blue);
        for (const [x, y, angle] of [[.31, .37, -.3], [.56, .34, .28]]) {
          ctx.save(); ctx.translate(x * w, y * h); ctx.rotate(angle);
          shape([[-.09, -.11], [.09, -.11], [.035, .26]], C.ink); ellipse(0, -.11, .09, .058, C.cream);
          ellipse(-.014, -.12, .058, .032, C.warm); stroke([[-.055, -.14], [.01, -.10], [.042, -.13]], C.shadow, .016);
          stroke([[-.065, -.02], [-.022, .18]], C.blue, .014); ctx.restore();
        }
        stroke([[.70, .21], [.78, .59]], C.gold, .008);
        for (let i = 0; i < 4; i++) { ellipse(.72 + i * .014, .28 + i * .07, .045, .034, C.red, -.2); stroke([[.695 + i * .014, .27 + i * .07], [.74 + i * .014, .29 + i * .07]], C.warm, .009); }
        stroke([[.88, .53], [.86, .20], [.79, .08]], C.gold, .007);
        for (let i = 0; i < 4; i++) { stroke([[.86 - i * .015, .20 - i * .025], [.93 - i * .012, .15 - i * .018]], C.blue, .018); stroke([[.86 - i * .015, .20 - i * .025], [.78 - i * .016, .23 - i * .02]], C.blue, .018); }
        text(lines[0], .27, .77, .18, .42); text(lines[1], .73, .77, .18, .43); text(lines[2], .5, .94, .16, .8, C.gold);
      } else {
        bowl(false);
        // Wide rice-noodle ribbons and a lime wedge; no generic ramen coil.
        for (let i = 0; i < 7; i++) stroke([[.29 + i * .048, .30], [.34 + i * .035, .34], [.31 + i * .041, .38], [.37 + i * .032, .42]], i % 2 ? C.cream : C.warm, .011);
        shape([[.65, .28], [.76, .31], [.71, .40]], C.gold); stroke([[.67, .30], [.71, .37], [.74, .32]], C.cream, .005);
        for (const x of [.32, .50, .60]) { ellipse(x, .37, .022, .018, C.red); stroke([[x - .03, .33], [x + .02, .30]], C.shadow, .009); }
        stroke([[.62, .26], [.89, .09]], C.gold, .010); stroke([[.65, .28], [.92, .12]], C.gold, .010); steam(.35, .22);
        text(lines[0], .50, .75, .18, .90); text(lines[1], .25, .93, .17, .43, C.gold); text(lines[2], .75, .93, .17, .44, C.gold);
      }
      // A few edge bristles sit inside each painted form rather than across it.
      stroke([[.06, .67], [.15, .68], [.20, .665]], C.blue, .006);
    }, lettering, [0, 0, 0], resolution);
  }

  function counter(builder: Builder, width: number, depth: number, material: SetMaterial = "dark") {
    builder.box([width, 1.10, depth], [0, .60, 0], material, [0, 0, 0], .06);
    builder.box([width + .12, .12, depth + .14], [0, 1.21, 0], "ivory", [0, 0, 0], .04);
    builder.box([width - .12, .045, .035], [0, .21, depth / 2 + .018], "gold");
    for (let i = 0; i < 8; i++) builder.box([.035, .83, .035], [-width / 2 + .17 + i * (width - .34) / 7, .67, depth / 2 + .025], "steel");
  }

  make("concourse-nihari", (b, r) => {
    counter(b, 2.35, 1.25, "dark");
    b.add(lathe([[.43, 0], [.62, .08], [.66, .48], [.60, .62], [.56, .63], [.56, .18], [0, .16]], 20), "steel", [-.15, 1.28, 0]);
    b.add(new THREE.CylinderGeometry(.55, .55, .025, 20), "walnut", [-.15, 1.84, 0]);
    for (const side of [-1, 1]) arc(b, [[-.15 + side * .61, 1.59, -.12], [-.15 + side * .86, 1.58, -.08], [-.15 + side * .86, 1.58, .15], [-.15 + side * .60, 1.59, .19]], .045, "steel");
    b.add(new THREE.SphereGeometry(.64, 18, 7, 0, Math.PI * 2, 0, Math.PI / 2), "steel", [.60, 1.34, -.36], [0, 0, -.54], [1, .13, 1]);
    b.rod([.60, 1.36, -.36], [.60, 1.53, -.36], .045, "ink");
    b.rod([-.55, 1.83, .05], [-.85, 2.14, .16], .023, "gold");
    foodSign(b, r, 2.95, 1.68, [0, 3.10, -.16], "nihari");
    for (const side of [-1, 1]) b.rod([side * 1.27, 1.25, -.25], [side * 1.27, 4.01, -.25], .025, "steel");
  });
  make("concourse-ridgeway", (b, r) => {
    b.box([2.15, .16, 1.45], [0, .28, 0], "steel", [0, 0, 0], .04);
    b.box([2.10, 3.25, .18], [0, 1.95, -.48], "ink");
    for (let i = 0; i < 5; i++) b.box([.075, 2.6, .06], [-.76 + i * .38, 1.94, -.36], i % 2 ? "gold" : "coral");
    b.box([2.22, .17, 1.40], [0, 3.62, -.01], "steel", [0, 0, 0], .04);
    for (const side of [-1, 1]) b.rod([side * 1.02, .35, .45], [side * 1.02, 3.54, .45], .035, "steel");
    b.rod([0, .35, .05], [0, 3.51, .05], .035, "steel");
    b.add(new THREE.CylinderGeometry(.83, .83, .07, 20), "gold", [0, .47, .05]);
    const roast = new THREE.Group(); roast.position.set(0, .70, .05); b.root.add(roast);
    const roastGeometry = keep(lathe([[.37, 0], [.52, .17], [.59, .55], [.62, 1.20], [.55, 1.85], [.43, 2.27], [.38, 2.35]], 20));
    mesh(roast, roastGeometry, "walnut");
    for (let row = 0; row < 16; row++) {
      const band = keep(new THREE.TorusGeometry(.49 + Math.sin(row / 15 * Math.PI) * .10, .016, 4, 20));
      mesh(roast, band, row % 3 ? "gold" : "coral", [0, .12 + row * .142, 0], [1, 1, 1], [Math.PI / 2 + row % 2 * .025, 0, 0]);
    }
    combineShared(roast); moving(roast);
    animated.push(time => { roast.rotation.y = Math.floor(time * 12) / 12 * .11; });
    for(const x of [-1.02,1.02])b.rod([x,3.62,-.06],[x,5.83,-.06],.025,"steel"); foodSign(b, r, 3.35, 1.05, [0, 5.30, -.06], "ridgeway");
  });
  make("concourse-mango-matcha", (b, r) => {
    b.add(lathe([[.19, 0], [.23, .04], [.255, .58], [.245, .64], [.225, .63], [.19, .07], [0, .06]], 18), "glass", [0, 0, 0], [0, 0, 0], [1, 1, 1], false);
    b.add(new THREE.CylinderGeometry(.219, .185, .27, 18), "gold", [0, .19, 0]);
    b.add(new THREE.CylinderGeometry(.237, .219, .25, 18), "sage", [0, .45, 0]);
    b.add(new THREE.CylinderGeometry(.241, .241, .032, 18), "ivory", [0, .59, 0]);
    b.rod([.08, .21, -.02], [.12, .97, -.05], .022, "ivory");
    foodSign(b, r, 1.60, .60, [.07, .28, .53], "matcha");
  });
  make("concourse-dubai", (b, r) => {
    counter(b, 2.65, 1.18, "cyan");
    foodSign(b, r, 2.95, 1.92, [0, 3.16, -.14], "dubai");
    for (let i = 0; i < 3; i++) {
      const x = -.72 + i * .72;
      b.add(new THREE.CylinderGeometry(.20, .26, .032, 16), "ivory", [x, 1.32, .06]);
      b.add(new THREE.ConeGeometry(.20, .45, 10), "ink", [x, 1.55, .06], [0, 0, -.30]);
      b.add(new THREE.SphereGeometry(.17, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), "ivory", [x + .07, 1.76, .06], [0, 0, -.30], [1, .45, 1]);
      b.rod([x - .09, 1.34, .33], [x + .13, 1.34, .65], .009, "walnut");
      b.rod([x -.04, 1.34, .32], [x + .18, 1.34, .64], .009, "walnut");
    }
  });
  make("concourse-thai", (b, r) => {
    counter(b, 2.30, 1.10, "ivory");
    foodSign(b, r, 3.05, 2.0, [0, 3.12, -.18], "thai");
    for (const x of [-.66, 0, .66]) {
      b.add(lathe([[0, 0], [.12, 0], [.28, .10], [.33, .23], [.30, .25], [.13, .075], [0, .075]]), "dark", [x, 1.30, .05]);
      b.add(new THREE.CylinderGeometry(.26, .26, .025, 14), "gold", [x, 1.51, .05]);
      b.rod([x - .13, 1.57, -.12], [x + .20, 1.57, .29], .012, "walnut");
    }
  });

  make("concourse-souvenir-shelves", b => {
    // Shared stepped plinth: globes are close enough to read as objects while the
    // original walking rail remains entirely to the right of the shop frontage.
    b.box([3.75, 1.28, 2.10], [.07, .72, .30], "dark", [0, 0, 0], .08);
    b.box([3.87, .11, 2.20], [.07, 1.415, .30], "ivory", [0, 0, 0], .04);
    b.box([3.00, .48, .74], [.10, 1.69, -.05], "cyan", [0, 0, 0], .04);
    b.box([3.10, .08, .82], [.10, 1.95, -.05], "ivory");
    for (const y of [1.82, 2.60, 3.45]) {
      b.box([2.82, .09, .72], [-1.86, y, -.82], "walnut");
      b.box([2.90, .045, .06], [-1.86, y + .055, -.44], "gold");
    }
    for (const x of [-3.22, -.50]) b.rod([x, .10, -1.04], [x, 4.38, -1.04], .035, "steel");
  });
  const globeRecords = [...records.values()].filter(record => record.id.startsWith("globe-"));
  const globeParts = [
    { geometry: keep(new THREE.CylinderGeometry(.29, .33, .08, 16)), material: palette.gold, y: .04, cast: true },
    { geometry: keep(new THREE.CylinderGeometry(.275, .275, .025, 16)), material: palette.ivory, y: .10, cast: false },
    { geometry: keep(new THREE.SphereGeometry(.32, 16, 10)), material: palette.glass, y: .36, cast: false },
  ];
  if (globeRecords.length) {
    const repeated = new THREE.Group(); repeated.name = "souvenir-globe-common-forms"; repeated.userData.referenceIds = globeRecords.map(record => record.id);
    const parent = new THREE.Object3D(), child = new THREE.Object3D(), matrix = new THREE.Matrix4();
    for (const part of globeParts) {
      const instanced = new THREE.InstancedMesh(part.geometry, part.material, globeRecords.length); instances.push(instanced);
      globeRecords.forEach((record, index) => {
        parent.position.set(...record.position); parent.rotation.set(...record.rotation); parent.scale.set(...record.scale); parent.updateMatrix();
        child.position.set(0, part.y, 0); child.updateMatrix(); matrix.multiplyMatrices(parent.matrix, child.matrix); instanced.setMatrixAt(index, matrix);
      });
      instanced.castShadow = part.cast; instanced.receiveShadow = true; instanced.computeBoundingSphere(); repeated.add(instanced);
    }
    groups.push(repeated);
  }
  for (const record of globeRecords) make(record.id, (b, r) => {
    b.root.userData.referenceBounds = [[-.34, 0, -.34], [.34, .70, .34]];
    const city = r.id.slice(6);
    if (city === "paris") {
      for (const x of [-.12, .12]) for (const z of [-.10, .10]) b.rod([x, .12, z], [0, .55, 0], .013, "ink");
      b.box([.23, .026, .19], [0, .28, 0], "gold"); b.box([.10, .024, .085], [0, .43, 0], "gold");
    } else if (city === "istanbul") {
      b.box([.25, .14, .20], [0, .19, 0], "ivory");
      b.add(new THREE.SphereGeometry(.12, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), "gold", [0, .26, 0]);
      for (const x of [-.18, .18]) { b.rod([x, .12, .015], [x, .43, .015], .018, "ivory"); b.add(new THREE.ConeGeometry(.027, .08, 8), "gold", [x, .46, .015]); }
    } else if (city === "nyc") {
      for (let i = 0; i < 3; i++) { const h = i === 1 ? .38 : .24; b.box([.09, h, .11], [-.12 + i * .12, .12 + h / 2, 0], "ivory"); }
      b.rod([0, .47, 0], [0, .58, 0], .009, "gold");
    } else if (city === "london") {
      b.box([.12, .36, .13], [-.06, .30, 0], "ivory"); b.add(new THREE.ConeGeometry(.10, .13, 4), "gold", [-.06, .545, 0], [0, Math.PI / 4, 0]);
      b.add(new THREE.CircleGeometry(.043, 12), "ink", [-.06, .40, .068]); b.rod([-.06, .40, .073], [-.06, .431, .073], .004, "ivory");
      b.box([.23, .028, .08], [.07, .17, .12], "ink");
    } else if (city === "seoul") {
      localSphere(b, "cyan", [0, .14, 0], [.22, .09, .18]); b.rod([0, .16, 0], [0, .56, 0], .019, "ivory");
      b.add(new THREE.CylinderGeometry(.09, .08, .07, 12), "gold", [0, .43, 0]);
    } else if (city === "montreal") {
      for (const [x, y, z] of [[-.13, .17, .04], [.02, .17, .04], [.15, .17, -.04], [-.05, .29, -.04], [.10, .29, -.03], [.025, .41, -.04]]) b.box([.135, .115, .13], [x, y, z], "ivory");
    } else {
      b.box([.30, .19, .19], [0, .21, 0], "ivory");
      for (const x of [-.15, .15]) { b.add(new THREE.CylinderGeometry(.058, .058, .27, 8), "ivory", [x, .26, .05]); b.add(new THREE.ConeGeometry(.083, .13, 8), "coral", [x, .46, .05]); }
      b.box([.085, .12, .02], [0, .18, .106], "ink");
    }
  });
  for (const id of ["souvenir-yellow-lentil", "souvenir-blue-lentil"]) make(id, b => {
    localSphere(b, id.includes("yellow") ? "gold" : "cyan", [0, .29, 0], [.35, .29, .18]);
    b.add(new THREE.TorusGeometry(.065, .013, 5, 12), "gold", [0, .61, 0]);
  });
  make("souvenir-tiger-tail", b => {
    const points: SetVector[] = [[-.28, -.11, 0], [-.10, -.01, 0], [.23, .02, .015], [.30, .24, .02], [.17, .38, .025]];
    arc(b, points, .13, "gold");
    for (let i = 0; i < 5; i++) b.add(new THREE.TorusGeometry(.133, .027, 5, 12), "ink", [-.21 + i * .115, -.05 + (i > 2 ? (i - 2) * .12 : 0), .01], [0, i > 2 ? .55 : 0, Math.PI / 2]);
  });
  make("souvenir-cookie-jar", b => {
    b.add(lathe([[.18, 0], [.28, .08], [.29, .36], [.23, .50], [.18, .51]], 14), "cyan");
    b.add(new THREE.SphereGeometry(.23, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), "cyan", [.24, .16, .13], [0, 0, -.75], [1, .32, 1]);
    for (let i = 0; i < 3; i++) b.add(new THREE.CylinderGeometry(.11, .11, .035, 12), "gold", [.03 + i * .11, .50 + i * .035, 0], [0, 0, -.20]);
  });
  make("souvenir-black-duck", b => {
    localSphere(b, "ink", [0, .22, 0], [.32, .23, .20]); localSphere(b, "ink", [.19, .45, 0], [.17, .17, .15]);
    localSphere(b, "gold", [.34, .42, .015], [.15, .055, .09]); localSphere(b, "dark", [-.15, .25, .14], [.19, .12, .055]);
  });
  make("souvenir-tall-hat-dog", b => {
    localSphere(b, "gold", [0, .28, 0], [.20, .29, .15]); localSphere(b, "ivory", [0, .64, .02], [.22, .20, .17]);
    for (const side of [-1, 1]) localSphere(b, "ink", [side * .21, .52, 0], [.065, .27, .05]);
    b.add(new THREE.CylinderGeometry(.14, .18, .36, 12), "cyan", [0, .99, 0]); b.add(new THREE.CylinderGeometry(.23, .23, .045, 12), "cyan", [0, .82, 0]);
  });
  make("souvenir-mouse-ears", b => {
    b.add(new THREE.TorusGeometry(.22, .035, 6, 18, Math.PI), "ink", [0, 0, 0]);
    for (const x of [-.23, .23]) localSphere(b, "ink", [x, .24, 0], [.19, .19, .045]);
    b.rod([0, .26, -.08], [0, .44, -.08], .015, "gold"); b.rod([0, .44, -.08], [0, .44, .04], .015, "gold");
  });
  make("souvenir-bat-shadow", b => {
    const shape = new THREE.Shape(); shape.moveTo(0, .08); shape.lineTo(.11, .22); shape.lineTo(.13, .08);
    shape.quadraticCurveTo(.40, .18, .67, .37); shape.quadraticCurveTo(.58, -.03, .36, -.18);
    shape.quadraticCurveTo(.28, -.02, .16, -.16); shape.lineTo(0, -.25); shape.lineTo(-.16, -.16);
    shape.quadraticCurveTo(-.28, -.02, -.36, -.18); shape.quadraticCurveTo(-.58, -.03, -.67, .37);
    shape.quadraticCurveTo(-.40, .18, -.13, .08); shape.lineTo(-.11, .22); shape.closePath();
    b.add(new THREE.ExtrudeGeometry(shape, { depth: .024, bevelEnabled: false, curveSegments: 6 }), "ink");
    b.rod([-.28, .24, .01], [-.28, .93, .01], .006, "steel"); b.rod([.28, .24, .01], [.28, .93, .01], .006, "steel");
  });

  function television(id: string, game: "football" | "baseball" | "basketball") {
    make(id, (b, r) => {
      b.box([3.22, 2.06, .16], [0, 0, -.08], "ink", [0, 0, 0], .04);
      b.rod([0, 1.04, -.06], [0, 2.55, -.06], .035, "steel");
      const lines = r.text ?? [];
      artwork(b.root, id, 3.04, 1.88, [0, 0, .018], (ctx, w, h) => {
        ctx.fillStyle = C.shadow; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = C.cream; ctx.lineWidth = 5; ctx.globalAlpha = .72;
        if (game === "football") {
          ctx.strokeRect(70, 70, w - 140, h - 210); ctx.beginPath(); ctx.moveTo(w / 2, 70); ctx.lineTo(w / 2, h - 140); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(w / 2, h * .41, 65, 75, 0, 0, Math.PI * 2); ctx.stroke();
          for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? C.red : C.cream; ctx.beginPath(); ctx.arc(140 + (i % 4) * 220, 150 + Math.floor(i / 4) * 220, 13, 0, Math.PI * 2); ctx.fill(); }
        } else if (game === "baseball") {
          ctx.beginPath(); ctx.moveTo(w * .5, h * .78); ctx.lineTo(w * .22, h * .42); ctx.lineTo(w * .5, h * .12); ctx.lineTo(w * .78, h * .42); ctx.closePath(); ctx.stroke();
          for (const [x, y] of [[.5, .17], [.25, .42], [.75, .42], [.5, .73]]) ctx.fillRect(w * x - 8, h * y - 8, 16, 16);
          ctx.fillStyle = C.blue; ctx.fillRect(w * .47, h * .42, 33, 44); ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(w * .486, h * .40, 13, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.strokeRect(70, 64, w - 140, h - 130); ctx.beginPath(); ctx.arc(w * .72, h * .47, 65, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.setLineDash([9, 15]); ctx.moveTo(w * .14, h * .72); ctx.quadraticCurveTo(w * .34, -h * .12, w * .75, h * .45); ctx.stroke(); ctx.setLineDash([]);
          for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(w * .68 + i * 25, h * .40 - Math.sin(i / 3 * Math.PI) * 34, 14, Math.PI, Math.PI * 2); ctx.stroke(); }
        }
        if (game !== "basketball") { ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(w * .57, h * .46, 10, 0, Math.PI * 2); ctx.fill(); }
        ctx.globalAlpha = 1; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        lines.forEach((line, i) => { ctx.fillStyle = C.ink; ctx.fillRect(0, i ? h - 115 : 0, w, 115); ctx.fillStyle = C.cream; ctx.font = `700 ${i ? 86 : 104}px Arial`; ctx.fillText(line, w / 2, i ? h - 57 : 58, w - 40); });
      }, lines.map((text, i) => ({ text, pixels: i ? 86 : 104, y: i ? 583 : 58 })));
      if (game !== "basketball") return;
      const ball = mesh(b.root, sphere, "gold", [0, 0, .06], [.045, .045, .024]);
      moving(ball);
      animated.push(time => {
        const phase = (Math.floor(time * 12) / 12 * .22) % 1;
        ball.position.x = -.95 + phase * 1.92; ball.position.y = -.40 + Math.sin(phase * Math.PI) * 1.02;
      });
    });
  }
  television("concourse-football-screen", "football"); television("concourse-baseball-screen", "baseball"); television("concourse-basketball-screen", "basketball");
  make("concourse-paper-bear-tv", (b, r) => {
    b.box([3.5, 2.20, .16], [0, 0, -.08], "ink", [0, 0, 0], .04); b.rod([0, 1.10, -.06], [0, 2.70, -.06], .035, "steel");
    artwork(b.root, r.id, 3.32, 2.02, [0, 0, .01], (ctx, w, h) => {
      ctx.fillStyle = C.gold; ctx.fillRect(0, 0, w, h); ctx.fillStyle = C.cream;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.roundRect(24 + i * 260, 30, 225, 440, [110, 110, 0, 0]); ctx.fill(); }
      ctx.fillStyle = C.shadow; ctx.fillRect(0, 490, w, 150); ctx.fillStyle = C.cream; ctx.font = "700 105px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(r.text?.[0] ?? "", w / 2, 565, w - 50);
    }, [{ text: r.text?.[0] ?? "", pixels: 105, y: 565 }]);
    // An intentionally anonymous paper puppet: plain shapes, no copied face,
    // branded hat, film image or character-specific proportions.
    const puppet = new THREE.Group(); puppet.position.set(0, .12, .075); b.root.add(puppet);
    mesh(puppet, sphere, "gold", [0, .37, 0], [.26, .23, .025]);
    for (const side of [-1, 1]) mesh(puppet, sphere, "gold", [side * .23, .52, 0], [.075, .075, .025]);
    const coat = keep(new THREE.CylinderGeometry(.20, .32, .62, 8)); mesh(puppet, coat, "cyan", [0, -.06, 0], [1, 1, .12]);
    const hat = keep(new THREE.CylinderGeometry(.19, .25, .18, 8)); mesh(puppet, hat, "coral", [0, .65, .01], [1, 1, .15]);
    mesh(puppet, cylinder, "coral", [0, .55, .02], [.32, .045, .035]);
    const feet = new THREE.InstancedMesh(sphere, palette.gold, 2); instances.push(feet); puppet.add(feet); feet.castShadow = true; feet.receiveShadow = true;
    const foot = new THREE.Object3D(); foot.scale.set(.11, .08, .025);
    combineShared(puppet); moving(puppet);
    animated.push(time => { const pose = Math.floor(time * 12) / 12; puppet.rotation.z = Math.sin(pose * .8) * .018;
      for (let index = 0; index < 2; index++) { foot.position.set((index ? 1 : -1) * .14, -.42 + Math.max(0, Math.sin(pose * 2 + index * Math.PI)) * .055, .015); foot.updateMatrix(); feet.setMatrixAt(index, foot.matrix); }
      feet.instanceMatrix.needsUpdate = true; feet.computeBoundingSphere();
    });
    animated[animated.length - 1](0);
  });

  function traveller(parent: THREE.Object3D, clothing: SetMaterial, scale = 1, seated = false): Rig {
    const root = new THREE.Group(); root.scale.setScalar(scale); parent.add(root);
    const torsoGeometry = keep(lathe([[.17, .91], [.21, 1.00], [.24, 1.27], [.28, 1.43], [.24, 1.50], [.11, 1.55]], 12));
    // LatheGeometry's default V is profile-index based. Real height gives the
    // garment print an even vertical scale across chest, waist and shoulders.
    const torsoUV = torsoGeometry.getAttribute("uv"), torsoPosition = torsoGeometry.getAttribute("position");
    for (let i = 0; i < torsoUV.count; i++) torsoUV.setY(i, (torsoPosition.getY(i) - .91) / .64);
    const torso = mesh(root, torsoGeometry, clothing, [0, 0, 0], [1, 1, .65]);
    mesh(root, cylinder, "skin", [0, 1.58, 0], [.075, .17, .075]);
    const head = new THREE.Group(); head.position.y = 1.60; root.add(head);
    mesh(head, sphere, "skin", [0, .18, 0], [.145, .19, .14]);
    // A crown and a lower rear mass describe hair, leaving the forehead clear.
    mesh(head, keep(new THREE.SphereGeometry(.15, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2)), "ink", [0, .255, .015], [1.02, .95, 1.02]);
    mesh(head, sphere, "ink", [0, .19, .075], [.142, .145, .085]);
    mesh(head, sphere, "skin", [0, .16, -.145], [.027, .035, .035]);
    for (const side of [-1, 1]) mesh(head, sphere, "ink", [side * .048, .205, -.134], [.009, .012, .005]);
    // Human proportions and bent joints; no cubic heads or block-shaped limbs.
    const limb = keep(new THREE.CapsuleGeometry(.065, .57, 3, 8));
    const leftLeg = new THREE.Group(), rightLeg = new THREE.Group(); leftLeg.position.set(-.12, .91, 0); rightLeg.position.set(.12, .91, 0); root.add(leftLeg, rightLeg);
    for (const [index, leg] of [leftLeg, rightLeg].entries()) {
      if (seated) {
        // The same .82m leg chain folds at the knee; no scaling or shortened feet.
        mesh(leg, keep(new THREE.CapsuleGeometry(.065, .27, 3, 8)), "dark", [0, -.02, -.215], [1, 1, 1], [Math.PI / 2, 0, 0]);
        const shin = new THREE.Group(); shin.position.set(0, -.03, -.42); leg.add(shin);
        mesh(shin, keep(new THREE.CapsuleGeometry(.065, .25, 3, 8)), "dark", [0, -.19, 0]);
        mesh(shin, sphere, "ivory", [0, -.435, -.065], [.095, .085, .17]);
        leg.rotation.y = index ? -.045 : .045;
      } else {
        mesh(leg, limb, "dark", [0, -.36, 0], [1, 1, 1]); mesh(leg, sphere, "ivory", [0, -.82, -.065], [.095, .085, .17]); leg.rotation.x = index ? -.035 : .035;
      }
    }
    const rightArm = new THREE.Group(); rightArm.position.set(.28, 1.43, 0); rightArm.rotation.z = .16; root.add(rightArm);
    const sleeve = keep(new THREE.CapsuleGeometry(.055, .14, 3, 8)), forearm = keep(new THREE.CapsuleGeometry(.042, .21, 3, 8));
    const leftArm = new THREE.Group(); leftArm.position.set(-.28, 1.43, 0); leftArm.rotation.z = -.12; root.add(leftArm);
    for (const arm of [rightArm, leftArm]) {
      mesh(arm, sleeve, clothing, [0, -.10, 0]); mesh(arm, forearm, "skin", [0, -.335, .01]);
      mesh(arm, sphere, "skin", [0, -.48, .02], [.052, .065, .05]);
    }
    return { root, torso, head, leftLeg, rightLeg, leftArm, rightArm };
  }
  for (const record of records.values()) if (record.id.startsWith("traveller-")) make(record.id, (b, r) => {
    const blue = r.id.endsWith("clement") || r.id.endsWith("bautista");
    const seated = r.id === "traveller-4" || r.id === "traveller-43";
    const rig = traveller(b.root, blue ? "cyan" : "coral", 1, seated);
    if (seated) {
      // These replace the two occupied gate seats at x7.7 and x9.1, z-91.
      // Feet reach the ground and the backrest remains behind the shoulders.
      rig.root.position.y = -.35; rig.root.rotation.y = Math.PI;
      b.box([1.02, .12, .78], [0, .43, -.025], "cyan", [0, 0, 0], .045);
      b.box([1.02, .59, .10], [0, .79, -.40], "cyan", [-.12, 0, 0], .035);
      b.box([.91, .028, .035], [0, 1.105, -.365], "gold");
      for (const side of [-1, 1]) {
        b.rod([side * .39, .035, -.22], [side * .39, .43, -.22], .027, "steel");
        b.rod([side * .39, .035, .24], [side * .39, .43, .24], .027, "steel");
        b.rod([side * .52, .40, -.23], [side * .52, .70, .23], .024, "steel");
        b.box([.065, .055, .53], [side * .52, .715, .015], "walnut", [0, 0, 0], .014);
      }
      rig.head.rotation.x = .12;
      rig.leftArm.rotation.set(.57, 0, .30); rig.rightArm.rotation.set(.57, 0, -.30);
      if (r.id === "traveller-4") {
        mesh(rig.root, keep(new THREE.BoxGeometry(.27, .022, .19)), "ivory", [0, 1.025, -.26], [1, 1, 1], [-.16, 0, 0]);
        mesh(rig.root, keep(new THREE.BoxGeometry(.012, .025, .19)), "gold", [0, 1.025, -.26], [1, 1, 1], [-.16, 0, 0]);
      } else {
        rig.head.rotation.y = -.18; rig.rightArm.rotation.set(.34, 0, .12);
        mesh(rig.root, keep(new THREE.BoxGeometry(.11, .18, .024)), "ink", [-.15, 1.03, -.24], [1, 1, 1], [-.45, 0, -.12]);
      }
    } else if (r.id === "traveller-11") {
      rig.head.rotation.y = -.18; rig.rightArm.rotation.set(.16, 0, .12); rig.leftArm.rotation.set(-.14, 0, -.06);
      rig.leftLeg.rotation.x = .08; rig.rightLeg.rotation.x = -.08;
    } else if (r.id === "traveller-9") {
      rig.head.rotation.y = .17; rig.leftArm.rotation.set(.12, 0, -.18); rig.rightArm.rotation.set(-.08, 0, .08);
      b.box([.43, .64, .32], [.55, .40, .035], "dark", [0, -.12, 0], .06);
      for (const x of [.40, .70]) { b.add(new THREE.CylinderGeometry(.045, .045, .04, 8), "ink", [x, .065, .04], [Math.PI / 2, 0, 0]); b.rod([x - .05, .71, 0], [x - .05, 1.04, 0], .011, "steel"); }
      b.rod([.35, 1.04, 0], [.65, 1.04, 0], .021, "ink");
    } else if (r.id === "traveller-10") {
      rig.head.rotation.y = -.12; rig.rightArm.rotation.set(.26, 0, -.14); rig.leftArm.rotation.set(-.09, 0, -.16);
      rig.leftLeg.rotation.set(.08, 0, .035); rig.rightLeg.rotation.set(-.06, 0, -.035);
    } else if (blue) {
      rig.head.rotation.y = r.id.endsWith("clement") ? .18 : -.14;
      rig.rightArm.rotation.set(r.id.endsWith("clement") ? .48 : -.10, 0, .04);
      rig.leftArm.rotation.set(.08, 0, -.22);
      if (r.id.endsWith("clement")) mesh(rig.root, keep(new THREE.BoxGeometry(.10, .17, .025)), "ink", [.27, 1.02, -.22], [1, 1, 1], [-.48, 0, .05]);
      else b.add(new THREE.CapsuleGeometry(.16, .22, 3, 10), "dark", [-.44, .80, .025], [0, 0, Math.PI / 2], [1, .74, 1]);
    }
    const lines = r.text ?? [], named = lines.length === 3 ? 2 : 1;
    const namePixels = lines.length === 1 ? 125 : 104;
    // Ink lives in the garment's own diffuse map. It has exactly the torso's
    // depth, facets, normals and lighting: there is no decal plane or offset.
    const fabric = blue ? palette.cyan : palette.coral;
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1024;
    const context = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; textures.add(texture);
    const wordLayout = lines.map((text, index) => {
      const sourceY = index < named ? 84 + index * 93 : 340;
      return { text, height: (index < named ? namePixels : 270) / 512 * .61, y: 1.235 + (.5 - sourceY / 512) * .61 };
    });
    const paintFabric = () => {
      if (disposed || !context) return;
      const size = canvas.width;
      context.fillStyle = `#${fabric.color.getHexString()}`; context.fillRect(0, 0, size, size);
      context.fillStyle = C.cream; context.textAlign = "center"; context.textBaseline = "middle";
      // A 124-degree fabric panel wraps the shoulder width. The back lies on
      // the U seam, so repeat both halves there; seated fronts use U=.5.
      const center = seated ? size * .5 : 0, printableWidth = size * 124 / 360;
      for (const word of wordLayout) {
        context.font = `700 ${word.height / .64 * size}px Arial`;
        const y = (1 - (word.y - .91) / .64) * size;
        for (const shift of [-size, 0, size]) context.fillText(word.text, center + shift, y, printableWidth);
      }
      texture.needsUpdate = true;
    };
    paintFabric(); repaint.push(paintFabric);
    const jerseyMaterial = fabric.clone(); jerseyMaterial.name = "reference-jersey-fabric";
    jerseyMaterial.color.set("#ffffff"); jerseyMaterial.map = texture; jerseyMaterial.roughness = .92; jerseyMaterial.metalness = 0;
    jerseyMaterial.onBeforeCompile = fabric.onBeforeCompile;
    jerseyMaterial.customProgramCacheKey = () => `${fabric.customProgramCacheKey()}-jersey-fabric`;
    protectFilmRegistration(jerseyMaterial); materials.add(jerseyMaterial); rig.torso.material = jerseyMaterial;
    const profile = [[.91, .17], [1.00, .21], [1.27, .24], [1.43, .28], [1.50, .24], [1.55, .11]];
    const radiusAt = (y: number) => {
      const index = Math.max(1, profile.findIndex(point => point[0] >= y));
      const a = profile[index - 1], b = profile[index];
      return THREE.MathUtils.lerp(a[1], b[1], THREE.MathUtils.clamp((y - a[0]) / (b[0] - a[0]), 0, 1));
    };
    rig.torso.userData = {
      referenceId: r.id, referenceSurface: "fabric",
      referenceText: wordLayout.map(word => ({ text: word.text, height: word.height, unitHeight: word.height, center: [0, word.y, (seated ? -1 : 1) * radiusAt(word.y)] })),
    };
    if (r.id === "traveller-66") {
      rig.rightArm.rotation.x = .80; rig.leftArm.rotation.x = .80; rig.head.rotation.y = -.10;
      for (const x of [-.33, .33]) { b.rod([x, .25, -.58], [x, 1.04, -.22], .025, "steel"); b.rod([x, .25, -.58], [x, .25, -1.21], .025, "steel"); }
      b.rod([-.33, 1.04, -.22], [.33, 1.04, -.22], .025, "steel"); b.box([.67, .055, .69], [0, .27, -.90], "steel");
      b.box([.46, .68, .34], [0, .63, -.87], "dark", [0, 0, 0], .06); b.box([.48, .045, .36], [0, .62, -.87], "gold");
      const wheels = new THREE.InstancedMesh(keep(new THREE.CylinderGeometry(.075, .075, .055, 10)), palette.ink, 4); instances.push(wheels);
      const transform = new THREE.Object3D(); let index = 0; for (const x of [-.32, .32]) for (const z of [-.59, -1.20]) { transform.position.set(x, .12, z); transform.rotation.z = Math.PI / 2; transform.updateMatrix(); wheels.setMatrixAt(index++, transform.matrix); }
      wheels.castShadow = true; wheels.computeBoundingSphere(); b.root.add(wheels);
    }
  });
  make("concourse-football-kids", b => {
    const first = traveller(b.root, "gold", .64), second = traveller(b.root, "cyan", .69); first.root.position.set(-.98, 0, .10); second.root.position.set(.98, 0, -.13);
    first.root.rotation.y = -Math.PI / 2; second.root.rotation.y = Math.PI / 2;
    const ball = mesh(b.root, sphere, "ivory", [0, .20, .24], [.19, .19, .19]);
    for (let i = 0; i < 5; i++) { const angle = i * Math.PI * 2 / 5; mesh(ball, keep(new THREE.CircleGeometry(.29, 5)), "ink", [Math.sin(angle) * 1.005, 0, Math.cos(angle) * 1.005], [1, 1, 1], [0, angle, 0]); }
    combineShared(ball); moving(ball); moving(first.rightLeg); moving(second.leftLeg);
    animated.push(time => { const phase = Math.floor(time * 12) / 12 * 1.15; ball.position.x = Math.sin(phase) * .64; ball.position.y = .20 + Math.sin(phase * 2) ** 2 * .025; ball.rotation.z = -phase; first.rightLeg.rotation.x = Math.max(0, Math.cos(phase)) * -.24; second.leftLeg.rotation.x = Math.max(0, -Math.cos(phase)) * -.24; });
  });
  make("concourse-basketball-player", b => {
    const rig = traveller(b.root, "dark", 1.03); rig.rightArm.rotation.z = -.20;
    const ball = mesh(b.root, sphere, "gold", [.48, .62, .22], [.20, .20, .20]);
    for (const rotation of [[0, 0, 0], [Math.PI / 2, 0, 0]] as const) mesh(ball, keep(new THREE.TorusGeometry(1.005, .018, 4, 18)), "ink", [0, 0, 0], [1, 1, 1], rotation);
    combineShared(ball); moving(ball); moving(rig.rightArm);
    animated.push(time => { const phase = Math.floor(time * 12) / 12 * 3.0; ball.position.y = .20 + Math.abs(Math.sin(phase)) * .72; rig.rightArm.rotation.x = -.10 - Math.abs(Math.sin(phase)) * .20; });
  });
  for (const id of ["concourse-wings-flyer", "concourse-london-board", "concourse-record-picks"]) make(id, (b, r) => sign(b, r, id.includes("record") ? 2.65 : 2.05, id.includes("record") ? 1.55 : 1.10, [0, 0, 0], { cream: true, hand: true, size: id.includes("record") ? 99 : 125 }));
  make("concourse-cinema-posters", (b, r) => {
    (r.text ?? []).forEach((title, index) => {
      const x = (index - .5) * 2.28;
      const words = title.split(" "), middle = Math.ceil(words.length / 2);
      const lines = [words.slice(0, middle).join(" "), words.slice(middle).join(" ")];
      const illustration = new Image(); illustration.decoding = "async";
      b.box([2.16, 3.02, .11], [x, 0, -.075], "ink");
      b.box([2.20, .035, .16], [x, 1.54, -.05], "gold");
      const poster = artwork(b.root, r.id, 2.05, 2.91, [x, 0, 0], (ctx, w, h) => {
        ctx.fillStyle = C.shadow; ctx.fillRect(0, 0, w, h);
        if (illustration.complete && illustration.naturalWidth) ctx.drawImage(illustration, 0, 0, w, h);
        const fade=ctx.createLinearGradient(0,h*.68,0,h); fade.addColorStop(0,"#0d0f1f00"); fade.addColorStop(.4,"#0d0f1fcc"); fade.addColorStop(1,C.ink);
        ctx.fillStyle=fade; ctx.fillRect(0,h*.68,w,h*.32);
        ctx.fillStyle=C.cream; ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="700 72px Arial, sans-serif";
        lines.forEach((line,i)=>ctx.fillText(line,w/2,h*.85+i*80,w-58));
      }, lines.map((text,i)=>({text,pixels:72,y:1228*.85+i*80})), [0,0,0], [864,1228]);
      const paint = repaint.at(-1)!;
      illustration.onload=()=>{if(!disposed){paint();invalidate();}};
      illustration.src=r.art?.[index]??"";
      poster.name="painted-cinema-poster";
    });
  });
  // Each complete reference remains atomic; yield between references so the
  // current room can keep rendering while this approaching room is prepared.
  for (const construct of construction) { await yieldTask(); construct(); }
  construction.length = 0;

  // Preserve each reference anchor/label for QA and selection-free exploration,
  // but merge all fixed palette geometry by bay. Human silhouettes and shelf
  // objects therefore cost material draws, not one draw per limb or trinket.
  const batches = new Map<number, THREE.Group>();
  let regrouped = 0;
  for (const root of [...groups]) {
    if (!root.userData.referenceId) continue;
    root.updateMatrixWorld(true);
    const prescribed = root.userData.referenceBounds as [SetVector, SetVector] | undefined;
    const bounds = prescribed ? new THREE.Box3(new THREE.Vector3(...prescribed[0]), new THREE.Vector3(...prescribed[1])).applyMatrix4(root.matrixWorld) : new THREE.Box3().setFromObject(root);
    root.userData.referenceBounds = [bounds.min.toArray(), bounds.max.toArray()];
    const zone = root.position.z > -64 ? 0 : root.position.z > -75 ? 1 : root.position.z > -87 ? 2 : 3;
    let batch = batches.get(zone); if (!batch) { batch = new THREE.Group(); batch.name = `concourse-reference-bay-${zone}`; batch.userData.referenceBatch = true; batches.set(zone, batch); }
    const fixed: THREE.Mesh[] = [];
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh) || object instanceof THREE.InstancedMesh || Array.isArray(object.material) || !paletteMaterials.has(object.material)) return;
      for (let ancestor: THREE.Object3D | null = object; ancestor && ancestor !== root; ancestor = ancestor.parent) if (ancestor.userData.referenceAnimated) return;
      fixed.push(object);
    });
    for (const object of fixed) { const world = object.matrixWorld.clone(); object.removeFromParent(); world.decompose(object.position, object.quaternion, object.scale); batch.add(object); }
    if (++regrouped % 3 === 0) await yieldTask();
  }
  for (const batch of batches.values()) { await yieldTask(); combineShared(batch); groups.push(batch); }
  // Drawing with the already-installed font avoids an extra font download.
  void document.fonts?.load("700 100px FilmHand").then(() => { if (!disposed) { repaint.forEach(paint => paint()); invalidate(); } });
  let lastAnimationFrame = -1;
  return {
    groups,
    update(time, reduced) {
      const frame = reduced ? 0 : Math.floor(time * 12);
      if (frame === lastAnimationFrame) return;
      lastAnimationFrame = frame;
      const value = reduced ? 0 : time; animated.forEach(animate => animate(value));
    },
    dispose() { if (disposed) return; disposed = true; builders.forEach(builder => builder.dispose()); instances.forEach(instance => instance.dispose()); geometry.forEach(item => item.dispose()); materials.forEach(item => item.dispose()); textures.forEach(item => item.dispose()); groups.forEach(group => group.clear()); },
  };
}
