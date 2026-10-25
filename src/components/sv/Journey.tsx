"use client";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { projects } from "@/data/departures";
import { siteConfig } from "@/data/site";
import { useSceneProgress, useSelection } from "./timeline";
import { PersonalLife } from "./PersonalLife";

type SceneProps = { chapter: number; t: MotionValue<number>; reduced: boolean; onDirectory: () => void; onGallery: (index?:number) => void; onEnter: () => void };
export function JourneyScene(props: SceneProps) {
  const p = useSceneProgress(props.t, props.chapter);
  const shared = { p, reduced: props.reduced };
  return <section className={`sv-scene sv-scene-${props.chapter}`} aria-label={["Introduction", "Experience", "Projects", "Personal life", "Contact"][props.chapter]}>
    {props.chapter === 0 && <Arrival {...shared} onEnter={props.onEnter} />}
    {props.chapter === 1 && <Connections {...shared} onDirectory={props.onDirectory} />}
    {props.chapter === 2 && <CarryOn {...shared} />}
    {props.chapter === 3 && <PersonalLife {...shared} onGallery={props.onGallery} />}
    {props.chapter === 4 && <Boarding {...shared} />}
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
      <p className="sv-eyebrow"><span className="sv-yellow-square" /> HEY. I’M</p>
      <h1 className="sv-title"><span>AMMAR</span><span className="sv-title-red">ADAM<span className="sv-title-stop">.</span></span></h1>
      <div className="sv-intro"><span className="sv-handline" aria-hidden="true" /><p>CS &amp; Finance at Waterloo.<br />I build AI tools and bring builders together.</p></div>
      <button className="sv-enter" onClick={onEnter}><span className="sv-enter-arrow" aria-hidden="true">↓</span> Here’s what I’ve been working on.</button>
    </motion.div>
    <div className="sv-terminal-marker" aria-hidden="true"><span>THE STORY</span><b>SO FAR</b><i>↗</i></div>
    <motion.div className="sv-traveler" style={{ scale, x: kidX }} aria-hidden="true"><div className="sv-traveler-shadow" /><img src="/art/traveler-v2.webp" width={683} height={1024} alt="" fetchPriority="high" /></motion.div>
    <motion.div className="sv-runway-line" style={{ scaleX: line }} aria-hidden="true" />

  </>;
}

const EXPERIENCE_ORDER = ["sagard", "openai", "waterloo-venture", "hack-the-north", "pear-vc", "datastealth", "alpen-capital"];
const WORK: Record<string, {name:string; result:string; detail:string}> = {
  sagard: {name:"Sagard", result:"6 tools. One Legal AI Hub.", detail:"I build AI tools for Legal & Compliance and work on a local-LLM computer-use agent. As an intern, I cut KYC preparation from weeks to hours."},
  openai: {name:"OpenAI", result:"One of five across North America.", detail:"I scout student builders and help grow adoption of OpenAI’s developer tools as a Founding Builder Lead."},
  "waterloo-venture": {name:"Waterloo Venture Group", result:"1,300+ students. 30+ startup placements.", detail:"I run the student venture community and support founders with market research and partner introductions."},
  "hack-the-north": {name:"Hack the North / Tech Week", result:"70 events. A week of builders.", detail:"I organized Waterloo Tech Week, raised $6K+ in sponsorship, and designed Hack the North’s application and selection rubric."},
  "pear-vc": {name:"Pear VC", result:"Finding founders early.", detail:"I source and evaluate early-stage startups and founder talent. Selected as one of roughly 50 fellows from 650+ applicants."},
  datastealth: {name:"DataStealth", result:"Demo setup: months → hours.", detail:"I built a demo environment across eight product capabilities and automated competitor research."},
  "alpen-capital": {name:"Alpen Capital", result:"$50M+ in deal flow. At sixteen.", detail:"I supported buy- and sell-side equity advisory, learning financial modelling and investment research as the firm’s youngest intern."},
};

