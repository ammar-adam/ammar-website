"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import "./intro-sequence.css";

export const INTRO_CUTS = [0, .16, .34, .49, .64, .80, 1];
const beatAt = (p: number) => Math.min(5, Math.max(0, INTRO_CUTS.filter(cut => p >= cut).length - 1));

export function IntroSequence({ p, reduced, onEnter }: { p: MotionValue<number>; reduced: boolean; onEnter: () => void }) {
  const subscribe = useCallback((update: () => void) => p.on("change", update), [p]);
  const snapshot = useCallback(() => beatAt(p.get()), [p]);
  const beat = useSyncExternalStore(subscribe, snapshot, () => 0);
  const floorX = useTransform(p, [0,1], ["0%","-45%"]);
  const speed = useTransform(p, value => {
    if (reduced) return 0;
    const d = Math.min(...INTRO_CUTS.slice(1,-1).map(cut => Math.abs(value-cut)));
    return Math.max(0, 1-d/.027)*.5;
  });

  if (reduced) return <div className="ix-root ix-reduced" data-intro-beat={beat}>
    <div className="ix-static-copy"><p className="sv-eyebrow">ALRIGHT. LET’S DO THIS ONE MORE TIME.</p><h1>I’m <span>Ammar Adam.</span></h1><p>I study CS &amp; Finance at Waterloo.<br />I build AI tools at Sagard and bring student builders together.</p><button onClick={onEnter}>Here’s the story so far <span aria-hidden="true">↗</span></button></div>
    <img className="ix-static-kid" src="/art/traveler-v2.webp" width={683} height={1024} alt="" aria-hidden="true" />
  </div>;

  return <div className="ix-root" data-intro-beat={beat}>
    <h1 className="ix-sr-only">I’m Ammar Adam. CS &amp; Finance at Waterloo. I build AI tools at Sagard and bring student builders together.</h1>
    <motion.div className="ix-floor-streak" style={{ x: floorX }} aria-hidden="true" />
    <div className="ix-architecture" aria-hidden="true">
      <TerminalFlyby p={p} start={.025} end={.29} side={1} label="GATES 01—03" />
      <TerminalFlyby p={p} start={.17} end={.38} side={-1} label="DEPARTURES" />
      <TerminalFlyby p={p} start={.78} end={1} side={1} label="GATES 04—05" />
    </div>
    <SwingTraveler p={p} />
    <motion.div className="ix-speed-lines" style={{ opacity: speed }} aria-hidden="true"><i /><i /><i /><i /><i /></motion.div>
    <IntroBeat p={p} index={0} active={beat===0}>
      <div className="ix-type ix-opener"><p className="ix-overline">AMMAR ADAM / TAKE 01</p><p className="ix-opener-word">ALRIGHT.</p><span className="ix-handwritten">Let’s do this</span><p className="ix-coral">ONE MORE<br />TIME.</p></div>
    </IntroBeat>
    <IntroBeat p={p} index={1} active={beat===1}>
      <div className="ix-type ix-name"><p className="ix-overline">MY NAME IS</p><p>AMMAR<br /><span className="ix-coral">ADAM.</span></p><span className="ix-name-caption">Hey. Good to meet you.</span></div>
    </IntroBeat>
    <IntroBeat p={p} index={2} active={beat===2}>
      <Montage p={p} start={.34} end={.49} src="/ABOUT10.jpg" caption="CS & FINANCE / WATERLOO" variant="study" />
      <div className="ix-type ix-fact"><p className="ix-overline">I STUDY</p><p>CS &amp;<br /><span className="ix-coral">FINANCE.</span></p><span className="ix-subtitle">at the University of Waterloo.</span></div>
    </IntroBeat>
    <IntroBeat p={p} index={3} active={beat===3}>
      <Montage p={p} start={.49} end={.64} src="/SAGARD.jpg" caption="SAGARD / AI ENGINEER" variant="work" />
      <div className="ix-type ix-fact"><p className="ix-overline">MOST DAYS</p><p>I BUILD<br /><span className="ix-coral">AI TOOLS.</span></p><span className="ix-subtitle">For the people doing the work.</span></div>
    </IntroBeat>
    <IntroBeat p={p} index={4} active={beat===4}>
      <Montage p={p} start={.64} end={.80} src="/HTN_ORGANIZER.jpg" caption="HACK THE NORTH / WATERLOO TECH WEEK" variant="people" />
      <div className="ix-type ix-builders"><p className="ix-overline">AND WHEN I’M NOT DOING THAT</p><p>I BRING<br /><span className="ix-coral">BUILDERS</span><br />TOGETHER.</p><span className="ix-subtitle">Good things tend to start with good people.</span></div>
    </IntroBeat>
    <IntroBeat p={p} index={5} active={beat===5}>
      <div className="ix-type ix-outro"><p className="ix-overline">THAT’S THE SHORT VERSION.</p><p>HERE’S<br />THE STORY<br /><span className="ix-coral">SO FAR.</span></p></div>
    </IntroBeat>
    <div className="ix-controls"><span className="ix-count">0{beat+1} <i>/ 06</i></span><div className="ix-beat-ticks" aria-hidden="true">{INTRO_CUTS.slice(0,-1).map((_,i)=><span key={i} className={i===beat?"is-active":""} />)}</div><button onClick={onEnter}>Skip to the work <span aria-hidden="true">↗</span></button></div>
  </div>;
}

