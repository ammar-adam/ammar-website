"use client";

import { aboutIntro, aboutPhotos, aboutHighlights, aboutLocationStamps } from "@/data/about";

export function AboutEditorial() {
  return (
    <article className="about-page about-page-with-signage py-12 sm:py-16 px-4 sm:px-6 lg:px-12 relative">
      <div className="page-signage page-signage-about" aria-hidden>
        <div className="signage-element signage-top-right">
          <span className="signage-arrow">→</span>
          <span className="signage-text">Gate C</span>
        </div>
        <div className="signage-element signage-left">
          <span className="signage-text">Passenger info</span>
        </div>
        <div className="signage-element signage-bottom">
          <span className="signage-arrow">↓</span>
          <span className="signage-text">Departures</span>
        </div>
      </div>
      <div className="mx-auto max-w-3xl">
        <h1 className="page-title font-mono text-sm font-bold text-[var(--departure-amber)] uppercase tracking-[0.15em] mb-2">
          Gate C · About
        </h1>

        <div className="about-intro-text mb-10">
          <h2 className="about-name font-mono text-2xl font-bold text-[var(--window-white)] mb-3">
            Hi, I&apos;m Ammar.
          </h2>
          <p className="about-bio text-[var(--metal-gray)] leading-relaxed text-base">
            {aboutIntro}
          </p>
        </div>

        <h3 className="font-mono text-xs font-bold text-[var(--departure-amber)] uppercase tracking-[0.15em] mb-3 mt-10">
          Some Cool Stuff
        </h3>
        <ul className="about-highlights about-bullet-list mb-8">
          {aboutHighlights.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <div className="about-location-stamps flex items-center justify-center gap-4 py-6 mb-10">
          {aboutLocationStamps.map((stamp, i) => (
            <span key={stamp.code}>
              {i > 0 && <span className="text-[var(--metal-gray)] font-mono text-sm"> · </span>}
              <a
                href={stamp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="location-stamp text-[var(--departure-amber)] hover:underline"
              >
                {stamp.code}
              </a>
            </span>
          ))}
        </div>

        <h3 className="font-mono text-xs font-bold text-[var(--departure-amber)] uppercase tracking-[0.15em] mb-4">
          Photos
        </h3>
        {aboutPhotos.length > 0 ? (
          <div className="photos-grid grid grid-cols-2 sm:grid-cols-3 gap-4">
            {aboutPhotos.map((photo, i) => (
              <figure
                key={i}
                className="photo-item aspect-square rounded-lg overflow-hidden bg-[var(--terminal-blue)] border-2 border-[var(--floor-line)] group relative"
                title={photo.caption || undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.caption || `Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {photo.caption ? (
                  <figcaption className="photo-item-caption absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3">
                    <span className="text-xs font-mono text-[var(--window-white)] leading-snug">
                      {photo.caption}
                    </span>
                  </figcaption>
                ) : null}
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
