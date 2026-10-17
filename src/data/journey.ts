/**
 * Copy for the single-page journey. Experience and project facts live in
 * arrivals.ts and departures.ts; this file only holds the words around them.
 */

export const stops = [
  { id: "hall", label: "Arrivals hall", walk: "" },
  { id: "departures", label: "Departures", walk: "1 min walk" },
  { id: "gates", label: "Gates A1–A4", walk: "2 min walk" },
  { id: "lounge", label: "Gate area", walk: "3 min walk" },
  { id: "boarding", label: "Boarding", walk: "4 min walk" },
] as const;

export type StopId = (typeof stops)[number]["id"];

export type SignItem = {
  href: string;
  label: string;
  sub: string;
  arrow: "→" | "↓" | "↗";
  external?: boolean;
};

/** Wayfinding sign in the hall. Doubles as the site navigation. */
export const signage: SignItem[] = [
  { href: "#departures", label: "Departures", sub: "Where I've worked", arrow: "→" },
  { href: "#gates", label: "Gates", sub: "What I've built", arrow: "→" },
  { href: "#lounge", label: "Gate area", sub: "About me", arrow: "→" },
  { href: "/Ammar_Adam.pdf", label: "Resume", sub: "One page, PDF", arrow: "↓", external: true },
];

export const hero = {
  kicker: "AFA International · Arrivals hall",
  name: ["Ammar", "Adam"],
  voice: "CS & Finance at Waterloo. Building AI tools at Sagard, scouting student builders for OpenAI, shipping things on the side.",
};

/** The gate area. Two sentences and what's in the carry-on. */
export const lounge = {
  intro: [
    "I grew up between Toronto, Dubai and Karachi, so a lot of my life happened in departure halls. This site lives in one.",
    "When I'm not building, I'm hunting for the best shawarma in the GTA or talking about airplanes for longer than anyone asked.",
  ],
  carryOn: [
    "Liverpool supporter since I was ten",
    "Paddington 2 is the best movie ever made",
    "Iced coffee and mango matcha, non-negotiable",
    "Ask me about airline economics",
  ],
};
