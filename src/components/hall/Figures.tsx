"use client";

/* Flat, two-tone figures for the hall. Palette comes from CSS variables so the
   whole scene re-colours together (day/night). */

export function Traveller({ variant = 0 }: { variant?: 0 | 1 | 2 | 3 }) {
  // 0: long coat, rolling bag · 1: hoodie, backpack · 2: jacket, tote, phone · 3: child with small bag
  if (variant === 1) {
    return (
      <svg viewBox="0 0 120 240" className="hl-fig" aria-hidden>
        <circle cx="62" cy="26" r="17" className="hl-skin" />
        <path d="M44 20c4-14 32-14 36 0-4 2-8 3-18 3s-14-1-18-3z" className="hl-hair" />
        <path d="M40 48h44l10 92H30z" className="hl-c2" />
        <path d="M30 140h22l-4 92h-16zM72 140h22l-6 92h-16z" className="hl-ink" />
        <path d="M86 56l20 10 6 60-10 2-8-48z" className="hl-c2" />
        <rect x="22" y="56" width="22" height="64" rx="10" className="hl-c1" />
        <path d="M26 230h18v8H26zM72 230h18v8H72z" className="hl-ink" />
      </svg>
    );
  }
  if (variant === 2) {
    return (
      <svg viewBox="0 0 120 240" className="hl-fig" aria-hidden>
        <circle cx="58" cy="26" r="17" className="hl-skin" />
        <path d="M41 22c2-16 32-18 36-2-6 3-12 4-20 4s-12 0-16-2z" className="hl-hair" />
        <path d="M36 48h44l6 86H32z" className="hl-c1" />
        <path d="M30 134h24l-4 98h-16zM66 134h24l-6 98h-16z" className="hl-ink" />
        <path d="M80 56l8 6-2 40-10-2z" className="hl-c1" />
        <rect x="74" y="84" width="12" height="20" rx="3" className="hl-ink" />
        <path d="M34 60l-14 8 2 50h12z" className="hl-c1" />
        <path d="M8 118h30l-4 54H12z" className="hl-c3" />
        <path d="M26 232h18v8H26zM66 232h18v8H66z" className="hl-ink" />
      </svg>
    );
  }
  if (variant === 3) {
    return (
      <svg viewBox="0 0 120 240" className="hl-fig hl-fig-small" aria-hidden>
        <circle cx="60" cy="110" r="14" className="hl-skin" />
        <path d="M46 108c2-12 26-12 28 0-4 2-8 2-14 2s-10 0-14-2z" className="hl-hair" />
        <path d="M44 126h32l4 54H40z" className="hl-c3" />
        <path d="M42 178h16l-2 56H44zM62 178h16l-4 56H64z" className="hl-ink" />
        <path d="M84 150h26v44H84z" className="hl-c1" />
        <path d="M90 150v-10h14v10" className="hl-ink" fill="none" strokeWidth="4" stroke="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 240" className="hl-fig" aria-hidden>
      <circle cx="60" cy="26" r="17" className="hl-skin" />
      <path d="M42 20c3-15 33-15 36 0-5 3-11 4-18 4s-13-1-18-4z" className="hl-hair" />
      <path d="M36 48h48l8 112H28z" className="hl-c1" />
      <path d="M36 156h20l-2 76h-16zM68 156h20l-4 76h-16z" className="hl-ink" />
      <path d="M84 56l10 6 6 70-10 2-8-52z" className="hl-c1" />
      <path d="M96 132l6 40" className="hl-ink" fill="none" strokeWidth="4" stroke="currentColor" />
      <rect x="92" y="170" width="24" height="56" rx="5" className="hl-c2" />
      <path d="M98 170v-6h12v6" fill="none" strokeWidth="4" stroke="currentColor" className="hl-ink" />
      <circle cx="98" cy="230" r="4" className="hl-ink" /><circle cx="110" cy="230" r="4" className="hl-ink" />
      <path d="M30 230h20v8H30zM66 230h20v8H66z" className="hl-ink" />
    </svg>
  );
}

/** Side-view airliner at the gate, with the jet bridge. */
export function GatePlane() {
  return (
    <svg viewBox="0 0 900 260" className="hl-plane" aria-hidden>
      {/* bridge */}
      <path d="M0 150h120l40-30h60v40H160l-40 30H0z" className="hl-bridge" />
      <path d="M120 150l40-30" className="hl-bridge-line" />
      {/* tail */}
      <path d="M250 120L210 30h46l80 90z" className="hl-tail" />
      <path d="M232 128L190 150h60l24-22z" className="hl-body2" />
      {/* fuselage */}
      <path d="M200 148c0-20 20-30 60-30h520c70 0 110 14 130 32-20 18-60 30-130 30H260c-40 0-60-12-60-32z" className="hl-body" />
      <path d="M260 180h520c70 0 110-12 130-30H200c6 18 26 30 60 30z" className="hl-body2" />
      {/* wing + engine */}
      <path d="M470 160h180l-110 60h-50z" className="hl-wing" />
      <rect x="505" y="188" width="92" height="30" rx="15" className="hl-engine" />
      <rect x="505" y="188" width="18" height="30" rx="9" className="hl-engine2" />
      {/* windows */}
      <g className="hl-windows">
        {Array.from({ length: 30 }).map((_, i) => (
          <rect key={i} x={330 + i * 16} y="138" width="8" height="10" rx="3" />
        ))}
        <path d="M868 136h20c6 3 10 6 13 10h-33z" />
      </g>
      {/* livery stripe */}
      <path d="M262 152h520c60 0 100 6 120 14H262z" className="hl-stripe" />
      {/* gear */}
      <path d="M330 180v26M760 180v26" className="hl-ink" fill="none" strokeWidth="6" stroke="currentColor" />
      <circle cx="330" cy="212" r="10" className="hl-ink" /><circle cx="760" cy="212" r="10" className="hl-ink" />
    </svg>
  );
}

/** A suitcase for the belt behind the desks. */
export function BeltBag({ tone = 0 }: { tone?: 0 | 1 | 2 }) {
  return (
    <svg viewBox="0 0 80 100" className={`hl-bbag hl-bbag-${tone}`} aria-hidden>
      <rect x="30" y="4" width="20" height="14" rx="6" fill="none" strokeWidth="5" stroke="currentColor" className="hl-ink" />
      <rect x="8" y="16" width="64" height="76" rx="10" className="hl-bb" />
      <rect x="16" y="24" width="48" height="60" rx="6" className="hl-bb2" />
      <path d="M8 44h64" className="hl-ink" strokeWidth="2" stroke="currentColor" />
      <circle cx="22" cy="95" r="4" className="hl-ink" /><circle cx="58" cy="95" r="4" className="hl-ink" />
    </svg>
  );
}
