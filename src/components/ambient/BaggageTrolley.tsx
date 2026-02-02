"use client";

export function BaggageTrolley() {
  return (
    <div
      className="baggage-trolley-illustration absolute bottom-8 left-6 sm:left-12 w-36 sm:w-44 opacity-35 pointer-events-none"
      aria-hidden
    >
      <svg viewBox="0 0 180 220" className="w-full h-auto">
        <rect
          x="35"
          y="70"
          width="110"
          height="85"
          fill="none"
          stroke="rgba(232,166,100,0.35)"
          strokeWidth="1.5"
          rx="3"
        />
        <path
          d="M 90,70 L 90,15 L 98,15"
          stroke="rgba(232,166,100,0.35)"
          strokeWidth="2.5"
          fill="none"
        />
        <circle
          cx="55"
          cy="168"
          r="7"
          fill="none"
          stroke="rgba(232,166,100,0.4)"
          strokeWidth="1.5"
        />
        <circle
          cx="125"
          cy="168"
          r="7"
          fill="none"
          stroke="rgba(232,166,100,0.4)"
          strokeWidth="1.5"
        />
        <rect
          x="55"
          y="88"
          width="35"
          height="45"
          fill="rgba(47,55,66,0.5)"
          stroke="rgba(232,166,100,0.25)"
          strokeWidth="1"
          rx="2"
        />
        <rect
          x="100"
          y="96"
          width="30"
          height="38"
          fill="rgba(47,55,66,0.5)"
          stroke="rgba(232,166,100,0.25)"
          strokeWidth="1"
          rx="2"
        />
      </svg>
    </div>
  );
}
