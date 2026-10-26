export const TERMINAL_POST_VERTEX = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;

// Print texture follows shaded transitions. Distant contours receive the
// restrained cyan/red registration; lettering and the focal plane stay clean.
export const TERMINAL_POST_FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uScene,uDepth;
uniform vec2 uResolution;
uniform float uIntensity,uMotion,uTime;
float filmLuma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
float filmHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 vec2 px=1.0/uResolution;
 float d=texture2D(uDepth,vUv).r;
 float distant=smoothstep(.9942,.9982,d);
 vec3 original=texture2D(uScene,vUv).rgb;
 float L=filmLuma(original);
 vec2 drift=(vUv-vec2(.48,.54))*.010*uMotion*distant;
 vec3 smear=texture2D(uScene,vUv+drift).rgb*.5+texture2D(uScene,vUv+drift*.5).rgb*.3+texture2D(uScene,vUv-drift*.3).rgb*.2;
 vec3 c=mix(original,smear,.4*uMotion*distant);
 vec3 left=texture2D(uScene,vUv-vec2(px.x,0.)).rgb;
 vec3 right=texture2D(uScene,vUv+vec2(px.x,0.)).rgb;
 vec3 above=texture2D(uScene,vUv+vec2(0.,px.y)).rgb;
 vec3 below=texture2D(uScene,vUv-vec2(0.,px.y)).rgb;
 float gradient=length(vec2(filmLuma(right)-filmLuma(left),filmLuma(above)-filmLuma(below)));
 float dl=texture2D(uDepth,vUv-vec2(px.x,0.)).r;
 float dr=texture2D(uDepth,vUv+vec2(px.x,0.)).r;
 float depthEdge=abs(dl-dr)/max(1.-d,.0002);
 float contour=smoothstep(.11,.35,gradient)*.16+smoothstep(.035,.17,depthEdge)*.26;
 c=mix(c,vec3(.018,.029,.063),min(.35,contour)*uIntensity);
 float shadow=1.-smoothstep(.045,.32,L);
 float lit=smoothstep(.25,.84,L);
 c*=mix(vec3(1.),vec3(.87,.83,1.19),shadow*.64*uIntensity);
 c*=mix(vec3(1.),vec3(1.045,1.015,.94),lit*.48*uIntensity);
 // Dots occupy a shaped shadow transition, never a broad flat wall.
 float transition=smoothstep(.035,.10,L)*(1.-smoothstep(.25,.40,L));
 transition*=smoothstep(.006,.028,gradient)*(1.-smoothstep(.18,.35,gradient));
 vec2 printGrid=mat2(.819,-.574,.574,.819)*(vUv*uResolution)/5.2;
 float radius=mix(.10,.28,shadow);
 float dotInk=1.-smoothstep(radius,radius+.075,length(fract(printGrid)-.5));
 c=mix(c,vec3(.025,.043,.09),dotInk*transition*.34*uIntensity);
 float offFocus=distant*smoothstep(.07,.28,gradient);
 vec2 radial=normalize(vUv-vec2(.50,.52)+.0001);
 vec2 offset=radial*px*(1.1+uMotion*3.5);
 vec3 separated=vec3(texture2D(uScene,vUv+offset).r,c.g,texture2D(uScene,vUv-offset).b);
 c=mix(c,separated,offFocus*.46*uIntensity);
 // Static pigment grain avoids flickering in quiet rooms.
 c+=(filmHash(floor(vUv*uResolution))-.5)*.0016*uIntensity;
 c*=1.-dot(vUv-.5,vUv-.5)*.12;
 gl_FragColor=vec4(max(c,vec3(0.)),1.);
 #include <colorspace_fragment>
}`;
