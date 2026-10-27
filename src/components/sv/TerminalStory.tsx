"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FilmTitle } from "./FilmTitle";
import { CityMuralBackground } from "./CityMuralBackground";
import { careerArrivals, getArrivalBySlug } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { INTRO_COPY, EXPERIENCE_COPY, PROJECT_COPY } from "@/data/filmCopy";
import "./manifest.css";

const BEATS = [0, .055, .175, .24];

export function SpokenIntro({ t, reduced }: { t: MotionValue<number>; reduced: boolean }) {
  const subscribe = useCallback((update: () => void) => t.on("change", update), [t]);
  const read = useCallback(() => Math.min(INTRO_COPY.length - 1, BEATS.slice(1, -1).filter(cut => t.get() >= cut).length), [t]);
  const beat = useSyncExternalStore(subscribe, read, () => 0);
  return <IntroBeat key={beat} t={t} beat={beat} reduced={reduced} />;
}

function IntroBeat({ t, beat, reduced }: { t: MotionValue<number>; beat: number; reduced: boolean }) {
  const voice = INTRO_COPY[beat];
  const local = useTransform(t, [BEATS[beat], BEATS[beat + 1]], [0, 1]);
  const opacity = useTransform(local, [0, .07, .85, 1], [beat === 0 || reduced ? 1 : .15, 1, 1, reduced ? 1 : .1]);
  const y = useTransform(local, [0, 1], [0, 0]);
  return <motion.section className={`tj-intro tj-intro-${beat === 2 ? 3 : beat}`} data-intro-beat={beat} style={{ opacity, y }} aria-label="Introduction">
    {voice.pre && <p className="tj-voice-lead">{voice.pre}</p>}
    {voice.lines.length > 0 && <h2><FilmTitle words={voice.lines} /></h2>}
    <p className="tj-voice-aside">{voice.aside}</p>
    {beat === 0 && <p className="tj-start-cue"><span aria-hidden="true">↓</span> Scroll to continue</p>}
  </motion.section>;
}

type StorySelection = { selected: number; select: (index: number) => void; onOpenChange?: (open: boolean) => void };
type DetailLink = { label: string; url: string };
type DetailContent = { name: string; role: string; location?: string; result: string; body: string; image?: string; links: DetailLink[] };

function SceneReadout({ kind, selected, select, names, role, tag, result, detail, slug, onOpenChange }: {
  onOpenChange?: (open: boolean) => void; kind: "experience" | "project"; selected: number; select: (index: number) => void;
  names: string[]; role: string; tag: string; result: string; detail: DetailContent; slug: string;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => { onOpenChange?.(open); return () => onOpenChange?.(false); }, [open, onOpenChange]);
  const section = kind === "experience" ? "experience" : "projects";
  const dialogId = useId();
  return <section className={`mf-scene mf-${section}`} aria-label={section}>
    <div className="mf-panel" data-experience-detail={kind === "experience" ? slug : undefined} data-project-detail={kind === "project" ? slug : undefined}>
      <div className="mf-caption" key={slug}>
      {tag && <div className="mf-readout-label"><span>{tag}</span></div>}
      <div className="mf-identity">
        <h2 className="mf-sr-only">{detail.name}</h2>
        <select aria-label={`Choose ${kind}`} value={selected} onChange={event => select(Number(event.target.value))}>
          {names.map((name, index) => <option key={name} value={index}>{name}</option>)}
        </select>
        {role && <p className="mf-role">{role}</p>}
      </div>
      <p className="mf-result">{result}</p>
      </div>
      <div className="mf-controls">
        <div className="mf-stepper"><button type="button" aria-label={`Previous ${kind}`} disabled={selected === 0} onClick={() => select(selected - 1)}>←</button><button type="button" aria-label={`Next ${kind}`} disabled={selected === names.length - 1} onClick={() => select(selected + 1)}>→</button></div>
        <button type="button" className="mf-details-button" aria-haspopup="dialog" aria-controls={dialogId} onClick={() => setOpen(true)}>Details <span aria-hidden="true">↗</span></button>
      </div>
    </div>
    <StoryDetails id={dialogId} open={open} onClose={() => setOpen(false)} item={detail} section={section} />
  </section>;
}

function StoryDetails({ id, open, onClose, item, section }: { id: string; open: boolean; onClose: () => void; item: DetailContent; section: "experience" | "projects" }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
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
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);
  return <dialog ref={dialog} id={id} className="mf-dialog" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}
    onKeyDown={event => {
      if (event.key !== "Tab") return;
      const targets = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]')).filter(element => element.getClientRects().length > 0);
      const first = targets[0];
      const last = targets.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
    {open && <CityMuralBackground className="mf-dialog-mural" />}
    <div className="mf-dialog-panel">
      <header className="mf-dialog-header"><span>{section === "experience" ? "Experience" : "Projects"}</span><button ref={closeButton} type="button" onClick={onClose} aria-label="Close details">Close <span aria-hidden="true">×</span></button></header>
      <div className="mf-dialog-scroll">
        {item.image && <div className="mf-dialog-image"><Image src={item.image} alt={item.name} fill unoptimized sizes="(max-width: 700px) 90vw, 440px" /></div>}
        <article className="mf-dialog-copy"><h2 id={titleId}>{item.name}</h2><p className="mf-dialog-role">{item.role}{item.location && <span>{item.location}</span>}</p><p className="mf-dialog-result">{item.result}</p><p className="mf-dialog-description">{item.body}</p><nav className="mf-dialog-links" aria-label={item.name + " links"}>{item.links.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<span aria-hidden="true">↗</span></a>)}</nav></article>
      </div>
      <footer className="mf-dialog-footer"><span>Prefer to read everything together?</span><Link href={"/short#" + (section === "experience" ? "short-work" : "short-projects")}>Short version <span aria-hidden="true">↗</span></Link></footer>
    </div>
  </dialog>;
}

export function ExperienceStory({ selected, select, onOpenChange }: StorySelection) {
  const current = careerArrivals[selected];
  const copy = EXPERIENCE_COPY.find(item => item.slug === current.slug)!;
  return <SceneReadout onOpenChange={onOpenChange} kind="experience" selected={selected} select={select} names={EXPERIENCE_COPY.map(item => item.name)} role={copy.role} tag={copy.tag} result={copy.line} slug={current.slug} detail={{ name: copy.name, role: current.detailTitle ?? current.title, location: current.origin, result: current.impact, body: current.details, image: current.image, links: current.fromUrl ? [{ label: "Company website", url: current.fromUrl }] : [] }} />;
}

export function ProjectStory({ selected, select, onOpenChange }: StorySelection) {
  const current = projects[selected];
  const copy = PROJECT_COPY.find(item => item.slug === current.slug)!;
  const community = getArrivalBySlug(current.slug === "waterloo-tech-week" ? "hack-the-north" : current.slug);
  return <SceneReadout onOpenChange={onOpenChange} kind="project" selected={selected} select={select} names={PROJECT_COPY.map(item => item.name)} role={copy.role} tag={copy.tag} result={copy.line} slug={current.slug} detail={{ name: copy.name, role: community?.detailTitle ?? "Creator", location: community?.origin, result: community?.impact ?? current.routeName, body: community?.details ?? current.shortDesc, image: current.screenshot, links: current.seats.flatMap(seat => seat.links ?? []) }} />;
}
