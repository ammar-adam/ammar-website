/**
 * Arrivals = Experiences. What has landed.
 * status: Bags ready | Bags loading
 */

export interface ArrivalArtifact {
  label: string;
  sublabel?: string;
  type?: "analytics" | "automation" | "presentation" | "finance" | "default";
}

export interface Arrival {
  slug: string;
  from: string;
  title: string;
  /** Used on detail page (e.g. "Product Engineering Intern") */
  detailTitle?: string;
  impact: string;
  details: string;
  status?: "Bags ready" | "Bags loading";
  artifacts?: ArrivalArtifact[];
}

export const arrivals: Arrival[] = [
  {
    slug: "datastealth",
    from: "DataStealth / Cybersecurity Startup",
    title: "Product Engineering",
    detailTitle: "Product Engineering Intern",
    impact: "Built tools to discover, classify, protect, and manage sensitive data.",
    details: "Built AEO tooling and automation systems that compressed demo cycles by 60%. Worked on ROI dashboards and risk posture visualization.",
    status: "Bags ready",
    artifacts: [
      { label: "GEO tooling", type: "automation" },
      { label: "Demo systems", sublabel: "Reducing demo time using real datasets", type: "presentation" },
      { label: "ROI dashboard", sublabel: "Prescriptive analytics for clients", type: "analytics" },
    ],
  },
  {
    slug: "alpen-capital",
    from: "Alpen Capital / M&A",
    title: "Investment Analysis",
    detailTitle: "Investment Banking Summer Analyst",
    impact: "Supported over $50M in financial modeling, valuations, and M&A advisory.",
    details: "Supported $50M+ in deal flow. Built financial models and conducted due diligence across healthcare and tech sectors.",
    status: "Bags ready",
    artifacts: [
      { label: "Financial models", type: "finance" },
      { label: "Pitch materials", type: "finance" },
      { label: "Transaction support", type: "finance" },
    ],
  },
  {
    slug: "ace-consulting",
    from: "ACE Consulting Group",
    title: "Consulting",
    detailTitle: "Consulting Associate",
    impact: "Pro-bono advisory and market research for startups across Ontario.",
    details: "Consulting and analysis work.",
    status: "Bags loading",
    artifacts: [{ label: "Bags still loading. New work arriving soon.", type: "default" }],
  },
  {
    slug: "waterloo-venture",
    from: "Waterloo Venture Group",
    title: "Venture",
    detailTitle: "Ecosystems Partnerships",
    impact: "Helping strengthen the builder ecosystem in Waterloo.",
    details: "Venture and investment work.",
    status: "Bags loading",
    artifacts: [{ label: "Bags still loading. New work arriving soon.", type: "default" }],
  },
];

export function getArrivalBySlug(slug: string): Arrival | undefined {
  return arrivals.find((a) => a.slug === slug);
}
