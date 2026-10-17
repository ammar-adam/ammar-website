"use client";

import { projects, type Project } from "@/data/departures";
import { Fade } from "./Reveal";
import { Sign } from "./Sign";

/** CanadaClip ships a video, not a still; use the demo's poster frame. */
function poster(p: Project) {
  if (/\.(png|jpe?g|webp)$/i.test(p.screenshot)) return p.screenshot;
  if (p.slug === "canadaclip") return "https://img.youtube.com/vi/JzYwfPrcPtM/maxresdefault.jpg";
  return null;
}

/** Projects as four gates. Each tile is the gate's screen. */
export function Gates() {
  return (
    <section id="gates" className="stop">
      <Sign
        as="header"
        items={[{ href: "#gates", label: "Gates", sub: "What I've built", arrow: "→" }]}
        aside={<span>A1–A{projects.length}</span>}
      />

      <div className="tiles">
        {projects.map((p, i) => {
          const img = poster(p);
          const links = p.seats[0]?.links ?? [];
          const primary = links[0]?.url;
          return (
            <Fade key={p.slug} className="tile" delay={0.1 + i * 0.08} amount={0.3}>
              <a className="tile-screen" href={primary} target="_blank" rel="noreferrer" aria-label={`Open ${p.name}`}>
                {img ? <img src={img} alt="" loading="lazy" /> : <span className="tile-text">{p.name}</span>}
                <span className="tile-tag">
                  <b>A{i + 1}</b>
                  <i aria-hidden /> {p.status === "Departed" ? "Departed" : "Boarding"}
                </span>
              </a>
              <div className="tile-meta">
                <div>
                  <span className="tile-name">{p.name}</span>
                  <span className="tile-route">{p.routeName}</span>
                </div>
                <div className="tile-links">
                  {links.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
                  ))}
                </div>
              </div>
            </Fade>
          );
        })}
      </div>
    </section>
  );
}
