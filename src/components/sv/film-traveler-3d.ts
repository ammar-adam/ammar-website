import * as THREE from "three";

export interface FilmTraveler3D {
  /** Standing height ~2m, feet at y=0, facing -Z; the backpack faces +Z. */
  root: THREE.Group;
  raisedHand: THREE.Object3D;
  update: (hero: number, time: number, grounded: number) => void;
  dispose: () => void;
}

type Ring = readonly [y: number, width: number, depth: number, x?: number, z?: number, turn?: number];
type Pose = { at:number; pitch:number; bank:number; twist:number; drop:number; leftShoulder:number; leftSpread:number; leftElbow:number; rightShoulder:number; rightSpread:number; rightElbow:number; leftHip:number; leftKnee:number; rightHip:number; rightKnee:number; leftAnkle:number; rightAnkle:number; casePitch:number; caseRoll:number };
const POSES:Pose[]=[
 {at:0,pitch:-.18,bank:-.12,twist:-.1,drop:0,leftShoulder:.02,leftSpread:-2.91,leftElbow:.10,rightShoulder:-.45,rightSpread:.26,rightElbow:.20,leftHip:.48,leftKnee:-.76,rightHip:-.40,rightKnee:-.45,leftAnkle:.18,rightAnkle:-.12,casePitch:-.32,caseRoll:-.11},
 {at:.22,pitch:-.32,bank:.14,twist:.15,drop:0,leftShoulder:.10,leftSpread:-3.01,leftElbow:.14,rightShoulder:-.75,rightSpread:.34,rightElbow:.30,leftHip:1.02,leftKnee:-1.70,rightHip:.73,rightKnee:-1.62,leftAnkle:.30,rightAnkle:.28,casePitch:-.65,caseRoll:.18},
 {at:.39,pitch:-.49,bank:.22,twist:.22,drop:0,leftShoulder:.08,leftSpread:-3.03,leftElbow:.06,rightShoulder:-.95,rightSpread:.4,rightElbow:.26,leftHip:1.36,leftKnee:-2.05,rightHip:1.18,rightKnee:-1.92,leftAnkle:.4,rightAnkle:.32,casePitch:-.86,caseRoll:.26},
 {at:.58,pitch:-.27,bank:-.16,twist:-.13,drop:0,leftShoulder:-.55,leftSpread:-2.05,leftElbow:.10,rightShoulder:-1.10,rightSpread:.35,rightElbow:.18,leftHip:.94,leftKnee:-.23,rightHip:-.84,rightKnee:-.34,leftAnkle:-.12,rightAnkle:-.26,casePitch:-.25,caseRoll:-.18},
 {at:.77,pitch:-.10,bank:-.06,twist:-.04,drop:.02,leftShoulder:-.25,leftSpread:-1.42,leftElbow:.40,rightShoulder:-.45,rightSpread:.24,rightElbow:.33,leftHip:.36,leftKnee:-.50,rightHip:-.13,rightKnee:-.40,leftAnkle:.08,rightAnkle:-.08,casePitch:-.30,caseRoll:-.12},
 {at:.87,pitch:-.16,bank:.02,twist:0,drop:.10,leftShoulder:.43,leftSpread:-.22,leftElbow:.50,rightShoulder:-.16,rightSpread:.20,rightElbow:.20,leftHip:.54,leftKnee:-.89,rightHip:.4,rightKnee:-.77,leftAnkle:.20,rightAnkle:.20,casePitch:.22,caseRoll:.08},
 {at:.94,pitch:-.26,bank:0,twist:0,drop:.20,leftShoulder:.65,leftSpread:-.20,leftElbow:.66,rightShoulder:-.03,rightSpread:.22,rightElbow:.38,leftHip:.76,leftKnee:-1.26,rightHip:.72,rightKnee:-1.20,leftAnkle:.26,rightAnkle:.26,casePitch:-.10,caseRoll:-.04},
 {at:1,pitch:0,bank:0,twist:0,drop:0,leftShoulder:.03,leftSpread:-.09,leftElbow:.10,rightShoulder:-.02,rightSpread:.15,rightElbow:.06,leftHip:.02,leftKnee:-.04,rightHip:-.02,rightKnee:-.025,leftAnkle:.02,rightAnkle:.04,casePitch:.03,caseRoll:0},
];
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const smooth=(t:number)=>t*t*(3-2*t);

