import * as THREE from "three";
import { careerArrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { memorySequence } from "./memorySequence";
import { createFilmTraveler3D } from "./film-traveler-3d";
import { createFilmMaterials } from "./film-materials";
import { ensurePaintUV } from "./film-paint-uv";
import { protectFilmRegistration } from "./terminal-post";
import { createFilmArchitecture } from "./film-architecture";
import { loadFilmSet } from "./film-set-assets";
import type { FilmSet } from "./film-set-builder";
import { terminalReferences } from "@/data/references";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createFilmAircraft } from "./film-aircraft";
import { createFilmCheckin } from "./film-checkin";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

type V3 = [number,number,number];
type CameraKey = {at:number;position:V3;target:V3;roll:number;fov:number};
const CAMERA:CameraKey[] = [
 {at:0,position:[7,7.8,16],target:[1,3,-8],roll:-.26,fov:61},
 {at:.035,position:[5.2,4.4,5],target:[0,3,-13],roll:.25,fov:73},
 {at:.055,position:[4,3.9,0],target:[-1,4,-25],roll:.32,fov:68},
 {at:.075,position:[-1,5.9,-2],target:[3,5,-18],roll:.16,fov:72},
 {at:.112,position:[-3,6.2,-7],target:[1,2,-29],roll:-.22,fov:72},
 {at:.175,position:[4,2.7,-12],target:[-2,1.7,-28],roll:.09,fov:64},
 {at:.21,position:[2.2,1.35,-17],target:[1.7,1.5,-24.5],roll:-.045,fov:62},
 {at:.24,position:[1.6,1.9,-18.6],target:[1.5,1.7,-27],roll:0,fov:58},
 {at:.33,position:[3.0,1.8,-20.7],target:[4.8,1.8,-26.5],roll:0,fov:60},
 {at:.39,position:[5.4,1.9,-21.8],target:[6.8,1.65,-26.4],roll:0,fov:60},
 {at:.415,position:[7.3,1.9,-21.5],target:[9.4,1.4,-25.2],roll:0,fov:59},
 {at:.433,position:[8.2,1.9,-21.1],target:[10.1,2,-28],roll:0,fov:60},
 {at:.436,position:[12.7,1.9,-20.5],target:[12.7,2,-31],roll:.025,fov:61},
 {at:.440,position:[12.7,1.9,-27.4],target:[12.7,2,-35],roll:.045,fov:63},
 {at:.445,position:[12.7,1.9,-35.2],target:[2.7,1.8,-41],roll:-.035,fov:63},
 {at:.45,position:[1.3,1.75,-33.5],target:[2.7,1.8,-43],roll:-.025,fov:62},
 {at:.53,position:[2.5,1.75,-35.7],target:[4.4,1.65,-41.3],roll:0,fov:62},
 {at:.60,position:[2.8,1.75,-37.3],target:[4.8,1.7,-42],roll:0,fov:61},
 {at:.635,position:[1.3,1.75,-39.5],target:[1.3,1.8,-44.5],roll:0,fov:62},
 {at:.641,position:[1.3,1.75,-44.6],target:[-5.5,1.8,-47.5],roll:.015,fov:65},
 {at:.646,position:[-7,1.85,-46.4],target:[-7,2,-53],roll:-.035,fov:65},
 {at:.649,position:[-7,2.3,-51],target:[-8,2.8,-60],roll:0,fov:65},
 {at:.65,position:[.8,2.2,-52.6],target:[-3,2.9,-71],roll:0,fov:69},
 {at:.675,position:[.5,2.2,-54.3],target:[-3.5,2.8,-72],roll:0,fov:69},
 {at:.705,position:[.8,2.2,-60],target:[-3,2.8,-77],roll:-.015,fov:70},
 {at:.72,position:[.8,2.2,-63.6],target:[-3,2.9,-81],roll:0,fov:69},
 {at:.745,position:[.5,2.2,-65.3],target:[-3.5,2.8,-82],roll:0,fov:69},
 {at:.775,position:[.8,2.2,-71],target:[-3,2.8,-86],roll:.015,fov:70},
 {at:.79,position:[.8,2.2,-74.6],target:[-3,2.9,-90],roll:0,fov:69},
 {at:.815,position:[.5,2.2,-76.3],target:[-3.5,2.8,-90],roll:0,fov:69},
 {at:.826,position:[2.5,2.1,-78],target:[8.8,2.2,-84],roll:.015,fov:68},
 {at:.837,position:[7.3,1.9,-79.7],target:[9.4,2.1,-88],roll:.018,fov:65},
 {at:.846,position:[9.4,1.9,-81.7],target:[9.4,2.1,-92],roll:0,fov:63},
 {at:.854,position:[9.4,1.9,-86.4],target:[7.5,2.3,-99],roll:-.018,fov:61},
 {at:.86,position:[7.5,1.9,-89],target:[0,2.3,-105],roll:0,fov:61},
 {at:.93,position:[.5,1.8,-87],target:[0,2.5,-110],roll:0,fov:58},
 {at:1,position:[.5,1.8,-87],target:[0,2.8,-112],roll:0,fov:58},
];
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const smooth=(v:number)=>v*v*(3-2*v);

// A continuous, shape-preserving camera rail. Easing each shot independently
// brought the camera to a complete stop at every key, which read as dropped frames.
const FLIGHT_KEYS=CAMERA.filter(key=>key.at<=.24);
function flightValue(progress:number,read:(key:CameraKey)=>number){
 const end=FLIGHT_KEYS.length-1;
 let j=FLIGHT_KEYS.findIndex(key=>key.at>=progress);if(j<0)j=end;
 const i=Math.max(0,j-1),a=FLIGHT_KEYS[i],b=FLIGHT_KEYS[j];if(i===j)return read(a);
 const slope=(n:number)=>{
  if(n===end)return 0;
  if(n===0)return (read(FLIGHT_KEYS[1])-read(FLIGHT_KEYS[0]))/(FLIGHT_KEYS[1].at-FLIGHT_KEYS[0].at);
  const left=FLIGHT_KEYS[n-1],here=FLIGHT_KEYS[n],right=FLIGHT_KEYS[n+1];
  const dl=(read(here)-read(left))/(here.at-left.at),dr=(read(right)-read(here))/(right.at-here.at);
  if(dl*dr<=0)return 0;
  const h0=here.at-left.at,h1=right.at-here.at,w0=2*h1+h0,w1=h1+2*h0;
  return (w0+w1)/(w0/dl+w1/dr);
 };
 const span=b.at-a.at,t=clamp((progress-a.at)/span),t2=t*t,t3=t2*t;
 return (2*t3-3*t2+1)*read(a)+(t3-2*t2+t)*span*slope(i)+(-2*t3+3*t2)*read(b)+(t3-t2)*span*slope(j);
}


export interface TerminalWorldState { t:number; time?:number; reduced:boolean; experienceIndex:number; projectIndex:number; departure:number; aspect:number; lookYaw?:number; lookPitch?:number }
export interface TerminalModel {
 scene:THREE.Scene; camera:THREE.PerspectiveCamera; photos:THREE.Object3D[];
 update:(state:TerminalWorldState)=>void; takePendingProgramRoots:()=>THREE.Object3D[]; dispose:()=>void;
}

