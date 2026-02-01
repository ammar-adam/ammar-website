"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { siteConfig } from "@/data/site";
import { PlaneIcon } from "@/components/ui/PlaneIcon";
import { PlaneSilhouette } from "@/components/ui/PlaneSilhouette";
import { DiagonalRouteLine } from "@/components/ui/DiagonalRouteLine";
import { AnimatedRouteLine } from "@/components/ui/AnimatedRouteLine";
import { DeparturesBoardDisplay } from "@/components/DeparturesBoardDisplay";
import { RadarDots } from "@/components/ui/RadarDots";

export function CheckInHero() {
  return (
    <section className="relative min-h-[95vh] flex flex-col overflow-hidden">
      <RadarDots />
      {/* Horizon gradient — sunset through terminal glass */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            linear-gradient(to bottom, 
              transparent 0%, 
              transparent 40%,
              rgba(234, 88, 12, 0.03) 60%,
              rgba(245, 158, 11, 0.08) 75%,
              rgba(251, 191, 36, 0.12) 85%,
              rgba(15, 23, 42, 0.95) 100%
            )
          `,
        }}
      />
      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ticker strip — full-bleed */}
      <DeparturesBoardDisplay variant="ticker" />

      {/* Plane silhouette — distant, backlit */}
      <div className="absolute top-[18%] right-[15%] pointer-events-none">
        <motion.div
          className="text-[var(--text-muted)]/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          <PlaneSilhouette size="lg" />
        </motion.div>
      </div>

      {/* Diagonal route lines */}
      <div className="absolute top-1/3 left-0 w-48 h-24 opacity-20">
        <DiagonalRouteLine direction="ltr" />
      </div>
      <div className="absolute bottom-1/4 right-0 w-40 h-20 opacity-15 scale-x-[-1]">
        <DiagonalRouteLine direction="rtl" />
      </div>

      {/* Main content — offset, luminous */}
      <div className="relative flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-12 xl:px-20 py-24">
        <motion.div
          className="max-w-2xl"
          style={{ marginLeft: "min(2rem, 5vw)" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-6">
            Check-in
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-[var(--text-primary)] mb-6 leading-[1.05]">
            <span className="text-glow">{siteConfig.checkIn.headline}</span>
          </h1>

          <p className="text-lg text-[var(--text-secondary)] max-w-xl mb-14">
            {siteConfig.checkIn.subtext}
          </p>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/#terminal"
              className="group inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-[var(--bg-dark)] bg-[var(--accent-amber)] hover:bg-[#fbbf24] rounded border border-[var(--accent-amber)]/30 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-amber)] focus:ring-offset-2 focus:ring-offset-[var(--bg-dark)]"
            >
              {siteConfig.checkIn.ctaTerminal}
              <PlaneIcon className="w-3.5 h-3.5 text-[var(--bg-dark)] group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/#departures"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-amber)]/50 hover:text-[var(--accent-amber)] rounded transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-amber)] focus:ring-offset-2 focus:ring-offset-[var(--bg-dark)]"
            >
              {siteConfig.checkIn.ctaDepartures}
            </Link>
          </motion.div>

          <div className="mt-20 w-full max-w-md">
            <AnimatedRouteLine />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
