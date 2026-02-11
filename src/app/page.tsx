import { siteConfig } from "@/data/site";
import { TerminalDirectoryBoard } from "@/components/terminal/TerminalDirectoryBoard";

export default function HomePage() {
  const headshotUrl = siteConfig.photoUrl;

  return (
    <section className="min-h-[70vh] flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-12 sm:py-20 relative">
      <div className="absolute top-0 right-0 w-64 h-full max-h-[420px] bg-gradient-to-l from-[var(--terminal-blue)]/20 to-transparent pointer-events-none" aria-hidden />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--terminal-navy)]/50 to-transparent pointer-events-none" aria-hidden />

      <div className="mx-auto max-w-4xl w-full flex flex-col md:flex-row md:items-start gap-8 md:gap-10">
        <div className="flex-shrink-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--metal-gray)] mb-3 text-center md:text-left">
            You are here
          </div>
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border-2 border-[var(--floor-line)] bg-[var(--terminal-dark)] flex items-center justify-center flex-shrink-0"
            aria-hidden
          >
            {headshotUrl ? (
              <img src={headshotUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[var(--metal-gray)] font-[var(--font-signage)] text-2xl font-bold">AA</span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-lg sm:text-xl font-semibold text-[var(--window-white)] mb-1 font-signage uppercase tracking-wide">
            {siteConfig.heroOneLiner}
          </p>
          <p className="text-sm text-[var(--metal-gray)] mb-6 font-mono">Use the directory below to navigate.</p>

          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--metal-gray)] mb-2">
            Terminal Directory
          </p>
          <TerminalDirectoryBoard />

          <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-[var(--metal-gray)]">
            You are here: AA — Terminal entrance
          </p>
        </div>
      </div>
    </section>
  );
}
