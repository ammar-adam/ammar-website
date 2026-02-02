"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { siteConfig } from "@/data/site";
import { PlaneIcon } from "@/components/ui/PlaneIcon";
import { PersonalTicker } from "@/components/PersonalTicker";
import { GlobeNetwork } from "@/components/ambient/GlobeNetwork";
import { BackgroundPeople } from "@/components/BackgroundPeople";
import { silhouetteImages } from "@/data/silhouettes";

export function CheckInHero() {
  const pass = siteConfig.introBoardingPass;
  const intro = siteConfig.checkInIntro;
  const headshotUrl = siteConfig.photoUrl;

  return (
    <section className="checkin-page relative min-h-[95vh] flex flex-col overflow-hidden">
      <BackgroundPeople section="checkin" images={silhouetteImages.checkin} />
      <div className="checkin-ceiling" aria-hidden />
      <div className="checkin-floor-reflection" aria-hidden />
      <div className="gate-lights" aria-hidden>
        <div className="light-beam light-1" />
        <div className="light-beam light-2" />
        <div className="light-beam light-3" />
      </div>
      <GlobeNetwork />
      <div
        className="checkin-hero-bg"
        style={{ backgroundImage: `url(${siteConfig.heroImageUrl})` }}
        aria-hidden
      />
      <div className="checkin-background motion-reduce:opacity-20" aria-hidden />

      <PersonalTicker />

      <div className="relative flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-12 xl:px-20 py-24 z-10">
        <motion.div
          className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row lg:items-start lg:gap-16"
          style={{ marginLeft: "min(2rem, 5vw)", marginRight: "min(2rem, 5vw)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex-1 max-w-2xl">
            <motion.p
              className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Check-in
            </motion.p>

            <div className="space-y-4 mb-10">
              {intro.map((para, i) => (
                <motion.p
                  key={i}
                  className={
                    i === 0
                      ? "checkin-hero text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] leading-tight"
                      : i === 1
                        ? "text-lg sm:text-xl text-[var(--accent-warm)] font-medium"
                        : "checkin-subtitle text-[var(--text-secondary)] leading-relaxed"
                  }
                  style={i === 0 ? { textShadow: "0 0 40px rgba(232, 166, 100, 0.15)" } : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
                >
                  {para}
                </motion.p>
              ))}
            </div>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/#terminal" className="cta-primary inline-flex items-center gap-2 group">
                {siteConfig.checkIn.ctaTerminal}
                <PlaneIcon className="w-4 h-4 text-[var(--bg-deep)] group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/#departures" className="cta-secondary inline-flex items-center gap-2">
                {siteConfig.checkIn.ctaDepartures}
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="mt-12 lg:mt-0 flex-shrink-0 flex flex-col sm:flex-row lg:flex-col items-start gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden border-2 border-[var(--accent-warm)]/30 flex-shrink-0 bg-[var(--bg-surface)]">
              {headshotUrl ? (
                <Image
                  src={headshotUrl}
                  alt="Ammar Adam"
                  fill
                  className="object-cover"
                  sizes="128px"
                  unoptimized={headshotUrl.startsWith("http")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-display text-2xl font-bold text-[var(--accent-warm)]/60">
                  AA
                </div>
              )}
            </div>
            <div className="intro-boarding-pass flex-1 min-w-0 max-w-xs rounded-xl border border-[var(--border-medium)] bg-[var(--bg-surface)]/90 p-4 backdrop-blur-sm">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] space-y-2">
                <div className="flex justify-between gap-4">
                  <span>Passenger</span>
                  <span className="text-[var(--text-primary)] font-semibold">{pass.passenger}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Program</span>
                  <span className="text-[var(--text-secondary)]">{pass.program}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Institution</span>
                  <span className="text-[var(--text-secondary)]">{pass.institution}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Focus</span>
                  <span className="text-[var(--text-secondary)]">{pass.focus}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Current Status</span>
                  <span className="text-[var(--accent-warm)]">{pass.currentStatus}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
