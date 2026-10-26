export const TERMINAL_POST_VERTEX = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;

// Sharp illustrative compositing: broken ink, selective print transitions and
// off-focus registration. Fast motion adds drawn traces, never averaged blur.
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
 vec2 pixel=vUv*uResolution;
 float d=texture2D(uDepth,vUv).r;
 float distant=smoothstep(.9942,.9982,d);
 vec3 original=texture2D(uScene,vUv).rgb;
 vec3 c=original;
 float L=filmLuma(original);
 vec3 left=texture2D(uScene,vUv-vec2(px.x*1.25,0.)).rgb;
 vec3 right=texture2D(uScene,vUv+vec2(px.x*1.25,0.)).rgb;
 vec3 above=texture2D(uScene,vUv+vec2(0.,px.y*1.25)).rgb;
 vec3 below=texture2D(uScene,vUv-vec2(0.,px.y*1.25)).rgb;
 vec2 lightGradient=vec2(filmLuma(right)-filmLuma(left),filmLuma(above)-filmLuma(below));
 float gradient=length(lightGradient);
 float dl=texture2D(uDepth,vUv-vec2(px.x*1.25,0.)).r;
 float dr=texture2D(uDepth,vUv+vec2(px.x*1.25,0.)).r;
 float du=texture2D(uDepth,vUv+vec2(0.,px.y*1.25)).r;
 float dd=texture2D(uDepth,vUv-vec2(0.,px.y*1.25)).r;
 float depthEdge=length(vec2(dl-dr,du-dd))/max(1.-d,.0002);
 // Vary contour pressure and leave gaps; avoid a uniform vector-like outline.
 float strokePhase=(pixel.x*.37+pixel.y*.74+sin(pixel.y*.061)*3.)/31.;
 float pressure=.38+.62*smoothstep(.12,.34,fract(strokePhase));
 float contour=smoothstep(.13,.38,gradient)*.11+smoothstep(.028,.16,depthEdge)*.53;
 c=mix(c,vec3(.016,.024,.057),min(.63,contour)*pressure*uIntensity);

 // Dots are a transition medium at a shaded edge, not surface dirt.
 float shadow=1.-smoothstep(.045,.32,L);
 float transition=smoothstep(.035,.10,L)*(1.-smoothstep(.25,.40,L));
 transition*=smoothstep(.008,.035,gradient)*(1.-smoothstep(.20,.38,gradient));
 vec2 printGrid=mat2(.819,-.574,.574,.819)*pixel/5.4;
 float radius=mix(.10,.29,shadow);
 float dotInk=1.-smoothstep(radius,radius+.065,length(fract(printGrid)-.5));
 c=mix(c,vec3(.025,.039,.087),dotInk*transition*.43*uIntensity);

 // Crisp cyan/red separation substitutes for lens blur outside the focal area.
 float offFocus=distant*smoothstep(.055,.25,gradient);
 vec2 radial=normalize(vUv-vec2(.50,.52)+.0001);
 vec2 offset=radial*px*(1.45+uMotion*5.5);
 vec3 separated=vec3(texture2D(uScene,vUv+offset).r,c.g,texture2D(uScene,vUv-offset).b);
 c=mix(c,separated,offFocus*.70*uIntensity);

 // Sparse, sharp, broken speed strokes confined to the outer field of motion.
 vec2 centered=(vUv-vec2(.48,.54))*vec2(uResolution.x/uResolution.y,1.);
 float angle=atan(centered.y,centered.x);
 float angular=angle*47.;
 float rayId=floor(angular);
 float distanceToRay=abs(fract(angular)-.5);
 float lineWidth=max(fwidth(angular),.008);
 float ray=1.-smoothstep(.018,.018+lineWidth,distanceToRay);
 float radiusFromFocus=length(centered);
 float choice=filmHash(vec2(rayId,17.));
 float start=.35+choice*.20;
 float trace=ray*step(.88,choice)*smoothstep(start,start+.025,radiusFromFocus)*(1.-smoothstep(start+.18,start+.22,radiusFromFocus));
 c=mix(c,vec3(.68,.82,.85),trace*uMotion*distant*.20*uIntensity);
 c*=1.-dot(vUv-.5,vUv-.5)*.10;
 gl_FragColor=vec4(max(c,vec3(0.)),1.);
 #include <colorspace_fragment>
}`;
