"use client";

export function LoungeFurniture() {
  return (
    <div
      className="lounge-furniture absolute inset-0 pointer-events-none opacity-20"
      aria-hidden
    >
      <svg
        viewBox="0 0 140 170"
        className="furniture-chair absolute bottom-[8%] left-[4%] w-28 sm:w-32 -rotate-[8deg]"
      >
        <path
          d="M 28,55 L 28,125 L 45,125 L 45,142 L 95,142 L 95,125 L 112,125 L 112,55 L 102,55 L 102,38 L 38,38 L 38,55 Z"
          fill="rgba(47,55,66,0.25)"
          stroke="rgba(232,166,100,0.18)"
          strokeWidth="1.5"
        />
      </svg>
      <svg
        viewBox="0 0 90 90"
        className="furniture-table absolute bottom-[12%] right-[12%] w-20"
      >
        <ellipse
          cx="45"
          cy="28"
          rx="38"
          ry="7"
          fill="rgba(47,55,66,0.25)"
          stroke="rgba(232,166,100,0.18)"
          strokeWidth="1"
        />
        <rect
          x="41"
          y="28"
          width="8"
          height="45"
          fill="rgba(47,55,66,0.25)"
          stroke="rgba(232,166,100,0.18)"
          strokeWidth="1"
        />
      </svg>
      <svg
        viewBox="0 0 70 100"
        className="furniture-plant absolute top-[18%] right-[6%] w-16"
      >
        <path
          d="M 22,78 L 18,95 L 52,95 L 48,78 Z"
          fill="rgba(47,55,66,0.35)"
          stroke="rgba(232,166,100,0.18)"
          strokeWidth="1"
        />
        <path
          d="M 35,78 Q 26,60 30,42"
          stroke="rgba(102,187,106,0.28)"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M 35,78 Q 44,60 40,42"
          stroke="rgba(102,187,106,0.28)"
          strokeWidth="2.5"
          fill="none"
        />
      </svg>
    </div>
  );
}
