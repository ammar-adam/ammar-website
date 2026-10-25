/* Cel-shaded figures and set pieces drawn as SVG: flat fills, one hard
   shadow tone, 2px ink on the silhouette, a rim only on the lit side in the
   plate's key colour. `mono` renders a drawing in one colour (echo copies). */

const INK = "#05030c";

function rng(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function Defs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={`${id}-ht`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <circle cx="2.5" cy="2.5" r="1.3" fill={INK} />
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

/** Airliner, side view. Nose right unless `flip`. Lit per instance. viewBox 0 0 440 200 */
export function Plane({ className = "", mono, id = "pl", accent, light = "flat", flip = false }: PlaneProps) {
  const m = mono;
  const F = (fill: string) => (m ? m : fill);
  const S = m ? m : INK;
  const sw = 4;
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
        <path d="M40 112 L95 94 L140 94 L120 118 Z" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M200 86 L270 34 L336 34 L292 86 Z" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M34 112 C34 86 60 76 100 76 L330 76 C380 76 412 94 428 114 C412 134 380 150 330 150 L100 150 C60 150 34 138 34 112 Z" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        {!m && (
          <>
            <path d="M44 124 C60 140 80 146 100 146 L330 146 C372 146 400 134 418 118 L420 120 C400 140 372 150 330 150 L100 150 C62 150 44 138 40 124 Z" fill={`url(#${id}-ht)`} opacity="0.8" />
            {light === "ramp" && <path d="M40 118 C60 142 90 150 120 150 L340 150 C380 150 404 136 420 120 L422 124 C404 142 380 152 340 152 L120 152 C86 152 56 144 38 124 Z" fill={`url(#${id}-belly)`} />}
            {light === "ramp" ? (
              <path d="M70 82 C110 78 300 78 380 82 L378 87 C300 83 110 83 72 87 Z" fill="#19d9ff" opacity="0.9" />
            ) : (
              <path d="M70 84 C110 80 300 80 380 84 L376 90 C300 86 110 86 74 90 Z" fill="#fff" opacity="0.7" />
            )}
          </>
        )}
        <path d="M60 128 L396 128 L384 136 L70 136 Z" fill={F(red)} stroke={S} strokeWidth="2" />
        <path d="M372 88 L396 88 C408 96 416 104 420 112 L372 112 Z" fill={F(`url(#${id}-glass)`)} stroke={S} strokeWidth="3" strokeLinejoin="round" />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={112 + i * 27} y="94" width="14" height="16" rx="3" fill={F(light === "gate" && rng(i) > 0.7 ? "#3a3a5a" : win)} stroke={S} strokeWidth="2" />
        ))}
        <rect x="92" y="90" width="14" height="40" rx="3" fill="none" stroke={S} strokeWidth="2" />
        <path d="M170 142 L112 190 L212 190 L286 142 Z" fill={F(red)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        <rect x="216" y="150" width="76" height="34" rx="17" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} />
        <ellipse cx="292" cy="167" rx="8" ry="17" fill={S} />
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

/** Second pose: three-quarter view, nose up, climbing right. viewBox 0 0 520 340 */
export function PlaneClimb({ className = "", mono, id = "pc", outline = false }: { className?: string; mono?: string; id?: string; outline?: boolean }) {
  const m = mono;
  const S = m ? m : INK;
  const F = (fill: string) => (outline ? "none" : m ? m : fill);
  const sw = outline ? 3 : 4;
  return (
    <svg className={className} viewBox="0 0 520 340" aria-hidden="true" overflow="visible">
      {!m && !outline && <Defs id={id} />}
      <g transform="translate(40 40) rotate(-22 220 120) skewY(-5)">
        <path d="M210 92 L300 20 L372 20 L312 92 Z" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M50 96 L92 10 L160 10 L136 96 Z" fill={F(`url(#${id}-red)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M34 120 L96 98 L150 98 L128 128 Z" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M30 118 C30 84 64 72 110 72 L330 72 C392 72 430 98 448 126 C430 160 392 180 330 180 L110 180 C64 180 30 158 30 118 Z" fill={F(`url(#${id}-body)`)} stroke={S} strokeWidth={sw} strokeLinejoin="round" />
        {!m && !outline && (
          <>
            <path d="M40 136 C60 166 90 176 120 176 L330 176 C380 176 414 158 440 134 L442 138 C416 164 380 180 330 180 L120 180 C86 180 56 168 36 140 Z" fill={`url(#${id}-ht)`} />
            <path d="M80 80 C120 76 320 76 400 86 L398 92 C320 82 120 82 82 86 Z" fill="#fff" opacity="0.6" />
          </>
        )}
        <path d="M62 150 L408 150 L396 160 L72 160 Z" fill={F(`url(#${id}-red)`)} stroke={S} strokeWidth="2" />
        <path d="M392 92 L416 92 C430 102 440 114 446 126 L392 120 Z" fill={F(`url(#${id}-glass)`)} stroke={S} strokeWidth="3" strokeLinejoin="round" />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={118 + i * 26} y="100" width="13" height="18" rx="3" fill={F("#ffd36b")} stroke={S} strokeWidth="2" />
        ))}
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

