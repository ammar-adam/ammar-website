"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { loungeRoomContent } from "@/data/loungeRoom";
import { siteConfig } from "@/data/site";
import { useSceneProgress, useSelection } from "./timeline";

type SceneProps = { chapter: number; t: MotionValue<number>; reduced: boolean; onDirectory: () => void; onEnter: () => void };
export function JourneyScene(props: SceneProps) {
  const p = useSceneProgress(props.t, props.chapter);
  const shared = { p, reduced: props.reduced };
  return <section className={`sv-scene sv-scene-${props.chapter}`} aria-label={["Introduction", "My cities", "Experience", "Projects", "Life", "Contact"][props.chapter]}>
    {props.chapter === 0 && <Arrival {...shared} onEnter={props.onEnter} />}
    {props.chapter === 1 && <Origins {...shared} />}
    {props.chapter === 2 && <Connections {...shared} onDirectory={props.onDirectory} />}
    {props.chapter === 3 && <CarryOn {...shared} />}
    {props.chapter === 4 && <Layover {...shared} />}
    {props.chapter === 5 && <Boarding {...shared} />}
  </section>;
}
type LocalProps = { p: MotionValue<number>; reduced: boolean };

function Arrival({ p, reduced, onEnter }: LocalProps & { onEnter: () => void }) {
  const titleY = useTransform(p, [0, 1], [0, reduced ? 0 : -95]);
  const titleX = useTransform(p, [0, 1], [0, reduced ? 0 : -45]);
  const scale = useTransform(p, [0, 1], [1, reduced ? 1 : 1.22]);
  const kidX = useTransform(p, [0, 1], [0, reduced ? 0 : 125]);
  const line = useTransform(p, [0, 0.8], [0.2, 1]);
  return <>
    <div className="sv-hero-rules" aria-hidden="true"><span /><span /><span /></div>
    <motion.div className="sv-hero-copy" style={{ y: titleY, x: titleX }}>
      <p className="sv-eyebrow"><span className="sv-yellow-square" /> WELCOME TO MY LITTLE CORNER OF THE WORLD</p>
      <h1 className="sv-title"><span>AMMAR</span><span className="sv-title-red">ADAM<span className="sv-title-stop">.</span></span></h1>
      <div className="sv-intro"><span className="sv-handline" aria-hidden="true" /><p>CS &amp; Finance at Waterloo.<br />Always building. Usually in transit.</p></div>
      <button className="sv-enter" onClick={onEnter}><span className="sv-enter-arrow" aria-hidden="true">↓</span> Come on. I’ll show you around.</button>
    </motion.div>
    <div className="sv-terminal-marker" aria-hidden="true"><span>TERMINAL</span><b>01</b><i>↗</i></div>
    <motion.div className="sv-traveler" style={{ scale, x: kidX }} aria-hidden="true"><div className="sv-traveler-shadow" /><img src="/art/traveler.webp" width={683} height={1024} alt="" fetchPriority="high" /></motion.div>
    <motion.div className="sv-runway-line" style={{ scaleX: line }} aria-hidden="true" />
    <span className="sv-hero-coordinate" aria-hidden="true">43°40′ N<br />079°37′ W</span>
  </>;
}

function Origins({ p, reduced }: LocalProps) {
  const x = useTransform(p, [0, 1], [reduced ? 0 : 10, reduced ? 0 : -150]);
  const nearX = useTransform(p, [0, 1], [reduced ? 0 : 180, reduced ? 0 : -220]);
  const scale = useTransform(p, [0, 1], [0.9, reduced ? 0.9 : 1.08]);
  return <>
    <motion.div className="sv-city-signs" style={{ x }}>
      {[{ code: "YYZ", city: "Toronto", note: "WHERE I GREW UP" }, { code: "DXB", city: "Dubai", note: "FAMILY, A FLIGHT AWAY" }, { code: "KHI", city: "Karachi", note: "ANOTHER WAY HOME" }].map((city, i) => <div className={`sv-city-sign sv-city-${i}`} key={city.code}><div className="sv-sign-hanger" /><span className="sv-city-top">CONNECTION 0{i + 1}<i>↗</i></span><strong>{city.code}</strong><span className="sv-city-name">{city.city}</span><small>{city.note}</small></div>)}
    </motion.div>
    <div className="sv-origin-copy"><p className="sv-eyebrow">01 / BETWEEN CITIES</p><h2>A lot of my story<br />lives <em>in between.</em></h2><p>I grew up in Toronto, with family a long flight away.<br className="sv-desktop-break" /> I got very good at airports.</p></div>
    <motion.div className="sv-origin-traveler" style={{ x: nearX, scale }} aria-hidden="true"><img src="/art/traveler.webp" width={683} height={1024} alt="" /></motion.div>
    <div className="sv-window-rail" aria-hidden="true" />
  </>;
}

