"use client";

import { aboutIntro, aboutPhotos, aboutHighlights } from "@/data/about";

export function AboutEditorial() {
  return (
    <article className="about-page py-12 sm:py-16 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="page-title font-mono text-sm font-bold text-[var(--departure-amber)] uppercase tracking-[0.15em] mb-2">
          Gate C · About
        </h1>

        <h2 className="about-name font-mono text-2xl font-bold text-[var(--window-white)] mb-4">
          I&apos;m Ammar Adam
        </h2>

        <p className="about-bio text-[var(--metal-gray)] leading-relaxed text-base mb-10">
          {aboutIntro}
        </p>

        <h3 className="font-mono text-xs font-bold text-[var(--departure-amber)] uppercase tracking-[0.15em] mb-3">
          Highlights
        </h3>
        <ul className="about-highlights simple-list mb-12">
          {aboutHighlights.slice(0, 6).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3 className="font-mono text-xs font-bold text-[var(--departure-amber)] uppercase tracking-[0.15em] mb-4">
          Photos
        </h3>
        {aboutPhotos.length > 0 ? (
          <div className="photos-grid grid grid-cols-2 sm:grid-cols-3 gap-4">
            {aboutPhotos.map((photo, i) => (
              <figure key={i} className="photo-item aspect-square rounded-lg overflow-hidden bg-[var(--terminal-blue)] border border-[var(--floor-line)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                />
                <figcaption className="p-2 text-[10px] font-mono text-[var(--metal-gray)]">
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="text-sm font-mono text-[var(--metal-gray)]">Photo grid placeholder.</p>
        )}
      </div>
    </article>
  );
}
