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
    slug: "alpen-capital",
    from: "Alpen Capital",
    fromUrl: "https://alpencapital.com/",
    image: "/ALPENCAPITAL.jpg",
    origin: "Dubai",
    title: "M&A Analyst",
    detailTitle: "Mergers & Acquisitions Summer Analyst",
    impact: "Supported $50M+ in deal flow on buy and sell-side equity advisory.",
    details: "Youngest intern there, at 16. Learned financial modelling and investment research.",
    status: "Bags ready",
  },
  {
    slug: "datastealth",
    from: "DataStealth",
    fromUrl: "https://datastealth.io/",
    image: "/DATASTEALTH.jpg",
    origin: "Mississauga",
    title: "Product Engineering",
    detailTitle: "Product Engineering Intern",
    impact: "Shipped a demo environment spanning 8 product capabilities, cutting sales-demo setup from months to hours.",
    details: "Also automated competitor comparisons from 10,000-word research docs, cutting product research time by ~40%.",
    status: "Bags ready",
  },
  {
    slug: "sagard",
    from: "Sagard",
    fromUrl: "https://www.sagard.com/",
    image: "/SAGARD.jpg",
    origin: "Toronto",
    title: "AI Engineer",
    detailTitle: "AI Engineer (Contract) · prev. AI Engineering Intern",
    impact: "Building and shipping AI tools with Legal & Compliance at a $46B AUM asset manager.",
    details: "Leading rollout of a 6-tool Legal AI Hub and extending Doppel, a local-LLM computer-use agent. As an intern, cut KYC package prep from weeks to hours.",
    status: "Bags loading",
  },
  {
    slug: "waterloo-venture",
    from: "Waterloo Venture Group",
    fromUrl: "https://www.waterloovg.com/",
    image: "/WATERLOOVG.jpg",
    origin: "Waterloo",
    title: "Managing Director",
    detailTitle: "Managing Director",
    impact: "Running a 1,300+ member student venture community that has placed 30+ students into startups.",
    details: "Supporting portfolio founders with market research and partner intros, including Smoov's expansion beyond the US.",
    status: "Bags loading",
  },
  {
    slug: "hack-the-north",
    from: "Waterloo Tech Week / Hack the North",
    fromUrl: "https://waterlootechweek.ca/",
    image: "/HTN_ORGANIZER.jpg",
    origin: "Waterloo",
    title: "Organizer",
    detailTitle: "Organizer · Waterloo Tech Week & Hack the North",
    impact: "Organized Waterloo Tech Week across 70 events and designed Hack the North's application and selection rubric.",
    details: "Raised $6K+ with sponsors like Citadel, HRT and Shopify, ran outreach to 60+ companies, and moderated a founder panel and fireside chat.",
    status: "Bags ready",
    links: [
      { label: "Waterloo Tech Week", url: "https://waterlootechweek.ca/" },
      { label: "Hack the North", url: "https://hackthenorth.com/" },
      { label: "Techyon", url: "https://techyon.org/" },
    ],
  },
  {
    slug: "openai",
    from: "OpenAI",
    fromUrl: "https://openai.com/",
    image: "/OPENAI.jpg",
    origin: "San Francisco",
    title: "Founding Builder Lead",
    detailTitle: "Founding Builder Lead",
    impact: "One of 5 selected across North America.",
    details: "Scouting student builders and growing adoption of OpenAI's developer tools.",
    status: "Bags loading",
  },
  {
    slug: "pear-vc",
    from: "Pear VC",
    fromUrl: "https://pear.vc/",
    image: "/PEARVC.jpg",
    origin: "Palo Alto",
    title: "Fellow",
    detailTitle: "Pear VC Fellow",
    impact: "One of ~50 selected from 650+ applicants across 17 campuses.",
    details: "Sourcing and evaluating early-stage startups and founder talent.",
    status: "Bags loading",
  },
];

export function getArrivalBySlug(slug: string): Arrival | undefined {
  return arrivals.find((a) => a.slug === slug);
}

/** Career chronology; community-building work is featured under projects. */
export const careerArrivals = ["alpen-capital", "datastealth", "sagard", "openai", "pear-vc"].map(slug => arrivals.find(item => item.slug === slug)!);
