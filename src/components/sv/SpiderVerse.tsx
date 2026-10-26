"use client";

import "./terminal-journey.css";

import dynamic from "next/dynamic";
import { SocialLinks } from "./SocialLinks";
import { OpeningFilm } from "./OpeningFilm";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useScroll, useSpring, type AnimationPlaybackControls } from "framer-motion";
const TerminalWorld = dynamic(() => import("./TerminalWorld").then(module => module.TerminalWorld), { ssr: false });
import { SpokenIntro, ExperienceStory, ProjectStory } from "./TerminalStory";
import { BoardingPass } from "./BoardingPass";
import { ShortVersion } from "./ShortVersion";
import { JourneyNavigation } from "./JourneyNavigation";
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
  const [experience, selectExperience] = useSelection(experienceProgress, 5, true);
  const [project, selectProject] = useSelection(projectProgress, 4, true);
  const departure = useMotionValue(0);
  const departureAnimation = useRef<AnimationPlaybackControls | null>(null);
  const resetDeparture = useCallback(() => {
    departureAnimation.current?.stop();
    departure.set(0);
  }, [departure]);
  const launchDeparture = useCallback(() => {
    departureAnimation.current?.stop();
    departure.set(0);
    if (reduced) departure.set(1);
    else departureAnimation.current = animate(departure, 1, { duration: .9, ease: [.42, 0, .25, 1] });
  }, [departure, reduced]);
  useEffect(() => {
    if (chapter !== 4) { departureAnimation.current?.stop(); departure.set(0); }
    return () => departureAnimation.current?.stop();
  }, [chapter, departure]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [intro, setIntro] = useState(true);
  const [warmWorld, setWarmWorld] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setWarmWorld(true), 2000);
    return () => clearTimeout(timer);
  }, []);
  const finishIntro = useCallback((seek = true) => {
    setIntro(false);
    if (seek) {
      const progress = .2405;
      scrollYProgress.set(progress);
      smooth.jump(progress);
      requestAnimationFrame(() => window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * progress, behavior: "instant" }));
    }
  }, [scrollYProgress, smooth]);
  useEffect(() => {
    const linked = !!window.location.hash;
    if (reduced || linked) {
      const frame = requestAnimationFrame(() => finishIntro(!linked));
      return () => cancelAnimationFrame(frame);
    }
  }, [reduced, finishIntro]);
  useEffect(() => {
    if (!intro || reduced) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [intro, reduced]);
  const [shortOpen, setShortOpen] = useState(false);
  const openShort = useCallback(() => setShortOpen(true), []);
  const closeShort = useCallback(() => setShortOpen(false), []);
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
    const destination = top + (node.offsetHeight - window.innerHeight) * CHAPTERS[index].at;
    // No scroll event fires when history already restored the requested position.
    if (Math.abs(window.scrollY - destination) < 2) {
      scrollYProgress.set(CHAPTERS[index].at);
      smooth.jump(CHAPTERS[index].at);
    }
    window.scrollTo({ top: destination, behavior: reduced ? "instant" : "smooth" });
    window.history.replaceState(null, "", index ? `#${CHAPTERS[index].id}` : window.location.pathname);
  }, [reduced, scrollYProgress, smooth]);

  const seekItem = (section: 1 | 2, index: number) => {
    const node = track.current;
    if (!node) return;
    const start = CUTS[section - 1];
    const end = CUTS[section];
    const count = section === 1 ? 5 : 4;
    const progress = start + (index + .45) / count * (end - start);
    if (section === 1) selectExperience(index);
    else selectProject(index);
    window.scrollTo({ top: (node.offsetHeight - window.innerHeight) * progress, behavior: "instant" });
  };

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

  return <main className={`tj${reduced ? " tj-reduced" : ""}`} data-chapter={chapter} data-world-ready={ready} data-intro-playing={intro && !reduced}>
    <h1 className="tj-sr-only">Ammar Adam — CS & Finance at Waterloo</h1>
    <button className="tj-skip" onClick={() => { finishIntro(); openShort(); }}>Skip to the short version</button>
    <div className="tj-track" ref={track} inert={intro && !reduced}>
      <div className="tj-stage">
        {(!intro || reduced || warmWorld) && <TerminalWorld t={t} reduced={reduced} active={!intro && !shortOpen && !detailsOpen} experienceIndex={experience} projectIndex={project} departure={departure} onReady={onReady} />}
        <div className="tj-screen-shade" aria-hidden="true" />
        <div className="tj-story-layer">
          {chapter === 0 && <SpokenIntro t={t} reduced={reduced} />}
          {chapter === 1 && <ExperienceStory selected={experience} select={index => seekItem(1, index)} onOpenChange={setDetailsOpen} onShort={openShort} />}
          {chapter === 2 && <ProjectStory selected={project} select={index => seekItem(2, index)} onOpenChange={setDetailsOpen} onShort={openShort} />}
          {chapter === 4 && <BoardingPass p={boardingProgress} reduced={reduced} onDeparture={launchDeparture} onReset={resetDeparture} />}
        </div>
        <header className="tj-header">
          <div className="tj-header-left"><button className="tj-brand" onClick={() => { jump(0); if (!reduced) setIntro(true); }} aria-label="Replay introduction"><span aria-hidden="true">a<span>/</span>a</span></button><JourneyNavigation chapter={chapter} onNavigate={index => { jump(index); if (index === 0 && !reduced) setIntro(true); }} /></div>
          <div className="tj-header-links"><nav aria-label="Portfolio shortcuts"><button className="tj-short-button" onClick={openShort} aria-haspopup="dialog">Short version <span aria-hidden="true">↗</span></button></nav><SocialLinks /></div>
        </header>
        <footer className="tj-footer">
          <p className="tj-scroll-cue">{!ready ? "Loading the terminal…" : chapter === 4 ? "Let’s make something happen." : <>Scroll to continue <span aria-hidden="true">↓</span></>}</p>
          {chapter < 4 ? <button className="tj-next" onClick={() => jump(chapter + 1)}>{["Experience", "Projects", "Concourse", "Résumé"][chapter]}<span aria-hidden="true">→</span></button> : <a className="tj-credits" href="/credits">Visual credits ↗</a>}
        </footer>
        <div className="tj-progress" aria-hidden="true"><motion.div style={{ scaleX: t }} /></div>
      </div>
    </div>
    <AnimatePresence>{intro && !reduced && <OpeningFilm key="opening-film" onFinish={() => finishIntro()} onShort={() => { finishIntro(); openShort(); }} />}</AnimatePresence>
    <ShortVersion open={shortOpen} onClose={closeShort} />
  </main>;
}
