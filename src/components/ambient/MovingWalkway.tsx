"use client";

export function MovingWalkway() {
  return (
    <div
      className="terminal-transition w-full py-16 sm:py-20"
      aria-hidden
    >
      <div className="moving-walkway max-w-4xl mx-auto px-4">
        <svg viewBox="0 0 800 120" className="w-full h-auto opacity-40">
          <defs>
            <pattern
              id="beltPattern"
              x="0"
              y="0"
              width="32"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="80"
                stroke="rgba(232,166,100,0.25)"
                strokeWidth="1.5"
              />
            </pattern>
          </defs>
          <rect
            x="0"
            y="35"
            width="800"
            height="50"
            fill="url(#beltPattern)"
            opacity="0.4"
          />
          <line
            x1="0"
            y1="35"
            x2="800"
            y2="35"
            stroke="rgba(232,166,100,0.3)"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="85"
            x2="800"
            y2="85"
            stroke="rgba(232,166,100,0.3)"
            strokeWidth="2"
          />
          <g stroke="#e8a664" strokeWidth="1.5" fill="none" opacity="0.6">
            <path d="M 180,60 L 200,60 L 195,55 M 200,60 L 195,65" />
            <path d="M 400,60 L 420,60 L 415,55 M 420,60 L 415,65" />
            <path d="M 620,60 L 640,60 L 635,55 M 640,60 L 635,65" />
          </g>
        </svg>
        <p className="walkway-label text-center font-mono text-xs text-[var(--accent-warm)] mt-4 uppercase tracking-[0.15em]">
          <span className="label-icon inline-block" aria-hidden>
            →
          </span>{" "}
          Proceeding to Departures
        </p>
      </div>
    </div>
  );
}
