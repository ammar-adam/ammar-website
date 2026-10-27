import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { FilmMaterialPalette } from "./film-materials";
import { createSetBuilder, type FilmSet } from "./film-set-builder";
import { ensurePaintUV } from "./film-paint-uv";
import type { TerminalReference } from "@/data/references";
import { protectFilmRegistration } from "./terminal-post";

const GLYPHS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789→—-/·¾…";
const ATLAS_COLUMNS = 16, ATLAS_ROWS = Math.ceil(GLYPHS.length / ATLAS_COLUMNS);
const TILE_WIDTH = .164, TILE_HEIGHT = .42, HALF_HEIGHT = .206, HALF_CENTER = .107;
const COLUMNS = [
 { label: "ROUTE", left: -5.22, right: -3.50, count: 9 },
 { label: "DESTINATION", left: -3.20, right: 3.02, count: 35 },
 { label: "STATUS", left: 3.48, right: 5.20, count: 9 },
].map(column=>{
 // Every cassette stays inside its column, with a clear gutter on either
 // side of the dividers even when all 35 destination characters are occupied.
 const pitch=(column.right-column.left)/column.count;
 return{...column,pitch,start:column.left+pitch/2,width:Math.min(TILE_WIDTH,pitch-.021)};
});
const CELLS_PER_ROW = COLUMNS.reduce((sum, column) => sum + column.count, 0);
const fitColumnText=(value:string,count:number)=>{
 const letters=Array.from(value.trim().replace(/\s+/g," ").toUpperCase());
 return letters.length>count?[...letters.slice(0,count-1),"…"].join(""):letters.join("");
};
type PrintedWord = { text: string; center: [number,number,number]; unitHeight: number };
type GlyphPlate = { x:number; y:number; z:number; width:number; height:number; glyph:number; half:number; next?:number; flip?:number; tint?:THREE.Color };
type Flip = { from:number; to:number; start:number; delay:number };
const glyph = (letter:string) => Math.max(0, GLYPHS.indexOf(letter));

/** A mechanical fixture: recessed cassettes, spindle hardware, and two-sided
 * individual half-leaves. Its single atlas contains only printed glyphs. */
