import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    // The old multi-page terminal now lives on one page; keep old links working.
    return [
      { source: "/terminal", destination: "/", permanent: false },
      { source: "/arrivals/:path*", destination: "/#experience", permanent: false },
      { source: "/projects", destination: "/#projects", permanent: false },
      { source: "/departures/:path*", destination: "/#projects", permanent: false },
      { source: "/about", destination: "/#top", permanent: false },
      { source: "/lounge", destination: "/#people", permanent: false },
      { source: "/resume", destination: "/Ammar_Adam.pdf", permanent: false },
      { source: "/boarding-pass", destination: "/#contact", permanent: false },
    ];
  },
};

export default nextConfig;
