"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Sky, TopBar, cloudPosterUrl, cloudVideoUrl } from "@/components/shell/Shell";
import { Fade, Lines } from "@/components/shell/Reveal";
import { arrivals } from "@/data/arrivals";
import { projects, type Project } from "@/data/departures";
import { boardingPassConfig } from "@/data/boardingPass";
import { siteConfig } from "@/data/site";
import { Flap } from "./Flap";
import "./home.css";

const ease = [0.22, 1, 0.36, 1] as const;
const pad2 = (n: number) => String(n).padStart(2, "0");
const host = (url?: string) => (url ? url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : "");
const shotFor = (p: Project) =>
  p.slug === "canadaclip" ? "https://img.youtube.com/vi/JzYwfPrcPtM/maxresdefault.jpg" : p.screenshot;

/* ------------------------------------------------------------------ */
/* Stops. The top bar's "you are here" follows the scene at the centre  */
/* of the viewport; the hero lists them as gates.                      */
/* ------------------------------------------------------------------ */
const STOPS = [
  { id: "checkin", gate: "", here: "Check-in · Hall A", label: "", sub: "" },
  { id: "security", gate: "A", here: "Security · X-ray lane 2", label: "Security", sub: "Things I've built" },
  { id: "departures", gate: "B", here: "Departures · 1 min walk", label: "Departures", sub: "Where I've worked" },
  { id: "window", gate: "C", here: "Window seat · 2A", label: "Window seat", sub: "About me" },
  { id: "boarding", gate: "D", here: "Boarding · Final call", label: "Boarding", sub: "Resume and contact" },
] as const;

function useHere() {
  const [here, setHere] = useState<string>(STOPS[0].here);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const stop = STOPS.find((s) => s.id === e.target.id);
          if (stop) setHere(stop.here);
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    for (const s of STOPS) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);
  return here;
}

/** Scroll so that step `i` of `n` sits in the middle of its range inside a pinned section. */
function jumpToStep(el: HTMLElement | null, i: number, n: number, from = 0, to = 1) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const span = el.offsetHeight - window.innerHeight;
  const t = from + ((i + 0.5) / n) * (to - from);
  window.scrollTo({ top: top + t * span, behavior: "smooth" });
}

/** Stepped index in [0, n) derived from a motion value over [from, to]. */
function useStepFrom(mv: MotionValue<number>, n: number, from = 0, to = 1) {
  const [step, setStep] = useState(0);
  useMotionValueEvent(mv, "change", (v) => {
    const t = Math.min(1, Math.max(0, (v - from) / (to - from)));
    const next = Math.min(n - 1, Math.max(0, Math.floor(t * n)));
    setStep((s) => (s === next ? s : next));
  });
  return step;
}

/* ------------------------------------------------------------------ */
/* The arched window's inside: the old sky, clouds and cloud video.    */
/* ------------------------------------------------------------------ */
function WindowSky({ lazy = false }: { lazy?: boolean }) {
  return (
    <div className="win-inner" aria-hidden>
      <div className="sky">
        <div className="sky-grad" />
        <div className="sky-clouds sky-clouds-a" />
        <div className="sky-clouds sky-clouds-b" />
        <video className="sky-video" autoPlay muted loop playsInline preload={lazy ? "none" : "metadata"} poster={cloudPosterUrl}>
          <source src={cloudVideoUrl} type="video/mp4" />
        </video>
        <div className="sky-grain" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1 · Check-in                                                        */
/* ------------------------------------------------------------------ */
const SOCIALS = [
  { label: "Email", href: siteConfig.socialLinks.email },
  { label: "LinkedIn", href: siteConfig.socialLinks.linkedin },
  { label: "GitHub", href: siteConfig.socialLinks.github },
  { label: "X", href: siteConfig.socialLinks.x },
];

function CheckIn() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yRaw = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const y = useSpring(yRaw, { stiffness: 90, damping: 24, mass: 0.6 });
  const gates = STOPS.filter((s) => s.gate);

  return (
    <section id="checkin" ref={ref} className="va-scene va-checkin">
      <div className="wrap va-hero">
        <div className="va-hero-copy">
          <Fade className="kicker" delay={0.05} y={10}>CHECK-IN · AFA INTERNATIONAL</Fade>
          <Lines as="h1" className="va-h1" delay={0.15}>{["Ammar", "Adam"]}</Lines>
          <Fade className="va-sub" delay={0.55}>
            <p>CS &amp; Finance at Waterloo. Building AI tools at Sagard, scouting student builders for OpenAI, shipping things on the side.</p>
          </Fade>
          <Fade className="va-socials" delay={0.7} y={10}>
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
            ))}
          </Fade>
          <Fade className="va-gates" delay={0.85} y={10}>
            {gates.map((g) => (
              <a key={g.id} href={`#${g.id}`} className="va-gate">
                <b>{g.gate}</b>
                <span>{g.label}</span>
                <small>{g.sub}</small>
                <i aria-hidden>→</i>
              </a>
            ))}
          </Fade>
        </div>

        <motion.div className="va-hero-window" style={{ y }}>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease, delay: 0.3 }}>
            <div className="window">
              <WindowSky />
              <div className="win-frame" />
              <div className="flight-card">
                <div className="fc-top">
                  <span className="fc-route">AFA · NOW BOARDING</span>
                  <span className="fc-status">ON TIME</span>
                </div>
                <div className="fc-bar">
                  <motion.i initial={{ width: 0 }} animate={{ width: "42%" }} transition={{ duration: 1.4, ease, delay: 0.9 }} />
                </div>
                <div className="fc-sub">
                  <span>YYZ → TBD</span>
                  <span>GATE A · SEAT 2A</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · Security: the X-ray is the scene. Your bag is in the scanner;   */
