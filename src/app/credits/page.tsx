import type { Metadata } from "next";
import Link from "next/link";
import credits from "@/components/sv/credits.json";
import "./credits.css";

export const metadata: Metadata = { title: "Plate credits · Ammar Adam" };

export default function CreditsPage() {
  return (
    <main className="credits">
      <Link href="/" className="credits-back">← Back</Link>
      <h1>Plate credits</h1>
      <p>
        The photographs behind the home page are by the people below. Each one is colour-graded, posterised, halftoned and misregistered in real time in the browser; a
        median-filtered copy and a hand-painted depth matte sit next to each file. All are modified from the originals.
      </p>
      <ul>
        {credits.map((c) => (
          <li key={c.id}>
            <a href={c.page} target="_blank" rel="noopener">
              {c.title}
            </a>{" "}
            by {c.author.replace(/ from .*$/, "")},{" "}
            {c.licenseUrl ? (
              <a href={c.licenseUrl} target="_blank" rel="noopener">
                {c.license}
              </a>
            ) : (
              c.license
            )}
            , modified.
          </li>
        ))}
      </ul>
      <p className="credits-note">
        The cover plate is CC BY-SA 2.0; processed renders of it are offered under the same licence. Everything else on the page (the drawings, the type, the code) is ©
        Ammar Adam.
      </p>
    </main>
  );
}
