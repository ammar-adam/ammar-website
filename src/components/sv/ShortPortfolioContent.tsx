"use client";

import Link from "next/link";
import { getArrivalBySlug } from "@/data/arrivals";
import { getProjectBySlug } from "@/data/departures";
import { siteConfig } from "@/data/site";

type ShortRow = { slug: string; place: string; role: string; line: string; secondary?: boolean };

const experience: ShortRow[] = [
  { slug: "openai", place: "OpenAI", role: "Founding Builder Lead", line: "I find student builders and help them ship." },
  { slug: "sagard", place: "Sagard", role: "AI Engineer", line: "AI tools for the legal and compliance team." },
  { slug: "datastealth", place: "DataStealth", role: "Product Engineering Intern", line: "Built product demos and automated competitor research." },
  { slug: "alpen-capital", place: "Alpen Capital", role: "M&A Summer Analyst", line: "The firm's youngest intern, in Dubai at sixteen." },
  { slug: "pear-vc", place: "Pear VC", role: "Fellow", line: "Scouting early-stage founders.", secondary: true },
];

const built: ShortRow[] = [
  { slug: "backseat", place: "Backseat", role: "Creator", line: "Character voices for Waze, installed in one tap." },
  { slug: "rocketship", place: "RocketShip", role: "Creator", line: "AI equity research with honest evals." },
  { slug: "waterloo-venture", place: "Waterloo Venture Group", role: "Managing Director", line: "Waterloo's student venture community." },
  { slug: "waterloo-tech-week", place: "Waterloo Tech Week / Hack the North", role: "Organizer", line: "Ran Tech Week; helped run Hack the North." },
];

function RowTable({ rows, titleId, kind }: { rows: ShortRow[]; titleId: string; kind: "experience" | "built" }) {
  return <table className="short-board" aria-labelledby={titleId}>
    <colgroup><col className="short-place-column" /><col className="short-role-column" /><col /></colgroup>
    <thead><tr><th scope="col">Place</th><th scope="col">Role</th><th scope="col">One sentence</th></tr></thead>
    <tbody>{rows.map(row => {
      const href = kind === "experience"
        ? getArrivalBySlug(row.slug)?.fromUrl
        : getProjectBySlug(row.slug)?.seats.flatMap(seat => seat.links ?? [])[0]?.url;
      return <tr key={row.slug} data-short-role={kind === "experience" ? row.slug : undefined} data-short-project={kind === "built" ? row.slug : undefined} data-secondary={row.secondary || undefined}>
        <th scope="row"><a href={href} target="_blank" rel="noopener noreferrer">{row.place}</a></th>
        <td className="short-row-role">{row.role}</td>
        <td className="short-row-line">{row.line}</td>
      </tr>;
    })}</tbody>
  </table>;
}

export function ShortPortfolioContent({ idPrefix = "short" }: { idPrefix?: string }) {
  return <>
    <header className="short-header" id={`${idPrefix}-about`} tabIndex={-1}>
      <h1>Ammar Adam</h1>
      <p>CS &amp; Finance at Waterloo. I build things and find the people who build them.</p>
      <nav className="short-socials" aria-label="Social and contact links">
        <a href={siteConfig.socialLinks.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href={siteConfig.socialLinks.x} target="_blank" rel="noopener noreferrer">X</a>
        <a href={siteConfig.socialLinks.email}>Email</a>
        <a href="/Ammar_Adam.pdf" target="_blank" rel="noopener noreferrer">Résumé</a>
      </nav>
    </header>
    <section className="short-section" id={`${idPrefix}-work`} aria-labelledby={`${idPrefix}-work-title`}>
      <h2 id={`${idPrefix}-work-title`}>Experience</h2>
      <RowTable rows={experience} titleId={`${idPrefix}-work-title`} kind="experience" />
    </section>
    <section className="short-section" id={`${idPrefix}-projects`} aria-labelledby={`${idPrefix}-projects-title`}>
      <h2 id={`${idPrefix}-projects-title`}>Built</h2>
      <RowTable rows={built} titleId={`${idPrefix}-projects-title`} kind="built" />
    </section>
    <footer className="short-footer"><Link href="/">Back to the terminal</Link></footer>
  </>;
}
