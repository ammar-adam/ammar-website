"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { siteConfig } from "@/data/site";
import { PlaneIcon } from "@/components/ui/PlaneIcon";

export function CheckInHero() {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-50 to-white pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h1v20H0V0zm10 0h1v20h-1V0z' fill='%23000'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        className="relative text-center max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500 mb-6">
          <PlaneIcon className="w-3.5 h-3.5" />
          Check-in
        </span>

        <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-neutral-900 mb-6">
          {siteConfig.tagline}
        </h1>

        <p className="text-lg text-neutral-600 mb-12 max-w-md mx-auto">
          Head to the terminal to explore projects, experiences, and a bit of personality.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Link
            href="/terminal"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
          >
            Go to terminal
            <span aria-hidden>→</span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
