/* Painted, lit comic drawings. Gradients for light, halftone + hatching in the
   shadows, ink lines on top. `mono` renders a drawing in one colour, which the
   Chroma wrapper uses for cyan/magenta depth-of-field copies. */

const INK = "#0d0b14";

function rng(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function Defs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={`${id}-ht`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
        <circle cx="3" cy="3" r="1.7" fill={INK} />
      </pattern>
      <pattern id={`${id}-hatch`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
        <line x1="0" y1="0" x2="0" y2="7" stroke={INK} strokeWidth="1.2" opacity="0.8" />
      </pattern>
      <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff6ea" />
        <stop offset="0.55" stopColor="#d9cfe6" />
        <stop offset="1" stopColor="#6e5a9a" />
      </linearGradient>
      <linearGradient id={`${id}-red`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff5a5f" />
        <stop offset="1" stopColor="#8d1030" />
      </linearGradient>
      <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#9ff2ff" />
        <stop offset="1" stopColor="#1483c7" />
      </linearGradient>
      <linearGradient id={`${id}-belly`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff9a3c" stopOpacity="0" />
        <stop offset="1" stopColor="#ff9a3c" stopOpacity="0.55" />
      </linearGradient>
      <radialGradient id={`${id}-navr`}>
        <stop offset="0" stopColor="#ff3b5c" stopOpacity="0.9" />
        <stop offset="1" stopColor="#ff3b5c" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-navg`}>
        <stop offset="0" stopColor="#4cff9a" stopOpacity="0.9" />
        <stop offset="1" stopColor="#4cff9a" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

type PlaneProps = { className?: string; mono?: string; id?: string; accent?: string; light?: "ramp" | "gate" | "sky" | "flat"; flip?: boolean };

/** Airliner, side view. Nose right unless `flip`. viewBox 0 0 440 200 */
export function Plane({ className = "", mono, id = "pl", accent, light = "flat", flip = false }: PlaneProps) {
  const m = mono;
  const F = (fill: string) => (m ? m : fill);
  const S = m ? m : INK;
  const sw = m ? 4 : 5;
  const red = accent ?? `url(#${id}-red)`;
  const win = light === "gate" ? "#ffb64a" : light === "sky" ? "#9ab0d8" : "#ffd36b";
  return (
    <svg className={className} viewBox="0 0 440 200" aria-hidden="true" overflow="visible">
      {!m && <Defs id={id} />}
      <g transform={flip ? "translate(440 0) scale(-1 1)" : undefined}>
        {light === "ramp" && !m && (
          <>
            <circle cx="92" cy="20" r="26" fill={`url(#${id}-navr)`} className="navlight" />
            <circle cx="112" cy="190" r="26" fill={`url(#${id}-navg)`} className="navlight" />
          </>
        )}
        <path d="M52 92 L90 18 L150 18 L128 92 Z" fill={F(red)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        {!m && <path d="M62 92 L96 26 L112 26 L84 92 Z" fill={`url(#${id}-hatch)`} opacity="0.5" />}
        <path d="M40 112 L95 94 L140 94 L120 118 Z" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M200 86 L270 34 L336 34 L292 86 Z" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        {!m && <path d="M212 84 L270 40 L300 40 L262 84 Z" fill={`url(#${id}-ht)`} opacity="0.35" />}
        <path d="M34 112 C34 86 60 76 100 76 L330 76 C380 76 412 94 428 114 C412 134 380 150 330 150 L100 150 C60 150 34 138 34 112 Z" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        {!m && (
          <>
            <path d="M44 124 C60 140 80 146 100 146 L330 146 C372 146 400 134 418 118 L420 120 C400 140 372 150 330 150 L100 150 C62 150 44 138 40 124 Z" fill={`url(#${id}-ht)`} opacity="0.9" />
            <path d="M60 118 C70 134 86 142 110 142 L300 142 L300 150 L100 150 C62 150 44 138 40 124 Z" fill={`url(#${id}-hatch)`} opacity="0.45" />
            {light === "ramp" && <path d="M40 118 C60 142 90 150 120 150 L340 150 C380 150 404 136 420 120 L422 124 C404 142 380 152 340 152 L120 152 C86 152 56 144 38 124 Z" fill={`url(#${id}-belly)`} />}
            {light === "ramp" ? (
              <path d="M70 82 C110 78 300 78 380 82 L378 87 C300 83 110 83 72 87 Z" fill="#19d9ff" opacity="0.9" />
            ) : (
              <path d="M70 84 C110 80 300 80 380 84 L376 90 C300 86 110 86 74 90 Z" fill="#fff" opacity="0.7" />
            )}
          </>
        )}
        <path d="M60 128 L396 128 L384 136 L70 136 Z" fill={F(red)} stroke={S} strokeWidth="2.5" />
        <path d="M372 88 L396 88 C408 96 416 104 420 112 L372 112 Z" fill={F(`url(#${id}-glass)`)} stroke={S} strokeWidth="3.5" strokeLinejoin="round" />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={112 + i * 27} y="94" width="14" height="16" rx="3" fill={F(light === "gate" && rng(i) > 0.7 ? "#3a3a5a" : win)} stroke={S} strokeWidth="2.5" />
        ))}
        <rect x="92" y="90" width="14" height="40" rx="3" fill="none" stroke={S} strokeWidth="2.5" />
        <path d="M170 142 L112 190 L212 190 L286 142 Z" fill={F(red)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        {!m && <path d="M186 146 L140 184 L176 184 L236 146 Z" fill={`url(#${id}-ht)`} opacity="0.45" />}
        <rect x="216" y="150" width="76" height="34" rx="17" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} />
        <ellipse cx="292" cy="167" rx="8" ry="17" fill={S} />
        {!m && <rect x="226" y="170" width="56" height="10" rx="5" fill={`url(#${id}-hatch)`} opacity="0.7" />}
        {!m && light !== "sky" && (
          <>
            <circle cx="92" cy="20" r="4" fill="#ff3b5c" className="navlight" />
            <circle cx="112" cy="190" r="4" fill="#4cff9a" className="navlight" />
          </>
        )}
      </g>
    </svg>
  );
}

/** Second pose: three-quarter view, nose up ~12°, climbing right. viewBox 0 0 520 340 */
export function PlaneClimb({ className = "", mono, id = "pc", outline = false }: { className?: string; mono?: string; id?: string; outline?: boolean }) {
  const m = mono;
  const S = m ? m : INK;
  const F = (fill: string) => (outline ? "none" : m ? m : fill);
  const sw = outline ? 3 : 5;
  return (
    <svg className={className} viewBox="0 0 520 340" aria-hidden="true" overflow="visible">
      {!m && !outline && <Defs id={id} />}
      <g transform="translate(40 40) rotate(-22 220 120) skewY(-5)">
        {/* far wing */}
        <path d="M210 92 L300 20 L372 20 L312 92 Z" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        {/* tail */}
        <path d="M50 96 L92 10 L160 10 L136 96 Z" fill={F(`url(#${id}-red)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M34 120 L96 98 L150 98 L128 128 Z" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        {/* fuselage, fatter toward the viewer */}
        <path d="M30 118 C30 84 64 72 110 72 L330 72 C392 72 430 98 448 126 C430 160 392 180 330 180 L110 180 C64 180 30 158 30 118 Z" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        {!m && !outline && (
          <>
            <path d="M40 136 C60 166 90 176 120 176 L330 176 C380 176 414 158 440 134 L442 138 C416 164 380 180 330 180 L120 180 C86 180 56 168 36 140 Z" fill={`url(#${id}-ht)`} />
            <path d="M48 130 C70 160 100 170 130 170 L300 170 L300 180 L110 180 C64 180 36 160 30 128 Z" fill={`url(#${id}-hatch)`} opacity="0.5" />
            <path d="M80 80 C120 76 320 76 400 86 L398 92 C320 82 120 82 82 86 Z" fill="#fff" opacity="0.6" />
          </>
        )}
        <path d="M62 150 L408 150 L396 160 L72 160 Z" fill={F(`url(#${id}-red)`)} stroke={S} strokeWidth="2.5" />
        <path d="M392 92 L416 92 C430 102 440 114 446 126 L392 120 Z" fill={F(`url(#${id}-glass)`)} stroke={S} strokeWidth="3.5" strokeLinejoin="round" />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={118 + i * 26} y="100" width="13" height="18" rx="3" fill={F("#ffd36b")} stroke={S} strokeWidth="2.5" />
        ))}
        {/* near wing, swept toward the viewer */}
        <path d="M150 176 L40 290 L170 290 L290 176 Z" fill={F(`url(#${id}-red)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        {!m && !outline && <path d="M170 182 L80 280 L130 280 L240 182 Z" fill={`url(#${id}-ht)`} opacity="0.45" />}
        <rect x="190" y="196" width="92" height="42" rx="21" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} />
        <ellipse cx="282" cy="217" rx="10" ry="21" fill={outline ? "none" : S} stroke={S} strokeWidth={outline ? 3 : 0} />
        {!m && !outline && (
          <>
            <circle cx="94" cy="12" r="4" fill="#ff3b5c" className="navlight" />
            <circle cx="42" cy="290" r="4" fill="#4cff9a" className="navlight" />
          </>
        )}
      </g>
    </svg>
  );
}

/** Kid pulling a rolling suitcase, lit from the top right. viewBox 0 0 220 260 */
export function Kid({ className = "", mono }: { className?: string; mono?: string }) {
  const m = mono;
  const S = m ? m : INK;
  const F = (fill: string) => (m ? m : fill);
  return (
    <svg className={className} viewBox="0 0 220 260" aria-hidden="true" overflow="visible">
      {!m && (
        <defs>
          <linearGradient id="kid-hood" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffd06a" />
            <stop offset="1" stopColor="#c2541b" />
          </linearGradient>
          <linearGradient id="kid-case" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff5f6d" />
            <stop offset="1" stopColor="#7d0f36" />
          </linearGradient>
          <pattern id="kid-ht" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
            <circle cx="3" cy="3" r="1.6" fill={INK} />
          </pattern>
          <pattern id="kid-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeWidth="1.1" />
          </pattern>
        </defs>
      )}
      <rect x="128" y="146" width="70" height="88" rx="8" fill={F("url(#kid-case)")} stroke={S} strokeWidth="5" />
      {!m && <rect x="128" y="196" width="70" height="38" rx="6" fill="url(#kid-ht)" opacity="0.55" />}
      <rect x="140" y="160" width="46" height="8" fill={S} opacity="0.85" />
      <path d="M146 146 L146 118 L180 118 L180 146" fill="none" stroke={S} strokeWidth="5" strokeLinejoin="round" />
      <circle cx="140" cy="240" r="8" fill={S} />
      <circle cx="186" cy="240" r="8" fill={S} />
      <path className="kid-leg kl1" d="M62 190 L54 244" stroke={S} strokeWidth="14" strokeLinecap="round" />
      <path className="kid-leg kl2" d="M86 190 L100 240" stroke={S} strokeWidth="14" strokeLinecap="round" />
      <path d="M44 246 L66 246" stroke={S} strokeWidth="12" strokeLinecap="round" />
      <path d="M94 244 L116 240" stroke={S} strokeWidth="12" strokeLinecap="round" />
      <path d="M46 112 C46 96 60 90 74 90 C88 90 104 96 104 112 L108 192 L42 192 Z" fill={F("url(#kid-hood)")} stroke={S} strokeWidth="5" strokeLinejoin="round" />
      {!m && <path d="M44 150 L74 150 L76 190 L43 190 Z" fill="url(#kid-hatch)" opacity="0.5" />}
      <path d="M104 118 L158 120" stroke={S} strokeWidth="12" strokeLinecap="round" />
      <path d="M104 118 L156 120" stroke={F("#ffb84d")} strokeWidth="6" strokeLinecap="round" />
      <circle cx="74" cy="58" r="34" fill={F("#e2a877")} stroke={S} strokeWidth="5" />
      <path d="M40 54 C44 28 60 20 78 22 C98 24 108 36 108 54 C98 44 86 42 76 44 C62 46 50 46 40 54 Z" fill={S} />
      {!m && (
        <>
          <circle cx="64" cy="62" r="3.5" fill={INK} />
          <circle cx="86" cy="62" r="3.5" fill={INK} />
          <path d="M66 76 C72 82 80 82 86 76" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/** Long terminal at night: glass hall with lit and dark bays, people, tower. viewBox 0 0 1600 420 */
export function Terminal({ className = "", mono, id = "tm", far = true }: { className?: string; mono?: string; id?: string; far?: boolean }) {
  const m = mono;
  const S = m ? m : far ? "#2a1f5a" : INK;
  const sw = m ? 3 : far ? 1.5 : 4;
  const F = (fill: string) => (m ? m : fill);
  const bays = Array.from({ length: 24 }, (_, i) => ({ x: 70 + i * 61, lit: rng(i) < 0.7, c: ["#ffd27a", "#ffb64a", "#ffe6b0"][Math.floor(rng(i + 50) * 3)] }));
  return (
    <svg className={className} viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {!m && (
        <defs>
          <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a2f6b" />
            <stop offset="1" stopColor="#120f24" />
          </linearGradient>
          <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a1a4a" />
            <stop offset="1" stopColor="#1a1030" />
          </linearGradient>
          <linearGradient id={`${id}-bay`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="0.8" />
            <stop offset="1" stopColor="#8a3a5a" stopOpacity="0.9" />
          </linearGradient>
          <pattern id={`${id}-ht`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
            <circle cx="3.5" cy="3.5" r="2" fill={INK} />
          </pattern>
          <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id={`${id}-m`}>
            <rect width="1600" height="420" fill={`url(#${id}-fade)`} />
          </mask>
        </defs>
      )}
      {/* tower */}
      <rect x="1290" y="60" width="40" height="200" fill={F(`url(#${id}-wall)`)} stroke={S} strokeWidth={sw} />
      <path d="M1260 60 L1360 60 L1350 110 L1270 110 Z" fill={F("#ffb64a")} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M1250 30 L1370 30 L1360 62 L1260 62 Z" fill={F("#2a2250")} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
      {!m && <circle cx="1310" cy="18" r="5" fill="#ff3b5c" className="navlight" />}
      {/* roof + soffit */}
      <path d="M40 180 Q800 90 1560 180 L1560 200 Q800 112 40 200 Z" fill={F("#201a3a")} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
      {!m && <path d="M40 184 Q800 96 1560 184 L1560 200 Q800 112 40 200 Z" fill={`url(#${id}-ht)`} opacity="0.5" />}
      {/* glass hall */}
      <rect x="60" y="196" width="1480" height="190" fill={F(`url(#${id}-glass)`)} stroke={S} strokeWidth={sw} />
      {!m && bays.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y="204" width="50" height="176" fill={b.lit ? b.c : "#3a2a5a"} opacity={b.lit ? 0.92 : 0.9} />
          {b.lit && <rect x={b.x} y="204" width="50" height="176" fill={`url(#${id}-bay)`} opacity="0.35" />}
          {b.lit && rng(i + 9) > 0.55 && (
            <g fill={INK} opacity="0.85" transform={`translate(${b.x + 12 + rng(i + 3) * 20} 318)`}>
              <circle cx="7" cy="6" r="6" />
              <path d="M0 14 C0 10 14 10 14 14 L16 48 L-2 48 Z" />
            </g>
          )}
        </g>
      ))}
      {m && bays.map((b, i) => <rect key={i} x={b.x} y="204" width="50" height="176" fill={m} opacity="0.6" />)}
      {!m && <rect x="60" y="196" width="1480" height="190" fill={`url(#${id}-ht)`} mask={`url(#${id}-m)`} opacity="0.7" />}
      {/* base / curb */}
      <rect x="40" y="384" width="1520" height="36" fill={F("#0f0c1c")} stroke={S} strokeWidth={sw} />
      {/* columns */}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={110 + i * 190} y="196" width="14" height="190" fill={F("#15112a")} stroke={S} strokeWidth={sw} />
      ))}
    </svg>
  );
}

/** Reflections of the lit bays on the wet apron. */
export function TerminalReflection({ className = "" }: { className?: string }) {
  const bays = Array.from({ length: 24 }, (_, i) => ({ x: 70 + i * 61, lit: rng(i) < 0.7, c: ["#ffd27a", "#ffb64a", "#ffe6b0"][Math.floor(rng(i + 50) * 3)] }));
  return (
    <svg className={className} viewBox="0 0 1600 200" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs>
        <linearGradient id="tr-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="tr-m"><rect width="1600" height="200" fill="url(#tr-fade)" /></mask>
      </defs>
      <g mask="url(#tr-m)">
        {bays.filter((b) => b.lit).map((b, i) => <rect key={i} x={b.x + 4} y="0" width="42" height="200" fill={b.c} />)}
        <rect x="1262" y="0" width="96" height="60" fill="#ffb64a" />
      </g>
    </svg>
  );
}

/** A lit gate sign post. */
export function GateSign({ code, city, tone, className = "" }: { code: string; city: string; tone: "cyan" | "amber" | "mag"; className?: string }) {
  return (
    <div className={`gsign gsign-${tone} ${className}`}>
      <span className="gsign-glow" aria-hidden="true" />
      <span className="gsign-code">{code}</span>
      <span className="gsign-city">{city}</span>
      <span className="gsign-post" aria-hidden="true" />
    </div>
  );
}

/** Check-in counter as a lit prism with a bag scale and a tag printer. viewBox 0 0 440 130 */
export function Counter({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 440 130" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ct-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffcf8a" />
          <stop offset="1" stopColor="#a0602a" />
        </linearGradient>
        <pattern id="ct-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="7" stroke={INK} strokeWidth="1.2" />
        </pattern>
      </defs>
      <path d="M0 22 L24 0 L440 0 L416 22 Z" fill="url(#ct-top)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <rect x="0" y="22" width="416" height="108" fill="#2a1440" stroke={INK} strokeWidth="3" />
      <path d="M416 22 L440 0 L440 108 L416 130 Z" fill="#160b26" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <rect x="0" y="92" width="416" height="38" fill="url(#ct-hatch)" opacity="0.5" />
      {/* bag scale */}
      <rect x="20" y="6" width="90" height="10" fill="#4a3a66" stroke={INK} strokeWidth="2" />
      <rect x="34" y="-6" width="62" height="12" fill="#1a1030" stroke={INK} strokeWidth="2" />
      <rect x="40" y="-3" width="30" height="6" fill="#4cff9a" />
      {/* tag printer */}
      <rect x="330" y="-14" width="56" height="30" rx="3" fill="#1a1030" stroke={INK} strokeWidth="2.5" />
      <rect x="338" y="-2" width="40" height="4" fill="#ffb64a" />
    </svg>
  );
}

/** Speed lines, horizontal. */
export function SpeedLines({ className = "", n = 7, color = "#fff" }: { className?: string; n?: number; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const y = 10 + (i * 100) / (n - 1);
        const len = 180 + ((i * 97) % 160);
        return <line key={i} x1={400 - len} y1={y} x2={400} y2={y} stroke={color} strokeWidth={i % 2 ? 2 : 3.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.85} />;
      })}
    </svg>
  );
}

/** The X-ray of the bag: real objects, cyan for metal, orange for organics. viewBox 0 0 800 300 */
export function XrayBag({ className = "", shown = 4 }: { className?: string; shown?: number }) {
  const C = "#5de9ff";
  const O = "#ff9a3c";
  const vis = (k: number) => (k < shown ? 1 : 0);
  return (
    <svg className={className} viewBox="0 0 800 300" aria-hidden="true">
      {/* bag shell */}
      <path d="M60 80 C60 56 80 44 110 44 L690 44 C720 44 740 56 740 80 L740 250 C740 272 724 282 700 282 L100 282 C76 282 60 272 60 250 Z" fill={O} fillOpacity="0.14" stroke={O} strokeWidth="3" strokeOpacity="0.8" />
      <path d="M330 44 C330 20 350 12 400 12 C450 12 470 20 470 44" fill="none" stroke={O} strokeWidth="6" strokeOpacity="0.7" />
      <path d="M80 70 L720 70" stroke={O} strokeWidth="2" strokeOpacity="0.5" strokeDasharray="6 5" />
      {/* laptop: RocketShip */}
      <g className="xr-item" style={{ opacity: vis(0) }}>
        <path d="M110 104 L300 96 L306 196 L116 204 Z" fill={C} fillOpacity="0.35" stroke={C} strokeWidth="3" />
        <path d="M124 114 L288 108 L292 184 L130 190 Z" fill={C} fillOpacity="0.5" />
        <path d="M100 206 L320 198 L330 226 L96 232 Z" fill={C} fillOpacity="0.6" stroke={C} strokeWidth="3" />
        <rect x="140" y="124" width="60" height="6" fill={O} fillOpacity="0.8" />
        <rect x="140" y="138" width="110" height="4" fill={O} fillOpacity="0.6" />
        <rect x="140" y="150" width="90" height="4" fill={O} fillOpacity="0.6" />
      </g>
      {/* phone: CanadaClip */}
      <g className="xr-item" style={{ opacity: vis(1) }}>
        <rect x="358" y="110" width="76" height="140" rx="12" fill={C} fillOpacity="0.4" stroke={C} strokeWidth="3" transform="rotate(-8 396 180)" />
        <rect x="368" y="124" width="56" height="100" rx="4" fill={O} fillOpacity="0.55" transform="rotate(-8 396 180)" />
        <path d="M382 160 L396 140 L410 160 L404 160 L404 176 L388 176 L388 160 Z" fill={C} fillOpacity="0.9" transform="rotate(-8 396 180)" />
      </g>
      {/* folder of charts: Risk-Optimized Portfolio */}
      <g className="xr-item" style={{ opacity: vis(2) }}>
        <path d="M470 120 L640 110 L648 230 L478 240 Z" fill={O} fillOpacity="0.45" stroke={O} strokeWidth="3" />
        <path d="M470 120 L520 112 L530 124 L640 118" fill="none" stroke={O} strokeWidth="3" strokeOpacity="0.9" />
        <path d="M494 206 L530 170 L556 190 L590 150 L622 166" fill="none" stroke={C} strokeWidth="4" strokeLinecap="round" />
        <rect x="496" y="130" width="40" height="6" fill={C} fillOpacity="0.8" />
      </g>
      {/* car key: Backseat */}
      <g className="xr-item" style={{ opacity: vis(3) }}>
        <rect x="660" y="150" width="48" height="76" rx="10" fill={O} fillOpacity="0.7" stroke={C} strokeWidth="3" transform="rotate(18 684 188)" />
        <rect x="676" y="90" width="16" height="70" fill={C} fillOpacity="0.85" transform="rotate(18 684 188)" />
        <rect x="692" y="100" width="10" height="8" fill={C} transform="rotate(18 684 188)" />
        <rect x="692" y="116" width="10" height="8" fill={C} transform="rotate(18 684 188)" />
        <circle cx="684" cy="200" r="6" fill={C} transform="rotate(18 684 188)" />
      </g>
      {/* cable, loose coins */}
      <path d="M160 250 C220 230 260 270 320 250 S420 236 460 262" fill="none" stroke={O} strokeWidth="5" strokeOpacity="0.7" strokeLinecap="round" />
      <circle cx="600" cy="258" r="9" fill={C} fillOpacity="0.9" />
      <circle cx="624" cy="264" r="7" fill={C} fillOpacity="0.9" />
    </svg>
  );
}

/** Grey security tub, drawn in perspective. viewBox 0 0 560 160 */
export function Tub({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 560 160" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="tub-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="7" stroke={INK} strokeWidth="1.3" />
        </pattern>
        <linearGradient id="tub-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3342" />
          <stop offset="1" stopColor="#59657a" />
        </linearGradient>
      </defs>
      <path d="M40 0 L520 0 L560 30 L0 30 Z" fill="#7b8699" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M0 30 L560 30 L540 160 L20 160 Z" fill="url(#tub-in)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M40 0 L520 0 L500 24 L60 24 Z" fill="#3a4454" opacity="0.9" />
      <path d="M40 0 L520 0 L500 24 L60 24 Z" fill="url(#tub-hatch)" opacity="0.6" />
      <path d="M0 30 L20 160 L540 160 L560 30 L540 34 L522 152 L38 152 L20 34 Z" fill="#1c2330" opacity="0.5" />
    </svg>
  );
}

/** Hand and cuff holding the pass, from bottom right. viewBox 0 0 420 320 */
export function Hand({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 420 320" aria-hidden="true" overflow="visible">
      <defs>
        <linearGradient id="hand-skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#efc19a" />
          <stop offset="1" stopColor="#b4733f" />
        </linearGradient>
        <pattern id="hand-ht" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
          <circle cx="3" cy="3" r="1.6" fill={INK} />
        </pattern>
      </defs>
      {/* cuff + sleeve */}
      <path d="M180 320 L250 190 L420 230 L420 320 Z" fill="#1a1236" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d="M232 222 L262 176 L420 214 L420 246 Z" fill="#ff2e88" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      {/* palm */}
      <path d="M150 150 C160 110 210 100 250 120 C300 146 320 190 300 230 C280 270 230 272 200 250 C170 228 140 190 150 150 Z" fill="url(#hand-skin)" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d="M200 250 C230 272 280 270 300 230 C290 252 250 262 214 254 Z" fill="url(#hand-ht)" opacity="0.6" />
      {/* fingers behind the pass edge */}
      <path d="M150 150 C120 140 96 150 94 170 C92 190 120 198 150 192 Z" fill="url(#hand-skin)" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d="M156 196 C126 192 100 204 102 224 C104 244 134 248 160 238 Z" fill="url(#hand-skin)" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      {/* thumb over the stub corner */}
      <path d="M230 128 C222 92 236 60 262 56 C292 52 306 86 296 118 C290 140 262 150 240 144 Z" fill="url(#hand-skin)" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d="M248 72 C256 66 272 66 282 76" fill="none" stroke={INK} strokeWidth="2.5" opacity="0.5" />
      {/* cyan rim from the gate screen */}
      <path d="M152 148 C162 112 206 104 244 120" fill="none" stroke="#19d9ff" strokeWidth="3" opacity="0.8" />
    </svg>
  );
}

/** Dawn skyline, two depths, the Burj as its own form. viewBox 0 0 1600 500 */
export function Skyline({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1600 500" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sk-burj" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a0f2e" />
          <stop offset="0.72" stopColor="#1a0f2e" />
          <stop offset="1" stopColor="#ff9a5a" />
        </linearGradient>
      </defs>
      {/* far ridge of towers, no outline */}
      <path d="M0 500 L0 420 L80 420 L80 380 L140 380 L140 420 L220 420 L220 350 L270 350 L270 420 L360 420 L360 300 L400 300 L400 420 L480 420 L480 390 L560 390 L560 420 L640 420 L640 330 L700 330 L700 420 L1000 420 L1000 360 L1060 360 L1060 420 L1140 420 L1140 300 L1180 300 L1180 420 L1260 420 L1260 380 L1340 380 L1340 420 L1440 420 L1440 340 L1490 340 L1490 420 L1600 420 L1600 500 Z" fill="#6a3d7a" />
      {/* the Burj: stepped setbacks, warm rim on the sun side */}
      <path d="M770 500 L770 300 L784 300 L784 220 L796 220 L796 160 L806 160 L806 110 L814 110 L814 60 L820 60 L820 20 L826 20 L826 60 L832 60 L832 110 L840 110 L840 160 L850 160 L850 220 L862 220 L862 300 L876 300 L876 500 Z" fill="url(#sk-burj)" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M826 60 L832 60 L832 110 L840 110 L840 160 L850 160 L850 220 L862 220 L862 300 L876 300 L876 500 L870 500 L870 306 L856 306 L856 226 L844 226 L844 166 L834 166 L834 116 L826 116 Z" fill="#ff9a5a" opacity="0.7" />
      {/* near blocks with ink line */}
      <path d="M0 500 L0 440 L60 440 L60 400 L120 400 L120 440 L200 440 L200 410 L240 410 L240 440 L330 440 L330 380 L380 380 L380 440 L520 440 L520 410 L600 410 L600 440 L690 440 L690 400 L740 400 L740 440 L900 440 L900 420 L960 420 L960 440 L1040 440 L1040 390 L1090 390 L1090 440 L1220 440 L1220 410 L1290 410 L1290 440 L1380 440 L1380 400 L1440 400 L1440 440 L1600 440 L1600 500 Z" fill="#1a0f2e" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <g fill="#ffb64a" opacity="0.9">
        {Array.from({ length: 70 }, (_, i) => <rect key={i} x={30 + ((i * 97) % 1540)} y={404 + ((i * 37) % 60)} width="5" height="7" opacity={rng(i) > 0.3 ? 1 : 0} />)}
      </g>
      <g fill="#ffe6b0" opacity="0.9">
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={798 + (i % 2) * 20} y={240 + i * 18} width="4" height="6" />)}
      </g>
    </svg>
  );
}

/** Dawn clouds: dark tops, lit undersides, halftone on the underside only. */
export function Clouds({ className = "" }: { className?: string }) {
  const shapes = [
    "M60 120 C80 80 150 70 190 100 C220 70 300 80 310 120 C340 118 360 140 350 160 L50 160 C30 150 36 126 60 120 Z",
    "M420 90 C440 50 520 44 560 80 C590 56 660 66 668 100 C700 100 710 130 690 140 L400 140 C380 128 392 96 420 90 Z",
    "M900 150 C920 110 1000 100 1040 134 C1070 110 1140 120 1150 150 C1180 150 1190 176 1170 186 L880 186 C860 172 870 152 900 150 Z",
    "M1200 70 C1220 36 1290 30 1320 60 C1350 40 1400 50 1406 78 C1430 80 1436 104 1420 112 L1190 112 C1172 100 1178 76 1200 70 Z",
    "M250 220 C266 196 320 190 346 210 C366 196 410 200 416 220 C436 222 440 240 426 246 L240 246 C226 238 232 222 250 220 Z",
  ];
  return (
    <svg className={className} viewBox="0 0 1600 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="cl-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3a80" />
          <stop offset="0.55" stopColor="#6a3d7a" />
          <stop offset="1" stopColor="#ff9a5a" stopOpacity="0.6" />
        </linearGradient>
        <pattern id="cl-ht" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
          <circle cx="3" cy="3" r="1.6" fill={INK} />
        </pattern>
        <linearGradient id="cl-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="cl-m"><rect width="1600" height="300" fill="url(#cl-fade)" /></mask>
      </defs>
      {shapes.map((d, i) => (
        <g key={i} className={`cloud c${i}`}>
          <path d={d} fill="url(#cl-g)" />
          <path d={d} fill="url(#cl-ht)" mask="url(#cl-m)" opacity="0.5" />
        </g>
      ))}
    </svg>
  );
}

/** Kirby krackle: a cluster of dots toggling between two drawn frames. */
function makeDots(seed: number) {
  let x = seed * 9301 + 49297;
  const rnd = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
  const r2 = (v: number) => Math.round(v * 100) / 100;
  return Array.from({ length: 34 }, (_, i) => {
    const a = rnd() * Math.PI * 2, d = Math.pow(rnd(), 0.6) * 46;
    return { cx: r2(50 + Math.cos(a) * d), cy: r2(50 + Math.sin(a) * d), r: r2(1.5 + rnd() * (d < 20 ? 7 : 3.5)), f: i % 2 };
  });
}
const DOTS = [1, 2, 3, 4, 5].map(makeDots);

export function Krackle({ className = "", seed = 1, color = INK }: { className?: string; seed?: number; color?: string }) {
  const dots = DOTS[(seed - 1) % DOTS.length];
  return (
    <svg className={`krackle ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <g className="kf0">{dots.filter((d) => d.f === 0).map((d, i) => <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={color} />)}</g>
      <g className="kf1">{dots.filter((d) => d.f === 1).map((d, i) => <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={color} />)}</g>
    </svg>
  );
}
