import type { Metadata } from "next";
import { Bebas_Neue, JetBrains_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppShell } from "@/components/AppShell";
import { AirportSignage } from "@/components/AirportSignage";
import { MotionProvider } from "@/components/MotionProvider";
import { siteConfig } from "@/data/site";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-signage",
  subsets: ["latin"],
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Ammar Adam",
  description: "Ammar Adam - Student at UWaterloo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${bebasNeue.variable} ${jetbrainsMono.variable} ${inter.variable} font-sans antialiased terminal-bg`}
      >
        <div className="terminal-bg-ambient" aria-hidden />
        <div className="terminal-windows" aria-hidden />
        <div className="terminal-floor" aria-hidden />
        <AirportSignage />
        <div className="scan-lines" aria-hidden />
        <MotionProvider>
          <AppShell>{children}</AppShell>
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
