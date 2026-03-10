/**
 * Boarding Pass = Resume. Simplified: passenger, from, to, flight, status, barcode only.
 * Add Ammar_Adam.pdf to the public folder for the barcode download.
 */

export const boardingPassConfig = {
  displayName: "Ammar Adam",
  resumeFileUrl: "/Ammar_Adam.pdf",
  ctaLabel: "Scan barcode to view resume",
  from: "YYZ",
  to: "My next adventure",
  flight: "Wandering",
  tagline: "Builder · Innovator · Operator",
} as const;