/**
 * The kid: hood up, backpack, rolling suitcase. Filled shapes, tapered limbs,
 * two cel tones and 2px ink; rim on the lit (right) side in `rim`. The walk is
 * six drawings: legs, arms and bob are driven by CSS on `.kl*`, `.ka*`, `.kb`.
 * `mono` renders a silhouette (echo copies). viewBox 0 0 260 320
 */
export function Kid({ className = "", mono, rim = "#ffb46a" }: { className?: string; mono?: string; rim?: string }) {
  const m = mono;
  const S = m ? m : INK;
  const F = (fill: string) => (m ? m : fill);
  const base = "#1b1530", shade = "#0b0820", hood = "#2a2250", hoodShade = "#161238", skin = "#c98a5c", skinShade = "#9c6440";
  return (
    <svg className={className} viewBox="0 0 260 320" aria-hidden="true" overflow="visible">
      <g className="kbag">
        <rect x="176" y="178" width="66" height="96" rx="9" fill={F("#b41d4a")} stroke={S} strokeWidth="2.5" />
        <rect x="176" y="178" width="22" height="96" rx="9" fill={F("#7a0f33")} />
        <rect x="186" y="196" width="46" height="6" fill={F(shade)} />
        <path d="M194 178 L194 146 L226 146 L226 178" fill="none" stroke={S} strokeWidth="5" strokeLinecap="round" />
        <circle cx="188" cy="279" r="8" fill={F(shade)} stroke={S} strokeWidth="2" />
        <circle cx="232" cy="279" r="8" fill={F(shade)} stroke={S} strokeWidth="2" />
      </g>
      <g className="kb">
        <g className="kl2">
          <path d="M118 212 C122 240 124 260 128 286 L112 288 C106 262 104 240 100 214 Z" fill={F(shade)} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M108 286 L134 284 C140 290 142 298 134 302 L104 302 C100 296 102 290 108 286 Z" fill={F("#f4ecd8")} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        </g>
        <g className="kl1">
          <path d="M136 212 C142 238 150 258 158 284 L140 290 C130 266 124 244 120 216 Z" fill={F(base)} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M140 284 L166 280 C174 286 176 294 168 300 L138 302 C132 296 134 288 140 284 Z" fill={F("#f4ecd8")} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        </g>
        <path d="M96 120 C96 102 112 92 132 92 C154 92 170 104 170 124 L174 214 L94 214 Z" fill={F(base)} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M96 120 C96 104 108 94 126 92 L124 214 L94 214 Z" fill={F(shade)} />
        <path d="M86 128 C80 150 80 180 86 206 L98 206 C92 180 92 150 98 130 Z" fill={F(hoodShade)} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M112 100 C120 112 118 140 112 160" fill="none" stroke={S} strokeWidth="4" strokeLinecap="round" />
        <g className="ka2">
          <path d="M104 126 C96 150 92 170 94 192 C94 198 102 200 106 196 C110 176 112 154 118 134 Z" fill={F(shade)} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="100" cy="196" rx="8" ry="9" fill={F(skinShade)} stroke={S} strokeWidth="2.5" />
        </g>
        <g className="ka1">
          <path d="M160 128 C178 142 194 148 206 150 C212 151 214 160 206 162 C190 160 172 154 154 142 Z" fill={F(base)} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="208" cy="156" rx="9" ry="8" fill={F(skin)} stroke={S} strokeWidth="2.5" />
        </g>
        <path d="M94 96 C92 60 112 40 134 40 C158 40 178 60 176 98 C168 94 156 94 148 102 C136 112 118 108 108 100 C104 96 98 96 94 96 Z" fill={F(hood)} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M94 96 C92 62 110 42 132 40 C122 50 116 70 116 94 C108 98 100 96 94 96 Z" fill={F(hoodShade)} />
        <path d="M118 62 C120 50 128 46 138 46 C152 46 160 56 160 70 C160 86 150 98 138 98 C126 98 118 84 118 62 Z" fill={F(skin)} stroke={S} strokeWidth="2.5" />
        <path d="M118 62 C120 50 128 46 138 46 C132 52 128 64 128 78 C128 88 132 94 136 98 C126 98 118 84 118 62 Z" fill={F(skinShade)} />
        {!m && (
          <>
            <path d="M128 50 C136 44 150 46 158 58 C150 54 138 54 130 60 Z" fill={INK} />
            <circle cx="142" cy="70" r="2.6" fill={INK} />
            <circle cx="154" cy="70" r="2.6" fill={INK} />
            <path d="M144 84 C148 88 153 88 157 84" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M160 70 C160 86 150 98 138 98" fill="none" stroke={rim} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M170 124 L174 214" fill="none" stroke={rim} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M176 98 C176 76 168 56 152 44" fill="none" stroke={rim} strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
      </g>
    </svg>
  );
}

/** Hand and sleeve holding the pass, from bottom right, in the kid's cel treatment. viewBox 0 0 420 320 */
export function Hand({ className = "", rim = "#19d9ff" }: { className?: string; rim?: string }) {
  const skin = "#c98a5c", shade = "#9c6440";
  return (
    <svg className={className} viewBox="0 0 420 320" aria-hidden="true" overflow="visible">
      <path d="M180 320 L250 190 L420 230 L420 320 Z" fill="#1b1530" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M180 320 L250 190 L300 202 L240 320 Z" fill="#0b0820" />
      <path d="M232 222 L262 176 L420 214 L420 246 Z" fill="#2a2250" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M150 150 C160 110 210 100 250 120 C300 146 320 190 300 230 C280 270 230 272 200 250 C170 228 140 190 150 150 Z" fill={skin} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M200 250 C230 272 280 270 300 230 C290 252 250 262 214 254 Z" fill={shade} />
      <path d="M150 150 C120 140 96 150 94 170 C92 190 120 198 150 192 Z" fill={skin} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M156 196 C126 192 100 204 102 224 C104 244 134 248 160 238 Z" fill={skin} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M156 196 C126 192 100 204 102 224 C110 212 134 206 160 210 Z" fill={shade} />
      <path d="M230 128 C222 92 236 60 262 56 C292 52 306 86 296 118 C290 140 262 150 240 144 Z" fill={skin} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M230 128 C222 92 236 60 262 56 C250 70 246 96 252 124 C246 134 238 138 240 144 Z" fill={shade} />
      <path d="M152 148 C162 112 206 104 244 120" fill="none" stroke={rim} strokeWidth="2.5" strokeLinecap="round" />
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
      <path d="M60 80 C60 56 80 44 110 44 L690 44 C720 44 740 56 740 80 L740 250 C740 272 724 282 700 282 L100 282 C76 282 60 272 60 250 Z" fill={O} fillOpacity="0.14" stroke={O} strokeWidth="3" strokeOpacity="0.8" />
      <path d="M330 44 C330 20 350 12 400 12 C450 12 470 20 470 44" fill="none" stroke={O} strokeWidth="6" strokeOpacity="0.7" />
      <path d="M80 70 L720 70" stroke={O} strokeWidth="2" strokeOpacity="0.5" strokeDasharray="6 5" />
      <g className="xr-item" style={{ opacity: vis(0) }}>
        <path d="M110 104 L300 96 L306 196 L116 204 Z" fill={C} fillOpacity="0.35" stroke={C} strokeWidth="3" />
        <path d="M124 114 L288 108 L292 184 L130 190 Z" fill={C} fillOpacity="0.5" />
        <path d="M100 206 L320 198 L330 226 L96 232 Z" fill={C} fillOpacity="0.6" stroke={C} strokeWidth="3" />
        <rect x="140" y="124" width="60" height="6" fill={O} fillOpacity="0.8" />
        <rect x="140" y="138" width="110" height="4" fill={O} fillOpacity="0.6" />
        <rect x="140" y="150" width="90" height="4" fill={O} fillOpacity="0.6" />
      </g>
      <g className="xr-item" style={{ opacity: vis(1) }}>
        <rect x="358" y="110" width="76" height="140" rx="12" fill={C} fillOpacity="0.4" stroke={C} strokeWidth="3" transform="rotate(-8 396 180)" />
        <rect x="368" y="124" width="56" height="100" rx="4" fill={O} fillOpacity="0.55" transform="rotate(-8 396 180)" />
        <path d="M382 160 L396 140 L410 160 L404 160 L404 176 L388 176 L388 160 Z" fill={C} fillOpacity="0.9" transform="rotate(-8 396 180)" />
      </g>
      <g className="xr-item" style={{ opacity: vis(2) }}>
        <path d="M470 120 L640 110 L648 230 L478 240 Z" fill={O} fillOpacity="0.45" stroke={O} strokeWidth="3" />
        <path d="M470 120 L520 112 L530 124 L640 118" fill="none" stroke={O} strokeWidth="3" strokeOpacity="0.9" />
        <path d="M494 206 L530 170 L556 190 L590 150 L622 166" fill="none" stroke={C} strokeWidth="4" strokeLinecap="round" />
        <rect x="496" y="130" width="40" height="6" fill={C} fillOpacity="0.8" />
      </g>
      <g className="xr-item" style={{ opacity: vis(3) }}>
        <rect x="660" y="150" width="48" height="76" rx="10" fill={O} fillOpacity="0.7" stroke={C} strokeWidth="3" transform="rotate(18 684 188)" />
        <rect x="676" y="90" width="16" height="70" fill={C} fillOpacity="0.85" transform="rotate(18 684 188)" />
        <rect x="692" y="100" width="10" height="8" fill={C} transform="rotate(18 684 188)" />
        <rect x="692" y="116" width="10" height="8" fill={C} transform="rotate(18 684 188)" />
        <circle cx="684" cy="200" r="6" fill={C} transform="rotate(18 684 188)" />
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
