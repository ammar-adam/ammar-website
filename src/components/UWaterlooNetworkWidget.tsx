"use client";

import Script from "next/script";
import { siteConfig } from "@/data/site";

const UW_NETWORK_URL = "https://uwaterloo.network";
const EMBED_SCRIPT = "https://uwaterloo.network/embed.js";
/** Same size as CS webring icon; favicon works as their brand mark. */
const UW_NETWORK_ICON = "https://uwaterloo.network/favicon.ico";

/**
 * uwaterloo.network webring — icon + link; optional embed when you've joined.
 * @see https://github.com/Shayaan-Azeem/waterloo.network
 */
export function UWaterlooNetworkWidget() {
  const userId = siteConfig.uwaterlooNetworkUserId;

  return (
    <>
      {userId != null && userId !== "" && (
        <Script
          src={EMBED_SCRIPT}
          strategy="afterInteractive"
          data-webring
          data-user={userId}
        />
      )}
      <a
        href={UW_NETWORK_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="uwaterloo.network"
        className="webring-uw-link"
      >
        <img
          src={UW_NETWORK_ICON}
          alt=""
          width={24}
          height={24}
          className="webring-uw-icon"
        />
        <span className="webring-uw-label">uwaterloo.network</span>
      </a>
    </>
  );
}
