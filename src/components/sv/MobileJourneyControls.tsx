"use client";

import { PAINTED_COPY } from "@/data/copy";

import { JOURNEY_STOPS, journeyStopAt } from "@/data/journeyState";
import { UI_COPY } from "@/data/copy";
export const MOBILE_STOPS = JOURNEY_STOPS.map(stop => ({...stop, section:UI_COPY.chapters[stop.chapter]}));
export const mobileStopAt = (progress:number) => Math.max(0,journeyStopAt(progress));
export function MobileJourneyControls({index,onMove}:{index:number;onMove:(index:number)=>void}) {
 const stop=MOBILE_STOPS[index];
 return <nav className="mobile-tour" data-stop={index} aria-label="Move through the airport">
  <button type="button" onClick={()=>onMove(index-1)} disabled={index===0} aria-label="Previous stop"><span aria-hidden="true">{PAINTED_COPY.arrowLabelLabel}</span>{UI_COPY.back}</button>
  <div className="mobile-tour-position" aria-live="polite" aria-atomic="true"><strong>{stop.section}</strong></div>
  <button type="button" onClick={()=>onMove(index+1)} aria-label={index===11?"Continue to boarding pass":"Next stop"}>{index===11?UI_COPY.gate:UI_COPY.next}<span aria-hidden="true">{PAINTED_COPY.arrow}</span></button>
 </nav>;
}
