import * as THREE from "three";
import { careerArrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { memorySequence } from "./memorySequence";

type V3 = [number,number,number];
type CameraKey = {at:number;position:V3;target:V3;roll:number;fov:number};
const CAMERA:CameraKey[] = [
 {at:0,position:[6,7.8,11],target:[-1,2,-25],roll:-.20,fov:67},
 {at:.055,position:[4,6.8,0],target:[-1,2,-25],roll:.13,fov:68},
 {at:.112,position:[-3,5,-7],target:[1,1.7,-29],roll:-.12,fov:72},
 {at:.175,position:[4,2.7,-12],target:[-2,1.7,-28],roll:.09,fov:64},
 {at:.24,position:[4.7,1.85,-18.4],target:[-4,1.7,-27],roll:0,fov:58},
 {at:.39,position:[3.6,1.85,-20.8],target:[-4.2,1.7,-27.5],roll:0,fov:58},
 {at:.45,position:[1.3,1.75,-33.5],target:[2.7,1.8,-43],roll:-.025,fov:62},
 {at:.635,position:[1.3,1.75,-35.5],target:[2.7,1.8,-43],roll:0,fov:62},
 {at:.641,position:[1.3,1.75,-39.8],target:[1.3,1.65,-48],roll:.015,fov:65},
 {at:.65,position:[-4,2.6,-53.5],target:[-11.9,3.1,-54.5],roll:0,fov:65},
 {at:.675,position:[-4,2.6,-53.5],target:[-11.9,3.1,-54.5],roll:0,fov:65},
 {at:.705,position:[-4,2.6,-58.2],target:[-11.9,3.1,-59.2],roll:-.015,fov:65},
 {at:.72,position:[-4,2.6,-64.5],target:[-11.9,3.1,-65.5],roll:0,fov:65},
 {at:.745,position:[-4,2.6,-64.5],target:[-11.9,3.1,-65.5],roll:0,fov:65},
 {at:.775,position:[-4,2.6,-69.2],target:[-11.9,3.1,-70.2],roll:.015,fov:65},
 {at:.79,position:[-4,2.6,-75.5],target:[-11.9,3.1,-76.5],roll:0,fov:65},
 {at:.815,position:[-4,2.6,-75.5],target:[-11.9,3.1,-76.5],roll:0,fov:65},
 {at:.845,position:[-4,2.6,-80.2],target:[-11.9,3.1,-81.2],roll:0,fov:65},
 {at:.86,position:[1.5,1.9,-83],target:[-1,2.3,-101],roll:0,fov:61},
 {at:.93,position:[.5,1.8,-87],target:[0,2.5,-110],roll:0,fov:58},
 {at:1,position:[.5,1.8,-87],target:[0,2.8,-112],roll:0,fov:58},
];
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const smooth=(v:number)=>v*v*(3-2*v);

export interface TerminalWorldState { t:number; reduced:boolean; experienceIndex:number; projectIndex:number; departure:number; aspect:number }
export interface TerminalModel {
 scene:THREE.Scene; camera:THREE.PerspectiveCamera; photos:THREE.Object3D[];
 update:(state:TerminalWorldState)=>void; dispose:()=>void;
}

export function createTerminalModel(invalidate:()=>void):TerminalModel {
 const scene=new THREE.Scene();scene.background=new THREE.Color("#172e45");scene.fog=new THREE.Fog("#5a4560",38,145);
 const camera=new THREE.PerspectiveCamera(63,1,.08,300);
 const textures=new Set<THREE.Texture>(),materials=new Set<THREE.Material>(),geometries=new Set<THREE.BufferGeometry>();
 let dead=false;
 const keepGeometry=<T extends THREE.BufferGeometry>(g:T)=>{geometries.add(g);return g;};
 const keepMaterial=<T extends THREE.Material>(m:T)=>{materials.add(m);return m;};
 const textureLoader=new THREE.TextureLoader();
 const texture=(src:string)=>{const tx=textureLoader.load(src,()=>{if(dead)tx.dispose();else invalidate();},undefined,()=>invalidate());tx.colorSpace=THREE.SRGBColorSpace;textures.add(tx);return tx;};
 const canvasTexture=(draw:(ctx:CanvasRenderingContext2D,w:number,h:number)=>void,w=1024,h=512)=>{
  const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;const ctx=canvas.getContext("2d")!;draw(ctx,w,h);
  const tx=new THREE.CanvasTexture(canvas);tx.colorSpace=THREE.SRGBColorSpace;textures.add(tx);return tx;
 };
 const paint=texture("/art/terminal-paint-material.webp");paint.wrapS=paint.wrapT=THREE.RepeatWrapping;paint.anisotropy=8;
 const ramp=new THREE.DataTexture(new Uint8Array([45,45,45,255,115,115,115,255,200,200,200,255,255,255,255,255]),4,1,THREE.RGBAFormat);ramp.minFilter=ramp.magFilter=THREE.NearestFilter;ramp.needsUpdate=true;textures.add(ramp);
 const toon=(color:string,painted=true)=>{
  const material=keepMaterial(new THREE.MeshToonMaterial({color,gradientMap:ramp,...(painted?{map:paint}:{})}));
  if(painted){
   material.customProgramCacheKey=()=>"terminal-physical-paint-1";
   material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace("#include <common>","#include <common>\nvarying vec3 vPaintWorld; varying vec3 vPaintNormal;")
     .replace("#include <defaultnormal_vertex>","#include <defaultnormal_vertex>\nvPaintNormal = inverseTransformDirection(transformedNormal, viewMatrix);")
     .replace("#include <project_vertex>",`vec4 paintPoint = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
       paintPoint = instanceMatrix * paintPoint;
      #endif
      vPaintWorld = (modelMatrix * paintPoint).xyz;
      #include <project_vertex>`);
    shader.fragmentShader=shader.fragmentShader.replace("#include <common>","#include <common>\nvarying vec3 vPaintWorld; varying vec3 vPaintNormal;")
     .replace("#include <map_fragment>",`#ifdef USE_MAP
      vec3 paintWeight = pow(abs(normalize(vPaintNormal)), vec3(5.0));
      paintWeight /= max(dot(paintWeight, vec3(1.0)), 0.001);
      vec3 paintColor = texture2D(map, vPaintWorld.yz * 0.34).rgb * paintWeight.x
       + texture2D(map, vPaintWorld.xz * 0.34).rgb * paintWeight.y
       + texture2D(map, vPaintWorld.xy * 0.34).rgb * paintWeight.z;
      diffuseColor.rgb *= mix(vec3(1.0), paintColor * 1.42, 0.52);
      #endif`);
   };
  }
  return material;
 };
 const ink=toon("#071326",false),steel=toon("#397c91"),concrete=toon("#efc5ad"),coral=toon("#ff705d"),magenta=toon("#b62668"),cyan=toon("#32c7e1"),gold=toon("#ffc777"),floorMat=toon("#344b69"),cream=toon("#f7e0b8"),dark=toon("#25354f");
 const wallMaterial=toon("#efbcc6");
 const glow=(color:string)=>keepMaterial(new THREE.MeshBasicMaterial({color}));
 const lightWarm=glow("#ffce87"),lightCyan=glow("#70ebf4");
 const glass=keepMaterial(new THREE.MeshBasicMaterial({color:"#6cb3c2",transparent:true,opacity:.1,depthWrite:false,side:THREE.DoubleSide}));
 const outline=keepMaterial(new THREE.LineBasicMaterial({color:"#091122",transparent:true,opacity:.72}));
 scene.add(new THREE.HemisphereLight("#85dce9","#bd2c6b",.82));
 const key=new THREE.DirectionalLight("#ffbd86",3.2);key.position.set(20,24,0);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-24;key.shadow.camera.right=24;key.shadow.camera.top=24;key.shadow.camera.bottom=-24;key.shadow.camera.near=1;key.shadow.camera.far=95;key.shadow.bias=-.00035;key.shadow.normalBias=.025;scene.add(key,key.target);
 const cool=new THREE.DirectionalLight("#35c8ec",.85);cool.position.set(-12,7,10);scene.add(cool);
 const pink=new THREE.DirectionalLight("#fb397f",.9);pink.position.set(-18,5,-70);scene.add(pink);
 const unitBox=keepGeometry(new THREE.BoxGeometry(1,1,1));
 const staticBoxes=new Map<THREE.Material,THREE.Matrix4[]>(),edgePoints:number[]=[];
 const unitEdges=keepGeometry(new THREE.EdgesGeometry(unitBox)).getAttribute("position");
 const block=(w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material=steel,rotation:V3=[0,0,0],edges=false)=>{
  const matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(w,h,d));
  const batch=staticBoxes.get(mat)??[];batch.push(matrix);staticBoxes.set(mat,batch);
  if(edges){const p=new THREE.Vector3();for(let i=0;i<unitEdges.count;i++){p.fromBufferAttribute(unitEdges,i).applyMatrix4(matrix);edgePoints.push(p.x,p.y,p.z);}}
 };
 const meshBlock=(w:number,h:number,d:number,mat:THREE.Material,parent:THREE.Object3D,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(unitBox,mat);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 const cylinderGeometry=keepGeometry(new THREE.CylinderGeometry(1,1,1,8));
 const staticRods=new Map<THREE.Material,THREE.Matrix4[]>();
 const rod=(a:V3,b:V3,r:number,mat:THREE.Material=steel)=>{const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),center=from.clone().add(to).multiplyScalar(.5),length=from.distanceTo(to),rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),to.sub(from).normalize());const batch=staticRods.get(mat)??[];batch.push(new THREE.Matrix4().compose(center,rotation,new THREE.Vector3(r,length,r)));staticRods.set(mat,batch);};
 const planeGeometry=keepGeometry(new THREE.PlaneGeometry(1,1));
 const plane=(w:number,h:number,tx:THREE.Texture,parent:THREE.Object3D=scene,transparent=false)=>{const mat=keepMaterial(new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide,transparent,alphaTest:transparent?.04:0,depthWrite:!transparent}));const mesh=new THREE.Mesh(planeGeometry,mat);mesh.scale.set(w,h,1);parent.add(mesh);return mesh;};
 const label=(title:string,subtitle:string,color="#ffc66f",w=1024,h=256)=>canvasTexture((ctx,W,H)=>{ctx.fillStyle="#081929";ctx.fillRect(0,0,W,H);ctx.fillStyle=color;ctx.fillRect(0,0,W,9);ctx.font=`700 ${H*.12}px Arial`;ctx.fillStyle="#a8d5d6";ctx.fillText(subtitle,35,H*.28);ctx.fillStyle="#fff1d6";ctx.font=`900 ${H*.32}px Arial`;ctx.fillText(title,32,H*.72,W-65);ctx.fillStyle=color;ctx.font=`900 ${H*.32}px Arial`;},w,h);
 const sign=(title:string,subtitle:string,x:number,y:number,z:number,w=7,h=1.5)=>{block(w+.18,h+.18,.2,x,y,z-.12,ink,[0,0,0],true);const p=plane(w,h,label(title,subtitle));p.position.set(x,y,z);rod([x-w*.35,y+h*.5,z],[x-w*.35,8.7,z],.035);rod([x+w*.35,y+h*.5,z],[x+w*.35,8.7,z],.035);return p;};

 // A continuous 120-metre concourse with a vaulted steel roof and window wall.
 block(29,.45,126,0,-.26,-47,floorMat,[0,0,0],true);
 block(.5,7.8,124,-14,3.8,-47,wallMaterial);
 block(.12,1.0,124,-13.68,.5,-47,magenta);
 block(.12,.14,124,-13.56,1.1,-47,cyan);
 block(.6,.8,124,14,.4,-47,ink);
 for(let z=12;z>=-105;z-=6){
  block(.24,9.7,.3,14,4.85,z,steel,[0,0,0],true);block(.07,9.7,.06,13.82,4.85,z+.19,lightCyan);
  block(.24,9.7,.3,-14,4.85,z,steel,[0,0,0],true);
  block(28,.2,.28,0,8.9,z,steel,[0,0,0],true);
  for(const y of [3,6])block(.18,.13,6,14,y,z-3,steel);
  block(.04,8.1,5.7,14.06,4.7,z-3,glass);
  const curve=new THREE.CatmullRomCurve3(Array.from({length:15},(_,i)=>{const x=-14+i*2;return new THREE.Vector3(x,8.8+3.4*Math.sin(i/14*Math.PI),z);}));
  const rib=new THREE.Mesh(keepGeometry(new THREE.TubeGeometry(curve,28,.11,5,false)),steel);scene.add(rib);
  for(const x of [-10,-5,0,5,10]){const roofY=8.8+3.4*Math.cos(x/14*Math.PI/2);rod([x,8.9,z],[x,roofY,z],.035,cyan);}
  block(3.3,.07,.14,-8,8.72,z,lightWarm);block(3.3,.07,.14,8,8.72,z,lightWarm);
 }
 // Long roof sheets leave a glazed spine, visible in the opening dive.
 block(8.8,.14,124,-9.7,10.5,-47,dark,[0,0,.23]);block(8.8,.14,124,9.7,10.5,-47,dark,[0,0,-.23]);
 block(11.2,.045,124,0,12.12,-47,glass);
 for(const x of [-12,-8,-4,0,4,8,12])block(.03,.015,124,x,.005,-47,ink);
 for(let z=12;z>=-107;z-=4)block(28,.015,.025,0,.006,z,ink);
 for(let z=8;z>=-105;z-=3){block(.1,.02,1.55,4.2,.02,z,gold);block(.07,.02,1.55,4.45,.02,z,cyan);}
 // The photographic world sits outside real glazing, behind the geometry.
 const outside=plane(500,180,texture("/plates/dawn-paint-2000.webp"));outside.position.set(70,35,-75);outside.rotation.y=-Math.PI/2;
 const runway=plane(500,180,texture("/plates/runway-paint-2000.webp"));runway.position.set(0,35,-224);
 (outside.material as THREE.MeshBasicMaterial).fog=false;(runway.material as THREE.MeshBasicMaterial).fog=false;
 // Projected pools of coloured window light are laid onto the floor in perspective.
 for(let z=-5;z>-105;z-=12){block(14,.013,4,6.8,.025,z,keepMaterial(new THREE.MeshBasicMaterial({color:"#ff8b6f",transparent:true,opacity:.17,depthWrite:false})),[0,.32,0]);block(11,.014,.14,7.7,.028,z+2.4,lightWarm,[0,.32,0]);}
 sign("DEPARTURES  /  A01—A09","TERMINAL A",0,6.5,0,10,1.6);
 sign("CHECK-IN","01  /  EXPERIENCE",-4,5.6,-24,11,1.5);

 // Five actual check-in stations: plinth, front fascia, countertop, luggage
 // scale and a desk monitor, backed by distinct airline-style display boards.
 const deskLights:THREE.Mesh[]=[];
 careerArrivals.forEach((entry,i)=>{
  const x=-10.7+i*2.85,z=-27;
  block(2.5,.92,1.1,x,.48,z,concrete,[0,0,0],true);block(2.65,.14,1.42,x,1.02,z+.05,ink,[0,0,0],true);
  block(2.38,.68,.055,x,.5,z+.59,i%2?magenta:coral);block(2.4,.065,.08,x,.91,z+.65,lightCyan);
  block(.6,.3,.5,x+.77,.17,z+1.0,dark,[0,0,0],true);block(.63,.05,1.4,x+.77,.35,z+1.0,steel);
  for(let n=0;n<9;n++)rod([x+.48,.4,z+.4+n*.13],[x+1.04,.4,z+.4+n*.13],.035,ink);
  block(.12,.45,.12,x-.45,1.28,z,steel);block(.68,.45,.08,x-.45,1.57,z+.02,ink,[0,0,0],true);
  const screen=plane(.59,.34,label("0"+(i+1),entry.origin.toUpperCase(),"#5de1e7",512,256));screen.position.set(x-.45,1.57,z+.07);
  const board=plane(2.55,1.1,label(entry.from.toUpperCase(),entry.title.toUpperCase(),i===2?"#ff6d7c":"#69d9e2"));board.position.set(x,3.45,z-.75);
  block(2.72,1.23,.18,x,3.45,z-.89,ink,[0,0,0],true);
  const indicator=new THREE.Mesh(unitBox,lightWarm);indicator.scale.set(2.38,.08,.09);indicator.position.set(x,1.13,z+.8);scene.add(indicator);deskLights.push(indicator);
  const number=plane(.56,.35,label("0"+(i+1),"", "#ffc66f",256,128));number.position.set(x,.53,z+.63);
 });
 // Queue stanchions and the escape lane stay outside the walking route.
 for(let n=0;n<5;n++){const z=-18-n*1.5;for(const x of [-11,-6]){rod([x,0,z],[x,1.02,z],.045,steel);block(.4,.06,.4,x,.03,z,ink);}
  block(4.9,.055,.035,-8.5,.96,z,magenta);
 }
 // Security is a real doorway. The route crosses its front and rear planes.
 const archZ=-43,archX=1.3;
 block(.48,3.35,.95,archX-1.5,1.68,archZ,cream,[0,0,0],true);block(.48,3.35,.95,archX+1.5,1.68,archZ,cream,[0,0,0],true);block(3.5,.48,.95,archX,3.18,archZ,ink,[0,0,0],true);
 for(const x of [archX-1.26,archX+1.26]){block(.045,2.8,.07,x,1.47,archZ+.5,lightCyan);block(.045,2.8,.07,x,1.47,archZ-.5,magenta);}
 block(2.5,.035,.14,archX,.025,archZ,gold);sign("SECURITY  /  KEEP BUILDING","02  /  PROJECTS",.6,5.6,-40,8,1.45);
 // X-ray tunnel, rubber entrance strips, conveyor rollers and monitor stand.
 block(2.35,2.1,2.8,6.2,1.35,-43,steel,[0,0,0],true);block(1.66,1.35,.07,6.2,1.15,-41.55,ink);
 for(let i=0;i<9;i++)block(.145,1.17,.05,5.55+i*.165,1.13,-41.49,dark,[0,0,(i%3-1)*.025]);
 block(2.05,.25,7.7,6.2,.68,-42,ink,[0,0,0],true);for(let i=0;i<34;i++)rod([5.25,.83,-38.3-i*.22],[7.15,.83,-38.3-i*.22],.055,i%3?steel:cyan);
 for(const z of [-39,-45]){block(.16,.7,.16,5.4,.35,z,steel);block(.16,.7,.16,7,.35,z,steel);}
 block(.2,1.5,.2,5.05,.75,-40.6,steel);block(3.0,2.0,.18,5.05,2.35,-40.6,ink,[0,0,0],true);
 const projectScreens=projects.map(project=>{const image=plane(2.8,1.8,texture(project.screenshot));image.position.set(5.05,2.35,-40.49);return image;});
 const trays:THREE.Group[]=[];
 projects.forEach((_,i)=>{const group=new THREE.Group();scene.add(group);group.position.set(6.2,.98,-38.4-i*1.35);meshBlock(1.55,.13,1,cream,group);for(const x of [-.77,.77])meshBlock(.08,.25,1,cyan,group,x,.09,0);for(const z of [-.49,.49])meshBlock(1.55,.25,.07,cyan,group,0,.09,z);meshBlock(.75,.09,.51,i%2?coral:ink,group,0,.14,0);meshBlock(.75,.46,.045,ink,group,0,.39,-.21).rotation.x=-.25;trays.push(group);});

 // Nine photographs belong to the terminal wall; their physical frames cast
 // readable silhouettes and vanish behind foreground columns as we walk by.
 const photos:THREE.Object3D[]=[];
 memorySequence.forEach((memory,i)=>{
  const slot=i%3,aspect=memory.width/memory.height,anchor=slot===0;
  const w=anchor?(memory.group===1?4.9:4.7):(aspect<1?1.72:2.65),h=w/aspect;
  const z=-57-memory.group*11-(anchor?0:4.2),y=anchor?3.1:(aspect<1?4.45:1.95);
  const group=new THREE.Group();group.position.set(-11.9,y,z);group.rotation.y=Math.PI/2;scene.add(group);
  meshBlock(w+.24,h+.24,.13,cream,group);meshBlock(w+.38,h+.38,.12,ink,group,0,0,-.12);
  if(anchor){meshBlock(w+.24,.05,.09,lightWarm,group,0,h*.5+.13,.09);meshBlock(w+.24,.04,.09,lightCyan,group,0,-h*.5-.13,.09);}
  const image=plane(w,h,texture(memory.src),group);image.position.z=.075;image.userData.photoIndex=memory.photoIndex;photos.push(image);
  const plaque=plane(w,.3,label(String(i+1).padStart(2,"0"),memory.caption.toUpperCase(),"#ffc978",1024,128),group);plaque.position.set(0,-h*.5-.32,.08);
  if(anchor){rod([-13.5,6.15,z],[-10.8,6.15,z],.045,ink);block(1.5,.09,.3,-11.7,6.13,z,lightWarm);}
 });
 sign("A FEW THINGS I’D TAKE WITH ME","03  /  THE CONCOURSE",1,6.3,-53,10,1.55);
 // Furniture is a repeated bent-shell seat, with steel legs and a shared rail.
 for(const z of [-77,-84,-91])for(const side of [-1,1]){
  const center=side*8.4;block(5.8,.12,.14,center,.54,z,steel);
  for(let i=0;i<4;i++){const x=center-2.1+i*1.4;block(1.12,.16,.94,x,.72,z,side<0?magenta:dark,[.06,0,0],true);block(1.12,1,.16,x,1.21,z-.47,side<0?magenta:dark,[-.11,0,0],true);block(1.05,.04,.045,x,1.72,z-.56,cyan);for(const dx of [-.45,.45]){rod([x+dx,0,z+.3],[x+dx,.65,z+.25],.035,steel);rod([x+dx,0,z-.32],[x+dx,.65,z-.25],.035,steel);}}
 }
 // Personal objects are small things left on real furniture, not UI cards.
 block(1.3,.14,4.6,-11.25,1.05,-66,cream,[0,0,0],true);
 for(const z of [-64.1,-67.9])block(.12,1.0,.12,-11.15,.5,z,steel);
 const matcha=plane(.5,.75,texture("/art/matcha-v1.webp"),scene,true);matcha.position.set(-10.9,1.45,-64.5);matcha.rotation.y=Math.PI/2;
 const shawarma=plane(.83,.76,texture("/art/shawarma-v1.webp"),scene,true);shawarma.position.set(-10.9,1.46,-65.6);shawarma.rotation.y=Math.PI/2;
 const nihari=plane(.85,.57,texture("/art/nihari.webp"),scene,true);nihari.position.set(-10.9,1.36,-66.9);nihari.rotation.y=Math.PI/2;
 const carryon=plane(1.55,1.42,texture("/art/carryon-easter-eggs.webp"),scene,true);carryon.position.set(-7.8,1.5,-76.6);
 block(2.4,.12,1.2,8.1,1.1,-81.7,cream,[0,0,0],true);rod([8.1,0,-81.7],[8.1,1.1,-81.7],.1,steel);
 const television=plane(2.1,1.92,texture("/art/film-v1.webp"),scene,true);television.position.set(8.1,2.1,-81.7);
 // Final gate desk, glazing, and an actual jetway leading out to the aircraft.
 sign("GATE A  /  STILL BOARDING","04  /  NEXT CHAPTER",3.2,4.8,-102,7.4,1.2);
 block(3.4,1.1,1.1,-5,.56,-95,concrete,[0,0,0],true);block(3.6,.14,1.4,-5,1.17,-95,ink,[0,0,0],true);block(3.2,.6,.08,-5,.7,-94.42,coral);
 const gateLogo=plane(2.9,.5,label("AMMAR ADAM","", "#ffc978",1024,128));gateLogo.position.set(-5,.73,-94.36);
 for(let x=-14;x<=14;x+=3.5){block(.18,9.5,.2,x,4.75,-104,steel);if(Math.abs(x)>1)block(3.3,8.4,.04,x+1.75,4.8,-104.02,glass);}
 for(const y of [3,6,9])block(28,.14,.14,0,y,-104,steel);
 block(3.1,.35,21,0,.15,-113,concrete);for(const x of [-1.7,1.7]){block(.18,3,21,x,1.6,-113,steel);for(let z=-104;z>-124;z-=2.7){block(.14,3.2,.12,x,1.7,z,ink);block(.04,2.4,2.5,x,1.65,z-1.35,glass);}}block(3.7,.2,21,0,3.3,-113,dark);
 // A painted aircraft shares the photographic horizon and passes behind the glazing.
 const aircraft=plane(25,12.5,texture("/art/aircraft-departure.webp"),scene,true);
 (aircraft.material as THREE.MeshBasicMaterial).fog=false;
 aircraft.position.set(-8,5.8,-134);

 // The traveller is a world-space billboard: it can pass behind trusses and
 // in front of the counters, then lands before the camera takes their place.
 const travelerFrames=["reach","tuck","release","ground"].map(name=>{const src=name==="ground"?"/art/traveler-v2.webp":`/art/traveler-swing-${name}.webp`;const frame=plane(2,3,texture(src),scene,true);return frame;});
 const tetherGeometry=keepGeometry(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]));
 const tether=new THREE.Line(tetherGeometry,keepMaterial(new THREE.LineBasicMaterial({color:"#b7f8f3"})));scene.add(tether);
 const landingShadow=new THREE.Mesh(keepGeometry(new THREE.CircleGeometry(1.1,32)),keepMaterial(new THREE.MeshBasicMaterial({color:"#071728",transparent:true,opacity:.35,depthWrite:false})));landingShadow.rotation.x=-Math.PI/2;landingShadow.position.y=.035;scene.add(landingShadow);

 for(const [mat,matrices] of staticBoxes){const instances=new THREE.InstancedMesh(unitBox,mat,matrices.length);matrices.forEach((matrix,i)=>instances.setMatrixAt(i,matrix));instances.instanceMatrix.needsUpdate=true;instances.computeBoundingSphere();scene.add(instances);}
 for(const [mat,matrices] of staticRods){const instances=new THREE.InstancedMesh(cylinderGeometry,mat,matrices.length);matrices.forEach((matrix,i)=>instances.setMatrixAt(i,matrix));instances.instanceMatrix.needsUpdate=true;instances.computeBoundingSphere();scene.add(instances);}
 const edgeGeometry=keepGeometry(new THREE.BufferGeometry());edgeGeometry.setAttribute("position",new THREE.Float32BufferAttribute(edgePoints,3));scene.add(new THREE.LineSegments(edgeGeometry,outline));
 scene.traverse(object=>{if(object instanceof THREE.Mesh){const mat=Array.isArray(object.material)?object.material[0]:object.material;if(mat instanceof THREE.MeshToonMaterial){object.castShadow=true;object.receiveShadow=true;}}});
 const temp=new THREE.Vector3(),look=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3(),forward=new THREE.Vector3();
 return {scene,camera,photos,
  update(state){
   let p=clamp(state.t);if(state.reduced)p=p<.24?.20:p<.45?.30:p<.65?.49:p<.72?.665:p<.79?.735:p<.86?.805:.94;
   const next=CAMERA.findIndex(key=>key.at>=p),b=CAMERA[next<0?CAMERA.length-1:next],a=CAMERA[Math.max(0,(next<0?CAMERA.length-1:next)-1)];const f=a===b?0:smooth((p-a.at)/(b.at-a.at));
   camera.position.set(...a.position).lerp(temp.set(...b.position),f);look.set(...a.target).lerp(temp.set(...b.target),f);camera.fov=mix(a.fov,b.fov,f)+(state.aspect<.8?9:0);camera.aspect=state.aspect;
   if(state.aspect<.8&&p>=.45&&p<=.641){const travel=clamp((p-.45)/.185),exit=smooth(clamp((p-.635)/.006));camera.position.set(5.05,1.85,mix(-33.5,-34.4,travel)).lerp(temp.set(1.3,1.75,-39.8),exit);look.set(5.05,1.15,-40.6).lerp(temp.set(1.3,1.65,-48),exit);}
   if(state.aspect<.8&&p>=.65&&p<=.845){camera.position.z-=2;look.z-=2.2;}
   const flight=clamp(state.departure);if(flight&&!state.reduced){camera.position.lerp(temp.set(1,2.5,-90.5),smooth(flight));look.lerp(temp.set(5,4,-126),flight);}
   camera.up.set(0,1,0);camera.lookAt(look);camera.rotateZ(state.reduced?0:mix(a.roll,b.roll,f)*(state.aspect<.8?.65:1));camera.updateProjectionMatrix();camera.updateMatrixWorld();
   key.position.set(20,24,camera.position.z+15);key.target.position.set(0,0,camera.position.z-20);key.target.updateMatrixWorld();
   deskLights.forEach((mesh,i)=>{mesh.visible=i===state.experienceIndex;});projectScreens.forEach((mesh,i)=>{mesh.visible=i===state.projectIndex;const image=(mesh.material as THREE.MeshBasicMaterial).map?.image as {width?:number;height?:number}|undefined;if(image?.width&&image?.height){const aspect=image.width/image.height;mesh.scale.set(Math.min(2.8,1.8*aspect),Math.min(1.8,2.8/aspect),1);}});
   trays.forEach((group,i)=>{group.position.z=-38.4-i*1.35+(state.projectIndex-i)*.24;});
   aircraft.position.set(-8+flight*32,5.8+flight*15,-134-flight*22);aircraft.quaternion.copy(camera.quaternion);aircraft.rotateZ(Math.sin(flight*Math.PI)*.035);
   const hero=clamp(p/.24),landing=clamp((hero-.80)/.2);const visible=p<.255&&!state.reduced;
   const frameIndex=hero<.22?0:hero<.48?1:hero<.78?2:3;
   travelerFrames.forEach((mesh,i)=>{mesh.visible=visible&&i===frameIndex;(mesh.material as THREE.MeshBasicMaterial).opacity=1-clamp((p-.24)/.015);});
   if(visible){
    // Flight is in world coordinates relative to the moving camera, at varying
    // depth. The last fifth converges on a fixed floor landing point.
    camera.getWorldDirection(forward);right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);
    const distance=8.5-2.8*Math.sin(hero*Math.PI),lateral=state.aspect<.8?1.15:3.5;
    temp.copy(camera.position).addScaledVector(forward,distance).addScaledVector(right,lateral+Math.sin(hero*Math.PI*2)*.8).addScaledVector(up,Math.sin(hero*Math.PI*2)*1.1-.6);
    temp.lerp(new THREE.Vector3(1.7,.92,-24.1),smooth(landing));
    const mesh=travelerFrames[frameIndex];mesh.position.copy(temp);mesh.quaternion.copy(camera.quaternion);mesh.rotateZ(state.reduced?0:Math.sin(hero*Math.PI*2)*.45*(1-landing));mesh.scale.set(mix(2.2,1.2,smooth(landing)),mix(3.3,1.8,smooth(landing)),1);
    const hand=new THREE.Vector3(-.72,1.5,0).applyQuaternion(mesh.quaternion).add(mesh.position);
    const rope=tetherGeometry.getAttribute("position") as THREE.BufferAttribute;rope.setXYZ(0,2,11.8,-8-hero*17);rope.setXYZ(1,hand.x,hand.y,hand.z);rope.needsUpdate=true;tether.visible=frameIndex<2;
    landingShadow.position.set(temp.x,.035,temp.z);landingShadow.visible=true;landingShadow.scale.setScalar(.5+landing*.6);
   }else{tether.visible=false;landingShadow.visible=false;}
  },
  dispose(){dead=true;scene.traverse(object=>{if(object instanceof THREE.InstancedMesh)object.dispose();if(object instanceof THREE.DirectionalLight)object.dispose();});for(const tx of textures)tx.dispose();for(const mat of materials)mat.dispose();for(const geometry of geometries)geometry.dispose();scene.clear();}
 };
}

