"use client";

import "./sv.css";
import { Cover } from "./Cover";
import { Airports } from "./Airports";
import { CheckIn } from "./CheckIn";
import { Security } from "./Security";
import { Photos } from "./Photos";
import { Boarding } from "./Boarding";

/* Issue #20: Ammar's intro sequence, told through an airport. One scroll,
   six comic pages. Gutters between pages carry a glitch cut. */
export function SpiderVerse() {
  return (
    <main className="sv">
      <Cover />
      <Gutter n={1} />
      <Airports />
      <Gutter n={2} />
      <CheckIn />
      <Gutter n={3} />
      <Security />
      <Gutter n={4} />
      <Photos />
      <Gutter n={5} />
      <Boarding />
    </main>
  );
}

function Gutter({ n }: { n: number }) {
  return (
    <div className={`gutter g${n}`} aria-hidden="true">
      <span className="gutter-c" />
      <span className="gutter-m" />
      <span className="gutter-k" />
    </div>
  );
}