/** Articulated cloth volumes; original painted albedo is bound to rear surfaces, never a plane. */
export function createFilmTraveler3D(options: { loader?: THREE.TextureLoader; invalidate?: () => void } = {}):FilmTraveler3D {
 const root=new THREE.Group();root.name="film-traveler-3d";
 let dead=false;
 const originalPaint={value:null as THREE.Texture|null},paintReady={value:0};
 if(typeof document!=="undefined"){
  originalPaint.value=(options.loader??new THREE.TextureLoader()).load("/art/traveler-v2.webp",texture=>{
   if(dead){texture.dispose();return;}
   paintReady.value=1;root.userData.paintLoaded=true;options.invalidate?.();
  },undefined,()=>{root.userData.paintError=true;options.invalidate?.();});
  originalPaint.value.colorSpace=THREE.SRGBColorSpace;originalPaint.value.anisotropy=4;
 }
 const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),skeletons=new Set<THREE.Skeleton>();
 const paint=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.88,metalness:0,flatShading:false});
 paint.onBeforeCompile=shader=>{
  shader.uniforms.originalTravelerPaint=originalPaint;shader.uniforms.originalTravelerReady=paintReady;
  shader.vertexShader=shader.vertexShader.replace("#include <common>",`#include <common>
   varying vec3 clothPoint;
   attribute vec3 paintProjection;
   attribute float clothRegion;
   varying vec3 originalPaintUV;
   varying float drawnRegion;
   varying vec3 clothRestNormal;`).replace("#include <begin_vertex>",`#include <begin_vertex>
   clothPoint=position;originalPaintUV=paintProjection;drawnRegion=clothRegion;clothRestNormal=normal;`);
  shader.fragmentShader=shader.fragmentShader.replace("#include <common>",`#include <common>
   varying vec3 clothPoint;
   varying vec3 originalPaintUV;
   varying float drawnRegion;
   varying vec3 clothRestNormal;
   uniform sampler2D originalTravelerPaint;
   uniform float originalTravelerReady;
   float drawnStroke(vec2 p,vec2 a,vec2 b,float width){
    vec2 axis=b-a;float along=clamp(dot(p-a,axis)/dot(axis,axis),0.0,1.0);
    float distanceToStroke=length(p-a-along*axis);
    float irregularWidth=width*1.65*(0.78+0.22*sin(along*17.0));
    float aa=max(fwidth(distanceToStroke)*0.7,0.00035);
    float broken=1.0-smoothstep(0.42,0.47,along)* (1.0-smoothstep(0.53,0.57,along));
    return (1.0-smoothstep(irregularWidth-aa,irregularWidth+aa,distanceToStroke))*broken;
   }
   float garmentInk(vec2 p,float region){
    float ink=0.0;
    if(region>0.5&&region<1.5){
     ink=max(drawnStroke(p,vec2(-.15,.16),vec2(-.055,.115),.0022),drawnStroke(p,vec2(.03,.29),vec2(.15,.315),.0021));
     ink=max(ink,drawnStroke(p,vec2(-.19,.42),vec2(-.14,.34),.0018));
    }else if(region>1.5&&region<2.5){
     ink=max(drawnStroke(p,vec2(-.13,.23),vec2(.055,.325),.0025),drawnStroke(p,vec2(.035,.12),vec2(.145,.20),.0022));
     ink=max(ink,drawnStroke(p,vec2(-.12,.035),vec2(.02,.085),.002));
    }else if(region>2.5&&region<3.5){
     ink=max(drawnStroke(p,vec2(-.064,-.205),vec2(.028,-.235),.002),drawnStroke(p,vec2(.01,-.315),vec2(.063,-.35),.0024));
     ink=max(ink,drawnStroke(p,vec2(-.045,-.445),vec2(.034,-.405),.002));
    }else if(region>3.5&&region<4.5){
     ink=max(drawnStroke(p,vec2(-.06,-.36),vec2(.045,-.415),.0027),drawnStroke(p,vec2(-.045,-.46),vec2(.05,-.45),.0019));
     ink=max(ink,drawnStroke(p,vec2(-.04,-.72),vec2(.045,-.765),.0021));
    }else if(region>4.5){
     ink=max(drawnStroke(p,vec2(-.145,.09),vec2(-.135,.26),.0024),drawnStroke(p,vec2(-.135,.26),vec2(.105,.29),.0024));
     ink=max(ink,drawnStroke(p,vec2(.105,.10),vec2(.12,.19),.002));
    }
    return ink;
   }`).replace("#include <color_fragment>",`#include <color_fragment>
   vec3 brushCell=floor(clothPoint*vec3(110.0,175.0,95.0));
   float pigment=fract(sin(dot(brushCell,vec3(13.13,67.71,41.9)))*43758.5453);
   float stroke=sin(clothPoint.y*173.0+sin(clothPoint.x*41.0)*3.0);
   diffuseColor.rgb*=0.88+0.10*pigment+0.025*stroke;
   if(originalTravelerReady>0.5&&originalPaintUV.z>0.001){
    vec4 originalPigment=texture2D(originalTravelerPaint,originalPaintUV.xy);
    float inside=step(0.0,originalPaintUV.x)*step(originalPaintUV.x,1.0)*step(0.0,originalPaintUV.y)*step(originalPaintUV.y,1.0);
    float cover=smoothstep(0.7,0.9,originalPigment.a)*inside;
    diffuseColor.rgb=mix(diffuseColor.rgb,originalPigment.rgb,0.60*originalPaintUV.z*cover);
   }
   // Deliberately placed creases use bind coordinates, so they bend with the real cloth.
   float rearSurface=smoothstep(-0.08,0.25,clothRestNormal.z);
   float creaseInk=garmentInk(clothPoint.xy,drawnRegion)*rearSurface;
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.006,.010,.019),creaseInk*.76);
   `).replace("#include <opaque_fragment>",`
   outgoingLight=mix(outgoingLight,diffuseColor.rgb,0.19);
   if(drawnRegion>0.5){
    // Lighting bands use real scene illumination; a fixed paint edge breaks each transition.
    float baseValue=max(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722)),.014);
    float lightValue=dot(outgoingLight,vec3(.2126,.7152,.0722))/baseValue;
    float edgePaint=.025*sin(clothPoint.y*97.0+sin(clothPoint.x*71.0)*2.0);
    float band=mix(.34,.78,smoothstep(.43+edgePaint,.49+edgePaint,lightValue));
    band=mix(band,1.22,smoothstep(.95+edgePaint,1.01+edgePaint,lightValue));
    band+=max(0.0,lightValue-1.6)*.55;
    vec3 graphicLight=outgoingLight/max(lightValue,.12)*band;
    outgoingLight=mix(outgoingLight,graphicLight,.74);
    float edge=1.0-clamp(dot(normal,normalize(vViewPosition)),0.0,1.0);
    float brokenEdge=smoothstep(-.15,.45,sin(clothPoint.y*43.0+clothPoint.x*31.0));
    float inkEdge=smoothstep(.91,.995,edge)*brokenEdge*rearSurface;
    outgoingLight=mix(outgoingLight,vec3(.004,.008,.015),inkEdge*.72);
    vec3 rimPigment=mix(vec3(.025,.28,.49),vec3(.58,.085,.026),smoothstep(-.14,.14,clothRestNormal.x));
    float rimEdge=smoothstep(.67,.92,edge)*(1.0-smoothstep(.95,1.0,edge));
    outgoingLight+=rimPigment*rimEdge*brokenEdge*rearSurface*.23;
   }
   #include <opaque_fragment>`);
 };
 paint.customProgramCacheKey=()=>"traveler-film-language-v3";materials.add(paint);
 const palette={navy:"#24365d",light:"#3a527f",dark:"#131d36",black:"#121722",red:"#c52e29",coral:"#eb5636",cyan:"#237db1",cream:"#ded2b6",sole:"#a79b82",skin:"#793e2b",metal:"#65717b"};
 const color=new THREE.Color();
 function finish(source:THREE.BufferGeometry,base:string,variance=.025){
  source.computeVertexNormals();
  const geometry=source.index?source.toNonIndexed():source;
  const softNormals=geometry.getAttribute("normal").clone();
  if(geometry!==source)source.dispose();geometry.computeVertexNormals();
  const blendedNormals=geometry.getAttribute("normal"),blend=new THREE.Vector3();
  for(let i=0;i<blendedNormals.count;i++){
   blend.set(mix(blendedNormals.getX(i),softNormals.getX(i),1),mix(blendedNormals.getY(i),softNormals.getY(i),1),mix(blendedNormals.getZ(i),softNormals.getZ(i),1)).normalize();
   blendedNormals.setXYZ(i,blend.x,blend.y,blend.z);
  }
  const position=geometry.getAttribute("position");
  const colors=new Float32Array(position.count*3),uvs=new Float32Array(position.count*2);
  for(let i=0;i<position.count;i+=3){
   const face=i/3,grain=Math.sin(face*52.31+position.getY(i)*93.7)*.5+.5;
   const light=.94+grain*variance;
   color.set(base).multiplyScalar(light);
   for(let j=0;j<3;j++){colors[(i+j)*3]=color.r;colors[(i+j)*3+1]=color.g;colors[(i+j)*3+2]=color.b;uvs[(i+j)*2]=position.getX(i+j);uvs[(i+j)*2+1]=position.getY(i+j);}
  }
  geometry.setAttribute("color",new THREE.BufferAttribute(colors,3));
  geometry.setAttribute("uv",new THREE.BufferAttribute(uvs,2));geometries.add(geometry);return geometry;
 }
 function mesh(parent:THREE.Object3D,geometry:THREE.BufferGeometry,base:string){const item=new THREE.Mesh(finish(geometry,base),paint);item.castShadow=true;item.receiveShadow=true;parent.add(item);return item;}
 function joint(parent:THREE.Object3D,name:string,x=0,y=0,z=0){const group=new THREE.Group();group.name=name;group.position.set(x,y,z);parent.add(group);return group;}
 // Offset elliptical rings make tapered cloth, with broad irregular folds rather than cylinders.
 function loft(controls:readonly Ring[],segments=24,fold=.025,start=0,arc=Math.PI*2,cap=true){
  const rings:Ring[]=[],last=controls.length-1;
  const cat=(a:number,b:number,c:number,d:number,t:number)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
  for(let section=0;section<last;section++)for(let step=0;step<4;step++){
   const a=controls[Math.max(0,section-1)],b=controls[section],c=controls[section+1],d=controls[Math.min(last,section+2)],r:number[]=[];
   for(let axis=0;axis<6;axis++)r.push(cat(a[axis]??0,b[axis]??0,c[axis]??0,d[axis]??0,step/4));
   rings.push(r as unknown as Ring);
  }
  rings.push(controls[last]);segments=Math.max(24,segments);
  const positions:number[]=[],indices:number[]=[];const ascending=rings[rings.length-1][0]>rings[0][0],closed=Math.abs(arc-Math.PI*2)<.01,n=closed?segments:segments+1;
  rings.forEach((r,row)=>{for(let i=0;i<n;i++){const a=start+i/segments*arc+(r[5]??0),vertical=row/(rings.length-1),f=1+fold*(Math.sin(a*3+vertical*5)+.4*Math.cos(a*5-vertical*7));positions.push((r[3]??0)+Math.sin(a)*r[1]*f,r[0],(r[4]??0)+Math.cos(a)*r[2]*f);}});
  for(let row=0;row<rings.length-1;row++)for(let i=0;i<segments;i++){const a=row*n+i,b=row*n+(closed?(i+1)%n:i+1),c=(row+1)*n+i,d=(row+1)*n+(closed?(i+1)%n:i+1);if(ascending)indices.push(a,b,c,b,d,c);else indices.push(a,c,b,b,c,d);}
  if(cap&&closed){for(const [row,reverse]of [[0,true],[rings.length-1,false]] as const){const r=rings[row],c=positions.length/3;positions.push(r[3]??0,r[0],r[4]??0);for(let i=0;i<n;i++){const a=row*n+i,b=row*n+(i+1)%n,flip=reverse===ascending;indices.push(c,flip?b:a,flip?a:b);}}}
  const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);return geo;
 }
 function garment(parent:THREE.Object3D,rings:readonly Ring[],bendAt:number,blendWidth:number,base:string){
  const fixed=new THREE.Bone(),bend=new THREE.Bone();fixed.name="garment-root";bend.name="fabric-bend";bend.position.y=-bendAt;fixed.add(bend);parent.add(fixed);
  const geometry=finish(loft(rings,28,.025),base),position=geometry.getAttribute("position"),indices:number[]=[],weights:number[]=[];
  for(let i=0;i<position.count;i++){const t=smooth(clamp((-position.getY(i)-bendAt+blendWidth)/(blendWidth*2)));indices.push(0,1,0,0);weights.push(1-t,t,0,0);}
  geometry.setAttribute("skinIndex",new THREE.Uint16BufferAttribute(indices,4));geometry.setAttribute("skinWeight",new THREE.Float32BufferAttribute(weights,4));
  const surface=new THREE.SkinnedMesh(geometry,paint),skeleton=new THREE.Skeleton([fixed,bend]);skeletons.add(skeleton);surface.castShadow=true;surface.receiveShadow=true;surface.frustumCulled=false;parent.add(surface);root.updateMatrixWorld(true);surface.bind(skeleton);return bend;
 }
 function cloth(parent:THREE.Object3D,rings:readonly Ring[],base=palette.navy,fold=.035){return mesh(parent,loft(rings,12,fold),base);}
 function panel(parent:THREE.Object3D,points:readonly (readonly [number,number,number])[],base:string){const p=points.flat(),g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(p,3));const indices:number[]=[];for(let i=1;i<points.length-1;i++)indices.push(0,i,i+1);g.setIndex(indices);const m=mesh(parent,g,base);return m;}
 function cord(parent:THREE.Object3D,points:readonly (readonly [number,number,number])[],radius:number,base:string){return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(8,points.length*3),radius,5,false),base);}
 const body=joint(root,"pelvis",0,1,0),torso=joint(body,"torso");
 cloth(torso,[[.025,.161,.105],[.075,.174,.113,-.004,.003],[.18,.162,.105,.006,0],[.32,.190,.124,-.006,.004],[.45,.210,.124],[.52,.196,.113],[.59,.105,.096]],palette.navy,.045);
 cloth(torso,[[.025,.161,.107],[.052,.173,.115],[.075,.168,.111]],palette.dark,.055);
 cloth(torso,[[.012,.157,.105],[.027,.164,.108]],palette.cream,.01);
 // Angular seam and fabric patches sit on the folded silhouette, without all-over outlines.
 panel(torso,[[-.17,.13,-.119],[.15,.15,-.12],[.12,.29,-.144],[-.14,.26,-.14]],palette.dark);
 cord(torso,[[-.02,.52,-.13],[-.027,.34,-.15],[-.019,.21,-.134]],.005,palette.black);
 for(const side of [-1,1])cord(torso,[[side*.06,.57,-.12],[side*.07,.44,-.157],[side*.065,.38,-.153]],.004,palette.red);
 const head=joint(torso,"hood-and-head",0,.60,-.006);head.scale.setScalar(.78);
 const hoodRings:Ring[]=[[-.105,.18,.135,0,.035],[-.025,.151,.148,0,.025],[.055,.175,.17,0,.025],[.18,.205,.19,.005,.02],[.30,.174,.168,0,.025],[.385,.105,.122,-.015,.055],[.425,.012,.022,-.035,.09]];
 mesh(head,loft(hoodRings,15,.025,-2.36,4.72,false),palette.navy);
 const inner=mesh(head,loft(hoodRings.map(r=>[r[0]-.008,r[1]*.935,r[2]*.92,r[3],(r[4]??0)-.003] as Ring),15,0,-2.36,4.72,false),palette.red);inner.material=paint;
 for(const side of [-1,1])cord(head,[[side*.085,-.025,-.072],[side*.13,.055,-.11],[side*.144,.18,-.115],[side*.122,.30,-.094],[side*.061,.39,-.033]],.0045,side===1?palette.coral:palette.light);
 panel(head,[[-.02,.415,.075],[.14,.30,.095],[.12,.20,.177],[-.12,.20,.177],[-.15,.30,.11]],palette.light);
 panel(head,[[.14,.30,.095],[.20,.17,.03],[.14,.11,.16],[.12,.20,.179]],palette.dark);
 panel(head,[[-.15,.30,.11],[-.20,.17,.03],[-.15,.08,.14],[-.12,.20,.179]],palette.light);
 cloth(head,[[.02,.06,.062,0,-.075],[.07,.091,.078,0,-.09],[.19,.102,.08,0,-.09],[.275,.083,.071,0,-.075],[.305,.035,.035,0,-.065]],palette.skin,.012);
 // Narrow brow, nose and jaw are mostly occluded inside the hood; no oversized toy eyes.
 panel(head,[[-.08,.185,-.162],[.08,.185,-.162],[.067,.225,-.156],[-.066,.227,-.156]],palette.dark);
 cloth(head,[[.182,.005,.005,0,-.165],[.151,.012,.022,0,-.168],[.139,.010,.009,0,-.165]],palette.skin,0);
 panel(head,[[-.13,.265,-.106],[.12,.265,-.106],[.11,.224,-.18],[-.11,.233,-.18]],palette.dark);
 const hairGeometry=finish(new THREE.IcosahedronGeometry(.027,1),palette.black);
 const hair=new THREE.InstancedMesh(hairGeometry,paint,19),matrix=new THREE.Matrix4();
 for(let i=0;i<19;i++){const a=i*2.4,r=.073*Math.sqrt((i+.5)/19);matrix.compose(new THREE.Vector3(Math.cos(a)*r,.285+Math.sin(a)*.025,-.11-Math.sin(a)*r*.45),new THREE.Quaternion().setFromEuler(new THREE.Euler(i*.7,i*.4,0)),new THREE.Vector3(1,.78,1));hair.setMatrixAt(i,matrix);}hair.castShadow=true;head.add(hair);
 for(const side of [-1,1]){const ear=mesh(head,new THREE.CylinderGeometry(.065,.065,.031,16),palette.black);ear.rotation.z=Math.PI/2;ear.position.set(side*.183,.155,-.012);const ring=mesh(head,new THREE.TorusGeometry(.055,.0035,4,18),side<0?palette.light:palette.red);ring.rotation.y=Math.PI/2;ring.position.set(side*.201,.155,-.012);}
 cord(head,[[-.182,.16,-.01],[-.16,.29,.005],[0,.345,.02],[.16,.29,.005],[.182,.16,-.01]],.015,palette.black);
 const pack=joint(torso,"backpack",0,.12,.155);pack.scale.setScalar(.92);
 cloth(pack,[[.015,.13,.06,0,.025],[.045,.18,.08,0,.045],[.22,.18,.105,0,.035],[.37,.155,.077,0,.015],[.43,.095,.045,0,0],[.447,.035,.018,0,-.005]],palette.black,.035);
 panel(pack,[[-.15,.085,.125],[.13,.08,.126],[.15,.27,.126],[-.13,.30,.13]],palette.dark);
 panel(pack,[[-.13,.30,.132],[.01,.35,.11],[.15,.27,.129],[.13,.20,.14]],"#35404c");
 cord(pack,[[-.13,.09,.133],[-.145,.24,.138],[-.07,.31,.136],[.10,.29,.137]],.006,"#525365");
 cord(pack,[[-.065,.41,-.005],[-.055,.49,.015],[.055,.49,.015],[.065,.41,-.005]],.011,palette.black);
 for(const side of [-1,1]){cord(torso,[[side*.12,.55,.13],[side*.175,.49,.04],[side*.168,.36,-.113],[side*.15,.12,-.08]],.026,palette.black);cord(torso,[[side*.14,.55,.14],[side*.180,.47,.035],[side*.175,.33,-.116]],.005,side===1?palette.red:palette.light);}
 const fingers:THREE.Group[]=[];
 function arm(side:number){
  const shoulder=joint(torso,side<0?"left-shoulder":"right-shoulder",side*.205,.49,0);
  const elbow=garment(shoulder,[[.035,.064,.076],[.005,.081,.078],[-.10,.075,.070,side*.004,.003],[-.24,.068,.063,-side*.003,-.003],[-.31,.074,.065],[-.38,.070,.062],[-.49,.060,.054,side*.003,.003],[-.57,.052,.046],[-.615,.043,.039]],.32,.085,palette.navy);
  elbow.name=side<0?"left-elbow":"right-elbow";
  cloth(elbow,[[-.272,.046,.042],[-.30,.043,.039]],palette.dark,.008);
  const wrist=joint(elbow,side<0?"left-wrist":"right-wrist",0,-.30,0),hand=joint(wrist,"hand-shape");hand.scale.set(.82,.90,.82);
  cloth(hand,[[.008,.036,.027],[-.04,.043,.028],[-.085,.038,.024]],palette.skin,.004);
  for(let i=0;i<4;i++){const finger=joint(hand,"finger",-.028+i*.019,-.078,-.002);cloth(finger,[[0,.011,.012],[-.025,.010,.012,0,-.002],[-.045,.009,.01,0,-.014]],palette.skin,.002);finger.rotation.x=-1;if(side<0)fingers.push(finger);}
  const thumb=cloth(hand,[[0,.014,.015],[-.035,.012,.012]],palette.skin,.002);thumb.position.set(-side*.042,-.035,-.006);thumb.rotation.z=side*.6;
  const grip=joint(wrist,side<0?"raised-hand":"suitcase-grip",0,-.070,-.018);
  return{shoulder,elbow,wrist,grip};
 }
 const leftArm=arm(-1),rightArm=arm(1),soles:THREE.Object3D[]=[];
 function leg(side:number){
  const hip=joint(body,side<0?"left-hip":"right-hip",side*.092,.025,0);
  const knee=garment(hip,[[.045,.094,.096],[-.025,.102,.105],[-.14,.096,.091,side*.004,.004],[-.28,.083,.080,-side*.003,.008],[-.40,.073,.074],[-.46,.080,.076],[-.57,.074,.071],[-.69,.063,.060,-side*.003,.003],[-.79,.063,.055],[-.86,.056,.051]],.43,.105,palette.navy);
  knee.name=side<0?"left-knee":"right-knee";
  const ankle=joint(knee,side<0?"left-ankle":"right-ankle",0,-.43,0);ankle.scale.set(.82,1,.83);
  cloth(ankle,[[-.14,.086,.165,0,-.062],[-.115,.103,.185,0,-.065],[-.07,.098,.177,0,-.065],[-.015,.079,.125,0,-.015],[.07,.067,.075,0,.025]],palette.cream,.005);
  cloth(ankle,[[-.145,.09,.166,0,-.065],[-.125,.102,.183,0,-.065],[-.105,.103,.185,0,-.065]],palette.sole,.001);
  for(let i=0;i<4;i++)cord(ankle,[[-.041,.005-i*.011,-.035-i*.021],[.042,.006-i*.011,-.04-i*.021]],.0035,"#918d7d");
  soles.push(joint(ankle,"sole",0,-.145,-.08));return{hip,knee,ankle};
 }
 const leftLeg=leg(-1),rightLeg=leg(1);
 const suitcase=joint(rightArm.grip,"suitcase-inertia");
 for(const side of [-1,1]){const rail=mesh(suitcase,new THREE.CylinderGeometry(.009,.009,.25,8),palette.metal);rail.position.set(side*.07,-.13,0);}
 const handle=cloth(suitcase,[[-.014,.09,.025],[.012,.09,.025]],palette.black,0);
 handle.position.z=.002;
 cloth(suitcase,[[-.25,.13,.07],[-.28,.173,.10],[-.68,.173,.105],[-.75,.13,.079]],palette.red,.008);
 for(const side of [-1,1]){cord(suitcase,[[side*.13,-.255,.075],[side*.17,-.30,.105],[side*.17,-.68,.11],[side*.13,-.747,.08]],.009,palette.black);for(const z of [-.072,.072]){const wheel=mesh(suitcase,new THREE.CylinderGeometry(.035,.035,.027,12),palette.black);wheel.rotation.z=Math.PI/2;wheel.position.set(side*.13,-.775,z);}}
 for(const x of [-.085,0,.085])cord(suitcase,[[x,-.285,.105],[x,-.36,.112],[x,-.65,.112],[x,-.72,.096]],.0055,palette.coral);
 cord(suitcase,[[0,-.25,-.08],[0,-.36,-.108],[0,-.68,-.108],[0,-.75,-.08]],.006,palette.black);
 // Merge static surface pieces within each joint: articulation is retained, draw calls stay bounded.
 function batch(group:THREE.Object3D){
  for(const child of [...group.children])if(!(child instanceof THREE.Mesh)&&child.children.length)batch(child);
  const pieces=group.children.filter((child):child is THREE.Mesh=>child instanceof THREE.Mesh&&!(child instanceof THREE.InstancedMesh)&&!(child instanceof THREE.SkinnedMesh)&&child.material===paint);
  if(pieces.length<2)return;
  const attributes={position:[] as number[],normal:[] as number[],color:[] as number[],uv:[] as number[]};
  for(const piece of pieces){piece.updateMatrix();const geometry=piece.geometry.clone().applyMatrix4(piece.matrix);for(const key of Object.keys(attributes) as (keyof typeof attributes)[]){const values=geometry.getAttribute(key);for(let i=0;i<values.array.length;i++)attributes[key].push(values.array[i]);}geometry.dispose();group.remove(piece);}
  const geometry=new THREE.BufferGeometry();for(const key of Object.keys(attributes) as (keyof typeof attributes)[])geometry.setAttribute(key,new THREE.Float32BufferAttribute(attributes[key],key==="uv"?2:3));geometries.add(geometry);
  const combined=new THREE.Mesh(geometry,paint);combined.castShadow=true;combined.receiveShadow=true;group.add(combined);
 }
 batch(root);
 const temp=new THREE.Vector3(),gripRotation=new THREE.Quaternion(),rootRotation=new THREE.Quaternion(),caseRotation=new THREE.Quaternion(),caseEuler=new THREE.Euler();
 function update(hero:number,time:number,grounded:number){
  if(dead)return;
  const actualHero=clamp(hero),h=Math.floor(actualHero*72)/72,poseTime=Math.floor(time*12)/12,ground=clamp(grounded);let index=0;while(index<POSES.length-2&&h>POSES[index+1].at)index++;
  const a=POSES[index],b=POSES[index+1],t=smooth(clamp((h-a.at)/(b.at-a.at))),pose={} as Pose;
  for(const key of Object.keys(a) as (keyof Pose)[])pose[key]=mix(a[key],b[key],t);
  body.position.set(0,1-pose.drop,0);body.rotation.set(pose.pitch,pose.twist,pose.bank);
  torso.rotation.x=-pose.pitch*.18;head.rotation.set(-pose.pitch*.24,Math.sin(h*Math.PI)*-.12,0);
  leftArm.shoulder.rotation.set(pose.leftShoulder,0,pose.leftSpread);leftArm.elbow.rotation.x=-pose.leftElbow;
  rightArm.shoulder.rotation.set(pose.rightShoulder,0,pose.rightSpread);rightArm.elbow.rotation.x=-pose.rightElbow;
  leftLeg.hip.rotation.set(pose.leftHip,0,-.035);leftLeg.knee.rotation.x=pose.leftKnee;leftLeg.ankle.rotation.x=pose.leftAnkle;
  rightLeg.hip.rotation.set(pose.rightHip,0,.035);rightLeg.knee.rotation.x=pose.rightKnee;rightLeg.ankle.rotation.x=pose.rightAnkle;
  const release=smooth(clamp((h-.44)/.12))*(1-smooth(clamp((h-.76)/.13)));
  fingers.forEach((finger,i)=>{finger.rotation.x=mix(-1.0,.12+i*.035,release);finger.rotation.z=(i-1.5)*.06*release;});
  body.updateMatrixWorld(true);rightArm.grip.getWorldQuaternion(gripRotation);root.getWorldQuaternion(rootRotation);
  caseRotation.setFromEuler(caseEuler.set(pose.casePitch*.55,Math.sin(h*Math.PI*2-.8)*.1*(1-ground),pose.caseRoll));
  suitcase.quaternion.copy(gripRotation.invert()).multiply(rootRotation).multiply(caseRotation);
  pack.rotation.x=.025*Math.sin(h*Math.PI*3-.7)*(1-ground);
  body.position.y+=.002*Math.sin(poseTime*2.3)*ground;
  // Solve foot contact in root-local space so the parent can freely place/rotate the actor.
  body.updateMatrixWorld(true);const inverse=new THREE.Matrix4().copy(root.matrixWorld).invert();let lowest=Infinity;
  for(const sole of soles){sole.getWorldPosition(temp).applyMatrix4(inverse);lowest=Math.min(lowest,temp.y);}
  body.position.y-=lowest*ground;
  root.userData.hero=actualHero;root.userData.poseFrame=Math.floor(actualHero*72);root.userData.pose=h<.45?"swing":h<.78?"release":h<.98?"landing":"standing";
 }
 update(1,0,1);
 // Bake projection coordinates once in the standing bind pose. They then travel with each joint.
 root.updateMatrixWorld(true);for(const skeleton of skeletons)skeleton.update();
 const bindInverse=new THREE.Matrix4().copy(root.matrixWorld).invert(),bindMatrix=new THREE.Matrix4(),bindNormal=new THREE.Matrix3(),normalPoint=new THREE.Vector3();
 root.traverse(object=>{
  if(!(object instanceof THREE.Mesh))return;
  const position=object.geometry.getAttribute("position"),normal=object.geometry.getAttribute("normal"),projection=new Float32Array(position.count*3);
  let cloth=!(object instanceof THREE.InstancedMesh),backpack=false,region=0;
  for(let node:THREE.Object3D|null=object;node&&node!==root;node=node.parent){
   if(/ankle|wrist|finger|suitcase|grip/.test(node.name))cloth=false;
   if(node.name==="backpack"){backpack=true;region=5;}
   else if(node.name==="hood-and-head"&&region===0)region=2;
   else if(/shoulder/.test(node.name)&&region===0)region=3;
   else if(/hip/.test(node.name)&&region===0)region=4;
   else if(node.name==="torso"&&region===0)region=1;
  }
  bindMatrix.multiplyMatrices(bindInverse,object.matrixWorld);bindNormal.getNormalMatrix(bindMatrix);
  for(let i=0;i<position.count;i++){
   temp.fromBufferAttribute(position,i);if(object instanceof THREE.SkinnedMesh)object.applyBoneTransform(i,temp);temp.applyMatrix4(bindMatrix);
   normalPoint.fromBufferAttribute(normal,i).applyMatrix3(bindNormal).normalize();
   projection[i*3]=.39+temp.x/(2.05*683/1024)+(backpack?.095:0);
   projection[i*3+1]=1-(.968-temp.y/2.05)+(backpack?.035:0);
   projection[i*3+2]=cloth?smooth(clamp((normalPoint.z-.20)/.50)):0;
  }
  object.geometry.setAttribute("paintProjection",new THREE.BufferAttribute(projection,3));
  object.geometry.setAttribute("clothRegion",new THREE.BufferAttribute(new Float32Array(position.count).fill(cloth?region:0),1));
 });
 return{root,raisedHand:leftArm.grip,update,dispose(){if(dead)return;dead=true;originalPaint.value?.dispose();hair.dispose();for(const skeleton of skeletons)skeleton.dispose();for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();root.clear();}};
}
