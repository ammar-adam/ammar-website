import * as THREE from "three";
import { careerArrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { memorySequence } from "./memorySequence";
import { createFilmTraveler3D } from "./film-traveler-3d";
import { createFilmMaterials } from "./film-materials";
import { createFilmArchitecture } from "./film-architecture";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createFilmAircraft } from "./film-aircraft";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

type V3 = [number,number,number];
type CameraKey = {at:number;position:V3;target:V3;roll:number;fov:number};
const CAMERA:CameraKey[] = [
 {at:0,position:[7,7.8,16],target:[1,3,-8],roll:-.26,fov:61},
 {at:.035,position:[5.2,5.2,5],target:[0,4,-13],roll:.20,fov:73},
 {at:.055,position:[4,6.8,0],target:[-1,2,-25],roll:.13,fov:68},
 {at:.075,position:[-1,6.4,-2],target:[3,4,-18],roll:.08,fov:72},
 {at:.112,position:[-3,5,-7],target:[1,1.7,-29],roll:-.12,fov:72},
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
 {at:.836,position:[.8,2.2,-79.4],target:[1.5,2.7,-88],roll:0,fov:70},
 {at:.841,position:[-4,1.9,-83],target:[-1,2,-82.5],roll:.015,fov:65},
 {at:.846,position:[2,1.9,-82.6],target:[9.4,2,-83],roll:.035,fov:65},
 {at:.850,position:[9.4,1.9,-81.5],target:[9.4,2.3,-90],roll:0,fov:63},
 {at:.854,position:[9.4,1.9,-85.8],target:[8,2.3,-96],roll:-.025,fov:61},
 {at:.86,position:[5.5,1.9,-90],target:[0,2.3,-105],roll:0,fov:61},
 {at:.93,position:[.5,1.8,-87],target:[0,2.5,-110],roll:0,fov:58},
 {at:1,position:[.5,1.8,-87],target:[0,2.8,-112],roll:0,fov:58},
];
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const smooth=(v:number)=>v*v*(3-2*v);

export interface TerminalWorldState { t:number; time?:number; reduced:boolean; experienceIndex:number; projectIndex:number; departure:number; aspect:number }
export interface TerminalModel {
 scene:THREE.Scene; camera:THREE.PerspectiveCamera; photos:THREE.Object3D[];
 update:(state:TerminalWorldState)=>void; dispose:()=>void;
}

