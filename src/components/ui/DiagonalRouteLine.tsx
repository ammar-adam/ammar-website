"use client";

/**
 * Diagonal route line — connects sections, suggests movement
 */
export function DiagonalRouteLine({
  className = "",
  direction = "rtl",
}: {
  className?: string;
  direction?: "rtl" | "ltr";
}) {
  const path = direction === "rtl"
    ? "M 0 100 L 200 0"
    : "M 200 100 L 0 0";

  return (
    <svg
      className={className}
      viewBox="0 0 200 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="4 6"
        className="text-[var(--text-muted)]/30"
      />
    </svg>
  );
}
