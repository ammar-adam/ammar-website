"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { arrivals } from "@/data/arrivals";
import { CODES, ease, host, jumpToStep, pad2, SceneHead, Suitcase, useStepFrom, Walker } from "./shared";

const shortName = (s: string) => s.replace("Waterloo Tech Week / ", "");
const FINISH = ["navy", "oat", "amber", "navy", "oat", "amber", "navy"] as const;
const WEIGHT = [18.4, 21.7, 16.2, 22.9, 19.5, 23.1, 17.8];

/**
 * 01 · Check-in. A bag drop: each role is a bag. Scrolling rolls the next one
 * onto the scale, weighs it, prints its tag (the tag is the role), and sends
 * it through the curtain.
 */
export function CheckIn() {
  const ref = useRef<HTMLElement>(null);
  const n = arrivals.length;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const sel = useStepFrom(p, n);
  const a = arrivals[sel];
  const code = CODES[a.origin] ?? "AFA";

  // Progress inside the current step, 0 → 1.
  const local = useTransform(p, (v) => {
    const t = Math.min(0.9999, Math.max(0, v)) * n;
    return t - Math.floor(t);
  });
  // Arrive (0–.2), sit on the scale (.2–.75), leave through the curtain (.75–1).
  const bagX = useTransform(local, [0, 0.2, 0.75, 1], ["-34vw", "0vw", "0vw", "17vw"]);
  const bagOpacity = useTransform(local, [0.88, 1], [1, 0]);
  const kg = useTransform(local, [0.18, 0.34], [0, WEIGHT[sel]]);
  const kgText = useTransform(kg, (v) => v.toFixed(1));
  const belt = useTransform(local, [0.75, 1], ["0px", "-48px"]);

  return (
    <section id="checkin" ref={ref} className="va-pinwrap va-pin-ci">
      <div className="va-pin">
        <div className="wrap">
          <SceneHead
            no="01"
            title="Check-in"
            where="Hall A · Desk 4"
            sub="Where I've worked. Each bag is a role."
            hint={<>Bag {pad2(sel + 1)} / {pad2(n)} · scroll to check in the next</>}
            skip="checkin"
          />

          {/* The stage: queue, desk, scale, belt into the wall */}
          <div className="ci-stage" aria-hidden>
            <div className="ci-wall" />
            <div className="ci-sign"><i className="va-led" />CHECK-IN · ROWS A–D <b>DESK 4</b></div>

            <div className="ci-queue">
              <span className="ci-post" /><span className="ci-rope" /><span className="ci-post" /><span className="ci-rope" /><span className="ci-post" />
              <span className="ci-person ci-person-1"><Walker /></span>
              <span className="ci-person ci-person-2"><Walker variant={1} /></span>
            </div>

            <div className="ci-desk">
              <div className="ci-desk-top" />
              <div className="ci-desk-front"><span>AFA</span></div>
              <div className="ci-display">
                <span>BAG {pad2(sel + 1)}/{pad2(n)}</span>
                <b><motion.span>{kgText}</motion.span> KG</b>
              </div>
            </div>

            <div className="ci-scale"><span /></div>
            <div className="ci-belt">
              <motion.span className="ci-belt-tex" style={{ backgroundPositionX: belt }} />
            </div>
            <div className="ci-hatch"><span className="ci-curtain" /></div>

            <motion.div className="ci-bag" style={{ x: bagX, opacity: bagOpacity }}>
              <Suitcase finish={FINISH[sel]} code={code} />
            </motion.div>
            <div className="ci-floor" />
          </div>

          {/* The printed tag: the role */}
          <div className="ci-printer">
            <div className="ci-slot" aria-hidden><span>BAG TAG PRINTER</span></div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={a.slug}
                className="ci-tag"
                initial={{ clipPath: "inset(0 0 100% 0)", y: -6 }}
                animate={{ clipPath: "inset(0 0 0% 0)", y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.55, ease }}
              >
                <span className="ci-tag-hole" aria-hidden />
                {a.image && <img className="ci-tag-photo" src={a.image} alt="" loading="lazy" />}
                <div className="ci-tag-id">
                  <span className="ci-tag-code">{code}</span>
                  <span className="ci-tag-city">{a.origin}</span>
                </div>
                <div className="ci-tag-main">
                  <span className="ci-tag-co">{a.from}</span>
                  <span className="ci-tag-role">{a.detailTitle ?? a.title}</span>
                  <p className="ci-tag-impact">{a.impact}</p>
                  <p className="ci-tag-details">{a.details}</p>
                  <div className="ci-tag-links">
                    {a.fromUrl && <a href={a.fromUrl} target="_blank" rel="noreferrer">{host(a.fromUrl)} ↗</a>}
                    {a.links?.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
                    ))}
                  </div>
                </div>
                <div className="ci-tag-bar" aria-hidden />
              </motion.article>
            </AnimatePresence>
            <ol className="ci-index" aria-label="Roles">
              {arrivals.map((b, i) => (
                <li key={b.slug}>
                  <button type="button" className={i === sel ? "on" : i < sel ? "done" : ""} onClick={() => jumpToStep(ref.current, i, n)}>
                    {shortName(b.from)}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
