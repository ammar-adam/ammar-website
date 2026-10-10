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

export const projects: Project[] = [
  {
    slug: "rocketship",
    name: "Rocketship",
    year: "2026",
    destination: "To the moon!",
    flightCode: "RS493",
    routeName: "Multi-agent equity research with honest evals",
    gate: "A",
    status: "Boarding",
    shortDesc: "Equity research system combining screening, a 5-agent LLM debate, live news and portfolio optimization. Then I built walk-forward evals and found a simple momentum baseline beat the LLM ranker, which exposed inflated backtests.",
    screenshot: "/ROCKETSHIP.png",
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
    shortDesc: "Two-sided platform redirecting LLM product links to Canadian small businesses",
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
    name: "Risk-Free Equity System",
    year: "2025",
    destination: "Risk-Free",
    flightCode: "BETA16",
    routeName: "Portfolio construction for risk-averse investors",
    gate: "C",
    status: "Departed",
    shortDesc: "Using volatility and covariance to create a portfolio allocation using convex optimization",
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
    slug: "waze-voice-sdk",
    name: "Waze Voice SDK",
    year: "2026",
    destination: "Recalculating",
    flightCode: "WVS26",
    routeName: "Custom character voices for Waze",
    gate: "E",
    status: "Boarding",
    shortDesc: "Python toolkit that builds custom Waze navigation voice packs from recordings or TTS. Exports all 43 prompts, both unit systems, packed inside Waze's size cap. Seven packs are live.",
    screenshot: "/placeholders/screenshot.svg",
    seats: [
      {
        id: "main",
        label: "Links",
        content: "",
        links: [
          { label: "GitHub", url: "https://github.com/ammar-adam/waze-voice-sdk" },
          { label: "Try Voices", url: "https://claude.ai/code/artifact/02f68bd0-af45-409b-a48a-448810b0f430" },
        ],
      },
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
