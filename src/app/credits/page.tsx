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
        <h1 style={{ fontFamily: "var(--font-anton), Impact, sans-serif", fontSize: "clamp(40px, 8vw, 64px)", fontWeight: 400, textTransform: "uppercase", margin: "16px 0 18px", lineHeight: 1.1 }}>Artwork & credits</h1>
        <p style={{ margin: "0 0 30px", color: "#cdd2d4" }}>
          The terminal is a real-time 3D scene with curved architecture, physical lighting and shadows, animated luggage belts, security trays, people and a departing aircraft. The traveler uses an articulated 3D rig with painted surface detail. The opening film is recorded from the same world. A WebGL print pass adds restrained ink, shadow halftone and colour separation.
        </p>
        <h2 style={{ fontFamily: "var(--font-anton), Impact, sans-serif", fontSize: 30, fontWeight: 400, textTransform: "uppercase", margin: "0 0 12px", lineHeight: 1.15 }}>Photographic plate archive</h2>
        <p style={{ margin: "0 0 20px", color: "#cdd2d4", fontSize: 14 }}>
          These licensed photographs were used in earlier versions of the terminal and are retained in the project. Their sources and licences are preserved here.
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
          <h2 id="character-credit" style={{ fontFamily: "var(--font-anton), Impact, sans-serif", fontSize: 30, fontWeight: 400, textTransform: "uppercase", margin: "0 0 12px", lineHeight: 1.15 }}>Illustration & animation</h2>
          <p style={{ margin: 0, color: "#cdd2d4", fontSize: 14 }}>
            The 3D airport, props, aircraft and articulated character were built for this site. AI-generated artwork supplies the distant cityscape, painted material detail, original traveler reference and an original Paddington fan-art vignette on the café television. Earlier environment paintings remain archived in the project. The personal gallery uses Ammar’s own photographs.
          </p>
          <p style={{ margin: "16px 0 0", color: "#cdd2d4", fontSize: 14 }}>
            Liverpool’s Liverbird and L.F.C. emblem © Liverpool Football Club, sourced from its <a href="https://stadion-edge.liverpoolfc.com/images/lfc.svg" target="_blank" rel="noreferrer" style={{ color: "#efb550", textUnderlineOffset: 4 }}>official website</a>. The concourse mural uses an original spray-paint treatment for this independent fan artwork.
          </p>
        </section>
        <p style={{ marginTop: 32, fontSize: 14, color: "#aeb8c1" }}>
          Resume: <a href="/Ammar_Adam.pdf" target="_blank" rel="noreferrer" style={{ color: "#efb550", textUnderlineOffset: 4 }}>Ammar_Adam.pdf</a>
        </p>
      </div>
    </main>
  );
}
