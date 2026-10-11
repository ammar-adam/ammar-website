import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      { source: "/projects", destination: "/#projects", permanent: false },
      { source: "/departures/:path*", destination: "/#projects", permanent: false },
      { source: "/arrivals/:path*", destination: "/#work", permanent: false },
      { source: "/about", destination: "/#about", permanent: false },
      { source: "/lounge", destination: "/#about", permanent: false },
      { source: "/terminal", destination: "/", permanent: false },
      { source: "/resume", destination: "/Ammar_Adam.pdf", permanent: false },
      { source: "/boarding-pass", destination: "/Ammar_Adam.pdf", permanent: false },
    ];

  },
};

export default nextConfig;
