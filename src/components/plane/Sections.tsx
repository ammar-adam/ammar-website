"use client";

import { useState } from "react";
import { arrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { aboutFunFacts, aboutIntro, aboutPhotos } from "@/data/about";
import { boardingPassConfig } from "@/data/boardingPass";
import { siteConfig } from "@/data/site";
import type { PartId } from "./parts";

export function Section({ id }: { id: PartId }) {
  if (id === "windows") return <Windows />;
  if (id === "engine") return <Engine />;
  if (id === "cockpit") return <Cockpit />;
  if (id === "door") return <Door />;
  return <Tail />;
}

/** Each role is a window seat with a view of where it happened. */
function Windows() {
  return (
    <ul className="seats">
      {arrivals.map((a, i) => (
        <li key={a.slug}>
          <a className="porthole" href={a.fromUrl} target="_blank" rel="noreferrer" style={{ animationDelay: `${i * 50}ms` }}>
            {a.image ? <img src={a.image} alt="" loading="lazy" /> : <span className="porthole-blank" />}
          </a>
          <div className="seat-text">
            <div className="seat-row">
              <span className="seat-no">{i + 1}A</span>
              {a.status === "Bags loading" && <span className="seat-now">now</span>}
            </div>
            <a className="seat-co" href={a.fromUrl} target="_blank" rel="noreferrer">{a.from}</a>
            <div className="seat-role">{a.title}</div>
            <p>{a.impact}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Projects, one row each, with the screenshot if there is one. */
function Engine() {
  return (
    <ul className="builds">
      {projects.map((p) => {
        const links = p.seats.flatMap((s) => s.links ?? []);
        const image = p.screenshot.endsWith(".png") || p.screenshot.endsWith(".jpg") ? p.screenshot : null;
        return (
          <li key={p.slug}>
            <div className="build-shot">{image ? <img src={image} alt="" loading="lazy" /> : <span>{p.flightCode}</span>}</div>
            <div>
              <div className="build-name">
                {p.name} <span>{p.year}</span>
              </div>
              <p>{p.shortDesc}</p>
              <div className="build-links">
                {links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** A captain's announcement, a few photos, a few facts. */
function Cockpit() {
  const [i, setI] = useState(0);
  const photo = aboutPhotos[i];
  return (
    <div className="cockpit">
      <p className="pa">
        <span>“This is your captain speaking.”</span> {aboutIntro}
      </p>
      <button type="button" className="cockpit-photo" onClick={() => setI((i + 1) % aboutPhotos.length)} aria-label="Next photo">
        <img src={photo.src} alt={photo.caption} />
        <span className="cap">{photo.caption}</span>
        <span className="count">{i + 1} / {aboutPhotos.length} · tap for next</span>
      </button>
      <ul className="facts">
        {aboutFunFacts.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  );
}

/** The resume, as the only boarding pass that matters. */
function Door() {
  return (
    <div className="door">
      <a className="mini-pass" href={boardingPassConfig.resumeFileUrl} target="_blank" rel="noreferrer">
        <div className="mp-route">
          <div><small>From</small><b>YYZ</b></div>
          <span>✈</span>
          <div className="r"><small>To</small><b>???</b></div>
        </div>
        <div className="mp-fields">
          <div><small>Passenger</small>Ammar Adam</div>
          <div><small>Status</small>{boardingPassConfig.tagline}</div>
        </div>
        <div className="mp-bars" />
        <div className="mp-cta">Tap to open the resume (PDF)</div>
      </a>
    </div>
  );
}

/** Ways to reach me. */
function Tail() {
  const s = siteConfig.socialLinks;
  const rows = [
    { k: "Email", v: "ammar.adam@uwaterloo.ca", url: s.email },
    { k: "LinkedIn", v: "in/ammar-adam", url: s.linkedin },
    { k: "GitHub", v: "ammar-adam", url: s.github },
    { k: "X", v: "@ammaradam_5807", url: s.x },
  ];
  return (
    <ul className="contact">
      {rows.map((r) => (
        <li key={r.k}>
          <a href={r.url} target={r.url.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer">
            <span>{r.k}</span>
            <b>{r.v}</b>
            <i>↗</i>
          </a>
        </li>
      ))}
    </ul>
  );
}
