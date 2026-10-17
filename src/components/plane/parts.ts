/** Sections of the homepage, in nav order. */
export const parts = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "resume", label: "Resume" },
  { id: "contact", label: "Contact" },
] as const;

export type PartId = (typeof parts)[number]["id"];

export function getPart(id: PartId) {
  return parts.find((p) => p.id === id)!;
}
