"use client";

import { siteConfig } from "@/data/site";
import { aboutIntro, aboutPhotos, aboutHighlights } from "@/data/about";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "highlights", label: "Highlights" },
  { id: "interests", label: "Interests" },
  { id: "photos", label: "Photos" },
] as const;

export function AboutEditorial() {
  return (
    <article className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-4xl flex flex-col lg:flex-row gap-10 lg:gap-14">
        <nav
          className="flex lg:flex-col gap-1 lg:w-44 flex-shrink-0 order-2 lg:order-1 border-l-2 border-[var(--floor-line)] lg:border-l-0 lg:border-r-2 lg:pr-4 pl-4 lg:pl-0"
          aria-label="About sections"
        >
          <span className="font-mono text-[10px] text-[var(--metal-gray)] uppercase tracking-widest mb-2 hidden lg:block">
            Terminal directory
          </span>
          {SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="font-mono text-sm text-[var(--metal-gray)] hover:text-[var(--departure-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--departure-amber)] rounded px-2 py-1.5"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex-1 min-w-0 order-1 lg:order-2 passport-profile">
          <section id="about" className="mb-12 scroll-mt-24">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--departure-amber)] mb-3">
              Gate C · Passenger profile
            </p>
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <div className="passport-photo-frame flex-shrink-0 w-28 h-32 sm:w-32 sm:h-40 rounded border-2 border-[var(--departure-amber)] bg-[var(--terminal-dark)] flex items-center justify-center overflow-hidden">
                {siteConfig.photoUrl ? (
                  <img src={siteConfig.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-signage text-2xl font-bold text-[var(--metal-gray)]">AA</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-signage font-bold text-[var(--window-white)] uppercase tracking-wide mb-1">
                  Ammar Adam
                </h1>
                <p className="font-mono text-[10px] text-[var(--metal-gray)] uppercase tracking-wider border-b border-[var(--floor-line)] pb-2 mb-2">
                  Builder · Creative · Innovator · CFM @ Waterloo
                </p>
                <p className="text-[var(--metal-gray)] leading-relaxed text-base max-w-prose">
                  {aboutIntro}
                </p>
              </div>
            </div>
          </section>

          <section id="highlights" className="mb-12 scroll-mt-24">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--metal-gray)] mb-3">
              Highlights
            </h2>
            <ul className="space-y-2 text-[var(--metal-gray)] text-sm leading-relaxed">
              {aboutHighlights.slice(0, 6).map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--departure-amber)]">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="font-mono text-[10px] text-[var(--metal-gray)] uppercase tracking-wider mt-4">
              YYZ · DXB · KHI
            </p>
          </section>

          <section id="interests" className="mb-12 scroll-mt-24">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--metal-gray)] mb-2">
              Interests
            </h2>
            <p className="text-sm text-[var(--metal-gray)]">
              Liverpool FC · Aviation · Theme parks · Cooking · Coffee · Social impact
            </p>
          </section>

          <section id="photos" className="scroll-mt-24">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--metal-gray)] mb-4">
              Photos
            </h2>
            {aboutPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {aboutPhotos.map((photo, i) => (
                  <figure key={i} className="rounded-lg overflow-hidden border-2 border-[var(--floor-line)]">
                    <div className="aspect-square relative bg-[var(--terminal-dark)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.src}
                        alt={photo.caption}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <figcaption className="p-2 text-[10px] font-mono text-[var(--metal-gray)]">
                      {photo.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="text-sm font-mono text-[var(--metal-gray)]">Photo grid placeholder.</p>
            )}
          </section>
        </div>
      </div>
    </article>
  );
}
