/**
 * Arrivals = Experiences. What has landed.
 */

export interface ArrivalArtifact {
  label: string;
  sublabel?: string;
  type?: "analytics" | "automation" | "presentation" | "finance" | "default";
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
}

export const arrivals: Arrival[] = [
  {
    slug: "waterloo-venture",
    from: "Waterloo Venture Group",
    fromUrl: "https://www.waterloovg.com/",
    image: "/WATERLOOVG.jpg",
    origin: "Waterloo",
    title: "Ecosystems Partnerships",
    detailTitle: "Ecosystems Partnerships Associate",
    impact: "Turning the Maple Valley into North America's strongest tech hub.",
    details: "Helping startups raise and connecting cracked builders.",
    status: "Bags loading",
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
    from: "Datastealth",
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
