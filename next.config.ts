import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/departures", destination: "/projects", permanent: true },
      { source: "/boarding-pass", destination: "/resume", permanent: true },
      { source: "/departures/etf-builder", destination: "/departures/risk-optimized", permanent: true },
      { source: "/departures/cooltogether", destination: "/departures/mycelia", permanent: true },
    ];
  },
};

export default nextConfig;
