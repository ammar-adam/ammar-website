import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Bangers, Permanent_Marker } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MotionProvider } from "@/components/MotionProvider";
import "./tw.generated.css";
import "./sv-base.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bangers = Bangers({ subsets: ["latin"], weight: "400", variable: "--font-bangers" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-marker" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jb" });

export const metadata: Metadata = {
  title: "Ammar Adam",
  description: "Ammar Adam. CS & Finance at Waterloo. Toronto, Dubai, Karachi.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffb021" },
    { media: "(prefers-color-scheme: dark)", color: "#ffb021" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${bangers.variable} ${marker.variable}`}>
      <body className="font-sans antialiased">
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
