"use client";

import Script from "next/script";
import { siteConfig } from "@/data/site";

const EMBED_SCRIPT = "https://uwaterloo.network/embed.js";

/**
 * Loads uwaterloo.network embed script when you've joined (set uwaterlooNetworkUserId in site config).
 * The second lion in the footer links to uwaterloo.network; this script adds their nav widget.
 * @see https://github.com/Shayaan-Azeem/waterloo.network
 */
export function UWaterlooNetworkWidget() {
  const userId = siteConfig.uwaterlooNetworkUserId;

  if (userId == null || userId === "") return null;

  return (
    <Script
      src={EMBED_SCRIPT}
      strategy="afterInteractive"
      data-webring
      data-user={userId}
    />
  );
}
