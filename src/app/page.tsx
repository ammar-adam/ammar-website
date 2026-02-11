import { siteConfig } from "@/data/site";
import { TerminalDirectoryBoard } from "@/components/terminal/TerminalDirectoryBoard";

export default function HomePage() {
  const headshotUrl = siteConfig.photoUrl;

  return (
    <section className="min-h-[70vh] flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-12 sm:py-20 relative">
      {/* Subtle terminal window streak */}
      <div className="absolute top-0 right-0 w-48 h-full max-h-[400px] bg-gradient-to-l from-[var(--accent-warm)]/5 to-transparent pointer-events-none" aria-hidden />

      <div className="mx-auto max-w-4xl w-full flex flex-col md:flex-row md:items-start gap-8 md:gap-10">
        <div className="flex-shrink-0">
          <div className="gate-signage-plaque mb-3 text-center md:text-left">You are here</div>
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border border-[var(--border-medium)] bg-[var(--bg-surface)] flex items-center justify-center flex-shrink-0"
            aria-hidden
          >
            {headshotUrl ? (
              <img src={headshotUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[var(--text-muted)] font-display text-2xl font-bold">AA</span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-1 font-display">
            {siteConfig.heroOneLiner}
          </p>
          <p className="text-sm text-[var(--text-secondary)] mb-5">Use the directory below to navigate.</p>

          <div className="gate-signage-plaque mb-2">Terminal Directory</div>
          <TerminalDirectoryBoard />
        </div>
      </div>
    </section>
  );
}
