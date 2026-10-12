import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page">
      <h1>nothing here</h1>
      <p className="note">this flight got cancelled.</p>
      <Link href="/">back home</Link>
    </main>
  );
}
