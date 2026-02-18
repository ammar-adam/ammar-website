"use client";

import { siteConfig } from "@/data/site";

/**
 * Waterloo CS Web Ring — minimal footer widget per official template.
 * @see https://github.com/JusGu/uwatering#widget-template
 * Set NEXT_PUBLIC_SITE_URL to your canonical URL when you join the ring.
 */
const CS_WEBRING_HUB = "https://cs.uwatering.com";
/** Dark theme: use white icon. Use icon.black.svg for light backgrounds. */
const CS_WEBRING_ICON = `${CS_WEBRING_HUB}/icon.white.svg`;

function csRingUrl(fragment: string): string {
  const base = siteConfig.siteUrl;
  return `${CS_WEBRING_HUB}/#${encodeURIComponent(base)}${fragment}`;
}

export function WaterlooWebRing() {
  const prevUrl = csRingUrl("?nav=prev");
  const centerUrl = csRingUrl("");
  const nextUrl = csRingUrl("?nav=next");

  return (
    <div className="webring-minimal" aria-label="CS Webring">
      <div className="webring-inner">
        <a href={prevUrl} title="Previous site in ring" className="webring-nav">
          ←
        </a>
        <a
          href={centerUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="CS Webring"
          className="webring-icon-link"
        >
          <img
            src={CS_WEBRING_ICON}
            alt="CS Webring"
            width={24}
            height={24}
            className="webring-icon"
          />
        </a>
        <a href={nextUrl} title="Next site in ring" className="webring-nav">
          →
        </a>
      </div>
    </div>
  );
}
