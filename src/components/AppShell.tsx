"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { projects } from "@/data/departures";
import { arrivals } from "@/data/arrivals";
import { siteConfig } from "@/data/site";

const cloudVideoUrl = "https://videos.pexels.com/video-files/9669392/9669392-hd_1080_1920_30fps.mp4";

const gates = [
  { id: "projects", gate: "A", label: "Projects", href: "/projects", info: "Things I've been building" },
  { id: "arrivals", gate: "B", label: "Experiences", href: "/arrivals", info: "Cool stuff I've done" },
  { id: "about", gate: "C", label: "About", href: "/about", info: "Get to know the pilot" },
  { id: "resume", gate: "D", label: "Resume", href: "/resume", info: "Scan your boarding pass" },
] as const;

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

function activeGate(pathname: string) {
  if (pathname.startsWith("/projects") || pathname.startsWith("/departures")) return "projects";
  if (pathname.startsWith("/arrivals")) return "arrivals";
  if (pathname.startsWith("/about") || pathname.startsWith("/lounge")) return "about";
  if (pathname.startsWith("/resume") || pathname.startsWith("/boarding-pass")) return "resume";
  return "home";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const clock = useClock();
  const [theme, setTheme] = useState<Theme>("day");
  const [themeHydrated, setThemeHydrated] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const active = activeGate(pathname);

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
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
        <Link href="/" className="brand" aria-label="AFA International home">
          <span className="brand-pin"><img src="/airport-icons/plane-side.svg" alt="" /></span>
          <span>AFA <b>International</b></span>
        </Link>
        <nav className="topnav" aria-label="Gate navigation">
          {gates.map((gate) => (
            <Link key={gate.id} href={gate.href} className={active === gate.id ? "active" : ""}>
              <span>{gate.gate}</span>
              {gate.label}
            </Link>
          ))}
        </nav>
        <div className="topmeta">
          <span className="clock">{clock}</span>
          <button type="button" className="kbd" onClick={() => setCommandOpen(true)}>
            Ctrl K
          </button>
        </div>
        <button
          type="button"
          className="mobile-search"
          onClick={() => setCommandOpen(true)}
          aria-label="Search site"
        >
          <SearchIcon />
        </button>
      </header>

      <main className="app-main">{children}</main>

      <footer className="footer">
        <div>
          <div className="footer-title">AFA International</div>
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

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onGo={(href) => router.push(href)}
      />
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" />
    </svg>
  );
}

function CommandPalette({
  open,
  onClose,
  onGo,
}: {
  open: boolean;
  onClose: () => void;
  onGo: (href: string) => void;
}) {
  const [query, setQuery] = useState("");
  const items = useMemo(
    () => [
      { code: "A", title: "Projects", sub: "Things I've been building", href: "/projects" },
      { code: "B", title: "Experiences", sub: "Cool stuff I've done", href: "/arrivals" },
      { code: "C", title: "About", sub: "Get to know the pilot", href: "/about" },
      { code: "D", title: "Resume", sub: "Scan your boarding pass", href: "/resume" },
      ...projects.map((project) => ({
        code: project.flightCode,
        title: project.name,
        sub: project.routeName,
        href: `/departures/${project.slug}`,
      })),
      ...arrivals.map((arrival) => ({
        code: arrival.origin,
        title: arrival.from,
        sub: arrival.title,
        href: `/arrivals/${arrival.slug}`,
      })),
    ],
    [],
  );
  const filtered = items.filter((item) => `${item.title} ${item.sub}`.toLowerCase().includes(query.toLowerCase()));

  if (!open) return null;

  return (
    <div className="cmdk-overlay" onClick={onClose}>
      <div className="cmdk" onClick={(event) => event.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
            if (event.key === "Enter" && filtered[0]) {
              onGo(filtered[0].href);
              onClose();
            }
          }}
          placeholder="Where to? Search gates, projects, experiences..."
        />
        <div className="cmdk-list">
          {filtered.map((item) => (
            <button
              type="button"
              key={`${item.href}-${item.code}`}
              className="cmdk-item"
              onClick={() => {
                onGo(item.href);
                onClose();
              }}
            >
              <span>{item.code}</span>
              <strong>{item.title}</strong>
              <em>{item.sub}</em>
            </button>
          ))}
          {filtered.length === 0 && <div className="cmdk-empty">No gates found.</div>}
        </div>
      </div>
    </div>
  );
}
