/* Bold flat comic drawings: thick ink outlines, posterized fills, halftone
   shading via SVG patterns. All static SVG; motion is applied by the parent. */

const INK = "var(--sv-ink)";
const SW = 6;

export function Halftone({ id, color = INK, size = 7, r = 1.9 }: { id: string; color?: string; size?: number; r?: number }) {
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
      <circle cx={size / 2} cy={size / 2} r={r} fill={color} />
    </pattern>
  );
}

/** Airliner, side view, nose pointing right. viewBox 0 0 440 200 */
export function Plane({ className = "", accent = "var(--sv-red)", id = "pl" }: { className?: string; accent?: string; id?: string }) {
  return (
    <svg className={className} viewBox="0 0 440 200" aria-hidden="true">
      <defs>
        <Halftone id={`${id}-ht`} />
      </defs>
      {/* tail fin */}
      <path d="M52 92 L90 18 L150 18 L128 92 Z" fill={accent} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M62 92 L96 26 L112 26 L84 92 Z" fill={`url(#${id}-ht)`} opacity="0.55" />
      {/* horizontal stabilizer */}
      <path d="M40 112 L95 94 L140 94 L120 118 Z" fill="var(--sv-paper)" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {/* far wing (behind fuselage) */}
      <path d="M200 86 L270 34 L336 34 L292 86 Z" fill="var(--sv-paper)" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M212 84 L270 40 L300 40 L262 84 Z" fill={`url(#${id}-ht)`} opacity="0.4" />
      {/* fuselage */}
      <path d="M34 112 C34 86 60 76 100 76 L330 76 C380 76 412 94 428 114 C412 134 380 150 330 150 L100 150 C60 150 34 138 34 112 Z" fill="var(--sv-paper)" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {/* belly shading */}
      <path d="M44 124 C60 140 80 146 100 146 L330 146 C372 146 400 134 418 118 L420 120 C400 140 372 150 330 150 L100 150 C62 150 44 138 40 124 Z" fill={`url(#${id}-ht)`} />
      {/* cheatline */}
      <path d="M60 128 L396 128 L384 136 L70 136 Z" fill={accent} stroke={INK} strokeWidth="3" />
      {/* cockpit */}
      <path d="M372 88 L396 88 C408 96 416 104 420 112 L372 112 Z" fill="var(--sv-cyan)" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M380 92 L394 92 L396 108 L380 108 Z" fill="var(--sv-paper)" opacity="0.7" />
      {/* windows */}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={112 + i * 27} y="94" width="14" height="16" rx="3" fill="var(--sv-cyan)" stroke={INK} strokeWidth="3" />
      ))}
      {/* door */}
      <rect x="92" y="90" width="14" height="40" rx="3" fill="none" stroke={INK} strokeWidth="3" />
      {/* near wing */}
      <path d="M170 142 L112 190 L212 190 L286 142 Z" fill={accent} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M186 146 L140 184 L176 184 L236 146 Z" fill={`url(#${id}-ht)`} opacity="0.45" />
      {/* engine */}
      <rect x="216" y="150" width="76" height="34" rx="17" fill="var(--sv-paper)" stroke={INK} strokeWidth={SW} />
      <ellipse cx="292" cy="167" rx="8" ry="17" fill={INK} />
      <rect x="226" y="170" width="56" height="10" rx="5" fill={`url(#${id}-ht)`} opacity="0.7" />
    </svg>
  );
}

