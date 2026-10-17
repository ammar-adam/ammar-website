import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap" style={{ minHeight: "100svh", display: "grid", alignContent: "center", gap: 18, position: "relative", zIndex: 1 }}>
      <span className="kicker">Gate not found</span>
      <h1 className="masthead-h1" style={{ margin: 0, fontWeight: 700, fontSize: "clamp(40px, 6vw, 76px)", letterSpacing: "-0.03em", lineHeight: 1 }}>
        This flight doesn&apos;t exist.
      </h1>
      <Link href="/" className="btn" style={{ width: "max-content" }}>← Back to check-in</Link>
    </main>
  );
}
