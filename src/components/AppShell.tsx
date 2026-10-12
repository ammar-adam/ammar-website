"use client";

import { useEffect, useRef, useState } from "react";
import { stops, type StopId } from "@/components/stops/stops";
import { siteConfig } from "@/data/site";

const cloudVideoUrl = "https://videos.pexels.com/video-files/9669392/9669392-hd_1080_1920_30fps.mp4";


type Theme = "day" | "night";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const firstTick = window.setTimeout(() => setNow(new Date()), 0);
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.clearTimeout(firstTick);
      window.clearInterval(id);
    };
  }, []);

  if (!now) return "--:--:--";

  return new Intl.DateTimeFormat("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
}

/** Which stop is under the top third of the screen. */
function useActiveStop(): StopId {
  const [active, setActive] = useState<StopId>("check-in");
  useEffect(() => {
    const update = () => {
      const line = window.innerHeight * 0.35;
      let current: StopId = "check-in";
      for (const stop of stops) {
        const el = document.getElementById(stop.id);
        if (el && el.getBoundingClientRect().top <= line) current = stop.id;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return active;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const clock = useClock();
  const [theme, setTheme] = useState<Theme>("day");
  const [themeHydrated, setThemeHydrated] = useState(false);
  const active = useActiveStop();
  const navRef = useRef<HTMLElement>(null);
  const [planeX, setPlaneX] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (window.localStorage.getItem("afa-theme") === "night") setTheme("night");
      setThemeHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (themeHydrated) window.localStorage.setItem("afa-theme", theme);
  }, [theme, themeHydrated]);

  useEffect(() => {
    document.documentElement.dataset.accent = "amber";
  }, []);


  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLAnchorElement>(`a[data-stop="${active}"]`);
    if (!nav || !link) return;
    const place = () => setPlaneX(link.offsetLeft + link.offsetWidth / 2);
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  return (
    <div className="app-shell">
      <div className="app-sky" aria-hidden>
        <div className="sky-grad" />
        <div className="sky-clouds sky-clouds-a" />
        <div className="sky-clouds sky-clouds-b" />
        <video className="sky-video" autoPlay muted loop playsInline preload="metadata">
          <source src={cloudVideoUrl} type="video/mp4" />
        </video>
        <div className="sky-grain" />
        <div className="sky-vignette" />
        <img className="sky-plane" src="/airport-icons/plane-side.svg" alt="" />
      </div>
      <div className="ambient" aria-hidden>
        <img className="float-prop float-prop-plane" src="/airport-icons/plane-side.svg" alt="" />
        <img className="float-prop float-prop-bag-a" src="/airport-icons/suitcase-1.svg" alt="" />
        <img className="float-prop float-prop-bag-b" src="/airport-icons/carryon.svg" alt="" />
        <img className="float-prop float-prop-ticket" src="/airport-icons/boarding-pass.svg" alt="" />
        <span className="float-bag-card float-bag-card-a"><b>YYZ</b><small>BAG TAG</small></span>
        <span className="float-bag-card float-bag-card-b"><b>DXB</b><small>CLAIM 03</small></span>
      </div>
      <header className="topbar">
        <a href="#check-in" className="brand" aria-label="Back to check-in">
          <span className="brand-pin"><img src="/airport-icons/plane-side.svg" alt="" /></span>
          <span>AFA <b>International</b></span>
        </a>
        <nav className="topnav walk-nav" aria-label="Walk through the terminal" ref={navRef}>
          {stops.map((stop) => (
            <a key={stop.id} href={`#${stop.id}`} data-stop={stop.id} className={active === stop.id ? "active" : ""}>
              <span>{stop.code}</span>
              {stop.label}
            </a>
          ))}
          <i className="walk-track" aria-hidden />
          {planeX !== null && (
            <img className="walk-plane" src="/airport-icons/plane-top.svg" alt="" style={{ transform: `translateX(${planeX}px) translateX(-50%) rotate(90deg)` }} />
          )}
        </nav>
        <div className="topmeta">
          <span className="clock">{clock}</span>
        </div>
      </header>

      <main className="app-main">{children}</main>

      <footer className="footer">
        <div>
          <div className="footer-title">Thanks for flying AFA International</div>
          <div className="footer-sub">Ammar Adam · Toronto · Dubai · Karachi · built in Waterloo</div>
        </div>
        <div className="socials" aria-label="Social links">
          <a className="soc-link soc-mail" href={siteConfig.socialLinks.email} aria-label="Email" />
          <a className="soc-link soc-github" href={siteConfig.socialLinks.github} target="_blank" rel="noreferrer" aria-label="GitHub" />
          <a className="soc-link soc-linkedin" href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" />
          <a className="soc-link soc-x" href={siteConfig.socialLinks.x} target="_blank" rel="noreferrer" aria-label="X" />
        </div>
      </footer>

      <div className="dock" aria-label="Display controls">
        <button type="button" className="theme-icon-btn" onClick={() => setTheme(theme === "night" ? "day" : "night")} aria-label={theme === "night" ? "Switch to day mode" : "Switch to night mode"}>
          {theme === "night" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

    </div>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.2 15.6A8.4 8.4 0 0 1 8.4 3.8 8.7 8.7 0 1 0 20.2 15.6Z" />
    </svg>
  );
}

