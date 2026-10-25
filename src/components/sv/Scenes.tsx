"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { loungeRoomContent } from "@/data/loungeRoom";
import { siteConfig } from "@/data/site";
import { cutState, type SectionId } from "./geometry";
import { Burst, Caption, Cmyk, Cut, Onoma, useMobile, useStep } from "./Comic";
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
  const drift = useTransform(p, [0, 1], ["0vh", "-3vh"]);
  return (
    <motion.section className={`sv-scene sv-scene-${id} ${className}`} style={{ opacity, scale, visibility, "--drift": drift } as never}>
      <div className="sv-pin">{render ? render(p) : children}</div>
    </motion.section>
  );
}

/** Narration lines keyed to dwell progress: one on screen at a time. */
function Lines({ p, lines }: { p: MotionValue<number>; lines: Array<[number, ReactNode]> }) {
  return (
    <div className="sv-scene-head">
      {lines.map(([at, text], i) => (
        <Line key={i} p={p} at={at} until={lines[i + 1]?.[0] ?? Infinity}>
          {text}
        </Line>
      ))}
    </div>
  );
}
function Line({ p, at, until, children }: { p: MotionValue<number>; at: number; until: number; children: ReactNode }) {
  const on = useStep(p, at, until);
  return (
    <motion.div style={{ opacity: on }} className="sv-stack">
      <Caption>{children}</Caption>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Cover: cold open over the skyline at dusk, the name tagged on the sky */

export function Cover() {
  return <Scene id="cover" render={(p) => <CoverInner p={p} />} />;
}

const EXIT_SCALE = [1, 1.2, 1.6, 2.4];
function CoverInner({ p }: { p: MotionValue<number> }) {
  /* exit on 8fps steps: scale 1, 1.2, 1.6, 2.4 with opacity 1,1,1,0. No in-between fades. */
  const step = useTransform(p, (v) => (v < 0.55 ? 0 : Math.min(3, Math.floor(((v - 0.55) / 0.45) * 4))));
  const scale = useTransform(step, (s) => EXIT_SCALE[s]);
  const opacity = useTransform(step, (s) => (s < 3 ? 1 : 0));
  const cue = useTransform(p, [0, 0.15], [1, 0]);
  return (
    <>
      <motion.div className="sv-cover-title" style={{ scale, opacity }}>
        <Cmyk className="sv-tag-title">AMMAR ADAM</Cmyk>
        <p className="sv-cover-sub">CS &amp; Finance at Waterloo. Toronto, mostly.</p>
      </motion.div>
      <div className="sv-cover-caption">
        <Lines
          p={p}
          lines={[
            [0, <>Alright. Let&rsquo;s do this one more time.</>],
            [0.3, <>My name is Ammar Adam.</>],
          ]}
        />
      </div>
      <motion.div className="sv-cue" style={{ opacity: cue }}>
        <span>SCROLL TO SWING</span>
        <span className="sv-cue-arrow">▼</span>
      </motion.div>
    </>
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
  const q = useTransform(p, (v) => Math.round(Math.min(1, Math.max(0, (v - 0.3) / 0.4)) * 6) / 6);
  const leftX = useTransform(q, [0, 1], ["0%", "105%"]);
  const rightX = useTransform(q, [0, 1], ["0%", "-105%"]);
  const sideScale = useTransform(q, [0, 1], [1, 0.08]);
  const sideOp = useTransform(q, (v) => (v >= 1 ? 0 : 1));
  const mainScale = useTransform(q, [0, 1], [1, 1.35]);
  const whump = useTransform(q, (v) => (v >= 1 ? 1 : 0));
  return (
    <>
      <Lines
        p={p}
        lines={[
          [0, <>I grew up between three airports. Toronto, Dubai, Karachi.</>],
          [0.72, <>Toronto stuck. Waterloo&rsquo;s close enough.</>],
        ]}
      />
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
    </>
  );
}

function CityPanel({ c }: { c: (typeof CITIES)[number] }) {
  return (
    <div className="sv-panel sv-board sv-city-panel" style={{ "--c": c.color } as React.CSSProperties}>
      <MiniSkyline city={c.name} />
      <div className="sv-city-name">{c.name}</div>
      <div className="sv-city-code">{c.code}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Roles: billboards on Bay Street, two sub-beats                     */

const ROLE_TAGS: Record<string, string> = {
  "alpen-capital": "AGE 16",
  openai: "1 OF 5",
  "pear-vc": "1 OF ~50",
  sagard: "NOW",
  "waterloo-venture": "NOW",
};

function RoleCard({ slug, big = false, eager = false }: { slug: string; big?: boolean; eager?: boolean }) {
  const r = arrivals.find((a) => a.slug === slug)!;
  return (
    <article className={`sv-panel sv-board sv-role-panel ${big ? "sv-role-big" : ""}`}>
      <div className="sv-role-img">
        <img src={r.image} alt="" loading={eager ? "eager" : "lazy"} width={560} height={747} />
        <div className="sv-ht" />
      </div>
      <div className="sv-role-body">
        {ROLE_TAGS[slug] && <span className="sv-tag">{ROLE_TAGS[slug]}</span>}
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
    </article>
  );
}

export function Roles() {
  return <Scene id="roles" render={(p) => <RolesInner p={p} />} />;
}

function RolesInner({ p }: { p: MotionValue<number> }) {
  const mobile = useMobile();
  /* desktop: two sub-beats; mobile: three, two cards max, full text */
  const groups: Array<{ at: number; until: number; slugs: string[] }> = mobile
    ? [
        { at: 0, until: 0.34, slugs: ["alpen-capital", "datastealth"] },
        { at: 0.34, until: 0.67, slugs: ["sagard", "waterloo-venture"] },
        { at: 0.67, until: Infinity, slugs: ["hack-the-north"] },
      ]
    : [
        { at: 0, until: 0.5, slugs: ["alpen-capital", "datastealth"] },
        { at: 0.5, until: Infinity, slugs: ["sagard", "waterloo-venture", "hack-the-north"] },
      ];
  return (
    <>
      <Lines
        p={p}
        lines={[
          [0, <>At sixteen I was the youngest intern at Alpen Capital, doing M&amp;A in Dubai.</>],
          [0.25, <>Then product at DataStealth. Then AI at Sagard, building tools for lawyers.</>],
          [0.5, <>At Waterloo I run the Venture Group. Thirteen hundred people. Thirty placed into startups.</>],
          [0.75, <>I help run Tech Week and Hack the North. September is not a sleeping month.</>],
        ]}
      />
      <div className="sv-stage-area">
        {groups.map((g, gi) => (
          <Cut key={gi} p={p} at={g.at} until={g.until} className={`sv-row sv-row-${g.slugs.length}`}>
            {g.slugs.map((s, i) => (
              <RoleCard key={s} slug={s} eager={gi === 0 && i === 0} />
            ))}
          </Cut>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4. The big one: the city dims to a spotlight                          */

export function Spotlight() {
  return <Scene id="spotlight" render={(p) => <SpotlightInner p={p} />} />;
}

function SpotlightInner({ p }: { p: MotionValue<number> }) {
  return (
    <>
      <Lines
        p={p}
        lines={[
          [0, <>For the past year I&rsquo;ve been one of five Founding Builder Leads for OpenAI in North America.</>],
          [0.25, <>Pear VC made me a fellow. I still don&rsquo;t fully believe either sentence.</>],
        ]}
      />
      <div className="sv-stage-area sv-spot">
        <Cut p={p} at={0} className="sv-spot-main">
          <RoleCard slug="openai" big eager />
          <Onoma color="cyan" size="md" className="sv-corner-onoma">KA-CHUNK</Onoma>
        </Cut>
        <Cut p={p} at={0.25} className="sv-spot-side" tilt={1}>
          <RoleCard slug="pear-vc" big />
        </Cut>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Projects: the 2am rooftop, four lit screens                        */

const PROJECT_LINES: Record<string, { line: string; onoma?: { word: string; color: "red" | "magenta" } }> = {
  rocketship: { line: "Equity research with a 5-agent LLM debate. Then I built honest walk-forward evals and a plain momentum baseline won.", onoma: { word: "FWOOSH", color: "red" } },
  canadaclip: { line: "iOS App Clip that takes the big-brand links AI assistants recommend and points them at Canadian small businesses." },
  "risk-optimized-equity-system": { line: "Portfolio builder for the risk-averse: estimate covariance, solve for the lowest-risk allocation with convex optimization." },
  backseat: { line: "Pick a character as your Waze voice, one tap. Built on an SDK I wrote after reverse-engineering Waze's undocumented voice format.", onoma: { word: "THWIP", color: "magenta" } },
};

export function Projects() {
  return <Scene id="projects" render={(p) => <ProjectsInner p={p} />} />;
}

function ProjectsInner({ p }: { p: MotionValue<number> }) {
  const mobile = useMobile();
  return (
    <>
      <Lines p={p} lines={[[0, <>Things I built when I should&rsquo;ve been asleep.</>]]} />
      <div className="sv-stage-area">
        <div className="sv-grid-2">
          {projects.map((pr, i) => {
            const meta = PROJECT_LINES[pr.slug];
            const clip = pr.slug === "canadaclip";
            const shot = clip ? "https://img.youtube.com/vi/JzYwfPrcPtM/maxresdefault.jpg" : pr.screenshot;
            const at = mobile ? i * 0.25 : 0.06 + i * 0.12;
            const until = mobile ? (i === 3 ? Infinity : (i + 1) * 0.25) : Infinity;
            return (
              <Cut key={pr.slug} p={p} at={at} until={until} className="sv-proj" tilt={i % 2 ? 0.6 : -0.6}>
                <article className={`sv-panel sv-board sv-proj-panel ${clip ? "sv-proj-clip" : ""}`}>
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
                </article>
                {meta.onoma && <Onoma color={meta.onoma.color} size="md" className={`sv-corner-onoma ${i % 2 ? "sv-corner-r" : ""}`}>{meta.onoma.word}</Onoma>}
              </Cut>
            );
          })}
        </div>
      </div>
      <Laptop />
    </>
  );
}

function Laptop() {
  return (
    <svg className="sv-laptop" viewBox="0 0 120 70" aria-hidden="true">
      <rect x="20" y="4" width="80" height="50" rx="4" fill="var(--ink)" />
      <rect x="26" y="10" width="68" height="38" fill="#3aa6c9" />
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
/* 6. Photos: a filmstrip the camera dollies along the Dundas screens     */

const PHOTO_PICK = [6, 22, 21, 1, 12, 24, 25, 11, 27, 13, 2, 7, 19];

export function Photos() {
  return <Scene id="photos" render={(p) => <PhotosInner p={p} />} />;
}

function PhotosInner({ p }: { p: MotionValue<number> }) {
  const all = loungeRoomContent.photos.items;
  const picked = PHOTO_PICK.map((n) => all.find((x) => x.src === `/ABOUT${n}.jpg`)).filter(Boolean) as Array<{ src: string; caption: string }>;
  /* desktop: 13 frames of 30vw, 3 in view; the strip slides as the dwell progresses */
  const x = useTransform(p, (v) => `${-v * (picked.length * 30 - 94)}vw`);
  return (
    <>
      <Lines p={p} lines={[[0, <>The people. Also an unreasonable number of sunsets.</>]]} />
      <div className="sv-stage-area sv-strip-area">
        <div className="sv-screens-sign">DUNDAS SQ.</div>
        <motion.div className="sv-filmstrip" style={{ x }}>
          {picked.map((ph) => (
            <figure key={ph.src} className="sv-panel sv-photo-panel">
              <img src={ph.src.replace("/ABOUT", "/thumbs/ABOUT")} alt={ph.caption} loading="lazy" width={520} height={390} />
              <div className="sv-ht" />
              <figcaption>{ph.caption}</figcaption>
            </figure>
          ))}
        </motion.div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Off the clock: one frame, one line, five stickers on a rooftop      */

const OFF = [
  { word: "YNWA", line: "It has not been relaxing.", color: "red" },
  { word: "PADDINGTON 2", line: "Not up for debate.", color: "cyan" },
  { word: "LOAD FACTOR", line: "Ask me. Actually, don't.", color: "amber" },
  { word: "MANGO MATCHA", line: "The correct matcha.", color: "magenta" },
  { word: "SHAWARMA", line: "GTA ranking in progress.", color: "paper" },
] as const;

export function OffClock() {
  return (
    <Scene id="offclock">
      <div className="sv-scene-head">
        <Caption>Off the clock: Liverpool since I was ten, Paddington 2 is the best film ever made, and I&rsquo;ll talk airline economics until you stop me.</Caption>
      </div>
      <div className="sv-stage-area">
        <div className="sv-off">
          {OFF.map((o, i) => (
            <motion.div
              key={o.word}
              className="sv-sticker"
              initial={{ opacity: 0, scale: 0.6, rotate: i % 2 ? 8 : -8 }}
              whileInView={{ opacity: 1, scale: 1, rotate: i % 2 ? 2 : -2 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.01, delay: i * 0.08 }}
            >
              <Onoma color={o.color} size="sm">{o.word}</Onoma>
              <p>{o.line}</p>
            </motion.div>
          ))}
          <div className="sv-parapet" />
        </div>
      </div>
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Landing: Union Station at night                                     */

export function Landing() {
  const [thwip, setThwip] = useState<{ x: number; y: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const fire = () => {
    const r = btn.current?.getBoundingClientRect();
    if (r) setThwip({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    window.setTimeout(() => {
      window.open("/Ammar_Adam.pdf", "_blank", "noopener");
      setThwip(null);
    }, 520);
  };
  const s = siteConfig.socialLinks;
  return (
    <Scene id="landing">
      <div className="sv-landing">
        <Caption>That&rsquo;s the story so far.</Caption>
        <Cmyk as="h2" className="sv-landing-title">SEE YOU OUT THERE.</Cmyk>
        <div className="sv-landing-actions">
          <button ref={btn} type="button" className="sv-btn" onClick={fire}>
            RESUME
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
      {thwip && <Thwip to={thwip} />}
    </Scene>
  );
}

/** A web shot from the figure's hand (bottom-left, on the cornice) to the button, drawn in two steps. */
function Thwip({ to }: { to: { x: number; y: number } }) {
  const mobile = useMobile();
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const hx = vw * 0.22 + (mobile ? 6 : 10);
  const hy = vh - (mobile ? 120 : 200) + (mobile ? 13 : 22) - (mobile ? 0.16 : 0.22) * vh * 0.45;
  return (
    <div className="sv-thwip" aria-hidden="true">
      <svg className="sv-thwip-svg">
        <line x1={hx} y1={hy} x2={to.x} y2={to.y} className="sv-thwip-line" pathLength={1} />
        <circle cx={to.x} cy={to.y} r={10} className="sv-thwip-dot" />
      </svg>
      <div className="sv-thwip-word" style={{ left: hx + 20, top: hy - 70 }}>
        <Burst color="var(--magenta)" />
        <Onoma color="paper" size="md">THWIP</Onoma>
      </div>
    </div>
  );
}