type FlightKey = { at:number; x:number; y:number; mx:number; my:number; scale:number; roll:number };
const SWING_POSES = [
  {id:"ground",src:"/art/traveler-v2.webp",hand:[.18,.47]},
  {id:"reach",src:"/art/traveler-swing-reach.webp",hand:[.124,.035]},
  {id:"tuck",src:"/art/traveler-swing-tuck.webp",hand:[.172,.034]},
  {id:"release",src:"/art/traveler-swing-release.webp",hand:[.092,.073]},
];
// Drawn poses hold while the camera travels continuously. There is no elapsed
// time or playback state here: reversing the scroll plays the exact same poses.
const flightPoseAt=(p:number)=>p<.025?0:p<.115?1:p<.25?2:p<.78?3:p<.835?1:p<.93?2:3;
const FLIGHT: FlightKey[] = [
  {at:0,x:.79,y:.52,mx:.75,my:.67,scale:1,roll:-3},
  {at:.025,x:.79,y:.52,mx:.75,my:.67,scale:1,roll:-3},
  {at:.075,x:.80,y:.42,mx:.66,my:.62,scale:.83,roll:-22},
  {at:.15,x:.69,y:.51,mx:.53,my:.66,scale:1.05,roll:24},
  {at:.205,x:.73,y:.49,mx:.58,my:.64,scale:.86,roll:18},
  {at:.285,x:.83,y:.36,mx:.73,my:.54,scale:.69,roll:-37},
  {at:.34,x:1.14,y:.06,mx:1.12,my:.22,scale:.36,roll:-73},
  {at:.78,x:1.1,y:.10,mx:1.08,my:.31,scale:.34,roll:-68},
  {at:.84,x:.82,y:.35,mx:.72,my:.56,scale:.68,roll:-25},
  {at:.89,x:.72,y:.50,mx:.54,my:.65,scale:1.12,roll:28},
  {at:.94,x:.78,y:.43,mx:.63,my:.58,scale:.88,roll:55},
  {at:1,x:1.19,y:-.18,mx:1.20,my:.10,scale:.38,roll:78},
];

