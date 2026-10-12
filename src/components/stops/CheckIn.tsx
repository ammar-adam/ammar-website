import { FlapText } from "@/components/FlapText";
import { siteConfig } from "@/data/site";

const boardRows = [
  { key: "bag-drop", gate: "2", destination: "BAG DROP", info: "Where I've worked", status: "OPEN", statusClass: "st-green", arrow: "v" },
  { key: "gate", gate: "3", destination: "GATE", info: "Things I've built", status: "NOW BOARDING", statusClass: "st-amber", arrow: "v" },
  { key: "boarding", gate: "4", destination: "BOARDING", info: "Resume", status: "FINAL CALL", statusClass: "st-amber", arrow: "v" },
  { key: "in-flight", gate: "5", destination: "IN-FLIGHT", info: "Off the clock", status: "ON TIME", statusClass: "st-green", arrow: "v" },
];

export function CheckIn() {
  return (
    <section className="home wrap" id="check-in" data-screen-label="Check-in">
      <div className="home-hero">
        <div>
          <div className="kicker h-eyebrow">1 · Check-in</div>
          <h1>
            Hi, I&apos;m Ammar.{" "}
            <span className="amb">Welcome to AFA International.</span>
          </h1>
          <p className="h-sub">CS &amp; Finance at Waterloo. Building AI tools at Sagard, scouting builders for OpenAI. Scroll to walk through the terminal.</p>
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
            <span className="fh-l"><span className="fh-dot" />TERMINAL DIRECTORY · THIS WAY</span>
            <span className="fh-clock">AFA</span>
          </div>
          <div className="fboard-cols home-board-cols">
            <span>STOP</span><span>DESTINATION</span><span>INFO</span><span>STATUS</span>
          </div>
          {boardRows.map((row, index) => (
            <a className="fboard-row home-board-row" href={`#${row.key}`} key={row.key}>
              <span className="fr-gate">{row.gate}</span>
              <FlapText value={row.destination} length={11} baseDelay={250 + index * 140} />
              <span className="fr-info">{row.info}</span>
              <span className={`fr-status ${row.statusClass}`}><i />{row.status}<span className="fr-arrow">{row.arrow}</span></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
