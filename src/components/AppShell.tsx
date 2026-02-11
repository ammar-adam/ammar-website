"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/site";
import { PlaneIcon } from "@/components/ui/PlaneIcon";
import { TerminalClock } from "@/components/ui/TerminalClock";
import { InfoDesk } from "@/components/InfoDesk";

const navItems = [
  { id: "projects", label: siteConfig.navLabels.projects, href: "/projects" },
  { id: "arrivals", label: siteConfig.navLabels.arrivals, href: "/arrivals" },
  { id: "about", label: siteConfig.navLabels.about, href: "/about" },
  { id: "resume", label: siteConfig.navLabels.resume, href: "/resume" },
] as const;

function getActiveId(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/projects") || pathname.startsWith("/departures")) return "projects";
  if (pathname.startsWith("/arrivals")) return "arrivals";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/resume") || pathname.startsWith("/boarding-pass")) return "resume";
  return "home";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const displayActive = getActiveId(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-transparent relative z-10">
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] glass-surface">
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12"
          aria-label="Terminal wayfinding"
        >
          <div className="flex h-14 sm:h-16 items-center justify-between gap-6 sm:gap-8 flex-nowrap">
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  window.history.replaceState(null, "", "/");
                }
              }}
              className="flex items-center gap-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] focus:ring-offset-2 focus:ring-offset-[var(--bg-deep)] rounded pl-1"
            >
              <PlaneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent-warm)]" />
              <span className="text-xs sm:text-sm font-medium tracking-wide text-[var(--text-primary)] uppercase hidden sm:inline">
                {siteConfig.airportName}
              </span>
            </Link>

            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide min-w-0 py-2 flex-nowrap">
              {navItems.map(({ id, label, href }) => {
                const isActive = displayActive === id;
                return (
                  <Link
                    key={id}
                    href={href}
                    className={`flex-shrink-0 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] focus:ring-offset-2 focus:ring-offset-[var(--bg-deep)] rounded whitespace-nowrap ${
                      isActive
                        ? "text-[var(--accent-warm)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 flex-nowrap border-l border-[var(--border-subtle)] pl-4">
              <span className="text-[10px] sm:text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                {displayActive === "home" ? "Home" : navItems.find((n) => n.id === displayActive)?.label ?? ""}
              </span>
              <TerminalClock className="hidden sm:block text-[var(--accent-warm)] font-mono text-sm" />
              <div className="hidden sm:flex gap-2" aria-label="Social links">
                <a
                  href={siteConfig.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] rounded"
                  aria-label="GitHub"
                >
                  <GitHubIcon className="w-6 h-6" />
                </a>
                <a
                  href={siteConfig.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] rounded"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="w-6 h-6" />
                </a>
                <a
                  href={siteConfig.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] rounded"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 page-enter">{children}</main>

      <InfoDesk />

      <footer className="border-t border-[var(--border-subtle)] py-3 sm:py-4 bg-[var(--bg-surface)]/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">
            {siteConfig.airportName}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]/70 uppercase tracking-widest hidden sm:inline">
            You are here
          </span>
        </div>
      </footer>
    </div>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
