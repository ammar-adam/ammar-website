"use client";

export function CheckInDeskIllustration() {
  return (
    <div
      className="checkin-desk-illustration w-full max-w-2xl mx-auto mb-10 opacity-50 pointer-events-none"
      aria-hidden
    >
      <svg viewBox="0 0 800 140" className="w-full h-auto">
        <rect
          x="60"
          y="90"
          width="680"
          height="35"
          fill="none"
          stroke="rgba(232,166,100,0.25)"
          strokeWidth="1.5"
        />
        <path
          d="M 60,90 L 60,125 L 740,125 L 740,90"
          fill="rgba(47,55,66,0.4)"
          stroke="rgba(232,166,100,0.18)"
          strokeWidth="1"
        />
        <line
          x1="320"
          y1="90"
          x2="320"
          y2="55"
          stroke="rgba(232,166,100,0.2)"
          strokeWidth="1.5"
        />
        <line
          x1="480"
          y1="90"
          x2="480"
          y2="55"
          stroke="rgba(232,166,100,0.2)"
          strokeWidth="1.5"
        />
        <text
          x="190"
          y="42"
          fontFamily="var(--font-mono), monospace"
          fontSize="12"
          fill="rgba(232,166,100,0.5)"
        >
          GATES A
        </text>
        <text
          x="395"
          y="42"
          fontFamily="var(--font-mono), monospace"
          fontSize="12"
          fill="rgba(232,166,100,0.5)"
        >
          BAGGAGE
        </text>
        <text
          x="565"
          y="42"
          fontFamily="var(--font-mono), monospace"
          fontSize="12"
          fill="rgba(232,166,100,0.5)"
        >
          LEVEL 2
        </text>
      </svg>
    </div>
  );
}
