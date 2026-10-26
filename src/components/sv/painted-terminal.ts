import * as THREE from "three";
import { projects } from "@/data/departures";
import { memorySequence } from "./memorySequence";
import { createIllustratedTraveler } from "./illustrated-traveler";
import { createPaintedStages, type PaintedStageName } from "./painted-stages";
import type { TerminalModel } from "./terminal-world";

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };

export function createPaintedTerminal(invalidate: () => void): TerminalModel {
  const scene = new THREE.Scene(); scene.background = new THREE.Color("#07101c");
  const camera = new THREE.PerspectiveCamera(52, 16 / 9, .05, 100); scene.add(camera);
  const stages = createPaintedStages(invalidate);
  Object.values(stages.groups).forEach(group => scene.add(group));
  stages.groups.city.scale.setScalar(1.35); stages.groups.atrium.scale.setScalar(1.24); stages.groups.security.scale.setScalar(1.16);
  const traveler = createIllustratedTraveler({ invalidate }); scene.add(traveler.root);
  const textures: THREE.Texture[] = [], geometries: THREE.BufferGeometry[] = [], materials: THREE.Material[] = [];
  let dead = false;
  const loader = new THREE.TextureLoader();
  const texture = (src: string) => { const t = loader.load(src, () => { if (dead) t.dispose(); else invalidate(); }); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; textures.push(t); return t; };
  const keepGeometry = <T extends THREE.BufferGeometry>(g: T) => { geometries.push(g); return g; };
  const keepMaterial = <T extends THREE.Material>(m: T) => { materials.push(m); return m; };
  const plane = keepGeometry(new THREE.PlaneGeometry(1, 1));
  const mesh = (w: number, h: number, material: THREE.Material, parent: THREE.Object3D = scene) => { const m = new THREE.Mesh(plane, material); m.scale.set(w, h, 1); parent.add(m); return m; };

  // A painted architectural beam masks the two opening match cuts.
  const curtain = new THREE.Group(); camera.add(curtain);
  const beam = mesh(6.8, 12, keepMaterial(new THREE.MeshBasicMaterial({ map: texture("/art/terminal-paint-material.webp"), color: "#101e30" })), curtain);
  beam.rotation.z = -.22;
  const seam = mesh(.025, 12, keepMaterial(new THREE.MeshBasicMaterial({ color: "#7bbbc3" })), curtain); seam.position.set(3.35, 0, .01); seam.rotation.z = -.22;

  const ropeGeometry = keepGeometry(new THREE.BufferGeometry()); ropeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(6), 3));
  const rope = new THREE.Line(ropeGeometry, keepMaterial(new THREE.LineBasicMaterial({ color: "#e9e6d4", transparent: true, opacity: .9 }))); rope.frustumCulled = false; scene.add(rope);
  const shadow = mesh(3.4, .22, keepMaterial(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }", fragmentShader: "varying vec2 vUv; void main(){ float a=(1.-smoothstep(.15,.5,length(vUv-.5)))*.30; gl_FragColor=vec4(.025,.05,.08,a); }" }))); shadow.position.set(5.1, -5.6, 4.1);

  // The project preview sits on the illustrated security monitor, not a floating card.
  const monitorGeometry = keepGeometry(new THREE.PlaneGeometry(1, 1, 24, 16));
  const monitorCorners = [[.853, .728], [.984, .792], [.979, .600], [.850, .573]];
  const monitorUV = monitorGeometry.getAttribute("uv"), monitorPositions = monitorGeometry.getAttribute("position");
  for (let i = 0; i < monitorUV.count; i++) {
    const u = monitorUV.getX(i), v = monitorUV.getY(i);
    const top = [mix(monitorCorners[0][0], monitorCorners[1][0], u), mix(monitorCorners[0][1], monitorCorners[1][1], u)];
    const bottom = [mix(monitorCorners[3][0], monitorCorners[2][0], u), mix(monitorCorners[3][1], monitorCorners[2][1], u)];
    const point = stages.project("security", mix(bottom[0], top[0], v), mix(bottom[1], top[1], v), .12);
    monitorPositions.setXYZ(i, point.x, point.y, point.z);
  }
  monitorGeometry.computeVertexNormals();
  const monitors = projects.map(project => { const material = keepMaterial(new THREE.MeshBasicMaterial({ map: texture(project.screenshot), side: THREE.DoubleSide, color: "#c9e3df" })); const screen = new THREE.Mesh(monitorGeometry, material); screen.scale.setScalar(1.16); scene.add(screen); return screen; });

  // A single illuminated photo display beside the gate seating. Its feet stay on
  // the floor; images change inside the same mount as the visitor walks past.
  const photos: THREE.Object3D[] = [];
  const display = new THREE.Group(); scene.add(display);
  const displayBack = mesh(5.9, 6.35, keepMaterial(new THREE.MeshBasicMaterial({ color: "#14212a" })), display);
  displayBack.position.z = -.06;
  const displayMat = mesh(5.68, 6.12, keepMaterial(new THREE.MeshBasicMaterial({ color: "#e9deca" })), display);
  displayMat.position.z = -.035;
  for (const foot of [-2.1, 2.1]) {
    const leg = mesh(.10, 1.8, keepMaterial(new THREE.MeshBasicMaterial({ color: "#27343c" })), display); leg.position.set(foot, -3.85, -.08);
    const base = mesh(.9, .10, keepMaterial(new THREE.MeshBasicMaterial({ color: "#17232e" })), display); base.position.set(foot, -4.7, -.08);
  }
  const labelCanvas = document.createElement("canvas"); labelCanvas.width = 1024; labelCanvas.height = 80;
  const labelContext = labelCanvas.getContext("2d")!;
  labelContext.fillStyle = "#27343c"; labelContext.font = "500 25px Arial"; labelContext.textAlign = "center";
  labelContext.fillText("A FEW THINGS I WANT TO REMEMBER", 512, 48);
  const labelTexture = new THREE.CanvasTexture(labelCanvas); labelTexture.colorSpace = THREE.SRGBColorSpace; textures.push(labelTexture);
  const label = mesh(5.0, .39, keepMaterial(new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true })), display); label.position.set(0, -2.70, .015);
  const frames = memorySequence.map(memory => {
    const ratio = memory.width / memory.height, h = Math.min(4.95, 5.25 / ratio), w = h * ratio;
    const image = mesh(w, h, keepMaterial(new THREE.MeshBasicMaterial({ map: texture(memory.src) })), display);
    image.position.y = .20; image.userData.photoIndex = memory.photoIndex; photos.push(image);
    return image;
  });

  const aircraft = mesh(5.7, 2.1, keepMaterial(new THREE.MeshBasicMaterial({ map: texture("/art/aircraft-departure.webp"), transparent: true, alphaTest: .03, depthWrite: false })));
  const dustGeometry = keepGeometry(new THREE.BufferGeometry());
  const dustPositions = new Float32Array(36 * 3);
  for (let i = 0; i < 36; i++) { dustPositions[i * 3] = Math.sin(i * 8.321) * 15; dustPositions[i * 3 + 1] = Math.cos(i * 3.71) * 9; dustPositions[i * 3 + 2] = 3.2 + (i % 5) * .6; }
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeometry, keepMaterial(new THREE.PointsMaterial({ size: .025, color: "#f9cb91", transparent: true, opacity: .23, depthWrite: false }))); scene.add(dust);
  const hand = new THREE.Vector3();

  return {
    scene, camera, photos,
    update(state) {
      const p = clamp(state.t), phone = state.aspect < .8, time = state.reduced ? 0 : state.time ?? 0;
      const hero = clamp(p / .24), landing = ease((hero - .77) / .23);
      const room: PaintedStageName = p < .055 ? "city" : p < .185 ? "atrium" : p < .45 ? "checkin" : p < .65 ? "security" : p < .86 ? "concourse" : "gate";
      Object.entries(stages.groups).forEach(([name, group]) => { group.visible = name === room; });
      camera.aspect = state.aspect; camera.fov = 52;
      let x = 0, y = .2, z = 18, roll = 0;
      if (p < .055) { const q = ease(p / .055); x = mix(-.8, .6, q); y = mix(.5, -.2, q); z = mix(20.4, 16.2, q); roll = mix(-.16, .16, q); }
      else if (p < .185) { const q = clamp((p - .055) / .13); x = Math.sin(q * Math.PI * 2) * .75; y = mix(.45, -.5, q); z = mix(20, 15.1, ease(q)); roll = Math.sin(q * Math.PI * 2 + .6) * .16; }
      else if (p < .24) { const q = ease((p - .185) / .055); x = mix(.1, 1.1, q); y = mix(-.7, .1, q); z = mix(18.9, 18.1, q); roll = mix(-.045, 0, q); }
      else if (p < .45) { const q = clamp((p - .24) / .21); x = mix(1.1, 2.0, q); y = .1; z = mix(18.1, 17.5, q); }
      else if (p < .65) { const q = clamp((p - .45) / .2); x = mix(5.6, 6.0, q); y = .25; z = mix(18.3, 17.5, q); }
      else if (p < .86) { const q = clamp((p - .65) / .21); x = mix(.1, .8, q); y = .3; z = mix(18.9, 17.7, q); }
      else { const q = clamp((p - .86) / .14); x = mix(.4, .9, q); y = .2; z = mix(18.7, 18.0, q); }
      if (phone) { x = p < .24 ? .8 : p < .45 ? 4.3 : p < .65 ? 14.8 : p < .86 ? 5.25 : 3.2; roll *= .6; }
      if (state.reduced) { roll = 0; z = 18.2; }
      const flight = clamp(state.departure);
      z -= flight * 1.15; x += flight * .6;
      camera.position.set(x, y, z); camera.rotation.set(0, 0, roll); camera.updateProjectionMatrix(); camera.updateMatrixWorld();

      // Match cuts occur behind a close structural beam, in the direction of travel.
      const cuts = [.055, .185, .45, .65, .86]; const cut = cuts.find(value => Math.abs(p - value) < .0055);
      curtain.visible = cut !== undefined && !state.reduced;
      if (cut !== undefined) { const q = clamp((p - cut + .0055) / .011); curtain.position.set(mix(-12, 12, q), 0, -3); }

      traveler.root.visible = p < .275 && !state.reduced;
      if (traveler.root.visible) {
        const sweep = Math.sin(hero * Math.PI * 1.65);
        const tx = phone ? x + .9 + sweep * .35 : 4.9 + sweep * 2.0;
        const ty = phone ? -3.5 + Math.sin(hero * Math.PI) * .9 : -2.3 + Math.sin(hero * Math.PI * 1.35) * 1.1;
        traveler.root.position.set(mix(tx, phone ? x + .6 : 5.2, landing), mix(ty, -5.55, landing), mix(6.0 + Math.sin(hero * Math.PI) * 1.0, 4.3, landing));
        traveler.root.scale.setScalar(mix(phone ? 2.0 : 2.65, phone ? 1.8 : 2.15, landing));
        traveler.root.quaternion.copy(camera.quaternion); traveler.root.rotateZ(Math.sin(hero * Math.PI * 2) * -.32 * (1 - landing));
        traveler.update(hero, time, landing); traveler.root.updateMatrixWorld(true); traveler.raisedHand.getWorldPosition(hand);
        const positions = ropeGeometry.getAttribute("position") as THREE.BufferAttribute; positions.setXYZ(0, x + (phone ? -.5 : -3), 11.8, 4); positions.setXYZ(1, hand.x, hand.y, hand.z); positions.needsUpdate = true;
      }
      rope.visible = traveler.root.visible && hero < .565;
      shadow.visible = traveler.root.visible && landing > .4; shadow.position.x = traveler.root.position.x;
      shadow.scale.x = 3.4 * landing;
      monitors.forEach((screen, index) => { screen.visible = room === "security" && index === state.projectIndex; });
      const galleryProgress = clamp((p - .65) / .21);
      const photoIndex = Math.min(memorySequence.length - 1, Math.floor(galleryProgress * memorySequence.length));
      display.visible = room === "concourse";
      display.position.set(phone ? 5.6 : 6.6, phone ? 1.3 : .1, 4.7);
      display.rotation.y = -.06; display.scale.setScalar(phone ? .72 : 1);
      frames.forEach((frame, index) => { frame.visible = index === photoIndex; });
      aircraft.visible = room === "gate" && flight > .02;
      aircraft.position.set(7 + flight * 12, 1.2 + flight * 6, 4); aircraft.rotation.z = flight * .12;
      dust.rotation.z = time * .002; dust.position.y = Math.sin(time * .16) * .12;
      dust.visible = !state.reduced;
      scene.userData.ready = stages.groups[room].userData.loaded && (!traveler.root.visible || traveler.root.userData.ready);
      scene.userData.stage = room;
    },
    dispose() { dead = true; traveler.dispose(); stages.dispose(); textures.forEach(t => t.dispose()); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); scene.clear(); },
  };
}
