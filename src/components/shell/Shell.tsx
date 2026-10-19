"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import "./shared.css";

type Theme = "day" | "night";

function subscribeTheme(cb: () => void) {
  window.addEventListener("afa-theme", cb);
  return () => window.removeEventListener("afa-theme", cb);
}
const readTheme = (): Theme => (document.documentElement.dataset.theme === "night" ? "night" : "day");

/** Day/night, persisted. Flips with a view transition where supported. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "day" as Theme);
  const toggle = () => {
    const next: Theme = theme === "day" ? "night" : "day";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("afa-theme", next);
      } catch {}
      window.dispatchEvent(new Event("afa-theme"));
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(apply);
    else apply();
  };
  return { theme, toggle };
}

export function useClock() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-CA", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Toronto" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

export const cloudVideoUrl = "/sky.mp4";
export const cloudPosterUrl = "/sky-poster.jpg";

/** The old site's sky: gradient, drifting clouds, cloud video, grain, a plane crossing now and then. */
export function Sky({ className = "" }: { className?: string }) {
  return (
    <div className={`app-sky ${className}`} aria-hidden>
      <div className="sky-grad" />
      <div className="sky-clouds sky-clouds-a" />
      <div className="sky-clouds sky-clouds-b" />
      <video className="sky-video" autoPlay muted loop playsInline preload="metadata" poster={cloudPosterUrl}>
        <source src={cloudVideoUrl} type="video/mp4" />
      </video>
      <div className="sky-grain" />
      <div className="sky-vignette" />
      <img className="sky-plane" src="/airport-icons/plane-side.svg" alt="" />
    </div>
  );
}

/**
 * Minimal top bar in the old site's style: brand, a live "you are here" slot,
 * Toronto clock and the day/night toggle. `here` is whatever the variant wants to show.
 */
export function TopBar({ here }: { here?: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  const clock = useClock();
  return (
    <header className="vbar">
      <Link href="/" className="brand" aria-label="AFA International home">
        <span className="brand-pin"><img src="/airport-icons/plane-side.svg" alt="" /></span>
        <span>AFA <b>International</b></span>
      </Link>
      <div className="vbar-here">{here}</div>
      <div className="topmeta">
        <span className="clock" title="Toronto time">YYZ {clock}</span>
        <button className="vbar-theme" onClick={toggle} aria-label={theme === "day" ? "Switch to night" : "Switch to day"}>
          <span className={`vbar-orb ${theme}`} aria-hidden />
        </button>
      </div>
    </header>
  );
}
