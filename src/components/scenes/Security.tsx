"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { projects } from "@/data/departures";
import { pad2, shotFor } from "@/components/home/shared";
import { useViewport } from "./camera";
import { Officer, Traveller } from "./Figures";
import "./scene.css";
import "./security.css";

const ease = [0.22, 1, 0.36, 1] as const;
const n = projects.length;
const LEAD = 0.9; // the first tray starts this far before the tunnel
const TAIL = 100;
const TRAVEL = n * 52 + 60;

type Phase = "wait" | "approach" | "scan" | "clear";

/**
 * 02 · Security, Lane 2. You stand at the X-ray; the belt moves. Each tray
 * carries one project through the tunnel. The monitor shows the scan, the
 * slip prints when it's cleared.
 */
export function Security() {
  const ref = useRef<HTMLElement>(null);
  const vw = useViewport();
  const TRAY_W = vw < 900 ? Math.round(vw * 0.92) : 460;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(p, { stiffness: 80, damping: 26, mass: 0.6 });
  const end = 1 - TAIL / (TRAVEL + TAIL);
  const t = useTransform(smooth, [0, end], [-LEAD, n - 1]);
  const beltX = useTransform(t, (v) => -v * TRAY_W);
  const rollers = useTransform(t, (v) => `${-v * TRAY_W}px 0`);

  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<Phase>("wait");
  useMotionValueEvent(t, "change", (v) => {
    const i = Math.max(0, Math.min(n - 1, Math.round(v)));
    setActive((a) => (a === i ? a : i));
    const frac = v - Math.round(v);
    const ph: Phase = v < -0.4 ? "wait" : frac < -0.2 ? "approach" : frac <= 0.18 ? "scan" : "clear";
    setPhase((x) => (x === ph ? x : ph));
  });
  const q = projects[active];
  const links = q.seats[0]?.links ?? [];
  const showing = phase === "scan" || phase === "clear";

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    const tt = ((i + 0.3 + LEAD) / (n - 1 + LEAD)) * end;
    window.scrollTo({ top: top + Math.min(end, tt) * span, behavior: "smooth" });
  };

  return (
    <section id="security" ref={ref} className="scn sq" style={{ height: `${TRAVEL + TAIL}svh` }}>
      <div className="scn-stage">
        <div className="scn-ceiling" aria-hidden>
          <div className="scn-truss" />
          <div className="scn-lights">{Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ left: `${i * 9}%` }} />)}</div>
        </div>

        {/* back wall with high windows and the signs */}
        <div className="sq-wall" aria-hidden>
          <div className="sq-highwin" />
          <div className="scn-sign" style={{ left: "5%" }}><span className="scn-sign-arrow">→</span> SECURITY · LANE 2</div>
          <div className="scn-sign scn-sign-title" style={{ left: "36%" }}>WHAT I&apos;VE BUILT <span className="scn-sign-sub">· four items in the bag</span></div>
          <div className="scn-sign" style={{ left: "76%" }}>LAPTOPS OUT · NO LIQUIDS</div>
        </div>

        {/* the queue, behind the ropes */}
        <div className="sq-queue" aria-hidden>
          <span className="sq-person" style={{ left: "2%" }}><Traveller variant={2} /></span>
          <span className="sq-person" style={{ left: "10%" }}><Traveller variant={0} /></span>
          <span className="sq-person sq-person-kid" style={{ left: "16%" }}><Traveller variant={3} /></span>
          <span className="scn-stanchions sq-stanchions"><i /><b /><i /><b /><i /><b /><i /></span>
        </div>

        {/* the lane */}
        <div className="sq-lane" aria-hidden>
          <motion.div className="sq-rollers" style={{ backgroundPosition: rollers }} />
          <div className="sq-tunnel" />
          <motion.div className="sq-trays" style={{ x: beltX }}>
            {projects.map((pr, i) => (
              <div key={pr.slug} className="sq-tray" style={{ left: `calc(50% + ${i * TRAY_W}px)` }}>
                <div className="sq-tray-bin">
                  <div className="sq-laptop"><img src={shotFor(pr)} alt="" loading="lazy" /><i /></div>
                  <span className="sq-phone" />
                  <span className="sq-tray-no">{pad2(i + 1)}</span>
                </div>
              </div>
            ))}
          </motion.div>
          <div className="sq-shade" />
          <div className="sq-machine">
            <span className="sq-curtain sq-curtain-l" /><span className="sq-curtain sq-curtain-r" />
            <div className="sq-housing"><span className={`sq-lamp ${phase === "scan" ? "on" : ""}`} />X-RAY</div>
          </div>
          <span className="sq-officer"><Officer /></span>
        </div>

        {/* the monitor on its arm */}
        <div className="sq-monitor">
          <div className="sq-mon-top"><span><i className="scn-led" />LANE 2 · X-RAY</span><span>{showing ? `ITEM ${pad2(active + 1)} / ${pad2(n)}` : "READY"}</span></div>
          <div className="sq-xr">
            <div className="sq-xr-grid" />
            <AnimatePresence mode="wait" initial={false}>
              {showing ? (
                <motion.div key={q.slug} className="sq-xr-item" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.45, ease }}>
                  <img src={shotFor(q)} alt="" />
                  <span className="sq-xr-reticle"><i /><i /><i /><i /></span>
                  <span className="sq-xr-tag">{pad2(active + 1)} · {q.name.toUpperCase()}</span>
                </motion.div>
              ) : (
                <motion.div key="idle" className="sq-xr-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {phase === "wait" ? "WAITING FOR TRAY" : "NEXT TRAY"}
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sq-xr-scan" />
          </div>
          <div className="sq-mon-foot">
            <span>THREAT · NONE</span>
            <span className="sq-mon-status">{phase === "scan" ? "SCANNING" : phase === "clear" ? "CLEARED" : "—"}</span>
          </div>
        </div>

        {/* the slip prints when the item is cleared */}
        <div className="scn-dock sq-dock">
          <AnimatePresence mode="wait" initial={false}>
            {phase === "clear" ? (
              <motion.article
                key={q.slug}
                className="scn-card"
                initial={{ clipPath: "inset(0 0 100% 0)", y: -10 }}
                animate={{ clipPath: "inset(0 0 0% 0)", y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.6, ease }}
              >
                <span className="scn-card-hole" />
                <header>
                  <span className="scn-card-code">{pad2(active + 1)}</span>
                  <span className="scn-card-meta">{q.flightCode} · {q.year} · CLEARED</span>
                </header>
                <div className="scn-card-shot"><img src={shotFor(q)} alt={`${q.name} screenshot`} /></div>
                <h2>{q.name}</h2>
                <p className="scn-card-role">{q.routeName}</p>
                <p className="scn-card-impact">{q.shortDesc}</p>
                <div className="scn-card-links">
                  {links.map((l) => <a key={l.url} className="btn" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>)}
                </div>
                <span className="scn-card-bar" />
              </motion.article>
            ) : (
              <motion.div key="slot" className="sq-slot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span>INSPECTION SLIP</span><small>{phase === "scan" ? "printing when cleared" : "prints here"}</small>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="scn-floor" aria-hidden />

        {/* foreground: divest table, a traveller loading a tray */}
        <div className="sq-front" aria-hidden>
          <div className="sq-table" />
          <span className="sq-front-person"><Traveller variant={1} /></span>
        </div>

        <nav className="sq-index" aria-label="Projects">
          {projects.map((pr, i) => (
            <button key={pr.slug} type="button" className={i === active && showing ? "on" : ""} onClick={() => jump(i)}>{pad2(i + 1)} {pr.name}</button>
          ))}
        </nav>

        <div className="scn-hud">
          <span>02 · SECURITY · LANE 2</span>
          <span>ITEM {pad2(active + 1)} / {pad2(n)}</span>
          <span className="scn-hud-hint">SCROLL TO SEND THE NEXT TRAY THROUGH</span>
        </div>
      </div>
    </section>
  );
}
