"use client";

import Link from "next/link";
import { careerArrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { siteConfig } from "@/data/site";

const roles = [...careerArrivals].reverse();
const roleStories: Record<string, string> = {
  sagard: "Building a six-tool Legal AI Hub and extending Doppel, a local-LLM computer-use agent, at a $46B AUM asset manager. Earlier, I cut KYC preparation from weeks to hours.",
  openai: "One of five Founding Builder Leads selected across North America. I scout student builders and help them use OpenAI’s developer tools.",
  "pear-vc": "I source and evaluate early-stage startups and founder talent.",
  datastealth: "I built demos across eight product capabilities, cutting setup from months to hours. Automating competitor comparisons cut product research time by ~40%.",
  "alpen-capital": "Alpen’s youngest intern at 16. I supported $50M+ in buy- and sell-side equity advisory while learning financial modelling and investment research.",
};
const projectStories: Record<string, string> = {
  backseat: "Character voices for Waze, installed in one tap. I reverse-engineered Waze’s undocumented format and built an open-source SDK covering all 43 prompts.",
  rocketship: "Five-agent equity research, live news and portfolio optimization. Walk-forward testing showed a simple momentum baseline beat the LLM ranker, exposing inflated backtests.",
  "waterloo-venture": "I run a 1,300+ member student venture community that has placed 30+ students into startups. WVG has helped founders raise $13.9M. I also help founders with research and partner introductions.",
  "waterloo-tech-week": "I organized Waterloo Tech Week across 70 events and raised $6K+ in sponsorship.",
};

export function ShortPortfolioContent({ idPrefix = "short" }: { idPrefix?: string }) {
  return <>
    <header className="short-header">
      <h1>Ammar Adam</h1>
      <nav aria-label="On this page"><a href={`#${idPrefix}-work`}>Work</a><a href={`#${idPrefix}-projects`}>Projects</a><a href="/Ammar_Adam.pdf" target="_blank" rel="noopener noreferrer">Résumé <span aria-hidden="true">↗</span></a></nav>
    </header>

    <section className="short-intro" id={`${idPrefix}-about`} tabIndex={-1} aria-label="About Ammar">
      <p>I’m studying Computer Science & Finance at Waterloo. Right now, I’m building AI tools at <a href="https://www.sagard.com/" target="_blank" rel="noopener noreferrer">Sagard</a> and working with student builders at <a href="https://openai.com/" target="_blank" rel="noopener noreferrer">OpenAI</a>.</p>
      <p>I also make things I’m curious about, from character voices in Waze to whether five AI agents are any good at picking stocks. Outside that, I spend a lot of time bringing people together.</p>
      <div className="short-socials" aria-label="Social and contact links"><a href={siteConfig.socialLinks.github} target="_blank" rel="noopener noreferrer">GitHub</a><a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a><a href={siteConfig.socialLinks.x} target="_blank" rel="noopener noreferrer">X</a><a href={siteConfig.socialLinks.email}>Email</a></div>
    </section>

    <section className="short-section" id={`${idPrefix}-work`} aria-labelledby={`${idPrefix}-work-title`}>
      <h2 id={`${idPrefix}-work-title`}>Work</h2>
      <ul className="short-entries">{roles.map(role => <li key={role.slug} data-short-role={role.slug}>
        <div className="short-entry-meta"><h3><a href={role.fromUrl} target="_blank" rel="noopener noreferrer">{role.from}<span aria-hidden="true">↗</span></a></h3><p>{role.detailTitle ?? role.title}</p><span className="short-location">{role.origin}</span></div>
        <p className="short-description">{roleStories[role.slug] ?? `${role.impact} ${role.details}`}</p>
      </li>)}</ul>
    </section>

    <section className="short-section" id={`${idPrefix}-projects`} aria-labelledby={`${idPrefix}-projects-title`}>
      <h2 id={`${idPrefix}-projects-title`}>Projects & community</h2>
      <ul className="short-entries">{projects.map(project => {
        const links = project.seats.flatMap(seat => seat.links ?? []);
        return <li key={project.slug} data-short-project={project.slug}>
          <div className="short-entry-meta"><h3><a href={links[0]?.url} target="_blank" rel="noopener noreferrer">{project.name}<span aria-hidden="true">↗</span></a></h3>{project.year && <span className="short-location">{project.year}</span>}</div>
          <div><p className="short-description">{projectStories[project.slug] ?? project.shortDesc}</p>{links.length > 1 && <div className="short-project-links">{links.slice(1).map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<span aria-hidden="true">↗</span></a>)}</div>}</div>
        </li>;
      })}</ul>
    </section>

    <footer className="short-footer">
      <p>If something here caught your eye, <a href={siteConfig.socialLinks.email}>say hello</a>.</p>
      <Link href="/">Back to the terminal <span aria-hidden="true">↗</span></Link>
    </footer>
  </>;
}
