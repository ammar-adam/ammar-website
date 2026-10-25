"use client";

/* Flat, two-tone figures shared by the scenes. Fills come from the scene palette. */

export function Traveller({ variant = 0 }: { variant?: 0 | 1 | 2 | 3 }) {
  if (variant === 1) {
    return (
      <svg viewBox="0 0 120 240" className="scn-fig" aria-hidden>
        <circle cx="62" cy="26" r="17" className="f-skin" />
        <path d="M44 20c4-14 32-14 36 0-4 2-8 3-18 3s-14-1-18-3z" className="f-hair" />
        <path d="M40 48h44l10 92H30z" className="f-c2" />
        <path d="M30 140h22l-4 92h-16zM72 140h22l-6 92h-16z" className="f-ink" />
        <path d="M86 56l20 10 6 60-10 2-8-48z" className="f-c2" />
        <rect x="22" y="56" width="22" height="64" rx="10" className="f-c1" />
        <path d="M26 230h18v8H26zM72 230h18v8H72z" className="f-ink" />
      </svg>
    );
  }
  if (variant === 2) {
    return (
      <svg viewBox="0 0 120 240" className="scn-fig" aria-hidden>
        <circle cx="58" cy="26" r="17" className="f-skin" />
        <path d="M41 22c2-16 32-18 36-2-6 3-12 4-20 4s-12 0-16-2z" className="f-hair" />
        <path d="M36 48h44l6 86H32z" className="f-c1" />
        <path d="M30 134h24l-4 98h-16zM66 134h24l-6 98h-16z" className="f-ink" />
        <path d="M80 56l8 6-2 40-10-2z" className="f-c1" />
        <rect x="74" y="84" width="12" height="20" rx="3" className="f-ink" />
        <path d="M34 60l-14 8 2 50h12z" className="f-c1" />
        <path d="M8 118h30l-4 54H12z" className="f-c3" />
        <path d="M26 232h18v8H26zM66 232h18v8H66z" className="f-ink" />
      </svg>
    );
  }
  if (variant === 3) {
    return (
      <svg viewBox="0 0 120 240" className="scn-fig scn-fig-small" aria-hidden>
        <circle cx="60" cy="110" r="14" className="f-skin" />
        <path d="M46 108c2-12 26-12 28 0-4 2-8 2-14 2s-10 0-14-2z" className="f-hair" />
        <path d="M44 126h32l4 54H40z" className="f-c3" />
        <path d="M42 178h16l-2 56H44zM62 178h16l-4 56H64z" className="f-ink" />
        <path d="M84 150h26v44H84z" className="f-c1" />
        <path d="M90 150v-10h14v10" className="f-ink" fill="none" strokeWidth="4" stroke="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 240" className="scn-fig" aria-hidden>
      <circle cx="60" cy="26" r="17" className="f-skin" />
      <path d="M42 20c3-15 33-15 36 0-5 3-11 4-18 4s-13-1-18-4z" className="f-hair" />
      <path d="M36 48h48l8 112H28z" className="f-c1" />
      <path d="M36 156h20l-2 76h-16zM68 156h20l-4 76h-16z" className="f-ink" />
      <path d="M84 56l10 6 6 70-10 2-8-52z" className="f-c1" />
      <path d="M96 132l6 40" className="f-ink" fill="none" strokeWidth="4" stroke="currentColor" />
      <rect x="92" y="170" width="24" height="56" rx="5" className="f-c2" />
      <path d="M98 170v-6h12v6" fill="none" strokeWidth="4" stroke="currentColor" className="f-ink" />
      <circle cx="98" cy="230" r="4" className="f-ink" /><circle cx="110" cy="230" r="4" className="f-ink" />
      <path d="M30 230h20v8H30zM66 230h20v8H66z" className="f-ink" />
    </svg>
  );
}

/** Security officer: cap, vest, standing behind the belt. */
export function Officer() {
  return (
    <svg viewBox="0 0 120 240" className="scn-fig" aria-hidden>
      <circle cx="60" cy="28" r="16" className="f-skin" />
      <path d="M40 22c0-12 40-12 40 0l6 2H34z" className="f-ink" />
      <path d="M38 48h44l6 100H32z" className="f-c1" />
      <path d="M44 50h32l4 60H40z" className="f-c2" />
      <path d="M34 152h22l-2 80h-16zM66 152h22l-4 80h-16z" className="f-ink" />
      <path d="M30 56l-12 10 6 56 10-2-4-46zM90 56l12 10-6 56-10-2 4-46z" className="f-c1" />
      <path d="M28 230h20v8H28zM66 230h20v8H66z" className="f-ink" />
    </svg>
  );
}

/** Side-view airliner, optionally with the jet bridge attached. */
export function GatePlane({ bridge = true }: { bridge?: boolean }) {
  return (
    <svg viewBox="0 0 900 260" className="scn-plane" aria-hidden>
      {bridge && (
        <g className="p-bridge-g">
          <path d="M0 150h120l40-30h60v40H160l-40 30H0z" className="p-bridge" />
          <path d="M120 150l40-30" className="p-bridge-line" />
        </g>
      )}
      <path d="M250 120L210 30h46l80 90z" className="p-tail" />
      <path d="M232 128L190 150h60l24-22z" className="p-body2" />
      <path d="M200 148c0-20 20-30 60-30h520c70 0 110 14 130 32-20 18-60 30-130 30H260c-40 0-60-12-60-32z" className="p-body" />
      <path d="M260 180h520c70 0 110-12 130-30H200c6 18 26 30 60 30z" className="p-body2" />
      <path d="M470 160h180l-110 60h-50z" className="p-wing" />
      <rect x="505" y="188" width="92" height="30" rx="15" className="p-engine" />
      <rect x="505" y="188" width="18" height="30" rx="9" className="p-engine2" />
      <g className="p-windows">
        {Array.from({ length: 30 }).map((_, i) => (
          <rect key={i} x={330 + i * 16} y="138" width="8" height="10" rx="3" />
        ))}
        <path d="M868 136h20c6 3 10 6 13 10h-33z" />
      </g>
      <path d="M262 152h520c60 0 100 6 120 14H262z" className="p-stripe" />
      <g className="p-gear">
        <path d="M330 180v26M760 180v26" fill="none" strokeWidth="6" stroke="currentColor" />
        <circle cx="330" cy="212" r="10" /><circle cx="760" cy="212" r="10" />
      </g>
    </svg>
  );
}

/** A suitcase for belts and seats. */
export function BeltBag({ tone = 0 }: { tone?: 0 | 1 | 2 }) {
  return (
    <svg viewBox="0 0 80 100" className={`scn-bbag scn-bbag-${tone}`} aria-hidden>
      <rect x="30" y="4" width="20" height="14" rx="6" fill="none" strokeWidth="5" stroke="currentColor" className="f-ink" />
      <rect x="8" y="16" width="64" height="76" rx="10" className="b-1" />
      <rect x="16" y="24" width="48" height="60" rx="6" className="b-2" />
      <path d="M8 44h64" className="f-ink" strokeWidth="2" stroke="currentColor" />
      <circle cx="22" cy="95" r="4" className="f-ink" /><circle cx="58" cy="95" r="4" className="f-ink" />
    </svg>
  );
}

/** Baggage trolley with stacked bags. */
export function Trolley() {
  return (
    <svg viewBox="0 0 160 120" className="scn-trolley" aria-hidden>
      <path d="M8 112h120l6-72h-8l-5 60H14z" className="f-ink" />
      <rect x="30" y="36" width="54" height="40" rx="5" className="f-c1" />
      <rect x="38" y="14" width="40" height="22" rx="4" className="f-c2" />
      <rect x="88" y="52" width="30" height="24" rx="4" className="f-c3" />
      <path d="M8 40h12v72H8z" className="f-ink" />
      <circle cx="30" cy="110" r="8" className="f-ink" /><circle cx="110" cy="110" r="8" className="f-ink" />
    </svg>
  );
}
