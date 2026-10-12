import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      { source: "/arrivals/:path*", destination: "/#bag-drop", permanent: false },
      { source: "/projects", destination: "/#gate", permanent: false },
      { source: "/departures/:path*", destination: "/#gate", permanent: false },
      { source: "/resume", destination: "/#boarding", permanent: false },
      { source: "/boarding-pass", destination: "/#boarding", permanent: false },
      { source: "/about", destination: "/#in-flight", permanent: false },
      { source: "/lounge", destination: "/#in-flight", permanent: false },
      { source: "/terminal", destination: "/", permanent: false },
    ];

  },
};

export default nextConfig;
