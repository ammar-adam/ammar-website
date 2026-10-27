import * as THREE from "three";

type Renderable = THREE.Object3D & { material?: THREE.Material | THREE.Material[] };
type PendingProgram = { isReady: () => boolean };
type Job = { root: THREE.Object3D; meshes: Renderable[]; cursor: number; reveal: boolean; priority: number };

/** Compile future rooms without suspending the current film frame. Newly added
 * sets remain behind their hidden wrapper until all submitted programs finish.
 * Existing scene meshes can be warmed in the background without changing them. */
export function createTerminalProgramWarmup(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget, scene: THREE.Scene, camera: THREE.Camera, invalidate: () => void) {
  const jobs: Job[] = [];
  let seen = new WeakSet<THREE.Object3D>(), textures = new WeakMap<THREE.Texture, number>();
  let active = false, disposed = false, busy = false, ticket = 0, generation = 0;
  let idleTicket = false, running: Job | undefined;
  const candidate = new THREE.Object3D();
  // Lights come only from the target scene; do not count them twice.
  candidate.traverseVisible = () => {};
  const cancel = () => {
    if (!ticket) return;
    if (idleTicket) window.cancelIdleCallback(ticket); else window.clearTimeout(ticket);
    ticket = 0;
  };
  const schedule = () => {
    if (disposed || !active || busy || ticket || !jobs.length) return;
    if (typeof window.requestIdleCallback === "function") {
      idleTicket = true; ticket = window.requestIdleCallback(run, { timeout: 100 });
    } else { idleTicket = false; ticket = window.setTimeout(run, 16); }
  };
  const waitForPrograms = (programs: PendingProgram[], token: number) => new Promise<void>(resolve => {
    const poll = () => {
      if (disposed || token !== generation || programs.every(program => program.isReady())) { resolve(); return; }
      window.setTimeout(poll, 10);
    };
    poll();
  });
  function compileMesh(mesh: Renderable, token: number) {
    const materials = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
    candidate.traverse = visitor => visitor(mesh);
    const previous = renderer.getRenderTarget();
    try {
      renderer.setRenderTarget(target);
      // Small canvas/atlas uploads are spread across the same idle slices. A
      // live video texture belongs to the media pipeline and is never touched.
      for (const material of materials) for (const value of Object.values(material)) {
        if (!(value instanceof THREE.Texture) || value instanceof THREE.VideoTexture || textures.get(value) === value.version) continue;
        const data = value.source.data as { complete?: boolean; width?: number; height?: number } | null;
        if (!data || data.complete === false || data.width === 0 || data.height === 0) continue;
        renderer.initTexture(value); textures.set(value, value.version);
      }
      const submitted = renderer.compileAsync(candidate, camera, scene);
      // compileAsync's polling follows material.currentProgram. The normal live
      // render can switch that pointer to a different, already-warm variant.
      // Capture this submission's programs as well, before rendering resumes.
      const programs = materials.map(material => (renderer.properties.get(material) as { currentProgram?: PendingProgram }).currentProgram)
        .filter((program): program is PendingProgram => Boolean(program));
      return Promise.all([submitted, waitForPrograms(programs, token)]).then(() => {});
    } finally { renderer.setRenderTarget(previous); }
  }
  function reveal(root: THREE.Object3D) {
    if (root.userData.unwrapAfterWarm && root.parent) {
      // Temporary identity wrappers must not combine independently culled rooms.
      const parent = root.parent;
      for (const child of [...root.children]) parent.add(child);
      parent.remove(root);
    } else root.visible = true;
  }
  function run() {
    ticket = 0;
    if (disposed || !active || busy || !jobs.length) return;
    jobs.sort((a, b) => b.priority - a.priority);
    const job = jobs.shift()!; running = job; busy = true;
    const token = generation, start = performance.now(), work: Promise<void>[] = [], completed: Renderable[] = [];
    try {
      while (job.cursor < job.meshes.length && work.length < 6 && (work.length === 0 || performance.now() - start < 3)) {
        const mesh = job.meshes[job.cursor++]; if (seen.has(mesh)) continue;
        work.push(compileMesh(mesh, token)); completed.push(mesh);
      }
    } catch (error) { work.push(Promise.reject(error)); }
    void Promise.all(work).then(() => {
      if (disposed || token !== generation) return;
      completed.forEach(mesh => seen.add(mesh));
      if (job.cursor < job.meshes.length) jobs.push(job);
      else {
        job.root.userData.programsReady = true;
        if (job.reveal) reveal(job.root);
        invalidate();
      }
    }).catch(error => {
      if (disposed || token !== generation) return;
      job.root.userData.programsFailed = true;
      if (job.reveal) reveal(job.root);
      console.warn(`Terminal deferred shader preparation failed for ${job.root.name || "scene"}.`, error);
    }).finally(() => {
      if (disposed || token !== generation) return;
      running = undefined; busy = false; invalidate(); schedule();
    });
  }
  return {
    get pendingCount() { return jobs.length + Number(Boolean(running)); },
    enqueue(root: THREE.Object3D, reveal = true) {
      if (disposed) return;
      const meshes: Renderable[] = [];
      root.traverse(object => { if ((object as Renderable).material) meshes.push(object as Renderable); });
      jobs.push({ root, meshes, cursor: 0, reveal, priority: reveal ? 1 : 0 }); schedule();
    },
    resume() { if (disposed) return; active = true; schedule(); },
    pause() {
      active = false; cancel(); generation++;
      if (running) { running.cursor = 0; jobs.unshift(running); running = undefined; }
      jobs.forEach(job => { job.cursor = 0; });
      seen = new WeakSet(); textures = new WeakMap(); busy = false;
    },
    dispose() { disposed = true; generation++; cancel(); jobs.length = 0; running = undefined; },
  };
}
