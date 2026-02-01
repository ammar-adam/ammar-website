/**
 * Small plane icon for wayfinding and accents.
 */

interface PlaneIconProps {
  className?: string;
  animate?: boolean;
}

export function PlaneIcon({ className = "w-5 h-5", animate = false }: PlaneIconProps) {
  return (
    <svg
      className={`${className} ${animate ? "motion-safe:animate-pulse" : ""}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      fillOpacity="0.7"
      aria-hidden
    >
      <path d="M22 2 2 12l8 2 4 8 4-10 4-10Z" />
    </svg>
  );
}
