import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MotionProvider } from "@/components/MotionProvider";
import "./tw.generated.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
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
    { media: "(prefers-color-scheme: light)", color: "#f2ede4" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1f28" },
  ],
};

/* Runs before paint so a saved night theme never flashes day first. */
const themeScript = `try{var t=localStorage.getItem("afa-theme");if(t==="night"||t==="day")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="day" data-accent="amber" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