const FEATURED = ["sagard", "waterloo-venture", "openai", "hack-the-north"];
const EXPERIENCE_COPY: Record<string, { name: string; line: string; detail: string }> = {
  sagard: { name: "Sagard", line: "Making AI useful.", detail: "I build AI tools for Legal & Compliance. Six tools in one hub, and KYC preparation cut from weeks to hours." },
  "waterloo-venture": { name: "Waterloo Venture Group", line: "Good people. Big ideas.", detail: "I run a venture community of 1,300+ students. We’ve helped 30+ students find their way into startups." },
  openai: { name: "OpenAI", line: "Finding the next builders.", detail: "As a Founding Builder Lead, I scout student builders and help them get started with OpenAI’s developer tools." },
  "hack-the-north": { name: "Hack the North / Tech Week", line: "Getting everyone in a room.", detail: "I help bring Waterloo’s builders together: 70 Tech Week events, and Hack the North’s application and selection rubric." },
};

function Connections({ p, reduced, onDirectory }: LocalProps & { onDirectory: () => void }) {
  const [selected, select] = useSelection(p, FEATURED.length);
  const entries = FEATURED.map((slug) => arrivals.find((entry) => entry.slug === slug)!);
  const current = entries[selected];
  const copy = EXPERIENCE_COPY[current.slug];
  const y = useTransform(p, [0, 1], [reduced ? 0 : 20, reduced ? 0 : -20]);
  return <>
    <div className="sv-section-heading"><p className="sv-eyebrow">02 / CONNECTIONS</p><h2>A few places<br />that changed <em>how I work.</em></h2></div>
    <motion.div className="sv-arrivals-board" style={{ y }}>
      <div className="sv-board-heading"><span aria-hidden="true">↘</span><h3>ARRIVALS</h3><small>EXPERIENCE / AFA</small></div>
      <div className="sv-board-columns"><span>GATE</span><span>CONNECTION</span><span>STATUS</span></div>
      {entries.map((entry, i) => <button key={entry.slug} className={`sv-arrival-row ${selected === i ? "is-selected" : ""}`} onClick={() => select(i)} aria-pressed={selected === i}><span>A{i + 1}</span><span>{EXPERIENCE_COPY[entry.slug].name}<small>{entry.title}</small></span><span>{selected === i ? "NOW VIEWING" : "ARRIVED"}<i aria-hidden="true">↗</i></span></button>)}
      <button className="sv-board-more" onClick={onDirectory}>Earlier connections <span>Alpen Capital · DataStealth · Pear VC ↗</span></button>
    </motion.div>
    <motion.div className="sv-experience-detail" key={current.slug} initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: "easeOut" }}>
      <div className="sv-experience-photo"><img src={current.image} alt={`${copy.name} — a place I’ve worked with`} width={800} height={500} style={{ objectPosition: current.slug === "openai" ? "center 35%" : "center" }} /><span className="sv-photo-label">CONNECTION A{selected + 1} / {current.origin.toUpperCase()}</span></div>
      <div className="sv-experience-caption"><span className="sv-detail-number">0{selected + 1}</span><div><h3>{copy.line}</h3><p>{copy.detail}</p>{current.fromUrl && <a className="sv-text-link" href={current.fromUrl} target="_blank" rel="noreferrer">{copy.name} ↗</a>}</div></div>
    </motion.div>
  </>;
}

