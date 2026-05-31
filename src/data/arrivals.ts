/**
 * Arrivals = Experiences. What has landed.
 */

export interface ArrivalArtifact {
  label: string;
  sublabel?: string;
  type?: "analytics" | "automation" | "presentation" | "finance" | "default";
}

export interface ArrivalLink {
  label: string;
  url: string;
}

export interface Arrival {
  slug: string;
  from: string;
  /** Company/category URL for detail card */
  fromUrl?: string;
  /** Image path for bag card and detail panel (e.g. /WATERLOOVG.jpg) */
  image?: string;
  /** Bag tag text (e.g. "Waterloo", "Mississauga", "Dubai") */
  origin: string;
  title: string;
  detailTitle?: string;
  impact: string;
  /** Single line or short detail (no bullets) */
  details: string;
  status?: "Bags ready" | "Bags loading";
  artifacts?: ArrivalArtifact[];
  /** Optional extra links shown in the detail panel */
  links?: ArrivalLink[];
}

export const arrivals: Arrival[] = [
  {
    slug: "waterloo-venture",
    from: "Waterloo Venture Group",
    fromUrl: "https://www.waterloovg.com/",
    image: "/WATERLOOVG.jpg",
    origin: "Waterloo",
    title: "Partner Innovation",
    detailTitle: "Partner Innovation Lead",
    impact: "Helping portcos raise and turning the Maple Valley into North America's strongest tech hub.",
    details: "Supported our portfolio companies through $8.8M in raises. Still connecting cracked builders.",
    status: "Bags loading",
  },
  {
    slug: "sagard",
    from: "Sagard",
    fromUrl: "https://www.sagard.com/",
    image: "/SAGARD.png",
    origin: "Toronto",
    title: "AI Engineering",
    detailTitle: "AI Engineering Intern",
    impact: "Building internal tooling for a global private equity platform.",
    details: "Currently shipping tools that help teams move faster behind the scenes.",
    status: "Bags loading",
  },
  {
    slug: "hack-the-north",
    from: "Hack the North / Waterloo Tech Week",
    fromUrl: "https://hackthenorth.com/",
    image: "/HTN_ORGANIZER.png",
    origin: "Waterloo",
    title: "Event Organizer",
    detailTitle: "Organizer · Hack the North & Waterloo Tech Week",
    impact: "Helping run two of Waterloo's biggest builder weekends.",
    details: "Organizing through Techyon. Planning logistics, wrangling volunteers, and making sure hackers actually have a good time.",
    status: "Bags ready",
    links: [
      { label: "Techyon", url: "https://techyon.org/" },
      { label: "Hack the North", url: "https://hackthenorth.com/" },
      { label: "Waterloo Tech Week", url: "https://waterlootechweek.ca/" },
    ],
  },
  {
    slug: "ace-consulting",
    from: "ACE Consulting Group",
    fromUrl: "https://www.aceconsultinggroup.ca/",
    image: "/ACECONSULTING.jpg",
    origin: "Waterloo",
    title: "Associate",
    detailTitle: "Consulting Associate",
    impact: "Pro-bono advisory and market research for startups across Ontario.",
    details: "We got really cool quarterzips!",
    status: "Bags loading",
  },
  {
    slug: "datastealth",
    from: "DataStealth",
    fromUrl: "https://datastealth.io/",
    image: "/DATASTEALTH.jpg",
    origin: "Mississauga",
    title: "Product Engineering",
    detailTitle: "Product Engineering Intern",
    impact: "Worked on GEO, dashboards and demos to optimize sales and customer experience.",
    details: "Had the most fun ever building new things.",
    status: "Bags ready",
  },
  {
    slug: "alpen-capital",
    from: "Alpen Capital",
    fromUrl: "https://alpencapital.com/",
    image: "/ALPENCAPITAL.jpg",
    origin: "Dubai",
    title: "M&A Analyst",
    detailTitle: "Mergers & Acquisitions Summer Analyst",
    impact: "Supported $50M+ in deal flow on buy and sell-side equity advisory.",
    details: "Youngest intern @ 16. Learned financial modelling and investment research.",
    status: "Bags ready",
  },
];

export function getArrivalBySlug(slug: string): Arrival | undefined {
  return arrivals.find((a) => a.slug === slug);
}
