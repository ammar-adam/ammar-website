/**
 * Arrivals = Experiences. What has landed.
 * artifacts: optional baggage carousel items (label + image path)
 */

export interface ArrivalArtifact {
  label: string;
  image?: string;
  /** Visual type for gradient card: analytics | automation | presentation | finance | default */
  type?: "analytics" | "automation" | "presentation" | "finance" | "default";
}

export interface Arrival {
  slug: string;
  from: string;
  title: string;
  impact: string;
  details: string;
  artifacts?: ArrivalArtifact[];
}

export const arrivals: Arrival[] = [
  {
    slug: "datastealth",
    from: "DataStealth / Cybersecurity Startup",
    title: "Product Engineering",
    impact: "Built AEO tooling and automation systems that compressed demo cycles by 60%. Worked on ROI dashboards and risk posture visualization.",
    details: "Longer description, lessons, outcomes.",
    artifacts: [
      { label: "ROI Dashboard", type: "analytics" },
      { label: "AEO Tooling", type: "automation" },
      { label: "Demo System", type: "presentation" },
    ],
  },
  {
    slug: "alpen-capital",
    from: "Alpen Capital / M&A",
    title: "Investment Analysis",
    impact: "Supported $50M+ in deal flow. Built financial models and conducted due diligence across healthcare and tech sectors.",
    details: "Details placeholder.",
    artifacts: [
      { label: "Financial Models", type: "finance" },
      { label: "Due Diligence", type: "finance" },
    ],
  },
  {
    slug: "ace-consulting",
    from: "ACE Consulting Group",
    title: "Consulting",
    impact: "Consulting and analysis work.",
    details: "Details placeholder.",
    artifacts: [
      { label: "Analysis", type: "default" },
      { label: "Reports", type: "default" },
    ],
  },
  {
    slug: "waterloo-venture",
    from: "Waterloo Venture Group",
    title: "Venture",
    impact: "Venture and investment work.",
    details: "Details placeholder.",
    artifacts: [
      { label: "Deal Flow", type: "default" },
      { label: "Research", type: "default" },
    ],
  },
];

export function getArrivalBySlug(slug: string): Arrival | undefined {
  return arrivals.find((a) => a.slug === slug);
}