/*     the items inside are the projects. Scroll highlights each one   */
/*     on the screen and opens it onto the inspection tray.            */
/* ------------------------------------------------------------------ */
function Security() {
  const ref = useRef<HTMLElement>(null);
  const n = projects.length;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(p, { stiffness: 140, damping: 28, mass: 0.5 });

  const INTRO = 0.14; // the bag slides onto the screen, then items step
  const bagX = useTransform(smooth, [0, INTRO], ["-115%", "0%"]);
  const bagIn = useTransform(smooth, [INTRO * 0.8, INTRO], [0, 1]);
  const waiting = useTransform(smooth, [0, INTRO * 0.9], [1, 0]);
  const loaded = useStepFrom(p, 2, 0, INTRO) === 1 || false;
  const sel = useStepFrom(p, n, INTRO, 1);
  const inside = useInView(ref, { amount: 0.1 });
  const active = inside && loaded;
  const proj = projects[sel];
  const links = proj.seats[0]?.links ?? [];

  return (
    <section id="security" ref={ref} className="va-scene va-pinwrap va-pinwrap-sec">
      <div className="va-pin">
        <div className="wrap">
          <div className="va-scene-head">
            <span className="kicker">GATE A · SECURITY · PROJECTS</span>
            <small aria-live="polite">{active ? `Item ${pad2(sel + 1)} of ${pad2(n)} · Scroll to inspect` : "Place your bag on the belt"}</small>
          </div>

          <div className="va-xr">
            {/* The X-ray monitor */}
            <div className="va-mon">
              <div className="va-mon-top">
                <span><i className="va-led" />X-RAY · LANE 2</span>
                <span className="va-mon-id">BAG AA-YYZ-2A</span>
              </div>
              <div className="va-screen">
                <div className="va-screen-grid" aria-hidden />
                <motion.div className="va-screen-wait" style={{ opacity: waiting }} aria-hidden>
                  <span>WAITING FOR BAG</span>
                  <i />
                </motion.div>
                <motion.div className="va-xbag" style={{ x: bagX, opacity: bagIn }}>
                  <span className="va-xbag-handle" aria-hidden />
                  {projects.map((q, i) => {
                    const on = active && i === sel;
                    return (
                      <button
                        key={q.slug}
                        type="button"
                        className={`va-xitem va-xitem-${i} ${on ? "on" : ""} ${active && !on ? "off" : ""}`}
                        onClick={() => jumpToStep(ref.current, i, n, INTRO, 1)}
                        aria-label={`Inspect ${q.name}`}
                        aria-pressed={on}
                      >
                        <img src={shotFor(q)} alt="" draggable={false} />
                        <span className="va-xitem-reticle" aria-hidden><i /><i /><i /><i /></span>
                        <span className="va-xitem-tag">ITEM {pad2(i + 1)}</span>
                      </button>
                    );
                  })}
                </motion.div>
                <span className="va-xscan" aria-hidden />
              </div>
              <div className="va-mon-bottom">
                <span>ITEMS {pad2(n)}</span>
                <span>THREAT · NONE</span>
                <span className="va-mon-status">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={active ? proj.slug : "wait"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
                      {active ? `ITEM ${pad2(sel + 1)} · ${proj.name.toUpperCase()} · CLEARED` : "SCANNING"}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
            </div>

            {/* The inspection tray: the item, opened */}
            <div className="va-tray">
              <div className="va-tray-head">
                <span>INSPECTION TRAY</span>
                <span>{active ? `ITEM ${pad2(sel + 1)} / ${pad2(n)}` : "EMPTY"}</span>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                {active ? (
                  <motion.div
                    key={proj.slug}
                    className="va-tray-body"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.45, ease }}
                  >
                    <img className="va-tray-photo" src={shotFor(proj)} alt={`${proj.name} screenshot`} />
                    <div className="va-tray-meta">
                      <span className="claim-tag">{proj.flightCode} · {proj.year}</span>
                      <span className={`sticker stat ${proj.status === "Boarding" ? "s-board" : "s-dep"}`}>{proj.status}</span>
                    </div>
                    <h3 className="va-tray-name">{proj.name}</h3>
                    <p className="va-tray-route">{proj.routeName}</p>
                    <p className="va-tray-note">{proj.shortDesc}</p>
                    <div className="va-tray-links">
                      {links.map((l) => (
                        <a key={l.url} className="btn" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" className="va-tray-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <span>Scroll to send your bag through.</span>
                    <small>Four items inside. Each one opens here.</small>
                  </motion.div>
                )}
              </AnimatePresence>
              <ol className="va-tray-index" aria-hidden>
                {projects.map((q, i) => (
                  <li key={q.slug} className={active && i === sel ? "on" : active && i < sel ? "done" : ""}>{pad2(i + 1)}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · Departures: experience on the split-flap board. Rows board in   */
/*     order as you scroll.                                            */
/* ------------------------------------------------------------------ */
const TIMES = ["06:40", "08:15", "09:50", "11:05", "12:30", "14:20", "16:45"];
const GATES = ["A3", "A7", "B2", "B5", "B9", "C4", "C8"];
const shortName = (s: string) => s.replace("Waterloo Tech Week / ", "");

function Departures() {
  const ref = useRef<HTMLElement>(null);
  const n = arrivals.length;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const active = useStepFrom(p, n);
  const live = useInView(ref, { once: true, amount: 0.05 });
  const [clock, setClock] = useState("--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-CA", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Toronto" });
    const tick = () => setClock(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="departures" ref={ref} className="va-scene va-pinwrap va-pinwrap-board">
      <div className="va-pin">
        <div className="wrap">
          <div className="va-scene-head">
            <span className="kicker">GATE B · DEPARTURES · EXPERIENCE</span>
            <small>Scroll to board · {pad2(active + 1)} / {pad2(n)}</small>
          </div>

          <div className="fboard va-board">
            <div className="fboard-head">
              <div className="fh-l"><i className="fh-dot" />DEPARTURES</div>
              <div className="fh-clock">YYZ {clock}</div>
            </div>
            <div className="fboard-cols va-cols">
              <span>TIME</span><span>DESTINATION</span><span>ROLE · CITY</span><span>GATE</span><span>STATUS</span>
            </div>

            {arrivals.map((a, i) => {
              const state = i < active ? "departed" : i === active ? "boarding" : "scheduled";
              const label = !live ? "" : state === "departed" ? "DEPARTED" : state === "boarding" ? "BOARDING" : "ON TIME";
              const st = state === "boarding" ? "st-amber" : state === "scheduled" ? "st-green" : "st-dim";
              return (
                <div
                  key={a.slug}
                  className={`fboard-row va-row ${state}`}
                  role="button"
                  tabIndex={0}
                  aria-current={state === "boarding" ? "step" : undefined}
                  onClick={() => jumpToStep(ref.current, i, n)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); jumpToStep(ref.current, i, n); } }}
                >
                  <span className="fr-time">{TIMES[i]}</span>
                  <span className="fr-dest"><Flap value={live ? shortName(a.from).toUpperCase() : ""} length={16} perChar={14} stepMs={30} /></span>
                  <span className="fr-info">{a.title} · {a.origin}</span>
                  <span className="fr-gate">{GATES[i]}</span>
                  <span className={`fr-status ${st}`}><i /><Flap value={label} length={8} /></span>
                  <AnimatePresence initial={false}>
                    {state === "boarding" && (
                      <motion.div
                        key="x"
                        className="va-row-x"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease }}
                      >
                        <p>{a.impact}</p>
                        <span className="va-row-meta">
                          {a.detailTitle ?? a.title}
                          {a.fromUrl && (
                            <> · <a href={a.fromUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{host(a.fromUrl)} ↗</a></>
                          )}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4 · Window seat (about)                                             */
/* ------------------------------------------------------------------ */
const CARRY_ON = [
  "Liverpool, since I was ten",
  "Paddington 2 (best movie ever made)",
  "Airline economics",
  "Mango matcha, and the best shawarma in the GTA",
];

function WindowSeat() {
  return (
    <section id="window" className="va-scene va-seat">
      <div className="wrap va-seat-grid">
        <Fade className="va-seat-window" amount={0.3}>
          <div className="window va-window-sm">
            <WindowSky lazy />
            <div className="win-frame" />
            <div className="flight-card">
              <div className="fc-top">
                <span className="fc-route">SEAT 2A</span>
                <span className="fc-status">CRUISING</span>
              </div>
              <div className="fc-sub">
                <span>FL370</span>
                <span>YYZ · DXB · KHI</span>
              </div>
            </div>
          </div>
        </Fade>

        <div className="va-seat-copy">
          <Fade className="kicker" y={10} amount={0.3}>GATE C · WINDOW SEAT · ABOUT</Fade>
          <Lines as="p" className="va-about" delay={0.1} amount={0.3}>
            {[
              <span key="a">I grew up between Toronto, Dubai and Karachi, so a lot of my life happened in departure halls.</span>,
              <span key="b" className="va-about-dim">This site lives in one.</span>,
            ]}
          </Lines>
          <Fade className="va-carry" delay={0.3} amount={0.3}>
            <div className="label">CARRY-ON</div>
            <ul>
              {CARRY_ON.map((c, i) => (
                <li key={c}><b>{pad2(i + 1)}</b><span>{c}</span></li>
              ))}
            </ul>
          </Fade>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5 · Boarding (resume + contact)                                     */
/* ------------------------------------------------------------------ */
function Boarding() {
  return (
    <section id="boarding" className="va-scene va-boarding">
      <div className="wrap">
        <div className="va-scene-head va-pass-w">
          <span className="kicker">GATE D · BOARDING · NEXT FLIGHT</span>
          <small>Final call</small>
        </div>

        <Fade amount={0.2}>
          <div className="pass va-pass">
            <div className="pass-main">
              <div className="pm-head">
                <span className="pm-wm"><img src="/airport-icons/plane-side.svg" alt="" />AFA INTERNATIONAL</span>
                <span className="pm-cls">BOARDING PASS</span>
              </div>
              <div className="pass-route">
                <div>
                  <div className="pr-code">{boardingPassConfig.from}</div>
                  <div className="pr-lbl">Toronto</div>
                </div>
                <div className="pr-mid">→</div>
                <div className="pr-r">
                  <div className="pr-code">TBD</div>
                  <div className="pr-lbl">Next adventure</div>
                </div>
              </div>
              <div className="pass-fields">
                <div className="pass-field">
                  <div className="pf-k">Passenger</div>
                  <div className="pf-v">{boardingPassConfig.displayName}</div>
                </div>
                <div className="pass-field">
                  <div className="pf-k">Seat</div>
                  <div className="pf-v">2A</div>
                </div>
                <div className="pass-field">
                  <div className="pf-k">Status</div>
                  <div className="pf-v pf-accent">Boarding</div>
                </div>
              </div>
            </div>

            <div className="pass-stub">
              <div className="ps-k">Passenger</div>
              <div className="ps-v">{boardingPassConfig.displayName}</div>
              <div className="ps-k">Contact</div>
              <div className="va-stub-links">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
                ))}
              </div>
              <a className="scan-btn" href={boardingPassConfig.resumeFileUrl} target="_blank" rel="noreferrer" aria-label="Open resume (PDF)">
                <span className="scan-frame">
                  <span className="ps-bar" />
                  <span className="scan-laser" />
                </span>
                <span className="scan-hint">SCAN FOR RESUME</span>
              </a>
            </div>
          </div>
        </Fade>

        <footer className="va-foot va-pass-w">
          <span>Thanks for flying with me.</span>
          <a href="https://uwaterloo.network" target="_blank" rel="noreferrer">
            <img src="https://uwaterloo.network/icon.svg" alt="" />uwaterloo.network
          </a>
          <span>Toronto · Dubai · Karachi</span>
        </footer>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function Home() {
  const here = useHere();
  return (
    <>
      <Sky />
      <TopBar here={here} />
      <main className="va">
        <CheckIn />
        <Security />
        <Departures />
        <WindowSeat />
        <Boarding />
      </main>
    </>
  );
}
