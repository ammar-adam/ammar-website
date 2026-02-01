/**
 * Boarding Pass Office = Resume.
 */

export const boardingPassConfig = {
  displayName: "Your Name",
  resumeFileUrl: "/resume.pdf",
  ctaLabel: "Export pass (PDF)",
  sections: [
    {
      title: "Experience",
      items: [
        { role: "Product Engineering", org: "DataStealth", period: "2024", desc: "AEO tooling, automation, ROI dashboards." },
        { role: "Investment Analysis", org: "Alpen Capital", period: "2023", desc: "Deal flow, financial models, due diligence." },
        { role: "Consulting", org: "ACE Consulting Group", period: "2024", desc: "Consulting and analysis." },
      ],
    },
    {
      title: "Education",
      items: [
        { role: "CFM", org: "University of Waterloo", period: "1B term", desc: "Computing and Financial Management." },
      ],
    },
  ],
} as const;
