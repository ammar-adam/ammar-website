/**
 * Aircraft silhouette — use for gates, backgrounds, accents.
 */

interface PlaneSilhouetteProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "w-8 h-8", md: "w-16 h-16", lg: "w-24 h-24" };

export function PlaneSilhouette({
  className = "",
  size = "md",
}: PlaneSilhouetteProps) {
  return (
    <svg
      className={`${sizes[size]} ${className}`}
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillOpacity="0.4"
        d="M32 4 8 28l8 8 8-4 8 16 8-8-8-12 8-4 8-20Z"
      />
    </svg>
  );
}
