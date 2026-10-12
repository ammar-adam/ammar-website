"use client";

import { useState } from "react";
import { experience, links, projects, resumeUrl } from "@/data/content";
import "./pass.css";

export default function PassPage() {
  const [flipped, setFlipped] = useState(false);
  const stop = (event: React.MouseEvent) => event.stopPropagation();

  return (
    <main className="pass-page">
      <div
        className={`bp${flipped ? " flipped" : ""}`}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Show front of boarding pass" : "Flip boarding pass"}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setFlipped((f) => !f);
          }
        }}
      >
        <div className="bp-inner">
          <section className="bp-face bp-front" aria-hidden={flipped}>
            <div className="bp-top">
              <span>afa international</span>
              <span>boarding pass</span>
            </div>
            <div className="bp-route">
              <div>
                <small>from</small>
                <b>YYZ</b>
                <span>toronto</span>
              </div>
              <span className="bp-plane">✈︎</span>
              <div className="right">
                <small>to</small>
                <b>???</b>
                <span>wherever&apos;s next</span>
              </div>
            </div>
            <div className="bp-fields">
              <div><small>passenger</small>ammar adam</div>
              <div><small>class</small>cs + finance</div>
              <div><small>origin</small>waterloo &apos;29</div>
              <div><small>seat</small>2a</div>
            </div>
            <nav className="bp-links" onClick={stop}>
              {links.filter((l) => l.label !== "resume").map((link) => (
                <a key={link.label} href={link.url} target={link.url.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="bp-stub">
              <a className="bp-barcode" href={resumeUrl} target="_blank" rel="noreferrer" onClick={stop} aria-label="Open resume">
                <span className="bars" />
                <span className="label">scan for resume</span>
              </a>
              <span className="bp-hint">tap the pass to flip it ↻</span>
            </div>
          </section>

          <section className="bp-face bp-back" aria-hidden={!flipped}>
            <div className="bp-top">
              <span>conditions of carriage</span>
              <span>ammar adam</span>
            </div>
            <ol className="fine">
              {experience.map((item) => (
                <li key={item.code}>
                  <a href={item.url} target="_blank" rel="noreferrer" onClick={stop}>{item.name}</a>
                  {" "}— {item.role}. {item.note}
                </li>
              ))}
            </ol>
            <div className="fine-label">also on board</div>
            <ol className="fine" start={experience.length + 1}>
              {projects.map((item) => (
                <li key={item.code}>
                  <a href={item.url} target="_blank" rel="noreferrer" onClick={stop}>{item.name}</a>
                  {" "}— {item.note}
                </li>
              ))}
            </ol>
            <div className="bp-hint">tap to flip back ↻</div>
          </section>
        </div>
      </div>
    </main>
  );
}
