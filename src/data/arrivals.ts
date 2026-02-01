/**
 * Arrivals = Experiences. What has landed.
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
    shortDesc: "[One-line summary]",
    details: "[Longer description, lessons, outcomes.]",
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
