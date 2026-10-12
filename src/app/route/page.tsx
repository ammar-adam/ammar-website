"use client";

import { useState } from "react";
import { cities, experience, links, projects } from "@/data/content";
import "./route.css";

export default function RoutePage() {
  const [active, setActive] = useState<string | null>(null);
  const city = cities.find((c) => c.code === active);
  const index = active ? cities.findIndex((c) => c.code === active) : -1;
  const planeLeft = `${(Math.max(index, 0) / (cities.length - 1)) * 100}%`;

  return (
    <main className="page route-page">
      <h1>ammar adam</h1>
      <p>cs &amp; finance at waterloo. this is the route so far.</p>

      <div className="route" onMouseLeave={() => setActive(null)}>
        <div className="route-line">
          <span className={`route-plane${active ? " moving" : ""}`} style={{ left: planeLeft }} aria-hidden>
            ✈︎
          </span>
          {cities.map((c, i) => (
            <button
              type="button"
              key={c.code}
              className={`stop${active === c.code ? " on" : ""}`}
              style={{ left: `${(i / (cities.length - 1)) * 100}%` }}
              onMouseEnter={() => setActive(c.code)}
              onFocus={() => setActive(c.code)}
              onClick={() => setActive(active === c.code ? null : c.code)}
            >
              <i />
              <span>{c.code}</span>
            </button>
          ))}
        </div>
        <div className="route-caption">
          {city ? (
            <>
              <b>{city.name}</b> · {city.note}
            </>
          ) : (
            <span className="hint">hover a city</span>
          )}
        </div>
      </div>

      <nav className="links">
        {links.map((link) => (
          <a key={link.label} href={link.url} target={link.url.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer">
            {link.label}
          </a>
        ))}
      </nav>

      <section>
        <h2>experience</h2>
        <ul>
          {experience.map((item) => (
            <li key={item.code} className={active && item.city !== active ? "faded" : ""}>
              <a href={item.url} target="_blank" rel="noreferrer">{item.name}</a>
              <span className="role"> · {item.role}</span>
              <div className="note">{item.note}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>projects</h2>
        <ul>
          {projects.map((item) => (
            <li key={item.code} className={active ? "faded" : ""}>
              <a href={item.url} target="_blank" rel="noreferrer">{item.name}</a>
              <div className="note">{item.note}</div>
            </li>
          ))}
        </ul>
      </section>

      <footer>built with ✈︎ and 🥙 in waterloo</footer>
    </main>
  );
}
