/**
 * Arrivals = Experiences. What has landed.
 */

export interface Arrival {
  slug: string;
  from: string;
  title: string;
  impact: string;
  details: string;
}

export const arrivals: Arrival[] = [
  {
    slug: "datastealth",
    from: "DataStealth / Cybersecurity Startup",
    title: "Product Engineering",
    impact: "Built AEO tooling and automation systems that compressed demo cycles by 60%. Worked on ROI dashboards and risk posture visualization.",
    details: "Longer description, lessons, outcomes.",
  },
  {
    slug: "alpen-capital",
    from: "Alpen Capital / M&A",
    title: "Investment Analysis",
    impact: "Supported $50M+ in deal flow. Built financial models and conducted due diligence across healthcare and tech sectors.",
    details: "Details placeholder.",
  },
  {
    slug: "ace-consulting",
    from: "ACE Consulting Group",
    title: "Consulting",
    impact: "Consulting and analysis work.",
    details: "Details placeholder.",
  },
  {
    slug: "waterloo-venture",
    from: "Waterloo Venture Group",
    title: "Venture",
    impact: "Venture and investment work.",
    details: "Details placeholder.",
  },
];

export function getArrivalBySlug(slug: string): Arrival | undefined {
  return arrivals.find((a) => a.slug === slug);
}
