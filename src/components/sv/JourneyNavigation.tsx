"use client";

import { CHAPTERS } from "./timeline";

export function JourneyNavigation({ chapter, onNavigate }: { chapter: number; onNavigate: (index: number) => void }) {
  return <nav className="journey-rail" aria-label="Terminal chapters">
    {CHAPTERS.map((item, index) => <button key={item.id} type="button" aria-current={chapter === index ? "location" : undefined} onClick={() => onNavigate(index)}>{item.short}</button>)}
  </nav>;
}
