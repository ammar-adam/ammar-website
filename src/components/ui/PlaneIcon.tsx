/**
 * Tiny plane accent - use sparingly (1-2 per page max)
 */
export function PlaneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 2 2 12l8 2 4 8 4-10 4-10Z" fill="currentColor" fillOpacity="0.6" />
    </svg>
  );
}
