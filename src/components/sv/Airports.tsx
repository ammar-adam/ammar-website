"use client";

import { useEffect, useState } from "react";
import { Kid, Krackle } from "./art";
import { Bang, Caption, Kicker, Reveal } from "./ui";

const CITIES = ["TORONTO", "DUBAI", "KARACHI", "WATERLOO"];
const WIDTH = 8;

/* Split-flap departures board. Each letter is a tiny comic panel that flips on
   8fps steps. The word cycles through the three cities (and where he ended up). */
function FlapBoard() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % CITIES.length), 2400);
    return () => clearInterval(t);
  }, []);
  const word = CITIES[i].padEnd(WIDTH, " ");
  const prev = CITIES[(i + CITIES.length - 1) % CITIES.length].padEnd(WIDTH, " ");
  return (
    <div className="board" role="img" aria-label={`Departures board showing ${CITIES[i]}`}>
      <div className="board-head">
        <Kicker>Departures</Kicker>
        <Kicker>Gate · {["B22", "C7", "A4", "E3"][i]}</Kicker>
      </div>
      <div className="board-row">
        {word.split("").map((ch, k) => (
          <span className="flap" key={`${i}-${k}`} style={{ ["--fd" as string]: `${k * 60}ms` }}>
            <span className="flap-old">{prev[k]}</span>
            <span className="flap-new">{ch}</span>
          </span>
        ))}
      </div>
      <div className="board-row board-row-sm">
        {["YYZ", "DXB", "KHI", "YKF"].map((code, k) => (
          <span key={code} className={`board-code ${k === i ? "on" : ""}`}>
            {code}
          </span>
        ))}
        <span className="board-status">{["ON TIME", "DELAYED", "BOARDING", "NOW"][i]}</span>
      </div>
    </div>
  );
}

const GATES = [
  { code: "YYZ", city: "Toronto", line: "Where school was. And winter. And the 6am Pearson run.", tone: "cyan" },
  { code: "DXB", city: "Dubai", line: "Where home was. Where I got my first job at 16.", tone: "amber" },
  { code: "KHI", city: "Karachi", line: "Where the family is. Where the mangoes are better.", tone: "mag" },
];

export function Airports() {
  return (
    <section id="airports" className="airports" aria-label="Three airports">
      <Krackle className="k1" seed={1} />
      <Reveal className="airports-cap">
        <Caption tone="yellow" size="lg" rotate={-1}>
          My name is Ammar Adam. I grew up between three airports.
        </Caption>
      </Reveal>

      <div className="gates">
        {GATES.map((g, k) => (
          <Reveal key={g.code} as="article" className={`gate gate-${g.tone} pop`} delay={k * 140}>
            <div className="gate-sign">
              <span className="gate-code">{g.code}</span>
              <span className="gate-city">{g.city}</span>
            </div>
            <p className="gate-line">{g.line}</p>
          </Reveal>
        ))}
      </div>

      <div className="airports-row">
        <Reveal className="kid-panel pop" delay={100}>
          <div className="kid-wrap">
            <Kid className="kid" />
            <span className="kid-echo e1" aria-hidden="true"><Kid /></span>
            <span className="kid-echo e2" aria-hidden="true"><Kid /></span>
          </div>
          <Bang text="SKRRT" className="kid-bang" rotate={10} size={44} color="var(--sv-ink)" burst="var(--sv-cyan)" />
          <Caption tone="cream" size="sm" rotate={1.5} className="kid-cap">
            Carry-on only. Always.
          </Caption>
        </Reveal>
        <Reveal className="board-panel pop" delay={220}>
          <FlapBoard />
          <Caption tone="cream" size="sm" rotate={-1} className="board-cap">
            Toronto for school. Dubai for home. Karachi for family. Then Waterloo, where it all got weird.
          </Caption>
        </Reveal>
      </div>
    </section>
  );
}
