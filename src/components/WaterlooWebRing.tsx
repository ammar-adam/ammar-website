"use client";

import { siteConfig } from "@/data/site";

/**
 * Waterloo webrings — one row: ← [CS lion] [UW lion] →
 * Both use the same lion icon; CS arrows for prev/next in the ring.
 * @see https://github.com/JusGu/uwatering | https://github.com/Shayaan-Azeem/waterloo.network
 */
const CS_WEBRING_HUB = "https://cs.uwatering.com";
const UW_NETWORK_URL = "https://uwaterloo.network";
/** Same lion for both; dark theme. Use icon.black.svg for light backgrounds. */
const LION_ICON = `${CS_WEBRING_HUB}/icon.white.svg`;

function csRingUrl(fragment: string): string {
  const base = siteConfig.siteUrl;
  return `${CS_WEBRING_HUB}/#${encodeURIComponent(base)}${fragment}`;
}

export function WaterlooWebRing() {
  const prevUrl = csRingUrl("?nav=prev");
  const csCenterUrl = csRingUrl("");
  const nextUrl = csRingUrl("?nav=next");

  return (
    <div className="webring-minimal" aria-label="Waterloo webrings">
      <div className="webring-inner">
        <a href={prevUrl} title="Previous site in CS ring" className="webring-nav">
          ←
        </a>
        <a
          href={csCenterUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="CS Webring"
          className="webring-icon-link"
        >
          <img
            src={LION_ICON}
            alt="CS Webring"
            width={24}
            height={24}
            className="webring-icon"
          />
        </a>
        <a
          href={UW_NETWORK_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="uwaterloo.network"
          className="webring-icon-link"
        >
          <img
            src={LION_ICON}
            alt="uwaterloo.network"
            width={24}
            height={24}
            className="webring-icon"
          />
        </a>
        <a href={nextUrl} title="Next site in CS ring" className="webring-nav">
          →
        </a>
      </div>
    </div>
  );
}
