"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { Sky, TopBar, cloudVideoUrl } from "@/variants/shared/Shell";
import { Fade, Lines } from "@/variants/shared/Reveal";
import { arrivals } from "@/data/arrivals";
import { projects, type Project } from "@/data/departures";
import { boardingPassConfig } from "@/data/boardingPass";
import { siteConfig } from "@/data/site";
import { Flap } from "./Flap";
import "./a.css";

const ease = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/* Stops: the top bar's "you are here" follows whichever scene is at   */
/* the vertical centre of the viewport.                                */
/* ------------------------------------------------------------------ */
const STOPS = [
  { id: "checkin", here: "Check-in · Hall A" },
  { id: "departures", here: "Departures · 1 min walk" },
  { id: "gate", here: "Gate A · 2 min walk" },
  { id: "window", here: "Window seat · 2A" },
  { id: "boarding", here: "Boarding · Final call" },
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
function jumpToStep(el: HTMLElement | null, i: number, n: number) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const span = el.offsetHeight - window.innerHeight;
  window.scrollTo({ top: top + ((i + 0.5) / n) * span, behavior: "smooth" });
}

/** Stepped progress for a pinned section: returns the active index in [0, n). */
function useSteps(ref: React.RefObject<HTMLElement | null>, n: number) {
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(n - 1, Math.max(0, Math.floor(v * n)));
    setStep((s) => (s === next ? s : next));
  });
  return step;
}

