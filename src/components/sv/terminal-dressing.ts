import * as THREE from "three";
import { createReferenceAssembly, printBase, printText } from "./film-reference-props";
import { createGateReferences } from "./film-gate-references";
import type { FilmMaterialPalette } from "./film-materials";
import type { FilmSet } from "./film-set-builder";
import { BACKGROUND_ROUTES, BANNER_LINES, TERMINAL_COPY } from "@/data/copy";

/** Quiet fixtures on upper/background surfaces; no foreground UI or new lights. */
export function createTerminalDressing(palette: FilmMaterialPalette, invalidate:()=>void):FilmSet {
 const owned:ReturnType<typeof createReferenceAssembly>[]=[],groups:THREE.Group[]=[];
 const animated:((time:number,reduced:boolean)=>void)[]=[];
 const fixture=(id:string,position:[number,number,number],build:(a:ReturnType<typeof createReferenceAssembly>)=>void,rotation:[number,number,number]=[0,0,0])=>{
  const a=createReferenceAssembly(palette,{id,stop:"background",position,rotation,scale:[1,1,1],priority:"B",note:id});
  build(a);a.finish();owned.push(a);groups.push(a.root);return a;
 };
 // Painted travel lightboxes: silhouetted landmarks, restrained reflected light.
 TERMINAL_COPY.cities.forEach((city,i)=>{
  const zone=Math.floor(i/2), z=[-30.65,-48.65,-83.65][zone],x=i%2?9:-8;
  fixture(`travel-${city}`,[x,5.15,z],({set,print})=>{
   set.box([2.46,2.7,.16],[0,0,-.08],"ink");
   set.box([2.34,2.58,.06],[0,0,.015],"gold");
   print(2.22,2.46,(ctx,w,h)=>{
    printBase(ctx,w,h);ctx.fillStyle=["#6c839b","#bd9164","#6b8e91"][zone];ctx.fillRect(0,0,w,h);
    ctx.fillStyle="#f0d6a2";ctx.beginPath();ctx.arc(w*.73,h*.28,w*.16,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#303a57";
    for(let n=0;n<9;n++){const height=h*(.12+((n*7+i*3)%9)*.035);ctx.fillRect(w*(n*.12-.03),h*.73-height,w*.10,height);}
    // A simple local landmark silhouette belongs to each painted skyline.
    const cx=w*.45, base=h*.74;ctx.beginPath();
    if(i===1){ctx.moveTo(cx-w*.16,base);ctx.lineTo(cx,base-h*.43);ctx.lineTo(cx+w*.16,base);}
    else if(i===2||i===5){ctx.arc(cx,base-h*.12,w*.18,Math.PI,0);ctx.lineTo(cx+w*.18,base);ctx.lineTo(cx-w*.18,base);}
    else {ctx.moveTo(cx-w*.045,base);ctx.lineTo(cx-w*.025,base-h*.47);ctx.lineTo(cx,base-h*.55);ctx.lineTo(cx+w*.025,base-h*.47);ctx.lineTo(cx+w*.045,base);}
    ctx.fill();ctx.fillStyle="#f4ecd8";ctx.fillRect(0,h*.80,w,h*.20);printText(ctx,city,h*.075,w*.08,h*.90);
   },[{text:city,height:.18}],[0,0,.055]);
  });
 });
 // Small wayfinding boards high on the back/transition walls.
 TERMINAL_COPY.wayfinding.forEach((line,i)=>{
  const zone=Math.floor(i/2),z=[-30.5,-48.5,-83.5][zone];
  fixture(`wayfinding-${i}`,[i%2?8.8:-7,7.6,z],({set,print})=>{
   set.box([3.3,.64,.16],[0,0,-.07],"ink");
   print(3.14,.49,(ctx,w,h)=>{printBase(ctx,w,h,true);printText(ctx,line,h*.42,w*.05,h*.52,"#f4ecd8");printText(ctx,i===2?"↗":"→",h*.50,w*.88,h*.52,"#ffd9a0");},[{text:line,height:.21}],[0,0,.02],undefined,true);
  });
 });
 // A single real-time clock strip; no date or clock state depends on animation time.
 fixture("world-clocks",[5.6,6.3,-30.65],({set,print})=>{
  set.box([5.5,1.05,.14],[0,0,-.08],"dark");
  const canvas=document.createElement("canvas");canvas.width=1536;canvas.height=288;const ctx=canvas.getContext("2d")!;
  const draw=()=>{printBase(ctx,1536,288,true);TERMINAL_COPY.clocks.forEach((clock,i)=>{
   const x=256+i*512;ctx.textAlign="center";printText(ctx,clock.label,44,x,66,"#c8cad2");
   printText(ctx,new Intl.DateTimeFormat("en-GB",{timeZone:clock.zone,hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date()),90,x,179,"#f4ecd8");
  });};
  draw();const face=print(5.3,.98,c=>c.drawImage(canvas,0,0,c.canvas.width,c.canvas.height),[],[0,0,.015],undefined,true);
  const tx=(face.material as THREE.MeshBasicMaterial).map!;let minute=-1;
  animated.push(()=>{const next=Math.floor(Date.now()/60000);if(next===minute)return;minute=next;draw();tx.image=canvas;tx.needsUpdate=true;invalidate();});
 });
 // Reuse the mechanical split-flap assembly, including its tick animation.
 const board=createGateReferences(palette,[{id:"gate-departures",stop:"security",position:[8.4,5.8,-48.5],rotation:[0,0,0],scale:[.33,.33,.33],priority:"B",note:"Background connections board",done:true,dwell:.55,text:BACKGROUND_ROUTES}],invalidate);
 groups.push(...board.groups);
 // Hanging banners and suspended folded paper planes between the arches.
 for(const [i,z] of [-25,-41,-61,-73].entries()){
  fixture(`hanging-banner-${i}`,[-7.8,7.9,z],({set,print})=>{
   for(const x of [-.65,.65])set.rod([x,.9,0],[x,2.2,0],.012,"steel");
   set.box([1.6,2,.035],[0,0,0],"ivory");
   print(1.5,1.9,(ctx,w,h)=>{printBase(ctx,w,h);if(i===3){ctx.fillStyle="#3a4f8a";ctx.fillRect(0,0,w,h);ctx.fillStyle="#f4ecd8";ctx.font=`700 ${h*.14}px Arial`;ctx.textAlign="center";BANNER_LINES.forEach((t,n)=>ctx.fillText(t,w/2,h*(.44+n*.18),w*.90));}else{const palettes=[["#b05147","#e8d5b5","#b05147"],["#467a7d","#e8d5b5","#a16b53"],["#b08b52","#e8d5b5","#3a4f8a"]];palettes[i].forEach((c,n)=>{ctx.fillStyle=c;ctx.fillRect(n*w/3,0,w/3,h);});}},[],[0,0,.025]);
  });
 }
 const flock=fixture("paper-plane-flock",[1,7.3,-68],({set})=>{
  for(let i=0;i<12;i++)set.rod([(i%4-1.5)*1.4,.2,Math.floor(i/4)*-1.3],[(i%4-1.5)*1.4,2.5,Math.floor(i/4)*-1.3],.006,"steel");
 });
 const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.Float32BufferAttribute([0,0,-.55,-.45,0,.35,0,-.08,.18,0,0,-.55,0,-.08,.18,.45,0,.35],3));geometry.computeVertexNormals();
 const planeMat=palette.ivory.clone();planeMat.side=THREE.DoubleSide;
 const planes=new THREE.InstancedMesh(geometry,planeMat,12);flock.root.add(planes);const dummy=new THREE.Object3D();
 animated.push((time,reduced)=>{for(let i=0;i<12;i++){dummy.position.set((i%4-1.5)*1.4,0,Math.floor(i/4)*-1.3);dummy.rotation.set(.1,(reduced?0:time*.09)+i*.55,.12*Math.sin(i));dummy.updateMatrix();planes.setMatrixAt(i,dummy.matrix);}planes.instanceMatrix.needsUpdate=true;planes.computeBoundingSphere();});
 // Soft skylight wedges: transparent geometry, no extra shadow/light passes.
 const shafts:THREE.Mesh[]=[];const shaftGeo=new THREE.PlaneGeometry(1,1);const shaftMat=new THREE.MeshBasicMaterial({color:"#ffdc9a",transparent:true,opacity:.018,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
 for(const z of [-26,-42,-62,-75]){const a=fixture(`skylight-${z}`,[7,5,z],()=>{});const shaft=new THREE.Mesh(shaftGeo,shaftMat);shaft.scale.set(2,9,1);shaft.rotation.z=-.38;a.root.add(shaft);shafts.push(shaft);}
 return {groups,update(time,reduced){board.update(time,reduced);for(const update of animated)update(time,reduced);},dispose(){owned.forEach(a=>a.dispose());board.dispose();planes.dispose();geometry.dispose();planeMat.dispose();shaftGeo.dispose();shaftMat.dispose();}};
}
