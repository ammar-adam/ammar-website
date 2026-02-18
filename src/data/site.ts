/**
 * AFA INTERNATIONAL AIRPORT — Central configuration.
 * Replace placeholders with your content.
 * Tone: calm, human announcements — not corporate signage.
 */

/** Canonical site URL for webring. Set NEXT_PUBLIC_SITE_URL or replace this so prev/next point to your registered site. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ammar.vercel.app";

export const siteConfig = {
  airportName: "AFA INTERNATIONAL AIRPORT",
  siteName: "AFA INTERNATIONAL AIRPORT",
  siteUrl,

  /** uwaterloo.network webring — set your id after joining (https://github.com/Shayaan-Azeem/waterloo.network). */
  uwaterlooNetworkUserId: undefined as string | undefined,

  navLabels: {
    projects: "Projects",
    arrivals: "Experiences",
    about: "About Me",
    resume: "Resume",
  },

  /** Landing hero: one clear sentence. */
  heroOneLiner: "Hi, I'm Ammar. I study CS & Finance at UWaterloo. Welcome to AFA International.",

  socialLinks: {
    email: "mailto:ammar.adam@uwaterloo.ca",
    github: "https://github.com/ammar-adam",
    linkedin: "https://www.linkedin.com/in/ammar-adam/",
    x: "https://x.com/ammaradam_5807?s=11",
  },

  checkIn: {
    ctaTerminal: "Enter Terminal",
    ctaDepartures: "View Departures",
  },

  /** Top ticker: floating taglines */
  tickerIdentifiers: [
    "Computer Science and Finance at the University of Waterloo",
    "Toronto, Dubai, Karachi",
    "Building systems and startups",
    "Food, travel, learning as I go",
  ],

  /** Hero background image (optional). Add /hero-airport.jpg to public. */
  heroImageUrl: "/hero-airport.jpg",

  /** Intro boarding pass (beside headshot on check-in) */
  introBoardingPass: {
    passenger: "Ammar Adam",
    program: "Computer Science and Finance",
    institution: "University of Waterloo",
    focus: "Systems, startups, fintech",
    currentStatus: "In progress",
  },

  /** Check-in main intro paragraphs */
  checkInIntro: [
    "Hi, I'm Ammar Adam.",
    "Welcome to AFA International Airport.",
    "I structured this site like a terminal because most of my life feels like movement. Between cities, ideas, projects, and different phases of learning.",
    "There is no fixed path here.",
    "Some sections show what I am building.",
    "Some show what I have already done.",
    "Some are just there if you want to look around.",
    "If you want the short version, it is on the boarding pass next to this page.",
    "Everything else is optional.",
  ],

  /** Lounge photo (optional). Add /photo.jpg to public and set to "/photo.jpg". */
  photoUrl: "" as string,

  /** Caption shown below lounge photo when photoUrl is set. */
  photoCaption: {
    name: "",
    subtitle: "CS + Finance · UW 1B",
  },
} as const;
