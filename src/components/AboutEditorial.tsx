"use client";

import { siteConfig } from "@/data/site";
import { aboutIntro, aboutPhotos, aboutHighlights } from "@/data/about";

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

        <div className="about-passport-block">
          <div className="passport-photo-wrap">
            <div className="passport-photo-frame">
              {siteConfig.photoUrl ? (
                <img src={siteConfig.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="passport-photo-placeholder">AA</span>
              )}
            </div>
            <div className="passport-corner-stamps" aria-hidden>
              <span className="passport-corner tl" />
              <span className="passport-corner tr" />
              <span className="passport-corner bl" />
              <span className="passport-corner br" />
            </div>
          </div>
          <div className="about-intro-text">
            <h2 className="about-name font-mono text-2xl font-bold text-[var(--window-white)] mb-3">
              I&apos;m Ammar Adam
            </h2>
            <p className="about-bio text-[var(--metal-gray)] leading-relaxed text-base">
              {aboutIntro}
            </p>
          </div>
        </div>

        <h3 className="font-mono text-xs font-bold text-[var(--departure-amber)] uppercase tracking-[0.15em] mb-3 mt-10">
          Highlights
        </h3>
        <ul className="about-highlights about-bullet-list mb-8">
          {aboutHighlights.slice(0, 6).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <div className="about-location-stamps flex items-center justify-center gap-4 py-6 mb-10">
          <span className="location-stamp">YYZ</span>
          <span className="text-[var(--metal-gray)] font-mono text-sm">·</span>
          <span className="location-stamp">DXB</span>
          <span className="text-[var(--metal-gray)] font-mono text-sm">·</span>
          <span className="location-stamp">KHI</span>
        </div>

        <h3 className="font-mono text-xs font-bold text-[var(--departure-amber)] uppercase tracking-[0.15em] mb-4">
          Photos
        </h3>
        {aboutPhotos.length > 0 ? (
          <div className="photos-grid grid grid-cols-2 sm:grid-cols-3 gap-4">
            {aboutPhotos.map((photo, i) => (
              <figure key={i} className="photo-item aspect-square rounded-lg overflow-hidden bg-[var(--terminal-blue)] border-2 border-[var(--floor-line)]">
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
