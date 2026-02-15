import { siteConfig } from "@/data/site";
import { TerminalDirectoryBoard } from "@/components/terminal/TerminalDirectoryBoard";

export default function HomePage() {
  return (
    <section className="min-h-[70vh] flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-8 sm:py-20 relative home-hero">
      <div className="absolute top-0 right-0 w-64 h-full max-h-[420px] bg-gradient-to-l from-[var(--terminal-blue)]/20 to-transparent pointer-events-none" aria-hidden />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--terminal-navy)]/50 to-transparent pointer-events-none" aria-hidden />

      <div className="mx-auto max-w-4xl w-full text-center min-w-0">
        <p className="page-title text-base sm:text-xl font-semibold text-[var(--window-white)] mb-2 uppercase tracking-wide hero-oneliner">
          {siteConfig.heroOneLiner}
        </p>
        <p className="directory-instruction">
          Select your gate for departure
        </p>

        <TerminalDirectoryBoard />
      </div>
    </section>
  );
}
