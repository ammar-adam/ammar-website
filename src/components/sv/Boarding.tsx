"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/data/site";
import { Krackle, Plane, SpeedLines } from "./art";
import { Bang, Caption, Cmyk, Kicker, Reveal } from "./ui";

const RESUME = "/Ammar_Adam.pdf";

/* Beats 8 and 9: the boarding pass. Scanning the barcode plays the takeoff
   (plane climbs out of the panel on 3s with echo frames, BOARDING! burst, a
   glitch cut) and then opens the resume about 2.5 s later. */
export function Boarding() {
  const [phase, setPhase] = useState<"idle" | "scan" | "takeoff" | "done">("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const scan = () => {
    if (phase !== "idle" && phase !== "done") return;
    setPhase("scan");
    timers.current.push(window.setTimeout(() => setPhase("takeoff"), 450));
    timers.current.push(
      window.setTimeout(() => {
        window.open(RESUME, "_blank", "noopener");
        setPhase("done");
      }, 2500),
    );
  };

  const s = siteConfig.socialLinks;
  const contacts = [
    { label: "Email", href: s.email, text: "ammar.adam@uwaterloo.ca" },
    { label: "LinkedIn", href: s.linkedin, text: "in/ammar-adam" },
    { label: "GitHub", href: s.github, text: "ammar-adam" },
    { label: "X", href: s.x, text: "@ammaradam_5807" },
    { label: "Webring", href: "https://uwaterloo.network", text: "uwaterloo.network" },
  ];

  return (
    <section id="boarding" className={`boarding ph-${phase}`} aria-label="Boarding pass and contact">
      <Krackle className="k4" seed={4} />
      <Reveal className="sec-head">
        <Kicker>Gate B22 · Now boarding</Kicker>
        <Caption tone="yellow" size="lg" rotate={1}>
          That&apos;s the story so far. Scan the pass for the long version.
        </Caption>
      </Reveal>

      <div className="board-stage">
        <div className="glitch-flash" aria-hidden="true" />

        <Reveal className="pass pop" amount={0.3}>
          <div className="pass-main">
            <div className="pass-head">
              <span className="pass-air">AFA AIR</span>
              <Kicker>Boarding pass</Kicker>
            </div>
            <div className="pass-route">
              <div>
                <span className="pass-k">From</span>
                <span className="pass-code">YKF</span>
                <span className="pass-v">Waterloo</span>
              </div>
              <Plane className="pass-plane-ico" id="pass-pl" accent="var(--sv-mag)" />
              <div className="pass-to">
                <span className="pass-k">To</span>
                <span className="pass-code">???</span>
                <span className="pass-v">Wherever&apos;s next</span>
              </div>
            </div>
            <dl className="pass-grid">
              <div><dt>Passenger</dt><dd>ADAM / AMMAR</dd></div>
              <div><dt>Flight</dt><dd>AA 2026</dd></div>
              <div><dt>Seat</dt><dd>2A</dd></div>
              <div><dt>Class</dt><dd>CS &amp; Finance</dd></div>
              <div><dt>Status</dt><dd>2nd year</dd></div>
              <div><dt>Bags</dt><dd>7 roles · 4 projects</dd></div>
            </dl>
            <button type="button" className="scan-btn" onClick={scan} aria-label="Scan boarding pass to open resume (PDF)">
              <span className="barcode" aria-hidden="true" />
              <span className="scan-laser" aria-hidden="true" />
              <span className="scan-label">{phase === "idle" ? "Scan to open resume" : phase === "done" ? "Scan again" : "Scanning..."}</span>
            </button>
            <a className="pass-fallback" href={RESUME} target="_blank" rel="noreferrer">
              Or just open the PDF
            </a>
          </div>
          <div className="pass-stub">
            <span className="pass-air">AFA AIR</span>
            <span className="stub-code">YKF → ???</span>
            <span className="stub-seat">2A</span>
            <ul className="stub-links">
              {contacts.map((c) => (
                <li key={c.label}>
                  <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                    <b>{c.label}</b> {c.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="takeoff" aria-hidden="true">
          <SpeedLines className="takeoff-speed" n={9} />
          <span className="takeoff-echo e3"><Plane id="to3" /></span>
          <span className="takeoff-echo e2"><Plane id="to2" /></span>
          <span className="takeoff-echo e1"><Plane id="to1" /></span>
          <Plane className="takeoff-plane" id="to0" />
          <Bang text="BOARDING!" className="takeoff-bang" rotate={-10} size={78} color="var(--sv-paper)" burst="var(--sv-red)" />
        </div>
      </div>

      <Reveal className="outro" amount={0.3}>
        <Cmyk as="h2" text="SEE YOU OUT THERE." className="outro-h2" />
        <ul className="outro-links">
          {contacts.map((c) => (
            <li key={c.label}>
              <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {c.label}
              </a>
            </li>
          ))}
          <li><a href={RESUME} target="_blank" rel="noreferrer">Resume</a></li>
        </ul>
        <Caption tone="cream" size="sm" rotate={-1} className="outro-cap">
          Issue #20. Next issue: whenever the next flight lands.
        </Caption>
      </Reveal>
    </section>
  );
}
