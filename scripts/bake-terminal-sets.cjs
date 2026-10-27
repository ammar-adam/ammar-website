#!/usr/bin/env node
/* Bake the authored terminal props without a browser, GPU or asset downloads.
 * Format v1: uint32LE JSON byte length, UTF-8 header, padding to four bytes,
 * then little-endian Float32/Uint32 arrays. Offsets address the payload start;
 * positionCount and normalCount count scalar floats, not vertices.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- This standalone Node baker is intentionally CommonJS. */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { gzipSync, gunzipSync } = require("node:zlib");
const assert = require("node:assert/strict");
const ts = require("typescript");

const repo = path.resolve(__dirname, "..");
const sourceRoot = path.join(repo, "src", "components", "sv");
const destination = path.join(repo, "public", "geometry");
const manifestPath = path.join(repo, "src", "data", "terminalSets.generated.json");
const tolerance = 1e-5;
const paletteKeys = ["ink", "steel", "ivory", "coral", "cyan", "gold", "floor", "wall", "dark", "walnut", "sage", "skin", "glass", "warmLight", "coolLight"];
const definitions = [
  ["atrium", "film-atrium-set.ts", "createAtriumSet"],
  ["concourse", "film-concourse-set.ts", "createConcourseSet"],
  ["airside", "film-airside-set.ts", "createAirsideSet"],
];

function writeIfChanged(file, bytes) {
  if (fs.existsSync(file) && fs.readFileSync(file).equals(bytes)) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
}

