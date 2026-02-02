"use client";

export function LuggageScatter() {
  return (
    <div
      className="luggage-scatter absolute top-[15%] right-[4%] w-64 h-72 pointer-events-none opacity-25"
      aria-hidden
    >
      <svg
        viewBox="0 0 100 80"
        className="absolute top-0 right-0 w-20 -rotate-6"
      >
        <rect
          x="12"
          y="22"
          width="55"
          height="42"
          fill="rgba(47,55,66,0.35)"
          stroke="rgba(232,166,100,0.22)"
          strokeWidth="1.5"
          rx="2"
        />
        <line
          x1="38"
          y1="22"
          x2="38"
          y2="16"
          stroke="rgba(232,166,100,0.28)"
          strokeWidth="1.5"
        />
      </svg>
      <svg
        viewBox="0 0 80 55"
        className="absolute top-24 right-12 w-16 rotate-[8deg]"
      >
        <rect
          x="18"
          y="18"
          width="45"
          height="32"
          fill="rgba(47,55,66,0.35)"
          stroke="rgba(232,166,100,0.22)"
          strokeWidth="1.5"
          rx="2"
        />
      </svg>
    </div>
  );
}
