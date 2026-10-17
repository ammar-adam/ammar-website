/**
 * Faint boarding pass perforation divider - use sparingly
 */
export function PerforationDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex gap-1 py-4 ${className}`}
      aria-hidden
    >
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="h-px w-2 rounded-full bg-neutral-300/60"
          style={{ marginTop: i % 2 === 0 ? 0 : 2 }}
        />
      ))}
    </div>
  );
}
