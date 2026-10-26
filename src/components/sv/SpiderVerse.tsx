"use client";

import "./terminal-journey.css";
import Link from "next/link";
import dynamic from "next/dynamic";
import { SocialLinks } from "./SocialLinks";
import { OpeningFilm } from "./OpeningFilm";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useScroll, useSpring, type AnimationPlaybackControls } from "framer-motion";
const TerminalWorld = dynamic(() => import("./TerminalWorld").then(module => module.TerminalWorld), { ssr: false });
import { SpokenIntro, ExperienceStory, ProjectStory, MemoryStory } from "./TerminalStory";
import { BoardingPass } from "./BoardingPass";
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
    try { sessionStorage.setItem("ammar-intro-seen", "1"); } catch {}
    setIntro(false);
    if (seek) {
      const progress = .2405;
      scrollYProgress.set(progress);
      smooth.jump(progress);
      requestAnimationFrame(() => window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * progress, behavior: "instant" }));
    }
  }, [scrollYProgress, smooth]);
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("ammar-intro-seen") === "1"; } catch {}
    const linked = !!window.location.hash;
    if (reduced || seen || linked) {
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
  const [gallery, setGallery] = useState({ open: false, index: 0 });
  const openGallery = useCallback((index = 0) => setGallery({ open: true, index }), []);
  const closeGallery = useCallback(() => setGallery(value => ({ ...value, open: false })), []);
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
    <Link className="tj-skip" href="/short">Skip to the short version</Link>
    <div className="tj-track" ref={track} inert={intro && !reduced}>
      <div className="tj-stage">
        {(!intro || reduced || warmWorld) && <TerminalWorld t={t} reduced={reduced} active={!intro && !gallery.open && !detailsOpen} experienceIndex={experience} projectIndex={project} departure={departure} onPhoto={openGallery} onReady={onReady} />}
        <div className="tj-screen-shade" aria-hidden="true" />
        <div className="tj-story-layer">
          {chapter === 0 && <SpokenIntro t={t} reduced={reduced} />}
          {chapter === 1 && <ExperienceStory selected={experience} select={index => seekItem(1, index)} onOpenChange={setDetailsOpen} />}
          {chapter === 2 && <ProjectStory selected={project} select={index => seekItem(2, index)} onOpenChange={setDetailsOpen} />}
          {chapter === 3 && <MemoryStory t={t} onGallery={openGallery} />}
          {chapter === 4 && <BoardingPass p={boardingProgress} reduced={reduced} onDeparture={launchDeparture} onReset={resetDeparture} />}
        </div>
        <header className="tj-header">
          <button className="tj-brand" onClick={() => { jump(0); if (!reduced) setIntro(true); }} aria-label="Replay introduction"><span aria-hidden="true">a<span>/</span>a</span><b>AMMAR ADAM</b></button>
          <div className="tj-header-links"><nav aria-label="Portfolio shortcuts"><button onClick={() => openGallery()} aria-haspopup="dialog">Photos <span>25</span></button><Link href="/short">Short version <span aria-hidden="true">↗</span></Link></nav><SocialLinks /></div>
        </header>
        <footer className="tj-footer">
          <p className="tj-location"><b>0{chapter + 1}</b> {CHAPTERS[chapter].label}</p>
          <nav aria-label="Story chapters">{CHAPTERS.map((c, index) => <button key={c.id} onClick={() => { jump(index); if (index === 0 && !reduced) setIntro(true); }} aria-label={`Go to ${["Intro", "Experience", "Projects", "Photos", "Résumé"][index]}`} aria-current={chapter === index ? "step" : undefined}><span>0{index + 1}</span><b>{["Intro", "Experience", "Projects", "Photos", "Résumé"][index]}</b></button>)}</nav>
          <p className="tj-scroll">{!ready ? "Loading the terminal…" : chapter === 4 ? <a href="/credits">Visual credits ↗</a> : <>KEEP SCROLLING <span aria-hidden="true">↓</span></>}</p>
        </footer>
        <div className="tj-progress" aria-hidden="true"><motion.div style={{ scaleX: t }} /></div>
      </div>
    </div>
    <AnimatePresence>{intro && !reduced && <OpeningFilm key="opening-film" onFinish={() => finishIntro()} />}</AnimatePresence>
    <PhotoGallery open={gallery.open} initialIndex={gallery.index} onClose={closeGallery} />
  </main>;
}
