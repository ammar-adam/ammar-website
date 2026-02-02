"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { siteConfig } from "@/data/site";
import { PlaneIcon } from "@/components/ui/PlaneIcon";
import { PersonalTicker } from "@/components/PersonalTicker";
import { GlobeNetwork } from "@/components/ambient/GlobeNetwork";
import { BackgroundPeople } from "@/components/BackgroundPeople";
import { silhouetteImages } from "@/data/silhouettes";

export function CheckInHero() {
  return (
    <section className="checkin-page relative min-h-[95vh] flex flex-col overflow-hidden">
      <BackgroundPeople section="checkin" images={silhouetteImages.checkin} />
      <div className="checkin-ceiling" aria-hidden />
      <div className="checkin-floor-reflection" aria-hidden />
      {/* Gate lighting beams */}
      <div className="gate-lights" aria-hidden>
        <div className="light-beam light-1" />
        <div className="light-beam light-2" />
        <div className="light-beam light-3" />
      </div>
      {/* Globe network background */}
      <GlobeNetwork />
      {/* Hero background - add /hero-airport.jpg to public for plane/terminal image */}
      <div
        className="checkin-hero-bg"
        style={{
          backgroundImage: `url(${siteConfig.heroImageUrl})`,
        }}
        aria-hidden
      />
      {/* Animated grid background */}
      <div className="checkin-background motion-reduce:opacity-20" aria-hidden />

      {/* Ticker strip */}
      <PersonalTicker />

      {/* Main content */}
      <div className="relative flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-12 xl:px-20 py-24 z-10">
        <motion.div
          className="max-w-2xl"
          style={{ marginLeft: "min(2rem, 5vw)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.p
            className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Check-in
          </motion.p>

          <motion.h1
            className="checkin-hero text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-[1.05]"
            style={{ textShadow: "0 0 40px rgba(232, 166, 100, 0.15)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {siteConfig.checkIn.headline}
          </motion.h1>

          <motion.p
            className="checkin-subtitle max-w-xl mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {siteConfig.checkIn.subtext}
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/#terminal"
              className="cta-primary inline-flex items-center gap-2 group"
            >
              {siteConfig.checkIn.ctaTerminal}
              <PlaneIcon className="w-4 h-4 text-[var(--bg-deep)] group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/#departures"
              className="cta-secondary inline-flex items-center gap-2"
            >
              {siteConfig.checkIn.ctaDepartures}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
