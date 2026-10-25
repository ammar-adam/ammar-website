"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { arrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { siteConfig } from "@/data/site";
import "./directory.css";

const TABS = [
  { id: "experience", label: "Experience", count: arrivals.length },
  { id: "projects", label: "Projects", count: projects.length },
  { id: "contact", label: "Contact", count: null },
] as const;

type DirectoryTab = (typeof TABS)[number]["id"];

export function TerminalDirectory({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const scrollBody = useRef<HTMLDivElement>(null);
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeTab, setActiveTab] = useState<DirectoryTab>("experience");
  const id = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!open) {
      if (element.open) element.close();
      return;
    }

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    if (!element.open) element.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (open && scrollBody.current) scrollBody.current.scrollTop = 0;
  }, [activeTab, open]);

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (index + TABS.length - 1) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(TABS[next].id);
    tabButtons.current[next]?.focus();
  }

  const socialLinks = [
    { label: "Email", value: "ammar.adam@uwaterloo.ca", href: siteConfig.socialLinks.email },
    { label: "LinkedIn", value: "in/ammar-adam", href: siteConfig.socialLinks.linkedin },
    { label: "GitHub", value: "ammar-adam", href: siteConfig.socialLinks.github },
    { label: "X", value: "@ammaradam_5807", href: siteConfig.socialLinks.x },
  ];

  return (
    <dialog
      ref={dialog}
      className="terminal-directory"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-intro`}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
    >
      <header className="td-header">
        <div>
          <p className="td-eyebrow">AMMAR ADAM / PORTFOLIO</p>
          <h2 id={`${id}-title`}>All the work.</h2>
          <p id={`${id}-intro`} className="td-intro">The work, the projects, and a way to say hello.</p>
        </div>
        <button type="button" className="td-close" onClick={onClose}>
          <span>Close</span><span aria-hidden="true">×</span>
        </button>
      </header>

      <div className="td-tabs" role="tablist" aria-label="Directory sections">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => { tabButtons.current[index] = element; }}
            type="button"
            role="tab"
            id={`${id}-tab-${tab.id}`}
            aria-controls={`${id}-panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => moveTab(event, index)}
          >
            {tab.label}{tab.count !== null && <span className="td-count">{String(tab.count).padStart(2, "0")}</span>}
          </button>
        ))}
      </div>

      <div className="td-body" ref={scrollBody}>
        <section
          className="td-panel"
          role="tabpanel"
          id={`${id}-panel-experience`}
          aria-labelledby={`${id}-tab-experience`}
          tabIndex={0}
          hidden={activeTab !== "experience"}
        >
          <p className="td-section-label">Experience <span>Where I&apos;ve worked</span></p>
          <div className="td-grid">
            {arrivals.map((arrival, index) => (
              <article className="td-card" key={arrival.slug}>
                <div className="td-card-meta"><span>{String(index + 1).padStart(2, "0")}</span><span>{arrival.origin}</span></div>
                <h3>{arrival.from}</h3>
                <p className="td-role">{arrival.detailTitle ?? arrival.title}</p>
                <p className="td-description">{arrival.impact}</p>
                <p className="td-description td-detail">{arrival.details}</p>
                <div className="td-links">
                  {arrival.fromUrl && <a href={arrival.fromUrl} target="_blank" rel="noreferrer">Website <span aria-hidden="true">↗</span><span className="td-sr-only"> for {arrival.from} (opens in a new tab)</span></a>}
                  {arrival.links?.filter((link) => link.url !== arrival.fromUrl).map((link) => (
                    <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span><span className="td-sr-only"> (opens in a new tab)</span></a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="td-panel"
          role="tabpanel"
          id={`${id}-panel-projects`}
          aria-labelledby={`${id}-tab-projects`}
          tabIndex={0}
          hidden={activeTab !== "projects"}
        >
          <p className="td-section-label">Projects <span>Things I&apos;ve built</span></p>
          <div className="td-grid">
            {projects.map((project) => (
              <article className="td-card" key={project.slug}>
                <div className="td-card-meta"><span>{project.flightCode}</span><span>{project.year}</span></div>
                <h3>{project.name}</h3>
                <p className="td-role">{project.routeName}</p>
                <p className="td-description">{project.shortDesc}</p>
                <div className="td-links">
                  {project.seats.flatMap((seat) => seat.links ?? []).map((link) => (
                    <a key={`${project.slug}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span><span className="td-sr-only"> for {project.name} (opens in a new tab)</span></a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="td-panel"
          role="tabpanel"
          id={`${id}-panel-contact`}
          aria-labelledby={`${id}-tab-contact`}
          tabIndex={0}
          hidden={activeTab !== "contact"}
        >
          <p className="td-section-label">Contact <span>Let&apos;s talk</span></p>
          <div className="td-contact-grid">
            <div className="td-resume">
              <span className="td-eyebrow">AMMAR ADAM</span>
              <h3>The one-page version.</h3>
              <p>CS &amp; Finance at the University of Waterloo.</p>
              <a href="/Ammar_Adam.pdf" target="_blank" rel="noreferrer">Open my resume <span aria-hidden="true">↗</span><span className="td-sr-only"> (PDF, opens in a new tab)</span></a>
            </div>
            <div className="td-contacts">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}>
                  <span className="td-contact-label">{link.label}</span>
                  <span className="td-contact-value">{link.value}</span>
                  <span className="td-contact-arrow" aria-hidden="true">↗</span>
                  {!link.href.startsWith("mailto:") && <span className="td-sr-only"> (opens in a new tab)</span>}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>

      <footer className="td-footer"><span>Ammar Adam</span><Link href="/credits">Visual credits <span aria-hidden="true">↗</span></Link></footer>
    </dialog>
  );
}
