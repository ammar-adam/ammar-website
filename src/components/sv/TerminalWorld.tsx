"use client";

import {useEffect,useRef} from "react";
import "./terminal-look.css";
import type {MotionValue} from "framer-motion";
import * as THREE from "three";
import {createFilmTerminal} from "./film-terminal";
export {prepareTerminalSetGeometry} from "./film-set-assets";
import {createRoomVisibility} from "./room-visibility";
import {createTerminalProgramWarmup} from "./terminal-program-warmup";
import {TERMINAL_POST_FRAGMENT,TERMINAL_POST_VERTEX} from "./terminal-post";

type Props={active?:boolean;t:MotionValue<number>;reduced:boolean;experienceIndex:number;projectIndex:number;departure:MotionValue<number>;onReady?:()=>void;allowLook?:boolean;onLook?:()=>void};

export function TerminalWorld({active=true,t,reduced,experienceIndex,projectIndex,departure,onReady,allowLook=false,onLook}:Props){
 const root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const view=useRef({active,reduced,experienceIndex,projectIndex,onReady,allowLook,onLook}),scheduleRef=useRef<()=>void>(()=>{});
 const motionValues=useRef({t,departure});
 const resetLook=useRef<()=>void>(()=>{});
 useEffect(()=>{view.current={active,reduced,experienceIndex,projectIndex,onReady,allowLook,onLook};scheduleRef.current();},[active,reduced,experienceIndex,projectIndex,onReady,allowLook,onLook]);
 useEffect(()=>{if(!allowLook)resetLook.current();},[allowLook]);
 // Motion preference can replace t; the renderer must keep its live canvas/context.
 useEffect(()=>{
  motionValues.current={t,departure};
  const schedule=()=>scheduleRef.current();
  const offT=t.on("change",schedule),offDeparture=departure.on("change",schedule);
  schedule();
  return()=>{offT();offDeparture();};
 },[t,departure]);
 useEffect(()=>{
  const element=root.current,surface=canvas.current;if(!element||!surface)return;
  let dead=false,lost=false,frame=0,ready=false,dirty=true,renderer:THREE.WebGLRenderer;
  let compiled=false,compiling=false,compileFailed=false,compileGeneration=0;
  // Pointer capability survives rotation, unlike a portrait-only width check.
  const touchBudget=window.matchMedia("(pointer: coarse)").matches;
  const frameInterval=touchBudget?1000/30:0;
  try{renderer=new THREE.WebGLRenderer({canvas:surface,antialias:false,alpha:false,powerPreference:"high-performance"});}
  catch{element.dataset.fallback="1";view.current.onReady?.();return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,touchBudget?1.25:1.35));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  const schedule=()=>{dirty=true;if(view.current.active&&!dead&&!lost&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);};scheduleRef.current=schedule;
  const world=createFilmTerminal(schedule,{shadowMapSize:touchBudget?1024:window.innerWidth<=720?1536:2048});
  const roomVisibility=createRoomVisibility(world.scene);
  const target=new THREE.WebGLRenderTarget(1,1,{depthBuffer:true});target.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
  target.samples=touchBudget?2:4;
  const postScene=new THREE.Scene(),postCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const postMaterial=new THREE.ShaderMaterial({vertexShader:TERMINAL_POST_VERTEX,fragmentShader:TERMINAL_POST_FRAGMENT,uniforms:{uScene:{value:target.texture},uDepth:{value:target.depthTexture},uResolution:{value:new THREE.Vector2(1,1)},uProjectionInverse:{value:new THREE.Matrix4()},uIntensity:{value:.45},uMotion:{value:0},uTime:{value:0}},depthTest:false,depthWrite:false});
  const quadGeometry=new THREE.PlaneGeometry(2,2);postScene.add(new THREE.Mesh(quadGeometry,postMaterial));
  const programWarmup=createTerminalProgramWarmup(renderer,target,world.scene,world.camera,schedule);
  let backgroundQueued=false;
  let width=0,height=0,lastAmbient=0,lastDraw=-Infinity,lastProgress=-1;const started=performance.now();
  const look={yaw:0,pitch:0,pointer:-1,x:0,y:0,startX:0,startY:0,dragged:false};
  const endLook=()=>{const pointer=look.pointer;look.pointer=-1;look.dragged=false;if(pointer!==-1&&surface.hasPointerCapture(pointer))surface.releasePointerCapture(pointer);surface.style.cursor=view.current.allowLook?"grab":"default";};
  const reset=()=>{endLook();look.yaw=0;look.pitch=0;element.dataset.looking="false";schedule();};
  resetLook.current=reset;
  const down=(event:PointerEvent)=>{
   // A second finger belongs to browser zoom, not a replacement camera gesture.
   if(event.pointerType==="touch"&&!event.isPrimary){endLook();return;}
   if(!view.current.active||!view.current.allowLook||event.button!==0||look.pointer!==-1)return;
   look.dragged=false;look.pointer=event.pointerId;look.startX=look.x=event.clientX;look.startY=look.y=event.clientY;
   if(event.pointerType!=="touch"){surface.setPointerCapture(event.pointerId);surface.style.cursor="grabbing";}
  };
  const move=(event:PointerEvent)=>{if(look.pointer!==event.pointerId||!view.current.active||!view.current.allowLook)return;
   if(!look.dragged){
    const dx=Math.abs(event.clientX-look.startX),dy=Math.abs(event.clientY-look.startY);
    if(event.pointerType==="touch"){
     if(Math.max(dx,dy)<8)return;
     // Keep ordinary vertical/diagonal swipes entirely native. Only an
     // unmistakably horizontal gesture claims the concourse look control.
     if(dy>=dx){endLook();return;}
     if(dx<dy*1.25)return;
     surface.setPointerCapture(event.pointerId);surface.style.cursor="grabbing";
    }else if(dx+dy<=2)return;
    look.dragged=true;view.current.onLook?.();
   }
   const speed=Math.PI*2/(Math.max(element.clientWidth,600)*.85);
   look.yaw-=(event.clientX-look.x)*speed;
   if(event.pointerType!=="touch")look.pitch=THREE.MathUtils.clamp(look.pitch-(event.clientY-look.y)*.004,-1.05,1.05);
   look.x=event.clientX;look.y=event.clientY;look.yaw=THREE.MathUtils.euclideanModulo(look.yaw+Math.PI,Math.PI*2)-Math.PI; schedule();
  };
  const up=(event:PointerEvent)=>{if(look.pointer===event.pointerId)endLook();};
  const keys=(event:KeyboardEvent)=>{if(!view.current.active||!view.current.allowLook||event.defaultPrevented)return;if(event.key==="Escape"){reset();return;}if(event.target!==surface)return;
   const step=.14;if(event.key==="ArrowLeft")look.yaw+=step;else if(event.key==="ArrowRight")look.yaw-=step;else return;event.preventDefault();schedule();
  };
  surface.addEventListener("pointerdown",down);surface.addEventListener("pointermove",move);surface.addEventListener("pointerup",up);surface.addEventListener("pointercancel",up);surface.addEventListener("lostpointercapture",up);surface.addEventListener("dblclick",reset);window.addEventListener("keydown",keys);

  function warmPrograms(){
   compiling=true;
   const generation=++compileGeneration;
   // Three's compile() visits invisible rooms too. This non-owning traversal
   // compiles only the culled scene, using its real lights, fog and environment.
   // No meshes are cloned or reparented and the last film frame stays visible.
   const visibleScene=new THREE.Object3D();
   visibleScene.traverse=visitor=>world.scene.traverseVisible(visitor);
   const failed=(error:unknown)=>{
    if(dead||lost||generation!==compileGeneration)return;
    compiling=false;compileFailed=true;element!.dataset.fallback="1";
    console.warn("Terminal shader warmup failed; keeping the film frame.",error);
    view.current.onReady?.();
   };
   try{
    renderer.setRenderTarget(target);
    const scenePrograms=renderer.compileAsync(visibleScene,world.camera,world.scene);
    renderer.setRenderTarget(null);
    const postPrograms=renderer.compileAsync(postScene,postCamera);
    void Promise.all([scenePrograms,postPrograms]).then(()=>{
     if(dead||lost||generation!==compileGeneration)return;
     compiling=false;compiled=true;
     // One snapshot of the existing future rooms; no full-scene traversal in draw.
     if(!backgroundQueued){backgroundQueued=true;programWarmup.enqueue(world.scene,false);}
     programWarmup.resume();schedule();
    }).catch(failed);
   }catch(error){renderer.setRenderTarget(null);failed(error);}
  }

  function draw(now=performance.now()){frame=0;if(dead||lost||document.hidden||compiling||compileFailed||!view.current.active)return;
   // Scroll can invalidate on every 120Hz touch event. Coalesce those updates
   // into one bounded 3D frame while DOM captions and native scrolling stay live.
   if(now-lastDraw<frameInterval-.5){frame=requestAnimationFrame(draw);return;}
   dirty=false;lastDraw=now;
   const w=Math.max(1,element!.clientWidth),h=Math.max(1,element!.clientHeight);
   if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);const size=renderer.getDrawingBufferSize(new THREE.Vector2());target.setSize(size.x,size.y);postMaterial.uniforms.uResolution.value.copy(size);}
   roomVisibility.restore();
   const state=view.current;world.update({t:motionValues.current.t.get(),departure:motionValues.current.departure.get(),reduced:state.reduced,experienceIndex:state.experienceIndex,projectIndex:state.projectIndex,aspect:w/h,time:(performance.now()-started)/1000,lookYaw:look.yaw,lookPitch:look.pitch});

   roomVisibility.apply(motionValues.current.t.get(),Math.abs(look.yaw)>.12);
   const progress=motionValues.current.t.get(),moving=Math.abs(progress-lastProgress)>.000015;
   const rush=Math.exp(-Math.pow((progress-.055)/.027,2))*.75+Math.exp(-Math.pow((progress-.145)/.026,2))*.9;
   postMaterial.uniforms.uMotion.value=state.reduced||!moving||progress>=.24?0:Math.min(1,rush);postMaterial.uniforms.uTime.value=state.reduced?0:(performance.now()-started)/1000;lastProgress=progress;
   postMaterial.uniforms.uProjectionInverse.value.copy(world.camera.projectionMatrixInverse);
   for(const root of world.takePendingProgramRoots())programWarmup.enqueue(root);
   if(!compiled){if(world.scene.userData.ready)warmPrograms();return;}
   programWarmup.resume();element!.dataset.warming=String(programWarmup.pendingCount);
   renderer.setRenderTarget(target);renderer.render(world.scene,world.camera);const calls=renderer.info.render.calls;renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
   element!.dataset.fallback=world.scene.userData.ready?"0":"1";element!.dataset.stage=world.scene.userData.stage;element!.dataset.progress=motionValues.current.t.get().toFixed(4);element!.dataset.camera=world.camera.position.toArray().map(n=>n.toFixed(2)).join(",");element!.dataset.drawCalls=String(calls);surface!.style.opacity=world.scene.userData.ready?"1":"0";
   element!.dataset.looking=String(Math.abs(look.yaw)+Math.abs(look.pitch)>.03);element!.dataset.lookYaw=look.yaw.toFixed(3);element!.dataset.lookPitch=look.pitch.toFixed(3);
   if(!ready&&world.scene.userData.ready){ready=true;state.onReady?.();}
   if(state.active&&!state.reduced)frame=requestAnimationFrame(ambient);
  }
  function ambient(now:number){frame=0;if(dead||lost||document.hidden||!view.current.active)return;if(dirty){lastAmbient=now;draw(now);return;}if(view.current.reduced)return;if(now-lastAmbient>=1000/30){lastAmbient=now;draw(now);}else frame=requestAnimationFrame(ambient);}
  const lose=(event:Event)=>{event.preventDefault();lost=true;compileGeneration++;compiled=false;compiling=false;compileFailed=false;backgroundQueued=false;programWarmup.pause();cancelAnimationFrame(frame);frame=0;element.dataset.fallback="1";surface.style.opacity="0";};
  const restore=()=>{lost=false;schedule();};
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();};
  surface.addEventListener("webglcontextlost",lose);surface.addEventListener("webglcontextrestored",restore);document.addEventListener("visibilitychange",visibility);
  const resize=new ResizeObserver(schedule);resize.observe(element);schedule();
  return()=>{dead=true;compileGeneration++;programWarmup.dispose();resetLook.current=()=>{};surface.removeEventListener("pointerdown",down);surface.removeEventListener("pointermove",move);surface.removeEventListener("pointerup",up);surface.removeEventListener("pointercancel",up);surface.removeEventListener("lostpointercapture",up);surface.removeEventListener("dblclick",reset);window.removeEventListener("keydown",keys);scheduleRef.current=()=>{};cancelAnimationFrame(frame);resize.disconnect();surface.removeEventListener("webglcontextlost",lose);surface.removeEventListener("webglcontextrestored",restore);document.removeEventListener("visibilitychange",visibility);world.dispose();quadGeometry.dispose();postMaterial.dispose();target.depthTexture?.dispose();target.dispose();renderer.dispose();if(!lost&&!surface.isConnected)renderer.forceContextLoss();};
 },[]);
 return <div ref={root} className="terminal-world" data-fallback="1" style={{position:"absolute",inset:0,overflow:"hidden",backgroundColor:"#112c43"}}><canvas ref={canvas} tabIndex={allowLook?0:-1} aria-label="Airport view. In the concourse, drag horizontally or use left and right arrow keys to look around. Swipe vertically to continue. Escape resets the view." style={{display:"block",width:"100%",height:"100%",opacity:0,cursor:allowLook?"grab":"default",touchAction:"pan-y pinch-zoom"}} /></div>;
}