/** Kid pulling a rolling suitcase. viewBox 0 0 220 260 */
export function Kid({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 260" aria-hidden="true">
      <defs>
        <Halftone id="kid-ht" />
      </defs>
      {/* suitcase */}
      <rect x="128" y="146" width="70" height="88" rx="8" fill="var(--sv-red)" stroke={INK} strokeWidth={SW} />
      <rect x="128" y="190" width="70" height="44" rx="6" fill="url(#kid-ht)" opacity="0.5" />
      <rect x="140" y="160" width="46" height="8" fill={INK} opacity="0.85" />
      <path d="M146 146 L146 118 L180 118 L180 146" fill="none" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx="140" cy="240" r="8" fill={INK} />
      <circle cx="186" cy="240" r="8" fill={INK} />
      {/* legs */}
      <path d="M62 190 L54 244" stroke={INK} strokeWidth="14" strokeLinecap="round" />
      <path d="M86 190 L100 240" stroke={INK} strokeWidth="14" strokeLinecap="round" />
      <path d="M44 246 L66 246" stroke={INK} strokeWidth="12" strokeLinecap="round" />
      <path d="M94 244 L116 240" stroke={INK} strokeWidth="12" strokeLinecap="round" />
      {/* body (hoodie) */}
      <path d="M46 112 C46 96 60 90 74 90 C88 90 104 96 104 112 L108 192 L42 192 Z" fill="var(--sv-amber)" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M50 150 L104 150 L106 190 L44 190 Z" fill="url(#kid-ht)" opacity="0.4" />
      {/* arm to handle */}
      <path d="M104 118 L158 120" stroke={INK} strokeWidth="12" strokeLinecap="round" />
      <path d="M104 118 L156 120" stroke="var(--sv-amber)" strokeWidth="6" strokeLinecap="round" />
      {/* head */}
      <circle cx="74" cy="58" r="34" fill="var(--sv-skin)" stroke={INK} strokeWidth={SW} />
      <path d="M40 54 C44 28 60 20 78 22 C98 24 108 36 108 54 C98 44 86 42 76 44 C62 46 50 46 40 54 Z" fill={INK} />
      <circle cx="64" cy="62" r="3.5" fill={INK} />
      <circle cx="86" cy="62" r="3.5" fill={INK} />
      <path d="M66 76 C72 82 80 82 86 76" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      {/* backpack strap */}
      <path d="M58 96 L50 150" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** Speed lines, horizontal. */
export function SpeedLines({ className = "", n = 7 }: { className?: string; n?: number }) {
  return (
    <svg className={className} viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const y = 10 + (i * 100) / (n - 1);
        const len = 180 + ((i * 97) % 160);
        return <line key={i} x1={400 - len} y1={y} x2={400} y2={y} stroke={INK} strokeWidth={i % 2 ? 3 : 5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}

/** X-ray silhouettes for the four projects. Drawn in cyan on the scanner screen. */
export function XrayIcon({ kind, className = "" }: { kind: "rocket" | "leaf" | "pie" | "car"; className?: string }) {
  const c = "var(--sv-cyan)";
  const o = "var(--sv-xray-orange)";
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

/** Luggage tag shape. */
export function TagShape({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`tag ${className}`}>
      <span className="tag-hole" />
      {children}
    </span>
  );
}

/** Kirby krackle: a cluster of black dots that toggles between two drawn frames. */
function makeDots(seed: number) {
  let x = seed * 9301 + 49297;
  const rnd = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
  return Array.from({ length: 34 }, (_, i) => {
    const a = rnd() * Math.PI * 2, d = Math.pow(rnd(), 0.6) * 46;
    const r2 = (v: number) => Math.round(v * 100) / 100;
    return { cx: r2(50 + Math.cos(a) * d), cy: r2(50 + Math.sin(a) * d), r: r2(1.5 + rnd() * (d < 20 ? 7 : 3.5)), f: i % 2 };
  });
}
const DOTS = [1, 2, 3, 4, 5].map(makeDots);

export function Krackle({ className = "", seed = 1 }: { className?: string; seed?: number }) {
  const dots = DOTS[(seed - 1) % DOTS.length];
  return (
    <svg className={`krackle ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <g className="kf0">{dots.filter((d) => d.f === 0).map((d, i) => <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={INK} />)}</g>
      <g className="kf1">{dots.filter((d) => d.f === 1).map((d, i) => <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={INK} />)}</g>
    </svg>
  );
}
