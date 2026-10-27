"use client";

import "./terminal-journey.css";

import dynamic from "next/dynamic";
import Link from "next/link";
import "./film-type.css";
import { JourneyHeader } from "./JourneyHeader";
import { OpeningFilm } from "./OpeningFilm";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useScroll, useSpring, type AnimationPlaybackControls } from "framer-motion";
// Warm the module and baked atrium bytes while the buffered film plays. World construction and
// GPU setup remain inside TerminalWorld's effect after the intro has finished.
let terminalWorldModule: Promise<typeof import("./TerminalWorld")> | undefined;
const loadTerminalWorld = () => terminalWorldModule ??= import("./TerminalWorld").catch(error => {
  terminalWorldModule = undefined;
  throw error;
});
const prepareTerminalWorld = () => { void loadTerminalWorld().then(module => module.prepareTerminalSetGeometry()).catch(() => {}); };
const TerminalWorld = dynamic(() => loadTerminalWorld().then(module => module.TerminalWorld), { ssr: false });
import { SpokenIntro, ExperienceStory, ProjectStory } from "./TerminalStory";
import { BoardingPass } from "./BoardingPass";
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
  const readChapter = useCallback(() => CUTS.filter(cut => t.get() + .0001 >= cut).length, [t]);
  const chapter = useSyncExternalStore(subscribeTimeline, readChapter, () => 0);
  const experienceProgress = useSceneProgress(t, 1);
  const projectProgress = useSceneProgress(t, 2);
  const boardingProgress = useSceneProgress(t, 4);
  const [experience] = useSelection(experienceProgress, 5);
  const [project] = useSelection(projectProgress, 4);
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
  const [introKey, setIntroKey] = useState(0);
  const [scrollHint, setScrollHint] = useState(false);
  const scrollHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lookHint, setLookHint] = useState(false);
  const lookHintSeen = useRef(false);
  const lookHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissLookHint = useCallback(() => setLookHint(false), []);
  useEffect(() => {
    if (chapter !== 3 || lookHintSeen.current || intro) return;
    const frame = requestAnimationFrame(() => {
      lookHintSeen.current = true;
      setLookHint(true);
      lookHintTimer.current = setTimeout(dismissLookHint, 4000);
    });
    return () => cancelAnimationFrame(frame);
  }, [chapter, intro, dismissLookHint]);
  useEffect(() => () => {
    if (scrollHintTimer.current) clearTimeout(scrollHintTimer.current);
    if (lookHintTimer.current) clearTimeout(lookHintTimer.current);
  }, []);
  // Constructing the WebGL world during video playback competed for the GPU.
  // Keep it dormant until the film ends; preserve the instance on later replays.
  const finishIntro = useCallback((seek = true) => {
    setIntro(false);
    setScrollHint(true);
    if (scrollHintTimer.current) clearTimeout(scrollHintTimer.current);
    scrollHintTimer.current = setTimeout(() => setScrollHint(false), 4000);
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

  const navigate = useCallback((index: number) => {
    if (index === 0 && !reduced) {
      setScrollHint(false);
      setIntroKey(value => value + 1);
      setIntro(true);
      jump(0);
    } else {
      if (intro) finishIntro(false);
      requestAnimationFrame(() => jump(index));
    }
  }, [finishIntro, intro, jump, reduced]);

  useEffect(() => {
    const steps = [0,
      ...Array.from({ length: 5 }, (_, index) => CUTS[0] + (index + .45) / 5 * (CUTS[1] - CUTS[0])),
      ...Array.from({ length: 4 }, (_, index) => CUTS[1] + (index + .45) / 4 * (CUTS[2] - CUTS[1])),
      .665, .735, .805, CHAPTERS[4].at];
    const keydown = (event: KeyboardEvent) => {
      if (intro || detailsOpen || event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (document.querySelector("dialog[open]")) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input,textarea,select,[contenteditable='true']")) return;
      if (event.key === " " && target instanceof HTMLElement && target.closest("a,button")) return;
      if (document.querySelector('.journey-menu-button[aria-expanded="true"]')) return;
      const backwards = event.key === "ArrowUp" || (event.key === " " && event.shiftKey);
      if (!backwards && event.key !== "ArrowDown" && event.key !== " ") return;
      event.preventDefault();
      const current = t.get();
      const nearest = steps.reduce((best, step, index) => Math.abs(step - current) < Math.abs(steps[best] - current) ? index : best, 0);
      const next = steps[nearest + (backwards ? -1 : 1)];
      if (next === undefined || !track.current) return;
      window.scrollTo({ top: (track.current.offsetHeight - innerHeight) * next, behavior: reduced ? "instant" : "smooth" });
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [detailsOpen, intro, reduced, t]);

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

  return <main className={`tj${reduced ? " tj-reduced" : ""}`} data-chapter={chapter} data-world-ready={ready} data-scroll-hint={scrollHint} data-intro-playing={intro && !reduced}>
    <h1 className="tj-sr-only">Ammar Adam — I study CS + Finance at Waterloo</h1>
    <Link className="tj-skip" href="/short">Skip to the short version</Link>
    <div className="tj-track" ref={track} inert={intro && !reduced}>
      <div className="tj-stage">
        {(!intro || reduced || ready) && <TerminalWorld t={t} reduced={reduced} active={!intro && !detailsOpen} experienceIndex={experience} projectIndex={project} departure={departure} onReady={onReady} allowLook={chapter === 3} onLook={dismissLookHint} />}
        <div className="tj-screen-shade" aria-hidden="true" />
        <div className="tj-story-layer">
          {chapter === 0 && <SpokenIntro t={t} reduced={reduced} />}
          {chapter === 1 && <ExperienceStory selected={experience} onOpenChange={setDetailsOpen} />}
          {chapter === 2 && <ProjectStory selected={project} onOpenChange={setDetailsOpen} />}
          {chapter === 4 && <BoardingPass p={boardingProgress} reduced={reduced} onDeparture={launchDeparture} onReset={resetDeparture} />}
        </div>
        {(!intro || reduced) && <JourneyHeader chapter={chapter} onNavigate={navigate} />}
        {scrollHint && chapter !== 3 && chapter !== 4 && <p className="tj-scroll-hint" aria-hidden="true">Scroll <span>↓</span></p>}
        <AnimatePresence>{chapter === 3 && lookHint && <motion.p key="look-hint" className="tj-look-hint" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .2 }}>Drag to look around</motion.p>}</AnimatePresence>
        <div className="tj-progress" aria-hidden="true"><motion.div style={{ scaleX: t }} />{CUTS.map(cut => <i key={cut} style={{ left: `${cut * 100}%` }} />)}</div>
      </div>
    </div>
    <AnimatePresence>{intro && !reduced && <OpeningFilm key={introKey} onFinish={() => finishIntro()} onPrepareWorld={prepareTerminalWorld} onNavigate={navigate} />}</AnimatePresence>
  </main>;
}
