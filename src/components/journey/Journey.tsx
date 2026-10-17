"use client";

import { Boarding } from "./Boarding";
import { Departures } from "./Departures";
import { Gates } from "./Gates";
import { Glass } from "./Glass";
import { Hall } from "./Hall";
import { Lounge } from "./Lounge";
import { TopBar } from "./TopBar";

export function Journey() {
  return (
    <>
      <Glass />
      <TopBar />
      <main className="journey">
        <Hall />
        <div className="concourse">
          <Departures />
          <Gates />
          <Lounge />
          <Boarding />
        </div>
      </main>
    </>
  );
}