export function createGateReferences(palette:FilmMaterialPalette, references:readonly TerminalReference[], invalidate:()=>void):FilmSet & {updateDeparture:(departure:number)=>void} {
 const reference=references.find(item=>item.id==="gate-departures")!;
 const routes=reference.text!.map(line=>line.split("|"));
 const rowCount=Math.min(5,routes.length);
 if(!rowCount)throw new Error("The gate departure board needs at least one route.");
 const set=createSetBuilder(palette,"mechanical-departures-board"),root=set.root;
 root.position.set(...reference.position);root.rotation.set(...reference.rotation);root.scale.set(...reference.scale);
 root.userData={referenceId:reference.id,referenceLabel:reference.note,referenceDwell:reference.dwell,referenceStop:"gate",routeCount:routes.length};
 const groups:THREE.Group[]=[root],geometries=new Set<THREE.BufferGeometry>(),instances:THREE.InstancedMesh[]=[];
 const keep=<T extends THREE.BufferGeometry>(geometry:T)=>{ensurePaintUV(geometry);geometries.add(geometry);return geometry;};
 const ownedSets=[set];
 let disposed=false,lastFrame=-1,clockStart:number|undefined,lastCycle=0;

 // A shallow powder-coated cabinet. The dark inset is behind the cassette
 // lips; warm metal is a narrow reveal, not a bright rectangle around a UI.
 set.box([11.4,4.15,.34],[0,0,-.24],"dark",[0,0,0],.09);
 set.box([11.12,3.94,.08],[0,0,-.075],"ink",[0,0,0],.025);
 set.box([11.20,.035,.075],[0,2.035,-.065],"gold");
 set.box([11.20,.045,.075],[0,-2.035,-.065],"steel");
 for(const x of [-5.64,5.64])set.box([.035,4.02,.09],[x,0,-.09],"steel");
 for(const x of [-4.75,4.75]){
  set.rod([x,2.05,-.22],[x,4.20,-.22],.027,"steel");
  set.box([.24,.12,.18],[x,2.06,-.22],"steel",[0,0,0],.025);
 }
 for(const y of [1.22,-1.99])set.box([10.48,.013,.024],[-.10,y,-.022],"steel");
 for(const x of [-3.36,3.30])set.box([.012,2.84,.025],[x,-.55,-.025],"steel");
 for(const x of [-5.43,5.43])for(const y of [-1.90,1.90])set.add(new THREE.CylinderGeometry(.023,.023,.012,8),"steel",[x,y,-.043],[Math.PI/2,0,0]);

 const atlas=document.createElement("canvas");atlas.width=ATLAS_COLUMNS*64;atlas.height=ATLAS_ROWS*96;
 const context=atlas.getContext("2d")!;
 context.fillStyle="#0d0f1f";context.fillRect(0,0,atlas.width,atlas.height);
 context.fillStyle="#f4ecd8";context.font="700 74px Arial";context.textAlign="center";context.textBaseline="middle";
 [...GLYPHS].forEach((letter,index)=>context.fillText(letter,index%ATLAS_COLUMNS*64+32,Math.floor(index/ATLAS_COLUMNS)*96+50,56));
 const texture=new THREE.CanvasTexture(atlas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 const material=palette.ivory.clone();material.name="gate-printed-enamel";material.color.set("#ffffff");material.map=texture;material.roughness=.88;material.metalness=.02;material.side=THREE.DoubleSide;material.emissive.set("#ffffff");material.emissiveIntensity=.16;
 const baseCompile=palette.ivory.onBeforeCompile,baseKey=palette.ivory.customProgramCacheKey();
 material.onBeforeCompile=(shader,renderer)=>{
  baseCompile.call(material,shader,renderer);
  shader.vertexShader=shader.vertexShader.replace("#include <common>",`#include <common>
attribute float gateGlyph;attribute float gateNext;attribute float gateHalf;attribute float gateFlip;
varying vec2 vGateUv;varying vec4 vGateGlyph;`)
   .replace("#include <uv_vertex>","#include <uv_vertex>\nvGateUv=uv;vGateGlyph=vec4(gateGlyph,gateNext,gateHalf,gateFlip);");
  shader.fragmentShader=shader.fragmentShader.replace("#include <common>","#include <common>\nvarying vec2 vGateUv;varying vec4 vGateGlyph;")
   .replace("#include <map_fragment>",`#ifdef USE_MAP
 float backLeaf=vGateGlyph.w*(gl_FrontFacing?0.:1.);
 float character=mix(vGateGlyph.x,vGateGlyph.y,backLeaf);
 float halfY=vGateGlyph.z>1.5?vGateUv.y:(vGateGlyph.z+vGateUv.y)*.5;
 halfY=mix(halfY,(1.-vGateUv.y)*.5,backLeaf);
 vec2 cell=vec2(mod(character,${ATLAS_COLUMNS}.),${ATLAS_ROWS-1}.-floor(character/${ATLAS_COLUMNS}.));
 vec2 glyphUv=(cell+vec2((3.+vGateUv.x*58.)/64.,(1.+halfY*94.)/96.))/vec2(${ATLAS_COLUMNS}.,${ATLAS_ROWS}.);
 diffuseColor*=texture2D(map,glyphUv);
#endif`).replace("#include <emissivemap_fragment>","#include <emissivemap_fragment>\ntotalEmissiveRadiance *= diffuseColor.rgb;");
 };
 material.customProgramCacheKey=()=>`${baseKey}-mechanical-glyph-v2`;
 protectFilmRegistration(material);
 const white=new THREE.Color("#ffffff"),gold=new THREE.Color("#ffd9a0");
 const transform=new THREE.Object3D(),rotation=new THREE.Quaternion(),axis=new THREE.Vector3(1,0,0),offset=new THREE.Vector3();
 function plates(parent:THREE.Object3D,items:GlyphPlate[],name:string){
  const geometry=keep(new THREE.PlaneGeometry(1,1));
  const from=new THREE.InstancedBufferAttribute(new Float32Array(items.map(item=>item.glyph)),1);
  const next=new THREE.InstancedBufferAttribute(new Float32Array(items.map(item=>item.next??item.glyph)),1);
  geometry.setAttribute("gateGlyph",from);geometry.setAttribute("gateNext",next);
  geometry.setAttribute("gateHalf",new THREE.InstancedBufferAttribute(new Float32Array(items.map(item=>item.half)),1));
  geometry.setAttribute("gateFlip",new THREE.InstancedBufferAttribute(new Float32Array(items.map(item=>item.flip??0)),1));
  const mesh=new THREE.InstancedMesh(geometry,material,items.length);instances.push(mesh);mesh.name=name;mesh.receiveShadow=true;
  items.forEach((item,index)=>{transform.position.set(item.x,item.y,item.z);transform.rotation.set(0,0,0);transform.scale.set(item.width,item.height,1);transform.updateMatrix();mesh.setMatrixAt(index,transform.matrix);mesh.setColorAt(index,item.tint??white);});
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.computeBoundingSphere();parent.add(mesh);return{mesh,from,next};
 }
 const rowSources=Array.from({length:rowCount},(_,index)=>index),cellPositions:{x:number;y:number;width:number;column:number;slot:number}[]=[];
 const fixedItems:GlyphPlate[]=[],movingItems:GlyphPlate[]=[],headings:PrintedWord[]=[];
 for(let row=0;row<rowCount;row++)for(const [columnIndex,column]of COLUMNS.entries())for(let slot=0;slot<column.count;slot++){
  const x=column.start+slot*column.pitch,y=.54-row*.55;cellPositions.push({x,y,width:column.width,column:columnIndex,slot});
  for(const half of [0,1])fixedItems.push({x,y:y+(half?HALF_CENTER:-HALF_CENTER),z:.040,width:column.width,height:HALF_HEIGHT,glyph:0,half});
  movingItems.push({x,y,z:.052,width:0,height:0,glyph:0,next:0,half:1,flip:1});
 }
 function heading(text:string,x:number,y:number,width:number,height:number){
  [...text].forEach((letter,index)=>fixedItems.push({x:x+index*width,y,z:-.018,width:width*.91,height,glyph:glyph(letter),half:2}));
  headings.push({text,center:[x+(text.length-1)*width/2,y,0],unitHeight:height*74/96});
 }
 heading("DEPARTURES",-5.12,1.66,.285,.48);
 COLUMNS.forEach(column=>heading(column.label,column.start,.99,.143,.30));
 const fixed=plates(root,fixedItems,"fixed-letter-halves"),moving=plates(root,movingItems,"hinged-letter-leaves");
 fixed.mesh.userData.referenceId=reference.id;fixed.mesh.userData.referenceText=headings;
 moving.mesh.frustumCulled=false; // Instances rotate beyond their zero-scale rest bounds.
 const cassetteGeometry=keep(new RoundedBoxGeometry(TILE_WIDTH+.012,TILE_HEIGHT+.030,.048,1,.007));
 const cassette=new THREE.InstancedMesh(cassetteGeometry,palette.dark,cellPositions.length);instances.push(cassette);cassette.name="recessed-flap-cassettes";cassette.castShadow=cassette.receiveShadow=true;
 const spindleGeometry=keep(new THREE.CylinderGeometry(1,1,1,8));
 const spindles=new THREE.InstancedMesh(spindleGeometry,palette.steel,cellPositions.length);instances.push(spindles);spindles.name="flap-hinge-spindles";
 const pinGeometry=keep(new THREE.SphereGeometry(1,6,4));
 const pins=new THREE.InstancedMesh(pinGeometry,palette.steel,cellPositions.length*2);instances.push(pins);pins.name="flap-hinge-end-pins";
 cellPositions.forEach((cell,index)=>{
  const widthScale=cell.width/TILE_WIDTH;
  transform.position.set(cell.x,cell.y,.005);transform.rotation.set(0,0,0);transform.scale.set(widthScale,1,1);transform.updateMatrix();cassette.setMatrixAt(index,transform.matrix);
  transform.position.z=.046;transform.rotation.z=Math.PI/2;transform.scale.set(.006,.158*widthScale,.006);transform.updateMatrix();spindles.setMatrixAt(index,transform.matrix);
  for(let side=0;side<2;side++){transform.position.set(cell.x+(side?1:-1)*.083*widthScale,cell.y,.045);transform.rotation.set(0,0,0);transform.scale.set(.010*widthScale,.010,.006);transform.updateMatrix();pins.setMatrixAt(index*2+side,transform.matrix);}
 });
 for(const mesh of [cassette,spindles,pins]){mesh.computeBoundingSphere();root.add(mesh);}
 const current=new Uint16Array(cellPositions.length),flips=new Map<number,Flip>();
 function rowStrings(row:number){return COLUMNS.map((column,index)=>fitColumnText(routes[rowSources[row]][index]??"",column.count));}
 function updateMetadata(){
  fixed.mesh.userData.referenceText=[...headings,...rowSources.flatMap((_,row)=>rowStrings(row).map((text,column)=>({text,center:[COLUMNS[column].start+Math.max(0,Array.from(text).length-1)*COLUMNS[column].pitch/2,.54-row*.55,0],unitHeight:TILE_HEIGHT*74/96})))];
  root.userData.displayedRoutes=rowSources.map(index=>routes[index][0]);
 }
 function hideLeaf(index:number){transform.position.set(0,0,0);transform.rotation.set(0,0,0);transform.scale.set(0,0,0);transform.updateMatrix();moving.mesh.setMatrixAt(index,transform.matrix);}
 function settle(index:number,value:number){fixed.from.setX(index*2,value);fixed.from.setX(index*2+1,value);current[index]=value;hideLeaf(index);flips.delete(index);}
 function changeRow(row:number,animate:boolean,time:number){
  const strings=rowStrings(row);let cell=row*CELLS_PER_ROW;
  COLUMNS.forEach((column,columnIndex)=>{const text=strings[columnIndex].padEnd(column.count," ").slice(0,column.count),tint=columnIndex===2?gold:white;
   [...text].forEach((letter,slot)=>{
    const target=glyph(letter),index=cell++,old=current[index];
    fixed.mesh.setColorAt(index*2,tint);fixed.mesh.setColorAt(index*2+1,tint);moving.mesh.setColorAt(index,tint);
    if(!animate||old===target){settle(index,target);return;}
    fixed.from.setX(index*2,old);fixed.from.setX(index*2+1,target);moving.from.setX(index,old);moving.next.setX(index,target);
    flips.set(index,{from:old,to:target,start:time,delay:(columnIndex*10+slot)*.006});
   });
  });
  fixed.from.needsUpdate=true;moving.from.needsUpdate=true;moving.next.needsUpdate=true;fixed.mesh.instanceColor!.needsUpdate=true;moving.mesh.instanceColor!.needsUpdate=true;moving.mesh.instanceMatrix.needsUpdate=true;updateMetadata();
 }
 rowSources.forEach((_,row)=>changeRow(row,false,0));
 set.finish();root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root);root.userData.referenceBounds=[bounds.min.toArray(),bounds.max.toArray()];

 const optional=references.find(item=>item.id==="gate-nine-three-quarters");
 if(optional){
  const small=createSetBuilder(palette,"small-gate-wayfinding");ownedSets.push(small);small.root.position.set(...optional.position);small.root.rotation.set(...optional.rotation);small.root.scale.set(...optional.scale);small.root.userData={referenceId:optional.id,referenceDwell:optional.dwell};
  small.box([1.40,.50,.075],[0,0,-.065],"dark",[0,0,0],.035);
  const label="GATE 9¾",items:GlyphPlate[]=[...label].map((letter,index)=>({x:-.48+index*.16,y:0,z:-.021,width:.15,height:.38,glyph:glyph(letter),half:2}));
  const letters=plates(small.root,items,"small-gate-letters");letters.mesh.userData={referenceId:optional.id,referenceText:[{text:"Gate 9¾",center:[0,0,0],unitHeight:.38*74/96}]};small.finish();groups.push(small.root);
 }
 invalidate();
 return{groups,update(time,isReduced){
  if(disposed)return;const frame=Math.floor(time*12);if(frame===lastFrame)return;lastFrame=frame;
  if(!isReduced&&root.visible){if(clockStart===undefined)clockStart=time;const cycle=Math.floor((time-clockStart)/3);
   // Catch up only the visible rows after returning from a background tab.
   lastCycle=Math.max(lastCycle,cycle-rowCount);
   while(lastCycle<cycle){lastCycle++;const row=(lastCycle-1)%rowCount;rowSources[row]=(rowCount-1+lastCycle)%routes.length;changeRow(row,lastCycle===cycle,time);}
  }
  let changed=false;for(const[index,flip]of flips){const phase=isReduced?1:Math.max(0,Math.min(1,(time-flip.start-flip.delay)/.42));
   if(phase>=1){settle(index,flip.to);changed=true;continue;}
   const cell=cellPositions[index],angle=phase*Math.PI;rotation.setFromAxisAngle(axis,angle);offset.set(0,HALF_CENTER,0).applyQuaternion(rotation);
   transform.position.set(cell.x+offset.x,cell.y+offset.y,.052+offset.z);transform.quaternion.copy(rotation);transform.scale.set(cell.width,HALF_HEIGHT,1);transform.updateMatrix();moving.mesh.setMatrixAt(index,transform.matrix);changed=true;
  }
  if(changed){fixed.from.needsUpdate=true;moving.mesh.instanceMatrix.needsUpdate=true;}
 },updateDeparture(value){
  // The suspended fixture rises on its mounts before the plane crosses the
  // window. This only follows the triggered departure, never the scroll path.
  const t=Math.max(0,Math.min(1,value/.20)),lift=t*t*(3-2*t);
  root.position.y=reference.position[1]+lift*6.2;
  root.rotation.x=reference.rotation[0]-lift*.12;
  root.userData.departureClearance=lift;
 },dispose(){if(disposed)return;disposed=true;ownedSets.forEach(builder=>builder.dispose());instances.forEach(mesh=>mesh.dispose());geometries.forEach(geometry=>geometry.dispose());material.dispose();texture.dispose();flips.clear();}};
}