export function createFilmTerminal(invalidate:()=>void,{shadowMapSize=1536}:{shadowMapSize?:number}={}):TerminalModel {
 const scene=new THREE.Scene();scene.background=new THREE.Color("#2b3566");scene.fog=new THREE.Fog("#ffd9a0",65,180);
 const camera=new THREE.PerspectiveCamera(63,1,.08,650);
 const textures=new Set<THREE.Texture>(),materials=new Set<THREE.Material>(),geometries=new Set<THREE.BufferGeometry>();
 let dead=false;
 const keepGeometry=<T extends THREE.BufferGeometry>(g:T)=>{geometries.add(g);return g;};
 const keepMaterial=<T extends THREE.Material>(m:T)=>{materials.add(m);return m;};
 const imageLoader=new THREE.ImageLoader();
 const textureCache=new Map<string,THREE.Texture>();
 const deferredTextures=new Map<string,{texture:THREE.Texture;at:number;started:boolean}>();
 const placeholder=document.createElement("canvas");placeholder.width=placeholder.height=1;
 const placeholderContext=placeholder.getContext("2d");if(placeholderContext){placeholderContext.fillStyle="#172735";placeholderContext.fillRect(0,0,1,1);}
 const startTexture=(src:string,entry:{texture:THREE.Texture;at:number;started:boolean})=>{
  if(dead||entry.started)return;entry.started=true;entry.texture.userData.requested=true;
  imageLoader.load(src,image=>{entry.texture.userData.settled=true;if(dead)return;entry.texture.dispose();entry.texture.image=image;entry.texture.needsUpdate=true;invalidate();},undefined,()=>{entry.texture.userData.settled=true;if(!dead)invalidate();});
 };
 // A loaded image replaces 1px GPU storage, but keeps the material texture object.
 // Each material keeps one stable texture. Later rooms begin fetching one scene
 // ahead, leaving first-visit bandwidth to the skyline and painted hero.
 const texture=(src:string,at=0)=>{
  const cached=textureCache.get(src);if(cached)return cached;
  const tx=new THREE.Texture(placeholder);tx.colorSpace=THREE.SRGBColorSpace;tx.needsUpdate=true;tx.userData.settled=false;
  textures.add(tx);textureCache.set(src,tx);const entry={texture:tx,at,started:false};deferredTextures.set(src,entry);
  if(at===0)startTexture(src,entry);return tx;
 };
 const canvasTexture=(draw:(ctx:CanvasRenderingContext2D,w:number,h:number)=>void,w=1024,h=512)=>{
  const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;const ctx=canvas.getContext("2d")!;draw(ctx,w,h);
  const tx=new THREE.CanvasTexture(canvas);tx.colorSpace=THREE.SRGBColorSpace;textures.add(tx);return tx;
 };
 const palette=createFilmMaterials(invalidate);
 const {ink,steel,coral,cyan,gold,dark,glass,warmLight:lightWarm,coolLight:lightCyan}=palette.materials;
 const concrete=palette.materials.ivory,cream=palette.materials.ivory,magenta=palette.materials.coral;
 const toon=(color:string)=>keepMaterial(palette.createSurface(color,{roughness:.82,metalness:.08,paint:.95}));
 const architecture=createFilmArchitecture(palette.materials);scene.add(architecture.root);

 const outline=keepMaterial(new THREE.LineBasicMaterial({color:"#091122",transparent:true,opacity:.72}));
 scene.add(new THREE.HemisphereLight("#3a4f8a","#2b3566",.22));
 const key=new THREE.DirectionalLight("#ffb46a",3.6);key.position.set(20,24,0);key.castShadow=true;key.shadow.mapSize.set(shadowMapSize,shadowMapSize);key.shadow.camera.left=-24;key.shadow.camera.right=24;key.shadow.camera.top=24;key.shadow.camera.bottom=-24;key.shadow.camera.near=1;key.shadow.camera.far=95;key.shadow.bias=-.00016;key.shadow.normalBias=.014;key.shadow.radius=.45;scene.add(key,key.target);
 // Two unshadowed practical sources are reused room by room; no extra render pass.
 const screenSpill=new THREE.PointLight("#3a4f8a",3,5,2);
 const signSpill=new THREE.PointLight("#ffd9a0",6,6,2);
 scene.add(screenSpill,signSpill);
 const unitBox=keepGeometry(new RoundedBoxGeometry(1,1,1,2,.035));
 const staticBoxes=new Map<THREE.Material,THREE.Matrix4[]>(),edgePoints:number[]=[];
 const unitEdges=keepGeometry(new THREE.EdgesGeometry(new THREE.BoxGeometry(1,1,1))).getAttribute("position");
 const block=(w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material=steel,rotation:V3=[0,0,0],edges=false)=>{
  const matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(w,h,d));
  const batch=staticBoxes.get(mat)??[];batch.push(matrix);staticBoxes.set(mat,batch);
  if(edges){const p=new THREE.Vector3();for(let i=0;i<unitEdges.count;i++){p.fromBufferAttribute(unitEdges,i).applyMatrix4(matrix);edgePoints.push(p.x,p.y,p.z);}}
 };
 const meshBlock=(w:number,h:number,d:number,mat:THREE.Material,parent:THREE.Object3D,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(unitBox,mat);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 const cylinderGeometry=keepGeometry(new THREE.CylinderGeometry(1,1,1,24));
 const staticRods=new Map<THREE.Material,THREE.Matrix4[]>();
 const rod=(a:V3,b:V3,r:number,mat:THREE.Material=steel)=>{const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),center=from.clone().add(to).multiplyScalar(.5),length=from.distanceTo(to),rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),to.sub(from).normalize());const batch=staticRods.get(mat)??[];batch.push(new THREE.Matrix4().compose(center,rotation,new THREE.Vector3(r,length,r)));staticRods.set(mat,batch);};
 const planeGeometry=keepGeometry(new THREE.PlaneGeometry(1,1));
 const plane=(w:number,h:number,tx:THREE.Texture,parent:THREE.Object3D=scene,transparent=false)=>{const mat=keepMaterial(new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide,transparent,alphaTest:transparent?.04:0,depthWrite:!transparent}));const mesh=new THREE.Mesh(planeGeometry,mat);mesh.scale.set(w,h,1);parent.add(mesh);return mesh;};
 const label=(title:string,subtitle:string,color="#ffc66f",w=1024,h=256)=>canvasTexture((ctx,W,H)=>{ctx.fillStyle="#081929";ctx.fillRect(0,0,W,H);ctx.fillStyle=color;ctx.fillRect(0,0,W,9);ctx.font=`700 ${H*.12}px Arial`;ctx.fillStyle="#a8d5d6";ctx.fillText(subtitle,35,H*.28);ctx.fillStyle="#fff1d6";ctx.font=`900 ${H*.32}px Arial`;ctx.fillText(title,32,H*.72,W-65);ctx.fillStyle=color;ctx.font=`900 ${H*.32}px Arial`;},w,h);
 const sign=(title:string,subtitle:string,x:number,y:number,z:number,w=7,h=1.5)=>{block(w+.18,h+.18,.2,x,y,z-.12,ink,[0,0,0],true);const p=plane(w,h,label(title,subtitle));p.position.set(x,y,z);rod([x-w*.35,y+h*.5,z],[x-w*.35,8.7,z],.035);rod([x+w*.35,y+h*.5,z],[x+w*.35,8.7,z],.035);return p;};

 // Distant painted city lives outside the 3D glazing; all interior spaces are meshes.
 const outside=plane(620,348.75,texture("/art/terminal-city-v3.webp"));outside.position.set(220,88,-75);outside.rotation.y=-Math.PI/2;
 (outside.material as THREE.MeshBasicMaterial).fog=false;
 if(palette.materials.floor.userData.film?.uFilmCityReflection)palette.materials.floor.userData.film.uFilmCityReflection.value=(outside.material as THREE.MeshBasicMaterial).map;
 const runway=plane(500,281.4,texture("/art/terminal-city-v3.webp"));runway.position.set(0,45,-224);(runway.material as THREE.MeshBasicMaterial).fog=false;
 // The exterior also continues behind the arrival hall for a full reverse view.
 // Reuse the city texture; this plane is behind the opening flight camera.
 const entryCity=plane(620,348.75,(outside.material as THREE.MeshBasicMaterial).map!);
 entryCity.name="arrival-exterior-city";entryCity.position.set(0,58,160);entryCity.rotation.y=Math.PI;
 (entryCity.material as THREE.MeshBasicMaterial).fog=false;
 block(120,.30,90,0,-.285,96,concrete);
 block(280,.20,175,20,-.55,-191,concrete);
 for(let z=-115;z>-220;z-=12){block(.16,.015,6,-12,-.435,z,gold);block(.13,.015,6,-11.4,-.434,z,cream);}
 sign("DEPARTURES  →","TERMINAL A",-7,7.7,5,7.2,1.1);
 sign("CHECK-IN","01—05",-4,5.6,-24,10,1.35);
 sign("SECURITY  →","ALL GATES",10.4,4.7,-30.5,4.5,1.05);
 sign("←  A1—A12","DEPARTURES",-8.7,3.65,-48.55,6,1);
 sign("GATES 04—06","DEPARTURES  →",9.4,5.6,-83.4,4.7,.95);
 block(58,.3,38,0,-.28,32,concrete);
 const entrance=plane(10.6,1.3,label("TERMINAL A","DEPARTURES","#f6d6a2"));entrance.position.set(-5.3,9.3,14.3);
 // Entry frontage is real glazing and steel. The full-height x4.0–10.5 span
 // stays open for the authored flight. These additions never cast shadows.
 const entryRoof=(x:number)=>8+3.6*(1-(x/14)**2);
 for(const [left,right]of [[-13.85,-10.58],[-10.42,-7.08],[-6.92,-3.58],[-3.42,-.08],[.08,3.80],[10.70,13.85]]){
  const paneGeometry=keepGeometry(new THREE.BufferGeometry());
  paneGeometry.setAttribute("position",new THREE.Float32BufferAttribute([left,.14,14.05,right,.14,14.05,right,entryRoof(right)-.16,14.05,left,entryRoof(left)-.16,14.05],3));
  paneGeometry.setIndex([0,2,1,0,3,2]);paneGeometry.computeVertexNormals();
  const pane=new THREE.Mesh(paneGeometry,glass);pane.name="arrival-entry-glazing";scene.add(pane);
 }
 for(const x of [-14,-10.5,-7,-3.5,0,3.88,10.62,14]){
  const height=entryRoof(x)-.13;block(.13,height,.16,x,height*.5,14.02,steel);
 }
 for(const y of [2.95,5.75,7.85]){
  block(17.8,.075,.14,-5.1,y,14.01,steel);block(3.30,.075,.14,12.35,y,14.01,steel);
 }
 for(let step=0;step<20;step++){
  const x0=-14+step*1.4,x1=x0+1.4;rod([x0,entryRoof(x0)-.06,14.02],[x1,entryRoof(x1)-.06,14.02],.085,steel);
 }
 // Open sliding leaves stack beside, rather than across, the flight portal.
 for(const x of [3.05,11.50]){
  block(1.45,2.78,.035,x,1.51,13.91,glass);
  for(const edge of [-.74,.74])block(.045,2.90,.075,x+edge,1.5,13.89,steel);
  for(const y of [.07,2.95])block(1.53,.055,.075,x,y,13.89,steel);
  block(.038,.43,.10,x+(x<4?.59:-.59),1.40,13.83,steel);
 }
 const entryReverse=plane(10.6,1.3,label("ENTRY","","#f6d6a2"));
 entryReverse.name="arrival-entry-interior-sign";entryReverse.position.set(-5.3,9.3,14.285);entryReverse.rotation.y=Math.PI;

 // Five actual check-in stations: plinth, front fascia, countertop, luggage
 // scale and a desk monitor, backed by distinct airline-style display boards.
 const deskLights:THREE.Mesh[]=[];
 careerArrivals.forEach((entry,i)=>{
  const x=-10.7+i*2.85,z=-27;
  block(2.5,.92,1.1,x,.48,z,concrete,[0,0,0],true);block(2.65,.14,1.42,x,1.02,z+.05,ink,[0,0,0],true);
  block(2.38,.68,.055,x,.5,z+.59,i%2?cyan:dark);block(2.4,.045,.08,x,.91,z+.65,gold);
  for(let fin=0;fin<11;fin++)block(.034,.56,.035,x-1.08+fin*.216,.5,z+.63,palette.materials.walnut);
  block(2.3,.025,.045,x,.26,z+.65,cream);
  block(.6,.3,.5,x+.77,.17,z+1.0,dark,[0,0,0],true);block(.63,.05,1.4,x+.77,.35,z+1.0,steel);
  for(let n=0;n<9;n++)rod([x+.48,.4,z+.4+n*.13],[x+1.04,.4,z+.4+n*.13],.035,ink);
  block(.12,.45,.12,x-.45,1.28,z,steel);block(.68,.45,.08,x-.45,1.57,z+.02,ink,[0,0,0],true);
  const screen=plane(.59,.34,label("0"+(i+1),entry.origin.toUpperCase(),"#5de1e7",512,256));screen.position.set(x-.45,1.57,z+.07);
  const board=plane(1.3,.55,label(String(i+1).padStart(2,"0"),entry.origin.toUpperCase(),"#d4c2a0"));board.position.set(x,3.45,z-.75);
  block(1.45,.66,.14,x,3.45,z-.89,ink,[0,0,0],true);
  const indicator=new THREE.Mesh(unitBox,lightWarm);indicator.scale.set(2.38,.08,.09);indicator.position.set(x,1.13,z+.8);scene.add(indicator);deskLights.push(indicator);
  const number=plane(.56,.35,label("0"+(i+1),"", "#ffc66f",256,128));number.position.set(x,.53,z+.63);
 });
 // A close service island makes the selected destination unmistakable. Its
 // large board and counter monitor change together with the directory choice.
 const checkinIsland=createFilmCheckin(palette.materials);checkinIsland.root.position.set(3.45,0,-26.1);scene.add(checkinIsland.root);
 const activeCompanyBoards=careerArrivals.map((entry,i)=>{const image=plane(3.52,.94,label(entry.from.toUpperCase(),`0${i+1}  /  ${entry.origin.toUpperCase()}`,"#76e2e6",1536,384),checkinIsland.boardAnchor);image.position.z=.01;return image;});
 const counterScreens=careerArrivals.map((entry,i)=>{const image=plane(.94,.54,label(String(i+1).padStart(2,"0"),entry.from.toUpperCase(),"#65dbed",512,256),checkinIsland.monitorAnchor);image.position.z=.01;return image;});
 // An oval luggage carousel turns continuously while this room is visible.
 const carouselBase=new THREE.Mesh(cylinderGeometry,ink);carouselBase.scale.set(1.9,.65,2.7);carouselBase.position.set(10.5,.35,-26.2);scene.add(carouselBase);
 const carouselCore=new THREE.Mesh(cylinderGeometry,steel);carouselCore.scale.set(1.05,.68,1.7);carouselCore.position.set(10.5,.8,-26.2);scene.add(carouselCore);
 const beltTreads=new THREE.InstancedMesh(unitBox,dark,64);scene.add(beltTreads);const beltDummy=new THREE.Object3D();
 // The complete oval plus each rotated tread fits this fixed conservative sphere.
 beltTreads.boundingSphere=new THREE.Sphere(new THREE.Vector3(10.5,.76,-26.2),2.55);
 const updateBelt=(time:number)=>{for(let n=0;n<64;n++){const angle=n/64*Math.PI*2+time*.17;beltDummy.position.set(10.5+Math.cos(angle)*1.45,.76,-26.2+Math.sin(angle)*2.1);beltDummy.rotation.y=Math.atan2(-1.45*Math.sin(angle),2.1*Math.cos(angle));beltDummy.scale.set(.78,.11,.22);beltDummy.updateMatrix();beltTreads.setMatrixAt(n,beltDummy.matrix);}beltTreads.instanceMatrix.needsUpdate=true;};updateBelt(0);
 const checkinCases:THREE.Group[]=[];let checkinUpdated=false;
 const caseShell=keepGeometry(new RoundedBoxGeometry(.82,.96,.52,5,.11));
 for(let i=0;i<6;i++){
  const luggage=new THREE.Group();scene.add(luggage);
  const finish=i%3===0?coral:i%3===1?palette.materials.sage:steel;
  const shell=new THREE.Mesh(caseShell,finish);shell.position.y=.59;luggage.add(shell);
  for(const x of [-.30,.30])for(const z of[-.17,.17]){const wheel=new THREE.Mesh(keepGeometry(new THREE.CylinderGeometry(.065,.065,.065,12)),ink);wheel.position.set(x,.08,z);wheel.rotation.z=Math.PI/2;luggage.add(wheel);}
  for(let rib=0;rib<5;rib++)meshBlock(.025,.63,.025,finish,luggage,-.25+rib*.125,.60,.266);
  meshBlock(.018,.79,.035,ink,luggage,.39,.60,0);
  for(const x of[-.13,.13])meshBlock(.018,.18,.025,steel,luggage,x,1.13,0);
  meshBlock(.29,.045,.065,ink,luggage,0,1.23,0);
  meshBlock(.10,.23,.012,cream,luggage,.14,.95,.274).rotation.z=.17;
  checkinCases.push(luggage);
 }

 // Queue stanchions and the escape lane stay outside the walking route.
 for(let n=0;n<5;n++){const z=-18-n*1.5;for(const x of [-11,-6]){rod([x,0,z],[x,1.02,z],.045,steel);block(.4,.06,.4,x,.03,z,ink);}
  block(4.9,.055,.035,-8.5,.96,z,magenta);
 }
 // Security is a real doorway. The route crosses its front and rear planes.
 const archZ=-43,archX=1.3;
 block(.48,3.35,.95,archX-1.5,1.68,archZ,cream,[0,0,0],true);block(.48,3.35,.95,archX+1.5,1.68,archZ,cream,[0,0,0],true);block(3.5,.48,.95,archX,3.18,archZ,ink,[0,0,0],true);
 for(const x of [archX-1.26,archX+1.26]){block(.045,2.8,.07,x,1.47,archZ+.5,lightCyan);block(.045,2.8,.07,x,1.47,archZ-.5,magenta);}
 block(2.5,.035,.14,archX,.025,archZ,gold);sign("SECURITY","AIRSIDE SCREENING",.6,5.6,-40,8,1.45);
 // X-ray tunnel, rubber entrance strips, conveyor rollers and monitor stand.
 block(2.35,2.1,2.8,6.2,1.35,-43,cream,[0,0,0],true);block(1.66,1.35,.07,6.2,1.15,-41.55,ink);
 // Layered enamel skins, a service panel and ventilation replace the plain cube.
 block(2.48,.33,2.94,6.2,2.33,-43,cyan,[0,0,0],true);
 block(.12,1.46,2.75,5.02,1.3,-43,dark);block(.12,1.46,2.75,7.38,1.3,-43,cyan);
 block(2.42,.17,.12,6.2,2.08,-41.50,gold);block(2.42,.16,.12,6.2,.42,-41.50,steel);
 for(const x of [5.2,7.2]){block(.13,1.43,.13,x,1.31,-41.44,steel);block(.19,.12,.16,x,.61,-41.42,coral);}
 for(let vent=0;vent<9;vent++)block(.020,.035,1.18,7.454,.94+vent*.094,-43.3,ink);
 block(.025,.26,.34,7.46,1.96,-42.1,gold);
 for(const x of [archX-1.5,archX+1.5]){block(.51,.75,1.0,x,.40,archZ,dark);block(.54,.14,1.02,x,2.89,archZ,gold);}
 block(3.54,.17,1.0,archX,3.46,archZ,cream);
 for(let i=0;i<9;i++)block(.145,1.17,.05,5.55+i*.165,1.13,-41.49,dark,[0,0,(i%3-1)*.025]);
 block(2.05,.25,7.7,6.2,.68,-42,ink,[0,0,0],true);for(let i=0;i<34;i++)rod([5.25,.83,-38.3-i*.22],[7.15,.83,-38.3-i*.22],.055,i%3?steel:cyan);
 for(const z of [-39,-45]){block(.16,.7,.16,5.4,.35,z,steel);block(.16,.7,.16,7,.35,z,steel);}
 block(.2,1.5,.2,5.05,.75,-40.6,steel);
 const projectMonitor=new THREE.Group();projectMonitor.position.set(5.05,2.35,-40.6);scene.add(projectMonitor);meshBlock(3,2,.18,ink,projectMonitor);meshBlock(2.9,.05,.2,lightCyan,projectMonitor,0,-1.02,0);
 const projectScreens=projects.map(project=>{const screen=project.slug==="backseat"?canvasTexture((ctx,W,H)=>{ctx.fillStyle="#0d0f1f";ctx.fillRect(0,0,W,H);ctx.fillStyle="#f4ecd8";ctx.font="700 76px Arial";ctx.fillText("Backseat",55,115);ctx.strokeStyle="#ffd9a0";ctx.lineWidth=8;ctx.beginPath();for(let x=60;x<W-60;x+=8){const y=H*.58+Math.sin(x*.055)*Math.sin(x*.011)*H*.19;if(x===60)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();},1024,640):texture(project.screenshot,.34);const image=plane(2.8,1.8,screen,projectMonitor);image.position.z=.11;return image;});
 const trays:THREE.Group[]=[];
 projects.forEach((project,i)=>{
  const group=new THREE.Group();scene.add(group);group.position.set(6.2,.98,-38.4-i*1.35);
  meshBlock(1.55,.13,1,cream,group);for(const x of [-.77,.77])meshBlock(.08,.25,1,cyan,group,x,.09,0);for(const z of [-.49,.49])meshBlock(1.55,.25,.07,cyan,group,0,.09,z);
  if(i===0){ // A phone, upright in its tray: the voice-navigation project.
   meshBlock(.52,.82,.07,ink,group,0,.5,-.12);meshBlock(.43,.67,.012,gold,group,0,.5,-.075);meshBlock(.18,.025,.015,cream,group,0,.83,-.065);
  }else if(i===1){
   meshBlock(.95,.08,.66,steel,group,0,.14,0);meshBlock(.95,.59,.045,ink,group,0,.46,-.26).rotation.x=-.22;meshBlock(.82,.46,.015,cyan,group,0,.46,-.21).rotation.x=-.22;
  }else if(i===2){ // A small stack of community badges.
   for(let badge=0;badge<3;badge++){const card=meshBlock(.62,.055,.8,badge===1?coral:cream,group,(badge-1)*.11,.15+badge*.07,(badge-1)*.035);card.rotation.y=(badge-1)*.2;}
   meshBlock(.35,.015,.4,magenta,group,.11,.34,.05);
  }else{
   meshBlock(.8,.08,.84,cream,group,0,.17,0);meshBlock(.65,.025,.33,coral,group,0,.225,-.17);for(const x of [-.28,.28])meshBlock(.045,.045,.42,cyan,group,x,.24,.37);
  }
  const tag=plane(1.32,.28,label(project.flightCode,project.name.toUpperCase(),"#ffe89c",768,160),group);tag.position.set(0,.18,.54);trays.push(group);
 });
 const scanMaterial=keepMaterial(new THREE.MeshBasicMaterial({color:"#60e9f0",transparent:true,opacity:.17,side:THREE.DoubleSide,depthWrite:false}));
 const scanPlane=new THREE.Mesh(planeGeometry,scanMaterial);scanPlane.scale.set(2.5,2.72,1);scene.add(scanPlane);
 const scanBar=new THREE.Group();scene.add(scanBar);meshBlock(2.48,.045,.045,lightCyan,scanBar);meshBlock(.045,2.72,.045,lightCyan,scanBar,-1.24,-1.34,0);meshBlock(.045,2.72,.045,lightCyan,scanBar,1.24,-1.34,0);

 // Three inhabited retail bays replace the former continuous photo wall.
 const walnut=palette.materials.walnut,sage=palette.materials.sage,tile=palette.materials.ivory,skin=palette.materials.skin,paleSkin=toon("#c59578"),hair=toon("#171d27");
 const round=keepGeometry(new THREE.SphereGeometry(1,10,7));
 const solid=(geometry:THREE.BufferGeometry,mat:THREE.Material,x:number,y:number,z:number,sx=1,sy=1,sz=1,parent:THREE.Object3D=scene)=>{const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh;};
 const photos:THREE.Object3D[]=[];
 const shops=[{code:"A02",city:"KARACHI / RIDGEWAY",name:"KITCHEN",finish:coral,trim:gold},{code:"A03",city:"DUBAI",name:"CAFÉ",finish:sage,trim:gold},{code:"A04",city:"YYZ",name:"SOUVENIRS",finish:dark,trim:cyan}];
 shops.forEach((shop,i)=>{
  const z=-57-i*11;
  block(8.9,.12,10.4,-9.3,.065,z,tile);block(.35,6.7,10.5,-13.55,3.35,z,shop.finish);
  block(8.8,6.7,.3,-9.3,3.35,z-4.5,tile);block(8.8,1.1,.055,-9.3,.59,z-4.31,shop.finish);block(8.9,.25,10.5,-9.3,6.7,z,dark);
  // A deep coloured upper frieze and chalk returns make each bay its own room.
  block(8.65,1.4,.055,-9.3,5.9,z-4.30,shop.finish);
  block(8.60,.09,.08,-9.3,5.18,z-4.25,shop.trim);
  for(let fin=0;fin<15;fin++)block(.075,.88,.10,-13.1+fin*.54,5.91,z-4.24,cream);
  // Painted panels sit in a metal frame above a durable darker skirting.
  for(let panel=0;panel<4;panel++){block(.035,5.35,.035,-12.6+panel*2.2,3.93,z-4.30,shop.trim);}
  block(8.45,.045,.035,-9.3,1.16,z-4.29,shop.trim);
  block(.32,5.8,.42,-4.9,2.9,z+4.7,cream,[0,0,0],true);block(.32,5.8,.42,-4.9,2.9,z-4.7,cream,[0,0,0],true);
  for(const end of [-4.7,4.7]){block(.38,.9,.49,-4.9,.45,z+end,shop.finish);block(.39,.08,.51,-4.9,4.93,z+end,shop.trim);}
  block(.36,1.15,9.8,-4.9,5.8,z,shop.finish,[0,0,0],true);
  block(.52,.17,10.0,-4.85,6.42,z,cream);block(.58,.11,10.06,-4.82,5.20,z,cream);
  block(.61,.035,9.8,-4.80,5.13,z,shop.trim);
  // Shallow projecting shades catch the warm light without closing the walkway.
  block(.90,.07,9.7,-4.51,5.0,z,cream,[0,0,-.12],true);
  for(let stripe=0;stripe<10;stripe++)block(.92,.014,.34,-4.50,5.055,z-4.45+stripe*.98,shop.finish,[0,0,-.12]);
  const fascia=plane(5.0,.82,canvasTexture((ctx,W,H)=>{ctx.fillStyle="#10282c";ctx.fillRect(0,0,W,H);ctx.fillStyle="#d8b46a";ctx.fillRect(24,24,4,H-48);ctx.font="600 36px Arial";ctx.fillText(shop.city,60,63);ctx.fillStyle="#f2e8d3";ctx.font="700 85px Arial";ctx.fillText(shop.name,60,165,W-120);},1536,256));fascia.position.set(-4.65,5.78,z+1.5);fascia.rotation.y=Math.PI/2;
  for(let n=0;n<9;n++)block(.035,.26,.055,-4.63,5.00,z-4.2+n*1.05,shop.trim);
  for(let n=0;n<7;n++){block(.035,.025,9.7,-12.5+n*1.1,.14,z,walnut);block(8.2,.025,.035,-9.3,.14,z-4+n*1.3,walnut);}
  for(const x of [-11.5,-8]){rod([x,6.5,z],[x,4.55,z],.025,ink);solid(cylinderGeometry,shop.finish,x,4.5,z,.38,.22,.38);solid(round,lightWarm,x,4.36,z,.28,.08,.28);}
  block(5.1,1.12,1.3,-9.4,.6,z+.4,shop.finish,[0,0,0],true);block(5.4,.16,1.48,-9.4,1.23,z+.4,tile,[0,0,0],true);block(5.1,.07,.08,-9.4,1.1,z+1.08,lightWarm);
  for(let n=0;n<14;n++)block(.055,.94,.04,-11.75+n*.36,.58,z+1.1,shop.trim);
  if(i===1){
   const photoReference=terminalReferences.find(reference=>reference.id==="concourse-cafe-photos")!;
   const photoWall=new THREE.Group();photoWall.position.set(...photoReference.position);photoWall.rotation.set(...photoReference.rotation);photoWall.scale.set(...photoReference.scale);photoWall.userData.referenceId=photoReference.id;scene.add(photoWall);
   const selectedPhotos=[memorySequence[0],memorySequence[1],memorySequence[3],memorySequence[5]];
   selectedPhotos.forEach((memory,slot)=>{
    const h=2.08,w=h*memory.width/memory.height,frame=new THREE.Group();frame.name=`cafe-photo-${slot}`;
    frame.userData.referenceId="concourse-cafe-photos";
    if(slot<2)frame.position.set(slot===0?-1.85:1.85,0,0);
    else{frame.position.set(-3.985,0,slot===2?3.25:6.35);frame.rotation.y=Math.PI/2;}
    photoWall.add(frame);meshBlock(w+.15,h+.15,.12,ink,frame);meshBlock(w+.07,h+.07,.04,cream,frame,0,0,.065);
    const picture=plane(w,h,texture(memory.src,.52),frame);picture.position.z=.095;picture.userData.photoIndex=memory.photoIndex;photos.push(picture);
   });
  }
  // Gate seating lives opposite each shop, behind the open walking lane.
  block(.22,4.0,.22,4.7,2,z,steel);const gate=plane(2.6,1.0,label(shop.code,"GATE","#7bdce9",768,256));gate.position.set(4.7,3.5,z+.15);
  for(let seat=0;seat<4;seat++){const x=6.4+seat*1.6,upholstery=seat%3===0?coral:cyan;
   block(1.25,.18,.92,x,.66,z,upholstery,[0,0,0],true);block(1.25,.95,.18,x,1.2,z-.45,upholstery,[-.12,0,0]);
   block(1.12,.035,.04,x,1.62,z-.39,gold);block(1.12,.025,.04,x,.77,z+.44,cream);
   for(const side of [-.66,.66]){rod([x+side,.56,z-.3],[x+side,.91,z+.3],.027,steel);block(.08,.07,.63,x+side,.92,z,walnut);}
   rod([x-.4,0,z],[x-.4,.6,z],.04,steel);rod([x+.4,0,z],[x+.4,.6,z],.04,steel);
  }
 });
 // The only concourse narration is painted onto an entrance transom.
 const concourseLine=canvasTexture((ctx,W,H)=>{
  ctx.clearRect(0,0,W,H);ctx.fillStyle="#f4ecd8";ctx.font="700 52px FilmHand, cursive";
  ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText("I do everything on purpose. Look around.",W/2,H/2,W-30);
 },1024,128);
 const concourseIntroRoot=new THREE.Group();scene.add(concourseIntroRoot);
 const transom=new THREE.Mesh(unitBox,ink);transom.scale.set(6.65,.98,.12);transom.position.z=-.09;concourseIntroRoot.add(transom);
 for(const x of [-2.3,2.3]){const hanger=new THREE.Mesh(cylinderGeometry,steel);hanger.scale.set(.023,2.8,.023);hanger.position.set(x,1.85,-.09);concourseIntroRoot.add(hanger);}
 const concourseLettering=plane(6.4,.8,concourseLine,concourseIntroRoot,true);
 concourseLettering.name="concourse-painted-introduction";
 concourseIntroRoot.position.set(-1.9,4.95,-58.4);
 // Café equipment, matcha cups and a low simmering nihari pot.
 block(1.3,.8,.75,-10.7,1.72,-67,steel,[0,0,0],true);block(1.18,.16,.86,-10.7,2.15,-67,ink);block(.9,.12,.3,-10.7,1.47,-66.65,lightWarm);
 for(let n=0;n<5;n++){solid(cylinderGeometry,cream,-8.8+n*.28,1.45,-67,.10,.26,.10);solid(cylinderGeometry,sage,-8.8+n*.28,1.585,-67,.085,.018,.085);}
 // Warm café furniture and a small screen playing the station vignette.
 for(const [x,z] of [[6.1,-66.5],[6.4,-70.5],[5.8,-63.3]]){solid(cylinderGeometry,walnut,x,1.02,z,.67,.12,.67);rod([x,.04,z],[x,.98,z],.08,steel);for(const dx of [-.95,.95]){block(.62,.12,.65,x+dx,.57,z,sage);block(.62,.65,.12,x+dx,.94,z-.3,sage);rod([x+dx,.05,z],[x+dx,.52,z],.04,steel);}}
 // Small articulated background people are actual volumes with separate limbs.
 const limbGeometry=keepGeometry(new THREE.CapsuleGeometry(.075,.46,3,6));
 const personTorsoGeometry=keepGeometry(new THREE.LatheGeometry([new THREE.Vector2(.18,0),new THREE.Vector2(.22,.16),new THREE.Vector2(.30,.48),new THREE.Vector2(.20,.63)],10));
 const person=(shirt:THREE.Material,x:number,z:number,yaw=0,tone:THREE.Material=skin)=>{
  const root=new THREE.Group();root.position.set(x,.035,z);root.rotation.y=yaw;scene.add(root);
  solid(personTorsoGeometry,shirt,0,.84,0,1,1,.65,root);solid(round,tone,0,1.68,0,.128,.20,.13,root);solid(round,hair,0,1.81,-.025,.133,.08,.135,root);solid(round,tone,0,1.665,.125,.022,.037,.034,root);solid(cylinderGeometry,tone,0,1.48,0,.075,.16,.075,root);for(const ex of [-.057,.057]){solid(round,ink,ex,1.72,.12,.006,.008,.005,root);solid(round,tone,ex*2.6,1.68,.015,.035,.06,.025,root);}
  const arms=[-1,1].map(side=>{const pivot=new THREE.Group();pivot.position.set(side*.3,1.43,0);root.add(pivot);solid(limbGeometry,shirt,0,-.27,0,1,1,1,pivot);solid(round,tone,0,-.59,0,.085,.09,.08,pivot);return pivot;});
  const legs=[-1,1].map(side=>{const pivot=new THREE.Group();pivot.position.set(side*.14,.83,0);root.add(pivot);solid(limbGeometry,dark,0,-.32,0,1.15,1.18,1.15,pivot);meshBlock(.19,.10,.33,cream,pivot,0,-.77,.08);return pivot;});
  return {root,arms,legs};
 };
 const agent=person(dark,-10.5,-28.0,.9);const clerk=person(dark,-7.8,-27.7,.7);
 const cook=person(cream,-9.4,-57.7,.3);const barista=person(sage,-10,-68.6,.1);const customer=person(coral,6.2,-65.5,-.5,paleSkin);
 const loader=person(gold,7.7,-45.3,-Math.PI/2);const queueGuest=person(sage,-1.1,-40.8,.3,paleSkin);
 const loadBag=new THREE.Group();scene.add(loadBag);meshBlock(.6,.65,.4,coral,loadBag,0,.33,0);meshBlock(.27,.05,.12,ink,loadBag,0,.72,0);
 const walkers=[person(dark,11,-60,Math.PI),person(sage,11,-79,Math.PI,paleSkin)];
 const transitionTravelers=[person(cream,6.0,-83.8,.45)];
 transitionTravelers.forEach((guest,index)=>{guest.root.name=`gate-transition-traveler-${index}`;});
 const animateAirport=(time:number,reduced:boolean)=>{
  const t=reduced?0:time;
  agent.arms[0].rotation.x=-.8+Math.sin(t*1.2)*.12;agent.arms[1].rotation.x=-.65;clerk.arms[1].rotation.x=-.7+Math.sin(t)*.18;
  cook.arms[1].rotation.x=-.7+Math.sin(t*1.6)*.25;barista.arms[0].rotation.x=-.9+Math.sin(t*1.4)*.2;customer.root.rotation.y=-.5+Math.sin(t*.35)*.15;
  const lift=(Math.sin(t*.9)+1)*.5,reach=.38+lift*1.49;loader.arms[0].rotation.x=loader.arms[1].rotation.x=-reach;loadBag.position.set(7.7-.59*Math.sin(reach),.745-.59*Math.cos(reach),-45.3);queueGuest.arms[1].rotation.x=-.3+Math.sin(t*.7)*.2;
  walkers.forEach((walker,i)=>{walker.root.position.z=-60-i*19-Math.sin(t*.12+i)*2;walker.legs.forEach((leg,j)=>leg.rotation.x=Math.sin(t*2.8+i+j*Math.PI)*.28);walker.arms.forEach((arm,j)=>arm.rotation.x=Math.sin(t*2.8+i-j*Math.PI)*.25);});
 };
 for(const side of [-1,1])for(let i=0;i<4;i++){if(side===1&&(i===1||i===2))continue;const x=side*8.4-2.1+i*1.4,seatFinish=i===0?coral:cyan;
  block(1.12,.16,.94,x,.72,-91,seatFinish);block(1.12,1,.16,x,1.21,-91.47,seatFinish,[-.11,0,0]);
  block(1.04,.04,.05,x,1.68,-91.39,gold);block(1.04,.03,.05,x,.82,-90.53,cream);
  for(const arm of [-.6,.6]){rod([x+arm,.66,-91.3],[x+arm,1.0,-90.8],.025,steel);block(.075,.07,.62,x+arm,1.0,-91,walnut);}
  rod([x,0,-91],[x,.6,-91],.05,steel);
 }

 // Final gate desk, glazing, and an actual jetway leading out to the aircraft.
 sign("GATE 05","BOARDING",3.2,4.8,-102,7.4,1.2);
 block(3.4,1.1,1.1,-5,.56,-95,concrete,[0,0,0],true);block(3.6,.14,1.4,-5,1.17,-95,ink,[0,0,0],true);block(3.2,.6,.08,-5,.7,-94.42,cyan);
 for(let fin=0;fin<15;fin++)block(.035,.63,.04,-6.48+fin*.212,.62,-94.36,walnut);
 block(3.25,.04,.10,-5,.32,-94.34,gold);block(3.25,.04,.10,-5,1.02,-94.34,cream);
 const gateLogo=plane(2.9,.5,label("AMMAR ADAM","", "#ffc978",1024,128));gateLogo.position.set(-5,.73,-94.29);
 for(let x=-14;x<=14;x+=3.5){block(.18,9.5,.2,x,4.75,-104,steel);if(Math.abs(x)>1)block(3.3,8.4,.04,x+1.75,4.8,-104.02,glass);}
 for(const y of [3,6,9])block(28,.14,.14,0,y,-104,steel);
 block(3.1,.35,21,0,.15,-113,concrete);for(const x of [-1.7,1.7]){block(.18,3,21,x,1.6,-113,steel);for(let z=-104;z>-124;z-=2.7){block(.14,3.2,.12,x,1.7,z,ink);block(.04,2.4,2.5,x,1.65,z-1.35,glass);}}block(3.7,.2,21,0,3.3,-113,dark);
 // The departing aircraft is the same lit 3D geometry at rest and in flight.
 const airliner=createFilmAircraft(palette.materials);const aircraft=airliner.root;scene.add(aircraft);aircraft.position.set(-8,3.5,-128);

 // Fully articulated mesh traveller: the raised grip is the rope anchor.
 const traveler=createFilmTraveler3D({invalidate});scene.add(traveler.root);
 traveler.root.traverse(object=>{if(object instanceof THREE.Mesh){for(const material of Array.isArray(object.material)?object.material:[object.material])protectFilmRegistration(material);}});
 const travelerKey=new THREE.PointLight("#ffd9a0",12,13,2),travelerRim=new THREE.PointLight("#3a4f8a",4,11,2);scene.add(travelerKey,travelerRim);
 const tetherGeometry=keepGeometry(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]));
 const tether=new THREE.Line(tetherGeometry,keepMaterial(new THREE.LineBasicMaterial({color:"#b7f8f3"})));scene.add(tether);
 const landingShadow=new THREE.Mesh(keepGeometry(new THREE.CircleGeometry(1.1,32)),keepMaterial(new THREE.MeshBasicMaterial({color:"#071728",transparent:true,opacity:.35,depthWrite:false})));landingShadow.rotation.x=-Math.PI/2;landingShadow.position.y=.035;scene.add(landingShadow);

 for(const [mat,matrices] of staticBoxes){const instances=new THREE.InstancedMesh(unitBox,mat,matrices.length);matrices.forEach((matrix,i)=>instances.setMatrixAt(i,matrix));instances.instanceMatrix.needsUpdate=true;instances.computeBoundingSphere();scene.add(instances);}
 for(const [mat,matrices] of staticRods){const instances=new THREE.InstancedMesh(cylinderGeometry,mat,matrices.length);matrices.forEach((matrix,i)=>instances.setMatrixAt(i,matrix));instances.instanceMatrix.needsUpdate=true;instances.computeBoundingSphere();scene.add(instances);}
 const edgeGeometry=keepGeometry(new THREE.BufferGeometry());edgeGeometry.setAttribute("position",new THREE.Float32BufferAttribute(edgePoints,3));scene.add(new THREE.LineSegments(edgeGeometry,outline));
 scene.traverse(object=>{if(object instanceof THREE.Mesh){for(const material of Array.isArray(object.material)?object.material:[object.material]){if(material instanceof THREE.MeshBasicMaterial&&material.map instanceof THREE.CanvasTexture)protectFilmRegistration(material);}const mat=Array.isArray(object.material)?object.material[0]:object.material;if(mat instanceof THREE.MeshStandardMaterial && !mat.transparent)object.receiveShadow=true;}});
 carouselBase.castShadow=carouselCore.castShadow=true;
 checkinCases.forEach(group=>group.traverse(object=>{if(object instanceof THREE.Mesh)object.castShadow=true;}));
 // Merge only fixed material-matched pieces inside movable prop joints. Screens,
 // photographs and separately animated scene meshes keep their own identity.
 function batchProp(group:THREE.Object3D){
  for(const child of [...group.children])if(child instanceof THREE.Group)batchProp(child);
  if(group===scene||group===architecture.root||group===traveler.root||group===checkinIsland.root)return;
  const buckets=new Map<THREE.Material,THREE.Mesh[]>();
  for(const child of group.children)if(child instanceof THREE.Mesh&&!(child instanceof THREE.InstancedMesh)&&child.material instanceof THREE.MeshStandardMaterial){const pieces=buckets.get(child.material)??[];pieces.push(child);buckets.set(child.material,pieces);}
  for(const [material,pieces]of buckets){if(pieces.length<2)continue;const sources=pieces.map(piece=>{piece.updateMatrix();const source=piece.geometry.index?piece.geometry.toNonIndexed():new THREE.BufferGeometry().copy(piece.geometry);return source.applyMatrix4(piece.matrix);});const geometry=mergeGeometries(sources,false);sources.forEach(source=>source.dispose());if(!geometry)continue;keepGeometry(geometry);const mesh=new THREE.Mesh(geometry,material);mesh.receiveShadow=true;mesh.castShadow=pieces.some(piece=>piece.castShadow);pieces.forEach(piece=>group.remove(piece));group.add(mesh);}
 }
 for(const child of scene.children)if(child instanceof THREE.Group&&child!==architecture.root&&child!==traveler.root&&child!==aircraft&&child!==checkinIsland.root)batchProp(child);
 scene.traverse(object=>{if(object instanceof THREE.Mesh)ensurePaintUV(object.geometry);});
 // Each set is already merged by material. Keep its animated children intact
 // and let the normal room culler hide these independent room groups.
 const setDressing:FilmSet[]=[];
 const pendingSets=new Set<string>(),settledSets=new Set<string>();
 const pendingProgramRoots:THREE.Object3D[]=[];
 function attachPreparedLater(roots:THREE.Object3D[],name:string){
  const wrapper=new THREE.Group();wrapper.name=name;wrapper.visible=false;wrapper.userData.programsReady=false;wrapper.userData.unwrapAfterWarm=name!=="checkin-reference-wrapper";
  wrapper.add(...roots);scene.add(wrapper);pendingProgramRoots.push(wrapper);invalidate();
 }
 let setTime=0,setReduced=false;
 function requestSet(name:Parameters<typeof loadFilmSet>[0]){
  if(pendingSets.has(name))return;
  pendingSets.add(name);
  void loadFilmSet(name,palette.materials).then(set=>{
   if(dead){set.dispose();return;}
   set.update(setTime,setReduced);setDressing.push(set);
   if(name==="atrium")scene.add(...set.groups);else attachPreparedLater(set.groups,`${name}-prepared-furnishings`);
   settledSets.add(name);invalidate();
  }).catch(error=>{
   if(dead)return;
   console.warn(`Terminal ${name} furnishings unavailable.`,error);
   settledSets.add(name);invalidate();
  });
 }
 requestSet("atrium");
 const referenceSets:FilmSet[]=[];const requestedReferences=new Set<string>();
 let counterReferences:Awaited<ReturnType<typeof import("./film-counter-references")["createCounterReferences"]>>|undefined;
 let gateReferences:Awaited<ReturnType<typeof import("./film-gate-references")["createGateReferences"]>>|undefined;
 function requestReferences(zone:"checkin"|"security"|"concourse"|"gate"){
  if(requestedReferences.has(zone))return;requestedReferences.add(zone);
  // Room installations share the reference lifecycle, but build only near that room.
  void import("./film-room-art").then(module=>module.createFilmRoomArt(palette.materials,zone)).then(set=>{
   if(dead){set.dispose();return;}referenceSets.push(set);attachPreparedLater(set.groups,`${zone}-prepared-room-art`);
  }).catch(error=>console.warn(`Terminal ${zone} architectural art unavailable.`,error));
  const task=zone==="checkin"?import("./film-counter-references").then(module=>module.createCounterReferences(palette.materials,terminalReferences,invalidate))
   :zone==="security"?import("./film-security-references").then(module=>module.createSecurityReferences(palette.materials,terminalReferences,invalidate))
   :zone==="concourse"?import("./film-concourse-references").then(module=>module.createConcourseReferences(palette.materials,terminalReferences,invalidate))
   :import("./film-gate-references").then(module=>module.createGateReferences(palette.materials,terminalReferences,invalidate));
  void task.then(set=>{if(dead){set.dispose();return;}referenceSets.push(set);
   if(zone==="checkin")counterReferences=set as typeof counterReferences;
   if(zone==="gate")gateReferences=set as typeof gateReferences;
   attachPreparedLater(set.groups,zone==="checkin"?"checkin-reference-wrapper":`${zone}-prepared-references`);
   invalidate();
  }).catch(error=>console.warn(`Terminal ${zone} references unavailable.`,error));
 }
 const travelerBounds=new THREE.Box3();
 const temp=new THREE.Vector3(),look=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3(),forward=new THREE.Vector3();
 return {scene,camera,photos,
  takePendingProgramRoots(){return pendingProgramRoots.splice(0);},
  update(state){
   for(const [src,entry]of deferredTextures)if(!entry.started&&state.t>=entry.at)startTexture(src,entry);
   architecture.update(state.t,Math.abs(state.lookYaw??0)>.12);
   concourseIntroRoot.scale.set(state.aspect<.8?.50:1,state.aspect<.8?.78:1,1);concourseIntroRoot.position.x=state.aspect<.8?-.85:-1.9;
   let p=clamp(state.t);if(state.reduced)p=p<.24?.20:p<.45?.30:p<.65?.49:p<.72?.665:p<.79?.735:p<.86?.805:.94;
   const next=CAMERA.findIndex(key=>key.at>=p),b=CAMERA[next<0?CAMERA.length-1:next],a=CAMERA[Math.max(0,(next<0?CAMERA.length-1:next)-1)];const f=a===b?0:smooth((p-a.at)/(b.at-a.at));
   camera.position.set(...a.position).lerp(temp.set(...b.position),f);look.set(...a.target).lerp(temp.set(...b.target),f);camera.fov=mix(a.fov,b.fov,f)+(state.aspect<.8?9:0);camera.aspect=state.aspect;
   let cameraRoll=mix(a.roll,b.roll,f);
   if(p<.24&&!state.reduced){
    camera.position.set(flightValue(p,k=>k.position[0]),flightValue(p,k=>k.position[1]),flightValue(p,k=>k.position[2]));
    look.set(flightValue(p,k=>k.target[0]),flightValue(p,k=>k.target[1]),flightValue(p,k=>k.target[2]));
    camera.fov=flightValue(p,k=>k.fov)+(state.aspect<.8?9:0);cameraRoll=flightValue(p,k=>k.roll);
   }
   if(state.aspect<.8&&p>=.24&&p<=.440){const enter=smooth(clamp((p-.24)/.012)),exit=smooth(clamp((p-.433)/.007)),weight=enter*(1-exit);camera.position.lerp(temp.set(3.45,1.9,mix(-16.8,-17.8,clamp((p-.24)/.193))),weight);look.lerp(temp.set(3.8,.3,-26.1),weight);camera.fov=mix(camera.fov,74,weight);}
   if(state.aspect<.8&&p>=.445&&p<=.641){const enter=smooth(clamp((p-.445)/.01)),travel=clamp((p-.45)/.185),exit=smooth(clamp((p-.635)/.006));temp.set(5.05,1.85,mix(-33.5,-34.4,travel)).lerp(new THREE.Vector3(1.3,1.75,-44.6),exit);camera.position.lerp(temp,enter);temp.set(5.05,-.05,-40.6).lerp(new THREE.Vector3(-5.5,1.8,-47.5),exit);look.lerp(temp,enter);}
   if(state.aspect<.8&&p>=.649&&p<=.846){const enter=smooth(clamp((p-.649)/.01)),exit=1-smooth(clamp((p-.816)/.01)),weight=enter*exit;camera.position.x+=3.5*weight;camera.position.z+=2*weight;look.x-=4.4*weight;look.y-=.9*weight;camera.fov=mix(camera.fov,92,weight);}
   const flight=clamp(state.departure);if(flight&&!state.reduced){camera.position.lerp(temp.set(1,2.5,-90.5),smooth(flight));look.lerp(temp.set(5,4,-126),flight);}
   camera.up.set(0,1,0);camera.lookAt(look);camera.rotateZ(state.reduced?0:cameraRoll*(state.aspect<.8?.65:1));camera.updateProjectionMatrix();camera.updateMatrixWorld();
   // Practical spill sits at existing displays; only the light changes rooms.
   const practical=p<.45?[[3.45,2.4,-25.8],[-3,5.3,-23.8]]:p<.65?[[5.05,2.35,-40.2],[1.3,2.8,-43]]:p<.86?[[-10.7,2.4,p<.715?-57:p<.785?-67.5:-78],[-4.8,5.3,p<.715?-55.5:p<.785?-66:-76.5]]:[[4.4,3.1,-94],[0,4.5,-101]];
   screenSpill.position.set(...practical[0] as V3);signSpill.position.set(...practical[1] as V3);
   key.position.set(32,16,camera.position.z+12);key.target.position.set(0,0,camera.position.z-20);key.target.updateMatrixWorld();
   const checkin=clamp((p-.24)/.193),security=clamp((p-.45)/.185);
   deskLights.forEach((mesh,i)=>{mesh.visible=i===state.experienceIndex;});activeCompanyBoards.forEach((mesh,i)=>{mesh.visible=i===state.experienceIndex;});counterScreens.forEach((mesh,i)=>{mesh.visible=i===state.experienceIndex;});
   // Initialize even for a deep link, then leave hidden check-in belts alone.
   // Their absolute-time motion resumes at the correct pose when returning.
   if(p<.45||!checkinUpdated){
    checkinUpdated=true;
    checkinIsland.update({time:state.time,progress:checkin,selectedIndex:state.experienceIndex,reduced:state.reduced});
    checkinCases.forEach((group,i)=>{const angle=i/checkinCases.length*Math.PI*2+(state.reduced?0:(state.time??0)*.17)+checkin*.6;group.position.set(10.5+Math.cos(angle)*1.45,.84,-26.2+Math.sin(angle)*2.1);group.rotation.y=-angle;});
    updateBelt(state.reduced?0:state.time??0);
   }
   projectScreens.forEach((mesh,i)=>{mesh.visible=i===state.projectIndex;const image=(mesh.material as THREE.MeshBasicMaterial).map?.image as {width?:number;height?:number}|undefined;if(image?.width&&image?.height){const aspect=image.width/image.height;mesh.scale.set(Math.min(2.8,1.8*aspect),Math.min(1.8,2.8/aspect),1);}});
   projectMonitor.rotation.y=state.reduced?0:Math.sin(security*Math.PI*2)*.07;
   trays.forEach((group,i)=>{const travel=state.reduced?i*1.7:((state.time??0)*.34+i*1.9+security*2.2)%7.5;group.visible=p>=.43&&p<.65;group.position.z=-37.9-travel;group.rotation.y=0;});
   const scan=state.reduced?.5:(security*4)%1;scanPlane.position.set(archX,1.65,-42.55-scan*.9);scanBar.position.set(archX,3,-42.55-scan*.9);scanPlane.visible=scanBar.visible=p>=.45&&p<.64;
   animateAirport(state.time??0,state.reduced);
   transitionTravelers.forEach((guest,index)=>{guest.arms[0].rotation.x=state.reduced?-.16:-.16+Math.sin((state.time??0)*.45+index)*.06;});
   setTime=state.time??0;setReduced=state.reduced;
   if(p>=.29)requestSet("airside");
   if(p>=.45)requestSet("concourse");
   for(const set of setDressing)set.update(setTime,setReduced);
   if(p>=.16)requestReferences("checkin");if(p>=.29)requestReferences("security");if(p>=.45)requestReferences("concourse");if(p>=.65)requestReferences("gate");
   counterReferences?.updateSelection(state.experienceIndex);gateReferences?.updateProgress(p);
   for(const set of referenceSets)set.update(setTime,setReduced);
   scene.userData.ready=(Boolean(scene.userData.ready)||settledSets.has(p<.45?"atrium":p<.65?"airside":p<.86?"concourse":"airside"))&&Boolean(textureCache.get("/art/terminal-city-v3.webp")?.userData.settled)&&Boolean(palette.texture.userData.settled)&&Boolean(traveler.root.userData.paintLoaded||traveler.root.userData.paintError);scene.userData.stage=p<.24?"atrium":p<.45?"checkin":p<.65?"security":p<.86?"concourse":"gate";
   aircraft.position.set(-8+flight*38,3.5+flight*15,-128-flight*22);aircraft.rotation.set(0,flight*-.08,flight*.14);
   const hero=clamp(p/.24),landing=smooth(clamp((hero-.72)/.15));const visible=p<.275&&!state.reduced;traveler.root.visible=visible;
   // Keep NUM_POINT_LIGHTS stable when the hero exits: changing visibility
   // invalidates every room shader; zero intensity preserves the same lighting.
   travelerKey.intensity=visible?12:0;travelerRim.intensity=visible?4:0;
   if(visible){
    camera.getWorldDirection(forward);right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);
    const distance=4.4+.4*Math.sin(hero*Math.PI),lateral=state.aspect<.8?-.12+Math.sin(hero*Math.PI*2)*.44:1.35+Math.sin(hero*Math.PI*2)*1.25;
    temp.copy(camera.position).addScaledVector(forward,distance).addScaledVector(right,lateral).addScaledVector(up,-.95+Math.sin(hero*Math.PI)*.6);
    temp.lerp(new THREE.Vector3(1.7,.035,-24.1-clamp((p-.24)/.035)*.5),landing);temp.y=Math.max(.035,temp.y);
    traveler.root.position.copy(temp);traveler.root.rotation.set(0,Math.atan2(-forward.x,-forward.z)+Math.sin(hero*Math.PI*2)*.32*(1-landing),0);
    traveler.update(hero,state.time??hero*6,landing);traveler.root.updateMatrixWorld(true);
    if(hero>.72){travelerBounds.setFromObject(traveler.root);traveler.root.position.y+=Math.max(0,.035-travelerBounds.min.y);traveler.root.updateMatrixWorld(true);}
    travelerKey.position.copy(traveler.root.position).addScaledVector(right,2).addScaledVector(up,2.8).addScaledVector(forward,-1.7);travelerRim.position.copy(traveler.root.position).addScaledVector(right,-1.8).addScaledVector(up,2).addScaledVector(forward,1.4);
    traveler.raisedHand.getWorldPosition(temp);
    const rope=tetherGeometry.getAttribute("position") as THREE.BufferAttribute;rope.setXYZ(0,2,11.8,-6);rope.setXYZ(1,temp.x,temp.y,temp.z);rope.needsUpdate=true;tetherGeometry.computeBoundingSphere();tether.visible=hero>=.20&&hero<.54;
    landingShadow.position.set(traveler.root.position.x,.035,traveler.root.position.z);landingShadow.visible=true;landingShadow.scale.setScalar(.45+landing*.35);
   }else{tether.visible=false;landingShadow.visible=false;}
   // Apply user orientation after choreographing the traveler: looking behind
   // must not drag the character around with the camera.
   camera.rotateY(state.lookYaw??0);camera.rotateX(state.lookPitch??0);camera.updateMatrixWorld();
  },
  dispose(){dead=true;referenceSets.forEach(set=>set.dispose());setDressing.forEach(set=>set.dispose());traveler.dispose();checkinIsland.dispose();airliner.dispose();architecture.dispose();palette.dispose();scene.traverse(object=>{if(object instanceof THREE.InstancedMesh)object.dispose();if(object instanceof THREE.DirectionalLight)object.dispose();});for(const tx of textures)tx.dispose();for(const mat of materials)mat.dispose();for(const geometry of geometries)geometry.dispose();scene.clear();}
 };
}
