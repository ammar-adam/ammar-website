import type { Metadata } from "next";
import Link from "next/link";
import { PLATE_CREDITS } from "@/components/sv/plateCredits";
import { projects } from "@/data/departures";

export const metadata: Metadata = { title: "Plate credits · Ammar Adam" };

/* The photographs behind the intro. Each one is colour-graded, posterised
   and halftoned in real time; the originals are untouched. */
export default function CreditsPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px", fontFamily: "var(--font-inter), Inter, system-ui, sans-serif", color: "#fff6ea", lineHeight: 1.5 }}>
      <p style={{ fontFamily: "var(--font-jb), monospace", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#ffb64a", margin: 0 }}>
        <Link href="/" style={{ color: "inherit" }}>← Ammar Adam</Link>
      </p>
      <h1 style={{ fontFamily: "var(--font-bangers), Impact, sans-serif", fontSize: 56, margin: "12px 0 6px", lineHeight: 1 }}>Plate credits</h1>
      <p style={{ margin: "0 0 28px", opacity: 0.85 }}>
        The environments on the home page are real photographs, colour-graded, posterised, halftoned and chromatically split in real time by a WebGL shader. The originals are not modified; the processing happens in your browser. Unsplash and Pexels licences allow this use without credit, but here it is anyway.
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 14 }}>
        {PLATE_CREDITS.map((c) => (
          <li key={c.id} style={{ borderLeft: "4px solid #ff2e88", padding: "6px 14px", background: "rgba(255,246,234,0.04)" }}>
            <div style={{ fontFamily: "var(--font-jb), monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#19d9ff" }}>{c.id}</div>
            <div style={{ fontWeight: 600 }}>{c.title}</div>
            <div style={{ fontSize: 14, opacity: 0.85 }}>
              {c.author} · {c.licence} · {c.source.startsWith("http") ? <a href={c.source} target="_blank" rel="noreferrer" style={{ color: "#ffb64a" }}>source</a> : "owner's photo"}
            </div>
          </li>
        ))}
      </ul>
      <h2 style={{ fontFamily: "var(--font-bangers), Impact, sans-serif", fontSize: 32, margin: "40px 0 6px", lineHeight: 1 }}>More projects</h2>
      <p style={{ margin: "0 0 14px", opacity: 0.85, fontSize: 14 }}>Not in the sequence, still real.</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
        {projects.filter((p) => p.slug === "canadaclip" || p.slug === "risk-optimized-equity-system").map((p) => (
          <li key={p.slug} style={{ borderLeft: "4px solid #19d9ff", padding: "6px 14px", background: "rgba(255,246,234,0.04)" }}>
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div style={{ fontSize: 14, opacity: 0.85 }}>{p.shortDesc}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              {p.seats[0].links?.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noreferrer" style={{ color: "#ffb64a", marginRight: 12 }}>{l.label}</a>)}
            </div>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 32, fontSize: 14, opacity: 0.75 }}>
        Resume: <a href="/Ammar_Adam.pdf" target="_blank" rel="noreferrer" style={{ color: "#ffb64a" }}>Ammar_Adam.pdf</a>
      </p>
    </main>
  );
}
