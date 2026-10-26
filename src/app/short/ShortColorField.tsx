"use client";

import { useEffect, useRef } from "react";

const vertex = `#version 300 es
in vec2 a_position;
void main(){gl_Position=vec4(a_position,0.,1.);}`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

vec3 pigment(float t){
  vec3 ochre=vec3(.82,.67,.25),jade=vec3(.19,.57,.48);
  vec3 violet=vec3(.55,.47,.79),peach=vec3(.93,.56,.37);
  float phase=mod(t,4.);
  if(phase<1.)return mix(ochre,jade,smoothstep(0.,1.,phase));
  if(phase<2.)return mix(jade,violet,smoothstep(1.,2.,phase));
  if(phase<3.)return mix(violet,peach,smoothstep(2.,3.,phase));
  return mix(peach,ochre,smoothstep(3.,4.,phase));
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  float aspect=u_resolution.x/u_resolution.y;
  vec2 p=(uv-.5)*vec2(aspect,1.);
  float t=u_time*.065;
  vec3 paper=vec3(.997,.996,.991),color=paper;
  // Offset folds of transmitted light. The narrow caustics move with the broad folds.
  for(int i=0;i<3;i++){
    float n=float(i),side=i==1?-1.:1.;
    vec2 q=p-vec2(side*aspect*.47,.06+(n-1.)*.19);
    q.x+=.055*sin(q.y*5.+t+n*1.4)+.024*sin(q.y*12.-t*.45+n);
    q.y+=.032*sin(q.x*8.+t*.7+n);
    float radius=length(q*vec2(1.8,.84));
    float angle=atan(q.y,q.x);
    float fold=radius-(.30+.065*sin(angle*2.+t*.5+n));
    float body=exp(-pow(fold/.105,2.));
    float filament=exp(-pow((fold+.028)/.012,2.));
    float fringe=.5+.5*sin(fold*95.+angle*1.6+t*.25);
    vec3 dye=pigment(n*.82+q.y*2.4+fringe*.5+t*.12+3.);
    float edge=smoothstep(.17,.47,abs(uv.x-.5));
    float strength=(body*.49+filament*.20)*edge;
    color=mix(color,dye,strength);
    color=mix(color,paper,filament*.22*edge);
  }
  float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;
  color+=grain*.008;
  outColor=vec4(color,1.);
}`;

export function ShortColorField({ paused }: { paused: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    const surface = canvas.current;
    const gl = surface?.getContext("webgl2", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
    if (!surface || !gl) return;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
      return shader;
    };
    const vert = compile(gl.VERTEX_SHADER, vertex), frag = compile(gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram();
    if (!vert || !frag || !program) { if (vert) gl.deleteShader(vert); if (frag) gl.deleteShader(frag); if (program) gl.deleteProgram(program); return; }
    gl.attachShader(program, vert); gl.attachShader(program, frag); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); gl.deleteShader(vert); gl.deleteShader(frag); return; }
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "u_resolution"), time = gl.getUniformLocation(program, "u_time");
    let frame = 0, last = 0, dead = false;
    const draw = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.25) * .7;
      const width = Math.max(1, Math.round(surface.clientWidth * scale)), height = Math.max(1, Math.round(surface.clientHeight * scale));
      if (surface.width !== width || surface.height !== height) { surface.width = width; surface.height = height; }
      gl.viewport(0, 0, width, height); gl.uniform2f(resolution, width, height); gl.uniform1f(time, elapsed.current); gl.drawArrays(gl.TRIANGLES, 0, 6);
      surface.dataset.ready = "true";
    };
    const tick = (now: number) => {
      if (dead || paused || document.hidden) return;
      if (!last) last = now;
      if (now - last >= 1000 / 24) { elapsed.current += Math.min((now - last) / 1000, .1); last = now; draw(); }
      frame = requestAnimationFrame(tick);
    };
    const visibility = () => { cancelAnimationFrame(frame); last = 0; if (!paused && !document.hidden) frame = requestAnimationFrame(tick); };
    const resize = new ResizeObserver(draw); resize.observe(surface);
    document.addEventListener("visibilitychange", visibility);
    draw(); visibility();
    return () => { dead = true; cancelAnimationFrame(frame); resize.disconnect(); document.removeEventListener("visibilitychange", visibility); gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vert); gl.deleteShader(frag); };
  }, [paused]);

  return <canvas ref={canvas} className="short-color-field" aria-hidden="true" data-motion={paused ? "still" : "moving"} />;
}