/* ------------------------------------------------------------------ */
/* The arched window's inside: the old sky, clouds and cloud video.    */
/* ------------------------------------------------------------------ */
function WindowSky() {
  return (
    <div className="win-inner" aria-hidden>
      <div className="sky">
        <div className="sky-grad" />
        <div className="sky-clouds sky-clouds-a" />
        <div className="sky-clouds sky-clouds-b" />
        <video className="sky-video" autoPlay muted loop playsInline preload="metadata">
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
  const yRaw = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y = useSpring(yRaw, { stiffness: 90, damping: 24, mass: 0.6 });
  const items = [...siteConfig.tickerIdentifiers, ...siteConfig.tickerIdentifiers];

  return (
    <section id="checkin" ref={ref} className="va-scene va-checkin">
      <div className="wrap va-hero">
        <div className="va-hero-copy">
          <Fade className="kicker" delay={0.1} y={10}>CHECK-IN · AFA INTERNATIONAL</Fade>
          <Lines as="h1" className="va-h1" delay={0.25}>{["Ammar", "Adam"]}</Lines>
          <Fade className="va-sub" delay={0.8}>
            <p>CS &amp; Finance at Waterloo. Building AI tools at Sagard, scouting student builders for OpenAI, shipping things on the side.</p>
          </Fade>
          <Fade className="va-socials" delay={0.95} y={10}>
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
            ))}
          </Fade>
        </div>

        <motion.div className="va-hero-window" style={{ y }}>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease, delay: 0.45 }}>
            <div className="window">
              <WindowSky />
              <div className="win-frame" />
              <div className="flight-card">
                <div className="fc-top">
                  <span className="fc-route">AFA · NOW BOARDING</span>
                  <span className="fc-status">ON TIME</span>
                </div>
                <div className="fc-bar">
                  <motion.i initial={{ width: 0 }} animate={{ width: "42%" }} transition={{ duration: 1.6, ease, delay: 1.2 }} />
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

      <div className="wrap">
        <div className="ticker" aria-hidden>
          <div className="ticker-track">
            {items.map((t, i) => (
              <span className="ticker-item" key={i}>
                {t}<span className="dot">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · Departures: the split-flap board, rows board as you scroll      */
/* ------------------------------------------------------------------ */
const TIMES = ["06:40", "08:15", "09:50", "11:05", "12:30", "14:20", "16:45"];
const pad2 = (n: number) => String(n).padStart(2, "0");
const host = (url?: string) => (url ? url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : "");

function Departures() {
  const ref = useRef<HTMLElement>(null);
  const n = arrivals.length;
  const active = useSteps(ref, n);
  const live = useInView(ref, { once: true, amount: 0.05 });

  return (
    <section id="departures" ref={ref} className="va-scene va-pinwrap va-pinwrap-board">
      <div className="va-pin">
        <div className="wrap">
          <div className="va-scene-head">
            <span className="kicker">DEPARTURES · EXPERIENCE</span>
            <small>Scroll to board</small>
          </div>

          <div className="fboard va-board">
            <div className="fboard-head">
              <div className="fh-l"><i className="fh-dot" />DEPARTURES</div>
              <div className="fh-clock">{pad2(active + 1)} / {pad2(n)}</div>
            </div>
            <div className="fboard-cols">
              <span>TIME</span><span>DESTINATION</span><span>INFO</span><span>STATUS</span>
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
                  <span className="fr-dest">{a.from}</span>
                  <span className="fr-info">{a.title} · {a.origin}</span>
                  <span className={`fr-status ${st}`}><i /><Flap value={label} length={8} /></span>
                  <AnimatePresence initial={false}>
                    {state === "boarding" && (
                      <motion.div
                        key="x"
                        className="va-row-x"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease }}
                      >
                        <p>{a.impact}</p>
                        {a.fromUrl && (
                          <a href={a.fromUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                            {host(a.fromUrl)} ↗
                          </a>
                        )}
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
/* 3 · Gate A: seat map + open suitcase                                */
/* ------------------------------------------------------------------ */
const SEATS = ["1A", "1B", "2A", "2B"];
const shotFor = (p: Project) =>
  p.slug === "canadaclip" ? "https://img.youtube.com/vi/JzYwfPrcPtM/maxresdefault.jpg" : p.screenshot;

function SeatSvg() {
  return (
    <svg className="seat-svg" viewBox="0 0 74 64" aria-hidden>
      <rect className="sv-bk" x="11" y="3" width="52" height="17" rx="7" />
      <rect className="sv-cu" x="14" y="23" width="46" height="36" rx="9" />
      <rect className="sv-ar" x="3" y="21" width="9" height="36" rx="4.5" />
      <rect className="sv-ar" x="62" y="21" width="9" height="36" rx="4.5" />
    </svg>
  );
}

function Gate() {
  const ref = useRef<HTMLElement>(null);
  const n = projects.length;
  const sel = useSteps(ref, n);
  const p = projects[sel];
  const links = p.seats[0]?.links ?? [];

  const seat = (i: number) => {
    const q = projects[i];
    if (!q) return <span />;
    return (
      <button
        type="button"
        className={`pseat ${sel === i ? "sel" : ""}`}
        aria-pressed={sel === i}
        onClick={() => jumpToStep(ref.current, i, n)}
      >
        <SeatSvg />
        <span className="pn">{q.name}</span>
        <span className="pc">{SEATS[i]} · {q.year}</span>
      </button>
    );
  };

  return (
    <section id="gate" ref={ref} className="va-scene va-pinwrap va-pinwrap-gate">
      <div className="va-pin">
        <div className="wrap">
          <div className="va-scene-head">
            <span className="kicker">GATE A · PROJECTS</span>
            <small>Scroll to pick a seat</small>
          </div>

          <div className="va-gate-grid">
            <div className="cabin va-cabin">
              <div className="cabin-nose">
                <img className="nose-ic" src="/airport-icons/plane-top.svg" alt="" />
                SEAT MAP · ROWS 1–2
              </div>
              <div className="cabin-cols"><span /><span>A</span><span /><span>B</span></div>
              {[0, 1].map((r) => (
                <div className="seat-row" key={r}>
                  <span className="rn">{r + 1}</span>
                  {seat(r * 2)}
                  <span className="aisle" />
                  {seat(r * 2 + 1)}
                </div>
              ))}
              <div className="cabin-legend">
                <span><i className="va-dot-sel" />Selected</span>
                <span>{SEATS[sel]} · {p.flightCode}</span>
              </div>
            </div>

            <div className="case-open va-case">
              <div className="case-handle" aria-hidden />
              <div className="case-wheel case-wheel-l" aria-hidden />
              <div className="case-wheel case-wheel-r" aria-hidden />

              <div className="case-lid">
                <div className="lid-mesh" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={p.slug}
                    className="va-lid-in"
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease }}
                  >
                    <div className="lid-brand"><img src="/airport-icons/suitcase-1.svg" alt="" />AFA · {p.flightCode}</div>
                    <div className="lid-name">{p.name}</div>
                    <div className="lid-route">{p.routeName}</div>
                    <div className="lid-stickers">
                      <span className="sticker dest">{p.destination}</span>
                      <span className={`sticker stat ${p.status === "Boarding" ? "s-board" : "s-dep"}`}>{p.status}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="case-body">
                <div className="case-lining" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={p.slug}
                    className="va-case-in"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease }}
                  >
                    <img className="case-photo" src={shotFor(p)} alt={`${p.name} screenshot`} />
                    <span className="case-tag">SEAT {SEATS[sel]} · {p.year}</span>
                    <p className="case-note">{p.shortDesc}</p>
                    <div className="case-links">
                      {links.map((l) => (
                        <a key={l.url} className="btn" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
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
            <WindowSky />
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
          <Fade className="kicker" y={10} amount={0.3}>WINDOW SEAT · ABOUT</Fade>
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
          <span className="kicker">BOARDING · GATE A</span>
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

export function VariantA() {
  const here = useHere();
  return (
    <>
      <Sky />
      <TopBar variant="A" here={here} />
      <main className="va">
        <CheckIn />
        <Departures />
        <Gate />
        <WindowSeat />
        <Boarding />
      </main>
    </>
  );
}
