"use client";

import { useState } from "react";
import { StopSign } from "@/components/stops/StopSign";
import { boardingPassConfig } from "@/data/boardingPass";

export function Boarding() {
  const [scanning, setScanning] = useState(false);

  const scan = () => {
    if (scanning) return;
    setScanning(true);
    window.setTimeout(() => {
      window.open(boardingPassConfig.resumeFileUrl, "_blank");
      setScanning(false);
    }, 1100);
  };

  return (
    <section className="stop wrap" id="boarding" data-screen-label="Resume">
      <StopSign code="4" name="Boarding" dest="Resume" hint="Scan the barcode for the full PDF." />

      <div className="resume-wrap">
        <div className="pass">
          <div className="pass-main">
            <div className="pm-head">
              <span className="pm-wm"><img src="/airport-icons/plane-side.svg" alt="" />AFA INTERNATIONAL · BOARDING PASS</span>
              <span className="pm-cls">FIRST</span>
            </div>
            <div className="pass-route">
              <div className="pr-l"><div className="pr-code">{boardingPassConfig.from}</div><div className="pr-lbl">TORONTO</div></div>
              <div className="pr-mid">✈</div>
              <div className="pr-r"><div className="pr-code">GR8</div><div className="pr-lbl">{boardingPassConfig.to.toUpperCase()}</div></div>
            </div>
            <div className="pass-fields">
              <div className="pass-field"><div className="pf-k">Passenger</div><div className="pf-v">{boardingPassConfig.displayName}</div></div>
              <div className="pass-field"><div className="pf-k">Flight</div><div className="pf-v">{boardingPassConfig.flight}</div></div>
              <div className="pass-field"><div className="pf-k">Status</div><div className="pf-v pf-accent">{boardingPassConfig.tagline}</div></div>
            </div>
          </div>
          <div className="pass-stub">
            <div className="ps-k">Passenger</div><div className="ps-v">{boardingPassConfig.displayName}</div>
            <div className="ps-k">Flight</div><div className="ps-v">{boardingPassConfig.flight}</div>
            <button type="button" className={`scan-btn${scanning ? " scanning" : ""}`} onClick={scan} title={boardingPassConfig.ctaLabel}>
              <div className="scan-frame">
                <div className="ps-bar" />
                <div className="scan-laser" />
              </div>
              <span className="scan-hint">{scanning ? "SCANNING..." : "POINT & SCAN"}</span>
            </button>
          </div>
        </div>
        <div className="resume-cta">
          <a className="btn solid" href={boardingPassConfig.resumeFileUrl} target="_blank" rel="noreferrer">Download Resume</a>
          <a className="btn" href="mailto:ammar.adam@uwaterloo.ca">Email me</a>
        </div>
      </div>
    </section>
  );
}
