"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { careerArrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { siteConfig } from "@/data/site";
import { SocialLinks } from "./SocialLinks";

const roleOrder = ["pear-vc", "openai", "sagard", "datastealth", "alpen-capital"];
const roles = roleOrder.map(slug => careerArrivals.find(role => role.slug === slug)!);
const roleStories: Record<string, string> = {
  sagard: "Building a six-tool Legal AI Hub and extending Doppel, a local-LLM computer-use agent, at a $46B AUM asset manager. Earlier, I cut KYC preparation from weeks to hours.",
  openai: "One of five Founding Builder Leads selected across North America. I scout student builders and help them use OpenAI’s developer tools.",
  "pear-vc": "One of ~50 fellows selected from 650+ applicants across 17 campuses. I source and evaluate early-stage startups and founder talent.",
  datastealth: "I built demos across eight product capabilities, cutting setup from months to hours. Automating competitor comparisons cut product research time by ~40%.",
  "alpen-capital": "Alpen’s youngest intern at 16. I supported $50M+ in buy- and sell-side equity advisory while learning financial modelling and investment research.",
};
const projectStories: Record<string, string> = {
  backseat: "Character voices for Waze, installed in one tap. I reverse-engineered Waze’s undocumented format and built an open-source SDK covering all 43 prompts.",
  rocketship: "Five-agent equity research, live news and portfolio optimization. Walk-forward testing showed a simple momentum baseline beat the LLM ranker, exposing inflated backtests.",
  "waterloo-venture": "I run a 1,300+ member student venture community that has placed 30+ students into startups. I also help founders with research and partner introductions.",
  "waterloo-tech-week": "I organized Waterloo Tech Week across 70 events and raised $6K+ in sponsorship. At Hack the North, I designed the application and selection rubric.",
};

export function ShortPortfolioContent({ idPrefix, onReturn }: { idPrefix: string; onReturn?: () => void }) {
  const id = (name: string) => `${idPrefix}-${name}`;
  function jump(event: MouseEvent<HTMLAnchorElement>, name: string) {
    event.preventDefault();
    const target = document.getElementById(id(name));
    target?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    target?.focus({ preventScroll: true });
  }

  return <div className="sp-reading">
    <nav className="sp-jump" aria-label="Short version sections">
      <a href={`#${id("about")}`} onClick={event => jump(event, "about")}>About</a>
      <a href={`#${id("work")}`} onClick={event => jump(event, "work")}>Work <span>05</span></a>
      <a href={`#${id("projects")}`} onClick={event => jump(event, "projects")}>Projects <span>04</span></a>
      <a href={`#${id("contact")}`} onClick={event => jump(event, "contact")}>Contact</a>
    </nav>

    <div className="sp-paper">
      <section className="sp-intro" id={id("about")} tabIndex={-1} aria-labelledby={id("name")}>
        <p className="sp-kicker">CS & Finance · University of Waterloo</p>
        <h1 id={id("name")}>Ammar <span>Adam<span className="sp-name-period">.</span></span></h1>
        <div className="sp-bio">
          <p>I’m studying Computer Science & Finance at Waterloo. Right now, I’m building AI tools at <a href="https://www.sagard.com/" target="_blank" rel="noopener noreferrer">Sagard</a> and working with student builders at <a href="https://openai.com/" target="_blank" rel="noopener noreferrer">OpenAI</a>.</p>
          <p>I also make things I’m curious about, from character voices in Waze to whether five AI agents are any good at picking stocks. Outside that, I spend a lot of time bringing people together.</p>
        </div>
        <div className="sp-intro-links"><a href="/Ammar_Adam.pdf" target="_blank" rel="noopener noreferrer">Read my résumé <span aria-hidden="true">↗</span></a><a href={siteConfig.socialLinks.email}>Say hello <span aria-hidden="true">↗</span></a></div>
      </section>

      <section className="sp-section" id={id("work")} tabIndex={-1} aria-labelledby={id("work-title")}>
        <div className="sp-section-heading"><span aria-hidden="true">01</span><h2 id={id("work-title")}>Where I’ve worked</h2></div>
        <ul className="sp-entries">{roles.map(role => <li key={role.slug} data-short-role={role.slug}>
          <div className="sp-entry-title"><h3><a href={role.fromUrl} target="_blank" rel="noopener noreferrer">{role.from}<span aria-hidden="true">↗</span></a></h3><span className="sp-location">{role.origin}</span></div>
          <p className="sp-role">{role.detailTitle ?? role.title}</p>
          <p className="sp-description">{roleStories[role.slug] ?? `${role.impact} ${role.details}`}</p>
        </li>)}</ul>
      </section>

      <section className="sp-section" id={id("projects")} tabIndex={-1} aria-labelledby={id("projects-title")}>
        <div className="sp-section-heading"><span aria-hidden="true">02</span><h2 id={id("projects-title")}>Things I’m building</h2></div>
        <ul className="sp-entries">{projects.map(project => {
          const links = project.seats.flatMap(seat => seat.links ?? []);
          return <li key={project.slug} data-short-project={project.slug}>
            <div className="sp-entry-title"><h3><a href={links[0]?.url} target="_blank" rel="noopener noreferrer">{project.name}<span aria-hidden="true">↗</span></a></h3>{project.year && <span className="sp-location">{project.year}</span>}</div>
            <p className="sp-description">{projectStories[project.slug] ?? project.shortDesc}</p>
            {links.length > 1 && <div className="sp-project-links">{links.slice(1).map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<span aria-hidden="true">↗</span></a>)}</div>}
          </li>;
        })}</ul>
      </section>

      <footer className="sp-contact" id={id("contact")} tabIndex={-1} aria-labelledby={id("contact-title")}>
        <p className="sp-kicker">Keep in touch</p>
        <h2 id={id("contact-title")}>Something catch your eye?</h2>
        <a className="sp-email" href={siteConfig.socialLinks.email}>Let’s talk <span aria-hidden="true">↗</span></a>
        <div className="sp-signoff"><SocialLinks />{onReturn ? <button type="button" onClick={onReturn}>Back to the terminal <span aria-hidden="true">↗</span></button> : <Link href="/">Back to the terminal <span aria-hidden="true">↗</span></Link>}</div>
      </footer>
    </div>
  </div>;
}
