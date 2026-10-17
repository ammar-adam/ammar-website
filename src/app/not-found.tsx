import Link from "next/link";

export default function NotFound() {
  return (
    <main className="lost">
      <span className="kicker">Gate not found</span>
      <h1>This flight doesn&apos;t exist.</h1>
      <Link href="/" className="btn-depart">
        <span className="btn-arrow" aria-hidden>←</span> Back to the hall
      </Link>
    </main>
  );
}
