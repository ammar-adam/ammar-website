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
    impact: "I supported $50M+ in deal flow on buy- and sell-side equity advisory.",
    details: "I joined at sixteen as the firm's youngest intern and learned financial modelling and investment research.",
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
    impact: "I built a demo environment covering 8 product capabilities, bringing setup time down from months to hours.",
    details: "I also automated competitor comparisons from 10,000-word research documents, cutting product research time by about 40%.",
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
    impact: "I build AI tools for the legal and compliance team at Sagard, a $46B AUM asset manager.",
    details: "I'm leading the rollout of a 6-tool Legal AI Hub and extending Doppel, a computer-use agent powered by a local LLM. As an intern, I cut KYC package prep from weeks to hours.",
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
    impact: "I run a student venture community with 1,300+ members. We've helped 30+ students join startups and helped founders raise $13.9M.",
    details: "I help founders with market research and partner introductions, including Smoov's expansion beyond the US.",
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
    impact: "I organized Waterloo Tech Week across 70 events.",
    details: "I raised $6K+ from sponsors including Citadel, HRT and Shopify, reached out to 60+ companies, and moderated a founder panel and fireside chat.",
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
    impact: "I'm one of 5 Founding Builder Leads selected across North America.",
    details: "I find student builders and help them get started with OpenAI's developer tools.",
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
    impact: "At Pear, I help early-stage founders.",
    details: "I scout early-stage startups and evaluate their teams.",
    status: "Bags loading",
  },
];

export function getArrivalBySlug(slug: string): Arrival | undefined {
  return arrivals.find((a) => a.slug === slug);
}

/** Career chronology; community-building work is featured under projects. */
export const careerArrivals = ["alpen-capital", "datastealth", "sagard", "openai", "pear-vc"].map(slug => arrivals.find(item => item.slug === slug)!);
