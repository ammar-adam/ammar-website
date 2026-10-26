import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export interface TravelerRig {
  /** Foot baseline is local y=0; native standing height is about 1.85m; forward is -Z. */
  root: THREE.Group;
  /** Actual left-hand grip: call getWorldPosition after update to attach the rope. */
  raisedHand: THREE.Object3D;
  /** hero is 0..1 over the opening; time is seconds; grounded is 0..1 contact weight. */
  update: (hero: number, time: number, grounded: number) => void;
  /** Owns every material, geometry and texture created here. Call once on world disposal. */
  dispose: () => void;
}

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (value: number) => value * value * (3 - 2 * value);

type Pose = {
  at: number; pitch: number; bank: number; twist: number; drop: number;
  leftShoulder: number; leftSpread: number; leftElbow: number;
  rightShoulder: number; rightSpread: number; rightElbow: number;
  leftHip: number; leftKnee: number; rightHip: number; rightKnee: number;
  leftAnkle: number; rightAnkle: number; casePitch: number; caseRoll: number;
};

// Continuous articulated key poses: taut reach, compressed swing, long release,
// contact, impact absorption, and an upright recovery. No sprite/frame changes.
const POSES: Pose[] = [
  { at: 0, pitch: -.24, bank: -.14, twist: -.12, drop: 0, leftShoulder: .02, leftSpread: -2.85, leftElbow: .08, rightShoulder: -.60, rightSpread: .26, rightElbow: .22, leftHip: .45, leftKnee: -.75, rightHip: -.46, rightKnee: -.58, leftAnkle: .18, rightAnkle: -.12, casePitch: -.38, caseRoll: -.13 },
  { at: .22, pitch: -.38, bank: .16, twist: .16, drop: 0, leftShoulder: .10, leftSpread: -2.98, leftElbow: .14, rightShoulder: -.85, rightSpread: .38, rightElbow: .36, leftHip: 1.02, leftKnee: -1.75, rightHip: .73, rightKnee: -1.67, leftAnkle: .32, rightAnkle: .30, casePitch: -.76, caseRoll: .20 },
  { at: .39, pitch: -.60, bank: .24, twist: .24, drop: 0, leftShoulder: .08, leftSpread: -3.02, leftElbow: .06, rightShoulder: -1.10, rightSpread: .42, rightElbow: .27, leftHip: 1.43, leftKnee: -2.18, rightHip: 1.21, rightKnee: -2.05, leftAnkle: .42, rightAnkle: .34, casePitch: -.95, caseRoll: .28 },
  { at: .58, pitch: -.32, bank: -.19, twist: -.15, drop: 0, leftShoulder: 1.72, leftSpread: -.53, leftElbow: .12, rightShoulder: -1.28, rightSpread: .35, rightElbow: .18, leftHip: .97, leftKnee: -.22, rightHip: -.90, rightKnee: -.34, leftAnkle: -.12, rightAnkle: -.26, casePitch: -.28, caseRoll: -.20 },
  { at: .77, pitch: -.12, bank: -.07, twist: -.05, drop: .02, leftShoulder: 1.12, leftSpread: -.34, leftElbow: .42, rightShoulder: -.52, rightSpread: .24, rightElbow: .36, leftHip: .38, leftKnee: -.52, rightHip: -.13, rightKnee: -.40, leftAnkle: .08, rightAnkle: -.08, casePitch: -.35, caseRoll: -.13 },
  { at: .87, pitch: -.18, bank: .02, twist: 0, drop: .10, leftShoulder: .47, leftSpread: -.22, leftElbow: .52, rightShoulder: -.20, rightSpread: .20, rightElbow: .20, leftHip: .57, leftKnee: -.95, rightHip: .42, rightKnee: -.82, leftAnkle: .20, rightAnkle: .20, casePitch: .24, caseRoll: .09 },
  { at: .94, pitch: -.31, bank: 0, twist: 0, drop: .22, leftShoulder: .70, leftSpread: -.20, leftElbow: .72, rightShoulder: -.05, rightSpread: .24, rightElbow: .42, leftHip: .83, leftKnee: -1.37, rightHip: .78, rightKnee: -1.30, leftAnkle: .28, rightAnkle: .28, casePitch: -.12, caseRoll: -.05 },
  { at: 1, pitch: 0, bank: 0, twist: 0, drop: 0, leftShoulder: .03, leftSpread: -.10, leftElbow: .10, rightShoulder: -.02, rightSpread: .16, rightElbow: .06, leftHip: .025, leftKnee: -.045, rightHip: -.025, rightKnee: -.025, leftAnkle: .02, rightAnkle: .05, casePitch: .04, caseRoll: 0 },
];

