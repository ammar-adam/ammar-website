import * as THREE from "three";
import type { FilmMaterialPalette } from "./film-materials";
import type { FilmSet } from "./film-set-builder";
import { createReferenceAssembly, printBase, printText, REFERENCE_BLUE, REFERENCE_CREAM, REFERENCE_GOLD, REFERENCE_INK, REFERENCE_RED, type PropReference } from "./film-reference-props";

export interface CounterReferences extends FilmSet { updateSelection: (index: number) => void }

/** These are desk objects, not a second information UI. They occupy the customer
 * edge of the existing service island and swap with its existing company board. */
export function createCounterReferences(palette: FilmMaterialPalette, references: readonly PropReference[], invalidate: () => void): CounterReferences {
  const assemblies: ReturnType<typeof createReferenceAssembly>[] = [];
  const selected: { root: THREE.Group; index: number }[] = [];
  const add = (id: string, index: number, build: (assembly: ReturnType<typeof createReferenceAssembly>) => void) => {
    const row = references.find(reference => reference.id === id); if (!row) return;
    const assembly = createReferenceAssembly(palette, row); build(assembly); assembly.finish(); assemblies.push(assembly); selected.push({ root: assembly.root, index });
  };

  add("alpen-difc", 0, ({ set, print }) => {
    // The lanyard hangs from a short brass desk hook, with a visible loop and clip.
    set.box([.22, .04, .20], [0, .02, -.10], "steel", [0, 0, 0], .025);
    set.rod([0, .04, -.10], [0, 1.02, -.10], .017, "gold");
    set.rod([0, 1.02, -.10], [0, 1.02, .03], .017, "gold");
    set.rod([0, 1.0, .03], [-.19, .67, .04], .024, "coral");
    set.rod([0, 1.0, .03], [.19, .67, .04], .024, "coral");
    set.rod([-.19, .67, .04], [0, .52, .04], .024, "coral");
    set.rod([.19, .67, .04], [0, .52, .04], .024, "coral");
    set.add(new THREE.TorusGeometry(.038, .009, 5, 12), "steel", [0, .54, .055]);
    set.box([.66, .69, .025], [0, .25, .065], "ivory", [0, 0, 0], .035);
    set.box([.09, .065, .038], [0, .59, .065], "steel", [0, 0, 0], .012);
    print(.60, .62, (ctx, w, h) => {
      printBase(ctx, w, h); ctx.fillStyle = REFERENCE_BLUE; ctx.fillRect(0, 0, w, h * .25);
      printText(ctx, "DIFC", h * .25, w * .10, h * .14, REFERENCE_CREAM);
      ctx.fillStyle = REFERENCE_GOLD; ctx.fillRect(w * .10, h * .36, w * .27, h * .34);
      ctx.fillStyle = REFERENCE_BLUE; ctx.beginPath(); ctx.arc(w * .235, h * .47, w * .052, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w * .235, h * .66, w * .095, h * .10, 0, Math.PI, Math.PI * 2); ctx.fill();
      ctx.fillStyle = REFERENCE_INK; ctx.fillRect(w * .46, h * .41, w * .42, h * .024); ctx.fillRect(w * .46, h * .50, w * .31, h * .024);
      for (let n = 0; n < 18; n++) ctx.fillRect(w * (.10 + n * .044), h * .81, w * (n % 3 ? .014 : .021), h * .095);
    }, [{ text: "DIFC", height: .155, center: [0, .223, 0] }], [0, .25, .080]);
  });

  add("alpen-model", 0, ({ set, print }) => {
    set.box([1.02, .045, .38], [0, .025, -.12], "steel", [0, 0, 0], .025);
    set.rod([-.43, .04, -.20], [-.43, .85, -.19], .016, "gold");
    set.rod([.43, .04, -.20], [.43, .85, -.19], .016, "gold");
    set.box([.99, .93, .025], [0, .50, -.05], "ivory", [-.16, 0, 0]);
    set.box([.19, .035, .055], [0, .97, -.12], "steel", [-.16, 0, 0], .008);
    print(.94, .88, (ctx, w, h) => {
      printBase(ctx, w, h); printText(ctx, "FINANCIAL", h * .155, w * .07, h * .13); printText(ctx, "MODEL", h * .155, w * .07, h * .30);
      ctx.strokeStyle = REFERENCE_BLUE; ctx.lineWidth = 2;
      for (let y = 0; y < 7; y++) { ctx.beginPath(); ctx.moveTo(w * .07, h * (.44 + y * .073)); ctx.lineTo(w * .93, h * (.44 + y * .073)); ctx.stroke(); }
      for (let x = 0; x < 4; x++) { ctx.beginPath(); ctx.moveTo(w * (.07 + x * .285), h * .44); ctx.lineTo(w * (.07 + x * .285), h * .88); ctx.stroke(); }
      ctx.fillStyle = REFERENCE_BLUE;
      for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) ctx.fillRect(w * (.09 + x * .285), h * (.47 + y * .073), w * (.11 + ((x + y) % 3) * .035), h * .012);
      ctx.fillStyle = REFERENCE_GOLD; ctx.fillRect(w * .07, h * .87, w * .86, h * .036);
    }, [{ text: "FINANCIAL", height: .136, center: [0, .325, 0] }, { text: "MODEL", height: .136, center: [0, .176, 0] }], [0, .50, -.028], [-.16, 0, 0]);
  });

  add("alpen-business-cards", 0, ({ set }) => {
    // Bone stock, a restrained engraved rule and a visible deckled stack.
    for (let layer = 0; layer < 5; layer++) set.box([.36, .012, .22], [layer * .006, .02 + layer * .014, 0], "ivory", [0, -.13, 0]);
    set.box([.24, .003, .009], [.03, .09, 0], "steel", [0, -.13, 0]);
  });

  add("datastealth-dashboard", 1, ({ set, print }) => {
    set.box([.64, .045, .44], [0, .025, -.09], "steel", [0, 0, 0], .035);
    set.rod([0, .05, -.12], [0, .43, -.12], .055, "steel");
    set.box([1.55, 1.0, .12], [0, .79, -.04], "ink", [0, 0, 0], .055);
    print(1.43, .88, (ctx, w, h) => {
      printBase(ctx, w, h, true); printText(ctx, "SALES", h * .19, w * .055, h * .16, REFERENCE_CREAM);
      ctx.strokeStyle = REFERENCE_BLUE; ctx.lineWidth = 3;
      for (let n = 0; n < 4; n++) { ctx.beginPath(); ctx.moveTo(w * .06, h * (.43 + n * .13)); ctx.lineTo(w * .69, h * (.43 + n * .13)); ctx.stroke(); }
      const bars = [.18, .29, .24, .44, .50, .60];
      bars.forEach((value, index) => { ctx.fillStyle = index === bars.length - 1 ? REFERENCE_GOLD : REFERENCE_BLUE; ctx.fillRect(w * (.09 + index * .10), h * (.88 - value), w * .055, h * value); });
      ctx.fillStyle = REFERENCE_CREAM; ctx.fillRect(w * .77, h * .36, w * .16, h * .026); ctx.fillRect(w * .77, h * .58, w * .16, h * .026);
      ctx.fillStyle = REFERENCE_RED; ctx.fillRect(w * .77, h * .44, w * .11, h * .055); ctx.fillStyle = REFERENCE_GOLD; ctx.fillRect(w * .77, h * .67, w * .14, h * .055);
    }, [{ text: "SALES", height: .167, center: [0, .299, 0] }], [0, .79, .025], [0, 0, 0], true);
  });

  add("sagard-kyc", 2, ({ set, print }) => {
    set.box([1.19, .06, .37], [0, .03, -.07], "steel", [0, 0, 0], .025);
    set.box([1.12, .94, .055], [0, .49, .025], "gold", [-.08, 0, 0], .02);
    set.box([.43, .10, .055], [-.29, 1.0, -.015], "gold", [-.08, 0, 0], .015);
    print(1.05, .86, (ctx, w, h) => {
      printBase(ctx, w, h); printText(ctx, "KYC", h * .27, w * .08, h * .24);
      // Only the named document, a red rubber stamp, and its attached note.
      ctx.save(); ctx.translate(w * .27, h * .67); ctx.rotate(-.16); ctx.strokeStyle = REFERENCE_RED; ctx.lineWidth = 8; ctx.strokeRect(-w * .19, -h * .115, w * .38, h * .23); printText(ctx, "KYC", h * .16, -w * .14, 0, REFERENCE_RED); ctx.restore();
      ctx.fillStyle = REFERENCE_GOLD; ctx.fillRect(w * .51, h * .47, w * .45, h * .40);
      printText(ctx, "Doppel", h * .165, w * .54, h * .64);
    }, [{ text: "KYC", height: .232, center: [-.28, .224, 0] }, { text: "KYC", height: .138, center: [-.24, -.146, 0] }, { text: "Doppel", height: .142, center: [.24, -.12, 0] }], [0, .49, .058], [-.08, 0, 0]);
    set.add(new THREE.CylinderGeometry(.065, .08, .19, 12), "walnut", [.67, .14, .08]);
    set.box([.25, .055, .15], [.67, .045, .08], "coral", [0, -.12, 0], .016);
  });

  add("openai-devday", 3, ({ set, print }) => {
    set.box([.20, .035, .20], [0, .02, -.13], "steel", [0, 0, 0], .022);
    set.rod([0, .04, -.13], [0, 1.33, -.13], .015, "gold");
    set.rod([0, 1.33, -.13], [0, 1.33, .01], .015, "gold");
    set.rod([0, 1.32, .02], [-.22, .99, .03], .022, "dark"); set.rod([0, 1.32, .02], [.22, .99, .03], .022, "dark");
    set.rod([-.22, .99, .03], [0, .94, .04], .022, "dark"); set.rod([.22, .99, .03], [0, .94, .04], .022, "dark");
    set.box([.77, .72, .035], [0, .55, .04], "ivory", [0, 0, 0], .035);
    set.box([.10, .06, .05], [0, .91, .04], "steel", [0, 0, 0], .012);
    print(.70, .65, (ctx, w, h) => {
      printBase(ctx, w, h); printText(ctx, "DevDay", h * .23, w * .045, h * .30);
      ctx.fillStyle = REFERENCE_RED; ctx.fillRect(w * .055, h * .54, w * .89, h * .12);
      ctx.fillStyle = REFERENCE_INK; for (let n = 0; n < 16; n++) ctx.fillRect(w * (.07 + n * .054), h * .79, w * (n % 2 ? .015 : .023), h * .08);
    }, [{ text: "DevDay", height: .150, center: [0, .13, 0] }], [0, .55, .060]);
  });

  add("openai-handheld", 3, ({ set }) => {
    // A generic handheld: no brand, mascot or familiar startup screen.
    set.box([.54, .81, .12], [0, .40, 0], "ivory", [-.12, 0, -.12], .07);
    set.box([.43, .36, .025], [-.007, .57, .081], "ink", [-.12, 0, -.12], .025);
    set.box([.34, .25, .012], [-.007, .57, .098], "steel", [-.12, 0, -.12], .014);
    set.box([.18, .048, .025], [-.12, .23, .09], "dark", [0, 0, -.12], .008);
    set.box([.048, .18, .025], [-.12, .23, .09], "dark", [0, 0, -.12], .008);
    for (const [x, y] of [[.12, .21], [.20, .27]]) set.add(new THREE.CylinderGeometry(.043, .043, .026, 12), "coral", [x, y, .105], [Math.PI / 2, 0, 0]);
    for (let n = 0; n < 3; n++) set.box([.025, .045, .008], [.10 + n * .048, .10, .087], "dark", [0, 0, -.30]);
    set.box([.55, .04, .31], [0, .02, -.04], "steel", [0, 0, 0], .025);
  });

  const updateSelection = (index: number) => { selected.forEach(item => { item.root.visible = item.index === index; }); };
  updateSelection(0); queueMicrotask(invalidate);
  return { groups: assemblies.map(assembly => assembly.root), update: () => {}, updateSelection, dispose: () => assemblies.forEach(assembly => assembly.dispose()) };
}
