"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { siteConfig } from "@/data/site";
import "./boarding-pass.css";

type ScanStatus = "ready" | "scanning" | "cleared";
type BoardingPassProps = { p: MotionValue<number>; reduced: boolean; onDeparture: () => void };
const SCAN_MS = 1080;
const RESUME = "/Ammar_Adam.pdf";

export function BoardingPass({ p, reduced, onDeparture }: BoardingPassProps) {
  const [status, setStatus] = useState<ScanStatus>("ready");
  const [scanNumber, setScanNumber] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const y = useTransform(p, [0, .3, 1], [reduced ? 0 : 24, 0, reduced ? 0 : -8]);
  const rotate = useTransform(p, [0, .5, 1], [reduced ? 0 : -3, reduced ? 0 : -1.5, reduced ? 0 : -.75]);

  useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current);
  }, []);

  function scan() {
    if (timer.current !== null) clearTimeout(timer.current);
    setScanNumber((value) => value + 1);
    setStatus(reduced ? "cleared" : "scanning");
    onDeparture();
    if (!reduced) timer.current = setTimeout(() => {
      timer.current = null;
      setStatus("cleared");
    }, SCAN_MS);
  }

  return <div className={`bp-scene${reduced ? " bp-reduced" : ""}`} data-scan-status={status} data-scan-duration={SCAN_MS}>
    <div className="bp-layout">
      <div className="bp-introduction">
        <p className="bp-eyebrow">AMMAR ADAM / GET IN TOUCH</p>
        <h2 className="bp-title">That’s the story<br /> so far.</h2>
      </div>

      <motion.article className="bp-ticket" aria-label="Ammar Adam’s resume boarding pass" data-scan-status={status} style={{ y, rotate }}>
        <div className="bp-main">
          <div className="bp-airline"><strong><i aria-hidden="true">AA</i> AMMAR ADAM</strong><span>BOARDING PASS</span></div>
          <div className="bp-main-content">
            <div className="bp-passenger"><span>PASSENGER</span><strong>ADAM / AMMAR</strong><small>Computer Science &amp; Finance · Waterloo</small></div>
            <div className="bp-route"><div><span>FROM</span><strong>YKF</strong><small>WATERLOO</small></div><div className="bp-route-line" aria-hidden="true"><i /><svg viewBox="0 0 24 24"><path d="M21 12 3 3l2 7 10 2-10 2-2 7z" fill="currentColor" /></svg><i /></div><div><span>TO</span><strong>NEXT</strong><small>WHAT’S NEXT</small></div></div>
            <dl className="bp-details"><div><dt>FLIGHT</dt><dd>AA 001</dd></div><div><dt>GATE</dt><dd>05</dd></div><div><dt>SEAT</dt><dd>01A</dd></div><div><dt>DOCUMENT</dt><dd>RESUME</dd></div></dl>
            <div className="bp-paper-footer"><span>AMMARADAM.COM</span><span>KEEP THIS PART</span></div>
          </div>
        </div>
        <div className="bp-stub">
          <div className="bp-stub-header"><span>RESUME / PDF</span><strong>AA 001</strong></div>
          <div className="bp-stub-passenger"><span>ADAM / AMMAR</span><strong>YKF <i aria-hidden="true">→</i> NEXT</strong></div>
          <a className="bp-scanner" data-scan-trigger="true" data-scan-status={status} href={RESUME} target="_blank" rel="noreferrer" aria-label="Open Ammar Adam’s resume PDF in a new tab" onClick={scan}>
            <span className="bp-barcode" aria-hidden="true"><span className="bp-code-bars" />{status === "scanning" && <span key={scanNumber} className="bp-scan-line" style={{ animationDuration: `${SCAN_MS}ms` }} />}<span className="bp-code-number">001 / AMMAR-ADAM / 01A</span></span>
            <span className="bp-scan-label">{status === "scanning" ? "Opening resume" : status === "cleared" ? "Open resume again" : "Scan & open resume"}<b aria-hidden="true">↗</b></span>
          </a>
          <div className="bp-clearance" role="status" aria-live="polite"><i aria-hidden="true" /><span>{status === "scanning" ? "SCANNING" : status === "cleared" ? "CLEARED FOR DEPARTURE" : "READY WHEN YOU ARE"}</span></div>
        </div>
      </motion.article>

      <div className="bp-contact">
        <a className="bp-hello" href={siteConfig.socialLinks.email}>Say hello <span aria-hidden="true">↗</span></a>
        <nav className="bp-socials" aria-label="Find Ammar online"><a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={siteConfig.socialLinks.github} target="_blank" rel="noreferrer">GitHub</a><a href={siteConfig.socialLinks.x} target="_blank" rel="noreferrer">X</a><a className="bp-direct-link" href={RESUME} target="_blank" rel="noreferrer">Resume PDF <span aria-hidden="true">↗</span></a></nav>
      </div>
    </div>
  </div>;
}
