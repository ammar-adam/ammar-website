"use client";

import Link from "next/link";
import { getArrivalBySlug } from "@/data/arrivals";
import { getProjectBySlug } from "@/data/departures";
import { SocialLinks } from "./SocialLinks";

type ShortRow = { slug: string; place: string; role: string; line: string; secondary?: boolean };

const experience: ShortRow[] = [
  { slug: "openai", place: "OpenAI", role: "Founding Builder Lead", line: "I find student builders and help them ship." },
  { slug: "sagard", place: "Sagard", role: "AI Engineer", line: "I build AI tools for legal and compliance." },
  { slug: "datastealth", place: "DataStealth", role: "Product Engineering Intern", line: "I built product demos and automated competitor research." },
  { slug: "alpen-capital", place: "Alpen Capital", role: "M&A Summer Analyst", line: "I joined at sixteen as the firm's youngest intern." },
  { slug: "pear-vc", place: "Pear VC", role: "Fellow", line: "I scout and support early-stage founders.", secondary: true },
];

const built: ShortRow[] = [
  { slug: "backseat", place: "Backseat", role: "Creator", line: "I made character voices you can add to Waze in one tap." },
  { slug: "rocketship", place: "RocketShip", role: "Creator", line: "I built an AI research tool and tested its stock picks." },
  { slug: "waterloo-venture", place: "Waterloo Venture Group", role: "Managing Director", line: "I run Waterloo's student venture community." },
  { slug: "waterloo-tech-week", place: "Waterloo Tech Week / Hack the North", role: "Organizer", line: "I organized Tech Week and helped run Hack the North." },
];

function RowTable({ rows, titleId, kind }: { rows: ShortRow[]; titleId: string; kind: "experience" | "built" }) {
  return <table className="short-board" aria-labelledby={titleId}>
    <colgroup><col className="short-place-column" /><col className="short-role-column" /><col /></colgroup>
    <thead><tr><th scope="col">Place</th><th scope="col">Role</th><th scope="col">What I did</th></tr></thead>
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
      <p>I study CS + Finance at Waterloo. I build software and bring people together.</p>
      <nav className="short-socials" aria-label="Profile links">
        <SocialLinks />
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
