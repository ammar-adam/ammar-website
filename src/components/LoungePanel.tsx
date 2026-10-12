"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { loungeContent, cafeContent } from "@/data/lounge";
import { siteConfig } from "@/data/site";
import { AirportIcon } from "@/components/AirportIcon";

export function LoungePanel() {
  return (
    <section className="lounge-page relative py-14 sm:py-20 px-4 sm:px-6 lg:px-12 z-10">
      <div className="mx-auto max-w-[75rem]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[var(--border-medium)] p-8 sm:p-10 relative overflow-hidden"
          style={{
            background: "linear-gradient(180deg, var(--bg-surface) 0%, #2a3038 100%)",
          }}
        >
          <div className="lounge-window absolute right-0 top-[10%] w-64 sm:w-80 h-72 sm:h-96 opacity-40 pointer-events-none">
            <div className="window-frame w-full h-full border-2 border-[rgba(232,166,100,0.15)] rounded-lg" style={{
              background: "linear-gradient(180deg, rgba(135,180,200,0.05) 0%, rgba(232,166,100,0.05) 100%)",
              boxShadow: "inset 0 0 60px rgba(232,166,100,0.1)",
            }} />
          </div>

          <div className="lounge-intro flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
            {siteConfig.photoUrl ? (
              <div className="lounge-photo-container flex flex-col items-center gap-3 flex-shrink-0">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-[3px] border-[var(--accent-warm)] lounge-photo-frame">
                  <Image
                  src={siteConfig.photoUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="128px"
                />
                </div>
                {(siteConfig.photoCaption.name || siteConfig.photoCaption.subtitle) && (
                  <div className="photo-caption flex flex-col items-center gap-1">
                    {siteConfig.photoCaption.name && (
                      <span className="photo-name font-display text-sm font-semibold text-[var(--text-primary)]">
                        {siteConfig.photoCaption.name}
                      </span>
                    )}
                    {siteConfig.photoCaption.subtitle && (
                      <span className="photo-subtitle font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
                        {siteConfig.photoCaption.subtitle}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : null}
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-2">
                Lounge
              </p>
              <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1 font-display">
                {loungeContent.headline}
              </h1>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                {loungeContent.blurb}
              </p>
            </div>
          </div>

          <p className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-5">
            Interests
          </p>
          <div className="flex flex-wrap gap-3 mb-12">
            {loungeContent.interests.map((interest, i) => (
              <motion.div
                key={interest}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 * i }}
                className="flex-shrink-0"
              >
                <div className="interest-pill">
                  {interest}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-[var(--border-medium)] pt-8">
            <div className="flex items-center gap-2 mb-4">
              <AirportIcon src="/airport-icons/coffee-cup.svg" className="w-4 h-4 opacity-[0.14]" />
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
                Café
              </p>
            </div>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-8">
              {cafeContent.intro}
            </p>
            <a
              href={cafeContent.sayHelloEmail}
              className="text-sm font-medium text-[var(--accent-warm)] hover:text-[var(--accent-glow)] transition-colors inline-flex items-center gap-1"
            >
              {cafeContent.cta}
              <span aria-hidden>→</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
