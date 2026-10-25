"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { loungeRoomContent } from "@/data/loungeRoom";
import { siteConfig } from "@/data/site";
import { cutState, type SectionId, type SwingState } from "./geometry";
import { Burst, Caption, Cut, Onoma, useMobile, useStep } from "./Comic";
import { byId, plateForBeat, type Shot } from "./plates";
import { matrix3d, project, type Cam } from "./camera";
import { TITLE_TEXT } from "./PrintStage";

/* ------------------------------------------------------------------ */
/* Scene shell: one beat of the timeline, cut in and out with hard pops */

export const YVh = createContext<MotionValue<number> | null>(null);
export const Cinema = createContext<{ state: MotionValue<SwingState>; vw: number; vh: number } | null>(null);

function Scene({ id, children, className = "", render }: { id: SectionId; className?: string; children?: ReactNode; render?: (p: MotionValue<number>) => ReactNode }) {
  const yVh = useContext(YVh)!;
  const cut = useTransform(yVh, (v) => cutState(v, id));
  const p = useTransform(cut, (c) => c.p);
  const opacity = useTransform(cut, (c) => (c.on ? 1 : 0));
  const visibility = useTransform(cut, (c) => (c.on ? "visible" : "hidden"));
  return (
    <motion.section className={`sv-scene sv-scene-${id} ${className}`} style={{ opacity, visibility }}>
      <div className="sv-pin">{render ? render(p) : children}</div>
    </motion.section>
  );
}

/** Narration lines keyed to dwell progress: one on screen at a time, near the subject. */
function Lines({ p, lines, at = "tl" }: { p: MotionValue<number>; lines: Array<[number, ReactNode, boolean?]>; at?: "tl" | "bl" | "tr" | "br" | "bc" }) {
  return (
    <div className={`sv-narr sv-narr-${at}`}>
      {lines.map(([from, text, hand], i) => (
        <Line key={i} p={p} at={from} until={lines[i + 1]?.[0] ?? Infinity} hand={hand}>
          {text}
        </Line>
      ))}
    </div>
  );
}
function Line({ p, at, until, hand, children }: { p: MotionValue<number>; at: number; until: number; hand?: boolean; children: ReactNode }) {
  const on = useStep(p, at, until);
  return (
    <motion.div style={{ opacity: on }} className="sv-stack">
      <Caption hand={hand}>{children}</Caption>
    </motion.div>
  );
}

const ASPECT: Record<string, number> = { "dusk-a": 1.5, gardiner: 1.5, polson: 1.5, "night-unsplash": 1.498, dundas: 1.5, "night-2025": 1.333, "by-night": 1.5, "gfx-pano": 2.708, "aerial-night": 1.334 };

/**
 * A content surface mapped onto a real plane in the photograph: four plate-uv corners
 * projected through the camera every frame, applied as matrix3d. The text stays DOM.
 */
