"use client";

import { useCallback, useSyncExternalStore } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import "./departure-world.css";

export function DepartureWorld({ progress, reduced }: { progress: MotionValue<number>; reduced: boolean }) {
  const subscribe = useCallback((update: () => void) => progress.on("change", update), [progress]);
  const read = useCallback(() => progress.get() >= .999 ? "departed" : progress.get() > 0 ? "departing" : "idle", [progress]);
  const state = useSyncExternalStore(subscribe, read, () => "idle");
  const x = useTransform(progress, [0, .12, .52, 1], ["-45vw", "-20vw", "33vw", "100vw"]);
  const y = useTransform(progress, [0, .15, .55, 1], ["25vh", "16vh", "-9vh", "-40vh"]);
  const scale = useTransform(progress, [0, .35, 1], [.8, 1, .4]);
  const rotate = useTransform(progress, [0, .25, .7, 1], [-13, -6, 0, 4]);
  const opacity = useTransform(progress, [0, .025, .9, 1], [0, 1, 1, 0]);
  const light = useTransform(progress, [0, .04], [0, 1]);
  return <div className="dw-world" data-departure-state={state} aria-hidden="true">
    <div className="dw-window"><i /><i /><span /></div>
    {!reduced && <motion.img className="dw-aircraft" src="/art/aircraft-departure.webp" width={1000} height={500} alt="" style={{ x, y, scale, rotate, opacity }} />}
    <div className="dw-gate-sign"><span>GATE</span><strong>05</strong><b className={state === "idle" ? "" : "is-cleared"}>{state === "idle" ? "NOW BOARDING" : "CLEARED FOR DEPARTURE"}<i /></b></div>
    <motion.div className="dw-runway-lights" style={{ opacity: light }}>{Array.from({ length: 13 }, (_, index) => <i key={index} />)}</motion.div>
  </div>;
}
