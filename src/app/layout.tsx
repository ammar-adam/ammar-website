import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ammar Adam",
  description: "Ammar Adam. CS & Finance at Waterloo. AI Engineer at Sagard, Founding Builder Lead at OpenAI.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#dbe9ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1830" },
  ],
};

/** Apply the saved day/night choice before paint so there's no flash. */
const themeScript = `try{var t=localStorage.getItem("afa-theme");if(t)document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="day" data-accent="amber" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
