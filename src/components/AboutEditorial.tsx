"use client";

import {
  aboutIntro,
  aboutInterests,
  aboutPhotos,
  aboutWhatsUp,
} from "@/data/about";

export function AboutEditorial() {
  return (
    <article className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "var(--font-display)" }}>
          About Me
        </h1>

        <p className="text-[var(--text-secondary)] leading-relaxed mb-10">
          {aboutIntro}
        </p>

        <section className="mb-10">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Interests
          </h2>
          <ul className="flex flex-wrap gap-2">
            {aboutInterests.map((item) => (
              <li
                key={item}
                className="interest-pill"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {aboutPhotos.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Moments
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {aboutPhotos.map((photo, i) => (
                <figure key={i} className="rounded-lg overflow-hidden border border-[var(--border-medium)]">
                  <div className="aspect-square relative bg-[var(--bg-surface)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <figcaption className="p-2 text-[10px] text-[var(--text-tertiary)]">
                    {photo.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4" style={{ fontFamily: "var(--font-display)" }}>
            What I'm up to
          </h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            {aboutWhatsUp.map((item, i) => (
              <li key={i} className="pl-3 border-l-2 border-[var(--border-medium)]">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
