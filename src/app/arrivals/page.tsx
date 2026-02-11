import Link from "next/link";
import { arrivals } from "@/data/arrivals";

export default function ArrivalsPage() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Arrivals
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          Experiences that have landed — roles and places. Click for details.
        </p>

        <div className="conveyor-belt rounded-xl p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {arrivals.map((a) => (
              <Link
                key={a.slug}
                href={`/arrivals/${a.slug}`}
                className="group block bg-[var(--bg-elevated)] border-2 border-[var(--border-medium)] rounded-xl p-4 sm:p-5 hover:border-[var(--accent-warm)] hover:shadow-[var(--shadow-md)] transition-all"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                  {a.from}
                </span>
                <h2 className="font-semibold text-[var(--text-primary)] mt-1" style={{ fontFamily: "var(--font-display)" }}>
                  {a.title}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1 leading-snug">
                  {a.impact}
                </p>
                {a.status && (
                  <span className="inline-block mt-2 font-mono text-[10px] text-[var(--text-tertiary)]">
                    {a.status}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-warm)] mt-2 group-hover:gap-2 transition-[gap]">
                  Details
                  <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
