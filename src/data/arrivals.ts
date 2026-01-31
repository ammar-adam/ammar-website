/**
 * Arrivals = Experiences. Add your experiences here.
 * Each arrival is something that "landed" — something you did or learned.
 */

export interface Arrival {
  slug: string;
  from: string;
  title: string;
  shortDesc: string;
  details: string;
}

export const arrivals: Arrival[] = [
  {
    slug: "experience-one",
    from: "[Origin / Context]",
    title: "[Experience Title]",
    shortDesc: "[One-line summary of what was done or learned]",
    details: "[Longer description, lessons, outcomes. Can be multiple paragraphs.]",
  },
  {
    slug: "experience-two",
    from: "[Another Origin]",
    title: "[Another Experience]",
    shortDesc: "[Short summary]",
    details: "[Details placeholder]",
  },
];

export function getArrivalBySlug(slug: string): Arrival | undefined {
  return arrivals.find((a) => a.slug === slug);
}
