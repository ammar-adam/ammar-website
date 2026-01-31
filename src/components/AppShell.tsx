"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/site";

function getNavIndicator(pathname: string): string | null {
  if (pathname.startsWith("/departures")) return "Now Boarding: Departures";
  if (pathname.startsWith("/arrivals")) return "Now Arriving: Arrivals";
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navIndicator = getNavIndicator(pathname);

  const navItems = [
    { href: "/terminal", label: siteConfig.navLabels.terminal },
    { href: "/departures", label: siteConfig.navLabels.departures },
    { href: "/arrivals", label: siteConfig.navLabels.arrivals },
    { href: "/lounge", label: siteConfig.navLabels.lounge },
    { href: "/boarding-pass", label: siteConfig.navLabels.boardingPass },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/60">
        <nav className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-2 sm:gap-4">
            <Link
              href="/terminal"
              className="flex-shrink-0 text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 rounded"
            >
              {siteConfig.siteName}
            </Link>

            <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto scrollbar-hide min-w-0">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex-shrink-0 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 rounded ${
                    pathname === href || pathname.startsWith(href + "/")
                      ? "text-neutral-900 font-medium"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {navIndicator && (
                <span className="text-xs text-neutral-500 hidden sm:inline">
                  {navIndicator}
                </span>
              )}
              <div className="flex gap-3" aria-label="Social links">
                <a
                  href={siteConfig.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 rounded"
                  aria-label="GitHub"
                >
                  <GitHubIcon className="w-4 h-4" />
                </a>
                <a
                  href={siteConfig.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 rounded"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="w-4 h-4" />
                </a>
                <a
                  href={siteConfig.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 rounded"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-neutral-200/60 py-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center text-sm text-neutral-500">
          {siteConfig.siteName} · Terminal
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
