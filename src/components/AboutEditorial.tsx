"use client";

import {
  aboutIntro,
  aboutPhotos,
  aboutHighlights,
  aboutFieldnotes,
} from "@/data/about";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "highlights", label: "Highlights" },
  { id: "fieldnotes", label: "Fieldnotes" },
  { id: "photos", label: "Photos" },
] as const;

export function AboutEditorial() {
  return (
    <article className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-4xl flex flex-col lg:flex-row gap-10 lg:gap-14">
        <nav
          className="flex lg:flex-col gap-1 lg:w-44 flex-shrink-0 order-2 lg:order-1 border-l-2 border-[var(--border-medium)] lg:border-l-0 lg:border-r-2 lg:pr-4 pl-4 lg:pl-0"
          aria-label="About sections"
        >
          <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2 hidden lg:block">
            Terminal directory
          </span>
          {SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="font-mono text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-warm)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] rounded px-2 py-1.5"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex-1 min-w-0 order-1 lg:order-2">
          <section id="about" className="mb-14 scroll-mt-24">
            <p className="gate-signage-plaque inline-block text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
              Gate A
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-5 font-display">
              About
            </h1>
            <p className="text-[var(--text-secondary)] leading-relaxed text-base sm:text-lg max-w-prose">
              {aboutIntro}
            </p>
          </section>

          <section id="highlights" className="mb-14 scroll-mt-24">
            <h2 className="gate-signage-plaque text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
              Highlights
            </h2>
            <ul className="space-y-3 text-[var(--text-secondary)] text-base sm:text-[1rem] leading-relaxed">
              {aboutHighlights.map((item, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="text-[var(--accent-warm)] mt-0.5">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {aboutFieldnotes.length > 0 && (
            <section id="fieldnotes" className="mb-14 scroll-mt-24">
              <h2 className="gate-signage-plaque text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-4">
                Fieldnotes
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {aboutFieldnotes.map((fn, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[var(--border-medium)] bg-[var(--bg-surface)] p-4 sm:p-5"
                  >
                    <div className="font-mono text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
                      {fn.date}
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)] text-base font-display mb-2">
                      {fn.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">{fn.line}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="photos" className="scroll-mt-24">
            <h2 className="gate-signage-plaque text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-4">
              Photos
            </h2>
            {aboutPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {aboutPhotos.map((photo, i) => (
                  <figure key={i} className="rounded-xl overflow-hidden border border-[var(--border-medium)]">
                    <div className="aspect-square relative bg-[var(--bg-surface)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.src}
                        alt={photo.caption}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <figcaption className="p-2.5 text-xs text-[var(--text-tertiary)]">
                      {photo.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)]">Photo grid placeholder.</p>
            )}
          </section>
        </div>
      </div>
    </article>
  );
}
