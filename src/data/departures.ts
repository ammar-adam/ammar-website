/**
 * Departures = Projects as flights.
 * Seat map order: 1A, 1B, 2A, 2B, 3A, 3B (max 6).
 */

export type FlightStatus = "Boarding" | "Boarding Closed" | "Departed" | "Delayed";

export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectSeat {
  id: string;
  label: string;
  content: string;
  links?: ProjectLink[];
}

export interface Project {
  slug: string;
  /** Display name on seat (e.g. "Rocketship") */
  name: string;
  year: string;
  /** Gate panel destination line (e.g. "To the moon!") */
  destination: string;
  flightCode: string;
  routeName: string;
  stackTag?: string;
  gate: string;
  status: FlightStatus;
  shortDesc: string;
  screenshot: string;
  seats: ProjectSeat[];
}

const softwareProjects: Project[] = [
  {
    slug: "rocketship",
    name: "Rocketship",
    year: "2026",
    destination: "To the moon!",
    flightCode: "RS493",
    routeName: "I built an AI equity research tool, then put its results to the test.",
    gate: "A",
    status: "Boarding",
    shortDesc: "I combined stock screening, a 5-agent LLM debate, live news and portfolio optimization. When I ran walk-forward tests, a simple momentum baseline beat the LLM ranker and exposed inflated backtests.",
    screenshot: "/ROCKETSHIP-current.webp",
    seats: [
      {
        id: "main",
        label: "Links",
        content: "",
        links: [
          { label: "View Project", url: "https://rocketshipstocks.vercel.app/" },
          { label: "GitHub", url: "https://github.com/ammar-adam/rocketship" },
          { label: "Demo", url: "https://www.loom.com/share/9df9303e6d7742838730fdc1ff5bff29" },
        ],
      },
    ],
  },
  {
    slug: "canadaclip",
    name: "CanadaClip",
    year: "2026",
    destination: "Canadian SMBs",
    flightCode: "CC24",
    routeName: "iOS App Clip + AI Merchant Dashboard",
    gate: "A",
    status: "Boarding",
    shortDesc: "iOS App Clip that takes the big-brand product links AI assistants recommend and points them to Canadian small businesses instead. Includes merchant onboarding and Gemini product matching.",
    screenshot: "/CANADACLIP.mp4",
    seats: [
      {
        id: "main",
        label: "Links",
        content: "",
        links: [
          { label: "GitHub", url: "https://github.com/ammar-adam/canada-clip-hackcanada" },
          { label: "Demo", url: "https://youtu.be/JzYwfPrcPtM?si=v9hC_aww9t8z7gmK" },
        ],
      },
    ],
  },
  {
    slug: "risk-optimized-equity-system",
    name: "Risk-Optimized Portfolio",
    year: "2025",
    destination: "Low Volatility",
    flightCode: "BETA16",
    routeName: "Portfolio construction for risk-averse investors",
    gate: "C",
    status: "Departed",
    shortDesc: "Portfolio builder for risk-averse investors. Estimates volatility and covariance, then solves for the lowest-risk allocation with convex optimization.",
    screenshot: "/RISKFREE.png",
    seats: [
      {
        id: "main",
        label: "Links",
        content: "",
        links: [
          { label: "GitHub", url: "https://github.com/ammar-adam/risk-optimized-equity-system" },
          { label: "Demo", url: "https://www.loom.com/share/f9d68d48cef5487896156f55c5669271" },
        ],
      },
    ],
  },


  {
    slug: "backseat",
    name: "Backseat",
    year: "2026",
    destination: "Recalculating",
    flightCode: "BKS26",
    routeName: "I made character voices you can install in one tap.",
    gate: "E",
    status: "Boarding",
    shortDesc: "You pick a character, then add its voice to Waze in one tap. I wrote the open-source SDK behind it after reverse-engineering Waze's undocumented voice format. It handles text-to-speech, source separation and round-trip checks across all 43 prompts.",
    screenshot: "/BACKSEAT.png",
    seats: [
      {
        id: "main",
        label: "Links",
        content: "",
        links: [
          { label: "View Project", url: "https://backseatnav.com/" },
          { label: "GitHub", url: "https://github.com/ammar-adam/waze-voice-sdk" },
        ],
      },
    ],
  },
];

export const projects: Project[] = [
  softwareProjects.find(project => project.slug === "backseat")!,
  softwareProjects.find(project => project.slug === "rocketship")!,
  {
    slug: "waterloo-venture", name: "Waterloo Venture Group", year: "", destination: "Student founders",
    flightCode: "WVG01", routeName: "I bring student founders together.", gate: "C", status: "Boarding",
    shortDesc: "I run a student venture community with 1,300+ members. We've helped 30+ students join startups and helped founders raise $13.9M. I help founders with market research and partner introductions, including Smoov's expansion beyond the US.",
    screenshot: "/WATERLOOVG.jpg", stackTag: "COMMUNITY / VENTURE",
    seats: [{ id: "main", label: "Links", content: "", links: [{ label: "Visit WVG", url: "https://www.waterloovg.com/" }] }],
  },
  {
    slug: "waterloo-tech-week", name: "Waterloo Tech Week / Hack the North", year: "", destination: "A week of builders",
    flightCode: "WTW70", routeName: "I helped get a whole city building.", gate: "D", status: "Boarding",
    shortDesc: "I organized Waterloo Tech Week across 70 events, raised $6K+ in sponsorship, and moderated founder conversations.",
    screenshot: "/HTN_ORGANIZER.jpg", stackTag: "COMMUNITY / EVENTS",
    seats: [{ id: "main", label: "Links", content: "", links: [{ label: "Tech Week", url: "https://waterlootechweek.ca/" }, { label: "Hack the North", url: "https://hackthenorth.com/" }, { label: "Techyon", url: "https://techyon.org/" }] }],
  },
];

/** Earlier software projects remain available as source records. */
export const archivedProjects = softwareProjects.filter(project => !projects.some(featured => featured.slug === project.slug));

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
