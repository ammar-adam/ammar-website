"use client";

import { useState, useCallback, useEffect } from "react";
import { aboutIntro, aboutPhotos, aboutAmenities, aboutLocationStamps } from "@/data/about";

type PhotoItem = { src: string; caption?: string };

export function AboutEditorial() {
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);

  const closeLightbox = useCallback(() => setLightboxPhoto(null), []);

  useEffect(() => {
    if (!lightboxPhoto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxPhoto, closeLightbox]);

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
      <div className="mx-auto max-w-3xl about-page-inner">
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

        <section className="cabin-notes mt-10 mb-8">
          <h2 className="amenities-header">CABIN NOTES</h2>
          <ul className="amenities-list">
            {aboutAmenities.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

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

        <section className="in-flight-entertainment-screen mt-10 mb-10" aria-label="In-Flight Entertainment">
          <div className="ife-seatback">
            <div className="ife-seatback-frame">
              <div className="ife-seatback-header">
                <span className="ife-screen-title">IN-FLIGHT ENTERTAINMENT</span>
                <span className="ife-screen-subtitle">Select a title</span>
              </div>
              <div className="ife-seatback-screen">
                {aboutPhotos.length > 0 ? (
                  <div className="ife-grid">
                    {aboutPhotos.map((photo, i) => (
                      <figure
                        key={i}
                        className="ife-tile cursor-pointer"
                        title={photo.caption || undefined}
                        role="button"
                        tabIndex={0}
                        onClick={() => setLightboxPhoto(photo)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setLightboxPhoto(photo);
                          }
                        }}
                        aria-label={photo.caption ? `View: ${photo.caption}` : `View photo ${i + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.src}
                          alt={photo.caption || `Title ${i + 1}`}
                          className="ife-tile-img"
                        />
                        {photo.caption ? (
                          <figcaption className="ife-tile-caption">
                            {photo.caption}
                          </figcaption>
                        ) : null}
                      </figure>
                    ))}
                  </div>
                ) : (
                  <p className="ife-empty">No titles available.</p>
                )}
                <div className="ife-scanline" aria-hidden />
              </div>
              <div className="ife-seatback-controls" aria-hidden>
                <span className="ife-control-dot" />
                <span className="ife-control-dot" />
                <span className="ife-control-dot" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full text-[var(--window-white)] text-2xl leading-none hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--departure-amber)]"
            aria-label="Close lightbox"
          >
            ×
          </button>
          <img
            src={lightboxPhoto.src}
            alt={lightboxPhoto.caption || "Expanded view"}
            className="max-w-4xl max-h-[90vh] w-auto h-auto object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}
