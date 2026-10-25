"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
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
  { line: "I started in finance.", result: "$50M+", label: "in deal flow supported", body: "At sixteen, I was Alpen’s youngest intern. I worked on buy- and sell-side equity advisory, learning financial modelling and investment research." },
  { line: "Then I started building the tools.", result: "Months → hours", label: "to set up a product demo", body: "I built a demo environment covering eight product capabilities. I also automated competitor comparisons, cutting product research time by about 40%." },
  { line: "I like AI that has a job to do.", result: "Weeks → hours", label: "to prepare a KYC package", body: "Now I’m rolling out a six-tool Legal AI Hub and extending a local-LLM computer-use agent for the Legal & Compliance team." },
  { line: "And finding other people who build.", result: "1 of 5", label: "Founding Builder Leads in North America", body: "I scout student builders and help them get started with OpenAI’s developer tools. A good idea gets a lot further with the right people around it." },
  { line: "Sometimes, before they’ve even started.", result: "~50 / 650+", label: "fellows selected / applicants", body: "At Pear, I source and evaluate early-stage startups and founder talent as part of a fellowship spanning 17 campuses." },
];

function ItemControls({ kind, labels, selected, select }: { kind: "experience" | "project"; labels: string[]; selected: number; select: (index: number) => void }) {
  return <div className="tj-item-controls">
    <label className="tj-item-select"><span>Choose {kind === "experience" ? "a role" : "a project"}</span>
      <select aria-label={`Choose ${kind}`} value={selected} onChange={event => select(Number(event.target.value))}>
        {labels.map((label, index) => <option key={label} value={index}>{label}</option>)}
      </select>
    </label>
    <nav className="tj-item-pager" aria-label={`Browse ${kind === "experience" ? "experience" : "projects"}`}>
      <button aria-label={`Previous ${kind}`} disabled={selected === 0} onClick={() => select(selected - 1)}>←</button>
      <span aria-label={`${selected + 1} of ${labels.length}`}>{String(selected + 1).padStart(2, "0")}<i>/</i>{String(labels.length).padStart(2, "0")}</span>
      <button aria-label={`Next ${kind}`} disabled={selected === labels.length - 1} onClick={() => select(selected + 1)}>→</button>
    </nav>
  </div>;
}

export function ExperienceStory({ selected, select, onDirectory }: { selected: number; select: (index: number) => void; onDirectory: () => void }) {
  const reader = useRef<HTMLDivElement>(null);
  useEffect(() => { if (reader.current) reader.current.scrollTop = 0; }, [selected]);
  const current = careerArrivals[selected];
  const copy = WORK[selected];
  return <section className="tj-work-scene" aria-label="Experience">
    <div className="tj-reader" ref={reader}>
      <p className="tj-kicker"><span>01 / CHECK-IN</span><span>EXPERIENCE</span></p>
      <ItemControls kind="experience" labels={careerArrivals.map(arrival => arrival.from)} selected={selected} select={select} />
      <article className="tj-story-copy" data-experience-detail={current.slug}>
        <p className="tj-spoken-line">{copy.line}</p>
        <h2>{current.from}</h2>
        <p className="tj-role">{current.detailTitle ?? current.title}<span>{current.origin}</span></p>
        <p className="tj-result"><strong>{copy.result}</strong><span>{copy.label}</span></p>
        <p className="tj-detail">{copy.body}</p>
        <div className="tj-links"><button onClick={onDirectory} aria-haspopup="dialog">Read all experience <span aria-hidden="true">≡</span></button>{current.fromUrl && <a href={current.fromUrl} target="_blank" rel="noreferrer">Company website <span aria-hidden="true">↗</span></a>}</div>
      </article>
      <p className="tj-browse-hint">Scroll to continue, or choose any role above.</p>
    </div>
  </section>;
}

const PROJECT_VOICE = [
  { line: "Your GPS could use a better voice.", result: "43 prompts. One tap.", label: "Character voices, straight into Waze", detail: "I reverse-engineered Waze’s undocumented voice format, wrote an open-source SDK, and built a way to install character voice packs in one tap.", type: "SOFTWARE / VOICE" },
  { line: "This one made me question my own idea.", result: "5 agents. Real tests.", label: "A stock-research system with honest evaluations", detail: "I built five agents to debate stocks. Then a simple momentum baseline beat my LLM ranker. The evaluations became the most useful thing I built.", type: "SOFTWARE / AI & FINANCE" },
  { line: "Some projects are made of people.", result: "1,300+ members", label: "30+ students placed into startups", detail: "I run Waterloo’s student venture community. Alongside connecting builders, I help founders with market research and partner introductions.", type: "COMMUNITY / VENTURE" },
  { line: "And sometimes, a whole city shows up.", result: "70 events", label: "$6K+ raised in sponsorship", detail: "I organized Waterloo Tech Week and hosted founder conversations. At Hack the North, I designed the application and selection rubric.", type: "COMMUNITY / EVENTS" },
];

export function ProjectStory({ selected, select, onDirectory }: { selected: number; select: (index: number) => void; onDirectory: () => void }) {
  const reader = useRef<HTMLDivElement>(null);
  useEffect(() => { if (reader.current) reader.current.scrollTop = 0; }, [selected]);
  const current = projects[selected];
  const copy = PROJECT_VOICE[selected];
  return <section className="tj-work-scene tj-projects" aria-label="Projects">
    <div className="tj-reader" ref={reader}>
      <p className="tj-kicker"><span>02 / SECURITY</span><span>PROJECTS</span></p>
      <ItemControls kind="project" labels={projects.map(project => project.name)} selected={selected} select={select} />
      <article className="tj-story-copy" data-project-detail={current.slug}>
        <p className="tj-spoken-line">{copy.line}</p>
        <h2>{current.name}</h2>
        <p className="tj-role">{copy.type}</p>
        <p className="tj-result"><strong>{copy.result}</strong><span>{copy.label}</span></p>
        <p className="tj-detail">{copy.detail}</p>
        <div className="tj-links">{current.seats.flatMap(seat => seat.links ?? []).slice(0, 2).map(link => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span></a>)}<button onClick={onDirectory} aria-haspopup="dialog">All details <span aria-hidden="true">≡</span></button></div>
      </article>
      <p className="tj-browse-hint">Scroll to continue, or choose any project above.</p>
    </div>
  </section>;
}

export function MemoryStory({ t, onGallery }: { t: MotionValue<number>; onGallery: (index?: number) => void }) {
  const subscribe = useCallback((update: () => void) => t.on("change", update), [t]);
  const read = useCallback(() => Math.min(2, Math.max(0, Math.floor((t.get() - .65) / .21 * 3))), [t]);
  const group = useSyncExternalStore(subscribe, read, () => 0);
  const current = memoryGroups[group];
  const photo = memorySequence.find(memory => memory.group === group);
  return <section className="tj-memory-copy" aria-label="Life outside work">
    <p className="tj-kicker">03 / CONCOURSE A</p>
    <h2>{current.title}</h2>
    <p>{current.copy}</p>
    <button onClick={() => onGallery(photo?.photoIndex ?? 0)} aria-haspopup="dialog">View all 25 photos <span aria-hidden="true">↗</span></button>
    <small>Tap a photograph to take a closer look.</small>
  </section>;
}
