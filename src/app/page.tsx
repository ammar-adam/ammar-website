import { siteConfig } from "@/data/site";
import { TerminalDirectoryBoard } from "@/components/terminal/TerminalDirectoryBoard";

export default function HomePage() {
  return (
    <section className="min-h-[70vh] flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-12 sm:py-20 relative">
      <div className="absolute top-0 right-0 w-64 h-full max-h-[420px] bg-gradient-to-l from-[var(--terminal-blue)]/20 to-transparent pointer-events-none" aria-hidden />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--terminal-navy)]/50 to-transparent pointer-events-none" aria-hidden />

      <div className="mx-auto max-w-4xl w-full">
        <p className="page-title text-lg sm:text-xl font-semibold text-[var(--window-white)] mb-1 uppercase tracking-wide">
          {siteConfig.heroOneLiner}
        </p>
        <p className="text-sm text-[var(--metal-gray)] mb-6 font-mono">Use the directory below to navigate.</p>

        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--metal-gray)] mb-2">
          Terminal Directory
        </p>
        <TerminalDirectoryBoard />

        <div className="terminal-location mt-8 text-center sm:text-left">
          <p className="location-text font-mono text-[11px] text-[var(--metal-gray)] uppercase tracking-[0.15em]">
            You are here: <span className="location-code text-[var(--departure-amber)] font-bold">AA</span> — Terminal entrance
          </p>
        </div>
      </div>
    </section>
  );
}
