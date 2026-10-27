"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { JourneyNavigation } from "./JourneyNavigation";
import { SocialLinks } from "./SocialLinks";
import { CHAPTERS } from "./timeline";
import "./journey-navigation.css";

function HeaderLinks() {
  return <div className="journey-shortcuts">
    <Link href="/short">About me</Link>
    <a href="/Ammar_Adam.pdf" target="_blank" rel="noopener noreferrer">Résumé</a>
    <SocialLinks />
  </div>;
}

export function JourneyHeader({ chapter, onNavigate }: { chapter: number; onNavigate: (index: number) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("journey-menu-open");
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    };
    const desktop = window.matchMedia("(min-width: 1051px)");
    const closeOnDesktop = () => {
      if (!desktop.matches) return;
      const focused = document.activeElement;
      const restoreFocus = focused === trigger.current || focused instanceof HTMLElement && !!focused.closest(".journey-mobile-menu");
      setOpen(false);
      if (restoreFocus) root.current?.querySelector<HTMLButtonElement>(".journey-desktop-rail [aria-current]")?.focus({ preventScroll: true });
    };
    desktop.addEventListener("change", closeOnDesktop);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.documentElement.classList.remove("journey-menu-open"); desktop.removeEventListener("change", closeOnDesktop); document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  const navigate = (index: number) => {
    setOpen(false);
    onNavigate(index);
    if (open) requestAnimationFrame(() => trigger.current?.focus());
  };
  return <header ref={root} className="journey-header" onBlurCapture={event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
  }}>
    <div className="journey-header-inner">
      <div className="journey-header-left">
        <button className="journey-brand" type="button" aria-label="Replay introduction" onClick={() => navigate(0)}><span aria-hidden="true">a<span>/</span>a</span></button>
        <div className="journey-desktop-rail"><JourneyNavigation chapter={chapter} onNavigate={navigate} /></div>
        <span className="journey-current-chapter">{CHAPTERS[chapter].short}</span>
      </div>
      <div className="journey-desktop-shortcuts"><HeaderLinks /></div>
      <Link className="journey-mobile-short" href="/short">About me</Link>
      <button ref={trigger} className="journey-menu-button" type="button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(value => !value)}>
        <span>Menu</span><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d={open ? "m4 4 10 10M14 4 4 14" : "M2 5h14M2 9h14M2 13h14"} fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
      </button>
    </div>
    <div id={menuId} className="journey-mobile-menu" hidden={!open} onKeyDown={event => {
      if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
      const choices = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>(".journey-rail button"));
      const active = choices.indexOf(document.activeElement as HTMLButtonElement);
      if (active < 0) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? choices.length - 1 : (active + (event.key === "ArrowDown" ? 1 : -1) + choices.length) % choices.length;
      choices[next]?.focus();
    }}>
      <JourneyNavigation chapter={chapter} onNavigate={navigate} />
      <HeaderLinks />
    </div>
  </header>;
}
