"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useSyncExternalStore } from "react";
import { boardingPassConfig } from "@/data/boardingPass";
import { siteConfig } from "@/data/site";
import { Airliner } from "./Gate";

const ease = [0.22, 1, 0.36, 1] as const;

/** Deterministic bar widths so the barcode never shifts between renders. */
const bars = Array.from("AMMARADAMYYZDXBKHICSFIN2A").flatMap((ch, i) => {
  const c = ch.charCodeAt(0) + i * 7;
  return [1 + (c % 3), 1 + ((c >> 2) % 2), 1 + ((c >> 1) % 4), 1 + ((c >> 3) % 2)];
});

const skyline = {
  toronto: [
    "M0 170V150H22V132H40V142H58V118H74V138H92V126H112V148H130V122H150V140H170V170",
    "M186 170L196 82M214 170L204 82",
    "M186 76a14 6 0 1 0 28 0a14 6 0 1 0-28 0",
    "M197 70L198.5 38M203 70L201.5 38M196 38h8v-5h-8ZM200 33V4",
    "M226 170V156A44 30 0 0 1 314 156V170",
    "M320 170V136H340V112H358V140H378V128H396V170",
  ],
  dubai: [
    "M404 170V150H430V138H452V156H476V130H500V148H524V122H546V146H566V170",
    "M574 170V128H580V100H586V76H590V54H594V34H597V18H599V2M626 170V128H620V100H614V76H610V54H606V34H603V18H601V2",
    "M634 170V140H652V118H668V146H690V170",
    "M700 170V58Q760 80 772 170M700 58L696 44M712 122h20",
    "M780 170V150H796V170",
  ],
  karachi: [
    "M804 170V146H826V134H846V152H870V140H892V170",
    "M930 170V122H1070V170M960 122V110H1040V122",
    "M948 170V150a12 13 0 0 1 24 0V170M988 170V150a12 13 0 0 1 24 0V170M1028 170V150a12 13 0 0 1 24 0V170",
    "M964 110C964 68 1000 60 1000 52C1000 60 1036 68 1036 110M1000 52V40",
    "M1080 170V138H1100V124H1122V150H1146V132H1168V146H1200V170",
  ],
};

function subscribeNarrow(cb: () => void) {
  const mq = window.matchMedia("(max-width: 640px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function Boarding() {
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia("(max-width: 640px)").matches, () => false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.55, once: true });
  const skyRef = useRef<HTMLDivElement>(null);
  const skyIn = useInView(skyRef, { amount: 0.4, once: true });

  return (
    <section id="boarding" className="boarding">
      <div className="sec-head center">
        <p className="eyebrow">Boarding</p>
        <h2>Last call. <em>Here&apos;s how to reach me.</em></h2>
      </div>

      <div className="pass-stage" ref={ref}>
        <motion.div
          className="pass"
          initial={{ opacity: 0, y: 80, rotate: -5 }}
          animate={inView ? { opacity: 1, y: 0, rotate: -1.2 } : {}}
          transition={{ duration: 1.1, ease }}
        >
          <div className="pass-main">
            <div className="pass-top">
              <span className="pass-air">AFA International</span>
              <span className="pass-kind">Boarding pass</span>
            </div>
            <div className="pass-route">
              <div>
                <small>From</small>
                <b>YYZ</b>
                <span>Toronto</span>
              </div>
              <div className="pass-path" aria-hidden>
                <i />
                <motion.span
                  initial={{ left: "0%" }}
                  animate={inView ? { left: "100%" } : {}}
                  transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1], delay: 0.6 }}
                >
                  <svg viewBox="0 0 24 24"><path d="M21 12c0-.8-.7-1.3-1.5-1.3H15L10 3H8l2.5 7.7H6L4.3 8.5H3l1 3.5-1 3.5h1.3L6 13.3h4.5L8 21h2l5-7.7h4.5c.8 0 1.5-.5 1.5-1.3Z" /></svg>
                </motion.span>
              </div>
              <div className="to">
                <small>To</small>
                <b>TBD</b>
                <span>What&apos;s next</span>
              </div>
            </div>
            <dl className="pass-fields">
              <div><dt>Passenger</dt><dd>{boardingPassConfig.displayName}</dd></div>
              <div><dt>Class</dt><dd>CS &amp; Finance</dd></div>
              <div><dt>Seat</dt><dd>2A</dd></div>
              <div><dt>Boarding</dt><dd>Now</dd></div>
            </dl>
            <a className="barcode" href={boardingPassConfig.resumeFileUrl} target="_blank" rel="noreferrer">
              <span className="bars" aria-hidden>
                {bars.map((w, i) => <i key={i} style={{ width: w, marginRight: i % 2 ? 2 : 1 }} />)}
                <span className="laser" />
              </span>
              <span className="barcode-cta">Scan for resume (PDF) ↗</span>
            </a>
          </div>

          <motion.div
            className="pass-stub"
            initial={{ x: 0, rotate: 0 }}
            animate={inView ? (narrow ? { x: 4, rotate: 1.5, y: 16 } : { x: 18, rotate: 2.5, y: 6 }) : {}}
            transition={{ type: "spring", stiffness: 160, damping: 14, delay: 1.0 }}
          >
            <span className="stub-title">Contact</span>
            <a href={siteConfig.socialLinks.email}>
              <small>Email</small>ammar.adam@uwaterloo.ca
            </a>
            <a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer">
              <small>LinkedIn</small>in/ammar-adam ↗
            </a>
            <a href={siteConfig.socialLinks.github} target="_blank" rel="noreferrer">
              <small>GitHub</small>ammar-adam ↗
            </a>
            <a href={siteConfig.socialLinks.x} target="_blank" rel="noreferrer">
              <small>X</small>@ammaradam_5807 ↗
            </a>
          </motion.div>
        </motion.div>
      </div>

      <footer className="skyline" ref={skyRef}>
        <div className="sky-plane-run" aria-hidden><Airliner /></div>
        <svg viewBox="0 0 1200 176" className="skyline-svg" role="img" aria-label="Skylines of Toronto, Dubai and Karachi">
          {Object.entries(skyline).map(([city, paths], ci) =>
            paths.map((d, i) => (
              <motion.path
                key={`${city}-${i}`}
                d={d}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={skyIn ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: ci * 0.35 + i * 0.12 }}
              />
            )),
          )}
          <motion.path
            className="ground"
            d="M0 170.5H1200"
            initial={{ pathLength: 0 }}
            animate={skyIn ? { pathLength: 1 } : {}}
            transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1] }}
          />
        </svg>
        <div className="skyline-labels" aria-hidden>
          <span>Toronto</span><span>Dubai</span><span>Karachi</span>
        </div>
        <div className="foot">
          <span>Thanks for flying with me.</span>
          <a href="https://uwaterloo.network" target="_blank" rel="noreferrer" className="webring">
            <img src="https://uwaterloo.network/icon.svg" alt="" width={18} height={18} />
            uwaterloo.network
          </a>
          <span>© {new Date().getFullYear()} Ammar Adam</span>
        </div>
      </footer>
    </section>
  );
}
