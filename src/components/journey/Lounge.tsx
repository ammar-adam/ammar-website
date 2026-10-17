"use client";

import { lounge } from "@/data/journey";
import { Fade, Lines } from "./Reveal";
import { Sign } from "./Sign";

export function Lounge() {
  return (
    <section id="lounge" className="stop">
      <Sign
        as="header"
        items={[{ href: "#lounge", label: "Gate area", sub: "About me", arrow: "→" }]}
        aside={<span>YYZ · DXB · KHI</span>}
      />
      <div className="lounge-grid">
        <div className="lounge-copy">
          {lounge.intro.map((p, i) => (
            <Lines key={i} as="p" className="lounge-p" delay={0.1 + i * 0.1} amount={0.6}>
              {p}
            </Lines>
          ))}
        </div>
        <Fade className="carry-on" delay={0.25}>
          <span className="carry-on-title">Carry-on</span>
          <ul>
            {lounge.carryOn.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Fade>
      </div>
    </section>
  );
}
