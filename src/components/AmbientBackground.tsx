"use client";

import { motion } from "framer-motion";

interface AmbientBackgroundProps {
  variant?: "checkin" | "terminal" | "departures" | "arrivals" | "lounge" | "boarding";
  children: React.ReactNode;
}

export function AmbientBackground({
  variant = "terminal",
  children,
}: AmbientBackgroundProps) {
  return (
    <div className="relative min-h-[60vh] overflow-hidden">
      {/* Glass / steel gradient base */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `linear-gradient(135deg, 
            rgba(248,250,252,0.95) 0%, 
            rgba(226,232,240,0.9) 50%, 
            rgba(241,245,249,0.95) 100%)`,
        }}
      />
      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Horizontal runway lines - directional flow */}
      <div className="absolute inset-0 flex flex-col justify-between py-24 pointer-events-none">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-px w-full bg-slate-300/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
          />
        ))}
      </div>
      {children}
    </div>
  );
}
