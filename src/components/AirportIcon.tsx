"use client";

/**
 * Quiet, low-contrast airport icon. Use sparingly.
 * aria-hidden by default. pointer-events-none unless interactive.
 */
export function AirportIcon({
  src,
  alt = "",
  className = "",
  style,
  asDecoration = true,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  asDecoration?: boolean;
}) {
  return (
    <img
      src={src}
      alt={asDecoration ? "" : alt}
      aria-hidden={asDecoration}
      className={`select-none ${asDecoration ? "pointer-events-none" : ""} ${className}`}
      style={style}
    />
  );
}
