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
/* of the viewport; the directory board links to them.                 */
/* ------------------------------------------------------------------ */
const STOPS = [
  { id: "checkin", gate: "", here: "Check-in · Hall A", dest: "CHECK-IN", info: "", status: "" },
  { id: "security", gate: "A", here: "Security · Bag check", dest: "SECURITY", info: "Things I've built", status: "NOW BOARDING" },
  { id: "window", gate: "B", here: "Window seat · 2A", dest: "WINDOW SEAT", info: "About me", status: "ON TIME" },
  { id: "claim", gate: "C", here: "Baggage claim · Carousel 3", dest: "BAGGAGE CLAIM", info: "Where I've worked", status: "ON TIME" },
  { id: "boarding", gate: "D", here: "Boarding · Final call", dest: "BOARDING PASS", info: "Resume and contact", status: "FINAL CALL" },
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
function WindowSky() {
  return (
    <div className="win-inner" aria-hidden>
      <div className="sky">
        <div className="sky-grad" />
        <div className="sky-clouds sky-clouds-a" />
        <div className="sky-clouds sky-clouds-b" />
        <video className="sky-video" autoPlay muted loop playsInline preload="metadata" poster={cloudPosterUrl}>
          <source src={cloudVideoUrl} type="video/mp4" />
        </video>
        <div className="sky-grain" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1 · Check-in: name, window, then the directory board                */
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
    </section>
  );
}

/** The terminal directory: the split-flap board as navigation, like the live home. */
function Directory() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useInView(ref, { once: true, amount: 0.4 });
  const rows = STOPS.filter((s) => s.gate);
  return (
    <div className="wrap va-directory" ref={ref}>
      <div className="va-scene-head">
        <span className="kicker">TERMINAL DIRECTORY</span>
        <small>Pick a gate</small>
      </div>
      <div className="fboard va-board">
        <div className="fboard-head">
          <div className="fh-l"><i className="fh-dot" />DEPARTURES</div>
          <div className="fh-clock">AFA</div>
        </div>
        <div className="fboard-cols va-dir-cols">
          <span>GATE</span><span>DESTINATION</span><span>INFO</span><span>STATUS</span>
        </div>
        {rows.map((r, i) => (
          <a key={r.id} href={`#${r.id}`} className="fboard-row va-dir-row">
            <span className="fr-gate">{r.gate}</span>
            <span className="fr-dest"><Flap value={live ? r.dest : ""} length={13} perChar={22} /></span>
            <span className="fr-info">{r.info}</span>
            <span className={`fr-status ${r.status === "ON TIME" ? "st-green" : "st-amber"}`}>
              <i /><Flap value={live ? r.status : ""} length={12} perChar={18} stepMs={30 + i * 2} />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · Security: the bag rides into the X-ray, comes out, and opens.   */
/*     Inside are the projects.                                        */
/* ------------------------------------------------------------------ */
const SEATS = ["1A", "1B", "2A", "2B"];

function Security() {
  const ref = useRef<HTMLElement>(null);
  const n = projects.length;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(p, { stiffness: 110, damping: 26, mass: 0.5 });

  // Belt choreography, as fractions of the pinned scroll.
  const bagX = useTransform(smooth, [0, 0.16, 0.34, 0.46], ["-52vw", "0vw", "0vw", "52vw"]);
  const bagOpacity = useTransform(smooth, [0.44, 0.5], [1, 0]);
  const beltOpacity = useTransform(smooth, [0.42, 0.56], [1, 0]);
  const beltY = useTransform(smooth, [0.42, 0.56], ["0px", "-40px"]);
  const xray = useTransform(smooth, [0.14, 0.18, 0.32, 0.36], [0, 1, 1, 0]);
  const caseOpacity = useTransform(smooth, [0.5, 0.6], [0, 1]);
  const caseY = useTransform(smooth, [0.5, 0.62], ["48px", "0px"]);
  const lidOpen = useTransform(smooth, [0.54, 0.7], [0, 1]);
  const lidRot = useTransform(lidOpen, [0, 1], [-96, 0]);

  const phase = useStepFrom(p, 3, 0, 0.5); // 0 approaching · 1 inside · 2 leaving
  const sel = useStepFrom(p, n, 0.6, 1);
  const proj = projects[sel];
  const links = proj.seats[0]?.links ?? [];

  const hint = phase === 0 ? "Place your bag on the belt" : phase === 1 ? "Scanning" : "Cleared · Open your bag";

  return (
    <section id="security" ref={ref} className="va-scene va-pinwrap va-pinwrap-sec">
      <div className="va-pin">
        <div className="wrap">
          <div className="va-scene-head">
            <span className="kicker">GATE A · SECURITY · PROJECTS</span>
            <small aria-live="polite">{hint}</small>
          </div>

          <div className="va-stage">
            {/* Belt + scanner */}
            <motion.div className="va-belt-wrap" style={{ opacity: beltOpacity, y: beltY }} aria-hidden>
              <div className="va-scanner">
                <div className="va-scanner-top">
                  <span><i className="va-led" />X-RAY · LANE 2</span>
                  <motion.span className="va-scanner-count" style={{ opacity: xray }}>4 ITEMS · CLEARED</motion.span>
                </div>
                <div className="va-tunnel">
                  <motion.div className="va-xray" style={{ opacity: xray }}>
                    <div className="va-xray-bag">
                      {projects.map((q, i) => (
                        <img key={q.slug} src={shotFor(q)} alt="" className={`va-xray-item va-xray-item-${i}`} />
                      ))}
                    </div>
                    <span className="va-xray-scan" />
                  </motion.div>
                  <span className="va-curtain va-curtain-l" />
                  <span className="va-curtain va-curtain-r" />
                </div>
              </div>
              <div className="va-belt">
                <motion.div className="va-tray" style={{ x: bagX, opacity: bagOpacity }}>
                  <div className="va-bag">
                    <span className="va-bag-handle" />
                    <span className="va-bag-tag">AA · YYZ</span>
                    <span className="va-bag-stripe" />
                  </div>
                </motion.div>
                <div className="va-rollers" />
              </div>
            </motion.div>

            {/* Open suitcase with the projects */}
            <motion.div className="va-case-wrap" style={{ opacity: caseOpacity, y: caseY }}>
              <div className="va-items" role="tablist" aria-label="Projects">
                {projects.map((q, i) => (
                  <button
                    key={q.slug}
                    role="tab"
                    aria-selected={sel === i}
                    className={`va-item ${sel === i ? "sel" : ""}`}
                    onClick={() => jumpToStep(ref.current, i, n, 0.6, 1)}
                  >
                    <span className="va-item-no">{pad2(i + 1)}</span>
                    <span className="va-item-name">{q.name}</span>
                    <span className="va-item-year">{q.year}</span>
                  </button>
                ))}
              </div>

              <div className="case-open va-case">
                <div className="case-handle" aria-hidden />
                <div className="case-wheel case-wheel-l" aria-hidden />
                <div className="case-wheel case-wheel-r" aria-hidden />

                <motion.div className="case-lid va-lid" style={{ rotateX: lidRot }}>
                  <div className="lid-mesh" />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={proj.slug}
                      className="va-lid-in"
                      initial={{ opacity: 0, y: -14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.45, ease }}
                    >
                      <div className="lid-brand"><img src="/airport-icons/suitcase-1.svg" alt="" />AFA · {proj.flightCode}</div>
                      <div className="lid-name">{proj.name}</div>
                      <div className="lid-route">{proj.routeName}</div>
                      <div className="lid-stickers">
                        <span className="sticker dest">{proj.destination}</span>
                        <span className={`sticker stat ${proj.status === "Boarding" ? "s-board" : "s-dep"}`}>{proj.status}</span>
                      </div>
                      <dl className="va-lid-meta">
                        <div><dt>Flight</dt><dd>{proj.flightCode}</dd></div>
                        <div><dt>Gate</dt><dd>{proj.gate}</dd></div>
                        <div><dt>Seat</dt><dd>{SEATS[sel]}</dd></div>
                        <div><dt>Year</dt><dd>{proj.year}</dd></div>
                      </dl>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                <div className="case-body">
                  <div className="case-lining" />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={proj.slug}
                      className="va-case-in"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.45, ease }}
                    >
                      <img className="case-photo" src={shotFor(proj)} alt={`${proj.name} screenshot`} />
                      <span className="case-tag">ITEM {pad2(sel + 1)} · {proj.year}</span>
                      <p className="case-note">{proj.shortDesc}</p>
                      <div className="case-links">
                        {links.map((l) => (
                          <a key={l.url} className="btn" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · Window seat (about)                                             */
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
          <Fade className="kicker" y={10} amount={0.3}>GATE B · WINDOW SEAT · ABOUT</Fade>
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
/* 4 · Baggage claim: experience as bags on the carousel. Scrolling    */
/*     moves the belt; the bag in front of you opens its claim ticket. */
/* ------------------------------------------------------------------ */
const CODES: Record<string, string> = { Dubai: "DXB", Mississauga: "YYZ", Toronto: "YYZ", Waterloo: "YKF", "San Francisco": "SFO", "Palo Alto": "SFO" };

function Claim() {
  const ref = useRef<HTMLElement>(null);
  const n = arrivals.length;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(p, { stiffness: 170, damping: 30, mass: 0.4 });
  const sel = useStepFrom(p, n);
  const a = arrivals[sel];

  // Bag width and gap come from CSS (they change on phones), so measure them.
  const trackRef = useRef<HTMLDivElement>(null);
  const dims = useRef({ w: 212, step: 238 });
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      const bags = el.querySelectorAll<HTMLElement>(".bag");
      if (bags.length > 1) dims.current = { w: bags[0].offsetWidth, step: bags[1].offsetLeft - bags[0].offsetLeft };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Belt offset: bag i is centred when progress sits in the middle of its step.
  const beltX = useTransform(smooth, (v) => {
    const t = Math.min(0.999, Math.max(0, v)) * n - 0.5;
    const i = Math.max(0, Math.min(n - 1, t));
    const { w, step } = dims.current;
    return `calc(50% - ${w / 2 + i * step}px)`;
  });

  return (
    <section id="claim" ref={ref} className="va-scene va-pinwrap va-pinwrap-claim">
      <div className="va-pin">
        <div className="wrap">
          <div className="va-scene-head">
            <span className="kicker">GATE C · BAGGAGE CLAIM · EXPERIENCE</span>
            <small>Carousel 3 · bag {pad2(sel + 1)} / {pad2(n)}</small>
          </div>

          <div className="claim va-claim">
            <div className="carousel va-carousel">
              <div className="belt-tex" aria-hidden />
              <motion.div className="belt-track va-belt-track" ref={trackRef} style={{ x: beltX }}>
                {arrivals.map((b, i) => (
                  <button
                    key={b.slug}
                    type="button"
                    className={`bag va-claim-bag ${sel === i ? "sel" : ""}`}
                    aria-pressed={sel === i}
                    onClick={() => jumpToStep(ref.current, i, n)}
                  >
                    {b.image ? <img className="b-img" src={b.image} alt="" /> : <div className="b-img" />}
                    <span className="b-tag">{b.origin}</span>
                    <div className="b-body">
                      <div className="b-from">{b.from}</div>
                      <div className="b-title">{b.title}</div>
                      <div className="b-strip" aria-hidden />
                    </div>
                  </button>
                ))}
              </motion.div>
              <div className="belt-rollers" aria-hidden />
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={a.slug}
                className="va-ticket"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease }}
              >
                <div className="va-ticket-l">
                  <span className="claim-tag">{CODES[a.origin] ?? "AFA"} · {a.origin.toUpperCase()}</span>
                  <div className="va-ticket-co">{a.from}</div>
                  <div className="va-ticket-role">{a.detailTitle ?? a.title}</div>
                </div>
                <div className="va-ticket-r">
                  <p className="va-ticket-impact">{a.impact}</p>
                  <p className="va-ticket-details">{a.details}</p>
                  <div className="va-ticket-links">
                    {a.fromUrl && <a href={a.fromUrl} target="_blank" rel="noreferrer">{host(a.fromUrl)} ↗</a>}
                    {a.links?.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
                    ))}
                  </div>
                </div>
                <div className="va-ticket-bar" aria-hidden />
              </motion.div>
            </AnimatePresence>
          </div>
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
        <Directory />
        <Security />
        <WindowSeat />
        <Claim />
        <Boarding />
      </main>
    </>
  );
}
