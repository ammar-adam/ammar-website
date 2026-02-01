/**
 * Departures = Projects as flights.
 * Each project appears as a flight preparing to depart.
 * Seatmap sections: A1=Overview, A2=Problem, B1=Tech, B2=Architecture, C1=Demo, C2=Links
 */

export type FlightStatus = "Boarding" | "Ready" | "Scheduled";

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  destination: string;
  flightCode: string;
  routeName: string;
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
    slug: "project-alpha",
    destination: "[Destination City A]",
    flightCode: "AF 571",
    routeName: "[Project Name / Route]",
    gate: "A12",
    status: "Boarding",
    shortDesc: "[One-line description]",
    screenshot: "/placeholders/screenshot.svg",
    links: [
      { label: "Live demo", url: "https://example.com" },
      { label: "Repository", url: "https://github.com/example/repo" },
    ],
    overview: "[Brief overview]",
    build: "[Tech stack, approach]",
    problem: "[Problem or context]",
    architecture: "[Architecture notes]",
  },
  {
    slug: "project-beta",
    destination: "[Destination City B]",
    flightCode: "AF 241",
    routeName: "[Another Project]",
    gate: "B7",
    status: "Scheduled",
    shortDesc: "[Short description]",
    screenshot: "/placeholders/screenshot.svg",
    links: [{ label: "Live demo", url: "https://example.com" }],
    overview: "[Overview placeholder]",
    build: "[Build details placeholder]",
    problem: "[Problem placeholder]",
    architecture: "[Architecture placeholder]",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
