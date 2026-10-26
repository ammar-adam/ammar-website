export const TERMINAL_POST_VERTEX = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;

// Printing artifacts live in the shadows and outside the focal plane. During
// the two fast swing beats, only the distant environment receives a short smear.
export const TERMINAL_POST_FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uScene,uDepth;
uniform vec2 uResolution;
uniform float uIntensity,uMotion,uTime;
float luma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 vec2 px=1.0/uResolution;
 float d=texture2D(uDepth,vUv).r;
 float background=smoothstep(.990,.998,d);
 vec2 drift=(vUv-vec2(.48,.54))*.011*uMotion*background;
 vec3 original=texture2D(uScene,vUv).rgb;
 vec3 smear=texture2D(uScene,vUv+drift).rgb*.5+texture2D(uScene,vUv+drift*.5).rgb*.3+texture2D(uScene,vUv-drift*.3).rgb*.2;
 vec3 c=mix(original,smear,.42*uMotion*background);
 float L=luma(original);
 float dl=texture2D(uDepth,vUv-vec2(px.x,0.)).r,dr=texture2D(uDepth,vUv+vec2(px.x,0.)).r;
 vec3 left=texture2D(uScene,vUv-vec2(px.x,0.)).rgb,right=texture2D(uScene,vUv+vec2(px.x,0.)).rgb;
 float edge=length(right-left);
 float ink=smoothstep(.14,.48,edge)*.29+smoothstep(.0003,.004,abs(dl-dr))*.35;
 c=mix(c,vec3(.025,.04,.09),min(.48,ink)*uIntensity);
 float shadow=1.-smoothstep(.08,.42,L);
 c=mix(c,c*vec3(1.22,.72,1.15),shadow*.26*uIntensity);
 vec2 grid=mat2(.707,-.707,.707,.707)*(vUv*uResolution)/4.8;
 float dotInk=1.-smoothstep(.19,.31,length(fract(grid)-.5));
 float mask=smoothstep(.09,.19,L)*(1.-smoothstep(.29,.42,L));
 mask*=step(.35,hash(floor(vUv*uResolution/31.)));
 c=mix(c,vec3(.035,.07,.14),dotInk*mask*.25*uIntensity);
 float split=background*smoothstep(.15,.45,edge);
 vec2 off=normalize(vUv-vec2(.5)+.0001)*px*(1.2+uMotion*4.);
 c.r+=(texture2D(uScene,vUv+off).r-c.r)*split*.4;
 c.b+=(texture2D(uScene,vUv-off).b-c.b)*split*.38;
 float grain=hash(floor(vUv*uResolution)+floor(uTime*12.))-.5;
 c+=grain*.003*uIntensity;
 c*=1.-dot(vUv-.5,vUv-.5)*.19;
 gl_FragColor=vec4(c,1.);
 #include <colorspace_fragment>
}`;