function flightAt(progress:number,width:number,height:number) {
  const p=Math.max(0,Math.min(1,progress));
  const next=FLIGHT.findIndex(key=>key.at>=p);
  const end=next<0?FLIGHT.length-1:next,start=Math.max(0,end-1);
  const a=FLIGHT[start],b=FLIGHT[end],span=b.at-a.at;
  const t=span?(p-a.at)/span:0;
  // A monotone cubic keeps velocity through the bottom of the arc, instead of
  // stopping on every camera key. Only an apex or direction change eases to zero.
  const sample=(field:keyof Omit<FlightKey,"at">)=>{
    const tangent=(index:number)=>{
      if(index===0||index===FLIGHT.length-1)return 0;
      const before=FLIGHT[index-1],here=FLIGHT[index],after=FLIGHT[index+1];
      const left=(here[field]-before[field])/(here.at-before.at);
      const right=(after[field]-here[field])/(after.at-here.at);
      return left*right<=0?0:2*left*right/(left+right);
    };
    return (2*t*t*t-3*t*t+1)*a[field]+(t*t*t-2*t*t+t)*span*tangent(start)
      +(-2*t*t*t+3*t*t)*b[field]+(t*t*t-t*t)*span*tangent(end);
  };
  const small=width<720;
  const h=small?Math.min(height*.31,width*.72):height*.61;
  return {x:sample(small?"mx":"x")*width,y:sample(small?"my":"y")*height,
    width:h*683/1024,height:h,scale:sample("scale"),roll:sample("roll"),frame:flightPoseAt(p),p};
}

function SwingTraveler({p}:{p:MotionValue<number>}) {
  const bounds=useRef<HTMLDivElement>(null);
  const size=useMotionValue({width:1440,height:900});
  useEffect(()=>{
    const element=bounds.current;
    if(!element)return;
    const measure=()=>size.set({width:element.clientWidth,height:element.clientHeight});
    measure();const observer=new ResizeObserver(measure);observer.observe(element);
    return()=>observer.disconnect();
  },[size]);
  const pose=useTransform(()=>flightAt(p.get(),size.get().width,size.get().height));
  const left=useTransform(pose,value=>value.x),top=useTransform(pose,value=>value.y);
  const width=useTransform(pose,value=>value.width),height=useTransform(pose,value=>value.height);
  const transform=useTransform(pose,value=>`translate(-50%, -50%) rotate(${value.roll}deg) scale(${value.scale})`);
  const opacity=useTransform(p,[0,.315,.34,.78,.80,1],[1,1,0,0,1,1]);
  const released=useTransform(p,value=>value>=.93?Math.min(1,(value-.93)/.025):value>=.25&&value<.78?Math.min(1,(value-.25)/.025):0);
  const cableOpacity=useTransform(()=>pose.get().frame===0?0:1-released.get());
  // The endpoint follows the actual wrist through the same rotation and scale
  // as the intact pose, so the bright tether stays taut throughout the arc.
  const wrist=useTransform(()=>{
    const value=pose.get(),r=value.roll*Math.PI/180;
    const hand=SWING_POSES[value.frame].hand;
    const x=(hand[0]-.5)*value.width*value.scale,y=(hand[1]-.5)*value.height*value.scale;
    return {x:value.x+x*Math.cos(r)-y*Math.sin(r),y:value.y+x*Math.sin(r)+y*Math.cos(r)};
  });
  const cableTip=useTransform(()=>{
    const point=wrist.get(),dimensions=size.get();
    const release=released.get()**2;
    const anchor=pose.get().p<.5?930:530;
    const x=point.x/dimensions.width*1000*(1-release)+anchor*release;
    const y=point.y/dimensions.height*1000*(1-release)-90*release;
    return {x,y,anchor};
  });
  const cable=useTransform(()=>{
    const {x,y,anchor}=cableTip.get();
    return `M ${anchor} -90 Q ${(anchor+x)/2+12} ${(y-90)/2} ${x} ${y}`;
  });
  const handX=useTransform(cableTip,value=>value.x),handY=useTransform(cableTip,value=>value.y);
  return <motion.div ref={bounds} className="ix-flight-layer" style={{opacity}} aria-hidden="true">
    <motion.svg className="ix-tether" viewBox="0 0 1000 1000" preserveAspectRatio="none" style={{opacity:cableOpacity}}>
      <motion.path d={cable} className="ix-tether-shadow" vectorEffect="non-scaling-stroke" />
      <motion.path d={cable} className="ix-tether-colour" vectorEffect="non-scaling-stroke" />
      <motion.path d={cable} className="ix-tether-thread" vectorEffect="non-scaling-stroke" />
      <motion.circle cx={handX} cy={handY} r="3" fill="#fff1d4" />
    </motion.svg>
    <motion.div className="ix-swing-traveler" style={{left,top,width,height,transform}}>
      {SWING_POSES.map((frame,index)=><FlightPose key={frame.id} p={p} src={frame.src} id={frame.id} index={index} />)}
    </motion.div>
  </motion.div>;
}

