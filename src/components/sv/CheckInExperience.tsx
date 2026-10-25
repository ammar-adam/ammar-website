"use client";

import { useEffect, useRef } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { useSelection } from "./timeline";
import "./check-in-experience.css";

const EXPERIENCE_ORDER = ["alpen-capital", "datastealth", "sagard", "openai", "pear-vc"];
const WORK: Record<string, { name: string; result: string; detail: string }> = {
  sagard: { name: "Sagard", result: "6 tools. One Legal AI Hub.", detail: "I build AI tools for Legal & Compliance and work on a local-LLM computer-use agent. As an intern, I cut KYC preparation from weeks to hours." },
  openai: { name: "OpenAI", result: "One of five across North America.", detail: "I scout student builders and help grow adoption of OpenAI’s developer tools as a Founding Builder Lead." },
  "pear-vc": { name: "Pear VC", result: "Finding founders early.", detail: "I source and evaluate early-stage startups and founder talent. Selected as one of roughly 50 fellows from 650+ applicants." },
  datastealth: { name: "DataStealth", result: "Demo setup: months → hours.", detail: "I built a demo environment across eight product capabilities and automated competitor research." },
  "alpen-capital": { name: "Alpen Capital", result: "$50M+ in deal flow. At sixteen.", detail: "I supported buy- and sell-side equity advisory, learning financial modelling and investment research as the firm’s youngest intern." },
};
const PHOTO_FRAMING: Record<string, { position: string; fit: "cover" | "contain" }> = {
  "alpen-capital": { position: "40% 68%", fit: "cover" },
  datastealth: { position: "50% 59%", fit: "cover" },
  sagard: { position: "50% 62%", fit: "cover" },
  openai: { position: "50% 50%", fit: "contain" },
  "pear-vc": { position: "50% 50%", fit: "contain" },
};

type CheckInExperienceProps = {
  p: MotionValue<number>;
  reduced: boolean;
  onDirectory: () => void;
};

export function CheckInExperience({ p, reduced, onDirectory }: CheckInExperienceProps) {
  const [selected, select] = useSelection(p, EXPERIENCE_ORDER.length);
  const boardRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const current = arrivals.find((entry) => entry.slug === EXPERIENCE_ORDER[selected])!;
  const copy = WORK[current.slug];
  const framing = PHOTO_FRAMING[current.slug];
  const counter = String(selected + 1).padStart(2, "0");
  const links = current.links ?? (current.fromUrl ? [{ label: copy.name, url: current.fromUrl }] : []);
  const itemP = useTransform(p, (value) => Math.floor(Math.min(.9999, value) * EXPERIENCE_ORDER.length) === selected ? value * EXPERIENCE_ORDER.length - selected : .5);
  const flapTurn = useTransform(itemP, [0, .035, .10, 1], [reduced ? 0 : -78, reduced ? 0 : -32, 0, 0]);
  const flapLight = useTransform(itemP, [0, .10, 1], [reduced ? 1 : .45, 1, 1]);
  const boardY = useTransform(p, [0, .16, 1], [reduced ? 0 : 24, 0, reduced ? 0 : -8]);
  const monitorY = useTransform(itemP, [0, .14, 1], [reduced ? 0 : 12, 0, 0]);

  useEffect(() => {
    const board = boardRef.current;
    const row = board?.querySelector<HTMLButtonElement>(`[data-experience-index="${selected}"]`);
    if (board && row) {
      const top = row.offsetTop;
      const bottom = top + row.offsetHeight;
      if (top < board.scrollTop) board.scrollTop = top;
      else if (bottom > board.scrollTop + board.clientHeight) board.scrollTop = bottom - board.clientHeight;
    }
    if (screenRef.current) screenRef.current.scrollTop = 0;
  }, [selected]);

  return <div className={`ci-scene${reduced ? " ci-reduced" : ""}`}>
    <div className="ci-terminal-shade" aria-hidden="true" />
    <header className="ci-heading">
      <p className="sv-eyebrow">01 / EXPERIENCE</p>
      <h2>A few stops<br /><span>along the way.</span></h2>
    </header>

    <div className="ci-layout">
      <motion.div className="ci-board" style={{ y: boardY }}>
        <div className="ci-board-hangers" aria-hidden="true"><i /><i /></div>
        <div className="ci-board-title"><span className="ci-departure-icon" aria-hidden="true">↗</span><strong>CHECK-IN</strong><span>EXPERIENCE<br /><b>05 STOPS</b></span></div>
        <div className="ci-board-columns" aria-hidden="true"><span>NO.</span><span>WHERE / WHAT I DID</span><span>COUNTER</span></div>
        <div className="ci-board-rows" ref={boardRef} role="group" aria-label="Choose an experience">
          {EXPERIENCE_ORDER.map((slug, index) => {
            const entry = arrivals.find((arrival) => arrival.slug === slug)!;
            const active = selected === index;
            const number = String(index + 1).padStart(2, "0");
            return <button type="button" key={slug} className={`ci-board-row${active ? " is-selected" : ""}`} data-experience-index={index} aria-pressed={active} onClick={() => select(index)} aria-label={`${WORK[slug].name}, ${entry.title}. Select counter ${number}`}>
              <span className="ci-row-number">{number}</span>
              <span className="ci-row-copy"><strong>{WORK[slug].name}</strong><small>{entry.title}</small></span>
              <span className="ci-flap-cell"><motion.span style={active ? { rotateX: flapTurn, opacity: flapLight } : undefined}>{number}</motion.span><i aria-hidden="true" /></span>
            </button>;
          })}
        </div>
        <button type="button" className="ci-full-experience" onClick={onDirectory} aria-label="Open full experience and links"><span>Full experience</span><b aria-hidden="true">↗</b></button>
      </motion.div>

      <article className="ci-counter" data-work-item={selected} aria-label={`${copy.name} experience`}>
        <div className="ci-counter-sign"><span>CHECK-IN<br /><b>{copy.name}</b></span><motion.strong style={{ rotateX: flapTurn }}>{counter}</motion.strong></div>
        <motion.div className="ci-monitor" style={{ y: monitorY }}>
          <div className="ci-monitor-top"><span>AMMAR ADAM</span><span>EXPERIENCE / {counter}</span></div>
          <div className="ci-counter-screen" ref={screenRef}>
            <div className="ci-screen-head">
              <div className="ci-work-image"><img src={current.image} alt={copy.name} width={560} height={747} style={{ objectPosition: framing.position, objectFit: framing.fit }} /><span>{current.origin}</span></div>
              <div className="ci-screen-identity"><strong>{copy.name}</strong><p className="ci-work-role">{current.detailTitle ?? current.title}</p></div>
            </div>
            <div className="ci-screen-copy"><h3 className="ci-work-result">{copy.result}</h3><p className="ci-work-description">{copy.detail}</p><div className="ci-work-links">{links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}<span aria-hidden="true">↗</span></a>)}</div></div>
          </div>
          <div className="ci-monitor-chin" aria-hidden="true"><i /><span>AA</span></div>
        </motion.div>
        <div className="ci-monitor-stem" aria-hidden="true" />
        <div className="ci-desk-top" aria-hidden="true" />
        <div className="ci-desk-fascia" aria-hidden="true"><span>AMMAR ADAM</span><strong>{counter}</strong><i /></div>
      </article>
    </div>
  </div>;
}
