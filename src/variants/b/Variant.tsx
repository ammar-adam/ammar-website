"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Sky, TopBar } from "@/variants/shared/Shell";
import { Fade, Lines } from "@/variants/shared/Reveal";
import { arrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { siteConfig } from "@/data/site";
import { boardingPassConfig } from "@/data/boardingPass";
import { Flap } from "./Flap";
import { Window, type View } from "./Window";
import "./b.css";

const ease = [0.22, 1, 0.36, 1] as const;

const STOPS = [
  { id: "checkin", here: "Check-in · you are here" },
  { id: "departures", here: "Departures · 1 min walk" },
  { id: "gates", here: "Gates A1–A4 · 2 min walk" },
  { id: "gate-area", here: "Gate area · 3 min walk" },
  { id: "boarding", here: "Boarding · last call" },
] as const;

/* Board times for the departures table (the data has no dates). */
const TIMES = ["06:10", "07:35", "09:00", "10:20", "12:45", "14:30", "16:05"];

const CARRY_ON = [
  ["01", "Liverpool", "since I was ten"],
  ["02", "Paddington 2", "the best movie ever made"],
  ["03", "Airline economics", "ask me"],
  ["04", "Mango matcha", "and the best shawarma in the GTA"],
];

const shot = (p: (typeof projects)[number]) => (p.slug === "canadaclip" ? "https://img.youtube.com/vi/JzYwfPrcPtM/maxresdefault.jpg" : p.screenshot);

export function VariantB() {
  const [view, setView] = useState<View>(0);
  const [open, setOpen] = useState<number | null>(null);
  const [compact, setCompact] = useState(false);
  const stops = useRef<(HTMLElement | null)[]>([]);
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();

  const pick = () => {
    const line = window.innerHeight * (compact ? 0.62 : 0.5);
    let v: View = 0;
    stops.current.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top <= line) v = i as View;
    });
    setView((cur) => (cur === v ? cur : v));
  };
  useMotionValueEvent(scrollY, "change", pick);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const onMq = () => setCompact(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    pick();
    return () => mq.removeEventListener("change", onMq);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const socials = siteConfig.socialLinks;
  const contacts = [
    ["Email", "ammar.adam@uwaterloo.ca", socials.email],
    ["LinkedIn", "in/ammar-adam", socials.linkedin],
    ["GitHub", "ammar-adam", socials.github],
    ["X", "@ammaradam_5807", socials.x],
  ];

  return (
    <>
      <Sky />
      <TopBar variant="B" here={STOPS[view].here} />
      <main className="vb">
        <aside className="vb-win-wrap">
          <div className="vb-win-sticky">
            <Window view={view} compact={compact} />
          </div>
        </aside>

        <div className="vb-col">
          {/* 1 · Check-in */}
          <section id="checkin" className="vb-stop vb-stop-1" ref={(el) => { stops.current[0] = el; }}>
            <Fade><p className="vb-eyebrow">Check-in</p></Fade>
            <Lines as="h1" className="vb-h1" delay={0.1}>Ammar Adam</Lines>
            <Fade delay={0.35}><p className="vb-intro">CS &amp; Finance at Waterloo. Building AI tools at Sagard, scouting student builders for OpenAI, shipping things on the side.</p></Fade>
            <Fade delay={0.5}>
              <ul className="vb-socials">
                <li><a href={socials.email}>Email</a></li>
                <li><a href={socials.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
                <li><a href={socials.github} target="_blank" rel="noreferrer">GitHub</a></li>
                <li><a href={socials.x} target="_blank" rel="noreferrer">X</a></li>
                <li><a href={boardingPassConfig.resumeFileUrl} target="_blank" rel="noreferrer">Resume</a></li>
              </ul>
            </Fade>
          </section>

          {/* 2 · Departures */}
          <section id="departures" className="vb-stop" ref={(el) => { stops.current[1] = el; }}>
            <Fade><p className="vb-eyebrow">Departures · Where I&apos;ve worked</p></Fade>
            <Fade delay={0.1}>
              <div className="vb-table" role="table" onMouseLeave={() => setOpen(null)}>
                <div className="vb-tr vb-th" role="row">
                  <span>Time</span><span>Flight</span><span className="vb-td-role">Role</span><span className="vb-td-city">From</span><span className="vb-td-status">Status</span>
                </div>
                {arrivals.map((a, i) => {
                  const live = a.status === "Bags loading";
                  const isOpen = open === i;
                  return (
                    <div
                      key={a.slug}
                      className={`vb-tr ${isOpen ? "is-open" : ""}`}
                      role="row"
                      onMouseEnter={() => setOpen(i)}
                      onClick={() => setOpen(isOpen ? null : i)}
                      onFocus={() => setOpen(i)}
                      tabIndex={0}
                    >
                      <span className="vb-td-time">{TIMES[i]}</span>
                      <span className="vb-td-co">
                        {a.fromUrl ? <a href={a.fromUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{a.from}</a> : a.from}
                        <span className="vb-td-role-m">{a.title}</span>
                      </span>
                      <span className="vb-td-role">{a.title}</span>
                      <span className="vb-td-city">{a.origin}</span>
                      <span className={`vb-td-status ${isOpen ? "st-amber" : live ? "st-green" : ""}`}>
                        {isOpen ? <Flap value="BOARDING" /> : live ? "On time" : "Departed"}
                      </span>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            className="vb-impact"
                            initial={reduce ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease }}
                          >
                            <p>{a.impact}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </Fade>
          </section>

          {/* 3 · Gates */}
          <section id="gates" className="vb-stop" ref={(el) => { stops.current[2] = el; }}>
            <Fade><p className="vb-eyebrow">Gates A1–A4 · What I&apos;ve built</p></Fade>
            <div className="vb-grid">
              {projects.map((p, i) => (
                <Fade key={p.slug} delay={0.08 * i} className="vb-proj" amount={0.25}>
                  <a href={p.seats[0].links?.[0]?.url} target="_blank" rel="noreferrer" className="vb-shot">
                    <img src={shot(p)} alt={`${p.name} screenshot`} loading="lazy" />
                  </a>
                  <div className="vb-proj-head">
                    <b>{p.name}</b>
                    <span>{p.year}</span>
                  </div>
                  <p className="vb-proj-route">{p.routeName}</p>
                  <ul className="vb-links">
                    {p.seats[0].links?.map((l) => (
                      <li key={l.url}><a href={l.url} target="_blank" rel="noreferrer">{l.label}</a></li>
                    ))}
                  </ul>
                </Fade>
              ))}
            </div>
          </section>

          {/* 4 · Gate area */}
          <section id="gate-area" className="vb-stop" ref={(el) => { stops.current[3] = el; }}>
            <Fade><p className="vb-eyebrow">Gate area · While we wait</p></Fade>
            <Lines as="p" className="vb-about" delay={0.1} stagger={0.12} amount={0.3}>
              {"I grew up between Toronto, Dubai and Karachi, so a lot of my life happened in departure halls."}
              {"This site lives in one."}
            </Lines>
            <Fade delay={0.3}>
              <p className="vb-label">Carry-on</p>
              <ul className="vb-list">
                {CARRY_ON.map(([n, k, v]) => (
                  <li key={n}><span>{n}</span><b>{k}</b><em>{v}</em></li>
                ))}
              </ul>
            </Fade>
          </section>

          {/* 5 · Boarding */}
          <section id="boarding" className="vb-stop vb-stop-5" ref={(el) => { stops.current[4] = el; }}>
            <Fade><p className="vb-eyebrow">Boarding · Last call</p></Fade>
            <Fade delay={0.1}>
              <div className="intro-boarding-pass-card vb-pass">
                <div className="pass-header">
                  <span><img src="/airport-icons/plane-side.svg" alt="" /> AFA International</span>
                  <span>Boarding pass</span>
                </div>
                <div className="pass-body">
                  <div className="vb-pass-route">
                    <div><b>YYZ</b><small>Toronto</small></div>
                    <i>→</i>
                    <div className="r"><b>TBD</b><small>Next</small></div>
                  </div>
                  <dl className="vb-pass-fields">
                    <div><dt>Passenger</dt><dd>{boardingPassConfig.displayName}</dd></div>
                    <div><dt>Seat</dt><dd>2A</dd></div>
                    <div><dt>Gate</dt><dd>A</dd></div>
                    <div><dt>Group</dt><dd>1</dd></div>
                  </dl>
                  <a href={boardingPassConfig.resumeFileUrl} target="_blank" rel="noreferrer" className="vb-barcode" aria-label="Open resume (PDF)">
                    <span className="vb-bars" />
                    <span className="vb-scan" />
                    <span className="vb-barcode-k">{boardingPassConfig.ctaLabel}</span>
                  </a>
                </div>
              </div>
            </Fade>
            <Fade delay={0.2}>
              <p className="vb-label">Contact</p>
              <ul className="vb-list vb-contacts">
                {contacts.map(([k, v, href]) => (
                  <li key={k}><b>{k}</b><a href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer">{v}</a></li>
                ))}
              </ul>
            </Fade>
            <Fade delay={0.3}>
              <footer className="vb-foot">
                <span>Thanks for flying with me.</span>
                <a href="https://uwaterloo.network" target="_blank" rel="noreferrer" className="vb-ring"><img src="https://uwaterloo.network/icon.svg" alt="" /> uwaterloo.network</a>
                <span>Toronto · Dubai · Karachi</span>
              </footer>
            </Fade>
          </section>
        </div>
      </main>
    </>
  );
}
