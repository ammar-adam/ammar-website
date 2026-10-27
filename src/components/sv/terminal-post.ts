import type { Material } from "three";

/** Keep readable signs and the hero out of off-focus colour registration.
 * The existing colour target carries the mask in alpha; no extra render pass.
 */
export function protectFilmRegistration(material: Material) {
 if (material.transparent || material.userData.filmRegistrationProtected) return;
 material.userData.filmRegistrationProtected = true;
 const compile = material.onBeforeCompile;
 const key = material.customProgramCacheKey();
 material.onBeforeCompile = (shader, renderer) => {
  compile.call(material, shader, renderer);
  shader.fragmentShader = shader.fragmentShader.replace("#include <dithering_fragment>", "#include <dithering_fragment>\ngl_FragColor.a = 0.0;");
 };
 material.customProgramCacheKey = () => `${key}-registration-protected`;
 material.needsUpdate = true;
}

export const TERMINAL_POST_VERTEX = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;

// One colour/depth composite. View normals come from the same depth buffer, so
// ink, print and grading do not need a second scene render on a phone.
export const TERMINAL_POST_FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uScene,uDepth;
uniform vec2 uResolution;
uniform mat4 uProjectionInverse;
uniform float uIntensity,uMotion,uTime;
float filmLuma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
vec3 filmView(vec2 uv,float depth){
 vec4 projected=uProjectionInverse*vec4(uv*2.-1.,depth*2.-1.,1.);
 if(abs(projected.w)>.00001)return projected.xyz/projected.w;
 // Old offline proof harnesses can omit the matrix; the live renderer supplies
 // the exact current projection, including the existing animated field of view.
 float z=(.08*650.)/(650.-depth*(650.-.08));
 return vec3((uv*2.-1.)*vec2(uResolution.x/uResolution.y,1.)*z*.6128,-z);
}
vec3 filmNormal(vec3 a,vec3 b){return normalize(cross(a,b)+vec3(0.,0.,.0000001));}
void main(){
 vec2 px=1.0/uResolution;
 vec2 pixel=vUv*uResolution;
 vec2 dx=vec2(px.x*1.5,0.),dy=vec2(0.,px.y*1.5);
 float d=texture2D(uDepth,vUv).r;
 float dl=texture2D(uDepth,vUv-dx).r,dr=texture2D(uDepth,vUv+dx).r;
 float du=texture2D(uDepth,vUv+dy).r,dd=texture2D(uDepth,vUv-dy).r;
 vec3 center=filmView(vUv,d);
 vec3 vpLeft=filmView(vUv-dx,dl),vpRight=filmView(vUv+dx,dr);
 vec3 vpUp=filmView(vUv+dy,du),vpDown=filmView(vUv-dy,dd);
 float distanceToCamera=max(.08,-center.z);
 float nearInk=1.-smoothstep(12.,38.,distanceToCamera);
 // Four local triangles agree on a plane and separate at a modelled crease.
 // A depth discontinuity supplies the silhouette; both use the same 1.5px pen.
 vec3 n0=filmNormal(vpRight-center,vpUp-center);
 vec3 n1=filmNormal(vpUp-center,vpLeft-center);
 vec3 n2=filmNormal(vpLeft-center,vpDown-center);
 vec3 n3=filmNormal(vpDown-center,vpRight-center);
 float crease=max(max(1.-dot(n0,n1),1.-dot(n1,n2)),max(1.-dot(n2,n3),1.-dot(n3,n0)));
 float depthEdge=max(abs(vpLeft.z-vpRight.z),abs(vpUp.z-vpDown.z))/distanceToCamera;
 float contour=max(smoothstep(.035,.16,depthEdge),smoothstep(.20,.72,crease)*.72)*nearInk;
 vec4 original=texture2D(uScene,vUv);
 vec3 c=original.rgb;
 float L=filmLuma(c);
 vec3 left=texture2D(uScene,vUv-dx).rgb,right=texture2D(uScene,vUv+dx).rgb;
 vec3 above=texture2D(uScene,vUv+dy).rgb,below=texture2D(uScene,vUv-dy).rgb;
 float gradient=length(vec2(filmLuma(right)-filmLuma(left),filmLuma(above)-filmLuma(below)));
 vec3 shadowInk=vec3(.004,.005,.014);
 c=mix(c,shadowInk,clamp(contour*1.22*uIntensity,0.,.78));

 // One 45-degree screen, 4.5px at a 1080px image height. It lives only inside
 // shadow transitions: no dots on a flat wall, solid black or bright lettering.
 float shadow=1.-smoothstep(.03,.45,L);
 float transition=smoothstep(.03,.085,L)*(1.-smoothstep(.31,.45,L));
 transition*=smoothstep(.004,.022,gradient)*(1.-smoothstep(.12,.26,gradient));
 transition*=1.-smoothstep(.12,.35,depthEdge);
 float printPitch=max(3.,4.5*uResolution.y/1080.);
 vec2 printGrid=mat2(.7071068,-.7071068,.7071068,.7071068)*pixel/printPitch;
 float radius=mix(.11,.34,shadow);
 float dotAA=max(fwidth(length(fract(printGrid)-.5)),.055);
 float dotInk=1.-smoothstep(radius-dotAA*.5,radius+dotAA*.5,length(fract(printGrid)-.5));
 vec3 printHue=c*vec3(.51,.53,.61);
 float printDepth=mix(1.,.15,smoothstep(8.,45.,distanceToCamera));
 c=mix(c,printHue,dotInk*transition*printDepth*.68*uIntensity);

 // The colour target's alpha is a registration mask. Characters and signage
 // write zero there; their ink remains intact but their R/B never separate.
 float distant=smoothstep(24.,56.,distanceToCamera);
 float markedSurface=smoothstep(.75,.98,original.a);
 float luminousProtection=1.-smoothstep(.56,.85,max(c.r,max(c.g,c.b)));
 float offFocus=distant*markedSurface*luminousProtection*smoothstep(.035,.15,gradient);
 vec2 radial=normalize(vUv-vec2(.50,.52)+.0001);
 vec2 offset=radial*px*mix(2.,4.,clamp(uMotion,0.,1.));
 vec4 redSample=texture2D(uScene,vUv+offset),blueSample=texture2D(uScene,vUv-offset);
 offFocus*=smoothstep(.75,.98,min(redSample.a,blueSample.a));
 vec3 separated=vec3(redSample.r,c.g,blueSample.b);
 c=mix(c,separated,offFocus*.72*uIntensity);

 // The skyline remains untouched. Warm light stays warm; no blanket cyan grade.
 float interior=1.-smoothstep(60.,115.,distanceToCamera);
 vec3 grade=mix(vec3(.985,.99,1.025),vec3(1.025,1.008,.98),smoothstep(.09,.55,L));
 c*=mix(vec3(1.),grade,interior*uIntensity);
 float haze=smoothstep(22.,95.,distanceToCamera)*interior*.055*uIntensity;
 c=mix(c,vec3(.55,.36,.19),haze);
 c*=1.-dot(vUv-.5,vUv-.5)*.055;
 gl_FragColor=vec4(max(c,vec3(0.)),1.);
 #include <colorspace_fragment>
}`;
