"use client";

import { useEffect, useState } from "react";
import { FlapText } from "@/components/FlapText";
import { arrivals, type Arrival } from "@/data/arrivals";
import { projects, type Project } from "@/data/departures";
import { aboutFunFacts, aboutPhotos } from "@/data/about";
import { boardingPassConfig } from "@/data/boardingPass";
import { siteConfig } from "@/data/site";

/** Airport codes for each city on the board. */
const cityCode: Record<string, string> = {
  Dubai: "DXB",
  Mississauga: "YYZ",
  Toronto: "YTZ",
  Waterloo: "YKF",
  "San Francisco": "SFO",
  "Palo Alto": "PAO",
};

/** What the boarding pass "TO" field flips through. */
const destinations = ["SAGARD", "OPENAI", "PEAR VC", "BACKSEAT", "WATERLOO"];

type Theme = "day" | "night";

export function OnePager() {
  return (
    <>
      <TopBar />
      <main className="op">
        <Hero />
        <Board
          id="work"
          title="Experience"
          kicker="Departures"
          rows={arrivals.map(experienceRow)}
        />
        <Board
          id="projects"
          title="Projects"
          kicker="Now boarding"
          rows={projects.map(projectRow)}
        />
        <OffTheClock />
      </main>
      <Footer />
    </>
  );
}

/* ---------------------------------- chrome --------------------------------- */

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const first = window.setTimeout(() => setNow(new Date()), 0);
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  if (!now) return "--:--";
  return new Intl.DateTimeFormat("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Toronto",
  }).format(now);
}

