"use client";

import {useEffect,useRef} from "react";
import type {MotionValue} from "framer-motion";
import * as THREE from "three";
import {createPaintedTerminal} from "./painted-terminal";
import {TERMINAL_POST_FRAGMENT,TERMINAL_POST_VERTEX} from "./terminal-post";

type Props={active?:boolean;t:MotionValue<number>;reduced:boolean;experienceIndex:number;projectIndex:number;departure:MotionValue<number>;onPhoto:(index:number)=>void;onReady?:()=>void};

export function TerminalWorld({active=true,t,reduced,experienceIndex,projectIndex,departure,onPhoto,onReady}:Props){
 const root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const view=useRef({active,reduced,experienceIndex,projectIndex,onPhoto,onReady}),scheduleRef=useRef<()=>void>(()=>{});
 const motionValues=useRef({t,departure});
 useEffect(()=>{view.current={active,reduced,experienceIndex,projectIndex,onPhoto,onReady};scheduleRef.current();},[active,reduced,experienceIndex,projectIndex,onPhoto,onReady]);
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
  try{renderer=new THREE.WebGLRenderer({canvas:surface,antialias:false,alpha:false,powerPreference:"high-performance"});}
  catch{element.dataset.fallback="1";view.current.onReady?.();return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.35));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
  renderer.shadowMap.enabled=false;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const schedule=()=>{dirty=true;if(!dead&&!lost&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);};scheduleRef.current=schedule;
  const world=createPaintedTerminal(schedule);
  const target=new THREE.WebGLRenderTarget(1,1,{depthBuffer:true});target.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
  target.samples=4;
  const postScene=new THREE.Scene(),postCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const postMaterial=new THREE.ShaderMaterial({vertexShader:TERMINAL_POST_VERTEX,fragmentShader:TERMINAL_POST_FRAGMENT,uniforms:{uScene:{value:target.texture},uDepth:{value:target.depthTexture},uResolution:{value:new THREE.Vector2(1,1)},uIntensity:{value:.45},uMotion:{value:0},uTime:{value:0}},depthTest:false,depthWrite:false});
  const quadGeometry=new THREE.PlaneGeometry(2,2);postScene.add(new THREE.Mesh(quadGeometry,postMaterial));
  let width=0,height=0,lastAmbient=0,lastProgress=-1;const started=performance.now();
  function draw(){frame=0;dirty=false;if(dead||lost||document.hidden)return;
   const w=Math.max(1,element!.clientWidth),h=Math.max(1,element!.clientHeight);
   if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);const size=renderer.getDrawingBufferSize(new THREE.Vector2());target.setSize(size.x,size.y);postMaterial.uniforms.uResolution.value.copy(size);}
   const state=view.current;world.update({t:motionValues.current.t.get(),departure:motionValues.current.departure.get(),reduced:state.reduced,experienceIndex:state.experienceIndex,projectIndex:state.projectIndex,aspect:w/h,time:(performance.now()-started)/1000});

   const progress=motionValues.current.t.get(),moving=Math.abs(progress-lastProgress)>.000015;
   const rush=Math.exp(-Math.pow((progress-.055)/.027,2))*.75+Math.exp(-Math.pow((progress-.145)/.026,2))*.9;
   postMaterial.uniforms.uMotion.value=state.reduced||!moving||progress>=.24?0:Math.min(1,rush);postMaterial.uniforms.uTime.value=state.reduced?0:(performance.now()-started)/1000;lastProgress=progress;
   renderer.setRenderTarget(target);renderer.render(world.scene,world.camera);const calls=renderer.info.render.calls;renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
   element!.dataset.fallback=world.scene.userData.ready?"0":"1";element!.dataset.stage=world.scene.userData.stage;element!.dataset.progress=motionValues.current.t.get().toFixed(4);element!.dataset.camera=world.camera.position.toArray().map(n=>n.toFixed(2)).join(",");element!.dataset.drawCalls=String(calls);surface!.style.opacity=world.scene.userData.ready?"1":"0";
   if(motionValues.current.t.get()<.65||motionValues.current.t.get()>=.86)surface!.style.cursor="default";
   if(!ready&&world.scene.userData.ready){ready=true;state.onReady?.();}
   if(state.active&&!state.reduced&&motionValues.current.t.get()<.86)frame=requestAnimationFrame(ambient);
  }
  function ambient(now:number){frame=0;if(dead||lost||document.hidden)return;if(dirty){lastAmbient=now;draw();return;}if(!view.current.active||view.current.reduced)return;if(now-lastAmbient>=1000/30){lastAmbient=now;draw();}else frame=requestAnimationFrame(ambient);}
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const hit=(event:PointerEvent|MouseEvent)=>{const progress=motionValues.current.t.get();if(lost||progress<.65||progress>=.86)return;const rect=surface.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(pointer,world.camera);return raycaster.intersectObjects(world.photos.filter(photo=>photo.visible),false)[0];};
  const click=(event:MouseEvent)=>{
   const photo=hit(event);if(!photo)return;
   // Only a click needs the full occlusion check; hover stays inexpensive.
   const blocked=raycaster.intersectObjects(world.scene.children,true).some(intersection=>{
    if(intersection.distance>=photo.distance-.015)return false;
    let node:THREE.Object3D|null=intersection.object;
    while(node){if(!node.visible)return false;node=node.parent;}
    const mesh=intersection.object as THREE.Mesh;
    if(!mesh.isMesh)return false;
    const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
    return materials.some(material=>material.visible&&!material.transparent);
   });
   if(!blocked)view.current.onPhoto(photo.object.userData.photoIndex);
  };
  const hover=(event:PointerEvent)=>{surface.style.cursor=hit(event)?"pointer":"default";};
  const lose=(event:Event)=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;element.dataset.fallback="1";surface.style.opacity="0";};
  const restore=()=>{lost=false;schedule();};
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();};
  surface.addEventListener("click",click);surface.addEventListener("pointermove",hover);surface.addEventListener("webglcontextlost",lose);surface.addEventListener("webglcontextrestored",restore);document.addEventListener("visibilitychange",visibility);
  const resize=new ResizeObserver(schedule);resize.observe(element);schedule();
  return()=>{dead=true;scheduleRef.current=()=>{};cancelAnimationFrame(frame);resize.disconnect();surface.removeEventListener("click",click);surface.removeEventListener("pointermove",hover);surface.removeEventListener("webglcontextlost",lose);surface.removeEventListener("webglcontextrestored",restore);document.removeEventListener("visibilitychange",visibility);world.dispose();quadGeometry.dispose();postMaterial.dispose();target.depthTexture?.dispose();target.dispose();renderer.dispose();if(!lost&&!surface.isConnected)renderer.forceContextLoss();};
 },[]);
 return <div ref={root} className="terminal-world" data-fallback="1" style={{position:"absolute",inset:0,overflow:"hidden",background:"#112c43 url('/art/terminal-atrium-v4.webp') center / cover"}}><canvas ref={canvas} aria-label="A continuous illustrated airport terminal" style={{display:"block",width:"100%",height:"100%",opacity:0}} /></div>;
}
