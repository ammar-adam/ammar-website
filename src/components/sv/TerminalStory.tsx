"use client";

import { useCallback, useSyncExternalStore } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { careerArrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { memoryGroups, memorySequence } from "./memorySequence";

const VOICE = [
  { pre: "", lines: ["Alright."], aside: "Let’s do this one more time." },
  { pre: "My name’s", lines: ["Ammar", "Adam."], aside: "I study CS and finance at Waterloo." },
  { pre: "And outside of class,", lines: ["I build", "things."], aside: "AI tools. Waze voices.\nFive agents arguing about stocks." },
  { pre: "I also bring", lines: ["People", "together."], aside: "Student builders. Founders. People with an idea.\nCome on. I’ll show you." },
];
const BEATS = [0, .055, .112, .175, .24];

export function SpokenIntro({ t, reduced }: { t: MotionValue<number>; reduced: boolean }) {
  const subscribe = useCallback((update: () => void) => t.on("change", update), [t]);
  const read = useCallback(() => Math.min(3, BEATS.slice(1, -1).filter(cut => t.get() >= cut).length), [t]);
  const beat = useSyncExternalStore(subscribe, read, () => 0);
  return <IntroBeat key={beat} t={t} beat={beat} reduced={reduced} />;
}

function IntroBeat({ t, beat, reduced }: { t: MotionValue<number>; beat: number; reduced: boolean }) {
  const voice = VOICE[beat];
  const local = useTransform(t, [BEATS[beat], BEATS[beat + 1]], [0, 1]);
  const opacity = useTransform(local, [0, .07, .85, 1], [beat === 0 || reduced ? 1 : .15, 1, 1, reduced ? 1 : .1]);
  const y = useTransform(local, [0, .13, .82, 1], [reduced ? 0 : 12, 0, 0, reduced ? 0 : -12]);
  const skewX = useTransform(local, [0, .22, 1], [reduced ? 0 : -5, -2, -2]);
  return <motion.section className={`tj-intro tj-intro-${beat}`} data-intro-beat={beat} style={{ opacity, y }} aria-label="Introduction">
    {voice.pre && <p className="tj-voice-lead">{voice.pre}</p>}
    <motion.h2 style={{ skewX }}>{voice.lines.map((line, index) => <span key={line} className={index === 1 ? "tj-red-word" : undefined}>{line}</span>)}</motion.h2>
    <p className="tj-voice-aside">{voice.aside}</p>
    {beat === 0 && <p className="tj-start-cue"><span aria-hidden="true">↓</span> Scroll. I’ll show you.</p>}
  </motion.section>;
}

const WORK = [
  { line: "I started in finance. At sixteen.", body: "At Alpen Capital, I supported $50M+ in deal flow and learned financial modelling and investment research as the firm’s youngest intern." },
  { line: "Then I started building the tools.", body: "At DataStealth, I built a demo environment spanning eight product capabilities. Setup went from months to hours. Automated competitor research cut research time by about 40%." },
  { line: "Now, I build AI that has a job to do.", body: "At Sagard, I’m rolling out a six-tool Legal AI Hub and extending a local-LLM computer-use agent. As an intern, I cut KYC preparation from weeks to hours." },
  { line: "I like finding other builders, too.", body: "I’m one of five Founding Builder Leads selected across North America: scouting student builders and helping them get started with OpenAI’s developer tools." },
  { line: "And meeting founders early.", body: "As a Pear VC Fellow, I source and evaluate early-stage startups and founder talent. I was one of roughly 50 selected from 650+ applicants across 17 campuses." },
];

export function ExperienceStory({ selected, select, onDirectory }: { selected: number; select: (index: number) => void; onDirectory: () => void }) {
  const current = careerArrivals[selected];
  const copy = WORK[selected];
  return <section className="tj-work-scene" aria-label="Experience">
    <article className="tj-story-copy" data-experience-detail={current.slug}>
      <p className="tj-kicker"><span>01 / CHECK-IN</span><span>EXPERIENCE</span></p>
      <p className="tj-spoken-line">{copy.line}</p>
      <h2>{current.from}</h2>
      <p className="tj-role">{current.detailTitle ?? current.title}<span>{current.origin}</span></p>
      <p className="tj-detail">{copy.body}</p>
      <div className="tj-links"><button onClick={onDirectory}>Full experience <span aria-hidden="true">↗</span></button>{current.fromUrl && <a href={current.fromUrl} target="_blank" rel="noreferrer">{current.from} <span aria-hidden="true">↗</span></a>}</div>
    </article>
    <nav className="tj-selector" aria-label="Choose experience">
      {careerArrivals.map((arrival, index) => <button key={arrival.slug} onClick={() => select(index)} aria-pressed={selected === index}><span>0{index + 1}</span><strong>{arrival.from}</strong><i aria-hidden="true">{selected === index ? "●" : "·"}</i></button>)}
    </nav>
  </section>;
}

const PROJECT_VOICE = [
  { line: "Your GPS could use a better voice.", detail: "So I reverse-engineered Waze’s voice format, wrote an open-source SDK, and made character voice packs install in one tap.", type: "VOICE / OPEN SOURCE" },
  { line: "This one taught me to test my own ideas.", detail: "I built five agents to research stocks. Then a simple momentum baseline beat my LLM ranker. The evaluations became the most useful thing I built.", type: "AI / FINANCE / EVALUATION" },
  { line: "Some things take a lot more than code.", detail: "I run a 1,300+ member student venture community. We’ve placed 30+ students into startups; I also help founders with market research and partner introductions.", type: "COMMUNITY / VENTURE" },
  { line: "Like getting a whole city building.", detail: "I organized Waterloo Tech Week across 70 events, raised $6K+ in sponsorship, and hosted founder conversations. At Hack the North, I designed the application and selection rubric.", type: "COMMUNITY / EVENTS" },
];

export function ProjectStory({ selected, select }: { selected: number; select: (index: number) => void }) {
  const current = projects[selected];
  const copy = PROJECT_VOICE[selected];
  return <section className="tj-work-scene tj-projects" aria-label="Projects">
    <article className="tj-story-copy" data-project-detail={current.slug}>
      <p className="tj-kicker"><span>02 / SECURITY</span><span>PROJECTS</span></p>
      <p className="tj-spoken-line">{copy.line}</p>
      <h2>{current.name}</h2>
      <p className="tj-role">{copy.type}</p>
      <p className="tj-detail">{copy.detail}</p>
      <div className="tj-links">{current.seats.flatMap(seat => seat.links ?? []).map(link => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span></a>)}</div>
    </article>
    <nav className="tj-selector" aria-label="Choose project">{projects.map((project, index) => <button key={project.slug} onClick={() => select(index)} aria-pressed={selected === index}><span>0{index + 1}</span><strong>{["Backseat", "Rocketship", "WVG", "WTW / HTN"][index]}</strong><i aria-hidden="true">{selected === index ? "●" : "·"}</i></button>)}</nav>
  </section>;
}

export function MemoryStory({ t, onGallery }: { t: MotionValue<number>; onGallery: (index?: number) => void }) {
  const subscribe = useCallback((update: () => void) => t.on("change", update), [t]);
  const read = useCallback(() => Math.min(2, Math.max(0, Math.floor((t.get() - .65) / .21 * 3))), [t]);
  const group = useSyncExternalStore(subscribe, read, () => 0);
  const current = memoryGroups[group];
  const photo = memorySequence.find(memory => memory.group === group);
  return <section className="tj-memory-copy" aria-label="Life outside work">
    <p className="tj-kicker">03 / ON THE WAY</p>
    <h2>{current.title}</h2>
    <p>{current.copy}</p>
    <button onClick={() => onGallery(photo?.photoIndex ?? 0)}>Open the camera roll <span>25 photos ↗</span></button>
  </section>;
}
