"use client";

import { PAINTED_COPY } from "@/data/copy";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { SCAN_CLEARANCE, UI_COPY } from "@/data/copy";
import { siteConfig } from "@/data/site";
import "./boarding-pass.css";

type ScanStatus = "ready" | "scanning" | "tearing" | "departing" | "opening";
type BoardingPassProps = { p: MotionValue<number>; reduced: boolean; onDeparture: () => void; onReset?: () => void };
const SCAN_MS = 750;
const DEPARTURE_MS = 1100;
const OPEN_MS = 2000;
const RESUME = "/Ammar_Adam.pdf";

export function BoardingPass({ p, reduced, onDeparture, onReset }: BoardingPassProps) {
  const [status, setStatus] = useState<ScanStatus>("ready");
  const [scanNumber, setScanNumber] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const busy = useRef(false);
  const y = useTransform(p, [0, .3, 1], [reduced ? 0 : 24, 0, reduced ? 0 : -8]);
  const rotate = useTransform(p, [0, .5, 1], [reduced ? 0 : -3, reduced ? 0 : -1.5, reduced ? 0 : -.75]);

  useEffect(() => {
    const cancel = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      busy.current = false;
    };
    const restore = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      cancel();
      setStatus("ready");
      onReset?.();
    };
    // A restored page must never replay a pending scan or retain a torn pass.
    window.addEventListener("pagehide", cancel);
    window.addEventListener("pageshow", restore);
    return () => {
      cancel();
      window.removeEventListener("pagehide", cancel);
      window.removeEventListener("pageshow", restore);
    };
  }, [onReset]);

  function scan(event: MouseEvent<HTMLAnchorElement>) {
    // Keep the browser's normal new-tab/window behavior for modified activation.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (busy.current) { event.preventDefault(); return; }
    // Reduced motion uses the native same-tab PDF link immediately. Otherwise
    // finish the visible sequence here before navigation; no popup is required.
    if (reduced) { onReset?.(); return; }
    event.preventDefault();
    timers.current.forEach(clearTimeout);
    onReset?.();
    busy.current = true;
    setScanNumber((value) => value + 1);
    setStatus("scanning");
    timers.current = [
      setTimeout(() => setStatus("tearing"), SCAN_MS),
      setTimeout(() => {
        setStatus("departing");
        onDeparture();
      }, DEPARTURE_MS),
      setTimeout(() => {
        setStatus("opening");
        window.location.assign(RESUME);
      }, OPEN_MS),
    ];
  }

  const detached = status === "tearing" || status === "departing" || status === "opening";
  const label = status === "scanning" ? "Scanning pass" : status === "tearing" ? SCAN_CLEARANCE[1] : status === "departing" ? "Departing" : status === "opening" ? "Opening résumé" : reduced ? "Open resume" : "Scan & open resume";
  const announcement = status === "scanning" ? "Scanning boarding pass." : status === "tearing" ? "Pass accepted. Tearing ticket stub." : status === "departing" ? "Cleared for departure. Opening the résumé next." : status === "opening" ? "Opening résumé PDF." : reduced ? "Open the résumé PDF." : UI_COPY.boardingHelper;

  return <div className={`bp-scene${reduced ? " bp-reduced" : ""}`} data-scan-status={status} data-scan-duration={SCAN_MS} data-departure-delay={DEPARTURE_MS} data-animation-duration={OPEN_MS}>
    <div className="bp-layout">
      <div className="bp-introduction">
        <p className="bp-eyebrow">{UI_COPY.ending}</p>
        <h2 className="bp-title">{UI_COPY.endingTitle[0]}<br />{UI_COPY.endingTitle[1]}</h2>
      </div>

      <motion.article className="bp-ticket" aria-label="Ammar Adam’s resume boarding pass" data-scan-status={status} data-stub-detached={detached} style={{ y, rotate }}>
        <div className="bp-main">
          <div className="bp-airline"><strong><i className="bp-monogram" aria-hidden="true">a<span>/</span>a</i> {PAINTED_COPY.ammarAdam}</strong><span>{PAINTED_COPY.boardingPass}</span></div>
          <div className="bp-main-content">
            <div className="bp-passenger"><span>{PAINTED_COPY.passenger}</span><strong>{PAINTED_COPY.adamAmmar}</strong><small>{PAINTED_COPY.computerScienceAmpFinanceWaterloo}</small></div>
            <div className="bp-route"><div><span>{PAINTED_COPY.from}</span><strong>YKF</strong><small>{PAINTED_COPY.waterloo}</small></div><div className="bp-route-line" aria-hidden="true"><i /><svg viewBox="0 0 24 24"><path d="M21 12 3 3l2 7 10 2-10 2-2 7z" fill="currentColor" /></svg><i /></div><div><span>{PAINTED_COPY.to}</span><strong>{PAINTED_COPY.next}</strong><small>{PAINTED_COPY.whatSNext}</small></div></div>
            <dl className="bp-details"><div><dt>{PAINTED_COPY.flight}</dt><dd>AMM01</dd></div><div><dt>{PAINTED_COPY.gate}</dt><dd>{PAINTED_COPY.label05}</dd></div><div><dt>{PAINTED_COPY.seat}</dt><dd>01A</dd></div><div><dt>{PAINTED_COPY.document}</dt><dd>{PAINTED_COPY.resume}</dd></div></dl>
            <div className="bp-paper-footer"><span>{PAINTED_COPY.ammaradamCom}</span><span>{PAINTED_COPY.keepThisPart}</span></div>
          </div>
        </div>
        <div className="bp-stub">
          <div className="bp-stub-header"><span>{PAINTED_COPY.resumePdf}</span><strong>AMM01</strong></div>
          <div className="bp-stub-passenger"><span>{PAINTED_COPY.adamAmmar}</span><strong>YKF <i aria-hidden="true">{PAINTED_COPY.arrow}</i> {PAINTED_COPY.next}</strong></div>
          <a className="bp-scanner" data-scan-trigger="true" data-scan-status={status} href={RESUME} aria-label={reduced ? "Open Ammar Adam’s résumé PDF" : "Scan boarding pass and open Ammar Adam’s résumé PDF after a two-second departure"} aria-busy={status !== "ready"} onClick={scan}>
            <span className="bp-barcode" aria-hidden="true"><span className="bp-code-bars" />{status === "scanning" && <span key={scanNumber} className="bp-scan-line" style={{ animationDuration: `${SCAN_MS}ms` }} />}<span className="bp-code-number">{PAINTED_COPY.amm01AmmarAdam01a}</span></span>
            <span className="bp-scan-label">{label}<b aria-hidden="true">{PAINTED_COPY.arrow}</b></span>
          </a>
          <div className="bp-clearance" aria-hidden="true"><i /><span>{status === "scanning" ? SCAN_CLEARANCE[0] : status === "tearing" ? SCAN_CLEARANCE[1] : status === "departing" || status === "opening" ? SCAN_CLEARANCE[2] : SCAN_CLEARANCE[3]}</span></div>
        </div>
      </motion.article>

      <div className="bp-contact">
        <a className="bp-hello" href={siteConfig.socialLinks.email}>{UI_COPY.hello}</a>
        <nav className="bp-socials" aria-label="Find Ammar online"><a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer">{PAINTED_COPY.linkedin}</a><a href={siteConfig.socialLinks.github} target="_blank" rel="noreferrer">{PAINTED_COPY.github}</a><a href={siteConfig.socialLinks.x} target="_blank" rel="noreferrer">X</a><a href={siteConfig.socialLinks.email}>{PAINTED_COPY.email}</a></nav>
      </div>
    </div>
    <p className="bp-announcement" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
  </div>;
}
