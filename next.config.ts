import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    // The old multi-page terminal now lives on one page; keep old links working.
    return [
      { source: "/terminal", destination: "/", permanent: false },
      { source: "/arrivals/:path*", destination: "/#departures", permanent: false },
      { source: "/projects", destination: "/#gates", permanent: false },
      { source: "/departures/:path*", destination: "/#gates", permanent: false },
      { source: "/about", destination: "/#lounge", permanent: false },
      { source: "/lounge", destination: "/#lounge", permanent: false },
      { source: "/resume", destination: "/Ammar_Adam.pdf", permanent: false },
      { source: "/boarding-pass", destination: "/#boarding", permanent: false },
    ];
  },
};

export default nextConfig;
