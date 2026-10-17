"use client";

import { useState } from "react";
import { Boarding } from "./Boarding";
import { CheckIn } from "./CheckIn";
import { Departures } from "./Departures";
import { Gate } from "./Gate";
import { Preloader } from "./Preloader";
import { Security } from "./Security";
import { TopBar } from "./TopBar";

export function Journey() {
  const [ready, setReady] = useState(false);
  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <TopBar />
      <main className="journey">
        <CheckIn ready={ready} />
        <Departures />
        <Security />
        <Gate />
        <Boarding />
      </main>
    </>
  );
}
