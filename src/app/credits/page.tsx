import type { Metadata } from "next";
import Link from "next/link";
import { PLATE_CREDITS } from "@/components/sv/plateCredits";

export const metadata: Metadata = { title: "Credits · Ammar Adam" };

export default function CreditsPage() {
  return (
    <main style={{ minHeight: "100svh", padding: "48px 20px 80px", background: "#0b1421", fontFamily: "var(--font-inter), Inter, system-ui, sans-serif", color: "#f1eee4", lineHeight: 1.6 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <p style={{ fontFamily: "var(--font-jb), monospace", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#efb550", margin: 0 }}>
          <Link href="/" style={{ color: "inherit", display: "inline-block", padding: "10px 0" }}>← Back to the terminal</Link>
        </p>
        <h1 style={{ fontFamily: "var(--font-anton), Impact, sans-serif", fontSize: "clamp(40px, 8vw, 64px)", fontWeight: 400, textTransform: "uppercase", margin: "16px 0 18px", lineHeight: 1.1 }}>Plate credits</h1>
        <p style={{ margin: "0 0 30px", color: "#cdd2d4" }}>
          The terminal is an original 3D scene, with a painted cityscape beyond the windows and photographic plates in selected views. The six-second opening is rendered from the same world. A WebGL print pass adds ink, selective halftone and colour separation. Photographic sources and licences are listed below.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 14 }}>
          {PLATE_CREDITS.map((credit) => (
            <li key={credit.id} style={{ borderLeft: "3px solid #efb550", padding: "16px 18px", background: "#101e2d" }}>
              <div style={{ fontFamily: "var(--font-jb), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#efb550", marginBottom: 5 }}>{credit.id}</div>
              <div style={{ fontWeight: 600 }}>{credit.title}</div>
              <div style={{ fontSize: 14, color: "#aeb8c1", marginTop: 5 }}>
                {credit.author} · {credit.licence} · {credit.source.startsWith("http") ? <a href={credit.source} target="_blank" rel="noreferrer" style={{ color: "#efb550", textUnderlineOffset: 4 }}>View source</a> : "owner's photo"}
              </div>
            </li>
          ))}
        </ul>
        <section aria-labelledby="character-credit" style={{ marginTop: 40, borderTop: "1px solid #34404b", paddingTop: 30 }}>
          <h2 id="character-credit" style={{ fontFamily: "var(--font-anton), Impact, sans-serif", fontSize: 30, fontWeight: 400, textTransform: "uppercase", margin: "0 0 12px", lineHeight: 1.15 }}>Character & prop artwork</h2>
          <p style={{ margin: 0, color: "#cdd2d4", fontSize: 14 }}>
            The painted cityscape, Paddington fan-art vignette, aircraft artwork, earlier traveler poses, and surface texture were created for this site with AI image generation. The articulated traveler, passengers, shops and props are modeled in 3D. The small lounge screen is an original illustrated homage, not footage from the film. The personal gallery uses Ammar’s own photographs.
          </p>
        </section>
        <p style={{ marginTop: 32, fontSize: 14, color: "#aeb8c1" }}>
          Resume: <a href="/Ammar_Adam.pdf" target="_blank" rel="noreferrer" style={{ color: "#efb550", textUnderlineOffset: 4 }}>Ammar_Adam.pdf</a>
        </p>
      </div>
    </main>
  );
}
