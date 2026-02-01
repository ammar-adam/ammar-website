/**
 * AFA INTERNATIONAL AIRPORT — Central configuration.
 * Replace placeholders with your content.
 * Tone: calm, human announcements — not corporate signage.
 */

export const siteConfig = {
  airportName: "AFA INTERNATIONAL AIRPORT",
  siteName: "AFA INTERNATIONAL AIRPORT",

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

  checkIn: {
    headline: "Welcome. Where to?",
    subtext: "Choose a section. Take your time.",
    ctaTerminal: "Proceed to Terminal",
    ctaDepartures: "View Departures",
  },
} as const;
