import * as THREE from "three";

export interface IllustratedTraveler {
  /** Hip-centred artwork, standing feet at y=0, about 2m tall; front faces +Z. */
  root: THREE.Group;
  /** Deformed left-hand grip, for the external rope endpoint. */
  raisedHand: THREE.Object3D;
  ready: Promise<void>;
  update: (hero: number, time: number, grounded: number) => void;
  dispose: () => void;
}

type Point = readonly [number, number];
type Pose = {
  name: string; file: string; height: number; hip: Point; hand: Point;
  leftShoulder: Point; leftElbow: Point; rightShoulder: Point; rightHand: Point;
  leftKnee: Point; leftFoot: Point; rightKnee: Point; rightFoot: Point;
  caseCentre: Point;
};
const POSES: Pose[] = [
  { name: "reach", file: "traveler-swing-reach.webp", height: 2.65, hip: [.40,.445], hand: [.126,.033], leftShoulder: [.32,.24], leftElbow: [.23,.135], rightShoulder: [.54,.32], rightHand: [.706,.527], leftKnee: [.14,.50], leftFoot: [.18,.69], rightKnee: [.54,.64], rightFoot: [.70,.97], caseCentre: [.83,.76] },
  { name: "tuck", file: "traveler-swing-tuck.webp", height: 2.65, hip: [.42,.49], hand: [.17,.035], leftShoulder: [.32,.29], leftElbow: [.245,.17], rightShoulder: [.55,.36], rightHand: [.73,.56], leftKnee: [.20,.45], leftFoot: [.30,.72], rightKnee: [.27,.58], rightFoot: [.43,.76], caseCentre: [.82,.82] },
  { name: "release", file: "traveler-swing-release.webp", height: 2.65, hip: [.39,.44], hand: [.09,.065], leftShoulder: [.34,.255], leftElbow: [.22,.17], rightShoulder: [.54,.31], rightHand: [.74,.443], leftKnee: [.26,.54], leftFoot: [.12,.655], rightKnee: [.56,.66], rightFoot: [.72,.94], caseCentre: [.84,.62] },
  { name: "standing", file: "traveler-v2.webp", height: 2.05, hip: [.39,.45], hand: [.25,.43], leftShoulder: [.28,.20], leftElbow: [.23,.33], rightShoulder: [.60,.23], rightHand: [.70,.465], leftKnee: [.29,.67], leftFoot: [.22,.968], rightKnee: [.51,.69], rightFoot: [.57,.968], caseCentre: [.78,.76] },
];
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (low: number, high: number, value: number) => {
  const t = clamp((value - low) / (high - low));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
function segmentDistance(u: number, v: number, a: Point, b: Point) {
  const x = b[0] - a[0], y = b[1] - a[1];
  const t = clamp(((u-a[0])*x + (v-a[1])*y) / (x*x+y*y || 1));
  return Math.hypot(u-a[0]-t*x, v-a[1]-t*y);
}
function region(u: number, v: number, a: Point, b: Point, width: number) {
  return 1 - smooth(width * .45, width, segmentDistance(u, v, a, b));
}

type Weights = { arm: number; elbow: number; rightArm: number; leftLeg: number; rightLeg: number; leftKnee: number; rightKnee: number; suitcase: number };
function weights(p: Pose, u: number, v: number): Weights {
  const belowHand = smooth(p.rightHand[1]-.008, p.rightHand[1]+.025, v);
  const caseEdge = mix(p.rightHand[0]-.032, p.caseCentre[0]-.13, smooth(p.rightHand[1], p.caseCentre[1], v));
  const suitcase = belowHand * smooth(caseEdge-.018, caseEdge+.025, u);
  const leftLeg = Math.max(region(u,v,p.hip,p.leftKnee,.15),region(u,v,p.leftKnee,p.leftFoot,.145)) * (1-suitcase);
  const rightLeg = Math.max(region(u,v,p.hip,p.rightKnee,.14),region(u,v,p.rightKnee,p.rightFoot,.14)) * (1-suitcase);
  const legTotal = Math.max(1, leftLeg+rightLeg);
  return {
    arm: Math.max(region(u,v,p.leftShoulder,p.leftElbow,.12),region(u,v,p.leftElbow,p.hand,.095)),
    elbow: region(u,v,p.leftElbow,p.hand,.095) * smooth(.01,.12,Math.hypot(u-p.leftElbow[0],v-p.leftElbow[1])),
    rightArm: Math.max(region(u,v,p.rightShoulder,p.rightHand,.10),suitcase),
    leftLeg: leftLeg/legTotal, rightLeg: rightLeg/legTotal,
    leftKnee: region(u,v,p.leftKnee,p.leftFoot,.13) * (1-suitcase),
    rightKnee: region(u,v,p.rightKnee,p.rightFoot,.13) * (1-suitcase),
    suitcase,
  };
}

type Angles = { arm: number; elbow: number; rightArm: number; leftLeg: number; rightLeg: number; leftKnee: number; rightKnee: number; suitcase: number; bend: number; breath: number; depth: number };

/** A deforming illustrated puppet: original artwork is never recoloured or replaced. */
export function createIllustratedTraveler(options: { loader?: THREE.TextureLoader; invalidate?: () => void } = {}): IllustratedTraveler {
  const loader = options.loader ?? new THREE.TextureLoader();
  const root = new THREE.Group(); root.name = "illustrated-traveler";
  root.userData.rig = "original-painted-puppet";
  const body = new THREE.Group(); root.add(body);
  const raisedHand = new THREE.Object3D(); raisedHand.name = "illustrated-left-grip"; body.add(raisedHand);
  const hipHeight = 2.05 * (.968-.45);
  const textures: THREE.Texture[] = [];
  let dead = false;
  const loads: Promise<void>[] = [];
  const layers = POSES.map(pose => {
    const geometry = new THREE.PlaneGeometry(pose.height * 683/1024, pose.height, 32, 48);
    const position = geometry.getAttribute("position") as THREE.BufferAttribute;
    position.setUsage(THREE.DynamicDrawUsage);
    const uv = geometry.getAttribute("uv");
    const bind = Array.from({length:position.count}, (_,index) => {
      const u=uv.getX(index),v=1-uv.getY(index);
      return {u,v,w:weights(pose,u,v)};
    });
    let resolveLoad: () => void = () => {};
    loads.push(new Promise<void>(resolve => { resolveLoad=resolve; }));
    const texture = loader.load(`/art/${pose.file}`, () => {
      if(dead) texture.dispose();
      else { layer.loaded=true; options.invalidate?.(); }
      resolveLoad();
    }, undefined, () => { root.userData.assetError=pose.file; resolveLoad(); options.invalidate?.(); });
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=4;
    textures.push(texture);
    const material = new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.04,depthWrite:true,side:THREE.DoubleSide,toneMapped:false,fog:false});
    const mesh = new THREE.Mesh(geometry,material); mesh.name=`painted-traveler-${pose.name}`;
    mesh.frustumCulled=false; mesh.visible=false; body.add(mesh);
    const layer={pose,geometry,material,mesh,position,bind,loaded:false};
    return layer;
  });
  const temporary=new THREE.Vector3();
  const pivot=new THREE.Vector3();
  function local(p: Pose, u: number, v: number, target: THREE.Vector3) {
    return target.set((u-p.hip[0])*p.height*683/1024,(p.hip[1]-v)*p.height,0);
  }
  function rotate(target: THREE.Vector3, x: number, y: number, angle: number) {
    const dx=target.x-x,dy=target.y-y,c=Math.cos(angle),s=Math.sin(angle);
    target.x=x+dx*c-dy*s;target.y=y+dx*s+dy*c;
  }
  function deform(p: Pose, u: number, v: number, w: Weights, a: Angles, target: THREE.Vector3) {
    local(p,u,v,target);
    local(p,p.leftShoulder[0],p.leftShoulder[1],pivot); rotate(target,pivot.x,pivot.y,a.arm*w.arm);
    local(p,p.leftElbow[0],p.leftElbow[1],pivot); rotate(target,pivot.x,pivot.y,a.elbow*w.elbow);
    local(p,p.rightShoulder[0],p.rightShoulder[1],pivot); rotate(target,pivot.x,pivot.y,a.rightArm*w.rightArm);
    const shoulderX=pivot.x,shoulderY=pivot.y;
    local(p,p.rightHand[0],p.rightHand[1],pivot); rotate(pivot,shoulderX,shoulderY,a.rightArm);
    rotate(target,pivot.x,pivot.y,a.suitcase*w.suitcase);
    rotate(target,0,0,a.leftLeg*w.leftLeg+a.rightLeg*w.rightLeg);
    local(p,p.leftKnee[0],p.leftKnee[1],pivot); rotate(target,pivot.x,pivot.y,a.leftKnee*w.leftKnee);
    local(p,p.rightKnee[0],p.rightKnee[1],pivot); rotate(target,pivot.x,pivot.y,a.rightKnee*w.rightKnee);
    const upper=1-smooth(p.hip[1]-.02,p.hip[1]+.12,v);
    rotate(target,0,0,a.bend*upper);
    target.y+=a.breath*upper;
    // Shallow sculpted depth keeps the painted backpack and head dimensional in parallax.
    const torso=Math.exp(-((u-.43)**2/.04+(v-.34)**2/.065));
    const head=Math.exp(-((u-.43)**2/.022+(v-.20)**2/.018));
    target.z=.10*torso+.045*head+a.depth*(u-.4)*upper-.025*w.suitcase;
    return target;
  }
  let lastHero=0,lastTime=0,lastGround=0;
  function update(hero: number, time: number, grounded: number) {
    if(dead)return;
    lastHero=clamp(hero);lastTime=time;lastGround=clamp(grounded);
    const h=lastHero,g=lastGround;
    // Deliberate animation-on-twos pose cuts at compression, release, and foot contact.
    const desired=h<.285?0:h<.565?1:h<.855?2:3;
    const active=layers[desired].loaded?desired:layers.findIndex(layer=>layer.loaded);
    layers.forEach((layer,index)=>{layer.mesh.visible=index===active;});
    if(active<0)return;
    const layer=layers[active],p=layer.pose;
    const air=1-g,phase=h*Math.PI*2;
    const impact=Math.exp(-(((h-.90)/.045)**2));
    const a:Angles={
      arm:air*(.07*Math.sin(phase*1.1)-.025),elbow:air*.055*Math.sin(phase*1.7),
      rightArm:air*.07*Math.sin(phase-.9),
      leftLeg:air*.10*Math.sin(phase*1.25+.6),rightLeg:air*.07*Math.sin(phase*1.25-1.0),
      leftKnee:air*.085*Math.sin(phase*1.5-.2)+impact*.10,rightKnee:air*.065*Math.sin(phase*1.5+1.2)-impact*.08,
      suitcase:air*.13*Math.sin(phase*1.4-1.1)+impact*.065,
      bend:air*.045*Math.sin(phase-.4)-impact*.045,
      breath:g*.002*Math.sin(time*2.4),depth:air*.07*Math.sin(phase),
    };
    for(let i=0;i<layer.bind.length;i++){
      const b=layer.bind[i];deform(p,b.u,b.v,b.w,a,temporary);
      layer.position.setXYZ(i,temporary.x,temporary.y,temporary.z);
    }
    layer.position.needsUpdate=true;
    body.rotation.set(air*.035*Math.sin(phase),air*.09*Math.sin(phase-.4),air*(.055*Math.sin(phase)-.025));
    body.scale.set(1+impact*.015,1-impact*.035,1);
    body.position.set(0,hipHeight,0);
    // Ground correction is sampled from the actual deformed shoes, never the rectangle.
    body.updateMatrix();
    let footY=Infinity;
    for(const foot of [p.leftFoot,p.rightFoot]) {
      deform(p,foot[0],foot[1],weights(p,foot[0],foot[1]),a,temporary).applyMatrix4(body.matrix);
      footY=Math.min(footY,temporary.y);
    }
    body.position.y-=footY*g;
    deform(p,p.hand[0],p.hand[1],weights(p,p.hand[0],p.hand[1]),a,raisedHand.position);
    root.userData.pose=p.name;root.userData.hero=h;
  }
  const ready=Promise.all(loads).then(()=>{if(!dead){root.userData.ready=true;update(lastHero,lastTime,lastGround);options.invalidate?.();}});
  return {root,raisedHand,ready,update,dispose(){
    if(dead)return;dead=true;
    for(const layer of layers){layer.geometry.dispose();layer.material.dispose();}
    for(const texture of textures)texture.dispose();
    root.clear();
  }};
}
