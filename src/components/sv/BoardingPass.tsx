"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { siteConfig } from "@/data/site";
import "./boarding-pass.css";

type ScanStatus = "ready" | "scanning" | "cleared";
type BoardingPassProps = { p: MotionValue<number>; reduced: boolean; onDeparture: () => void };
const SCAN_MS = 1160;
const RESUME = "/Ammar_Adam.pdf";

export function BoardingPass({ p, reduced, onDeparture }: BoardingPassProps) {
  const [status, setStatus] = useState<ScanStatus>("ready");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ticketY = useTransform(p, [0, .38, 1], [reduced ? 0 : 28, 0, reduced ? 0 : -7]);
  const ticketRotate = useTransform(p, [0, .45, 1], [reduced ? 0 : -2, reduced ? 0 : -.6, 0]);

  useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current);
  }, []);

  function scan() {
    if (timer.current !== null) return;
    const clear = () => {
      timer.current = null;
      setStatus("cleared");
      onDeparture();
    };
    if (reduced) {
      clear();
      return;
    }
    setStatus("scanning");
    timer.current = setTimeout(clear, SCAN_MS);
  }

  const scannerLabel = status === "cleared" ? "Scan again" : status === "scanning" ? "Scanning…" : "Scan for my resume";

  return <div className={`bp-scene ${reduced ? "bp-reduced" : ""}`} data-scan-status={status} data-scan-duration={SCAN_MS}>
    <div className="bp-layout">
      <div className="bp-introduction">
        <div className="bp-heading"><p className="sv-eyebrow">04 / NOW BOARDING</p><h2>See you<br /><span>out there.</span></h2></div>
        <div className="bp-contact"><p>Let’s see what’s next.</p><a className="bp-hello" href={siteConfig.socialLinks.email}>Say hello <span aria-hidden="true">↗</span></a><nav className="bp-socials" aria-label="Find Ammar online"><a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={siteConfig.socialLinks.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={siteConfig.socialLinks.x} target="_blank" rel="noreferrer">X ↗</a></nav></div>
      </div>

      <motion.div className="bp-ticket" data-scan-status={status} style={{ y: ticketY, rotate: ticketRotate }}>
        <div className="bp-main">
          <div className="bp-airline"><strong>AFA<span>AMMAR ADAM</span></strong><span>BOARDING PASS<small>THE ONE-PAGE VERSION</small></span><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M18 3h4l2 14 12 8v4l-12-4-1 9 5 3v2l-8-2-8 2v-2l5-3-1-9-12 4v-4l12-8z" fill="currentColor" /></svg></div>
          <div className="bp-main-content">
            <div className="bp-passenger"><span>PASSENGER</span><strong>ADAM / AMMAR</strong><small>CS &amp; FINANCE · UNIVERSITY OF WATERLOO</small></div>
            <div className="bp-route"><div><span>FROM</span><strong>YKF</strong><small>WATERLOO</small></div><div className="bp-route-line" aria-hidden="true"><span /><b>→</b><span /></div><div><span>TO</span><strong>NEXT</strong><small>WHAT’S NEXT</small></div></div>
            <dl className="bp-details"><div><dt>FLIGHT</dt><dd>AA 001</dd></div><div><dt>GATE</dt><dd>05</dd></div><div><dt>SEAT</dt><dd>01A</dd></div><div><dt>DOCUMENT</dt><dd>RESUME / PDF</dd></div></dl>
          </div>
        </div>
        <div className="bp-stub">
          <div className="bp-stub-header"><span>BOARDING PASS</span><strong>AA 001</strong></div>
          <div className="bp-stub-passenger"><span>ADAM / AMMAR</span><strong>YKF <i aria-hidden="true">→</i> NEXT</strong><small>GATE 05 <b>SEAT 01A</b></small></div>
          <button type="button" className="bp-scanner" data-scan-trigger="true" data-scan-status={status} disabled={status === "scanning"} aria-busy={status === "scanning"} aria-label={status === "cleared" ? "Replay boarding pass scan" : "Scan boarding pass to reveal resume"} onClick={scan}>
            <span className="bp-barcode" aria-hidden="true"><span className="bp-code-bars" />{status === "scanning" && <span className="bp-scan-line" style={{ animationDuration: `${SCAN_MS}ms` }} />}<span className="bp-code-number">AA / AMMAR-ADAM / 001</span></span>
            <span className="bp-scan-label">{scannerLabel}<b aria-hidden="true">{status === "cleared" ? "↻" : "↗"}</b></span>
          </button>
          <div className="bp-clearance" role="status" aria-live="polite"><i aria-hidden="true" /><span>{status === "scanning" ? "SCANNING" : status === "cleared" ? "CLEARED — READY TO GO" : "READY TO SCAN"}</span></div>
        </div>
      </motion.div>

      <div className="bp-actions">
        {status === "cleared" ? <a className="bp-resume-link" data-resume-ready="true" href={RESUME} target="_blank" rel="noreferrer"><span>Open my resume <small>PDF · NEW TAB</small></span><b aria-hidden="true">↗</b></a> : <p className="bp-scan-instruction">{status === "scanning" ? "Checking your boarding pass…" : "Scan the barcode, then open my resume."}</p>}
        <a className="bp-direct-link" href={RESUME} target="_blank" rel="noreferrer">Open PDF directly <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </div>;
}
