"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { careerArrivals, getArrivalBySlug } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { memoryGroups, memorySequence } from "./memorySequence";
import "./manifest.css";

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
    {beat === 0 && <p className="tj-start-cue"><span aria-hidden="true">↓</span> Scroll to continue</p>}
  </motion.section>;
}

const WORK = [
  { line: "I started in finance.", role: "M&A Summer Analyst", result: "$50M+", label: "in buy- and sell-side deal flow supported.", body: "At 16, I became Alpen’s youngest intern, working in equity advisory and learning financial modelling and investment research." },
  { line: "Then I started building.", role: "Product Engineering Intern", result: "Months → hours", label: "to set up a demo across 8 product capabilities.", body: "I automated competitor comparisons from 10,000-word research documents, cutting product research time by about 40%." },
  { line: "Now, I build AI tools.", role: "AI Engineer (Contract)", result: "Weeks → hours", label: "to prepare a KYC package during my internship.", body: "I now build AI tools for Legal & Compliance at a $46B AUM asset manager: a six-tool Legal AI Hub and Doppel, a local-LLM computer-use agent." },
  { line: "And find other builders.", role: "Founding Builder Lead", result: "1 of 5", label: "Founding Builder Leads selected across North America.", body: "I scout student builders and help them adopt OpenAI’s developer tools." },
  { line: "I’m learning to back them.", role: "Pear VC Fellow", result: "~50 / 650+", label: "fellows selected / applicants across 17 campuses.", body: "I source and evaluate early-stage startups and founder talent as a Pear VC Fellow." },
];

const PROJECT_VOICE = [
  { line: "I gave my GPS a new voice.", role: "Creator · Voice software", result: "43 prompts. One tap.", label: "Character voices you can install in Waze.", body: "I reverse-engineered Waze’s undocumented voice format and built an open-source SDK for text-to-speech, source separation, and round-trip validation." },
  { line: "Then I tested the idea.", role: "Creator · AI & finance", result: "5 agents. Honest evals.", label: "Stock research with live news and portfolio optimization.", body: "I built a five-agent stock debate, then tested it with walk-forward evaluations. A simple momentum baseline beat the LLM ranker and exposed inflated backtests." },
  { line: "I also build communities.", role: "Managing Director", result: "1,300+ members", label: "30+ students placed into startups.", body: "I run Waterloo’s student venture community and support founders with market research and partner introductions, including Smoov’s expansion beyond the US." },
  { line: "And bring people together.", role: "Organizer · Community events", result: "70 events · $6K+", label: "in sponsorship for Waterloo Tech Week.", body: "I ran outreach to 60+ companies and moderated founder conversations. At Hack the North, I designed the application and selection rubric." },
];

type StorySelection = { selected: number; select: (index: number) => void; onOpenChange?: (open: boolean) => void };
type DetailLink = { label: string; url: string };
type DetailContent = { name: string; role: string; location?: string; result: string; body: string; image?: string; links: DetailLink[] };

const WORK_RESULTS = [
  "$50M+ in deal flow supported.",
  "Sales demos: months → hours.",
  "KYC prep: weeks → hours.",
  "1 of 5 leads in North America.",
  "~50 selected from 650+ applicants.",
];
const PROJECT_RESULTS = [
  "43 Waze prompts. One-tap install.",
  "5-agent research. Honest evals.",
  "1,300+ members. 30+ placements.",
  "70 events. $6K+ raised.",
];

function SceneReadout({ kind, selected, select, names, role, result, detail, slug, onOpenChange }: {
  onOpenChange?: (open: boolean) => void; kind: "experience" | "project"; selected: number; select: (index: number) => void;
  names: string[]; role: string; result: string; detail: DetailContent; slug: string;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => { onOpenChange?.(open); return () => onOpenChange?.(false); }, [open, onOpenChange]);
  const section = kind === "experience" ? "experience" : "projects";
  const dialogId = useId();
  return <section className={`mf-scene mf-${section}`} aria-label={section}>
    <div className="mf-panel" data-experience-detail={kind === "experience" ? slug : undefined} data-project-detail={kind === "project" ? slug : undefined}>
      <div className="mf-caption">
      <div className="mf-readout-label"><span>{kind === "experience" ? WORK[selected].line : PROJECT_VOICE[selected].line}</span><span className="mf-item-number">{selected + 1} <i>/ {names.length}</i></span></div>
      <div className="mf-identity">
        <h2 className="mf-sr-only">{detail.name}</h2>
        <select aria-label={`Choose ${kind}`} value={selected} onChange={event => select(Number(event.target.value))}>
          {names.map((name, index) => <option key={name} value={index}>{name}</option>)}
        </select>
        <p className="mf-role">{role}</p>
      </div>
      <p className="mf-result">{result}</p>
      </div>
      <div className="mf-controls">
        <div className="mf-stepper"><button type="button" aria-label={`Previous ${kind}`} disabled={selected === 0} onClick={() => select(selected - 1)}>←</button><button type="button" aria-label={`Next ${kind}`} disabled={selected === names.length - 1} onClick={() => select(selected + 1)}>→</button></div>
        <button type="button" className="mf-details-button" aria-haspopup="dialog" aria-controls={dialogId} onClick={() => setOpen(true)}>Details <span aria-hidden="true">↗</span></button>
        <Link href={`/short#${section}`} className="mf-short-link">Short version <span aria-hidden="true">↗</span></Link>
      </div>
    </div>
    <StoryDetails id={dialogId} open={open} onClose={() => setOpen(false)} item={detail} section={section} />
  </section>;
}

