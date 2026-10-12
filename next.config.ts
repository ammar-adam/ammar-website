import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      { source: "/arrivals/:path*", destination: "/#windows", permanent: false },
      { source: "/projects", destination: "/#engine", permanent: false },
      { source: "/departures/:path*", destination: "/#engine", permanent: false },
      { source: "/resume", destination: "/#door", permanent: false },
      { source: "/boarding-pass", destination: "/#door", permanent: false },
      { source: "/about", destination: "/#cockpit", permanent: false },
      { source: "/lounge", destination: "/#cockpit", permanent: false },
      { source: "/terminal", destination: "/", permanent: false },
    ];

  },
};

export default nextConfig;
