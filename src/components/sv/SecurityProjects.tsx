"use client";

import { useCallback, useSyncExternalStore } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { projects } from "@/data/departures";
import { useSelection } from "./timeline";
import "./security-projects.css";

const ORDER = ["backseat", "rocketship", "waterloo-venture", "waterloo-tech-week"];
const COPY: Record<string, { title: string; line: string; type: string }> = {
  "waterloo-venture": { title: "1,300+ students. 30+ startup placements.", line: "I run Waterloo’s student venture community, connect students with startups, and help founders with market research and partner introductions. WVG has helped founders raise $13.9M.", type: "COMMUNITY / VENTURE" },
  "waterloo-tech-week": { title: "70 events. A week of builders.", line: "I organized Waterloo Tech Week, raised $6K+ in sponsorship, and hosted founder conversations.", type: "COMMUNITY / EVENTS" },
  backseat: { title: "Your GPS. A better voice.", line: "I reverse-engineered Waze’s voice format, built an open-source SDK, and made character voice packs install in one tap.", type: "VOICE / OPEN SOURCE" },
  rocketship: { title: "Five agents. One reality check.", line: "I built five agents to research stocks. Then a simple momentum baseline beat my LLM ranker. The evaluation turned out to be the most useful part.", type: "AI / FINANCE / EVALS" },
};

export function SecurityProjects({ p, reduced }: { p: MotionValue<number>; reduced: boolean }) {
  const [selected, select] = useSelection(p, ORDER.length);
  const current = projects.find(project => project.slug === ORDER[selected])!;
  const copy = COPY[current.slug];
  const itemP = useTransform(p, value => Math.floor(Math.min(.9999, value) * 4) === selected ? value * 4 - selected : .55);
  const subscribe = useCallback((update: () => void) => itemP.on("change", update), [itemP]);
  const snapshot = useCallback(() => reduced || itemP.get() >= .32, [itemP, reduced]);
  const cleared = useSyncExternalStore(subscribe, snapshot, () => true);
  const trayX = useTransform(itemP, [0, .18, .78, 1], [reduced ? "0%" : "-24%", "0%", "0%", reduced ? "0%" : "24%"]);
  const trayScale = useTransform(itemP, [0, .18, .78, 1], [reduced ? 1 : .88, 1, 1, reduced ? 1 : .94]);
  const scanLeft = useTransform(itemP, [.03, .38], ["0%", "100%"]);
  const reveal = useTransform(itemP, value => `inset(0 ${reduced ? 0 : Math.max(0, 100 - value / .38 * 100)}% 0 0)`);
  const beltX = useTransform(p, [0, 1], [0, reduced ? 0 : -720]);
  const flap = useTransform(itemP, [0, .13, .25, 1], [reduced ? 0 : -60, reduced ? 0 : 22, 0, 0]);

  return <div className="sp-scene" data-project-index={selected} data-scan-state={cleared ? "cleared" : "inspecting"}>
    <div className="sp-heading"><p className="sv-eyebrow">02 / SECURITY CHECK · PROJECTS</p><h2>What I’ve been<br /><em>building.</em></h2><p>Four projects. Take a look inside.</p></div>
    <div className="sp-wayfinding" aria-hidden="true"><span>SECURITY</span><b>02</b><i>→</i></div>
    <div className="sp-station">
      <div className="sp-scanner" aria-label={`${current.name} in the project scanner`}>
        <div className="sp-machine-top"><span><i /> CABIN BAGGAGE</span><strong>X-RAY / 02</strong><b>AA</b></div>
        <div className="sp-aperture">
          <div className="sp-curtain sp-curtain-left" aria-hidden="true" /><div className="sp-curtain sp-curtain-right" aria-hidden="true" />
          <motion.div className="sp-tray" style={{ x: trayX, scale: trayScale }}>
            <div className="sp-tray-label"><span>PERSONAL PROJECT</span><b>0{selected + 1}</b></div>
            <div className="sp-project-image">
              <div className="sp-xray-image" aria-hidden="true"><ProjectImage slug={current.slug} src={current.screenshot} name={current.name} /></div>
              <motion.div className="sp-revealed-image" style={{ clipPath: reveal }}><ProjectImage slug={current.slug} src={current.screenshot} name={current.name} /></motion.div>
              {!reduced && <motion.div className="sp-scan-bar" style={{ left: scanLeft }} aria-hidden="true" />}
            </div>
            <span className="sp-tray-ticket">{current.flightCode}{current.year ? ` · ${current.year}` : ""} <b>{current.name}</b></span>
          </motion.div>
          <motion.div className="sp-curtain-lip" style={{ rotateX: flap }} aria-hidden="true" />
        </div>
        <div className="sp-roller-bed" aria-hidden="true"><motion.div style={{ x: beltX }} /></div>
        <div className="sp-machine-bottom"><span>ITEM 0{selected + 1} / 04</span><span className={cleared ? "sp-status is-clear" : "sp-status"}><i />{cleared ? "SCAN COMPLETE" : "SCANNING"}</span></div>
        <i className="sp-machine-leg sp-machine-leg-left" aria-hidden="true" /><i className="sp-machine-leg sp-machine-leg-right" aria-hidden="true" />
      </div>
      <article className="sp-monitor" data-project-detail={current.slug}>
        <div className="sp-monitor-top"><span>INSPECTION MONITOR</span><span>0{selected + 1} / 04</span></div>
        <div className="sp-monitor-content" key={current.slug} tabIndex={0} aria-label={`${current.name} details`}>
          <p className="sp-stack">{copy.type}</p><h3>{current.name}</h3><h4>{copy.title}</h4><p className="sp-description">{copy.line}</p>
          <div className="sp-links">{current.seats[0].links?.map(link => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}<span aria-hidden="true">↗</span></a>)}</div>
        </div>
        <div className="sp-monitor-bottom"><i /> BUILT BY AMMAR ADAM<span>↗</span></div>
      </article>
    </div>
    <nav className="sp-selector" aria-label="Select project">{ORDER.map((slug, index) => <button type="button" key={slug} aria-pressed={selected === index} onClick={() => select(index)}><span>TRAY 0{index + 1}</span><strong><span className="sp-name-full">{projects.find(project => project.slug === slug)!.name}</span><span className="sp-name-short">{["Backseat", "Rocketship", "WVG", "WTW / HTN"][index]}</span></strong><b aria-hidden="true">{selected === index ? "↑" : "→"}</b></button>)}</nav>
  </div>;
}

function ProjectImage({ slug, src, name }: { slug: string; src: string; name: string }) {
  return slug === "canadaclip" ? <div className="sp-clip-preview"><span>CanadaClip <b>CA ↗</b></span><strong>Big-brand link.<br />Local alternative.</strong><p>PASTE → MATCH → SHOP LOCAL</p></div> : <img src={src} alt={`${name} project preview`} width={1000} height={650} style={{ objectFit: "contain", objectPosition: "center 35%" }} />;
}
