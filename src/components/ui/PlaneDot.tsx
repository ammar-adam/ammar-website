"use client";

/**
 * Top-down abstract plane dot — muted, minimal.
 * Hidden when prefers-reduced-motion.
 */
export function PlaneDot({ className = "w-2 h-2" }: { className?: string }) {
  return (
    <div className="motion-reduce:hidden" role="img" aria-hidden>
      <svg
        className={className}
        viewBox="0 0 8 8"
        fill="currentColor"
        fillOpacity="0.6"
      >
        <path d="M4 1 L6 4 L4 7 L2 4 Z" />
      </svg>
    </div>
  );
}