export function createTravelerRig(): TravelerRig {
  const root = new THREE.Group();
  root.name = "articulated-traveler";
  root.userData.rig = "articulated-traveler-v1";
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const instances: THREE.InstancedMesh[] = [];
  const geometry = (source: THREE.BufferGeometry): THREE.BufferGeometry => {
    const value = source.index ? source.toNonIndexed() : source;
    if (value !== source) source.dispose();
    value.computeVertexNormals();
    geometries.add(value);
    return value;
  };
  const ramp = new THREE.DataTexture(new Uint8Array([52, 52, 52, 255, 126, 126, 126, 255, 211, 211, 211, 255, 255, 255, 255, 255]), 4, 1, THREE.RGBAFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  const toon = (color: string) => {
    const material = new THREE.MeshToonMaterial({ color, gradientMap: ramp });
    materials.add(material);
    return material;
  };
  const navy = toon("#17334f"), pants = toon("#10243b"), seam = toon("#365773");
  const red = toon("#e55743"), redShadow = toon("#9d2c35"), skin = toon("#a66b48"), skinLight = toon("#bb8258");
  const hair = toon("#261b26"), ink = toon("#101522"), cream = toon("#f5e5c7"), sole = toon("#c8c2ad"), cyan = toon("#68c4c8");
  const sphere = geometry(new THREE.SphereGeometry(1, 12, 9));
  const box = geometry(new RoundedBoxGeometry(1, 1, 1, 2, .12));
  const mesh = (shape: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) => {
    const item = new THREE.Mesh(shape, material);
    item.position.set(x, y, z); item.castShadow = true; item.receiveShadow = true; parent.add(item);
    return item;
  };
  const oval = (parent: THREE.Object3D, material: THREE.Material, scale: [number, number, number], position: [number, number, number]) => {
    const item = mesh(sphere, material, parent, ...position); item.scale.set(...scale); return item;
  };
  const rounded = (parent: THREE.Object3D, material: THREE.Material, scale: [number, number, number], position: [number, number, number]) => {
    const item = mesh(box, material, parent, ...position); item.scale.set(...scale); return item;
  };
  const capsule = (length: number, radius: number) => geometry(new THREE.CapsuleGeometry(radius, Math.max(.001, length - radius * 2), 3, 10));
  const joint = (name: string, parent: THREE.Object3D, x: number, y: number, z: number) => {
    const item = new THREE.Group(); item.name = name; item.position.set(x, y, z); parent.add(item); return item;
  };
  const body = joint("traveler-pelvis", root, 0, .89, 0);
  const torso = joint("traveler-torso", body, 0, 0, 0);
  const profile = [[0, -.07], [.17, -.07], [.20, 0], [.22, .14], [.25, .37], [.245, .46], [.15, .54], [0, .54]].map(([r, y]) => new THREE.Vector2(r, y));
  const sweater = mesh(geometry(new THREE.LatheGeometry(profile, 14)), navy, torso); sweater.scale.z = .64;
  const hem = rounded(torso, pants, [.37, .085, .25], [0, -.02, 0]); hem.rotation.z = .015;
  // A folded hood has actual depth around the neck, with a warm lining.
  const hood = mesh(geometry(new THREE.TorusGeometry(.16, .065, 6, 16)), navy, torso, 0, .49, .04); hood.rotation.x = Math.PI / 2;
  const lining = mesh(geometry(new THREE.TorusGeometry(.127, .025, 5, 16)), redShadow, torso, 0, .515, .033); lining.rotation.x = Math.PI / 2;
  rounded(torso, navy, [.32, .24, .16], [0, .44, .15]);
  rounded(torso, navy, [.25, .14, .025], [0, .13, -.145]);
  rounded(torso, seam, [.25, .012, .014], [0, .18, -.161]);
  // The backpack and shoulder straps retain the rear silhouette while rotating.
  rounded(torso, ink, [.34, .43, .19], [0, .25, .20]);
  rounded(torso, navy, [.285, .21, .045], [0, .16, .31]);
  rounded(torso, redShadow, [.22, .016, .016], [0, .28, .338]);
  for (const side of [-1, 1]) {
    const strap = mesh(capsule(.40, .025), ink, torso, side * .15, .28, -.132); strap.rotation.z = -side * .10;
    rounded(torso, seam, [.035, .045, .025], [side * .165, .15, -.16]);
  }
  const head = joint("traveler-head", torso, 0, .69, -.012);
  oval(head, skin, [.17, .195, .16], [0, 0, 0]);
  oval(head, skinLight, [.11, .085, .025], [0, -.063, -.13]);
  oval(head, skinLight, [.026, .027, .032], [0, -.012, -.158]);
  for (const side of [-1, 1]) {
    oval(head, skin, [.035, .061, .044], [side * .172, -.008, 0]);
    oval(head, cream, [.029, .019, .010], [side * .065, .036, -.148]);
    oval(head, ink, [.012, .015, .007], [side * .064, .034, -.158]);
    const brow = rounded(head, hair, [.067, .014, .018], [side * .066, .078, -.148]); brow.rotation.z = -side * .10;
  }
  const smile = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.045, -.082, -.169), new THREE.Vector3(0, -.096, -.182), new THREE.Vector3(.045, -.079, -.169));
  mesh(geometry(new THREE.TubeGeometry(smile, 7, .005, 4, false)), redShadow, head);
  oval(head, hair, [.172, .155, .14], [0, .045, .057]);
  const curls = new THREE.InstancedMesh(sphere, hair, 39); curls.name = "traveler-hair-curls"; curls.castShadow = true; curls.receiveShadow = true;
  const curlMatrix = new THREE.Matrix4(), curlRotation = new THREE.Quaternion();
  for (let i = 0; i < 27; i++) {
    const angle = i * 2.39996, elevation = .08 + (i % 7) / 7 * .12;
    const radial = Math.sqrt(Math.max(.002, .19 * .19 - elevation * elevation));
    curlMatrix.compose(new THREE.Vector3(Math.cos(angle) * radial, elevation + .03, Math.sin(angle) * radial * .85 + .025), curlRotation, new THREE.Vector3(.055, .06, .052));
    curls.setMatrixAt(i, curlMatrix);
  }
  for (let i = 0; i < 12; i++) {
    const angle = i / 11 * Math.PI;
    curlMatrix.compose(new THREE.Vector3(Math.cos(angle) * .16, .018 + (i % 3) * .024, Math.sin(angle) * .13 + .04), curlRotation, new THREE.Vector3(.051, .052, .05));
    curls.setMatrixAt(i + 27, curlMatrix);
  }
  curls.instanceMatrix.needsUpdate = true; head.add(curls); instances.push(curls);
  const band = mesh(geometry(new THREE.TorusGeometry(.188, .014, 4, 14, Math.PI)), ink, head, 0, .015, .025);
  band.rotation.z = 0;
  for (const side of [-1, 1]) {
    oval(head, ink, [.039, .066, .059], [side * .189, -.005, .025]);
    oval(head, seam, [.012, .041, .039], [side * .224, -.005, .025]);
  }
  const openFingers: THREE.Group[] = [];
  function arm(side: number) {
    const prefix = side < 0 ? "left" : "right";
    const shoulder = joint(`traveler-${prefix}-shoulder`, torso, side * .245, .43, 0);
    oval(shoulder, navy, [.093, .092, .092], [0, -.015, 0]);
    mesh(capsule(.29, .084), navy, shoulder, 0, -.145, 0);
    const elbow = joint(`traveler-${prefix}-elbow`, shoulder, 0, -.29, 0);
    oval(elbow, navy, [.079, .077, .078], [0, 0, 0]);
    mesh(capsule(.27, .065), navy, elbow, 0, -.135, 0);
    mesh(capsule(.057, .067), pants, elbow, 0, -.242, 0);
    const wrist = joint(`traveler-${prefix}-wrist`, elbow, 0, -.28, 0);
    rounded(wrist, skin, [.103, .112, .08], [0, -.042, 0]);
    oval(wrist, skinLight, [.025, .043, .029], [-side * .049, -.031, -.025]);
    for (let finger = 0; finger < 4; finger++) {
      const digit = joint(`traveler-${prefix}-finger-${finger}`, wrist, -.033 + finger * .022, -.067, -.012);
      mesh(capsule(.065 - Math.abs(finger - 1.5) * .006, .014), skinLight, digit, 0, -.021, 0);
      digit.rotation.x = -1.6;
      if (side < 0) openFingers.push(digit);
    }
    const grip = joint(`traveler-${prefix}-grip`, wrist, 0, -.04, 0);
    return { shoulder, elbow, wrist, grip };
  }
  const leftArm = arm(-1), rightArm = arm(1);
  const groundPoints: THREE.Object3D[] = [];
  function leg(side: number) {
    const prefix = side < 0 ? "left" : "right";
    const hip = joint(`traveler-${prefix}-hip`, body, side * .125, 0, 0);
    mesh(capsule(.40, .107), pants, hip, 0, -.20, 0);
    const knee = joint(`traveler-${prefix}-knee`, hip, 0, -.40, 0);
    oval(knee, pants, [.091, .09, .088], [0, -.008, 0]);
    mesh(capsule(.37, .082), pants, knee, 0, -.185, 0);
    rounded(knee, navy, [.10, .014, .014], [0, -.075, -.078]);
    const ankle = joint(`traveler-${prefix}-ankle`, knee, 0, -.37, 0);
    mesh(capsule(.07, .075), navy, ankle, 0, -.012, 0);
    rounded(ankle, cream, [.18, .125, .34], [0, -.035, -.065]);
    rounded(ankle, sole, [.19, .036, .36], [0, -.093, -.065]);
    rounded(ankle, navy, [.017, .033, .18], [side * .091, -.023, -.035]);
    for (const z of [-.12, -.075]) rounded(ankle, sole, [.11, .012, .025], [0, .024, z]);
    for (const z of [-.23, .10]) groundPoints.push(joint(`traveler-${prefix}-sole`, ankle, 0, -.111, z));
    return { hip, knee, ankle };
  }
  const leftLeg = leg(-1), rightLeg = leg(1);
  const suitcase = joint("traveler-suitcase-pivot", rightArm.grip, 0, 0, 0);
  const handleShafts = [-.092, .092].map(x => mesh(capsule(.205, .012), seam, suitcase, x, -.097, 0));
  const caseBody = joint("traveler-suitcase-shell", suitcase, 0, 0, 0);
  const handle = mesh(capsule(.215, .021), ink, suitcase); handle.rotation.z = Math.PI / 2;
  rounded(caseBody, redShadow, [.35, .46, .23], [0, -.405, 0]);
  rounded(caseBody, red, [.315, .42, .055], [0, -.405, -.122]);
  for (const x of [-.105, -.035, .035, .105]) rounded(caseBody, redShadow, [.012, .32, .012], [x, -.405, -.154]);
  rounded(caseBody, cream, [.084, .055, .012], [.073, -.285, -.159]);
  for (const x of [-.122, .122]) {
    const wheel = mesh(geometry(new THREE.CylinderGeometry(.042, .042, .042, 10)), ink, caseBody, x, -.657, 0); wheel.rotation.z = Math.PI / 2;
  }
  const scratch = rounded(caseBody, cyan, [.11, .012, .008], [-.058, -.47, -.162]); scratch.rotation.z = -.32;
  const localPoint = new THREE.Vector3();
  const pose = { ...POSES[0] };
  let dead = false;
  const update = (hero: number, time: number, grounded: number) => {
    if (dead) return;
    const h = clamp(hero), contact = clamp(grounded), air = 1 - contact;
    const end = Math.max(1, POSES.findIndex(key => key.at >= h));
    const a = POSES[end - 1], b = POSES[end], blend = ease(clamp((h - a.at) / (b.at - a.at)));
    for (const key of Object.keys(pose) as (keyof Pose)[]) pose[key] = mix(a[key], b[key], blend);
    body.position.set(0, .89 - pose.drop, 0);
    body.rotation.set(pose.pitch, pose.twist, pose.bank);
    head.rotation.set(mix(-.08, .07, contact), -.12 * Math.sin(h * Math.PI * 2), -.05 * Math.sin(h * Math.PI));
    leftArm.shoulder.rotation.set(pose.leftShoulder, -.08, pose.leftSpread);
    rightArm.shoulder.rotation.set(pose.rightShoulder, .05, pose.rightSpread);
    leftArm.elbow.rotation.x = pose.leftElbow; rightArm.elbow.rotation.x = pose.rightElbow;
    leftArm.wrist.rotation.z = -.08 * air; rightArm.wrist.rotation.z = -.10 * air;
    leftLeg.hip.rotation.set(pose.leftHip, -.035, -.06 * air);
    rightLeg.hip.rotation.set(pose.rightHip, .035, .08 * air);
    leftLeg.knee.rotation.x = pose.leftKnee; rightLeg.knee.rotation.x = pose.rightKnee;
    leftLeg.ankle.rotation.x = pose.leftAnkle; rightLeg.ankle.rotation.x = pose.rightAnkle;
    const open = ease(clamp((h - .46) / .10)) * (1 - ease(clamp((h - .77) / .18)));
    openFingers.forEach((digit, index) => { digit.rotation.x = mix(-1.6, -.08, open); digit.rotation.z = (index - 1.5) * .09 * open; });
    suitcase.rotation.set(pose.casePitch + Math.sin(time * 5.6 - h * 3) * .045 * air, Math.sin(h * Math.PI * 3) * .10 * air, pose.caseRoll);
    // The telescoping handle retracts as the held case meets the floor during impact.
    const caseLift = pose.drop * contact * .7;
    caseBody.position.y = caseLift;
    handleShafts.forEach(shaft => { shaft.scale.y = 1 - caseLift / .205; shaft.position.y = -.097 + caseLift * .5; });
    // Plant the actual soles through the impact/recovery rather than intersecting the floor.
    root.updateMatrixWorld(true);
    if (contact > 0) {
      let lowest = Infinity;
      for (const point of groundPoints) { point.getWorldPosition(localPoint); root.worldToLocal(localPoint); lowest = Math.min(lowest, localPoint.y); }
      body.position.y -= lowest * contact;
      root.updateMatrixWorld(true);
    }
    root.userData.hero = h;
    root.userData.grounded = contact;
  };
  update(1, 0, 1);
  return {
    root, raisedHand: leftArm.grip, update,
    dispose() { if (dead) return; dead = true; for (const instance of instances) instance.dispose(); for (const item of geometries) item.dispose(); for (const material of materials) material.dispose(); ramp.dispose(); root.clear(); },
  };
}
