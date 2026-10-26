import * as THREE from "three";

/** A transparent fan mural painted onto the first concourse bay's left wall. */
export function createFilmWallArt(invalidate: () => void) {
  const root = new THREE.Group();
  root.name = "concourse-liverpool-wall-art";
  let disposed = false;
  const texture = new THREE.TextureLoader().load("/art/liverpool-wall-graffiti.svg", loaded => {
    if (disposed) loaded.dispose();
    else invalidate();
  }, undefined, () => { if (!disposed) invalidate(); });
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const geometry = new THREE.PlaneGeometry(3, 4);
  const material = new THREE.MeshStandardMaterial({
    map: texture, roughness: 1, metalness: 0,
    transparent: true, alphaTest: .035, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    // Keep red pigment readable in the deep bay while retaining physical light.
    emissive: "#ffffff", emissiveMap: texture, emissiveIntensity: .055,
  });
  material.name = "liverpool-sprayed-pigment";
  const mural = new THREE.Mesh(geometry, material);
  mural.name = "liverpool-liverbird-mural";
  // The walnut wall's inside face is x=-13.375. The 9mm clearance and
  // polygon offset prevent coplanar flicker without making a floating placard.
  mural.position.set(-13.366, 3, -53.8);
  mural.rotation.y = Math.PI / 2;
  mural.receiveShadow = true;
  root.add(mural);
  root.userData.source = "https://stadion-edge.liverpoolfc.com/images/lfc.svg";
  return {
    root,
    dispose() {
      if (disposed) return;
      disposed = true;
      geometry.dispose(); material.dispose(); texture.dispose(); root.clear();
    },
  };
}