const PROJECT_ORDER = ["backseat", "rocketship", "canadaclip", "risk-optimized-equity-system"];
const PROJECT_COPY: Record<string, { title: string; line: string; type: string }> = {
  backseat: { title: "A little personality.\nEvery wrong turn.", line: "Pick a character as your Waze navigator. I reverse-engineered the voice format, built an SDK, and made installation one tap.", type: "VOICE / OPEN SOURCE" },
  rocketship: { title: "Five agents.\nOne reality check.", line: "I built a multi-agent equity researcher, then tested it. A simple momentum baseline beat the LLM ranker. The evaluation became the interesting part.", type: "AI / FINANCE / EVALS" },
  canadaclip: { title: "Find the Canadian\nversion.", line: "An iOS App Clip that turns big-brand product recommendations into matches from Canadian small businesses.", type: "iOS / PRODUCT MATCHING" },
  "risk-optimized-equity-system": { title: "Start with the risk.\nBuild from there.", line: "A portfolio builder that estimates volatility and covariance, then uses convex optimization to find a lower-risk allocation.", type: "PYTHON / OPTIMIZATION" },
};

function CarryOn({ p, reduced }: LocalProps) {
  const [selected, select] = useSelection(p, 4);
  const current = projects.find((item) => item.slug === PROJECT_ORDER[selected])!;
  const copy = PROJECT_COPY[current.slug];
  const beltX = useTransform(p, [0, 1], [0, reduced ? 0 : -500]);
  const scanX = useTransform(p, [0, 1], ["0%", "100%"]);
  return <>
    <div className="sv-section-heading"><p className="sv-eyebrow">03 / SECURITY CHECK</p><h2>The carry-on is<br /><em>mostly projects.</em></h2></div>
    <div className="sv-security-sign" aria-hidden="true"><span>↓</span> PLACE IDEAS IN TRAY</div>
    <div className="sv-project-stage">
      <motion.div className="sv-tray-frame" key={`${current.slug}-tray`} initial={reduced ? false : { x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}><div className="sv-tray-top"><span>PERSONAL EFFECTS</span><b>0{selected + 1}</b><span className="sv-cleared">● CLEARED</span></div><div className="sv-project-screen" key={current.slug}>
        {current.slug === "canadaclip" ? <div className="sv-clip-preview"><span>CanadaClip <b>CA ↗</b></span><strong>Big-brand link.<br />Local alternative.</strong><div><span>01 / PASTE A LINK</span><i>→</i><span>02 / FIND A MATCH</span></div><small>PROJECT WORKFLOW · WATCH THE DEMO BELOW</small></div> : <img src={current.screenshot} alt={`${current.name} product screenshot`} width={1000} height={650} />}
        {!reduced && <motion.span className="sv-scan-line" style={{ left: scanX }} aria-hidden="true" />}
      </div><span className="sv-tray-code">{current.flightCode} / {current.year}</span></motion.div>
      <motion.div className="sv-project-copy" key={`${current.slug}-copy`} initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}><span className="sv-eyebrow">{copy.type}</span><h3>{current.name}</h3><h4>{copy.title}</h4><p>{copy.line}</p><div className="sv-project-links">{current.seats[0].links?.map((link) => <a href={link.url} key={link.url} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span></a>)}</div></motion.div>
    </div>
    <div className="sv-project-selector" aria-label="Select project">{PROJECT_ORDER.map((slug, i) => <button key={slug} aria-pressed={selected === i} onClick={() => select(i)}><span>0{i + 1}</span>{projects.find((item) => item.slug === slug)!.name}</button>)}</div>
    <div className="sv-conveyor" aria-hidden="true"><motion.div style={{ x: beltX }} /></div>
  </>;
}

