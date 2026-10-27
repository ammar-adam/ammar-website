"use client";

type Stop = { at: number; section: string; position: string };
export const MOBILE_STOPS: Stop[] = [
  ...Array.from({ length: 5 }, (_, index) => ({ at: .24 + (index + .5) / 5 * .21, section: "Check-in", position: `${index + 1} of 5` })),
  ...Array.from({ length: 4 }, (_, index) => ({ at: .45 + (index + .5) / 4 * .20, section: "Security", position: `${index + 1} of 4` })),
  ...[.67, .735, .805].map((at, index) => ({ at, section: "Concourse", position: `${index + 1} of 3` })),
  { at: .925, section: "Gate", position: "Boarding pass" },
];

export function mobileStopAt(progress: number) {
  if (progress < .45) return Math.min(4, Math.max(0, Math.floor((progress - .24) / .21 * 5)));
  if (progress < .65) return 5 + Math.min(3, Math.floor((progress - .45) / .20 * 4));
  if (progress < .86) return 9 + Math.min(2, Math.floor((progress - .65) / .21 * 3));
  return 12;
}

/** Native scrolling still drives the film; these touch stops make every entry reachable. */
export function MobileJourneyControls({ index, onMove }: { index: number; onMove: (index: number) => void }) {
  const stop = MOBILE_STOPS[index];
  return <nav className="mobile-tour" aria-label="Move through the airport">
    <button type="button" onClick={() => onMove(index - 1)} disabled={index === 0} aria-label="Previous stop"><span aria-hidden="true">←</span> Back</button>
    <div className="mobile-tour-position" aria-live="polite" aria-atomic="true"><strong>{stop.section}</strong><span>{stop.position}</span></div>
    <button type="button" onClick={() => onMove(index + 1)} aria-label={index === 11 ? "Continue to boarding pass" : "Next stop"}>{index === 11 ? "Gate" : "Next"} <span aria-hidden="true">→</span></button>
  </nav>;
}
