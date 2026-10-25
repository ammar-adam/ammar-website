"use client";

import "./sv.css";
import "./story-v7.css";
import "./motion-story.css";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, motion, useMotionValue, useScroll, useSpring, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { Film } from "./Film";
import { DepartureWorld } from "./DepartureWorld";
import { JourneyScene } from "./Journey";
import { TerminalDirectory } from "./TerminalDirectory";
import { PhotoGallery } from "./PhotoGallery";
import { CHAPTERS, CUTS } from "./timeline";

const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (update: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", update);
  return () => query.removeEventListener("change", update);
};
const readMotionPreference = () => window.matchMedia(motionQuery).matches;

export function SpiderVerse() {
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const reduced = useSyncExternalStore(subscribeMotion, readMotionPreference, () => false);
  const smooth = useSpring(scrollYProgress, { stiffness: 150, damping: 30, mass: 0.45, restDelta: 0.00005 });
  const t = reduced ? scrollYProgress : smooth;
  const fx = useTransform(t,value=>{
    if (reduced) return 0;
    const cuts=[.032,.068,.098,.128,.16,...CUTS];
    const distance=Math.min(...cuts.map(cut=>Math.abs(cut-value)));
    return Math.max(0,1-distance/.0035)*.35;
  });
  const subscribeTimeline = useCallback((update: () => void) => t.on("change", update), [t]);
  const readChapter = useCallback(() => CUTS.filter((cut) => t.get() >= cut).length, [t]);
  const chapter = useSyncExternalStore(subscribeTimeline, readChapter, () => 0);
  const departure = useMotionValue(0);
  const departureAnimation = useRef<AnimationPlaybackControls | null>(null);
  const launchDeparture = useCallback(() => {
    departureAnimation.current?.stop();
    departure.set(0);
    if (reduced) departure.set(1);
    else departureAnimation.current = animate(departure, 1, { duration: 4.4, ease: [.42, 0, .25, 1] });
  }, [departure, reduced]);
  useEffect(() => {
    if (chapter !== 4) { departureAnimation.current?.stop(); departure.set(0); }
    return () => departureAnimation.current?.stop();
  }, [chapter, departure]);
  const [directory, setDirectory] = useState(false);
  const [gallery, setGallery] = useState<{open:boolean;index:number}>({open:false,index:0});
  const openGallery = useCallback((index=0) => setGallery({open:true,index}), []);
  const closeGallery = useCallback(() => setGallery(value=>({...value,open:false})), []);
  const closeDirectory = useCallback(() => setDirectory(false), []);
  const progress = useTransform(t, [0, 1], [0, 1]);

  const jump = useCallback((index: number) => {
    const node = track.current;
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (node.offsetHeight - window.innerHeight) * CHAPTERS[index].at, behavior: reduced ? "instant" : "smooth" });
    window.history.replaceState(null, "", index ? `#${CHAPTERS[index].id}` : window.location.pathname);
  }, [reduced]);

  useEffect(() => {
    const aliases: Record<string, string> = { checkin: "experience", security: "projects", passport: "top", origins: "top", photos: "people", concourse: "people", boarding: "contact", resume: "contact" };
    let frame = 0;
    const navigate = () => {
      const hash = window.location.hash.slice(1);
      const index = CHAPTERS.findIndex((c) => c.id === (aliases[hash] ?? hash));
      if (index >= 0) frame = requestAnimationFrame(() => jump(index));
    };
    navigate();
    window.addEventListener("hashchange", navigate);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", navigate); };
  }, [jump]);

  return (
    <main className={`sv ${reduced ? "sv-reduced" : ""}`}>
      <a className="sv-skip" href="#directory" onClick={(event) => { event.preventDefault(); setDirectory(true); }}>Skip to portfolio directory</a>
      <div className="sv-track" ref={track}>
        <div className="sv-stage">
          <Film t={t} fx={fx} departure={departure} />
          {chapter === 4 && <DepartureWorld progress={departure} reduced={reduced} />}
          <div className="sv-vignette" aria-hidden="true" />
          <JourneyScene key={chapter} chapter={chapter} t={t} reduced={!!reduced} onDirectory={() => setDirectory(true)} onGallery={openGallery} onEnter={() => jump(1)} onDeparture={launchDeparture} />
          {!reduced && <SceneCut t={t} />}
          <header className="sv-header">
            <button className="sv-brand" onClick={() => jump(0)} aria-label="Ammar Adam, back to start"><span className="sv-brand-symbol" aria-hidden="true">A<span>/</span>A</span><span>AMMAR ADAM<small>THE STORY SO FAR</small></span></button>
            <div className="sv-header-right"><span className="sv-live"><i /> CS & FINANCE / WATERLOO</span><button className="sv-gallery-button" onClick={() => jump(3)}>Photos <span>25</span></button><button className="sv-directory-button" onClick={() => setDirectory(true)}>All work <span aria-hidden="true">↗</span></button></div>
          </header>
          <footer className="sv-hud">
            <div className="sv-location"><span className="sv-location-number">0{chapter + 1}</span><span>{CHAPTERS[chapter].label}<small>AMMAR ADAM</small></span></div>
            <nav className="sv-chapters" aria-label="Story chapters">
              {CHAPTERS.map((c, i) => <button key={c.id} onClick={() => jump(i)} aria-label={`Go to ${c.label}`} aria-current={chapter === i ? "step" : undefined}><span className="sv-chapter-dot" /><span className="sv-chapter-label">{c.short}</span></button>)}
            </nav>
            <span className="sv-scroll-note">{chapter === 4 ? <a href="/credits">Visual credits ↗</a> : <>SCROLL TO EXPLORE <span aria-hidden="true">↓</span></>}</span>
          </footer>
          <div className="sv-progress" aria-hidden="true"><motion.div style={{ scaleX: progress }} /></div>
        </div>
      </div>
      <TerminalDirectory open={directory} onClose={closeDirectory} />
      <PhotoGallery open={gallery.open} initialIndex={gallery.index} onClose={closeGallery} />
    </main>
  );
}

function SceneCut({ t }: { t: MotionValue<number> }) {
  const clip = useTransform(t, (v) => {
    const cut = CUTS.find(c => Math.abs(v-c)<.012);
    if(cut===undefined)return "polygon(0 0,0 0,0 100%,0 100%)";
    const p=(v-cut+.012)/.024;
    const a=p<.5?-20:(p-.5)*240-20;
    const b=p<.5?p*240-20:120;
    return `polygon(${a}% 0,${b}% 0,${b+20}% 100%,${a+20}% 100%)`;
  });
  return <motion.div className="sv-scene-cut" style={{clipPath:clip}} aria-hidden="true"><i /><span>AMMAR ADAM / THE STORY SO FAR</span></motion.div>;
}
