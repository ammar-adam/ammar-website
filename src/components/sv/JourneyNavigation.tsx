"use client";

import { useEffect, useRef, useState } from "react";
import { CHAPTERS } from "./timeline";
import "./journey-navigation.css";

const names = ["Introduction", "Experience", "Projects", "Concourse", "Résumé"];

export function JourneyNavigation({ chapter, onNavigate }: { chapter: number; onNavigate: (index: number) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="journey-navigation" ref={root}>
    <button ref={trigger} type="button" className="journey-menu-trigger" aria-expanded={open} aria-controls="journey-menu" onClick={() => setOpen(value => !value)}>Explore <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></button>
    {open && <nav id="journey-menu" className="journey-menu" aria-label="Explore the portfolio">
      {CHAPTERS.map((item, index) => <button key={item.id} type="button" aria-current={chapter === index ? "location" : undefined} onClick={() => { setOpen(false); onNavigate(index); trigger.current?.focus(); }}><span>{names[index]}</span><span aria-hidden="true">{chapter === index ? "●" : "↗"}</span></button>)}
    </nav>}
  </div>;
}
