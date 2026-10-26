import * as THREE from 'three';

export type PaintedStageName = 'city' | 'atrium' | 'checkin' | 'security' | 'concourse' | 'gate';

export interface PaintedStages {
  groups: Record<PaintedStageName, THREE.Group>;
  /** Source-image UVs: (0, 0) is bottom left. Lift moves toward the camera. */
  project: (room: PaintedStageName, u: number, v: number, lift?: number) => THREE.Vector3;
  dispose: () => void;
}

const WIDTH = 35.56;
const HEIGHT = 20;
const REFERENCE_DISTANCE = 18;
type Point = readonly [number, number];

const saturate = (value: number) => Math.max(0, Math.min(1, value));
function smooth(a: number, b: number, value: number) {
  const t = saturate((value - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** Soft architectural silhouettes authored in source-image coordinates, top left origin. */
function silhouette(x: number, y: number, points: readonly Point[], feather = 0.025) {
  let inside = false;
  let distance = Infinity;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[j];
    const b = points[i];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const t = saturate(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy));
    distance = Math.min(distance, Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy));
  }
  return smooth(-feather, feather, inside ? distance : -distance);
}

const shapes = {
  atriumLeft: [[0, 0], [.26, 0], [.25, .75], [.10, 1], [0, 1]],
  atriumRib: [[.56, 0], [.68, 0], [1, .40], [1, .49], [.80, .27]],
  checkinColumn: [[0, 0], [.315, 0], [.315, .80], [.24, 1], [0, 1]],
  checkinDesk: [[.48, .48], [.81, .53], [.81, .87], [.51, .68]],
  checkinBelt: [[.81, .57], [1, .63], [1, 1], [.80, .76]],
  checkinBoard: [[.53, .21], [.81, 0], [.81, .18], [.53, .32]],
  securityColumn: [[0, 0], [.345, 0], [.345, .78], [.22, 1], [0, 1]],
  securityBelt: [[.66, .56], [1, .61], [1, 1], [.64, 1]],
  securityTraveler: [[.59, .36], [.66, .36], [.69, .58], [.65, .94], [.58, .94], [.56, .54]],
  securityMonitor: [[.845, .255], [.99, .20], [.99, .425], [.843, .445]],
  concourseRib: [[0, 0], [.13, 0], [.11, .50], [.06, .91], [0, 1]],
  concourseCafe: [[.13, .23], [.37, .36], [.37, .57], [.13, .77]],
  concourseSeatsLeft: [[.05, .65], [.26, .61], [.39, .84], [.28, 1], [0, 1]],
  concourseSeatsRight: [[.76, .65], [1, .61], [1, 1], [.82, 1]],
  gateRib: [[0, 0], [.12, 0], [.12, .60], [.06, 1], [0, 1]],
  gateSeats: [[.02, .57], [.32, .62], [.44, .91], [.33, 1], [0, 1]],
  gatePodium: [[.25, .48], [.37, .48], [.38, .72], [.26, .73]],
} satisfies Record<string, readonly Point[]>;

/** Depth follows foreground architecture, counters, and floor; windows stay distant. */
function depthAt(room: PaintedStageName, u: number, v: number) {
  const x = u;
  const y = 1 - v;
  const floor = (horizon: number, depth = 2.75) => depth * Math.pow(smooth(horizon, 1, y), 1.15);
  const mask = (points: readonly Point[], depth: number, feather?: number) => depth * silhouette(x, y, points, feather);
  let depth = 0;
  switch (room) {
    case 'city':
      depth = Math.max(.10, floor(.56, 2.35), .65 * smooth(.50, .80, y));
      break;
    case 'atrium':
      depth = Math.max(.12, floor(.54), mask(shapes.atriumLeft, 3), mask(shapes.atriumRib, 2.45));
      break;
    case 'checkin':
      depth = Math.max(.12, floor(.49), mask(shapes.checkinColumn, 3), mask(shapes.checkinDesk, 2.15), mask(shapes.checkinBelt, 2.65), mask(shapes.checkinBoard, 1.1));
      break;
    case 'security':
      depth = Math.max(.12, floor(.47), mask(shapes.securityColumn, 3), mask(shapes.securityBelt, 2.7), mask(shapes.securityTraveler, 2.25), mask(shapes.securityMonitor, 2.10, .012));
      break;
    case 'concourse':
      depth = Math.max(.10, floor(.47), mask(shapes.concourseRib, 3), mask(shapes.concourseCafe, 1.2), mask(shapes.concourseSeatsLeft, 2.8), mask(shapes.concourseSeatsRight, 2.55));
      break;
    case 'gate':
      depth = Math.max(.08, floor(.54, 2.4), mask(shapes.gateRib, 3), mask(shapes.gateSeats, 2.95), mask(shapes.gatePodium, 1.4));
      break;
  }
  return Math.max(0, Math.min(3, depth));
}

const assets: Record<PaintedStageName, string> = {
  city: '/art/terminal-city-v3.webp',
  atrium: '/art/terminal-atrium-v4.webp',
  checkin: '/art/checkin-v4.webp',
  security: '/art/security-v4.webp',
  concourse: '/art/concourse-v4.webp',
  gate: '/art/gate-v4.webp',
};

export function createPaintedStages(invalidate: () => void): PaintedStages {
  const groups = {} as Record<PaintedStageName, THREE.Group>;
  const geometries: THREE.PlaneGeometry[] = [];
  const materials: THREE.MeshBasicMaterial[] = [];
  const textures: THREE.Texture[] = [];
  const loader = new THREE.TextureLoader();
  let disposed = false;

  function project(room: PaintedStageName, u: number, v: number, lift = 0) {
    const z = depthAt(room, u, v) + lift;
    const compensation = (REFERENCE_DISTANCE - z) / REFERENCE_DISTANCE;
    return new THREE.Vector3((u - .5) * WIDTH * compensation, (v - .5) * HEIGHT * compensation, z);
  }

  for (const room of Object.keys(assets) as PaintedStageName[]) {
    const group = new THREE.Group();
    group.name = `painted-${room}`;
    group.visible = false;
    group.userData = { source: assets[room], loaded: false, referenceDistance: REFERENCE_DISTANCE, width: WIDTH, height: HEIGHT, depthRange: [0, 3] };
    groups[room] = group;

    const geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT, 64, 40);
    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    for (let i = 0; i < position.count; i++) {
      const point = project(room, uv.getX(i), uv.getY(i));
      position.setXYZ(i, point.x, point.y, point.z);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    geometries.push(geometry);

    const texture = loader.load(assets[room], (loaded) => {
      if (disposed) {
        loaded.dispose();
        return;
      }
      group.userData.loaded = true;
      invalidate();
    }, undefined, () => {
      if (disposed) return;
      group.userData.failed = true;
      invalidate();
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    textures.push(texture);

    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, toneMapped: false });
    materials.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `${room}-depth-painting`;
    group.add(mesh);
  }

  return {
    groups,
    project,
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const group of Object.values(groups)) group.clear();
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      for (const texture of textures) texture.dispose();
    },
  };
}
