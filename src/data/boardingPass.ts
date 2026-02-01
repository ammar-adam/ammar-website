/**
 * Boarding Pass Office = Resume.
 */

export const boardingPassConfig = {
  displayName: "[Your Name]",
  resumeFileUrl: "/resume.pdf",
  sections: [
    {
      title: "[Experience]",
      items: [
        { role: "[Role]", org: "[Org]", period: "[Period]", desc: "[Brief]" },
      ],
    },
    {
      title: "[Education]",
      items: [
        { role: "[Degree]", org: "[Institution]", period: "[Period]", desc: "" },
      ],
    },
  ],
} as const;
