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

  /** Top ticker: personal identifiers (cities, school, etc.) */
  tickerIdentifiers: [
    "CS + Finance",
    "UW 1B",
    "Toronto",
    "Dubai",
    "Karachi",
    "CFM",
  ],

  /** Hero background image (optional). Add /hero-airport.jpg to public. */
  heroImageUrl: "/hero-airport.jpg",

  /** Lounge photo (optional). Add /photo.jpg to public and set to "/photo.jpg". */
  photoUrl: "" as string,

  /** Caption shown below lounge photo when photoUrl is set. */
  photoCaption: {
    name: "",
    subtitle: "CS + Finance · UW 1B",
  },
} as const;
