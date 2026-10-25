"use client";

import { projects } from "@/data/departures";
import { XrayIcon } from "./art";
import { Bang, Caption, Kicker, LinkPill, Reveal } from "./ui";

const ICON: Record<string, "rocket" | "leaf" | "pie" | "car"> = {
  rocketship: "rocket",
  canadaclip: "leaf",
  "risk-optimized-equity-system": "pie",
  backseat: "car",
};

const shot = (p: (typeof projects)[number]) =>
  p.slug === "canadaclip" ? "https://img.youtube.com/vi/JzYwfPrcPtM/maxresdefault.jpg" : p.screenshot;

/* Beat 5: security. The X-ray shows what's in the bag (four projects as
   scanned silhouettes), then each tray comes through with a KA-CHUNK. */
export function Security() {
  return (
    <section id="security" className="security" aria-label="Projects">
      <Reveal className="sec-head">
        <Kicker>Security · Projects</Kicker>
        <Caption tone="yellow" size="lg" rotate={1}>
          The rest of the time I ship things. Here&apos;s what&apos;s in the bag.
        </Caption>
      </Reveal>

      <Reveal className="xray pop" amount={0.3}>
        <div className="xray-belt" aria-hidden="true">
          <div className="xray-rollers" />
        </div>
        <div className="xray-machine">
          <div className="xray-screen">
            <div className="xray-scanline" aria-hidden="true" />
            <div className="xray-bag">
              {projects.map((p, k) => (
                <div key={p.slug} className={`xray-item xi${k}`}>
                  <XrayIcon kind={ICON[p.slug]} />
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
            <div className="xray-hud">
              <span>LANE 02</span>
              <span>4 ITEMS · ALL CLEAR</span>
              <span className="blink">●REC</span>
            </div>
          </div>
          <div className="xray-arch" aria-hidden="true" />
        </div>
        <Bang text="BZZZT" className="xray-bang" rotate={-6} size={46} color="var(--sv-ink)" burst="var(--sv-cyan)" />
      </Reveal>

      <ol className="trays">
        {projects.map((p, k) => (
          <Reveal key={p.slug} as="li" className="tray slide" delay={k * 120} amount={0.2}>
            <div className="tray-shot">
              <img src={shot(p)} alt={`${p.name} screenshot`} loading="lazy" width={640} height={400} />
              <span className="tray-echo e1" aria-hidden="true" />
              <span className="tray-echo e2" aria-hidden="true" />
              <span className="tray-code">{p.flightCode} · {p.year}</span>
            </div>
            <div className="tray-body">
              <div className="tray-title">
                <XrayIcon kind={ICON[p.slug]} className="tray-ico" />
                <h3>{p.name}</h3>
              </div>
              <p className="tray-route">{p.routeName}</p>
              <p className="tray-line">{p.shortDesc}</p>
              <div className="pills">
                {p.seats[0].links?.map((l) => (
                  <LinkPill key={l.url} href={l.url}>{l.label}</LinkPill>
                ))}
              </div>
            </div>
            <Bang text="KA-CHUNK" className="tray-bang" rotate={k % 2 ? 7 : -7} size={38} color="var(--sv-paper)" burst={k % 2 ? "var(--sv-mag)" : "var(--sv-red)"} />
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
