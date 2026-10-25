"use client";

import { useEffect, useState } from "react";
import { Sky, TopBar } from "@/components/shell/Shell";
import { CheckIn } from "@/components/scenes/CheckIn";
import { Concourse } from "@/components/scenes/Concourse";
import { Gate } from "@/components/scenes/Gate";
import { Security } from "@/components/scenes/Security";
import { Hero } from "./Hero";
import { STOPS } from "./shared";
import "./home.css";

const ALL = [{ id: "hall", here: "Arrivals hall · Terminal 1" }, ...STOPS];

function useHere() {
  const [here, setHere] = useState<string>(ALL[0].here);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const stop = ALL.find((s) => s.id === e.target.id);
          if (stop) setHere(stop.here);
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    for (const s of ALL) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);
  return here;
}

export function Home() {
  const here = useHere();
  return (
    <>
      <Sky />
      <TopBar here={here} />
      <main className="va">
        <Hero />
        <CheckIn />
        <Security />
        <Concourse />
        <Gate />
      </main>
    </>
  );
}
