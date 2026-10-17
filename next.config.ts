import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      { source: "/arrivals/:path*", destination: "/#experience", permanent: false },
      { source: "/projects", destination: "/#projects", permanent: false },
      { source: "/departures/:path*", destination: "/#projects", permanent: false },
      { source: "/resume", destination: "/#resume", permanent: false },
      { source: "/boarding-pass", destination: "/#resume", permanent: false },
      { source: "/about", destination: "/#about", permanent: false },
      { source: "/lounge", destination: "/#about", permanent: false },
      { source: "/terminal", destination: "/", permanent: false },
    ];

  },
};

export default nextConfig;
