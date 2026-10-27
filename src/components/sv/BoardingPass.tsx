"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
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
    };
    // A restored page must never replay a pending scan or retain a torn pass.
    window.addEventListener("pagehide", cancel);
    window.addEventListener("pageshow", restore);
    return () => {
      cancel();
      window.removeEventListener("pagehide", cancel);
      window.removeEventListener("pageshow", restore);
    };
  }, []);

  function scan(event: MouseEvent<HTMLAnchorElement>) {
    // Keep the browser's normal new-tab/window behavior for modified activation.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (busy.current) { event.preventDefault(); return; }
    // The native anchor opens the PDF in this same click's user activation.
    // The original tab keeps the authored scan / tear / departure sequence.
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
      setTimeout(() => { setStatus("opening"); busy.current = false; }, OPEN_MS),
    ];
  }

  const detached = status === "tearing" || status === "departing" || status === "opening";
  const label = status === "scanning" ? "Scanning pass" : status === "tearing" ? "Pass accepted" : status === "departing" ? "Departing" : status === "opening" ? "Résumé opened" : "Scan & open resume";
  const announcement = status === "scanning" ? "Résumé opened in a new tab. Scanning boarding pass." : status === "tearing" ? "Pass accepted. Tearing ticket stub." : status === "departing" ? "Cleared for departure." : status === "opening" ? "Résumé opened in a new tab. You can scan again." : "Scan the boarding pass to open the résumé PDF in a new tab.";

  return <div className={`bp-scene${reduced ? " bp-reduced" : ""}`} data-scan-status={status} data-scan-duration={SCAN_MS} data-departure-delay={DEPARTURE_MS} data-animation-duration={OPEN_MS}>
    <div className="bp-layout">
      <div className="bp-introduction">
        <p className="bp-eyebrow">And that’s me.</p>
        <h2 className="bp-title">The story’s<br />still going.</h2>
      </div>

      <motion.article className="bp-ticket" aria-label="Ammar Adam’s resume boarding pass" data-scan-status={status} data-stub-detached={detached} style={{ y, rotate }}>
        <div className="bp-main">
          <div className="bp-airline"><strong><i className="bp-monogram" aria-hidden="true">a<span>/</span>a</i> AMMAR ADAM</strong><span>BOARDING PASS</span></div>
          <div className="bp-main-content">
            <div className="bp-passenger"><span>PASSENGER</span><strong>ADAM / AMMAR</strong><small>Computer Science &amp; Finance · Waterloo</small></div>
            <div className="bp-route"><div><span>FROM</span><strong>YKF</strong><small>WATERLOO</small></div><div className="bp-route-line" aria-hidden="true"><i /><svg viewBox="0 0 24 24"><path d="M21 12 3 3l2 7 10 2-10 2-2 7z" fill="currentColor" /></svg><i /></div><div><span>TO</span><strong>NEXT</strong><small>WHAT’S NEXT</small></div></div>
            <dl className="bp-details"><div><dt>FLIGHT</dt><dd>AMM01</dd></div><div><dt>GATE</dt><dd>05</dd></div><div><dt>SEAT</dt><dd>01A</dd></div><div><dt>DOCUMENT</dt><dd>RESUME</dd></div></dl>
            <div className="bp-paper-footer"><span>AMMARADAM.COM</span><span>KEEP THIS PART</span></div>
          </div>
        </div>
        <div className="bp-stub">
          <div className="bp-stub-header"><span>RESUME / PDF</span><strong>AMM01</strong></div>
          <div className="bp-stub-passenger"><span>ADAM / AMMAR</span><strong>YKF <i aria-hidden="true">→</i> NEXT</strong></div>
          <a className="bp-scanner" data-scan-trigger="true" data-scan-status={status} href={RESUME} target="_blank" rel="noopener noreferrer" aria-label="Scan boarding pass and open Ammar Adam’s résumé PDF in a new tab" aria-busy={status !== "ready" && status !== "opening"} onClick={scan}>
            <span className="bp-barcode" aria-hidden="true"><span className="bp-code-bars" />{status === "scanning" && <span key={scanNumber} className="bp-scan-line" style={{ animationDuration: `${SCAN_MS}ms` }} />}<span className="bp-code-number">AMM01 / AMMAR-ADAM / 01A</span></span>
            <span className="bp-scan-label">{label}<b aria-hidden="true">↗</b></span>
          </a>
          <div className="bp-clearance" aria-hidden="true"><i /><span>{status === "scanning" ? "READING BARCODE" : status === "tearing" ? "PASS ACCEPTED" : status === "departing" || status === "opening" ? "CLEARED FOR DEPARTURE" : "TWO SECONDS TO DEPARTURE"}</span></div>
        </div>
      </motion.article>

      <div className="bp-contact">
        <a className="bp-hello" href={siteConfig.socialLinks.email}>Say hello <span aria-hidden="true">↗</span></a>
        <nav className="bp-socials" aria-label="Find Ammar online"><a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={siteConfig.socialLinks.github} target="_blank" rel="noreferrer">GitHub</a><a href={siteConfig.socialLinks.x} target="_blank" rel="noreferrer">X</a><a href={siteConfig.socialLinks.email}>Email</a></nav>
      </div>
    </div>
    <p className="bp-announcement" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
  </div>;
}
