/**
 * Departures = Projects as flights.
 * Seatmap: A1=Overview, A2=Problem, B1=Tech, B2=Architecture, C1=Demo, C2=Reflection
 * Status: BOARDING (live), SCHEDULED (planned), DEPARTED (shipped), DELAYED (paused), TAXIING (in progress)
 */

export type FlightStatus = "Boarding" | "Scheduled" | "Departed" | "Delayed" | "Taxiing";

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  year: string;
  destination: string;
  flightCode: string;
  routeName: string;
  stackTag: string;
  gate: string;
  status: FlightStatus;
  shortDesc: string;
  screenshot: string;
  links: ProjectLink[];
  overview: string;
  build: string;
  problem?: string;
  architecture?: string;
}

export const projects: Project[] = [
  {
    slug: "rocketship",
    year: "2026",
    destination: "RocketShip",
    flightCode: "AF 571",
    routeName: "Multi-agent equity research",
    stackTag: "Python / FastAPI / Claude",
    gate: "A12",
    status: "Boarding",
    shortDesc: "Multi-agent equity research platform.",
    screenshot: "/placeholders/screenshot.svg",
    links: [
      { label: "Live demo", url: "https://example.com" },
      { label: "Repository", url: "https://github.com/example/repo" },
    ],
    overview: "Multi-agent system for equity research and analysis.",
    build: "Python, FastAPI, Claude.",
    problem: "Context placeholder.",
    architecture: "Architecture notes.",
  },
  {
    slug: "zarf",
    year: "2025",
    destination: "ZARF",
    flightCode: "AF 241",
    routeName: "Automated report generation",
    stackTag: "Python / React",
    gate: "A8",
    status: "Departed",
    shortDesc: "Automated reporting tooling.",
    screenshot: "/placeholders/screenshot.svg",
    links: [{ label: "Live demo", url: "https://example.com" }],
    overview: "Overview placeholder.",
    build: "Build details placeholder.",
    problem: "Problem placeholder.",
    architecture: "Architecture placeholder.",
  },
  {
    slug: "etf-builder",
    year: "2025",
    destination: "ETF Portfolio Builder",
    flightCode: "AF 312",
    routeName: "Portfolio construction",
    stackTag: "Python / Pandas",
    gate: "B3",
    status: "Scheduled",
    shortDesc: "ETF portfolio analysis and construction.",
    screenshot: "/placeholders/screenshot.svg",
    links: [],
    overview: "Overview placeholder.",
    build: "Build details placeholder.",
  },
  {
    slug: "dollar-seeds",
    year: "2024",
    destination: "Dollar Seeds",
    flightCode: "AF 105",
    routeName: "Micro-investing",
    stackTag: "React / Node",
    gate: "B7",
    status: "Departed",
    shortDesc: "Micro-investing app.",
    screenshot: "/placeholders/screenshot.svg",
    links: [],
    overview: "Overview placeholder.",
    build: "Build details placeholder.",
  },
  {
    slug: "cooltogether",
    year: "2024",
    destination: "CoolTogether / Mycelia",
    flightCode: "AF 089",
    routeName: "Social impact platform",
    stackTag: "React / Firebase",
    gate: "C2",
    status: "Departed",
    shortDesc: "Social impact and community platform.",
    screenshot: "/placeholders/screenshot.svg",
    links: [],
    overview: "Overview placeholder.",
    build: "Build details placeholder.",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
