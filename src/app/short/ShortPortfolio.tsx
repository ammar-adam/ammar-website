"use client";

import { useState, useSyncExternalStore } from "react";
import { ShortPortfolioContent } from "@/components/sv/ShortPortfolioContent";
import { ShortColorField } from "./ShortColorField";

const query = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (update: () => void) => {
  const preference = window.matchMedia(query);
  preference.addEventListener("change", update);
  return () => preference.removeEventListener("change", update);
};
const readMotion = () => window.matchMedia(query).matches;

export default function ShortPortfolio() {
  const reduced = useSyncExternalStore(subscribeMotion, readMotion, () => true);
  const [paused, setPaused] = useState(false);

  return <div className="short-page">
    <ShortColorField paused={reduced || paused} />
    <a className="short-skip" href="#short-about">Skip to content</a>
    <main className="short-content">
      <ShortPortfolioContent idPrefix="short" />
      {!reduced && <button className="short-motion" type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? "Resume background" : "Pause background"}<span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span></button>}
    </main>
  </div>;
}
