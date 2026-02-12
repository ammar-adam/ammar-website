"use client";

import { siteConfig } from "@/data/site";

/**
 * Waterloo Web Ring (UWaterloo CS) — subtle footer integration.
 * @see https://github.com/JusGu/uwatering
 * Set NEXT_PUBLIC_SITE_URL to your canonical URL when you join the ring.
 */
const WEBRING_HUB = "https://cs.uwatering.com";

function buildNavUrl(nav: "prev" | "next"): string {
  const base = siteConfig.siteUrl;
  return `${WEBRING_HUB}/#${encodeURIComponent(base)}?nav=${nav}`;
}

export function WaterlooWebRing() {
  const prevUrl = buildNavUrl("prev");
  const nextUrl = buildNavUrl("next");

  return (
    <div className="webring-minimal" aria-label="Waterloo Web Ring">
      <span className="webring-text">
        <a href={prevUrl} title="Previous site in ring">
          ←
        </a>
        {" · "}
        <a href={WEBRING_HUB} target="_blank" rel="noopener noreferrer" title="Waterloo Web Ring">
          Waterloo Web Ring
        </a>
        {" · "}
        <a href={nextUrl} title="Next site in ring">
          →
        </a>
      </span>
    </div>
  );
}
