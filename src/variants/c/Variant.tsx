"use client";

import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { arrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { boardingPassConfig } from "@/data/boardingPass";
import { siteConfig } from "@/data/site";
import { Sky, TopBar, cloudVideoUrl } from "@/variants/shared/Shell";
import { Flaps } from "./Flaps";
import "./c.css";

/* ------------------------------------------------------------------ data */

const ZONES = [
  { id: "check-in", name: "Check-in", eyebrow: "CHECK-IN · AFA INTERNATIONAL", ghost: "CHECK-IN" },
  { id: "departures", name: "Departures", eyebrow: "DEPARTURES · EXPERIENCE", ghost: "DEPARTURES" },
  { id: "gates", name: "Gates", eyebrow: "GATES A1 – A4 · PROJECTS", ghost: "GATES" },
  { id: "gate-area", name: "Gate area", eyebrow: "GATE AREA · ABOUT", ghost: "GATE AREA" },
  { id: "boarding", name: "Boarding", eyebrow: "BOARDING · RESUME & CONTACT", ghost: "BOARDING" },
] as const;

const LAST = ZONES.length - 1;
const HOLD = 0.1; // fraction of the scroll held still at each end

const INTRO = "CS & Finance at Waterloo. Building AI tools at Sagard, scouting student builders for OpenAI, shipping things on the side.";
const ABOUT = [
  "I grew up between Toronto, Dubai and Karachi, so a lot of my life happened in departure halls. This site lives in one.",
  "Liverpool since I was ten. Paddington 2 is the best movie ever made. Ask me about airline economics, mango matcha, or the best shawarma in the GTA.",
];

const SOCIALS = [
  { label: "Email", href: siteConfig.socialLinks.email },
  { label: "LinkedIn", href: siteConfig.socialLinks.linkedin },
  { label: "GitHub", href: siteConfig.socialLinks.github },
  { label: "X", href: siteConfig.socialLinks.x },
];

const GATE_LABELS = ["A1", "A2", "A3", "A4"];
const shotFor = (p: (typeof projects)[number]) => (p.slug === "canadaclip" ? "https://img.youtube.com/vi/JzYwfPrcPtM/maxresdefault.jpg" : p.screenshot);

/* Board: company label and role, split where the data joins two names with " / ". */
const boardRows = arrivals.map((a, i) => {
  const [company, extra] = a.from.split(" / ");
  return {
    ...a,
    no: String(i + 1).padStart(2, "0"),
    company,
    role: extra ? `${a.title} · ${extra}` : a.title,
    boardStatus: a.status === "Bags ready" ? "ARRIVED" : "BOARDING",
    tone: a.status === "Bags ready" ? "st-green" : "st-amber",
  };
});

/* Carry-on: what he is carrying right now, straight from the data. */
const carryOn = arrivals.filter((a) => a.status === "Bags loading");

/* ------------------------------------------------------------------ hooks */

function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/* ------------------------------------------------------------------ pieces */

/* Faint zone name behind the panel; lags the strip so the walk reads as depth. */
function Ghost({ text, index, pos }: { text: string; index: number; pos: MotionValue<number> | null }) {
  const still = useMotionValue(index);
  const x = useTransform(pos ?? still, (v) => (v - index) * 140);
  return (
    <motion.span className="vc-ghost" style={pos ? { x } : undefined} aria-hidden>
      {text}
    </motion.span>
  );
}

function Zone({
  z,
  index,
  pos,
  children,
  onFocusZone,
}: {
  z: (typeof ZONES)[number];
  index: number;
  pos: MotionValue<number> | null;
  children: React.ReactNode;
  onFocusZone: (i: number) => void;
}) {
  return (
    <section id={z.id} className="vc-zone" data-zone={index} aria-label={z.name} onFocus={() => onFocusZone(index)}>
      <Ghost text={z.ghost} index={index} pos={pos} />
      <div className="vc-panel">
        <div className="vc-eyebrow">
          <span className="kicker">{z.eyebrow}</span>
          <span className="vc-eyebrow-no">{String(index + 1).padStart(2, "0")}</span>
        </div>
        {children}
      </div>
    </section>
  );
}

function Window() {
  return (
    <div className="window vc-window" aria-hidden>
      <div className="win-inner">
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
      <div className="win-frame" />
      <div className="flight-card">
        <div className="fc-top">
          <span className="fc-route">YYZ → DXB → KHI</span>
          <span className="fc-status">HOME</span>
        </div>
        <div className="fc-bar"><i /></div>
        <div className="fc-sub">
          <span>TORONTO · DUBAI · KARACHI</span>
          <span>3 CITIES</span>
        </div>
      </div>
    </div>
  );
}

function Board({ armed, animate }: { armed: boolean; animate: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="fboard vc-board" style={{ "--cols": "34px 1fr 1fr 120px 128px" } as React.CSSProperties}>
      <div className="fboard-head">
        <div className="fh-l"><span className="fh-dot" />EXPERIENCE</div>
        <div className="fh-clock">{boardRows.length} FLIGHTS</div>
      </div>
      <div className="fboard-cols" aria-hidden>
        <span>NO</span><span>FROM</span><span>ROLE</span><span>CITY</span><span>STATUS</span>
      </div>
      <ul className="vc-rows">
        {boardRows.map((r, i) => (
          <li key={r.slug} className={`fboard-row vc-row${open === i ? " is-open" : ""}`} style={{ "--i": i } as React.CSSProperties}>
            <button
              type="button"
              className="vc-row-btn"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="vc-no">{r.no}</span>
              <span className="vc-from">
                {armed ? <Flaps value={r.company} length={18} animate={animate} baseDelay={i * 130} /> : <Flaps value="" length={18} animate={false} />}
              </span>
              <span className="vc-role" data-city={r.origin}>{r.role}</span>
              <span className="vc-city">{r.origin}</span>
              <span className={`fr-status ${r.tone} vc-status`}>
                <i />
                {armed ? <Flaps value={r.boardStatus} length={8} animate={animate} baseDelay={i * 130 + 260} /> : <Flaps value="" length={8} animate={false} />}
              </span>
            </button>
            <div className="vc-more">
              <p>
                {r.impact}
                {r.fromUrl && (
                  <a href={r.fromUrl} target="_blank" rel="noopener noreferrer" className="vc-more-link">
                    {r.company} ↗
                  </a>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pass() {
  const [scanning, setScanning] = useState(false);
  return (
    <div className="pass vc-pass">
      <div className="pass-main">
        <div className="pm-head">
          <span className="pm-wm"><img src="/airport-icons/plane-side.svg" alt="" />AFA INTERNATIONAL</span>
          <span className="pm-cls">BOARDING PASS</span>
        </div>
        <div className="pass-route">
          <div>
            <div className="pr-code">{boardingPassConfig.from}</div>
            <div className="pr-lbl">TORONTO</div>
          </div>
          <div className="pr-mid">→</div>
          <div className="pr-r">
            <div className="pr-code">TBD</div>
            <div className="pr-lbl">NEXT</div>
          </div>
        </div>
        <div className="pass-fields">
          <div className="pass-field"><div className="pf-k">Passenger</div><div className="pf-v">{boardingPassConfig.displayName}</div></div>
          <div className="pass-field"><div className="pf-k">Seat</div><div className="pf-v">2A</div></div>
          <div className="pass-field"><div className="pf-k">Status</div><div className="pf-v">{boardingPassConfig.tagline}</div></div>
        </div>
      </div>
      <div className="pass-stub">
        <div className="ps-k">Flight</div>
        <div className="ps-v">{boardingPassConfig.flight}</div>
        <div className="ps-k">Seat</div>
        <div className="ps-v">2A</div>
        <a
          href={boardingPassConfig.resumeFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`scan-btn${scanning ? " scanning" : ""}`}
          onMouseEnter={() => setScanning(true)}
          onMouseLeave={() => setScanning(false)}
          onFocus={() => setScanning(true)}
          onBlur={() => setScanning(false)}
          aria-label="Open resume (PDF)"
        >
          <span className="scan-frame">
            <span className="ps-bar" />
            <span className="scan-laser" />
          </span>
          <span className="scan-hint">{boardingPassConfig.ctaLabel.toUpperCase()}</span>
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ variant */

export function VariantC() {
  const walkRef = useRef<HTMLDivElement>(null);
  const isMobile = useMedia("(max-width: 900px)");
  const reduced = useReducedMotion() ?? false;
  const [zone, setZone] = useState(0);
  const [armed, setArmed] = useState(false);

  /* scroll progress → zone position (0..LAST) with a hold at both ends → spring */
  const { scrollYProgress } = useScroll({ target: walkRef, offset: ["start start", "end end"] });
  const raw = useTransform(scrollYProgress, [0, HOLD, 1 - HOLD, 1], [0, 0, LAST, LAST]);
  const sprung = useSpring(raw, { stiffness: 80, damping: 24, restDelta: 0.0005 });
  const pos = reduced ? raw : sprung;
  const x = useTransform(pos, (v) => `${(-v * 100) / ZONES.length}%`);

  useMotionValueEvent(raw, "change", (v) => {
    if (isMobile) return;
    const z = Math.round(v);
    setZone((cur) => (cur === z ? cur : z));
    if (v > 0.45) setArmed(true);
  });

  /* mobile: stacked sections, IntersectionObserver drives the marker */
  useEffect(() => {
    if (!isMobile) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".vc-zone"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number(e.target.getAttribute("data-zone"));
          if (e.isIntersecting) {
            setZone(i);
            if (i >= 1) setArmed(true);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isMobile]);

  /* keyboard: focusing into an offscreen zone walks the page there */
  const focusZone = useCallback(
    (i: number) => {
      if (isMobile || !walkRef.current || i === Math.round(raw.get())) return;
      const el = walkRef.current;
      const top = el.offsetTop;
      const travel = el.offsetHeight - window.innerHeight;
      const p = HOLD + (i / LAST) * (1 - 2 * HOLD);
      window.scrollTo({ top: top + p * travel, behavior: reduced ? "auto" : "smooth" });
    },
    [isMobile, raw, reduced],
  );

  const here = `You are here · ${ZONES[zone].name}`;
  const stripPos = isMobile ? null : pos;

  return (
    <>
      <Sky />
      <TopBar variant="C" here={here} />
      <main className="vc">
        <div className="vc-walk" ref={walkRef}>
          <div className="vc-stage">
            <motion.div className="vc-strip" style={isMobile ? undefined : { x }}>
              {/* 01 · Check-in */}
              <Zone z={ZONES[0]} index={0} pos={stripPos} onFocusZone={focusZone}>
                <h1 className="vc-h1">Ammar Adam</h1>
                <p className="vc-intro">{INTRO}</p>
                <ul className="vc-links">
                  {SOCIALS.map((s) => (
                    <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>
                  ))}
                </ul>
                <p className="vc-hint" aria-hidden>
                  <span className="vc-hint-desk">scroll to walk <i>→</i></span>
                  <span className="vc-hint-mob">scroll <i>↓</i></span>
                </p>
              </Zone>

              {/* 02 · Departures */}
              <Zone z={ZONES[1]} index={1} pos={stripPos} onFocusZone={focusZone}>
                <Board armed={armed} animate={!reduced} />
                <p className="vc-note">Hover or tap a row for the one-line version.</p>
              </Zone>

              {/* 03 · Gates */}
              <Zone z={ZONES[2]} index={2} pos={stripPos} onFocusZone={focusZone}>
                <ul className="vc-gates">
                  {projects.map((p, i) => (
                    <li key={p.slug} className="vc-gate">
                      <div className={`vc-gate-shot${p.slug === "canadaclip" ? " is-poster" : ""}`}><img src={shotFor(p)} alt={`${p.name} screenshot`} loading="lazy" /></div>
                      <div className="vc-gate-meta">
                        <span className="vc-gate-no">{GATE_LABELS[i]} · {p.year}</span>
                        <h3>{p.name}</h3>
                        <p>{p.routeName}</p>
                        <div className="vc-gate-links">
                          {p.seats[0].links?.map((l) => (
                            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Zone>

              {/* 04 · Gate area */}
              <Zone z={ZONES[3]} index={3} pos={stripPos} onFocusZone={focusZone}>
                <div className="vc-about">
                  <div className="vc-about-copy">
                    {ABOUT.map((s) => <p key={s}>{s}</p>)}
                    <div className="vc-carry">
                      <span className="label">CARRY-ON · NOW</span>
                      <ul>
                        {carryOn.map((a) => (
                          <li key={a.slug}><span>{a.title}</span><span className="vc-carry-at">{a.from.split(" / ")[0]}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Window />
                </div>
              </Zone>

              {/* 05 · Boarding */}
              <Zone z={ZONES[4]} index={4} pos={stripPos} onFocusZone={focusZone}>
                <Pass />
                <ul className="vc-links vc-links-contact">
                  {SOCIALS.map((s) => (
                    <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>
                  ))}
                </ul>
              </Zone>
            </motion.div>

            {/* floor: the walkway rail with the old ticker */}
            <div className="vc-floor" aria-hidden>
              <div className="vc-index">
                <b>{String(zone + 1).padStart(2, "0")}</b>
                <span>— {String(ZONES.length).padStart(2, "0")}</span>
              </div>
              <div className="ticker vc-ticker">
                <div className="ticker-track">
                  {[0, 1].map((rep) =>
                    siteConfig.tickerIdentifiers.map((t, i) => (
                      <span key={`${rep}-${i}`} className="ticker-item">
                        {t}<span className="dot">→</span>
                      </span>
                    )),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="vc-foot">
          <span>Thanks for flying with me.</span>
          <a href="https://uwaterloo.network" target="_blank" rel="noopener noreferrer" className="vc-ring">
            <img src="https://uwaterloo.network/icon.svg" alt="" width={16} height={16} />
            uwaterloo.network
          </a>
          <span className="vc-cities">Toronto · Dubai · Karachi</span>
        </footer>
      </main>
    </>
  );
}
