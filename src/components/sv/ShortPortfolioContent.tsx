"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { SHORT_BIO_LINKS, SHORT_COPY, EXPERIENCE_COPY, PROJECT_COPY, type FilmCardCopy } from "@/data/copy";
import { getArrivalBySlug } from "@/data/arrivals";
import { getProjectBySlug } from "@/data/departures";
import { SocialLinks } from "./SocialLinks";

const experience = ["openai", "sagard", "datastealth", "alpen-capital", "pear-vc"].map(slug => EXPERIENCE_COPY.find(row => row.slug === slug)!);
const built = PROJECT_COPY;

/** Preserve the original inline links/artwork while the prose stays in one data file. */
function BioLine({text}:{text:string}) {
  const parts:ReactNode[]=[];let cursor=0;
  for(const link of SHORT_BIO_LINKS.map(link=>({...link,index:text.indexOf(link.word)})).filter(link=>link.index>=0).sort((a,b)=>a.index-b.index)){
    parts.push(text.slice(cursor,link.index));parts.push(<span className="short-brand-phrase" key={link.kind}>{link.word} <a className="short-brand-link" href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} title={link.label}><Image className={`short-brand short-brand-${link.kind}`} src={link.image} alt="" width={link.width} height={link.height} unoptimized /></a></span>);cursor=link.index+link.word.length;
  }
  parts.push(text.slice(cursor));return <>{parts}</>;
}

function EntryList({ rows, kind }: { rows: readonly FilmCardCopy[]; kind: "experience" | "built" }) {
  return <ul className="short-entries" role="list">
    {rows.map(row => {
      const href = kind === "experience"
        ? getArrivalBySlug(row.slug)?.fromUrl
        : getProjectBySlug(row.slug)?.seats.flatMap(seat => seat.links ?? [])[0]?.url;
      return <li className="short-entry" key={row.slug} data-short-role={kind === "experience" ? row.slug : undefined} data-short-project={kind === "built" ? row.slug : undefined}>
        <div className="short-entry-heading">
          <h3><a href={href} target="_blank" rel="noopener noreferrer">{row.name}</a></h3>
          <p className="short-row-role">{row.role}</p>
        </div>
        <p className="short-row-line">{row.desc}</p>
      </li>;
    })}
  </ul>;
}

export function ShortPortfolioContent({ idPrefix = "short" }: { idPrefix?: string }) {
  return <>
    <header className="short-header" id={`${idPrefix}-about`} tabIndex={-1}>
      <h1>{SHORT_COPY.name}</h1>
      <div className="short-introduction">
        <p><BioLine text={SHORT_COPY.bio} /></p>
        <p className="short-personal"><BioLine text={SHORT_COPY.personal} /></p>
      </div>
      <nav className="short-socials" aria-label="Profile links">
        <SocialLinks />
        <a className="short-resume" href="/Ammar_Adam.pdf" target="_blank" rel="noopener noreferrer">{SHORT_COPY.resume}</a>
      </nav>
    </header>
    <div className="short-columns">
      <section className="short-section" id={`${idPrefix}-work`} aria-labelledby={`${idPrefix}-work-title`}>
        <h2 id={`${idPrefix}-work-title`}>{SHORT_COPY.experience}</h2>
        <EntryList rows={experience} kind="experience" />
      </section>
      <section className="short-section" id={`${idPrefix}-projects`} aria-labelledby={`${idPrefix}-projects-title`}>
        <h2 id={`${idPrefix}-projects-title`}>{SHORT_COPY.built}</h2>
        <EntryList rows={built} kind="built" />
      </section>
    </div>
    <footer className="short-footer"><Link href="/"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false"><path d="M16 10H4m5-5-5 5 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>{SHORT_COPY.back}</Link></footer>
  </>;
}
