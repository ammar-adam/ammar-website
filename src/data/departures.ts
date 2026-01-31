/**
 * Departures = Projects. Add your projects here.
 * Each project appears as a route you can board.
 */

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  city: string;
  routeName: string;
  shortDesc: string;
  screenshot: string; // URL or path to image
  links: ProjectLink[];
  overview: string;
  build: string;
}

export const projects: Project[] = [
  {
    slug: "project-alpha",
    city: "[Destination City A]",
    routeName: "[Project Name / Route]",
    shortDesc: "[One-line description of what this project does]",
    screenshot: "/placeholders/screenshot.svg",
    links: [
      { label: "Live demo", url: "https://example.com" },
      { label: "Repository", url: "https://github.com/example/repo" },
    ],
    overview: "[Brief overview of the project, problem solved, outcome]",
    build: "[Tech stack, approach, notable decisions]",
  },
  {
    slug: "project-beta",
    city: "[Destination City B]",
    routeName: "[Another Project]",
    shortDesc: "[Short description]",
    screenshot: "/placeholders/screenshot.svg",
    links: [
      { label: "Live demo", url: "https://example.com" },
    ],
    overview: "[Overview placeholder]",
    build: "[Build details placeholder]",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
