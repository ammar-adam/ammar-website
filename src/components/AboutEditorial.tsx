"use client";

import { siteConfig } from "@/data/site";
import { aboutIntro, aboutPhotos, aboutHighlights } from "@/data/about";

export function AboutEditorial() {
  return (
    <article className="about-page py-12 sm:py-16 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="about-header mb-10">
          <h1 className="page-title font-mono text-sm font-bold text-[var(--departure-amber)] uppercase tracking-[0.15em]">
            Gate C · Passenger profile
          </h1>
        </div>

        <div className="passport-profile flex flex-col sm:flex-row gap-8 items-start mb-12 p-6 sm:p-8 rounded-lg border-2 border-[var(--floor-line)] border-l-4 border-l-[var(--departure-amber)] bg-[var(--terminal-dark)]">
          <div className="profile-photo-frame flex-shrink-0 w-32 h-40 sm:w-36 sm:h-44 border-2 border-[var(--departure-amber)] bg-[var(--terminal-blue)] flex items-center justify-center overflow-hidden rounded relative">
            {siteConfig.photoUrl ? (
              <img src={siteConfig.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-signage text-3xl font-bold text-[var(--metal-gray)]">AA</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="passenger-name font-mono text-2xl font-bold text-[var(--window-white)] mb-2 uppercase tracking-wide">
              Ammar Adam
            </h2>
            <p className="passenger-tagline font-mono text-xs text-[var(--departure-amber)] uppercase tracking-[0.15em] mb-4">
              Builder · Creative · Innovator · CFM @ Waterloo
            </p>
            <p className="passenger-intro text-[var(--metal-gray)] leading-relaxed text-base">
              {aboutIntro}
            </p>
          </div>
        </div>

        <div className="about-section mb-12 p-6 sm:p-8 rounded-lg border-2 border-[var(--floor-line)] bg-[var(--terminal-dark)]">
          <h3 className="font-mono text-xs font-bold text-[var(--departure-amber)] uppercase tracking-[0.15em] mb-4">
            Highlights
          </h3>
          <ul className="simple-list">
            {aboutHighlights.slice(0, 6).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="location-stamps flex items-center justify-center gap-4 py-4 mb-12">
          <span className="stamp font-mono text-lg font-bold text-[var(--departure-amber)] px-4 py-2 border-2 border-[var(--departure-amber)] rounded uppercase tracking-wider">
            YYZ
          </span>
          <span className="text-[var(--metal-gray)]">·</span>
          <span className="stamp font-mono text-lg font-bold text-[var(--departure-amber)] px-4 py-2 border-2 border-[var(--departure-amber)] rounded uppercase tracking-wider">
            DXB
          </span>
          <span className="text-[var(--metal-gray)]">·</span>
          <span className="stamp font-mono text-lg font-bold text-[var(--departure-amber)] px-4 py-2 border-2 border-[var(--departure-amber)] rounded uppercase tracking-wider">
            KHI
          </span>
        </div>

        <div className="about-section mb-12 p-6 sm:p-8 rounded-lg border-2 border-[var(--floor-line)] bg-[var(--terminal-dark)]">
          <h3 className="font-mono text-xs font-bold text-[var(--departure-amber)] uppercase tracking-[0.15em] mb-3">
            Interests
          </h3>
          <p className="interests-text text-[var(--window-white)] text-base leading-relaxed">
            Liverpool FC · Aviation · Theme parks · Cooking · Coffee · Social impact
          </p>
        </div>

        <div className="about-section p-6 sm:p-8 rounded-lg border-2 border-[var(--floor-line)] bg-[var(--terminal-dark)]">
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
      </div>
    </article>
  );
}
