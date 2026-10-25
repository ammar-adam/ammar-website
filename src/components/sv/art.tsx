/* Painted, lit comic drawings. Gradients for light, halftone + hatching in the
   shadows, ink lines on top. `mono` renders the whole drawing in one colour,
   which the Chroma wrapper uses for cyan/magenta depth-of-field copies. */

const INK = "#0d0b14";

export function Defs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={`${id}-ht`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
        <circle cx="3" cy="3" r="1.7" fill={INK} />
      </pattern>
      <pattern id={`${id}-hatch`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
        <line x1="0" y1="0" x2="0" y2="7" stroke={INK} strokeWidth="1.2" opacity="0.8" />
      </pattern>
      <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.35" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.85" />
      </linearGradient>
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
    </defs>
  );
}

type MonoProps = { className?: string; mono?: string; id?: string; accent?: string };

/** Airliner, side view, nose right. viewBox 0 0 440 200 */
export function Plane({ className = "", mono, id = "pl", accent }: MonoProps) {
  const m = mono;
  const F = (fill: string) => (m ? m : fill);
  const S = m ? m : INK;
  const sw = m ? 4 : 5;
  const red = accent ?? `url(#${id}-red)`;
  return (
    <svg className={className} viewBox="0 0 440 200" aria-hidden="true" overflow="visible">
      {!m && <Defs id={id} />}
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
          <path d="M70 84 C110 80 300 80 380 84 L376 90 C300 86 110 86 74 90 Z" fill="#fff" opacity="0.7" />
        </>
      )}
      <path d="M60 128 L396 128 L384 136 L70 136 Z" fill={F(red)} stroke={S} strokeWidth="2.5" />
      <path d="M372 88 L396 88 C408 96 416 104 420 112 L372 112 Z" fill={F(`url(#${id}-glass)`)} stroke={S} strokeWidth="3.5" strokeLinejoin="round" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={112 + i * 27} y="94" width="14" height="16" rx="3" fill={F("#ffd36b")} stroke={S} strokeWidth="2.5" />
      ))}
      <rect x="92" y="90" width="14" height="40" rx="3" fill="none" stroke={S} strokeWidth="2.5" />
      <path d="M170 142 L112 190 L212 190 L286 142 Z" fill={F(red)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
      {!m && <path d="M186 146 L140 184 L176 184 L236 146 Z" fill={`url(#${id}-ht)`} opacity="0.45" />}
      <rect x="216" y="150" width="76" height="34" rx="17" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} />
      <ellipse cx="292" cy="167" rx="8" ry="17" fill={S} />
      {!m && <rect x="226" y="170" width="56" height="10" rx="5" fill={`url(#${id}-hatch)`} opacity="0.7" />}
      {/* nav lights */}
      {!m && (
        <>
          <circle cx="92" cy="20" r="4" fill="#ff3b5c" className="navlight" />
          <circle cx="112" cy="190" r="4" fill="#4cff9a" className="navlight" />
        </>
      )}
    </svg>
  );
}

