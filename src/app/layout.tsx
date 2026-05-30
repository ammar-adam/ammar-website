import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AppShell } from "@/components/AppShell";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ammar Adam",
  description: "Ammar Adam - Student at UWaterloo",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-theme="day" data-accent="amber">
      <body className="font-sans antialiased">
        <MotionProvider>
          <AppShell>{children}</AppShell>
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
