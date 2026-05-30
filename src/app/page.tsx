import Link from "next/link";
import { FlapText } from "@/components/FlapText";
import { siteConfig } from "@/data/site";

const boardRows = [
  { key: "projects", href: "/projects", gate: "A", destination: "PROJECTS", info: "Things I've been building!", status: "NOW BOARDING", statusClass: "st-amber", arrow: "->" },
  { key: "arrivals", href: "/arrivals", gate: "B", destination: "EXPERIENCES", info: "Cool stuff I've done", status: "ON TIME", statusClass: "st-green", arrow: "->" },
  { key: "about", href: "/about", gate: "C", destination: "ABOUT", info: "Get to know the pilot", status: "ON TIME", statusClass: "st-green", arrow: "->" },
  { key: "resume", href: "/resume", gate: "D", destination: "RESUME", info: "Scan your boarding pass", status: "FINAL CALL", statusClass: "st-amber", arrow: "v" },
];

export default function HomePage() {
  return (
    <section className="home wrap" data-screen-label="Home / Terminal Directory">
      <div className="home-hero">
        <div>
          <div className="kicker h-eyebrow">Terminal Directory</div>
          <h1>
            Hi, I&apos;m Ammar. I study CS &amp; Finance at UWaterloo.{" "}
            <span className="amb">Welcome to AFA International.</span>
          </h1>
          <p className="h-sub">Select your gate for departure.</p>
          <div className="h-socials">
            <a className="soc-link soc-mail" href={siteConfig.socialLinks.email} aria-label="Email" />
            <a className="soc-link soc-github" href={siteConfig.socialLinks.github} target="_blank" rel="noreferrer" aria-label="GitHub" />
            <a className="soc-link soc-linkedin" href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" />
            <a className="soc-link soc-x" href={siteConfig.socialLinks.x} target="_blank" rel="noreferrer" aria-label="X" />
          </div>
        </div>
        <div className="window">
          <div className="win-inner">
            <div className="sky">
              <div className="sky-grad" />
              <div className="sky-clouds sky-clouds-b" />
              <div className="sky-clouds sky-clouds-a" />
              <video className="sky-video" autoPlay muted loop playsInline preload="metadata">
                <source src="https://videos.pexels.com/video-files/9669392/9669392-hd_1080_1920_30fps.mp4" type="video/mp4" />
              </video>
              <div className="sky-grain" />
              <div className="sky-vignette" />
            </div>
          </div>
          <div className="win-frame" />
          <div className="flight-card">
            <div className="fc-top"><span className="fc-route">AFA · NOW BOARDING</span><span className="fc-status">ON TIME</span></div>
            <div className="fc-bar"><i /></div>
            <div className="fc-sub"><span>GATES A-D</span><span>SEAT 1A</span><span>LOCAL</span></div>
          </div>
        </div>
      </div>

      <div className="ticker">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <span key={copy}>
              {siteConfig.tickerIdentifiers.map((item) => (
                <span className="ticker-item" key={`${copy}-${item}`}>{item}<span className="dot">*</span></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="directory">
        <div className="fboard">
          <div className="fboard-head">
            <span className="fh-l"><span className="fh-dot" />DEPARTURES · TERMINAL DIRECTORY</span>
            <span className="fh-clock">AFA</span>
          </div>
          <div className="fboard-cols home-board-cols">
            <span>GATE</span><span>DESTINATION</span><span>INFO</span><span>STATUS</span>
          </div>
          {boardRows.map((row, index) => (
            <Link className="fboard-row home-board-row" href={row.href} key={row.key}>
              <span className="fr-gate">{row.gate}</span>
              <FlapText value={row.destination} length={11} baseDelay={250 + index * 140} />
              <span className="fr-info">{row.info}</span>
              <span className={`fr-status ${row.statusClass}`}><i />{row.status}<span className="fr-arrow">{row.arrow}</span></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
