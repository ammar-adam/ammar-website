import Link from "next/link";

export default function NotFound() {
  return (
    <main className="lost">
      <p className="eyebrow">Gate not found</p>
      <h1>This flight doesn&apos;t exist.</h1>
      <Link href="/" className="btn-depart">
        Back to check-in <span className="btn-arrow" aria-hidden>←</span>
      </Link>
    </main>
  );
}