function TopBar() {
  const clock = useClock();
  const [theme, setTheme] = useState<Theme>("day");

  useEffect(() => {
    const id = window.setTimeout(() => {
      setTheme(document.documentElement.dataset.theme === "night" ? "night" : "day");
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const toggle = () => {
    const next = theme === "night" ? "day" : "night";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem("afa-theme", next);
    } catch {}
  };

  return (
    <header className="bar">
      <a href="#top" className="bar-brand" aria-label="Back to top">
        <img src="/icon.svg" alt="" width={22} height={22} />
        <span>Ammar Adam</span>
      </a>
      <nav className="bar-nav" aria-label="Sections">
        <a href="#work">Work</a>
        <a href="#projects">Projects</a>
        <a href="#about">About</a>
        <a href={boardingPassConfig.resumeFileUrl} target="_blank" rel="noreferrer">Resume</a>
      </nav>
      <div className="bar-meta">
        <span className="bar-clock" title="Local time in Toronto">YYZ {clock}</span>
        <button type="button" className="bar-theme" onClick={toggle} aria-label={theme === "night" ? "Switch to day" : "Switch to night"}>
          {theme === "night" ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div>
        <div className="foot-title">Thanks for flying AFA.</div>
        <div className="foot-sub">Toronto · Dubai · Karachi · built in Waterloo</div>
      </div>
      <Socials />
    </footer>
  );
}

function Socials() {
  const links = siteConfig.socialLinks;
  return (
    <div className="socials">
      <a href={links.email}>Email</a>
      <a href={links.github} target="_blank" rel="noreferrer">GitHub</a>
      <a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
      <a href={links.x} target="_blank" rel="noreferrer">X</a>
    </div>
  );
}

/* ----------------------------------- hero ---------------------------------- */

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="kicker">AFA International · Terminal 1</div>
        <h1>Hi, I&apos;m Ammar.</h1>
        <p className="hero-lead">
          CS &amp; Finance at Waterloo. I build AI tools for the legal team at{" "}
          <a href="https://www.sagard.com/" target="_blank" rel="noreferrer">Sagard</a>, scout student builders for{" "}
          <a href="https://openai.com/" target="_blank" rel="noreferrer">OpenAI</a>, and ship side projects like{" "}
          <a href="https://backseatnav.com/" target="_blank" rel="noreferrer">Backseat</a>.
        </p>
        <p className="hero-sub">Grew up between Toronto, Dubai and Karachi, so I built my site like an airport.</p>
        <Socials />
      </div>
      <BoardingPass />
    </section>
  );
}

function BoardingPass() {
  const [index, setIndex] = useState(0);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % destinations.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  const scan = () => {
    if (scanning) return;
    setScanning(true);
    window.setTimeout(() => {
      window.open(boardingPassConfig.resumeFileUrl, "_blank");
      setScanning(false);
    }, 900);
  };

  return (
    <div className="pass" aria-label="Boarding pass">
      <div className="pass-head">
        <span>AFA International</span>
        <span>Boarding pass</span>
      </div>
      <div className="pass-route">
        <div>
          <div className="pass-lbl">From</div>
          <div className="pass-code">YYZ</div>
        </div>
        <div className="pass-plane" aria-hidden>✈</div>
        <div className="pass-to">
          <div className="pass-lbl">To</div>
          <FlapText value={destinations[index]} length={8} className="pass-flap" />
        </div>
      </div>
      <div className="pass-grid">
        <div><span className="pass-lbl">Passenger</span>Ammar Adam</div>
        <div><span className="pass-lbl">Class</span>CS + Finance &apos;29</div>
        <div><span className="pass-lbl">Seat</span>2A</div>
        <div><span className="pass-lbl">Status</span>{boardingPassConfig.tagline}</div>
      </div>
      <button type="button" className={`pass-barcode${scanning ? " scanning" : ""}`} onClick={scan} aria-label="Open resume PDF">
        <span className="bars" aria-hidden />
        <span className="laser" aria-hidden />
        <span className="pass-scan">{scanning ? "Scanning…" : "Scan for resume"}</span>
      </button>
    </div>
  );
}

/* ---------------------------------- boards --------------------------------- */

interface Row {
  key: string;
  code: string;
  name: string;
  sub: string;
  gate: string;
  status: "IN FLIGHT" | "BOARDING" | "LANDED" | "DEPARTED";
  body: string[];
  image?: string;
  links: { label: string; url: string }[];
}

function experienceRow(a: Arrival): Row {
  return {
    key: a.slug,
    code: cityCode[a.origin] ?? "---",
    name: a.from,
    sub: a.title,
    gate: a.origin,
    status: a.status === "Bags loading" ? "IN FLIGHT" : "LANDED",
    body: [a.impact, a.details],
    links: [...(a.fromUrl ? [{ label: "Website", url: a.fromUrl }] : []), ...(a.links ?? [])].filter(
      (link, i, all) => all.findIndex((l) => l.url === link.url) === i,
    ),
  };
}

function projectRow(p: Project): Row {
  const image = p.screenshot.endsWith(".png") || p.screenshot.endsWith(".jpg") ? p.screenshot : undefined;
  return {
    key: p.slug,
    code: p.flightCode,
    name: p.name,
    sub: p.routeName,
    gate: p.year,
    status: p.status === "Boarding" ? "BOARDING" : "DEPARTED",
    body: [p.shortDesc],
    image,
    links: p.seats.flatMap((seat) => seat.links ?? []),
  };
}

function Board({ id, title, kicker, rows }: { id: string; title: string; kicker: string; rows: Row[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="section" id={id}>
      <div className="section-head">
        <div className="kicker">{kicker}</div>
        <h2>{title}</h2>
      </div>
      <div className="board">
        <div className="board-row board-labels" aria-hidden>
          <span>Code</span>
          <span>Destination</span>
          <span className="hide-sm">{id === "projects" ? "Year" : "City"}</span>
          <span>Status</span>
        </div>
        {rows.map((row) => {
          const isOpen = open === row.key;
          return (
            <div className={`board-item${isOpen ? " open" : ""}`} key={row.key}>
              <button
                type="button"
                className="board-row"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : row.key)}
              >
                <span className="b-code">{row.code}</span>
                <span className="b-dest">
                  <b>{row.name}</b>
                  <small>{row.sub}</small>
                </span>
                <span className="b-gate hide-sm">{row.gate}</span>
                <span className={`b-status s-${row.status.toLowerCase().replace(" ", "-")}`}>
                  <i />
                  {row.status}
                </span>
              </button>
              <div className="board-detail" hidden={!isOpen}>
                <div className="bd-text">
                  {row.body.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  {row.links.length > 0 && (
                    <div className="bd-links">
                      {row.links.map((link) => (
                        <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                          {link.label} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                {row.image && <img className="bd-img" src={row.image} alt={`${row.name} screenshot`} loading="lazy" />}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------- off the clock ------------------------------ */

function OffTheClock() {
  const [top, setTop] = useState(0);
  const count = aboutPhotos.length;
  const stack = [0, 1, 2].map((offset) => aboutPhotos[(top + offset) % count]);

  return (
    <section className="section" id="about">
      <div className="section-head">
        <div className="kicker">Lounge</div>
        <h2>Off the clock</h2>
      </div>
      <div className="lounge">
        <button
          type="button"
          className="polaroids"
          onClick={() => setTop((t) => (t + 1) % count)}
          aria-label="Show next photo"
        >
          {stack
            .slice()
            .reverse()
            .map((photo, i) => (
              <figure className={`polaroid p${2 - i}`} key={photo.src}>
                <img src={photo.src} alt={photo.caption} loading="lazy" />
                <figcaption>{photo.caption}</figcaption>
              </figure>
            ))}
          <span className="polaroid-hint">click for the next one · {top + 1}/{count}</span>
        </button>
        <div className="lounge-copy">
          <p>
            Outside work I&apos;m usually cooking, hunting for the best chicken shawarma in the GTA, or watching
            Liverpool. I can also talk about airplanes and airline economics for way too long.
          </p>
          <ul className="facts">
            {aboutFunFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