function FlightPose({p,src,id,index}:{p:MotionValue<number>;src:string;id:string;index:number}) {
  const opacity=useTransform(p,value=>index===flightPoseAt(value)?1:0);
  return <motion.img className="ix-character-pose" data-flight-pose={id} src={src} width={683} height={1024} alt="" style={{opacity}} loading="eager" decoding="async" fetchPriority={index<2?"high":"auto"} />;
}

function TerminalFlyby({p,start,end,side,label}:{p:MotionValue<number>;start:number;end:number;side:number;label:string}) {
  const local=useTransform(p,[start,end],[0,1]);
  const z=useTransform(local,[0,1],[-1750,650]);
  const rotate=useTransform(local,[0,.55,1],[-side*7,side*2,side*14]);
  const x=useTransform(local,[0,1],[`${side*8}vw`,`${-side*24}vw`]);
  const opacity=useTransform(local,[0,.06,.86,1],[0,.9,.9,0]);
  return <motion.div className="ix-gantry" style={{z,rotate,x,opacity}}>
    <div className="ix-gantry-cross"><i /><i /><i /></div><div className="ix-gantry-post ix-gantry-post-left" /><div className="ix-gantry-post ix-gantry-post-right" />
    <div className={`ix-flying-sign ${side<0?"ix-flying-sign-left":""}`}><small>TERMINAL A</small><strong>{label}<b>↗</b></strong></div>
  </motion.div>;
}

function IntroBeat({ p,index,active,children }: { p:MotionValue<number>;index:number;active:boolean;children:ReactNode }) {
  const start=INTRO_CUTS[index], end=INTRO_CUTS[index+1];
  const local=useTransform(p,[start,end],[0,1]);
  const opacity=useTransform(p,value=>value>=start&&value<(index===5?1.001:end)?1:0);
  const x=useTransform(local,[0,.07,.13,.88,1],[index?"14vw":"0vw","-1vw","0vw","0vw","-13vw"]);
  const rotate=useTransform(local,[0,.08,.14,.88,1],[index?3:-2,-2,-1,-1,-4]);
  const scale=useTransform(local,[0,.07,.14,.88,1],[index?1.14:1,1.02,1,1,.94]);
  return <motion.div className={`ix-beat ix-beat-${index}`} style={{opacity,x,rotate,scale}} aria-hidden={!active}>{children}</motion.div>;
}

function Montage({p,start,end,src,caption,variant}:{p:MotionValue<number>;start:number;end:number;src:string;caption:string;variant:string}) {
  const x=useTransform(p,[start,end],[120,-45]);
  const rotate=useTransform(p,[start,end],[9,-5]);
  const scale=useTransform(p,[start,end],[.88,1.12]);
  return <motion.figure className={`ix-montage ix-montage-${variant}`} style={{x,rotate,scale}}><img src={src} alt="" width={800} height={900} /><figcaption>{caption}</figcaption></motion.figure>;
}