function Surface({ plate, name, w, h, className = "", children }: { plate: string; name: string; w: number; h: number; className?: string; children: ReactNode }) {
  const cin = useContext(Cinema)!;
  const mobile = useMobile();
  const tf = useTransform(cin.state, (s) => {
    const shot: Shot = plateForBeat(s, mobile);
    const P = byId.get(plate);
    const surf = (mobile && P?.surfacesMobile?.[name]) || P?.surfaces?.[name];
    if (!P || !surf || shot.plate.id !== P.id) return "translate(-9999px, 0)";
    const c: Cam = { shot, vw: cin.vw, vh: cin.vh, plateAspect: ASPECT[P.id] ?? 1.5 };
    const pts = surf.quad.map((uv) => project(uv, surf.depth, c));
    return matrix3d(pts, w, h);
  });
  return (
    <motion.div className={`sv-surface ${className}`} style={{ width: w, height: h, transform: tf }}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Cover: the title is painted into the sky by the shader; the DOM keeps the words */

export function Cover() {
  return <Scene id="cover" render={(p) => <CoverInner p={p} />} />;
}

function CoverInner({ p }: { p: MotionValue<number> }) {
  const cue = useTransform(p, [0, 0.15], [1, 0]);
  return (
    <>
      <h1 className="sv-sr">{TITLE_TEXT}</h1>
      <div className="sv-cover-sub">
        <Caption>CS &amp; Finance at Waterloo. Toronto, mostly.</Caption>
      </div>
      <Lines
        p={p}
        at="bl"
        lines={[
          [0, <>Alright. Let&rsquo;s do this one more time.</>, true],
          [0.3, <>My name is Ammar Adam.</>, true],
        ]}
      />
      <motion.div className="sv-cue" style={{ opacity: cue }}>
        <span>Scroll</span>
        <span className="sv-cue-arrow">▼</span>
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Origins: a departure board on the window; two rows flip away, one stays */

const CITIES = [
  { code: "YYZ", name: "Toronto", flight: "AC 001", status: "Home" },
  { code: "DXB", name: "Dubai", flight: "EK 241", status: "Departed" },
  { code: "KHI", name: "Karachi", flight: "PK 781", status: "Departed" },
];

export function Origins() {
  return <Scene id="origins" render={(p) => <OriginsInner p={p} />} />;
}

function OriginsInner({ p }: { p: MotionValue<number> }) {
  const mobile = useMobile();
  const q = useTransform(p, (v) => Math.round(Math.min(1, Math.max(0, (v - 0.3) / 0.35)) * 4) / 4);
  const row2 = useTransform(q, (v) => (v >= 0.5 ? "none" : "table-row"));
  const row3 = useTransform(q, (v) => (v >= 1 ? "none" : "table-row"));
  const flipTone = useTransform(q, (v) => (v > 0 && v < 1 ? 1 : 0));
  return (
    <>
      <Lines
        p={p}
        at="br"
        lines={[
          [0, <>I grew up between three airports. Toronto, Dubai, Karachi.</>],
          [0.72, <>Toronto stuck. Waterloo&rsquo;s close enough.</>],
        ]}
      />
      <Surface plate="gardiner" name="board" w={mobile ? 330 : 560} h={mobile ? 200 : 330} className="sv-led">
        <div className="sv-board-head">
          <span>Departures</span>
          <span>Gate</span>
          <span>Status</span>
        </div>
        <table className="sv-board">
          <tbody>
            <tr>
              <td className="sv-code">YYZ</td>
              <td>{CITIES[0].name}</td>
              <td>{CITIES[0].flight}</td>
              <td className="sv-status-home">{CITIES[0].status}</td>
            </tr>
            <motion.tr style={{ display: row2 }}>
              <td className="sv-code">DXB</td>
              <td>{CITIES[1].name}</td>
              <td>{CITIES[1].flight}</td>
              <td>{CITIES[1].status}</td>
            </motion.tr>
            <motion.tr style={{ display: row3 }}>
              <td className="sv-code">KHI</td>
              <td>{CITIES[2].name}</td>
              <td>{CITIES[2].flight}</td>
              <td>{CITIES[2].status}</td>
            </motion.tr>
          </tbody>
        </table>
        <motion.div className="sv-board-flip" style={{ opacity: flipTone }} />
      </Surface>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Roles: LED panels on the tower wall, two sub-beats                 */

const ROLE_TAGS: Record<string, string> = {
  "alpen-capital": "Age 16",
  openai: "1 of 5",
  "pear-vc": "1 of ~50",
  sagard: "Now",
  "waterloo-venture": "Now",
};

function RoleCard({ slug, big = false, eager = false }: { slug: string; big?: boolean; eager?: boolean }) {
  const r = arrivals.find((a) => a.slug === slug)!;
  return (
    <article className={`sv-card ${big ? "sv-card-big" : ""}`}>
      <div className="sv-card-img">
        <img src={r.image} alt="" loading={eager ? "eager" : "lazy"} width={560} height={747} />
      </div>
      <div className="sv-card-body">
        {ROLE_TAGS[slug] && <span className="sv-tag">{ROLE_TAGS[slug]}</span>}
        <h3 className="sv-card-name">{r.from}</h3>
        <p className="sv-card-title">
          {r.detailTitle ?? r.title} · {r.origin}
        </p>
        <p className="sv-card-line">{r.impact}</p>
        {big && <p className="sv-card-line sv-card-more">{r.details}</p>}
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
        at="bl"
        lines={[
          [0, <>At sixteen I was the youngest intern at Alpen Capital, doing M&amp;A in Dubai.</>],
          [0.25, <>Then product at DataStealth. Then AI at Sagard, building tools for lawyers.</>],
          [0.5, <>At Waterloo I run the Venture Group. Thirteen hundred people. Thirty placed into startups.</>],
          [0.75, <>I help run Tech Week and Hack the North. September is not a sleeping month.</>],
        ]}
      />
      <Surface plate="polson" name="wall" w={mobile ? 340 : 760} h={mobile ? 560 : 470} className="sv-led">
        {groups.map((g, gi) => (
          <Cut key={gi} p={p} at={g.at} until={g.until} className={`sv-row sv-row-${g.slugs.length}`}>
            {g.slugs.map((s, i) => (
              <RoleCard key={s} slug={s} eager={gi === 0 && i === 0} />
            ))}
          </Cut>
        ))}
      </Surface>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4. The big one: one face lit by a searchlight, a smaller sign below   */

export function Spotlight() {
  return <Scene id="spotlight" render={(p) => <SpotlightInner p={p} />} />;
}

function SpotlightInner({ p }: { p: MotionValue<number> }) {
  const mobile = useMobile();
  return (
    <>
      <Lines
        p={p}
        lines={[
          [0, <>For the past year I&rsquo;ve been one of five Founding Builder Leads for OpenAI in North America.</>],
          [0.25, <>Pear VC made me a fellow. I still don&rsquo;t fully believe either sentence.</>],
        ]}
      />
      <Surface plate="night-unsplash" name="face" w={mobile ? 340 : 620} h={mobile ? 280 : 420}>
        <Cut p={p} at={0}>
          <div className="sv-led sv-lit sv-fill">
            <RoleCard slug="openai" big eager />
          </div>
          <Onoma color="cyan" size="md" className="sv-corner-onoma">KA-CHUNK</Onoma>
        </Cut>
      </Surface>
      <Surface plate="night-unsplash" name="sign" w={mobile ? 300 : 420} h={mobile ? 190 : 250}>
        <Cut p={p} at={0.25}>
          <div className="sv-led sv-fill">
            <RoleCard slug="pear-vc" big />
          </div>
        </Cut>
      </Surface>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Projects: one at a time on the Dundas screen, four sub-beats       */

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
  return (
    <>
      <Lines p={p} at="bl" lines={[[0, <>Things I built when I should&rsquo;ve been asleep.</>]]} />
      <Surface plate="dundas" name="screen" w={300} h={640} className="sv-led sv-screen-surface">
        {projects.map((pr, i) => {
          const meta = PROJECT_LINES[pr.slug];
          const clip = pr.slug === "canadaclip";
          const shot = clip ? "https://img.youtube.com/vi/JzYwfPrcPtM/maxresdefault.jpg" : pr.screenshot;
          return (
            <Cut key={pr.slug} p={p} at={i * 0.25} until={i === 3 ? Infinity : (i + 1) * 0.25} className="sv-proj">
              <article className={`sv-card sv-proj-card ${clip ? "sv-proj-clip" : ""}`}>
                <div className="sv-proj-img">
                  <img src={shot} alt={`${pr.name} screenshot`} loading="lazy" width={900} height={520} />
                </div>
                <div className="sv-card-body">
                  <h3 className="sv-card-name">
                    {pr.name} <span className="sv-year">{pr.year}</span>
                  </h3>
                  <p className="sv-card-title">{pr.routeName}</p>
                  <p className="sv-card-line">{meta.line}</p>
                  <div className="sv-links">
                    {pr.seats[0].links?.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener">
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                </div>
                <div className="sv-screen-count">
                  {i + 1} / {projects.length}
                </div>
              </article>
              {meta.onoma && <Onoma color={meta.onoma.color} size="md" className="sv-corner-onoma">{meta.onoma.word}</Onoma>}
            </Cut>
          );
        })}
      </Surface>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Photos: prints pegged on a line across the rooftop                 */

const PHOTO_PICK = [6, 22, 21, 1, 12, 24, 25, 11, 27, 13, 2, 7, 19];
const ROT = [-2, 1.5, -1, 2, -1.5, 1, -2, 1.5, -1, 2, -1.5, 1, -2];

export function Photos() {
  return <Scene id="photos" render={(p) => <PhotosInner p={p} />} />;
}

function PhotosInner({ p }: { p: MotionValue<number> }) {
  const all = loungeRoomContent.photos.items;
  const picked = PHOTO_PICK.map((n) => all.find((x) => x.src === `/ABOUT${n}.jpg`)).filter(Boolean) as Array<{ src: string; caption: string }>;
  const x = useTransform(p, (v) => `${-v * (picked.length * 25 - 90)}vw`);
  return (
    <>
      <Lines p={p} lines={[[0, <>The people. Also an unreasonable number of sunsets.</>]]} />
      <div className="sv-line-area">
        <motion.div className="sv-clothesline" style={{ x }}>
          <svg className="sv-line-svg" viewBox="0 0 1000 40" preserveAspectRatio="none">
            <path d="M 0 6 Q 500 34 1000 6" fill="none" stroke="#0b0a16" strokeWidth="3" />
          </svg>
          {picked.map((ph, i) => (
            <figure key={ph.src} className="sv-print" style={{ transform: `rotate(${ROT[i]}deg)`, left: `${i * 25}vw` }}>
              <span className="sv-peg" />
              <img src={ph.src.replace("/ABOUT", "/thumbs/ABOUT")} alt={ph.caption} loading="lazy" width={520} height={390} />
              <figcaption>{ph.caption}</figcaption>
              <span className="sv-tape sv-tape-l" />
              <span className="sv-tape sv-tape-r" />
            </figure>
          ))}
        </motion.div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Off the clock: die-cut stickers on the wall by the lamp post       */

const OFF = [
  { word: "YNWA", line: "It has not been relaxing.", rot: -6 },
  { word: "Paddington 2", line: "Not up for debate.", rot: 5 },
  { word: "Load factor", line: "Ask me. Actually, don't.", rot: -4 },
  { word: "Mango matcha", line: "The correct matcha.", rot: 7 },
  { word: "Shawarma", line: "GTA ranking in progress.", rot: -8 },
] as const;

export function OffClock() {
  return (
    <Scene id="offclock">
      <div className="sv-narr sv-narr-tl">
        <Caption>Off the clock: Liverpool since I was ten, Paddington 2 is the best film ever made, and I&rsquo;ll talk airline economics until you stop me.</Caption>
      </div>
      <Surface plate="by-night" name="wall" w={300} h={760} className="sv-stickers">
        {OFF.map((o, i) => (
          <motion.div
            key={o.word}
            className="sv-sticker"
            style={{ rotate: o.rot }}
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.01, delay: i * 0.08 }}
          >
            <strong>{o.word}</strong>
            <p>{o.line}</p>
          </motion.div>
        ))}
      </Surface>
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Landing: on the rooftop, the title steps in                         */

export function Landing() {
  return <Scene id="landing" render={(p) => <LandingInner p={p} />} />;
}

function LandingInner({ p }: { p: MotionValue<number> }) {
  const [thwip, setThwip] = useState<{ x: number; y: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const cin = useContext(Cinema)!;
  const mobile = useMobile();
  const fire = () => {
    const r = btn.current?.getBoundingClientRect();
    if (r) setThwip({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    window.setTimeout(() => {
      window.open("/Ammar_Adam.pdf", "_blank", "noopener");
      setThwip(null);
    }, 520);
  };
  const s = siteConfig.socialLinks;
  /* the title steps in at 8fps after the landing */
  const step = useTransform(p, (v) => Math.min(3, Math.floor(Math.max(0, v - 0.1) * 24)));
  const titleOp = useTransform(step, (v) => (v >= 1 ? 1 : 0));
  const titleScale = useTransform(step, (v) => [1.3, 1.12, 1.04, 1][v]);
  const restOp = useTransform(step, (v) => (v >= 3 ? 1 : 0));
  const hand = useTransform(cin.state, (st) => {
    const shot = plateForBeat(st, mobile);
    const perch = shot.plate.perch;
    if (!perch) return { x: 0, y: 0 };
    const [px, py] = project(perch.uv, perch.depth, { shot, vw: cin.vw, vh: cin.vh, plateAspect: ASPECT[shot.plate.id] ?? 1.5 });
    const figH = (mobile ? 30 : 42) * 0.01 * cin.vh;
    return { x: px - figH * 0.1, y: py - figH * 0.5 };
  });
  return (
    <>
      <Lines p={p} at="bl" lines={[[0.05, <>That&rsquo;s the story so far.</>, true]]} />
      <div className="sv-landing">
        <motion.h2 className="sv-title-card" style={{ opacity: titleOp, scale: titleScale }}>
          <span className="sv-mis sv-mis-r" aria-hidden="true">See you out there.</span>
          <span className="sv-mis sv-mis-c" aria-hidden="true">See you out there.</span>
          <span className="sv-mis-k">See you out there.</span>
        </motion.h2>
        <motion.div className="sv-landing-rest" style={{ opacity: restOp }}>
          <div className="sv-landing-actions">
            <button ref={btn} type="button" className="sv-btn" onClick={fire}>
              Resume
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
          <p className="sv-colophon">
            Drawn in Toronto. No Spider-Men were harmed. <a href="/credits">Plate credits</a>
          </p>
        </motion.div>
      </div>
      {thwip && <Thwip to={thwip} from={hand.get()} />}
    </>
  );
}

/** A web shot from the figure's hand on the rooftop to the button, drawn in two steps. */
function Thwip({ to, from }: { to: { x: number; y: number }; from: { x: number; y: number } }) {
  return (
    <div className="sv-thwip" aria-hidden="true">
      <svg className="sv-thwip-svg">
        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="sv-thwip-line" pathLength={1} />
        <circle cx={to.x} cy={to.y} r={10} className="sv-thwip-dot" />
      </svg>
      <div className="sv-thwip-word" style={{ left: Math.max(8, from.x - 190), top: Math.max(10, from.y - 150) }}>
        <Burst color="var(--magenta)" />
        <Onoma color="paper" size="md">THWIP</Onoma>
      </div>
    </div>
  );
}
