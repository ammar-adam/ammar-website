/**
 * Boarding Pass = Resume. Replace with your resume file and display name.
 */

export const boardingPassConfig = {
  displayName: "[Your Name]",
  resumeFileUrl: "/resume.pdf", // Place your resume PDF in /public
  sections: [
    {
      title: "[Section Title, e.g. Experience]",
      items: [
        { role: "[Role]", org: "[Organization]", period: "[Period]", desc: "[Brief description]" },
      ],
    },
    {
      title: "[Section Title, e.g. Education]",
      items: [
        { role: "[Degree]", org: "[Institution]", period: "[Period]", desc: "[Optional]" },
      ],
    },
  ],
} as const;
