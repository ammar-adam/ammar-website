import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", textAlign: "center", padding: 16 }}>
      <div>
        <div className="kicker">Gate not found</div>
        <h1 style={{ fontSize: 32, margin: "10px 0 8px", letterSpacing: "-0.02em" }}>This flight doesn&apos;t exist.</h1>
        <p style={{ color: "var(--dim)", margin: "0 0 20px" }}>Might have been cancelled. Head back to the terminal.</p>
        <Link href="/" style={{ color: "var(--accent)" }}>← Back to the terminal</Link>
      </div>
    </main>
  );
}
