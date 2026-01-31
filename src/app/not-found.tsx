import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-light text-neutral-900">Gate not found</h1>
      <p className="text-neutral-500 mt-2 text-sm">
        This route doesn&apos;t exist. Head back to the terminal.
      </p>
      <Link
        href="/terminal"
        className="mt-6 text-sm text-neutral-900 hover:underline underline-offset-4"
      >
        → Terminal
      </Link>
    </div>
  );
}