function StoryDetails({ id, open, onClose, item, section }: { id: string; open: boolean; onClose: () => void; item: DetailContent; section: "experience" | "projects" }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!open) { if (element.open) element.close(); return; }
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    element.querySelector(".mf-dialog-scroll")?.scrollTo({ top: 0, behavior: "instant" });
    document.body.style.overflow = "hidden";
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [open]);
  return <dialog ref={dialog} id={id} className="mf-dialog" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }}>
    <header className="mf-dialog-header"><span>{section === "experience" ? "Experience" : "Projects"}</span><button type="button" onClick={onClose} aria-label="Close details">Close <span aria-hidden="true">×</span></button></header>
    <div className="mf-dialog-scroll">
      {item.image && <div className="mf-dialog-image"><Image src={item.image} alt={item.name} fill unoptimized sizes="(max-width: 700px) 90vw, 440px" /></div>}
      <article className="mf-dialog-copy"><h2 id={titleId}>{item.name}</h2><p className="mf-dialog-role">{item.role}{item.location && <span>{item.location}</span>}</p><p className="mf-dialog-result">{item.result}</p><p className="mf-dialog-description">{item.body}</p><nav className="mf-dialog-links" aria-label={`${item.name} links`}>{item.links.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<span aria-hidden="true">↗</span></a>)}</nav></article>
    </div>
    <footer className="mf-dialog-footer"><span>Prefer to read everything together?</span><Link href={`/short#${section}`}>Short version <span aria-hidden="true">↗</span></Link></footer>
  </dialog>;
}

export function ExperienceStory({ selected, select, onOpenChange }: StorySelection) {
  const current = careerArrivals[selected];
  return <SceneReadout onOpenChange={onOpenChange} kind="experience" selected={selected} select={select} names={careerArrivals.map(item => item.from)} role={WORK[selected].role} result={WORK_RESULTS[selected]} slug={current.slug} detail={{ name: current.from, role: current.detailTitle ?? current.title, location: current.origin, result: current.impact, body: current.details, image: current.image, links: current.fromUrl ? [{ label: "Company website", url: current.fromUrl }] : [] }} />;
}

export function ProjectStory({ selected, select, onOpenChange }: StorySelection) {
  const current = projects[selected];
  const community = getArrivalBySlug(current.slug === "waterloo-tech-week" ? "hack-the-north" : current.slug);
  return <SceneReadout onOpenChange={onOpenChange} kind="project" selected={selected} select={select} names={projects.map(item => item.slug === "waterloo-tech-week" ? "Tech Week / HTN" : item.name)} role={PROJECT_VOICE[selected].role} result={PROJECT_RESULTS[selected]} slug={current.slug} detail={{ name: current.name, role: PROJECT_VOICE[selected].role, result: community?.impact ?? current.routeName, body: community?.details ?? current.shortDesc, image: current.screenshot, links: current.seats.flatMap(seat => seat.links ?? []) }} />;
}


export function MemoryStory({ t, onGallery }: { t: MotionValue<number>; onGallery: (index?: number) => void }) {
  const subscribe = useCallback((update: () => void) => t.on("change", update), [t]);
  const read = useCallback(() => Math.min(2, Math.max(0, Math.floor((t.get() - .65) / .21 * 3))), [t]);
  const group = useSyncExternalStore(subscribe, read, () => 0);
  const current = memoryGroups[group];
  const photo = memorySequence.find(memory => memory.group === group);
  return <section className="mf-memory" aria-label="Life outside work">
    <h2>{current.title}</h2>
    <p>{current.copy}</p>
    <button type="button" onClick={() => onGallery(photo?.photoIndex ?? 0)} aria-haspopup="dialog">Camera roll <span>25 photos <i aria-hidden="true">↗</i></span></button>
  </section>;
}
