"use client";

export function AirportSignage() {
  return (
    <>
      <div className="signage-marker signage-marker-top-right" aria-hidden>
        <span className="signage-arrow">→</span>
        <span className="signage-text">Gates A–D</span>
      </div>

      <div className="signage-marker signage-marker-left" aria-hidden>
        <span className="signage-text">Departures</span>
        <span className="signage-arrow">↑</span>
      </div>

      <div className="signage-marker signage-marker-bottom-left" aria-hidden>
        <span className="signage-arrow">←</span>
        <span className="signage-text">Baggage claim</span>
      </div>

      <div className="gate-marker gate-marker-a" aria-hidden>A</div>
      <div className="gate-marker gate-marker-b" aria-hidden>B</div>
      <div className="gate-marker gate-marker-c" aria-hidden>C</div>
      <div className="gate-marker gate-marker-d" aria-hidden>D</div>
    </>
  );
}
