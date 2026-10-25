"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { loungeRoomContent } from "@/data/loungeRoom";
import { siteConfig } from "@/data/site";
import { cutState, type SectionId } from "./geometry";
import { Burst, Caption, Cmyk, Cut, Onoma, Roof, useStep } from "./Comic";
import { UnionFacade } from "./Skyline";

/* ------------------------------------------------------------------ */
/* Scene shell: one beat of the timeline, cut in and out with hard pops */

export const YVh = createContext<MotionValue<number> | null>(null);

function Scene({ id, children, className = "", render }: { id: SectionId; className?: string; children?: ReactNode; render?: (p: MotionValue<number>) => ReactNode }) {
  const yVh = useContext(YVh)!;
  const cut = useTransform(yVh, (v) => cutState(v, id));
  const p = useTransform(cut, (c) => c.p);
  const opacity = useTransform(cut, (c) => (c.on ? 1 : 0));
  const scale = useTransform(cut, (c) => c.scale);
  const visibility = useTransform(cut, (c) => (c.on ? "visible" : "hidden"));
  /* captions float: a little parallax against the camera */
  const drift = useTransform(p, [0, 1], ["0vh", "-3vh"]);
  return (
    <motion.section className={`sv-scene sv-scene-${id} ${className}`} style={{ opacity, scale, visibility, "--drift": drift } as never}>
      <div className="sv-pin">{render ? render(p) : children}</div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Cover: cold open over the skyline at dusk, the name tagged on the sky */

export function Cover() {
  return <Scene id="cover" render={(p) => <CoverInner p={p} />} />;
}

function CoverInner({ p }: { p: MotionValue<number> }) {
  const scale = useTransform(p, [0, 1], [1, 1.5]);
  const fade = useTransform(p, [0.2, 0.75], [1, 0]);
  const y = useTransform(p, [0, 1], ["0vh", "-26vh"]);
  const cue = useTransform(p, [0, 0.15], [1, 0]);
  const cap2 = useStep(p, 0.3);
  const cap1 = useTransform(p, (v) => (v < 0.3 ? 1 : 0));
  return (
    <>
      <div className="sv-cover-meta">
        <span>TORONTO · OCT 2026</span>
        <span>ISSUE NO. 1</span>
      </div>
      <motion.div className="sv-cover-title" style={{ scale, opacity: fade, y }}>
        <Cmyk className="sv-tag-title">AMMAR ADAM</Cmyk>
        <Drips />
        <p className="sv-cover-sub">CS &amp; Finance at Waterloo · AI at Sagard · ships things at 2am</p>
      </motion.div>
      <div className="sv-cover-caption">
        <motion.div style={{ opacity: cap1 }} className="sv-stack">
          <Caption>Alright. Let&rsquo;s do this one more time.</Caption>
        </motion.div>
        <motion.div style={{ opacity: cap2 }} className="sv-stack">
          <Caption>My name is Ammar Adam.</Caption>
        </motion.div>
      </div>
      <motion.div className="sv-cue" style={{ opacity: cue }}>
        <span>SCROLL TO SWING</span>
        <span className="sv-cue-arrow">▼</span>
      </motion.div>
    </>
  );
}

/** Spray drips under the tag. */
function Drips() {
  const d = [10, 30, 16, 42, 12, 24];
  return (
    <svg className="sv-drips" viewBox="0 0 400 60" aria-hidden="true" preserveAspectRatio="none">
      {d.map((h, i) => (
        <g key={i}>
          <rect x={i * 66 + 20} y={0} width={4} height={h} rx={2} fill="var(--paper)" />
          <circle cx={i * 66 + 22} cy={h} r={3.5} fill="var(--paper)" />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Origins: three cities, lit like gate signs, collapse into Toronto  */

const CITIES = [
  { name: "TORONTO", code: "YYZ", color: "var(--amber)" },
  { name: "DUBAI", code: "DXB", color: "var(--magenta)" },
  { name: "KARACHI", code: "KHI", color: "var(--cyan)" },
] as const;

function MiniSkyline({ city }: { city: (typeof CITIES)[number]["name"] }) {
  if (city === "TORONTO")
    return (
      <svg viewBox="0 0 200 120" className="sv-mini">
        <rect x="10" y="70" width="30" height="50" />
        <rect x="45" y="50" width="22" height="70" />
        <polygon points="96,118 104,30 112,118" />
        <rect x="90" y="34" width="28" height="12" rx="4" />
        <rect x="102" y="2" width="4" height="30" />
        <rect x="130" y="60" width="40" height="60" />
        <path d="M 160 120 q 20 -40 40 0 z" />
      </svg>
    );
  if (city === "DUBAI")
    return (
      <svg viewBox="0 0 200 120" className="sv-mini">
        <rect x="20" y="80" width="30" height="40" />
        <polygon points="80,120 90,40 96,10 102,40 112,120" />
        <rect x="84" y="56" width="26" height="8" />
        <rect x="82" y="80" width="30" height="8" />
        <path d="M 130 120 q 10 -60 40 -50 q -10 20 0 50 z" />
        <rect x="170" y="90" width="20" height="30" />
      </svg>
    );
  return (
    <svg viewBox="0 0 200 120" className="sv-mini">
      <rect x="10" y="90" width="40" height="30" />
      <rect x="60" y="60" width="60" height="60" />
      <path d="M 70 60 q 20 -30 40 0 z" />
      <rect x="86" y="24" width="8" height="20" />
      <rect x="130" y="70" width="24" height="50" />
      <rect x="160" y="50" width="30" height="70" />
    </svg>
  );
}

export function Origins() {
  return <Scene id="origins" render={(p) => <OriginsInner p={p} />} />;
}

function OriginsInner({ p }: { p: MotionValue<number> }) {
  /* stepped collapse: side panels jump inward on 3s */
  const q = useTransform(p, (v) => Math.round(Math.min(1, Math.max(0, (v - 0.3) / 0.4)) * 6) / 6);
  const leftX = useTransform(q, [0, 1], ["0%", "105%"]);
  const rightX = useTransform(q, [0, 1], ["0%", "-105%"]);
  const sideScale = useTransform(q, [0, 1], [1, 0.08]);
  const sideOp = useTransform(q, (v) => (v >= 1 ? 0 : 1));
  const mainScale = useTransform(q, [0, 1], [1, 1.35]);
  const after = useStep(p, 0.72);
  const before = useTransform(p, (v) => (v < 0.72 ? 1 : 0));
  const whump = useTransform(q, (v) => (v >= 1 ? 1 : 0));
  return (
    <>
      <div className="sv-scene-head">
        <motion.div style={{ opacity: before }} className="sv-stack">
          <Caption>I grew up between three airports. Toronto, Dubai, Karachi.</Caption>
        </motion.div>
        <motion.div style={{ opacity: after }} className="sv-stack">
          <Caption>Toronto stuck. Now second-year CS &amp; Finance at Waterloo.</Caption>
        </motion.div>
      </div>
      <div className="sv-cities">
        <motion.div className="sv-city" style={{ x: leftX, scale: sideScale, opacity: sideOp, rotate: -3 }}>
          <CityPanel c={CITIES[1]} />
        </motion.div>
        <motion.div className="sv-city sv-city-main" style={{ scale: mainScale }}>
          <CityPanel c={CITIES[0]} />
          <motion.div className="sv-whump" style={{ opacity: whump }}>
            <Onoma color="magenta" size="lg">WHUMP</Onoma>
          </motion.div>
        </motion.div>
        <motion.div className="sv-city" style={{ x: rightX, scale: sideScale, opacity: sideOp, rotate: 3 }}>
          <CityPanel c={CITIES[2]} />
        </motion.div>
      </div>
      <Roof variant="c" />
    </>
  );
}

function CityPanel({ c }: { c: (typeof CITIES)[number] }) {
  return (
    <div className="sv-panel sv-city-panel" style={{ "--c": c.color } as React.CSSProperties}>
      <MiniSkyline city={c.name} />
      <div className="sv-city-name">{c.name}</div>
      <div className="sv-city-code">{c.code}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Roles: lit windows on Bay Street                                  */

const ROLE_ORDER = ["alpen-capital", "datastealth", "sagard", "waterloo-venture", "hack-the-north", "openai", "pear-vc"];
const ROLE_TAGS: Record<string, string> = {
  "alpen-capital": "AGE 16",
  openai: "1 OF 5",
  "pear-vc": "1 OF ~50",
  sagard: "NOW",
  "waterloo-venture": "NOW",
};

export function Roles() {
  return <Scene id="roles" render={(p) => <RolesInner p={p} />} />;
}

function RolesInner({ p }: { p: MotionValue<number> }) {
  const roles = ROLE_ORDER.map((slug) => arrivals.find((a) => a.slug === slug)!);
  const cap1 = useTransform(p, (v) => (v < 0.55 ? 1 : 0));
  const cap2 = useStep(p, 0.55);
  return (
    <>
      <div className="sv-scene-head">
        <motion.div style={{ opacity: cap1 }} className="sv-stack">
          <Caption>At sixteen I was the youngest intern at Alpen Capital, doing M&amp;A in Dubai. It escalated.</Caption>
        </motion.div>
        <motion.div style={{ opacity: cap2 }} className="sv-stack">
          <Caption>For the past year, one of five Founding Builder Leads for OpenAI in North America. Still don&rsquo;t fully believe it.</Caption>
        </motion.div>
      </div>
      <div className="sv-strip">
        {roles.map((r, i) => {
          const big = r.slug === "openai" || r.slug === "pear-vc";
          return (
            <Cut key={r.slug} p={p} at={0.06 + i * 0.09} className={`sv-role sv-role-${r.slug}`} tilt={i % 2 ? 0.5 : -0.5}>
              <article className="sv-panel sv-role-panel">
                <div className="sv-role-img">
                  <img src={r.image} alt="" loading={i < 4 ? "eager" : "lazy"} width={560} height={747} />
                  <div className="sv-ht" />
                </div>
                <div className="sv-role-body">
                  {ROLE_TAGS[r.slug] && <span className="sv-tag">{ROLE_TAGS[r.slug]}</span>}
                  <h3 className="sv-role-name">{r.from}</h3>
                  <p className="sv-role-title">
                    {r.detailTitle ?? r.title} · {r.origin}
                  </p>
                  <p className="sv-role-line">{r.impact}</p>
                  {big && <p className="sv-role-line sv-role-more">{r.details}</p>}
                  <div className="sv-links">
                    {r.fromUrl && (
                      <a href={r.fromUrl} target="_blank" rel="noopener">
                        {r.from.split(" / ")[0]} ↗
                      </a>
                    )}
                    {r.links?.slice(1).map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener">
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                </div>
                {r.slug === "openai" && <Onoma color="cyan" size="md" className="sv-role-onoma">KA-CHUNK</Onoma>}
                {r.slug === "pear-vc" && <Onoma color="magenta" size="md" className="sv-role-onoma">PEAR!</Onoma>}
              </article>
            </Cut>
          );
        })}
      </div>
      <Roof variant="a" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Projects: the 2am rooftop, four lit screens                        */

const PROJECT_LINES: Record<string, { line: string; onoma: string; color: "amber" | "magenta" | "cyan" | "red" }> = {
  rocketship: { line: "Equity research with a 5-agent LLM debate. Then I built honest walk-forward evals and a plain momentum baseline won.", onoma: "FWOOSH", color: "red" },
  canadaclip: { line: "iOS App Clip that takes the big-brand links AI assistants recommend and points them at Canadian small businesses.", onoma: "SHIP IT", color: "amber" },
  "risk-optimized-equity-system": { line: "Portfolio builder for the risk-averse: estimate covariance, solve for the lowest-risk allocation with convex optimization.", onoma: "STEADY", color: "cyan" },
  backseat: { line: "Pick a character as your Waze voice, one tap. Built on an SDK I wrote after reverse-engineering Waze's undocumented voice format.", onoma: "THWIP", color: "magenta" },
};

export function Projects() {
  return <Scene id="projects" render={(p) => <ProjectsInner p={p} />} />;
}

function ProjectsInner({ p }: { p: MotionValue<number> }) {
  return (
    <>
      <div className="sv-scene-head">
        <Caption>By day I build AI tools at Sagard. The rest of the time I ship things at 2am.</Caption>
      </div>
      <div className="sv-grid-2">
        {projects.map((pr, i) => {
          const meta = PROJECT_LINES[pr.slug];
          const shot = pr.slug === "canadaclip" ? "https://img.youtube.com/vi/JzYwfPrcPtM/maxresdefault.jpg" : pr.screenshot;
          return (
            <Cut key={pr.slug} p={p} at={0.08 + i * 0.14} className="sv-proj" tilt={i % 2 ? 0.6 : -0.6}>
              <article className="sv-panel sv-proj-panel">
                <div className="sv-proj-img">
                  <img src={shot} alt={`${pr.name} screenshot`} loading="lazy" width={900} height={520} />
                  <div className="sv-ht" />
                </div>
                <div className="sv-proj-body">
                  <h3 className="sv-proj-name">
                    {pr.name} <span className="sv-year">{pr.year}</span>
                  </h3>
                  <p className="sv-proj-route">{pr.routeName}</p>
                  <p className="sv-proj-line">{meta.line}</p>
                  <div className="sv-links">
                    {pr.seats[0].links?.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener">
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                </div>
                <Onoma color={meta.color} size="md" className="sv-proj-onoma">{meta.onoma}</Onoma>
              </article>
            </Cut>
          );
        })}
      </div>
      <Laptop />
      <Roof variant="b" />
    </>
  );
}

function Laptop() {
  return (
    <svg className="sv-laptop" viewBox="0 0 120 70" aria-hidden="true">
      <rect x="20" y="4" width="80" height="50" rx="4" fill="var(--ink)" />
      <rect x="26" y="10" width="68" height="38" fill="var(--cyan)" />
      <rect x="30" y="16" width="40" height="4" fill="var(--ink)" />
      <rect x="30" y="24" width="56" height="4" fill="var(--ink)" />
      <rect x="30" y="32" width="28" height="4" fill="var(--ink)" />
      <rect x="6" y="54" width="108" height="10" rx="3" fill="var(--ink)" />
      <text x="60" y="68" fontSize="7" fontFamily="var(--font-mono)" fill="var(--paper)" textAnchor="middle">
        02:14
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Photos: the Dundas screens                                        */

const PHOTO_PICK = [6, 22, 21, 1, 12, 24, 25, 11, 27, 13, 2, 7, 19];
/* column spans on an 8-column wall: a comic page, not a grid */
const PHOTO_SPANS = [3, 2, 3, 3, 3, 2, 2, 2, 2, 2, 3, 3, 2];

export function Photos() {
  return <Scene id="photos" render={(p) => <PhotosInner p={p} />} />;
}

function PhotosInner({ p }: { p: MotionValue<number> }) {
  const all = loungeRoomContent.photos.items;
  const picked = PHOTO_PICK.map((n) => all.find((x) => x.src === `/ABOUT${n}.jpg`)).filter(Boolean) as Array<{ src: string; caption: string }>;
  return (
    <>
      <div className="sv-scene-head">
        <Caption>Some of the people and places that made the last few years.</Caption>
      </div>
      <div className="sv-screens">
        <div className="sv-screens-sign">DUNDAS SQ.</div>
        <div className="sv-photo-grid">
          {picked.map((ph, i) => (
            <Cut key={ph.src} p={p} at={0.05 + Math.floor(i / 3) * 0.14} className={`sv-photo sv-span-${PHOTO_SPANS[i]}`} tilt={((i % 3) - 1) * 0.6}>
              <figure className="sv-panel sv-photo-panel">
                <img src={ph.src.replace("/ABOUT", "/thumbs/ABOUT")} alt={ph.caption} loading="lazy" width={520} height={390} />
                <div className="sv-ht" />
                <figcaption>{ph.caption}</figcaption>
              </figure>
            </Cut>
          ))}
        </div>
      </div>
      <Roof variant="c" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Off the clock                                                     */

const OFF = [
  { word: "YNWA", line: "Liverpool since I was ten. It has not been relaxing.", color: "red" },
  { word: "PADDINGTON 2", line: "Best film ever made. Not up for debate.", color: "cyan" },
  { word: "LOAD FACTOR", line: "I'll talk about airline economics until you stop me.", color: "amber" },
  { word: "MANGO MATCHA", line: "The correct matcha.", color: "magenta" },
  { word: "SHAWARMA", line: "Ranking the GTA one plate at a time.", color: "paper" },
] as const;

export function OffClock() {
  return (
    <Scene id="offclock">
      <div className="sv-scene-head">
        <Caption>Off the clock.</Caption>
      </div>
      <div className="sv-off">
        {OFF.map((o, i) => (
          <motion.div
            key={o.word}
            className="sv-panel sv-off-panel"
            initial={{ opacity: 0, scale: 0.6, rotate: i % 2 ? 6 : -6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: i % 2 ? 1.5 : -1.5 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 500, damping: 18, delay: i * 0.06 }}
          >
            <Onoma color={o.color} size="md">{o.word}</Onoma>
            <p>{o.line}</p>
          </motion.div>
        ))}
      </div>
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Landing: Union Station at night                                    */

export function Landing() {
  const [thwip, setThwip] = useState(false);
  const fire = () => {
    setThwip(true);
    window.setTimeout(() => {
      window.open("/Ammar_Adam.pdf", "_blank", "noopener");
      setThwip(false);
    }, 420);
  };
  const s = siteConfig.socialLinks;
  return (
    <Scene id="landing">
      <div className="sv-landing">
        <Caption>That&rsquo;s the story so far.</Caption>
        <Cmyk as="h2" className="sv-landing-title sv-neon">SEE YOU OUT THERE.</Cmyk>
        <div className="sv-landing-actions">
          <button type="button" className="sv-btn" onClick={fire}>
            <span>RESUME</span>
            {thwip && (
              <span className="sv-thwip">
                <Burst color="var(--magenta)" />
                <Onoma color="paper" size="md">THWIP</Onoma>
              </span>
            )}
          </button>
          <a className="sv-btn sv-btn-quiet" href="/Ammar_Adam.pdf" target="_blank" rel="noopener">
            PDF, no theatrics
          </a>
        </div>
        <ul className="sv-contact">
          <li><a href={s.email}>ammar.adam@uwaterloo.ca</a></li>
          <li><a href={s.github} target="_blank" rel="noopener">GitHub</a></li>
          <li><a href={s.linkedin} target="_blank" rel="noopener">LinkedIn</a></li>
          <li><a href={s.x} target="_blank" rel="noopener">X</a></li>
          <li><a href="https://uwaterloo.network" target="_blank" rel="noopener">uwaterloo.network</a></li>
        </ul>
        <p className="sv-colophon">Drawn in Toronto. No Spider-Men were harmed.</p>
      </div>
      <UnionFacade />
    </Scene>
  );
}