function Connections({p,reduced,onDirectory}:LocalProps & {onDirectory:()=>void}) {
  const [selected,select]=useSelection(p,EXPERIENCE_ORDER.length);
  const current=arrivals.find(a=>a.slug===EXPERIENCE_ORDER[selected])!;
  const copy=WORK[current.slug];
  const y=useTransform(p,[0,1],[reduced?0:15,reduced?0:-15]);
  return <>
    <div className="sv-section-heading sv-work-heading"><p className="sv-eyebrow">01 / EXPERIENCE</p><h2>What I <em>do.</em></h2><p className="sv-section-deck">AI engineering, student builders, and early-stage companies.</p></div>
    <motion.div className="sv-work-list" style={{y}} aria-label="Choose an experience">
      {EXPERIENCE_ORDER.map((slug,i)=>{const a=arrivals.find(entry=>entry.slug===slug)!; return <button key={slug} className={selected===i?"is-selected":""} onClick={()=>select(i)} aria-pressed={selected===i}><span className="sv-work-index">0{i+1}</span><span><strong>{WORK[slug].name}</strong><small>{a.title}</small></span><span className="sv-work-arrow" aria-hidden="true">↗</span></button>})}
      <button className="sv-work-full" onClick={onDirectory}>Full experience & links <span aria-hidden="true">↗</span></button>
    </motion.div>
    <motion.article className="sv-work-detail" key={current.slug} initial={reduced?false:{opacity:0,x:25}} animate={{opacity:1,x:0}} transition={{duration:.25}}>
      <div className="sv-work-image"><img src={current.image} alt={copy.name} width={800} height={500} style={{objectPosition:current.slug==="openai"?"center 35%":"center"}} /><span>{current.origin}</span></div>
      <div className="sv-work-copy"><p className="sv-work-role">{current.detailTitle??current.title}</p><h3>{copy.result}</h3><p>{copy.detail}</p><div className="sv-work-links">{(current.links??(current.fromUrl?[{label:copy.name,url:current.fromUrl}]:[])).map(link=><a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div></div>
    </motion.article>
  </>;
}

const PROJECT_ORDER = ["backseat", "rocketship", "canadaclip", "risk-optimized-equity-system"];
const PROJECT_COPY: Record<string, { title: string; line: string; type: string }> = {
  backseat: { title: "Custom voices for Waze.", line: "Pick a character as your Waze navigator. I reverse-engineered the voice format, built an SDK, and made installation one tap.", type: "VOICE / OPEN SOURCE" },
  rocketship: { title: "Multi-agent equity research.", line: "I built a multi-agent equity researcher, then tested it. A simple momentum baseline beat the LLM ranker. The evaluation became the interesting part.", type: "AI / FINANCE / EVALS" },
  canadaclip: { title: "Find Canadian alternatives.", line: "An iOS App Clip that turns big-brand product recommendations into matches from Canadian small businesses.", type: "iOS / PRODUCT MATCHING" },
  "risk-optimized-equity-system": { title: "Portfolio construction with less risk.", line: "A portfolio builder that estimates volatility and covariance, then uses convex optimization to find a lower-risk allocation.", type: "PYTHON / OPTIMIZATION" },
};

function CarryOn({ p, reduced }: LocalProps) {
  const [selected, select] = useSelection(p, 4);
  const current = projects.find((item) => item.slug === PROJECT_ORDER[selected])!;
  const copy = PROJECT_COPY[current.slug];
  const beltX = useTransform(p, [0, 1], [0, reduced ? 0 : -500]);
  const scanX = useTransform(p, [0, 1], ["0%", "100%"]);
  return <>
    <div className="sv-section-heading"><p className="sv-eyebrow">02 / PROJECTS</p><h2>Things I’ve<br /><em>built.</em></h2></div>
    <div className="sv-security-sign">CODE · EXPERIMENTS · THINGS THAT WORK</div>
    <div className="sv-project-stage">
      <motion.div className="sv-tray-frame" key={`${current.slug}-tray`} initial={reduced ? false : { x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}><div className="sv-tray-top"><span>SELECTED PROJECT</span><b>0{selected + 1}</b><span className="sv-cleared">● BUILT BY ME</span></div><div className="sv-project-screen" key={current.slug}>
        {current.slug === "canadaclip" ? <div className="sv-clip-preview"><span>CanadaClip <b>CA ↗</b></span><strong>Big-brand link.<br />Local alternative.</strong><div><span>01 / PASTE A LINK</span><i>→</i><span>02 / FIND A MATCH</span></div><small>PROJECT WORKFLOW · WATCH THE DEMO BELOW</small></div> : <img src={current.screenshot} alt={`${current.name} product screenshot`} width={1000} height={650} />}
        {!reduced && <motion.span className="sv-scan-line" style={{ left: scanX }} aria-hidden="true" />}
      </div><span className="sv-tray-code">{current.flightCode} / {current.year}</span></motion.div>
      <motion.div className="sv-project-copy" key={`${current.slug}-copy`} initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}><span className="sv-eyebrow">{copy.type}</span><h3>{current.name}</h3><h4>{copy.title}</h4><p>{copy.line}</p><div className="sv-project-links">{current.seats[0].links?.map((link) => <a href={link.url} key={link.url} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span></a>)}</div></motion.div>
    </div>
    <div className="sv-project-selector" aria-label="Select project">{PROJECT_ORDER.map((slug, i) => <button key={slug} aria-pressed={selected === i} onClick={() => select(i)}><span>0{i + 1}</span>{projects.find((item) => item.slug === slug)!.name}</button>)}</div>
    <div className="sv-conveyor" aria-hidden="true"><motion.div style={{ x: beltX }} /></div>
  </>;
}

function Boarding({ p, reduced }: LocalProps) {
  const passY = useTransform(p, [0, 0.5, 1], [reduced ? 0 : 70, 0, reduced ? 0 : -12]);
  const passRotate = useTransform(p, [0, 1], [reduced ? -3 : -8, -3]);
  return <>
    <div className="sv-boarding-copy"><p className="sv-eyebrow">04 / NOW BOARDING</p><h2>See you<br /><em>out there.</em></h2><p>That’s where I am.<br />Let’s see what’s next.</p><a className="sv-say-hello" href={siteConfig.socialLinks.email}>Say hello <span aria-hidden="true">↗</span></a><div className="sv-social-links"><a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={siteConfig.socialLinks.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={siteConfig.socialLinks.x} target="_blank" rel="noreferrer">X ↗</a></div></div>
    <motion.a className="sv-boarding-pass" href="/Ammar_Adam.pdf" target="_blank" rel="noreferrer" style={{ y: passY, rotate: passRotate }} aria-label="Open Ammar Adam’s resume PDF in a new tab"><div className="sv-pass-header"><strong>AFA</strong><span>BOARDING PASS<br />ONE-WAY / OPEN ENDED</span><b>↗</b></div><div className="sv-pass-body"><span className="sv-pass-label">PASSENGER</span><strong className="sv-pass-name">ADAM / AMMAR</strong><div className="sv-pass-route"><div><b>YKF</b><span>WATERLOO</span></div><span aria-hidden="true">→</span><div><b>???</b><span>WHAT’S NEXT</span></div></div><div className="sv-pass-fields"><div><small>CLASS</small><span>CS &amp; FINANCE</span></div><div><small>SEAT</small><span>WINDOW, ALWAYS</span></div></div></div><div className="sv-pass-stub"><div className="sv-barcode" aria-hidden="true" /><span>OPEN MY RESUME <b aria-hidden="true">↗</b><small>THE ONE-PAGE VERSION · PDF</small></span></div></motion.a>
    <span className="sv-boarding-footnote">TORONTO · DUBAI · KARACHI · BUILT IN WATERLOO</span>
  </>;
}
