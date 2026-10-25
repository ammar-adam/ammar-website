/* Cel-shaded figures and props drawn as SVG: flat fills, one hard shadow
   tone, 2px ink on the silhouette, a rim only on the lit side in the plate's
   key colour. `mono` renders a drawing in one colour (echo copies). No logos,
   no film stills: the props are paper-cut readings of the things he likes. */

const INK = "#05030c";
const BASE = "#1b1530", SHADE = "#0b0820", HOOD = "#2a2250", HOODS = "#161238", SKIN = "#c98a5c", SKINS = "#9c6440";

/**
 * The kid walking: hood up, headphones over the hood, backpack, rolling
 * suitcase. Legs, arms and bob are driven by CSS on `.kl*`, `.ka*`, `.kb`.
 * viewBox 0 0 260 320
 */
export function Kid({ className = "", mono, rim = "#ffb46a" }: { className?: string; mono?: string; rim?: string }) {
  const m = mono;
  const S = m ? m : INK;
  const F = (fill: string) => (m ? m : fill);
  return (
    <svg className={className} viewBox="0 0 260 320" aria-hidden="true" overflow="visible">
      <g className="kbag">
        <rect x="176" y="178" width="66" height="96" rx="9" fill={F("#b41d4a")} stroke={S} strokeWidth="2.5" />
        <rect x="176" y="178" width="22" height="96" rx="9" fill={F("#7a0f33")} />
        <rect x="186" y="196" width="46" height="6" fill={F(SHADE)} />
        <path d="M194 178 L194 146 L226 146 L226 178" fill="none" stroke={S} strokeWidth="5" strokeLinecap="round" />
        <circle cx="188" cy="279" r="8" fill={F(SHADE)} stroke={S} strokeWidth="2" />
        <circle cx="232" cy="279" r="8" fill={F(SHADE)} stroke={S} strokeWidth="2" />
        <BagTag x={222} y={150} mono={m} />
      </g>
      <g className="kb">
        <g className="kl2">
          <path d="M118 212 C122 240 124 260 128 286 L112 288 C106 262 104 240 100 214 Z" fill={F(SHADE)} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M108 286 L134 284 C140 290 142 298 134 302 L104 302 C100 296 102 290 108 286 Z" fill={F("#f4ecd8")} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        </g>
        <g className="kl1">
          <path d="M136 212 C142 238 150 258 158 284 L140 290 C130 266 124 244 120 216 Z" fill={F(BASE)} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M140 284 L166 280 C174 286 176 294 168 300 L138 302 C132 296 134 288 140 284 Z" fill={F("#f4ecd8")} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        </g>
        <path d="M96 120 C96 102 112 92 132 92 C154 92 170 104 170 124 L174 214 L94 214 Z" fill={F(BASE)} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M96 120 C96 104 108 94 126 92 L124 214 L94 214 Z" fill={F(SHADE)} />
        <path d="M86 128 C80 150 80 180 86 206 L98 206 C92 180 92 150 98 130 Z" fill={F(HOODS)} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M112 100 C120 112 118 140 112 160" fill="none" stroke={S} strokeWidth="4" strokeLinecap="round" />
        <g className="ka2">
          <path d="M104 126 C96 150 92 170 94 192 C94 198 102 200 106 196 C110 176 112 154 118 134 Z" fill={F(SHADE)} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="100" cy="196" rx="8" ry="9" fill={F(SKINS)} stroke={S} strokeWidth="2.5" />
        </g>
        <g className="ka1">
          <path d="M160 128 C178 142 194 148 206 150 C212 151 214 160 206 162 C190 160 172 154 154 142 Z" fill={F(BASE)} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="208" cy="156" rx="9" ry="8" fill={F(SKIN)} stroke={S} strokeWidth="2.5" />
        </g>
        <path d="M94 96 C92 60 112 40 134 40 C158 40 178 60 176 98 C168 94 156 94 148 102 C136 112 118 108 108 100 C104 96 98 96 94 96 Z" fill={F(HOOD)} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M94 96 C92 62 110 42 132 40 C122 50 116 70 116 94 C108 98 100 96 94 96 Z" fill={F(HOODS)} />
        <path d="M100 74 C100 44 160 40 170 74" fill="none" stroke={S} strokeWidth="6" strokeLinecap="round" />
        <rect x="92" y="68" width="16" height="24" rx="6" fill={F("#f4ecd8")} stroke={S} strokeWidth="2.5" />
        <rect x="162" y="68" width="16" height="24" rx="6" fill={F("#f4ecd8")} stroke={S} strokeWidth="2.5" />
        <path d="M118 62 C120 50 128 46 138 46 C152 46 160 56 160 70 C160 86 150 98 138 98 C126 98 118 84 118 62 Z" fill={F(SKIN)} stroke={S} strokeWidth="2.5" />
        <path d="M118 62 C120 50 128 46 138 46 C132 52 128 64 128 78 C128 88 132 94 136 98 C126 98 118 84 118 62 Z" fill={F(SKINS)} />
        {!m && (
          <>
            <path d="M128 50 C136 44 150 46 158 58 C150 54 138 54 130 60 Z" fill={INK} />
            <circle cx="142" cy="70" r="2.4" fill={INK} />
            <circle cx="154" cy="70" r="2.4" fill={INK} />
            <path d="M160 70 C160 86 150 98 138 98" fill="none" stroke={rim} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M170 124 L174 214" fill="none" stroke={rim} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M176 98 C176 76 168 56 152 44" fill="none" stroke={rim} strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
      </g>
    </svg>
  );
}

/** The kid from behind, standing still, bag beside him, watching the plane. viewBox 0 0 300 340 */
export function KidBack({ className = "", rim = "#ffb46a", tag = "" }: { className?: string; rim?: string; tag?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 340" aria-hidden="true" overflow="visible">
      <g className="kbag">
        <rect x="196" y="190" width="74" height="104" rx="9" fill="#b41d4a" stroke={INK} strokeWidth="2.5" />
        <rect x="196" y="190" width="26" height="104" rx="9" fill="#7a0f33" />
        <rect x="208" y="212" width="52" height="6" fill={SHADE} />
        <path d="M214 190 L214 154 L252 154 L252 190" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <circle cx="210" cy="300" r="8" fill={SHADE} stroke={INK} strokeWidth="2" />
        <circle cx="256" cy="300" r="8" fill={SHADE} stroke={INK} strokeWidth="2" />
        <BagTag x={250} y={158} big />
        {tag && (
          <g className="pear-tag">
            <path d="M214 160 L214 176" stroke={INK} strokeWidth="2" />
            <rect x="192" y="176" width="46" height="22" rx="3" fill="#dfe8c8" stroke={INK} strokeWidth="2" />
            <text x="215" y="191" textAnchor="middle" fontFamily="var(--font-jb), monospace" fontSize="8" fontWeight="700" fill={INK} letterSpacing="0.5">{tag}</text>
          </g>
        )}
      </g>
      <path d="M112 222 L108 300 L132 300 L136 222 Z" fill={SHADE} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M140 222 L144 300 L168 300 L166 222 Z" fill={BASE} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M104 300 L136 300 L138 312 L102 312 Z" fill="#f4ecd8" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M142 300 L172 300 L174 312 L140 312 Z" fill="#f4ecd8" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M92 124 C92 102 110 92 138 92 C166 92 186 104 186 128 L190 226 L88 226 Z" fill={BASE} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M92 124 C92 104 106 94 126 92 L124 226 L88 226 Z" fill={SHADE} />
      <rect x="106" y="118" width="66" height="84" rx="12" fill={HOOD} stroke={INK} strokeWidth="2.5" />
      <rect x="106" y="118" width="24" height="84" rx="12" fill={HOODS} />
      <path d="M118 118 L114 98 M160 118 L164 98" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M92 134 C84 160 82 186 86 210 C88 216 98 216 100 210 C100 186 102 160 108 136 Z" fill={SHADE} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M186 134 C194 160 196 186 192 210 C190 216 180 216 178 210 C178 186 176 160 170 136 Z" fill={BASE} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M100 100 C98 60 118 40 140 40 C164 40 184 60 182 100 C170 92 152 90 140 92 C126 92 110 94 100 100 Z" fill={HOOD} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M100 100 C98 62 116 42 138 40 C128 50 122 70 122 94 C112 96 104 98 100 100 Z" fill={HOODS} />
      <path d="M104 78 C104 46 176 46 178 78" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <rect x="96" y="72" width="16" height="24" rx="6" fill="#f4ecd8" stroke={INK} strokeWidth="2.5" />
      <rect x="168" y="72" width="16" height="24" rx="6" fill="#f4ecd8" stroke={INK} strokeWidth="2.5" />
      <path d="M186 128 L190 226" fill="none" stroke={rim} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M182 100 C184 76 176 56 160 44" fill="none" stroke={rim} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Luggage tag on the handle; `.flap` is animated by CSS (wind). */
function BagTag({ x, y, mono, big = false }: { x: number; y: number; mono?: string; big?: boolean }) {
  const s = big ? 1.3 : 1;
  return (
    <g className="bagtag" transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 L0 10" stroke={mono ?? INK} strokeWidth="1.5" />
      <g className="flap" style={{ transformOrigin: "0px 10px" }}>
        <path d="M-8 10 L8 10 L8 34 L0 40 L-8 34 Z" fill={mono ?? "#ffb64a"} stroke={mono ?? INK} strokeWidth="1.5" strokeLinejoin="round" />
        {!mono && <rect x="-5" y="18" width="10" height="2" fill={INK} />}
        {!mono && <rect x="-5" y="23" width="7" height="2" fill={INK} />}
      </g>
    </g>
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

/** The X-ray of the bag: car key, laptop, lanyard, folder. viewBox 0 0 800 300 */
export function XrayBag({ className = "", shown = 4 }: { className?: string; shown?: number }) {
  const C = "#5de9ff";
  const O = "#ff9a3c";
  const vis = (k: number) => (k < shown ? 1 : 0);
  return (
    <svg className={className} viewBox="0 0 800 300" aria-hidden="true">
      <path d="M60 80 C60 56 80 44 110 44 L690 44 C720 44 740 56 740 80 L740 250 C740 272 724 282 700 282 L100 282 C76 282 60 272 60 250 Z" fill={O} fillOpacity="0.14" stroke={O} strokeWidth="3" strokeOpacity="0.8" />
      <path d="M330 44 C330 20 350 12 400 12 C450 12 470 20 470 44" fill="none" stroke={O} strokeWidth="6" strokeOpacity="0.7" />
      <path d="M80 70 L720 70" stroke={O} strokeWidth="2" strokeOpacity="0.5" strokeDasharray="6 5" />
      <g className="xr-item" style={{ opacity: vis(0) }}>
        <rect x="120" y="140" width="48" height="76" rx="10" fill={O} fillOpacity="0.7" stroke={C} strokeWidth="3" transform="rotate(18 144 178)" />
        <rect x="136" y="80" width="16" height="70" fill={C} fillOpacity="0.85" transform="rotate(18 144 178)" />
        <rect x="152" y="90" width="10" height="8" fill={C} transform="rotate(18 144 178)" />
        <rect x="152" y="106" width="10" height="8" fill={C} transform="rotate(18 144 178)" />
      </g>
      <g className="xr-item" style={{ opacity: vis(1) }}>
        <path d="M230 104 L420 96 L426 196 L236 204 Z" fill={C} fillOpacity="0.35" stroke={C} strokeWidth="3" />
        <path d="M244 114 L408 108 L412 184 L250 190 Z" fill={C} fillOpacity="0.5" />
        <path d="M220 206 L440 198 L450 226 L216 232 Z" fill={C} fillOpacity="0.6" stroke={C} strokeWidth="3" />
        <rect x="260" y="124" width="60" height="6" fill={O} fillOpacity="0.8" />
        <rect x="260" y="138" width="110" height="4" fill={O} fillOpacity="0.6" />
      </g>
      <g className="xr-item" style={{ opacity: vis(2) }}>
        <path d="M480 90 C500 140 540 150 560 200" fill="none" stroke={O} strokeWidth="5" strokeOpacity="0.8" strokeLinecap="round" />
        <rect x="540" y="186" width="54" height="72" rx="5" fill={O} fillOpacity="0.5" stroke={O} strokeWidth="3" />
        <rect x="550" y="200" width="34" height="8" fill={C} fillOpacity="0.9" />
        <rect x="550" y="216" width="26" height="5" fill={C} fillOpacity="0.7" />
      </g>
      <g className="xr-item" style={{ opacity: vis(3) }}>
        <path d="M620 120 L720 112 L726 232 L626 240 Z" fill={O} fillOpacity="0.45" stroke={O} strokeWidth="3" />
        <path d="M620 120 L660 114 L668 126 L720 120" fill="none" stroke={O} strokeWidth="3" strokeOpacity="0.9" />
        <rect x="640" y="150" width="56" height="5" fill={C} fillOpacity="0.8" />
        <rect x="640" y="164" width="44" height="5" fill={C} fillOpacity="0.6" />
        <rect x="640" y="178" width="50" height="5" fill={C} fillOpacity="0.6" />
      </g>
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
        <pattern id="tub-ht" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="2.5" cy="2.5" r="1.3" fill={INK} />
        </pattern>
        <linearGradient id="tub-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3342" />
          <stop offset="1" stopColor="#59657a" />
        </linearGradient>
      </defs>
      <path d="M40 0 L520 0 L560 30 L0 30 Z" fill="#7b8699" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M0 30 L560 30 L540 160 L20 160 Z" fill="url(#tub-in)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M40 0 L520 0 L500 24 L60 24 Z" fill="#3a4454" opacity="0.9" />
      <path d="M40 0 L520 0 L500 24 L60 24 Z" fill="url(#tub-ht)" opacity="0.5" />
      <path d="M0 30 L20 160 L540 160 L560 30 L540 34 L522 152 L38 152 L20 34 Z" fill="#1c2330" opacity="0.5" />
    </svg>
  );
}

/* ---------- Props: the interests, never captioned ---------- */

/** A gate TV on a bracket showing a paper-cut bear in a blue duffle coat and a red hat. viewBox 0 0 220 170 */
export function GateTV({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 170" aria-hidden="true">
      <path d="M100 0 L120 0 L120 24 L100 24 Z" fill="#2a2a33" stroke={INK} strokeWidth="2" />
      <rect x="10" y="22" width="200" height="118" rx="6" fill="#0b0918" stroke={INK} strokeWidth="3" />
      <rect x="18" y="30" width="184" height="102" fill="#6fb7d8" />
      <rect x="18" y="104" width="184" height="28" fill="#c9b08f" />
      <ellipse cx="108" cy="78" rx="22" ry="20" fill="#b37a3c" stroke={INK} strokeWidth="2" />
      <circle cx="94" cy="64" r="6" fill="#b37a3c" stroke={INK} strokeWidth="2" />
      <circle cx="122" cy="64" r="6" fill="#b37a3c" stroke={INK} strokeWidth="2" />
      <ellipse cx="108" cy="84" rx="10" ry="7" fill="#d9a46c" />
      <circle cx="108" cy="82" r="3" fill={INK} />
      <circle cx="101" cy="74" r="2" fill={INK} />
      <circle cx="115" cy="74" r="2" fill={INK} />
      <path d="M80 60 C82 48 134 48 136 60 L132 64 L84 64 Z" fill="#d9262c" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M86 96 C86 90 130 90 130 96 L136 128 L80 128 Z" fill="#2b5fa8" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="104" y="100" width="8" height="5" fill="#f4ecd8" stroke={INK} strokeWidth="1" />
      <rect x="104" y="112" width="8" height="5" fill="#f4ecd8" stroke={INK} strokeWidth="1" />
      <rect x="140" y="108" width="24" height="18" rx="2" fill="#6b3f1d" stroke={INK} strokeWidth="2" />
      <path d="M90 140 L130 140 L136 160 L84 160 Z" fill="#2a2a33" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

/** A takeout box with a shawarma wrap, no logo. viewBox 0 0 120 90 */
export function ShawarmaBox({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 90" aria-hidden="true">
      <path d="M8 40 L112 40 L104 84 L16 84 Z" fill="#e9dcc3" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M8 40 L112 40 L104 84 L16 84 Z" fill="#b9a885" opacity="0.35" />
      <path d="M8 40 L20 10 L100 10 L112 40 Z" fill="#f4ecd8" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M30 46 C34 36 86 36 90 46 L84 74 L36 74 Z" fill="#e2b06a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M40 48 C50 44 70 44 80 48 L78 56 L42 56 Z" fill="#a84b2a" />
      <path d="M42 60 L78 60 L76 66 L44 66 Z" fill="#5f9d4a" />
      <circle cx="98" cy="28" r="6" fill="#d9262c" stroke={INK} strokeWidth="1.5" />
    </svg>
  );
}

/** A mango matcha in a clear cup. viewBox 0 0 60 100 */
export function MatchaCup({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 100" aria-hidden="true">
      <path d="M8 16 L52 16 L46 94 L14 94 Z" fill="#f4ecd8" fillOpacity="0.35" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M12 52 L48 52 L46 94 L14 94 Z" fill="#8fbf5a" />
      <path d="M10 30 L50 30 L48 52 L12 52 Z" fill="#f2b84b" />
      <rect x="6" y="10" width="48" height="8" rx="3" fill="#f4ecd8" stroke={INK} strokeWidth="2" />
      <path d="M34 2 L30 60" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M12 52 L48 52" stroke={INK} strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

/** A folded red jersey, "66 ALEXANDER-ARNOLD" on the back. viewBox 0 0 160 120 */
export function Jersey({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 120" aria-hidden="true">
      <path d="M10 30 L40 10 L120 10 L150 30 L136 48 L124 40 L124 110 L36 110 L36 40 L24 48 Z" fill="#c8102e" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M36 40 L36 110 L60 110 L60 44 Z" fill="#8c0a1f" />
      <path d="M40 10 L60 10 C66 20 94 20 100 10 L120 10 L118 14 C100 26 60 26 42 14 Z" fill="#8c0a1f" />
      <text x="82" y="62" textAnchor="middle" fontFamily="var(--font-anton), Impact, sans-serif" fontSize="11" fill="#f4ecd8" letterSpacing="0.5">ALEXANDER-ARNOLD</text>
      <text x="82" y="100" textAnchor="middle" fontFamily="var(--font-anton), Impact, sans-serif" fontSize="40" fill="#f4ecd8">66</text>
    </svg>
  );
}
