"use client";

import { arrivals } from "@/data/arrivals";
import { Krackle, TagShape } from "./art";
import { Bang, Caption, Kicker, LinkPill, Reveal } from "./ui";

const TAG: Record<string, string> = {
  Dubai: "DXB",
  Mississauga: "YYZ",
  Toronto: "YYZ",
  Waterloo: "YKF",
  "San Francisco": "SFO",
  "Palo Alto": "SFO",
};

const BIG = new Set(["openai", "pear-vc"]);

/* Beats 4 and 7: the check-in hall. Seven desks, seven tags, told as one
   comic strip. OpenAI and Pear are the headline roles so they get the
   wide panels and their own caption. */
export function CheckIn() {
  const early = arrivals.filter((a) => !BIG.has(a.slug));
  const big = arrivals.filter((a) => BIG.has(a.slug));

  return (
    <section id="checkin" className="checkin" aria-label="Experience">
      <Krackle className="k2" seed={2} />
      <Reveal className="sec-head">
        <Kicker>Check-in · Experience</Kicker>
        <Caption tone="yellow" size="lg" rotate={-1}>
          At 16 I was the youngest intern at Alpen Capital. The desk printed a tag that said DXB and I never really put the suitcase down.
        </Caption>
      </Reveal>

      <ol className="desks">
        {early.map((a, k) => (
          <Reveal key={a.slug} as="li" className={`desk pop ${a.slug === "sagard" || a.slug === "hack-the-north" || a.slug === "waterloo-venture" ? "desk-wide" : ""}`} delay={k * 90}>
            <div className="desk-img">
              {a.image && <img src={a.image} alt="" loading="lazy" width={480} height={300} />}
              <span className="desk-num">{k + 1}</span>
              <TagShape className={`desk-tag t${k % 4}`}>{TAG[a.origin] ?? a.origin.slice(0, 3).toUpperCase()}</TagShape>
            </div>
            <div className="desk-body">
              <h3 className="desk-co">
                <a href={a.fromUrl} target="_blank" rel="noreferrer">{a.from}</a>
              </h3>
              <p className="desk-role">{a.detailTitle ?? a.title} · {a.origin}</p>
              <p className="desk-line">{a.impact}</p>
              {a.slug === "sagard" && (
                <Caption tone="cream" size="sm" rotate={-1} className="desk-cap">
                  By day I build AI tools at Sagard. Legal AI Hub, a local computer-use agent, the works.
                </Caption>
              )}
              {a.slug === "alpen-capital" && (
                <Caption tone="cream" size="sm" rotate={1} className="desk-cap">
                  {a.details}
                </Caption>
              )}
              {a.links && (
                <div className="pills">
                  {a.links.map((l) => (
                    <LinkPill key={l.url} href={l.url}>{l.label}</LinkPill>
                  ))}
                </div>
              )}
            </div>
            {k === 0 && <Bang text="BRRRT" className="desk-bang" rotate={8} size={36} color="var(--sv-ink)" burst="var(--sv-paper)" />}
          </Reveal>
        ))}
      </ol>

      <Reveal className="sec-head sec-head-mid">
        <Caption tone="magenta" size="lg" rotate={1}>
          And for the past year I&apos;ve been one of five Founding Builder Leads at OpenAI, and a Pear VC Fellow.
        </Caption>
      </Reveal>

      <ol className="desks desks-big">
        {big.map((a, k) => (
          <Reveal key={a.slug} as="li" className="desk desk-big pop" delay={k * 160}>
            <div className="desk-img">
              {a.image && <img src={a.image} alt="" loading="lazy" width={720} height={420} />}
              <span className="desk-num">{early.length + k + 1}</span>
              <TagShape className={`desk-tag t${(k + 2) % 4}`}>{TAG[a.origin]}</TagShape>
            </div>
            <div className="desk-body">
              <h3 className="desk-co">
                <a href={a.fromUrl} target="_blank" rel="noreferrer">{a.from}</a>
              </h3>
              <p className="desk-role">{a.detailTitle ?? a.title} · {a.origin}</p>
              <p className="desk-line">{a.impact}</p>
              <p className="desk-more">{a.details}</p>
            </div>
            <Bang text={k === 0 ? "WHAM" : "POW"} className="desk-bang desk-bang-big" rotate={k === 0 ? -8 : 8} size={52} color="var(--sv-paper)" burst={k === 0 ? "var(--sv-red)" : "var(--sv-cyan)"} />
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
