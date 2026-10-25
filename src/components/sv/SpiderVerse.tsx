"use client";

import "./terminal-journey.css";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, motion, useMotionValue, useScroll, useSpring, type AnimationPlaybackControls } from "framer-motion";
import { TerminalWorld } from "./TerminalWorld";
import { SpokenIntro, ExperienceStory, ProjectStory, MemoryStory } from "./TerminalStory";
import { BoardingPass } from "./BoardingPass";
import { TerminalDirectory } from "./TerminalDirectory";
import { PhotoGallery } from "./PhotoGallery";
import { CHAPTERS, CUTS, useSceneProgress, useSelection } from "./timeline";

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
  const smooth = useSpring(scrollYProgress, { stiffness: 190, damping: 35, mass: .38, restDelta: .00002 });
  const t = reduced ? scrollYProgress : smooth;
  const subscribeTimeline = useCallback((update: () => void) => t.on("change", update), [t]);
  const readChapter = useCallback(() => CUTS.filter(cut => t.get() >= cut).length, [t]);
  const chapter = useSyncExternalStore(subscribeTimeline, readChapter, () => 0);
  const experienceProgress = useSceneProgress(t, 1);
  const projectProgress = useSceneProgress(t, 2);
  const boardingProgress = useSceneProgress(t, 4);
  const [experience, selectExperience] = useSelection(experienceProgress, 5);
  const [project, selectProject] = useSelection(projectProgress, 4);
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
  const [ready, setReady] = useState(false);
  const [gallery, setGallery] = useState({ open: false, index: 0 });
  const openGallery = useCallback((index = 0) => setGallery({ open: true, index }), []);
  const closeGallery = useCallback(() => setGallery(value => ({ ...value, open: false })), []);
  const closeDirectory = useCallback(() => setDirectory(false), []);
  const onReady = useCallback(() => setReady(true), []);

  // Keep the same story position when rotation or a resized window changes svh.
  useEffect(() => {
    let height = window.innerHeight;
    let progress = scrollYProgress.get();
    let frame = 0;
    const unsubscribe = scrollYProgress.on("change", value => { progress = value; });
    const resize = () => {
      if (height === window.innerHeight) return;
      height = window.innerHeight;
      const held = progress;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const node = track.current;
        if (!node) return;
        window.scrollTo({ top: (node.offsetHeight - window.innerHeight) * held, behavior: "instant" });
        smooth.jump(held);
      });
    };
    window.addEventListener("resize", resize);
    return () => { unsubscribe(); cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, [scrollYProgress, smooth]);

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
      const index = CHAPTERS.findIndex(c => c.id === (aliases[hash] ?? hash));
      if (index >= 0) frame = requestAnimationFrame(() => jump(index));
    };
    navigate();
    window.addEventListener("hashchange", navigate);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", navigate); };
  }, [jump]);

  return <main className={`tj${reduced ? " tj-reduced" : ""}`} data-chapter={chapter} data-world-ready={ready}>
    <h1 className="tj-sr-only">Ammar Adam — CS & Finance at Waterloo</h1>
    <a className="tj-skip" href="#directory" onClick={event => { event.preventDefault(); setDirectory(true); }}>Skip to portfolio directory</a>
    <div className="tj-track" ref={track}>
      <div className="tj-stage">
        <TerminalWorld t={t} reduced={reduced} experienceIndex={experience} projectIndex={project} departure={departure} onPhoto={openGallery} onReady={onReady} />
        <div className="tj-screen-shade" aria-hidden="true" />
        <div className="tj-story-layer">
          {chapter === 0 && <SpokenIntro t={t} reduced={reduced} />}
          {chapter === 1 && <ExperienceStory selected={experience} select={selectExperience} onDirectory={() => setDirectory(true)} />}
          {chapter === 2 && <ProjectStory selected={project} select={selectProject} />}
          {chapter === 3 && <MemoryStory t={t} onGallery={openGallery} />}
          {chapter === 4 && <BoardingPass p={boardingProgress} reduced={reduced} onDeparture={launchDeparture} />}
        </div>
        <header className="tj-header">
          <button className="tj-brand" onClick={() => jump(0)} aria-label="Ammar Adam, back to start"><span aria-hidden="true">a<span>/</span>a</span><b>AMMAR ADAM</b></button>
          <nav aria-label="Portfolio shortcuts"><button onClick={() => openGallery()}>Camera roll <span>25</span></button><button onClick={() => setDirectory(true)}>All work ↗</button></nav>
        </header>
        <footer className="tj-footer">
          <p className="tj-location"><b>0{chapter + 1}</b> {CHAPTERS[chapter].label}</p>
          <nav aria-label="Story chapters">{CHAPTERS.map((c, index) => <button key={c.id} onClick={() => jump(index)} aria-label={`Go to ${c.short}`} aria-current={chapter === index ? "step" : undefined}><span>0{index + 1}</span><b>{c.short}</b></button>)}</nav>
          <p className="tj-scroll">{!ready ? "Loading the terminal…" : chapter === 4 ? <a href="/credits">Visual credits ↗</a> : <>KEEP SCROLLING <span aria-hidden="true">↓</span></>}</p>
        </footer>
        <div className="tj-progress" aria-hidden="true"><motion.div style={{ scaleX: t }} /></div>
      </div>
    </div>
    <TerminalDirectory open={directory} onClose={closeDirectory} />
    <PhotoGallery open={gallery.open} initialIndex={gallery.index} onClose={closeGallery} />
  </main>;
}
