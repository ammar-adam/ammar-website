"use client";

/**
 * Ambient radar routes: 1–2 faint curved paths with a small plane moving along each.
 * Used only in Terminal section. Static when prefers-reduced-motion.
 *
 * TWEAK: Edit ROUTE_CONFIG for speed (durationSeconds), opacity, and path positions.
 */
const ROUTE_CONFIG = {
  routeOpacity: 0.12,
  planeOpacity: 0.35,
  durationSeconds: 28,
  paths: [
    { id: "r1", d: "M 0 30 Q 80 5 180 25 T 320 20", viewBox: "0 0 320 50", position: "top-0 right-0 w-2/5 h-1/3" },
    { id: "r2", d: "M 0 45 Q 60 20 140 40 T 280 35", viewBox: "0 0 280 50", position: "bottom-1/4 left-0 w-1/3 h-1/4" },
  ],
};

export function RouteOverlay({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden
    >
      {ROUTE_CONFIG.paths.map(({ id, d, viewBox, position }) => (
        <svg
          key={id}
          viewBox={viewBox}
          preserveAspectRatio="none"
          className={`absolute ${position} text-[var(--text-muted)]`}
          style={{ opacity: ROUTE_CONFIG.routeOpacity }}
        >
          <path
            id={id}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="3 5"
          />
          <g className="motion-reduce:hidden" fill="currentColor">
            <animateMotion
              dur={`${ROUTE_CONFIG.durationSeconds}s`}
              repeatCount="indefinite"
              path={d}
            />
            <path
              d="M-2 0 L2 2 L-2 4 L0 2 Z"
              fillOpacity={ROUTE_CONFIG.planeOpacity}
            />
          </g>
        </svg>
      ))}
    </div>
  );
}
