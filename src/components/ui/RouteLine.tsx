"use client";

/**
 * Thin route line - stroke animates on parent group-hover
 */
export function RouteLine({
  className = "",
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  const path =
    orientation === "horizontal"
      ? "M 0 4 L 100 4"
      : "M 4 0 L 4 100";

  return (
    <svg
      className={`text-current ${className}`}
      viewBox={orientation === "horizontal" ? "0 0 100 8" : "0 0 8 100"}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="4 2"
        strokeDashoffset="6"
        className="transition-[stroke-dashoffset] duration-300 ease-out group-hover/card:[stroke-dashoffset:0]"
        style={{ opacity: 0.4 }}
      />
    </svg>
  );
}
