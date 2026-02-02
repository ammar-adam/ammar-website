"use client";

const CITIES = [
  [180, 280],
  [350, 220],
  [520, 320],
  [680, 260],
  [850, 340],
  [420, 450],
  [200, 520],
  [600, 520],
  [920, 480],
  [280, 380],
  [750, 400],
  [150, 420],
  [480, 180],
  [820, 220],
];

const CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [1, 5],
  [0, 6],
  [5, 7],
  [4, 8],
  [1, 9],
  [3, 10],
  [0, 11],
  [1, 12],
  [3, 13],
];

const FLIGHT_PATH = "M 180,280 Q 350,180 520,320 T 850,340";

export function GlobeNetwork() {
  return (
    <div
      className="globe-network absolute inset-0 overflow-hidden pointer-events-none opacity-[0.18] motion-reduce:opacity-10"
      aria-hidden
    >
      <svg
        className="network-svg w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className="connection-lines" stroke="rgba(232,166,100,0.12)" strokeWidth="1">
          {CONNECTIONS.map(([a, b], i) => (
            <line
              key={i}
              x1={CITIES[a][0]}
              y1={CITIES[a][1]}
              x2={CITIES[b][0]}
              y2={CITIES[b][1]}
            />
          ))}
        </g>

        <g className="city-dots">
          {CITIES.map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="2.5"
              fill="rgba(232,166,100,0.35)"
            />
          ))}
        </g>

        <path
          id="flight-path-globe"
          className="flight-path motion-reduce:opacity-0"
          d={FLIGHT_PATH}
          fill="none"
          stroke="rgba(232,166,100,0.35)"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          style={{
            animation: "flightPathDraw 22s linear infinite",
          }}
        />

        <g className="airplane-icon motion-reduce:opacity-0" fill="#e8a664" opacity="0.7">
          <animateMotion
            dur="22s"
            repeatCount="indefinite"
            path={FLIGHT_PATH}
          />
          <path d="M 0,-4 L -2,0 L 0,4 L 6,2.5 L 6,-2.5 Z" />
        </g>
      </svg>
    </div>
  );
}
