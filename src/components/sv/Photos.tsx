"use client";

import { loungeRoomContent } from "@/data/loungeRoom";
import { Krackle } from "./art";
import { Bang, Caption, Kicker, Reveal } from "./ui";

const thumb = (src: string) => src.replace("/ABOUT", "/thumbs/ABOUT");

/* Beat 6: the gate area. One big comic page of polaroids with captions.
   Three sizes so the grid reads like a layout, not a slog. */
export function Photos() {
  const items = loungeRoomContent.photos.items;
  const sizeFor = (k: number) => (k % 11 === 0 ? "big" : k % 5 === 3 ? "tall" : "");
  return (
    <section id="gate" className="gatearea" aria-label="Photos">
      <Krackle className="k3" seed={3} />
      <Reveal className="sec-head">
        <Kicker>Gate B22 · The wall</Kicker>
        <Caption tone="yellow" size="lg" rotate={-1}>
          Also: Liverpool since I was ten. Paddington 2 is the best movie ever made. Mango matcha. GTA shawarma. I will talk about airline economics for too long.
        </Caption>
      </Reveal>

      <ul className="wall">
        {items.map((p, k) => (
          <Reveal key={p.src} as="li" className={`pola ${sizeFor(k)} pop`} delay={(k % 6) * 70} amount={0.1} style={{ ["--tilt" as string]: `${((k * 7) % 5) - 2}deg` }}>
            <img src={thumb(p.src)} alt={p.caption} loading="lazy" width={320} height={320} />
            <figcaption className="pola-cap">{p.caption}</figcaption>
          </Reveal>
        ))}
      </ul>
      <Bang text="CLICK!" className="wall-bang" rotate={-10} size={44} color="var(--sv-ink)" burst="var(--sv-amber)" />
    </section>
  );
}
