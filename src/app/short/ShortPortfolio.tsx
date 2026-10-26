"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { careerArrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { loungeRoomContent } from "@/data/loungeRoom";
import { siteConfig } from "@/data/site";
import { PhotoGallery } from "@/components/sv/PhotoGallery";
import { SocialLinks } from "@/components/sv/SocialLinks";

const photos = loungeRoomContent.photos.items;
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

export default function ShortPortfolio() {
  const [photo, setPhoto] = useState<number | null>(null);

  return (
    <div className="short-page">
      <a href="#short-main" className="short-skip">Skip to content</a>
      <div className="short-wrap">
        <header className="short-header">
          <Link href="/" className="short-mark" aria-label="Ammar Adam — back to the film">a/a</Link>
          <SocialLinks />
        </header>

        <main id="short-main">
          <section className="short-intro" aria-labelledby="short-name">
            <h1 id="short-name">Ammar Adam</h1>
            <p>I’m studying Computer Science & Finance at Waterloo. Right now, I’m building AI tools at <a href="https://www.sagard.com/" target="_blank" rel="noopener noreferrer">Sagard</a> and working with student builders at <a href="https://openai.com/" target="_blank" rel="noopener noreferrer">OpenAI</a>.</p>
            <p>I also make things I’m curious about, from character voices in Waze to whether five AI agents are any good at picking stocks. Outside that, I spend a lot of time bringing people together.</p>
            <div className="short-intro-links">
              <a href="/Ammar_Adam.pdf" target="_blank" rel="noopener noreferrer">Résumé <span aria-hidden="true">↗</span></a>
              <Link href="/">Take the scenic route <span aria-hidden="true">↗</span></Link>
            </div>
          </section>

          <nav className="short-jump" aria-label="On this page">
            <a href="#experience">Work</a><a href="#projects">Projects</a><a href="#photos">Photos</a>
          </nav>

          <section className="short-section" id="experience" aria-labelledby="short-work-title">
            <h2 id="short-work-title">Where I’ve worked</h2>
            <ul className="short-list">
              {roles.map(role => <li key={role.slug} data-short-role={role.slug}>
                <div className="short-entry-heading">
                  <h3><a href={role.fromUrl} target="_blank" rel="noopener noreferrer">{role.from}<span className="short-arrow" aria-hidden="true">↗</span></a></h3>
                  <span className="short-location">{role.origin}</span>
                </div>
                <p className="short-role">{role.detailTitle ?? role.title}</p>
                <p className="short-description">{roleStories[role.slug] ?? `${role.impact} ${role.details}`}</p>
              </li>)}
            </ul>
          </section>

          <section className="short-section" id="projects" aria-labelledby="short-project-title">
            <h2 id="short-project-title">Things I’m building</h2>
            <ul className="short-list short-project-list">
              {projects.map(project => {
                const links = project.seats.flatMap(seat => seat.links ?? []);
                return <li key={project.slug} data-short-project={project.slug}>
                  <div className="short-entry-heading">
                    <h3><a href={links[0]?.url} target="_blank" rel="noopener noreferrer">{project.name}<span className="short-arrow" aria-hidden="true">↗</span></a></h3>
                    {project.year && <span className="short-location">{project.year}</span>}
                  </div>
                  <p className="short-description">{projectStories[project.slug] ?? project.shortDesc}</p>
                  {links.length > 1 && <div className="short-project-links">{links.slice(1).map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<span aria-hidden="true">↗</span></a>)}</div>}
                </li>;
              })}
            </ul>
          </section>

          <section className="short-section short-personal" id="photos" aria-labelledby="short-photo-title">
            <div className="short-photo-heading"><h2 id="short-photo-title">A few good memories</h2><button type="button" onClick={() => setPhoto(0)}>All {photos.length} photos <span aria-hidden="true">↗</span></button></div>
            <figure>
              <button className="short-photo" type="button" onClick={() => setPhoto(0)} aria-label={`Open photo gallery: ${photos[0].caption}`}>
                <Image src={photos[0].src} alt={photos[0].caption} width={900} height={675} unoptimized sizes="(max-width: 680px) calc(100vw - 40px), 620px" />
              </button>
              <figcaption>{photos[0].caption}</figcaption>
            </figure>
          </section>
        </main>

        <footer className="short-footer">
          <p>If something here caught your eye, <a href={siteConfig.socialLinks.email}>say hello</a>.</p>
          <Link href="/">Back to the terminal <span aria-hidden="true">↗</span></Link>
        </footer>
      </div>
      <PhotoGallery open={photo !== null} initialIndex={photo ?? 0} onClose={() => setPhoto(null)} />
    </div>
  );
}