const PHOTO_PICKS = ["/ABOUT1.jpg", "/ABOUT10.jpg", "/ABOUT27.jpg", "/ABOUT6.jpg", "/ABOUT9.jpg"];
function Layover({ p, reduced }: LocalProps) {
  const [selected, select] = useSelection(p, PHOTO_PICKS.length);
  const photos = PHOTO_PICKS.map((src) => loungeRoomContent.photos.items.find((item) => item.src === src)!);
  const x = useTransform(p, [0, 1], [reduced ? 0 : 30, reduced ? 0 : -30]);
  return <>
    <div className="sv-layover-copy"><p className="sv-eyebrow">04 / A LITTLE LAYOVER</p><h2>Life between<br /><em>the flights.</em></h2><p>The people, the places,<br />and the time in between.</p><div className="sv-gate-number" aria-hidden="true"><span>GATE</span><strong>A<span>05</span></strong></div></div>
    <motion.div className="sv-photo-carousel" style={{ x }}>
      {photos.map((photo, i) => <button key={photo.src} className={`sv-memory ${i === selected ? "is-current" : ""}`} style={{ transform: `translateX(${(i - selected) * 108}%) rotate(${i === selected ? -3 : i < selected ? -9 : 7}deg)` }} onClick={() => select(i)} tabIndex={i === selected ? 0 : -1} aria-label={`Photo ${i + 1}: ${photo.caption}`}><img src={photo.src} alt={photo.caption} width={720} height={800} loading="lazy" /><span><small>FRAME 0{i + 1}</small>{photo.caption}</span></button>)}
    </motion.div>
    <div className="sv-memory-controls"><button aria-label="Previous photo" onClick={() => select((selected + photos.length - 1) % photos.length)}>←</button><span>0{selected + 1} <i>/ 05</i></span><button aria-label="Next photo" onClick={() => select((selected + 1) % photos.length)}>→</button></div>
    <div className="sv-gate-mullions" aria-hidden="true"><span /><span /><span /></div><div className="sv-gate-rail" aria-hidden="true" />
  </>;
}

function Boarding({ p, reduced }: LocalProps) {
  const passY = useTransform(p, [0, 0.5, 1], [reduced ? 0 : 70, 0, reduced ? 0 : -12]);
  const passRotate = useTransform(p, [0, 1], [reduced ? -3 : -8, -3]);
  return <>
    <div className="sv-boarding-copy"><p className="sv-eyebrow">05 / NOW BOARDING</p><h2>See you<br /><em>out there.</em></h2><p>That’s where I am.<br />Let’s see what’s next.</p><a className="sv-say-hello" href={siteConfig.socialLinks.email}>Say hello <span aria-hidden="true">↗</span></a><div className="sv-social-links"><a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={siteConfig.socialLinks.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={siteConfig.socialLinks.x} target="_blank" rel="noreferrer">X ↗</a></div></div>
    <motion.a className="sv-boarding-pass" href="/Ammar_Adam.pdf" target="_blank" rel="noreferrer" style={{ y: passY, rotate: passRotate }} aria-label="Open Ammar Adam’s resume PDF in a new tab"><div className="sv-pass-header"><strong>AFA</strong><span>BOARDING PASS<br />ONE-WAY / OPEN ENDED</span><b>↗</b></div><div className="sv-pass-body"><span className="sv-pass-label">PASSENGER</span><strong className="sv-pass-name">ADAM / AMMAR</strong><div className="sv-pass-route"><div><b>YKF</b><span>WATERLOO</span></div><span aria-hidden="true">→</span><div><b>???</b><span>WHAT’S NEXT</span></div></div><div className="sv-pass-fields"><div><small>CLASS</small><span>CS &amp; FINANCE</span></div><div><small>SEAT</small><span>WINDOW, ALWAYS</span></div></div></div><div className="sv-pass-stub"><div className="sv-barcode" aria-hidden="true" /><span>OPEN MY RESUME <b aria-hidden="true">↗</b><small>THE ONE-PAGE VERSION · PDF</small></span></div></motion.a>
    <span className="sv-boarding-footnote">TORONTO · DUBAI · KARACHI · BUILT IN WATERLOO</span>
  </>;
}