export function createFilmTerminal(invalidate:()=>void):TerminalModel {
 const scene=new THREE.Scene();scene.background=new THREE.Color("#526d83");scene.fog=new THREE.Fog("#617387",42,155);
 const camera=new THREE.PerspectiveCamera(63,1,.08,650);
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
 const palette=createFilmMaterials(invalidate);
 const {ink,steel,coral,cyan,gold,dark,glass,warmLight:lightWarm,coolLight:lightCyan}=palette.materials;
 const concrete=palette.materials.ivory,cream=palette.materials.ivory,magenta=palette.materials.walnut;
 const toon=(color:string)=>keepMaterial(new THREE.MeshStandardMaterial({color,roughness:.82,metalness:.08}));
 const architecture=createFilmArchitecture(palette.materials);scene.add(architecture.root);
 const outline=keepMaterial(new THREE.LineBasicMaterial({color:"#091122",transparent:true,opacity:.72}));
 scene.add(new THREE.HemisphereLight("#b7d9e8","#997656",.5));
 const key=new THREE.DirectionalLight("#ffd0a0",3.2);key.position.set(20,24,0);key.castShadow=true;key.shadow.mapSize.set(1536,1536);key.shadow.camera.left=-24;key.shadow.camera.right=24;key.shadow.camera.top=24;key.shadow.camera.bottom=-24;key.shadow.camera.near=1;key.shadow.camera.far=95;key.shadow.bias=-.00035;key.shadow.normalBias=.025;scene.add(key,key.target);
 const cool=new THREE.DirectionalLight("#80cfe5",.55);cool.position.set(-12,7,10);scene.add(cool);
 const pink=new THREE.DirectionalLight("#edc7a1",.18);pink.position.set(-18,5,-70);scene.add(pink);
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
 const runway=plane(500,281.4,texture("/art/terminal-city-v3.webp"));runway.position.set(0,45,-224);(runway.material as THREE.MeshBasicMaterial).fog=false;
 block(280,.20,175,20,-.55,-191,concrete);
 for(let z=-115;z>-220;z-=12){block(.16,.015,6,-12,-.435,z,gold);block(.13,.015,6,-11.4,-.434,z,cream);}
 sign("DEPARTURES  →","TERMINAL A",-7,7.7,5,7.2,1.1);
 sign("CHECK-IN","01—05",-4,5.6,-24,10,1.35);
 sign("SECURITY  →","ALL GATES",10.4,4.7,-30.5,4.5,1.05);
 sign("←  A1—A12","DEPARTURES",-8.7,3.65,-48.55,6,1);
 sign("GATES 04—06  →","DEPARTURES",.5,4.6,-83.5,8,1.25);
 block(58,.3,38,0,-.28,32,concrete);
 const entrance=plane(10.6,1.3,label("TERMINAL A","DEPARTURES","#f6d6a2"));entrance.position.set(-5.3,9.3,14.3);

 // Five actual check-in stations: plinth, front fascia, countertop, luggage
 // scale and a desk monitor, backed by distinct airline-style display boards.
 const deskLights:THREE.Mesh[]=[];
 careerArrivals.forEach((entry,i)=>{
  const x=-10.7+i*2.85,z=-27;
  block(2.5,.92,1.1,x,.48,z,concrete,[0,0,0],true);block(2.65,.14,1.42,x,1.02,z+.05,ink,[0,0,0],true);
  block(2.38,.68,.055,x,.5,z+.59,i%2?steel:dark);block(2.4,.065,.08,x,.91,z+.65,lightCyan);
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
 const counterBody=new THREE.Mesh(keepGeometry(new RoundedBoxGeometry(5.3,1.05,1.8,5,.18)),steel);counterBody.position.set(3.45,.56,-26.1);scene.add(counterBody);
 const counterTop=new THREE.Mesh(keepGeometry(new RoundedBoxGeometry(5.52,.13,1.98,4,.06)),concrete);counterTop.position.set(3.45,1.15,-26.1);scene.add(counterTop);
 const counterFoot=new THREE.Mesh(keepGeometry(new RoundedBoxGeometry(5.12,.12,1.64,3,.05)),palette.materials.walnut);counterFoot.position.set(3.45,.11,-26.1);scene.add(counterFoot);
 for(let n=0;n<28;n++)block(.035,.77,.035,1.02+n*.18,.59,-25.19,gold);
 block(4.95,.025,.04,3.45,1.03,-25.18,lightWarm);
 const activeBoard=new THREE.Group();activeBoard.position.set(3.45,3.6,-28.6);scene.add(activeBoard);
 meshBlock(3.72,1.12,.13,ink,activeBoard);meshBlock(3.7,.025,.16,lightWarm,activeBoard,0,.57,.02);
 const activeCompanyBoards=careerArrivals.map((entry,i)=>{const image=plane(3.52,.94,label(entry.from.toUpperCase(),`0${i+1}  /  ${entry.origin.toUpperCase()}`,"#76e2e6",1536,384),activeBoard);image.position.z=.1;return image;});
 for(const x of [2.1,4.8])rod([x,4.16,-28.6],[x,7.6,-28.6],.025,steel);
 const counterMonitor=new THREE.Group();counterMonitor.position.set(4.5,1.67,-25.7);scene.add(counterMonitor);meshBlock(.1,.55,.12,steel,counterMonitor,0,-.33,0);meshBlock(1.05,.66,.12,ink,counterMonitor);
 const counterScreens=careerArrivals.map((entry,i)=>{const image=plane(.94,.54,label(String(i+1).padStart(2,"0"),entry.from.toUpperCase(),"#65dbed",512,256),counterMonitor);image.position.z=.08;return image;});
 // An oval luggage carousel turns continuously while this room is visible.
 const carouselBase=new THREE.Mesh(cylinderGeometry,ink);carouselBase.scale.set(3,.65,3.7);carouselBase.position.set(9.4,.35,-25.2);scene.add(carouselBase);
 const carouselCore=new THREE.Mesh(cylinderGeometry,steel);carouselCore.scale.set(1.9,.68,2.5);carouselCore.position.set(9.4,.8,-25.2);scene.add(carouselCore);
 const beltTreads=new THREE.InstancedMesh(unitBox,dark,64);scene.add(beltTreads);const beltDummy=new THREE.Object3D();
 const updateBelt=(time:number)=>{for(let n=0;n<64;n++){const angle=n/64*Math.PI*2+time*.17;beltDummy.position.set(9.4+Math.cos(angle)*2.45,.76,-25.2+Math.sin(angle)*3.1);beltDummy.rotation.y=Math.atan2(-2.45*Math.sin(angle),3.1*Math.cos(angle));beltDummy.scale.set(.89,.11,.29);beltDummy.updateMatrix();beltTreads.setMatrixAt(n,beltDummy.matrix);}beltTreads.instanceMatrix.needsUpdate=true;beltTreads.computeBoundingSphere();};updateBelt(0);
 const checkinCases:THREE.Group[]=[];
 for(let i=0;i<6;i++){const luggage=new THREE.Group();scene.add(luggage);meshBlock(.9,1.05,.58,i%3===0?coral:i%3===1?gold:magenta,luggage,0,.58,0);for(const x of [-.4,.4])meshBlock(.055,.98,.61,ink,luggage,x,.58,0);for(const x of [-.27,.27])meshBlock(.1,.14,.18,ink,luggage,x,.03,0);meshBlock(.35,.06,.12,ink,luggage,0,1.16,0);meshBlock(.13,.3,.015,cream,luggage,.14,.95,.31).rotation.z=.2;checkinCases.push(luggage);}
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
 block(2.35,2.1,2.8,6.2,1.35,-43,steel,[0,0,0],true);block(1.66,1.35,.07,6.2,1.15,-41.55,ink);
 for(let i=0;i<9;i++)block(.145,1.17,.05,5.55+i*.165,1.13,-41.49,dark,[0,0,(i%3-1)*.025]);
 block(2.05,.25,7.7,6.2,.68,-42,ink,[0,0,0],true);for(let i=0;i<34;i++)rod([5.25,.83,-38.3-i*.22],[7.15,.83,-38.3-i*.22],.055,i%3?steel:cyan);
 for(const z of [-39,-45]){block(.16,.7,.16,5.4,.35,z,steel);block(.16,.7,.16,7,.35,z,steel);}
 block(.2,1.5,.2,5.05,.75,-40.6,steel);
 const projectMonitor=new THREE.Group();projectMonitor.position.set(5.05,2.35,-40.6);scene.add(projectMonitor);meshBlock(3,2,.18,ink,projectMonitor);meshBlock(2.9,.05,.2,lightCyan,projectMonitor,0,-1.02,0);
 const projectScreens=projects.map(project=>{const image=plane(2.8,1.8,texture(project.screenshot),projectMonitor);image.position.z=.11;return image;});
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
 const walnut=palette.materials.walnut,sage=palette.materials.sage,tile=palette.materials.ivory,terracotta=toon("#a96744"),skin=palette.materials.skin,paleSkin=toon("#c59578"),hair=toon("#171d27");
 const round=keepGeometry(new THREE.SphereGeometry(1,10,7));
 const solid=(geometry:THREE.BufferGeometry,mat:THREE.Material,x:number,y:number,z:number,sx=1,sy=1,sz=1,parent:THREE.Object3D=scene)=>{const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh;};
 const photos:THREE.Object3D[]=[];
 const shops=[{code:"A02",name:"KITCHEN",finish:walnut},{code:"A03",name:"CAFÉ",finish:walnut},{code:"A04",name:"NEWSSTAND",finish:walnut}];
 shops.forEach((shop,i)=>{
  const z=-57-i*11;
  block(8.9,.12,10.4,-9.3,.065,z,tile);block(.35,6.7,10.5,-13.55,3.35,z,shop.finish);
  block(8.8,6.7,.3,-9.3,3.35,z-4.5,shop.finish);block(8.9,.25,10.5,-9.3,6.7,z,walnut);
  block(.28,5.8,.35,-4.9,2.9,z+4.7,walnut,[0,0,0],true);block(.28,5.8,.35,-4.9,2.9,z-4.7,walnut,[0,0,0],true);
  block(.36,1.15,9.8,-4.9,5.8,z,shop.finish,[0,0,0],true);block(.4,.08,9.8,-4.85,5.18,z,lightWarm);
  const fascia=plane(4.0,.68,label(shop.name,"","#ffe1a1",1536,256));fascia.position.set(-4.65,5.78,z+1.5);fascia.rotation.y=Math.PI/2;
  for(let n=0;n<16;n++)block(.055,1.2,.065,-4.63,4.55,z-4.5+n*.6,walnut);
  for(let n=0;n<7;n++){block(.035,.025,9.7,-12.5+n*1.1,.14,z,walnut);block(8.2,.025,.035,-9.3,.14,z-4+n*1.3,walnut);}
  for(const x of [-11.5,-8]){rod([x,6.5,z],[x,4.55,z],.025,ink);solid(cylinderGeometry,walnut,x,4.5,z,.38,.22,.38);solid(round,lightWarm,x,4.36,z,.28,.08,.28);}
  block(5.1,1.12,1.3,-9.4,.6,z+.4,shop.finish,[0,0,0],true);block(5.4,.16,1.48,-9.4,1.23,z+.4,walnut,[0,0,0],true);block(5.1,.07,.08,-9.4,1.1,z+1.08,lightWarm);
  for(let n=0;n<14;n++)block(.08,1.0,.08,-11.75+n*.36,.58,z+1.1,walnut);
  // Consistent full-image mounts form a real exhibition rail inside each bay.
  memorySequence.filter(memory=>memory.group===i).forEach((memory,slot)=>{
   const aspect=memory.width/memory.height,h=2.18,w=h*aspect,x=-11.65+slot*2.95,y=3.55;
   const frame=new THREE.Group();frame.position.set(x,y,z-4.25);scene.add(frame);meshBlock(w+.14,h+.14,.13,walnut,frame);meshBlock(w+.07,h+.07,.06,cream,frame,0,0,.045);
   const picture=plane(w,h,texture(memory.src),frame);picture.position.z=.085;picture.userData.photoIndex=memory.photoIndex;photos.push(picture);
   const caption=plane(Math.min(w,2.6),.22,canvasTexture((ctx,W,H)=>{ctx.clearRect(0,0,W,H);ctx.fillStyle="#e8ddc6";ctx.font="400 32px Arial";ctx.fillText(memory.caption,8,45,W-16);},768,64),frame,true);caption.position.set(0,-h*.5-.24,.09);
  });
  // Gate seating lives opposite each shop, behind the open walking lane.
  block(.22,4.0,.22,4.7,2,z,steel);const gate=plane(2.6,1.0,label(shop.code,"GATE","#7bdce9",768,256));gate.position.set(4.7,3.5,z+.15);
  for(let seat=0;seat<4;seat++){const x=6.4+seat*1.6;block(1.25,.18,.92,x,.66,z,dark,[0,0,0],true);block(1.25,.95,.18,x,1.2,z-.45,dark,[-.12,0,0]);rod([x-.4,0,z],[x-.4,.6,z],.04,steel);rod([x+.4,0,z],[x+.4,.6,z],.04,steel);}
 });
 // The rotating spit is real stacked geometry, in front of glowing grill bars.
 block(1.7,3.8,.22,-12.1,2.3,-56.2,ink,[0,0,0],true);
 for(const x of [-12.65,-12.1,-11.55])block(.1,2.8,.1,x,2.35,-56.0,lightWarm);
 const spit=new THREE.Group();spit.position.set(-12.1,2.3,-55.55);scene.add(spit);
 for(let n=0;n<15;n++){const radius=.59+Math.sin(n/14*Math.PI)*.23;const meat=solid(cylinderGeometry,n%3===0?walnut:terracotta,0,-1.1+n*.16,0,radius,.2,radius,spit);meat.rotation.y=n*.31;}
 rod([-12.1,.55,-55.55],[-12.1,4.1,-55.55],.045,steel);solid(cylinderGeometry,steel,-12.1,.65,-55.55,.92,.09,.92);
 // Café equipment, matcha cups and a low simmering nihari pot.
 block(1.3,.8,.75,-10.7,1.72,-67,steel,[0,0,0],true);block(1.18,.16,.86,-10.7,2.15,-67,ink);block(.9,.12,.3,-10.7,1.47,-66.65,lightWarm);
 for(let n=0;n<5;n++){solid(cylinderGeometry,cream,-8.8+n*.28,1.45,-67,.10,.26,.10);solid(cylinderGeometry,sage,-8.8+n*.28,1.585,-67,.085,.018,.085);}
 solid(cylinderGeometry,steel,-12,1.47,-67.1,.56,.38,.56);solid(cylinderGeometry,terracotta,-12,1.67,-67.1,.49,.025,.49);
 const menu=plane(1.55,1.8,label("Nihari","TODAY’S SPECIAL","#e4c27d",512,640));menu.position.set(-12.1,3,-68.9);
 const steam=Array.from({length:4},(_,i)=>solid(round,keepMaterial(new THREE.MeshBasicMaterial({color:"#efdfc4",transparent:true,opacity:.14,depthWrite:false})),-12,2.05+i*.26,-67.1,.1,.18,.1));
 // Warm café furniture and a small screen playing the station vignette.
 for(const [x,z] of [[6.1,-66.5],[6.4,-70.5],[5.8,-63.3]]){solid(cylinderGeometry,walnut,x,1.02,z,.67,.12,.67);rod([x,.04,z],[x,.98,z],.08,steel);for(const dx of [-.95,.95]){block(.62,.12,.65,x+dx,.57,z,sage);block(.62,.65,.12,x+dx,.94,z-.3,sage);rod([x+dx,.05,z],[x+dx,.52,z],.04,steel);}}
 block(2.8,1.65,.17,4.4,3.2,-71.8,ink,[0,-.2,0],true);rod([4.4,4.1,-71.8],[4.4,6.7,-71.8],.045,steel);const television=plane(2.6,1.462,texture("/art/paddington-screen-v3.webp"));television.position.set(4.38,3.2,-71.68);television.rotation.y=-.2;
 // Books, tiny skyline models and luggage tags fill the Toronto shop.
 for(const shelfY of [1.8,2.55,3.3]){block(.8,.1,6.1,-13,shelfY,-78.8,walnut);for(let n=0;n<12;n++)block(.23,.42,.15,-12.75,shelfY+.26,-81.4+n*.46,n%3===0?coral:n%3===1?sage:cream);}
 for(let n=0;n<5;n++){solid(cylinderGeometry,steel,-11+n*.7,1.7,-78,.035,.8,.035);solid(cylinderGeometry,cream,-11+n*.7,1.77,-78,.14,.1,.14);}
 for(const [i,city] of ["TORONTO","MISSISSAUGA"].entries()){block(.84,.42,.045,-8.4+i*1.05,1.52,-77.75,cream);const postcard=plane(.76,.34,label(city,"POSTCARDS","#e4c79c",512,192));postcard.position.set(-8.4+i*1.05,1.52,-77.72);}
 // An off-side recreation corner keeps the basketball reference incidental.
 block(6.2,.035,8,9.6,.07,-75.7,terracotta);for(const x of [6.6,12.6])block(.055,.025,7.8,x,.1,-75.7,cream);for(const z of [-71.8,-79.6])block(6,.025,.055,9.6,.1,z,cream);
 rod([12.5,0,-77.8],[12.5,4.1,-77.8],.065,steel);block(.1,1.25,1.9,12.4,3.7,-77.8,cream);const hoop=solid(keepGeometry(new THREE.TorusGeometry(.36,.025,6,18)),coral,11.95,3.25,-77.8);hoop.rotation.x=Math.PI/2;
 // Small articulated background people are actual volumes with separate limbs.
 const limbGeometry=keepGeometry(new THREE.CapsuleGeometry(.075,.46,3,6));
 const person=(shirt:THREE.Material,x:number,z:number,yaw=0,tone:THREE.Material=skin)=>{
  const root=new THREE.Group();root.position.set(x,.035,z);root.rotation.y=yaw;scene.add(root);
  solid(keepGeometry(new THREE.LatheGeometry([new THREE.Vector2(.18,0),new THREE.Vector2(.22,.16),new THREE.Vector2(.30,.48),new THREE.Vector2(.20,.63)],10)),shirt,0,.84,0,1,1,.65,root);solid(round,tone,0,1.68,0,.128,.20,.13,root);solid(round,hair,0,1.81,-.025,.133,.08,.135,root);solid(round,tone,0,1.665,.125,.022,.037,.034,root);solid(cylinderGeometry,tone,0,1.48,0,.075,.16,.075,root);for(const ex of [-.057,.057]){solid(round,ink,ex,1.72,.12,.006,.008,.005,root);solid(round,tone,ex*2.6,1.68,.015,.035,.06,.025,root);}
  const arms=[-1,1].map(side=>{const pivot=new THREE.Group();pivot.position.set(side*.3,1.43,0);root.add(pivot);solid(limbGeometry,shirt,0,-.27,0,1,1,1,pivot);solid(round,tone,0,-.59,0,.085,.09,.08,pivot);return pivot;});
  const legs=[-1,1].map(side=>{const pivot=new THREE.Group();pivot.position.set(side*.14,.83,0);root.add(pivot);solid(limbGeometry,dark,0,-.32,0,1.15,1.18,1.15,pivot);meshBlock(.19,.10,.33,cream,pivot,0,-.77,.08);return pivot;});
  return {root,arms,legs};
 };
 const agent=person(dark,3.4,-27.0,.55);const clerk=person(dark,-7.8,-27.7,.1);
 const cook=person(cream,-9.4,-57.7,.3);const barista=person(sage,-10,-68.6,.1);const customer=person(coral,6.2,-65.5,-.5,paleSkin);
 const loader=person(gold,7.6,-38.7,-Math.PI/2);const queueGuest=person(sage,-1.1,-40.8,.3,paleSkin);
 const loadBag=new THREE.Group();scene.add(loadBag);meshBlock(.6,.65,.4,coral,loadBag,0,.33,0);meshBlock(.27,.05,.12,ink,loadBag,0,.72,0);
 const pusher=person(coral,1.8,-59,Math.PI);const jersey=plane(.42,.5,label("66","", "#ffffff",256,256),pusher.root);jersey.position.set(0,1.18,-.18);jersey.rotation.y=Math.PI;
 const cart=new THREE.Group();scene.add(cart);meshBlock(.95,.1,1.3,steel,cart,0,.3,0);for(const x of [-.5,.5])for(const z of [-.65,.65]){meshBlock(.045,.85,.045,steel,cart,x,.72,z);solid(cylinderGeometry,ink,x,.15,z,.12,.08,.12,cart).rotation.z=Math.PI/2;}meshBlock(1.05,.045,.045,steel,cart,0,1.15,.65);meshBlock(.65,.8,.47,gold,cart,0,.75,-.1);meshBlock(.55,.5,.44,magenta,cart,0,1.39,-.1);
 const player=person(coral,9.1,-75.2,.8,paleSkin);const defender=person(dark,10.6,-77.4,-1.5);const ball=solid(round,terracotta,9,1,-75,.16,.16,.16);
 const walkers=[person(dark,9.0,-63,Math.PI),person(sage,10,-78,Math.PI,paleSkin)];
 const animateAirport=(time:number,reduced:boolean)=>{
  const t=reduced?0:time;spit.rotation.y=t*.55;
  steam.forEach((puff,i)=>{const phase=(t*.3+i*.25)%1;puff.position.y=1.9+phase*1.2;puff.position.x=-12+Math.sin(t+i)*.08;(puff.material as THREE.MeshBasicMaterial).opacity=(1-phase)*.14;});
  agent.arms[0].rotation.x=-.8+Math.sin(t*1.2)*.12;agent.arms[1].rotation.x=-.65;clerk.arms[1].rotation.x=-.7+Math.sin(t)*.18;
  cook.arms[1].rotation.x=-.7+Math.sin(t*1.6)*.25;barista.arms[0].rotation.x=-.9+Math.sin(t*1.4)*.2;customer.root.rotation.y=-.5+Math.sin(t*.35)*.15;
  const lift=(Math.sin(t*.9)+1)*.5;loader.arms[0].rotation.x=loader.arms[1].rotation.x=-.35-lift*1.05;loadBag.position.set(7.1-lift*.8,.8+Math.sin(lift*Math.PI)*.55,-38.7);queueGuest.arms[1].rotation.x=-.3+Math.sin(t*.7)*.2;
  pusher.root.position.z=Math.max(-82,Math.min(-61-Math.sin(t*.16)*4,camera.position.z-9));pusher.root.rotation.y=Math.PI;pusher.arms.forEach(arm=>arm.rotation.x=-1.05);pusher.legs.forEach((leg,i)=>leg.rotation.x=Math.sin(t*3+i*Math.PI)*.3);cart.position.copy(pusher.root.position);cart.position.z-=1.05;cart.rotation.y=pusher.root.rotation.y;
  walkers.forEach((walker,i)=>{walker.root.position.z=-63-i*14-Math.sin(t*.12+i)*2;walker.legs.forEach((leg,j)=>leg.rotation.x=Math.sin(t*2.8+i+j*Math.PI)*.28);walker.arms.forEach((arm,j)=>arm.rotation.x=Math.sin(t*2.8+i-j*Math.PI)*.25);});
  const bounce=Math.abs(Math.sin(t*2.8));ball.position.set(9.3,.25+bounce*1.2,-75.0);player.arms[1].rotation.x=-.4-bounce*.7;defender.arms.forEach((arm,i)=>arm.rotation.z=(i?1:-1)*(.5+Math.sin(t)*.12));
  (television.material as THREE.MeshBasicMaterial).color.setScalar(.97+Math.sin(t*.4)*.03);
 };
 for(const side of [-1,1])for(let i=0;i<4;i++){const x=side*8.4-2.1+i*1.4;block(1.12,.16,.94,x,.72,-91,dark);block(1.12,1,.16,x,1.21,-91.47,dark,[-.11,0,0]);rod([x,0,-91],[x,.6,-91],.05,steel);}

 // Final gate desk, glazing, and an actual jetway leading out to the aircraft.
 sign("GATE 05","BOARDING",3.2,4.8,-102,7.4,1.2);
 block(3.4,1.1,1.1,-5,.56,-95,concrete,[0,0,0],true);block(3.6,.14,1.4,-5,1.17,-95,ink,[0,0,0],true);block(3.2,.6,.08,-5,.7,-94.42,coral);
 const gateLogo=plane(2.9,.5,label("AMMAR ADAM","", "#ffc978",1024,128));gateLogo.position.set(-5,.73,-94.36);
 for(let x=-14;x<=14;x+=3.5){block(.18,9.5,.2,x,4.75,-104,steel);if(Math.abs(x)>1)block(3.3,8.4,.04,x+1.75,4.8,-104.02,glass);}
 for(const y of [3,6,9])block(28,.14,.14,0,y,-104,steel);
 block(3.1,.35,21,0,.15,-113,concrete);for(const x of [-1.7,1.7]){block(.18,3,21,x,1.6,-113,steel);for(let z=-104;z>-124;z-=2.7){block(.14,3.2,.12,x,1.7,z,ink);block(.04,2.4,2.5,x,1.65,z-1.35,glass);}}block(3.7,.2,21,0,3.3,-113,dark);
 // The departing aircraft is the same lit 3D geometry at rest and in flight.
 const airliner=createFilmAircraft(palette.materials);const aircraft=airliner.root;scene.add(aircraft);aircraft.position.set(-8,3.5,-128);

 // Fully articulated mesh traveller: the raised grip is the rope anchor.
 const traveler=createFilmTraveler3D({invalidate});scene.add(traveler.root);
 const travelerKey=new THREE.PointLight("#ffd1a3",0,13,2),travelerRim=new THREE.PointLight("#58dfff",0,11,2);scene.add(travelerKey,travelerRim);
 const tetherGeometry=keepGeometry(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]));
 const tether=new THREE.Line(tetherGeometry,keepMaterial(new THREE.LineBasicMaterial({color:"#b7f8f3"})));scene.add(tether);
 const landingShadow=new THREE.Mesh(keepGeometry(new THREE.CircleGeometry(1.1,32)),keepMaterial(new THREE.MeshBasicMaterial({color:"#071728",transparent:true,opacity:.35,depthWrite:false})));landingShadow.rotation.x=-Math.PI/2;landingShadow.position.y=.035;scene.add(landingShadow);

 for(const [mat,matrices] of staticBoxes){const instances=new THREE.InstancedMesh(unitBox,mat,matrices.length);matrices.forEach((matrix,i)=>instances.setMatrixAt(i,matrix));instances.instanceMatrix.needsUpdate=true;instances.computeBoundingSphere();scene.add(instances);}
 for(const [mat,matrices] of staticRods){const instances=new THREE.InstancedMesh(cylinderGeometry,mat,matrices.length);matrices.forEach((matrix,i)=>instances.setMatrixAt(i,matrix));instances.instanceMatrix.needsUpdate=true;instances.computeBoundingSphere();scene.add(instances);}
 const edgeGeometry=keepGeometry(new THREE.BufferGeometry());edgeGeometry.setAttribute("position",new THREE.Float32BufferAttribute(edgePoints,3));scene.add(new THREE.LineSegments(edgeGeometry,outline));
 scene.traverse(object=>{if(object instanceof THREE.Mesh){const mat=Array.isArray(object.material)?object.material[0]:object.material;if(mat instanceof THREE.MeshStandardMaterial && !mat.transparent)object.receiveShadow=true;}});
 counterBody.castShadow=counterTop.castShadow=carouselBase.castShadow=carouselCore.castShadow=true;
 checkinCases.forEach(group=>group.traverse(object=>{if(object instanceof THREE.Mesh)object.castShadow=true;}));
 // Merge only fixed material-matched pieces inside movable prop joints. Screens,
 // photographs and separately animated scene meshes keep their own identity.
 function batchProp(group:THREE.Object3D){
  for(const child of [...group.children])if(child instanceof THREE.Group)batchProp(child);
  if(group===scene||group===architecture.root||group===traveler.root)return;
  const buckets=new Map<THREE.Material,THREE.Mesh[]>();
  for(const child of group.children)if(child instanceof THREE.Mesh&&!(child instanceof THREE.InstancedMesh)&&child.material instanceof THREE.MeshStandardMaterial){const pieces=buckets.get(child.material)??[];pieces.push(child);buckets.set(child.material,pieces);}
  for(const [material,pieces]of buckets){if(pieces.length<2)continue;const sources=pieces.map(piece=>{piece.updateMatrix();return piece.geometry.clone().applyMatrix4(piece.matrix);});const geometry=mergeGeometries(sources,false);sources.forEach(source=>source.dispose());if(!geometry)continue;keepGeometry(geometry);const mesh=new THREE.Mesh(geometry,material);mesh.receiveShadow=true;mesh.castShadow=pieces.some(piece=>piece.castShadow);pieces.forEach(piece=>group.remove(piece));group.add(mesh);}
 }
 for(const child of scene.children)if(child instanceof THREE.Group&&child!==architecture.root&&child!==traveler.root&&child!==aircraft)batchProp(child);
 const travelerBounds=new THREE.Box3();
 const temp=new THREE.Vector3(),look=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3(),forward=new THREE.Vector3();
 return {scene,camera,photos,
  update(state){
   architecture.update(state.t);
   let p=clamp(state.t);if(state.reduced)p=p<.24?.20:p<.45?.30:p<.65?.49:p<.72?.665:p<.79?.735:p<.86?.805:.94;
   const next=CAMERA.findIndex(key=>key.at>=p),b=CAMERA[next<0?CAMERA.length-1:next],a=CAMERA[Math.max(0,(next<0?CAMERA.length-1:next)-1)];const f=a===b?0:smooth((p-a.at)/(b.at-a.at));
   camera.position.set(...a.position).lerp(temp.set(...b.position),f);look.set(...a.target).lerp(temp.set(...b.target),f);camera.fov=mix(a.fov,b.fov,f)+(state.aspect<.8?9:0);camera.aspect=state.aspect;
   if(state.aspect<.8&&p>=.24&&p<=.440){const enter=smooth(clamp((p-.24)/.012)),exit=smooth(clamp((p-.433)/.007)),weight=enter*(1-exit);camera.position.lerp(temp.set(3.45,1.9,mix(-16.8,-17.8,clamp((p-.24)/.193))),weight);look.lerp(temp.set(3.8,-1.3,-26.1),weight);camera.fov=mix(camera.fov,74,weight);}
   if(state.aspect<.8&&p>=.445&&p<=.641){const enter=smooth(clamp((p-.445)/.01)),travel=clamp((p-.45)/.185),exit=smooth(clamp((p-.635)/.006));temp.set(5.05,1.85,mix(-33.5,-34.4,travel)).lerp(new THREE.Vector3(1.3,1.75,-44.6),exit);camera.position.lerp(temp,enter);temp.set(5.05,-.05,-40.6).lerp(new THREE.Vector3(-5.5,1.8,-47.5),exit);look.lerp(temp,enter);}
   if(state.aspect<.8&&p>=.649&&p<=.846){const enter=smooth(clamp((p-.649)/.01)),exit=1-smooth(clamp((p-.831)/.01)),weight=enter*exit;camera.position.x+=3.5*weight;camera.position.z+=2*weight;look.x-=4.4*weight;look.y-=.9*weight;camera.fov=mix(camera.fov,92,weight);}
   const flight=clamp(state.departure);if(flight&&!state.reduced){camera.position.lerp(temp.set(1,2.5,-90.5),smooth(flight));look.lerp(temp.set(5,4,-126),flight);}
   camera.up.set(0,1,0);camera.lookAt(look);camera.rotateZ(state.reduced?0:mix(a.roll,b.roll,f)*(state.aspect<.8?.65:1));camera.updateProjectionMatrix();camera.updateMatrixWorld();
   key.position.set(32,16,camera.position.z+12);key.target.position.set(0,0,camera.position.z-20);key.target.updateMatrixWorld();
   const checkin=clamp((p-.24)/.193),security=clamp((p-.45)/.185);
   deskLights.forEach((mesh,i)=>{mesh.visible=i===state.experienceIndex;});activeCompanyBoards.forEach((mesh,i)=>{mesh.visible=i===state.experienceIndex;});counterScreens.forEach((mesh,i)=>{mesh.visible=i===state.experienceIndex;});
   activeBoard.rotation.y=state.reduced?0:Math.sin(checkin*Math.PI)*-.09;counterMonitor.rotation.y=state.reduced?0:Math.sin(checkin*Math.PI*2)*.22;
   checkinCases.forEach((group,i)=>{const angle=i/checkinCases.length*Math.PI*2+(state.reduced?0:(state.time??0)*.17)+checkin*.6;group.position.set(9.4+Math.cos(angle)*2.45,.84,-25.2+Math.sin(angle)*3.1);group.rotation.y=-angle;});
   projectScreens.forEach((mesh,i)=>{mesh.visible=i===state.projectIndex;const image=(mesh.material as THREE.MeshBasicMaterial).map?.image as {width?:number;height?:number}|undefined;if(image?.width&&image?.height){const aspect=image.width/image.height;mesh.scale.set(Math.min(2.8,1.8*aspect),Math.min(1.8,2.8/aspect),1);}});
   projectMonitor.rotation.y=state.reduced?0:Math.sin(security*Math.PI*2)*.07;
   trays.forEach((group,i)=>{const travel=state.reduced?i*1.7:((state.time??0)*.34+i*1.9+security*2.2)%7.5;group.visible=p>=.43&&p<.65;group.position.z=-37.9-travel;group.rotation.y=0;});
   const scan=state.reduced?.5:(security*4)%1;scanPlane.position.set(archX,1.65,-42.55-scan*.9);scanBar.position.set(archX,3,-42.55-scan*.9);scanPlane.visible=scanBar.visible=p>=.45&&p<.64;
   animateAirport(state.time??0,state.reduced);updateBelt(state.reduced?0:state.time??0);
   scene.userData.ready=true;scene.userData.stage=p<.24?"atrium":p<.45?"checkin":p<.65?"security":p<.86?"concourse":"gate";
   aircraft.position.set(-8+flight*38,3.5+flight*15,-128-flight*22);aircraft.rotation.set(0,flight*-.08,flight*.14);
   const hero=clamp(p/.24),landing=smooth(clamp((hero-.72)/.15));const visible=p<.275&&!state.reduced;traveler.root.visible=travelerKey.visible=travelerRim.visible=visible;
   if(visible){
    camera.getWorldDirection(forward);right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);
    const distance=4.4+.4*Math.sin(hero*Math.PI),lateral=state.aspect<.8?.1+Math.sin(hero*Math.PI*2)*.55:1.35+Math.sin(hero*Math.PI*2)*1.25;
    temp.copy(camera.position).addScaledVector(forward,distance).addScaledVector(right,lateral).addScaledVector(up,-.95+Math.sin(hero*Math.PI)*.6);
    temp.lerp(new THREE.Vector3(1.7,.035,-24.1-clamp((p-.24)/.035)*.5),landing);temp.y=Math.max(.035,temp.y);
    traveler.root.position.copy(temp);traveler.root.rotation.set(0,Math.atan2(-forward.x,-forward.z)+Math.sin(hero*Math.PI*2)*.32*(1-landing),0);
    traveler.update(hero,state.time??hero*6,landing);traveler.root.updateMatrixWorld(true);
    if(hero>.72){travelerBounds.setFromObject(traveler.root);traveler.root.position.y+=Math.max(0,.035-travelerBounds.min.y);traveler.root.updateMatrixWorld(true);}
    travelerKey.position.copy(traveler.root.position).addScaledVector(right,2).addScaledVector(up,2.8).addScaledVector(forward,-1.7);travelerRim.position.copy(traveler.root.position).addScaledVector(right,-1.8).addScaledVector(up,2).addScaledVector(forward,1.4);
    traveler.raisedHand.getWorldPosition(temp);
    const rope=tetherGeometry.getAttribute("position") as THREE.BufferAttribute;rope.setXYZ(0,2,11.8,4-hero*28);rope.setXYZ(1,temp.x,temp.y,temp.z);rope.needsUpdate=true;tetherGeometry.computeBoundingSphere();tether.visible=hero<.54;
    landingShadow.position.set(traveler.root.position.x,.035,traveler.root.position.z);landingShadow.visible=true;landingShadow.scale.setScalar(.45+landing*.35);
   }else{tether.visible=false;landingShadow.visible=false;}
  },
  dispose(){dead=true;traveler.dispose();airliner.dispose();architecture.dispose();palette.dispose();scene.traverse(object=>{if(object instanceof THREE.InstancedMesh)object.dispose();if(object instanceof THREE.DirectionalLight)object.dispose();});for(const tx of textures)tx.dispose();for(const mat of materials)mat.dispose();for(const geometry of geometries)geometry.dispose();scene.clear();}
 };
}