export const TERMINAL_POST_VERTEX=`varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
export const TERMINAL_POST_FRAGMENT=`
precision highp float;
varying vec2 vUv;uniform sampler2D uScene,uDepth;uniform vec2 uResolution;uniform float uIntensity;
float printLuma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 vec2 px=1.0/uResolution;vec3 c=texture2D(uScene,vUv).rgb;float L=printLuma(c);
 float d=texture2D(uDepth,vUv).r;float dl=texture2D(uDepth,vUv-vec2(px.x,0.)).r;float dr=texture2D(uDepth,vUv+vec2(px.x,0.)).r;
 vec3 left=texture2D(uScene,vUv-vec2(px.x,0.)).rgb,right=texture2D(uScene,vUv+vec2(px.x,0.)).rgb;
 float edge=length(right-left);float ink=smoothstep(.14,.48,edge)*.32+smoothstep(.0003,.004,abs(dl-dr))*.32;
 c=mix(c,vec3(.025,.04,.09),min(.48,ink)*uIntensity);
 float shadow=1.-smoothstep(.08,.42,L);c=mix(c,c*vec3(1.22,.72,1.15),shadow*.26*uIntensity);
 vec2 grid=mat2(.707,-.707,.707,.707)*(vUv*uResolution)/4.8;float dotInk=1.-smoothstep(.19,.31,length(fract(grid)-.5));
 float mask=smoothstep(.09,.19,L)*(1.-smoothstep(.29,.42,L));mask*=step(.35,hash(floor(vUv*uResolution/31.)));
 c=mix(c,vec3(.035,.07,.14),dotInk*mask*.25*uIntensity);
 float split=smoothstep(.35,.8,d)*smoothstep(.15,.45,edge);vec2 off=(vUv-.5)*px*2.;c.r+=(texture2D(uScene,vUv+off).r-c.r)*split*.28;c.b+=(texture2D(uScene,vUv-off).b-c.b)*split*.25;
 c*=1.-dot(vUv-.5,vUv-.5)*.19;gl_FragColor=vec4(c,1.);
 #include <colorspace_fragment>
}`;
