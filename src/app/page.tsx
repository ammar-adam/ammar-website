import { siteConfig } from "@/data/site";
import { NavBoard } from "@/components/NavBoard";

export default function HomePage() {
  return (
    <section className="min-h-[80vh] flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl w-full">
        <p className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] mb-10" style={{ fontFamily: "var(--font-display)" }}>
          {siteConfig.heroOneLiner}
        </p>
        <NavBoard />
      </div>
    </section>
  );
}
