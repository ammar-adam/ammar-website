import type { PartId } from "./parts";

/**
 * Side view of an airliner, nose to the right. Each clickable part is its own
 * group so it can light up on hover. Coordinates live in a 1200 x 440 box.
 */
export function PlaneArt({
  hovered,
  onHover,
  onPick,
}: {
  hovered: PartId | null;
  onHover: (part: PartId | null) => void;
  onPick: (part: PartId) => void;
}) {
  const part = (id: PartId) => ({
    className: `pp${hovered === id ? " on" : ""}`,
    onMouseEnter: () => onHover(id),
    onMouseLeave: () => onHover(null),
    onClick: () => onPick(id),
    role: "button" as const,
    tabIndex: 0,
    "aria-label": id,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onPick(id);
      }
    },
    onFocus: () => onHover(id),
    onBlur: () => onHover(null),
  });

  const windows = Array.from({ length: 22 }, (_, i) => 330 + i * 27);

  return (
    <svg className="plane-art" viewBox="0 0 1200 440" aria-label="An airplane. Pick a part to explore.">
      <defs>
        <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--pl-body-hi)" />
          <stop offset="0.55" stopColor="var(--pl-body)" />
          <stop offset="1" stopColor="var(--pl-body-lo)" />
        </linearGradient>
        <linearGradient id="belly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--pl-belly-hi)" />
          <stop offset="1" stopColor="var(--pl-belly-lo)" />
        </linearGradient>
        <linearGradient id="wing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--pl-wing-hi)" />
          <stop offset="1" stopColor="var(--pl-wing-lo)" />
        </linearGradient>
        <linearGradient id="nacelle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--pl-body-hi)" />
          <stop offset="1" stopColor="var(--pl-body-lo)" />
        </linearGradient>
        <clipPath id="fuse-clip">
          <path d={FUSELAGE} />
        </clipPath>
      </defs>

      {/* far wing, behind the body */}
      <path d="M640 214 L700 214 L560 150 L532 150 Z" fill="var(--pl-wing-far)" />
      {/* far stabilizer */}
      <path d="M150 168 L196 168 L120 128 L104 128 Z" fill="var(--pl-wing-far)" />

      {/* TAIL */}
      <g {...part("tail")}>
        <path className="pp-shape" d="M112 172 L60 42 C58 36 62 32 68 32 L104 32 C112 32 118 36 122 42 L258 172 Z" fill="url(#body)" />
        <path d="M70 46 L106 46 L196 150 L140 150 Z" fill="var(--accent)" opacity="0.92" />
        <text x="128" y="98" className="tail-mark" textAnchor="middle" dominantBaseline="central" transform="rotate(52.4 128 98)">AFA</text>
      </g>

      {/* FUSELAGE */}
      <path d={FUSELAGE} fill="url(#body)" />
      <g clipPath="url(#fuse-clip)">
        <rect x="0" y="236" width="1200" height="80" fill="url(#belly)" />
        <rect x="0" y="232" width="1200" height="5" fill="var(--accent)" opacity="0.9" />
        <rect x="0" y="240" width="1200" height="1.5" fill="var(--accent)" opacity="0.5" />
      </g>
      <path d={FUSELAGE} fill="none" stroke="var(--pl-line)" strokeWidth="1.2" />

      {/* WINDOWS */}
      <g {...part("windows")}>
        <rect className="pp-hit" x="318" y="178" width="610" height="36" rx="8" />
        {windows.map((x) => (
          <rect key={x} className="win" x={x} y="186" width="13" height="19" rx="6.5" />
        ))}
      </g>

      {/* DOOR (front) */}
      <g {...part("door")}>
        <rect className="pp-hit" x="958" y="168" width="44" height="90" rx="8" />
        <rect className="pp-shape door" x="968" y="176" width="26" height="70" rx="6" />
        <circle cx="989" cy="212" r="2" fill="var(--pl-line)" />
      </g>
      {/* rear door, decorative */}
      <rect x="268" y="180" width="22" height="60" rx="5" fill="none" stroke="var(--pl-line)" strokeWidth="1.2" />

      {/* COCKPIT */}
      <g {...part("cockpit")}>
        <path className="pp-hit" d="M1030 170 L1150 170 L1170 230 L1030 230 Z" />
        <path className="pp-shape cockpit-glass" d="M1052 190 L1082 186 L1100 186 C1112 187 1124 193 1132 202 L1060 204 Z" />
        <path d="M1081 186 L1083 204 M1103 187 L1104 203" stroke="var(--pl-body)" strokeWidth="2.5" />
      </g>

      {/* NEAR WING */}
      <path d="M560 236 L700 236 L512 372 C508 378 500 380 494 380 L470 380 C462 380 458 374 462 368 Z" fill="url(#wing)" stroke="var(--pl-line)" strokeWidth="1" />
      <path d="M470 380 L494 380 L486 392 L466 392 Z" fill="var(--pl-wing-lo)" />

      {/* ENGINE */}
      <g {...part("engine")}>
        <rect className="pp-hit" x="520" y="250" width="200" height="90" rx="20" />
        <path d="M600 262 L640 262 L626 286 L606 286 Z" fill="var(--pl-wing-lo)" />
        <path className="pp-shape" d="M548 284 L690 284 C702 284 710 294 710 308 C710 322 702 332 690 332 L560 332 C548 332 538 322 538 308 C538 294 540 284 548 284 Z" fill="url(#nacelle)" stroke="var(--pl-line)" strokeWidth="1" />
        <ellipse cx="704" cy="308" rx="9" ry="24" fill="var(--pl-intake)" />
        <ellipse cx="705" cy="308" rx="4" ry="12" fill="var(--pl-intake-in)" />
        <path d="M538 300 L524 302 L524 314 L538 316 Z" fill="var(--pl-wing-lo)" />
        <rect x="560" y="290" width="120" height="3" rx="1.5" fill="var(--accent)" opacity="0.85" />
      </g>

      {/* near stabilizer */}
      <path d="M150 214 L230 214 L118 250 C114 252 108 252 106 248 L104 244 Z" fill="url(#wing)" stroke="var(--pl-line)" strokeWidth="1" />
    </svg>
  );
}

/** Fuselage outline: tail on the left, rounded nose on the right. */
const FUSELAGE =
  "M118 170 C150 162 210 160 300 160 L1010 160 C1080 160 1132 176 1160 204 C1168 212 1168 222 1158 230 C1132 252 1084 262 1010 262 L300 262 C228 262 176 252 132 230 C104 216 92 190 118 170 Z";
