"use client";

import { useCallback, useEffect, useState } from "react";
import "./plane.css";
import { PlaneArt } from "./PlaneArt";
import { getPart, parts, type PartId } from "./parts";
import { Section } from "./Sections";

type Theme = "day" | "night";

function useClock() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-CA", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Toronto" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

function isPart(value: string): value is PartId {
  return parts.some((p) => p.id === value);
}

export function PlaneHome() {
  const [open, setOpen] = useState<PartId | null>(null);
  const [theme, setTheme] = useState<Theme>("day");
  const clock = useClock();

  // Deep links: /#windows opens the windows.
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1);
      setOpen(isPart(hash) ? hash : null);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setTheme(document.documentElement.dataset.theme === "night" ? "night" : "day"), 0);
    return () => window.clearTimeout(id);
  }, []);

  const pick = useCallback((id: PartId) => {
    window.history.pushState(null, "", `#${id}`);
    setOpen(id);
  }, []);

  const close = useCallback(() => {
    window.history.pushState(null, "", window.location.pathname);
    setOpen(null);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const toggleTheme = () => {
    const next: Theme = theme === "night" ? "day" : "night";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem("afa-theme", next);
    } catch {}
  };

  const focus = open ? getPart(open) : null;

  return (
    <div className={`ph${open ? " is-open" : ""}`}>
      <div className="ph-sky" aria-hidden>
        <div className="ph-cloud c1" />
        <div className="ph-cloud c2" />
        <div className="ph-cloud c3" />
        <div className="ph-stars" />
      </div>

      <header className="ph-bar">
        <button type="button" className="ph-brand" onClick={close}>
          <img src="/icon.svg" alt="" width={22} height={22} />
          <span>AFA <b>International</b></span>
        </button>
        <div className="ph-meta">
          <span className="ph-clock">YYZ {clock}</span>
          <button type="button" className="ph-theme" onClick={toggleTheme} aria-label={theme === "night" ? "Fly by day" : "Fly at night"}>
            {theme === "night" ? "☀" : "☾"}
          </button>
        </div>
      </header>

      <main className="ph-main">
        <div className="ph-intro">
          <h1>Hi, I&apos;m Ammar.</h1>
          <p>CS &amp; Finance at Waterloo. AI engineer at Sagard, founding builder lead at OpenAI.</p>
          <nav className="ph-nav" aria-label="Sections">
            {parts.map((p) => (
              <button type="button" key={p.id} onClick={() => pick(p.id)}>
                {p.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="ph-stage">
          <div className="ph-camera">
            <div className="ph-float">
              <PlaneArt />
            </div>
          </div>
        </div>

      </main>

      {focus && (
        <div className="ph-panel-wrap" onClick={close}>
          <section className="ph-panel" key={focus.id} onClick={(event) => event.stopPropagation()} aria-label={focus.label}>
            <div className="ph-panel-head">
              <h2>{focus.label}</h2>
              <button type="button" className="ph-close" onClick={close} aria-label="Close">✕</button>
            </div>
            <Section id={focus.id} />
          </section>
        </div>
      )}
    </div>
  );
}
