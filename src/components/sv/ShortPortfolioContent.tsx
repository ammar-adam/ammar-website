"use client";

import Link from "next/link";
import Image from "next/image";
import { getArrivalBySlug } from "@/data/arrivals";
import { getProjectBySlug } from "@/data/departures";
import { SocialLinks } from "./SocialLinks";

type ShortRow = { slug: string; place: string; role: string; line: string };

const experience: ShortRow[] = [
  { slug: "openai", place: "OpenAI", role: "Founding Builder Lead", line: "I find student builders and help them ship." },
  { slug: "sagard", place: "Sagard", role: "AI Engineer", line: "I build AI tools for legal and compliance." },
  { slug: "datastealth", place: "DataStealth", role: "Product Engineering Intern", line: "I built product demos and automated competitor research." },
  { slug: "alpen-capital", place: "Alpen Capital", role: "M&A Summer Analyst", line: "I joined at sixteen as the firm's youngest intern." },
  { slug: "pear-vc", place: "Pear VC", role: "Fellow", line: "I scout and support early-stage founders." },
];

const built: ShortRow[] = [
  { slug: "backseat", place: "Backseat", role: "Creator", line: "I made character voices you can add to Waze in one tap." },
  { slug: "rocketship", place: "RocketShip", role: "Creator", line: "I built an AI research tool and tested its stock picks." },
  { slug: "waterloo-venture", place: "Waterloo Venture Group", role: "Managing Director", line: "I run Waterloo's student venture community." },
  { slug: "waterloo-tech-week", place: "Waterloo Tech Week / Hack the North", role: "Organizer", line: "I organized Tech Week and helped run Hack the North." },
];

function EntryList({ rows, kind }: { rows: ShortRow[]; kind: "experience" | "built" }) {
  return <ul className="short-entries" role="list">
    {rows.map(row => {
      const lastWord = row.place.lastIndexOf(" ") + 1;
      const href = kind === "experience"
        ? getArrivalBySlug(row.slug)?.fromUrl
        : getProjectBySlug(row.slug)?.seats.flatMap(seat => seat.links ?? [])[0]?.url;
      return <li className="short-entry" key={row.slug} data-short-role={kind === "experience" ? row.slug : undefined} data-short-project={kind === "built" ? row.slug : undefined}>
        <div className="short-entry-heading">
          <h3><a href={href} target="_blank" rel="noopener noreferrer">{row.place.slice(0, lastWord)}<span className="short-title-end">{row.place.slice(lastWord)}<span aria-hidden="true" className="short-external">↗</span></span></a></h3>
          <p className="short-row-role">{row.role}</p>
        </div>
        <p className="short-row-line">{row.line}</p>
      </li>;
    })}
  </ul>;
}

export function ShortPortfolioContent({ idPrefix = "short" }: { idPrefix?: string }) {
  return <>
    <header className="short-header" id={`${idPrefix}-about`} tabIndex={-1}>
      <h1>Ammar Adam</h1>
      <nav className="short-socials" aria-label="Profile links">
        <SocialLinks />
        <a className="short-resume" href="/Ammar_Adam.pdf" target="_blank" rel="noopener noreferrer">Résumé <span aria-hidden="true">↗</span></a>
      </nav>
      <div className="short-introduction">
        <p>I study CS + Finance at <span className="short-brand-phrase">Waterloo <a className="short-brand-link" href="https://uwaterloo.ca/" target="_blank" rel="noopener noreferrer" aria-label="University of Waterloo" title="University of Waterloo"><Image className="short-brand short-brand-waterloo" src="/art/waterloo-official.png" alt="" width={164} height={189} unoptimized /></a></span>.</p>
        <p className="short-personal">I build software and bring people together. I love cooking + <span className="short-brand-phrase">eating food <a className="short-brand-link" href="https://beliapp.com/" target="_blank" rel="noopener noreferrer" aria-label="Beli" title="Beli"><Image className="short-brand short-brand-beli" src="/art/beli-official.png" alt="" width={300} height={300} unoptimized /></a></span>, <span className="short-brand-phrase">playing soccer <a className="short-brand-link" href="https://www.liverpoolfc.com/" target="_blank" rel="noopener noreferrer" aria-label="Liverpool FC" title="Liverpool FC"><Image className="short-brand short-brand-liverpool" src="/art/liverpool-official.png" alt="" width={136} height={244} unoptimized /></a></span>, and trying new things!</p>
      </div>
    </header>
    <div className="short-columns">
      <section className="short-section" id={`${idPrefix}-work`} aria-labelledby={`${idPrefix}-work-title`}>
        <h2 id={`${idPrefix}-work-title`}>Experience</h2>
        <EntryList rows={experience} kind="experience" />
      </section>
      <section className="short-section" id={`${idPrefix}-projects`} aria-labelledby={`${idPrefix}-projects-title`}>
        <h2 id={`${idPrefix}-projects-title`}>Built</h2>
        <EntryList rows={built} kind="built" />
      </section>
    </div>
    <footer className="short-footer"><Link href="/"><span aria-hidden="true">←</span> Back to the terminal</Link></footer>
  </>;
}
