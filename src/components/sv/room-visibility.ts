import * as THREE from "three";

/** Hide props behind the opaque room dividers, including from the shadow pass. */
export function createRoomVisibility(scene: THREE.Scene) {
  const bounds = new WeakMap<THREE.Object3D, THREE.Box3>();
  const hidden: THREE.Object3D[] = [];
  const size = new THREE.Vector3();
  function restore() {
    for (const object of hidden) object.visible = true;
    hidden.length = 0;
  }
  function apply(progress: number) {
    const [near, far] = progress < .433 ? [-33, 25] : progress < .45 ? [-51, 25]
      : progress < .635 ? [-51, -29] : progress < .65 ? [-88, -29]
      : progress < .841 ? [-88, -48] : progress < .86 ? [-150, -48] : [-300, -80];
    for (const object of scene.children) {
      // Architecture batches span rooms; the traveler moves through them.
      if (!object.visible || object instanceof THREE.Light || object instanceof THREE.InstancedMesh || object instanceof THREE.Line || (object.name === "articulated-traveler" || object.name === "film-traveler-3d")) continue;
      let box = bounds.get(object);
      if (!box) { box = new THREE.Box3().setFromObject(object); bounds.set(object, box); }
      if (box.isEmpty()) continue;
      box.getSize(size);
      if (size.x > 60 || size.z > 60) continue;
      if (box.max.z < near || box.min.z > far) { hidden.push(object); object.visible = false; }
    }
  }
  return { restore, apply };
}
