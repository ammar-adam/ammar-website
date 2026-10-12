"use client";

import { useEffect, useState } from "react";
import { experience, links, photos, projects, type Item } from "@/data/content";

export function OnePager() {
  return (
    <main className="page">
      <header>
        <h1>ammar adam</h1>
        <p>
          cs &amp; finance at waterloo. grew up between toronto, dubai and karachi. right now i&apos;m building ai tools at{" "}
          <a href="https://www.sagard.com/" target="_blank" rel="noreferrer">sagard</a> and scouting builders for{" "}
          <a href="https://openai.com/" target="_blank" rel="noreferrer">openai</a>.
        </p>
        <nav className="links">
          {links.map((link) => (
            <a key={link.label} href={link.url} target={link.url.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer">
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <Polaroids />

      <List title="experience" items={experience} />
      <List title="projects" items={projects} />

      <Footer />
    </main>
  );
}

function List({ title, items }: { title: string; items: Item[] }) {
  return (
    <section>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.name}>
            <a href={item.url} target="_blank" rel="noreferrer">{item.name}</a>
            {item.role && <span className="role"> · {item.role}</span>}
            <div className="note">{item.note}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A small stack of photos. Click to put the top one at the back. */
function Polaroids() {
  const [top, setTop] = useState(0);
  const shown = [0, 1, 2].map((i) => photos[(top + i) % photos.length]);

  return (
    <button type="button" className="stack" onClick={() => setTop((t) => (t + 1) % photos.length)} aria-label="Next photo">
      {shown
        .slice()
        .reverse()
        .map((photo, i) => (
          <figure key={photo.src} className={`polaroid p${2 - i}`}>
            <img src={photo.src} alt={photo.caption} />
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
    </button>
  );
}

function Footer() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-CA", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Toronto" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer>
      built with ✈︎ and 🥙 in waterloo{time && <> · {time} in toronto</>}
    </footer>
  );
}