/** Kid pulling a rolling suitcase, lit from the top right. viewBox 0 0 220 260 */
export function Kid({ className = "", mono }: MonoProps) {
  const m = mono;
  const S = m ? m : INK;
  const F = (fill: string) => (m ? m : fill);
  return (
    <svg className={className} viewBox="0 0 220 260" aria-hidden="true">
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
      <path d="M62 190 L54 244" stroke={S} strokeWidth="14" strokeLinecap="round" />
      <path d="M86 190 L100 240" stroke={S} strokeWidth="14" strokeLinecap="round" />
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
          <path d="M44 66 C46 78 54 86 62 90" fill="none" stroke={INK} strokeWidth="2" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

/** Long terminal building: glass façade, lit windows, roof, tower. viewBox 0 0 1600 420 */
export function Terminal({ className = "", mono, id = "tm" }: MonoProps) {
  const m = mono;
  const S = m ? m : INK;
  const F = (fill: string) => (m ? m : fill);
  return (
    <svg className={className} viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {!m && (
        <defs>
          <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a2f6b" />
            <stop offset="1" stopColor="#120f24" />
          </linearGradient>
          <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffb64a" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#ff7a3d" stopOpacity="0.75" />
            <stop offset="1" stopColor="#5d2a6e" stopOpacity="0.9" />
          </linearGradient>
          <pattern id={`${id}-win`} width="34" height="40" patternUnits="userSpaceOnUse">
            <rect x="4" y="6" width="26" height="28" fill="#ffd27a" opacity="0.9" />
          </pattern>
          <pattern id={`${id}-mull`} width="60" height="400" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="4" height="400" fill={INK} opacity="0.8" />
          </pattern>
          <pattern id={`${id}-ht`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
            <circle cx="3.5" cy="3.5" r="2" fill={INK} />
          </pattern>
          <pattern id={`${id}-hatch`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
            <line x1="0" y1="0" x2="0" y2="8" stroke={INK} strokeWidth="1.3" />
          </pattern>
          <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.2" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id={`${id}-m`}>
            <rect width="1600" height="420" fill={`url(#${id}-fade)`} />
          </mask>
        </defs>
      )}
      {/* tower */}
      <rect x="1290" y="60" width="40" height="200" fill={F(`url(#${id}-wall)`)} stroke={S} strokeWidth="5" />
      <path d="M1260 60 L1360 60 L1350 110 L1270 110 Z" fill={F(`url(#${id}-glass)`)} stroke={S} strokeWidth="5" strokeLinejoin="round" />
      <path d="M1250 30 L1370 30 L1360 62 L1260 62 Z" fill={F("#2a2250")} stroke={S} strokeWidth="5" strokeLinejoin="round" />
      {!m && <circle cx="1310" cy="18" r="5" fill="#ff3b5c" className="navlight" />}
      {/* roof */}
      <path d="M40 180 Q800 90 1560 180 L1560 200 Q800 112 40 200 Z" fill={F("#201a3a")} stroke={S} strokeWidth="5" strokeLinejoin="round" />
      {/* glass hall */}
      <rect x="60" y="196" width="1480" height="190" fill={F(`url(#${id}-glass)`)} stroke={S} strokeWidth="5" />
      {!m && (
        <>
          <rect x="60" y="196" width="1480" height="190" fill={`url(#${id}-win)`} opacity="0.55" />
          <rect x="60" y="196" width="1480" height="190" fill={`url(#${id}-mull)`} />
          <rect x="60" y="196" width="1480" height="190" fill={`url(#${id}-ht)`} mask={`url(#${id}-m)`} opacity="0.75" />
        </>
      )}
      {/* base / curb */}
      <rect x="40" y="384" width="1520" height="36" fill={F("#0f0c1c")} stroke={S} strokeWidth="5" />
      {!m && <rect x="40" y="384" width="1520" height="36" fill={`url(#${id}-hatch)`} opacity="0.6" />}
      {/* columns */}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={110 + i * 190} y="196" width="18" height="190" fill={F("#15112a")} stroke={S} strokeWidth="4" />
      ))}
    </svg>
  );
}

/** A lit gate / lane sign post. */
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

/** X-ray silhouettes for the four projects. */
export function XrayIcon({ kind, className = "" }: { kind: "rocket" | "leaf" | "pie" | "car"; className?: string }) {
  const c = "#5de9ff";
  const o = "#ff9a3c";
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      {kind === "rocket" && (
        <g stroke={c} strokeWidth="5" strokeLinejoin="round" fill="none">
          <path d="M60 10 C80 30 84 62 76 86 L44 86 C36 62 40 30 60 10 Z" fill={c} fillOpacity="0.25" />
          <circle cx="60" cy="50" r="9" fill={o} fillOpacity="0.8" />
          <path d="M44 70 L26 90 L44 86 Z" fill={c} fillOpacity="0.5" />
          <path d="M76 70 L94 90 L76 86 Z" fill={c} fillOpacity="0.5" />
          <path d="M50 86 L60 110 L70 86" fill={o} fillOpacity="0.8" />
        </g>
      )}
      {kind === "leaf" && (
        <g stroke={c} strokeWidth="5" strokeLinejoin="round" fill={c} fillOpacity="0.3">
          <path d="M60 12 L68 30 L80 24 L76 46 L96 40 L88 58 L104 66 L72 78 L76 92 L64 86 L64 110 L56 110 L56 86 L44 92 L48 78 L16 66 L32 58 L24 40 L44 46 L40 24 L52 30 Z" />
          <circle cx="60" cy="60" r="12" fill={o} fillOpacity="0.85" stroke="none" />
        </g>
      )}
      {kind === "pie" && (
        <g stroke={c} strokeWidth="5" fill="none">
          <circle cx="60" cy="60" r="42" fill={c} fillOpacity="0.2" />
          <path d="M60 60 L60 18 A42 42 0 0 1 100 48 Z" fill={o} fillOpacity="0.8" />
          <path d="M60 60 L100 48 A42 42 0 0 1 88 92 Z" fill={c} fillOpacity="0.5" />
          <path d="M22 100 L40 82 L56 92 L78 70 L98 84" stroke={o} strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {kind === "car" && (
        <g stroke={c} strokeWidth="5" strokeLinejoin="round" fill="none">
          <circle cx="60" cy="60" r="44" fill={c} fillOpacity="0.2" />
          <circle cx="60" cy="60" r="12" fill={o} fillOpacity="0.85" />
          <path d="M18 56 L48 60 M72 60 L102 56 M60 72 L60 104" strokeWidth="9" />
          <path d="M24 44 C40 34 80 34 96 44" strokeWidth="6" strokeLinecap="round" />
        </g>
      )}
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
