"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment, type ReactNode } from "react";
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
    parts.push(text.slice(cursor,link.index));parts.push(<span className="short-brand-phrase" key={link.kind}>{link.word} <a className="short-bio-link" href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} title={link.label}><Image className={`short-brand short-brand-${link.kind}`} src={link.image} alt="" width={link.width} height={link.height} unoptimized /></a></span>);cursor=link.index+link.word.length;
  }
  parts.push(text.slice(cursor));return <>{parts}</>;
}

function ExternalArrow() {
  return <svg className="short-external-arrow" width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function EntryList({ rows, kind }: { rows: readonly FilmCardCopy[]; kind: "experience" | "built" }) {
  return <ul className="short-entries" role="list">
    {rows.map(row => {
      const projectLinks = kind === "built" ? getProjectBySlug(row.slug)?.seats.flatMap(seat => seat.links ?? []) ?? [] : [];
      const href = kind === "experience" ? getArrivalBySlug(row.slug)?.fromUrl : projectLinks[0]?.url;
      const combined = row.slug === "waterloo-tech-week";
      const titles = combined ? row.name.split(" / ").map((name,index) => ({name,href:projectLinks[index]?.url})) : [{name:row.name,href}];
      const secondary = projectLinks.slice(combined ? 2 : 1);
      return <li className="short-entry" key={row.slug} data-short-role={kind === "experience" ? row.slug : undefined} data-short-project={kind === "built" ? row.slug : undefined}>
        <div className="short-entry-heading">
          <h3>{titles.map((title,index) => <Fragment key={title.name}>{index > 0 && <span className="short-title-divider"> / </span>}<a href={title.href} target="_blank" rel="noopener noreferrer">{title.name}<ExternalArrow /></a></Fragment>)}</h3>
          <p className="short-row-role">{row.role}</p>
        </div>
        <p className="short-row-line">{row.desc}</p>
        {secondary.length > 0 && <nav className="short-entry-links" aria-label={`${row.name} links`}>{secondary.map(link => <a href={link.url} key={link.url} target="_blank" rel="noopener noreferrer">{link.label}<ExternalArrow /></a>)}</nav>}
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
        <a className="short-resume" href="/Ammar_Adam.pdf" target="_blank" rel="noopener noreferrer">{SHORT_COPY.resume}<ExternalArrow /></a>
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
