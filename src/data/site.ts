/**
 * Central site configuration. Replace placeholders with your content.
 */

export const siteConfig = {
  siteName: "[Your Name]",
  tagline: "Welcome, I'll be your tour guide.",

  navLabels: {
    terminal: "Terminal",
    departures: "Departures",
    arrivals: "Arrivals",
    lounge: "Lounge",
    boardingPass: "Boarding Pass",
  },

  socialLinks: {
    github: "https://github.com/yourusername",
    twitter: "https://twitter.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
  },

  themeOptions: {
    primaryText: "neutral-900",
    secondaryText: "neutral-600",
    accent: "neutral-800",
  },
} as const;
