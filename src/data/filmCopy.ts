/** Approved on-screen copy. Detailed facts and numbers remain in arrivals/departures. */
export type IntroCopy = { pre: string; lines: string[]; aside: string };
export type FilmCardCopy = { slug: string; name: string; role: string; tag: string; line: string };

export const INTRO_COPY: readonly IntroCopy[] = [
  { pre: "Alright.", lines: [], aside: "Let's do this one more time." },
  { pre: "My name's", lines: ["AMMAR", "ADAM."], aside: "CS & Finance at Waterloo." },
  { pre: "And finding", lines: ["MY", "PEOPLE."], aside: "Builders, founders, friends. Come on. I'll show you." },
];

export const EXPERIENCE_COPY: readonly FilmCardCopy[] = [
  {
    slug: "alpen-capital", name: "Alpen Capital", role: "M&A Summer Analyst, Dubai",
    tag: "I was sixteen when I started.", line: "The firm's youngest intern, learning to model deals.",
  },
  {
    slug: "datastealth", name: "DataStealth", role: "Product Engineering Intern, Mississauga",
    tag: "Then I started building the tools.", line: "Built product demos and automated competitor research.",
  },
  {
    slug: "sagard", name: "Sagard", role: "AI Engineer",
    tag: "Turns out I like the useful stuff.", line: "AI tools for the legal and compliance team.",
  },
  {
    slug: "openai", name: "OpenAI", role: "Founding Builder Lead",
    tag: "And finding other people who build.", line: "I find student builders and help them ship.",
  },
  {
    slug: "pear-vc", name: "Pear VC", role: "Fellow",
    tag: "", line: "Scouting early-stage founders.",
  },
];

export const PROJECT_COPY: readonly FilmCardCopy[] = [
  {
    slug: "backseat", name: "Backseat", role: "",
    tag: "Your GPS could use a better voice.", line: "Character voices for Waze, installed in one tap.",
  },
  {
    slug: "rocketship", name: "RocketShip", role: "",
    tag: "Five agents. I checked their work.", line: "AI equity research with honest evals.",
  },
  {
    slug: "waterloo-venture", name: "Waterloo Venture Group", role: "Managing Director",
    tag: "Some projects are made of people.", line: "Waterloo's student venture community.",
  },
  {
    slug: "waterloo-tech-week", name: "Waterloo Tech Week / Hack the North", role: "",
    tag: "Like getting a whole city building.", line: "Organized Tech Week; helped run Hack the North.",
  },
];
