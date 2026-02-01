"use client";

/**
 * Plane that subtly moves — ambient terminal feel
 */
export function PlaneOnPath({ className = "" }: { className?: string }) {
  return (
    <div
      className={`motion-safe:animate-pulse ${className}`}
      style={{ animationDuration: "3s" }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="currentColor" fillOpacity="0.25" className="w-6 h-6">
        <path d="M22 2 2 12l8 2 4 8 4-10 4-10Z" />
      </svg>
    </div>
  );
}