async function main() {
  // Preload the ESM dependencies; the transpiled local factories can then use a
  // synchronous require shim on every Node version supported by this project.
  const THREE = await import("three");
  const bufferUtils = await import("three/addons/utils/BufferGeometryUtils.js");
  const addons = new Map([
    ["three/addons/utils/BufferGeometryUtils.js", bufferUtils],
    ["three/addons/geometries/RoundedBoxGeometry.js", await import("three/addons/geometries/RoundedBoxGeometry.js")],
  ]);
  const modules = new Map();
  function load(file) {
    file = path.resolve(file);
    if (!file.endsWith(".ts")) file += ".ts";
    const relative = path.relative(sourceRoot, file);
    if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`Set source outside component directory: ${file}`);
    if (modules.has(file)) return modules.get(file).exports;
    const loadedModule = { exports: {} }; modules.set(file, loadedModule);
    const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
      reportDiagnostics: true,
      fileName: file,
    });
    const errors = compiled.diagnostics?.filter(item => item.category === ts.DiagnosticCategory.Error) ?? [];
    if (errors.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(errors, { getCanonicalFileName: name => name, getCurrentDirectory: () => repo, getNewLine: () => "\n" }));
    const requireLocal = name => {
      if (name === "three") return THREE;
      if (addons.has(name)) return addons.get(name);
      if (name.startsWith(".")) return load(path.resolve(path.dirname(file), name));
      throw new Error(`Unsupported set dependency ${name} in ${file}`);
    };
    Function("require", "module", "exports", compiled.outputText)(requireLocal, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }

  const { ensurePaintUV } = load(path.join(sourceRoot, "film-paint-uv.ts"));
  const palette = Object.fromEntries(paletteKeys.map(key => { const material = new THREE.MeshStandardMaterial(); material.name = key; return [key, material]; }));
  const paletteNames = new Map(Object.entries(palette).map(([name, material]) => [material, name]));
  const manifest = {};
  try {
    for (const [name, file, factory] of definitions) {
      const authored = load(path.join(sourceRoot, file))[factory](palette);
      const decodedGeometries = [];
      try {
        authored.update(0, true);
        authored.groups.forEach(root => root.updateMatrixWorld(true));
        const geometryIds = new Map(), geometries = [], chunks = [];
        let payloadLength = 0, meshes = 0, sourceVertices = 0, bakedVertices = 0, triangles = 0, maxAttributeError = 0;
        const append = (array, integer = false) => {
          const bytes = Buffer.allocUnsafe(array.length * 4);
          for (let i = 0; i < array.length; i++) {
            if (integer) bytes.writeUInt32LE(array[i], i * 4);
            else { if (!Number.isFinite(array[i])) throw new Error(`${name}: non-finite geometry value`); bytes.writeFloatLE(array[i], i * 4); }
          }
          const offset = payloadLength; chunks.push(bytes); payloadLength += bytes.length; return offset;
        };
        const encodeGeometry = source => {
          if (geometryIds.has(source)) return geometryIds.get(source);
          const copy = ensurePaintUV(new THREE.BufferGeometry().copy(source));
          const originalPaintUV = copy.getAttribute("paintUV"), paintIndex = copy.index;
          for (const attribute of Object.keys(copy.attributes)) if (attribute !== "position" && attribute !== "normal" && attribute !== "paintUV") copy.deleteAttribute(attribute);
          if (!copy.getAttribute("normal")) copy.computeVertexNormals();
          const indexed = bufferUtils.mergeVertices(copy, tolerance); copy.dispose();
          try {
            const position = indexed.getAttribute("position"), normal = indexed.getAttribute("normal"), paintUV = indexed.getAttribute("paintUV"), index = indexed.getIndex();
            if (!index || position.itemSize !== 3 || normal.itemSize !== 3) throw new Error(`${name}: unexpected geometry attributes`);
            const originalPosition = source.getAttribute("position"), originalNormal = source.getAttribute("normal");
            const count = source.index?.count ?? originalPosition.count;
            assert.equal(index.count, count, `${name}: triangle count changed during deduplication`);
            // Check the indexed triangle stream, including hard-edge normals.
            // No vertex normal is recomputed and no face is added or removed.
            for (let i = 0; i < count; i++) {
              const a = source.index ? source.index.getX(i) : i, b = index.getX(i);
              const paintA = paintIndex ? paintIndex.getX(i) : i;
              for (let component = 0; component < 2; component++) maxAttributeError = Math.max(maxAttributeError, Math.abs(originalPaintUV.getComponent(paintA, component) - paintUV.getComponent(b, component)));
              for (let component = 0; component < 3; component++) {
                maxAttributeError = Math.max(maxAttributeError, Math.abs(originalPosition.getComponent(a, component) - position.getComponent(b, component)));
                if (originalNormal) maxAttributeError = Math.max(maxAttributeError, Math.abs(originalNormal.getComponent(a, component) - normal.getComponent(b, component)));
              }
            }
            assert(maxAttributeError <= tolerance * 1.01, `${name}: attribute error ${maxAttributeError} exceeds deduplication tolerance`);
            const entry = {
              positionOffset: append(position.array), positionCount: position.array.length,
              normalOffset: append(normal.array), normalCount: normal.array.length,
              paintUVOffset: append(paintUV.array), paintUVCount: paintUV.array.length,
              indexOffset: append(index.array, true), indexCount: index.count, indexType: "uint32",
            };
            const id = geometries.length; geometries.push(entry); geometryIds.set(source, id);
            sourceVertices += originalPosition.count; bakedVertices += position.count;
            return id;
          } finally { indexed.dispose(); }
        };
        const encodeNode = object => {
          if (!object.isGroup && !object.isMesh) throw new Error(`${name}: unsupported ${object.type}`);
          if (object.isSkinnedMesh || object.isInstancedMesh) throw new Error(`${name}: animated/instanced geometry requires an explicit encoding`);
          const node = {
            type: object.isMesh ? "mesh" : "group", name: object.name,
            position: object.position.toArray(), quaternion: object.quaternion.toArray(), scale: object.scale.toArray(),
          };
          if (object.isMesh) {
            const material = paletteNames.get(object.material);
            if (!material) throw new Error(`${name}: mesh material is not caller-owned palette material`);
            node.geometry = encodeGeometry(object.geometry); node.material = material;
            node.castShadow = object.castShadow; node.receiveShadow = object.receiveShadow;
            meshes++; triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
          }
          if (Object.keys(object.userData).length) node.userData = JSON.parse(JSON.stringify(object.userData));
          if (!object.visible) node.visible = false;
          node.children = object.children.map(encodeNode); return node;
        };
        const header = { version: 1, roots: authored.groups.map(encodeNode), geometries };
        const json = Buffer.from(JSON.stringify(header), "utf8");
        const payloadStart = (4 + json.length + 3) & ~3;
        const prefix = Buffer.alloc(payloadStart); prefix.writeUInt32LE(json.length, 0); json.copy(prefix, 4);
        const raw = Buffer.concat([prefix, ...chunks]);
        const compressed = gzipSync(raw, { level: 9 });
        assert(gunzipSync(compressed).equals(raw), `${name}: gzip round trip failed`);

        // Read the actual encoded arrays back into a separate graph and check its
        // authored bounds. This also validates byte offsets and shared geometry.
        for (const entry of geometries) {
          const geometry = new THREE.BufferGeometry();
          const read = (offset, count, integer = false) => {
            const array = integer ? new Uint32Array(count) : new Float32Array(count);
            for (let i = 0; i < count; i++) array[i] = integer ? raw.readUInt32LE(payloadStart + offset + i * 4) : raw.readFloatLE(payloadStart + offset + i * 4);
            return array;
          };
          geometry.setAttribute("position", new THREE.BufferAttribute(read(entry.positionOffset, entry.positionCount), 3));
          geometry.setAttribute("normal", new THREE.BufferAttribute(read(entry.normalOffset, entry.normalCount), 3));
          geometry.setAttribute("paintUV", new THREE.BufferAttribute(read(entry.paintUVOffset, entry.paintUVCount), 2));
          geometry.setIndex(new THREE.BufferAttribute(read(entry.indexOffset, entry.indexCount, true), 1));
          decodedGeometries.push(geometry);
        }
        let decodedMeshes = 0, decodedTriangles = 0, animatedNodes = 0;
        const decodeNode = node => {
          const object = node.type === "mesh" ? new THREE.Mesh(decodedGeometries[node.geometry], palette[node.material]) : new THREE.Group();
          object.name = node.name; object.position.fromArray(node.position); object.quaternion.fromArray(node.quaternion); object.scale.fromArray(node.scale);
          object.castShadow = node.castShadow ?? false; object.receiveShadow = node.receiveShadow ?? false; object.visible = node.visible !== false;
          object.userData = node.userData ?? {}; if (object.userData.setMotion) animatedNodes++;
          if (object.isMesh) { decodedMeshes++; decodedTriangles += object.geometry.index.count / 3; }
          node.children.forEach(child => object.add(decodeNode(child))); return object;
        };
        const decodedRoots = header.roots.map(decodeNode);
        const bounds = authored.groups.map((root, i) => {
          const original = new THREE.Box3().setFromObject(root);
          decodedRoots[i].updateMatrixWorld(true);
          const decoded = new THREE.Box3().setFromObject(decodedRoots[i]);
          const a = [...original.min.toArray(), ...original.max.toArray()], b = [...decoded.min.toArray(), ...decoded.max.toArray()];
          const error = Math.max(...a.map((value, j) => Math.abs(value - b[j])));
          assert(error <= tolerance * 2, `${name}/${root.name}: reconstructed bounds changed by ${error}`);
          return { name: root.name, min: original.min.toArray(), max: original.max.toArray(), maxError: error };
        });
        assert.equal(decodedMeshes, meshes, `${name}: mesh count changed`);
        assert.equal(decodedTriangles, triangles, `${name}: rendered triangle count changed`);
        const hash = crypto.createHash("sha256").update(compressed).digest("hex").slice(0, 16);
        writeIfChanged(path.join(destination, `${name}.set.gz`), compressed);
        manifest[name] = { url: `/geometry/${name}.set.gz`, hash };
        console.log(JSON.stringify({ set: name, meshes, triangles, geometries: geometries.length, animatedNodes, sourceVertices, bakedVertices, rawBytes: raw.length, compressedBytes: compressed.length, hash, maxAttributeError, bounds }));
      } finally { decodedGeometries.forEach(geometry => geometry.dispose()); authored.dispose(); }
    }
    writeIfChanged(manifestPath, Buffer.from(JSON.stringify(manifest, null, 2) + "\n"));
  } finally { Object.values(palette).forEach(material => material.dispose()); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
