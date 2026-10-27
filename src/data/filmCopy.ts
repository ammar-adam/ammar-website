/** Approved on-screen copy. Detailed facts and numbers remain in arrivals/departures. */
export type IntroCopy = { pre: string; lines: string[]; aside: string };
export type FilmCardCopy = { slug: string; name: string; role: string; tag: string; line: string };

export const INTRO_COPY: readonly IntroCopy[] = [
  {
    "pre": "",
    "lines": [
      "Alright."
    ],
    "aside": "Let's do this one more time."
  },
  {
    "pre": "My name's",
    "lines": [
      "AMMAR",
      "ADAM."
    ],
    "aside": "And I study CS + Finance at Waterloo."
  },
  {
    "pre": "I like making",
    "lines": [
      "THINGS",
      "HAPPEN."
    ],
    "aside": "Sometimes I write code. Sometimes I bring people together."
  }
];

export const EXPERIENCE_COPY: readonly FilmCardCopy[] = [
  {
    slug: "alpen-capital", name: "Alpen Capital", role: "M&A Summer Analyst, Dubai",
    tag: "I was sixteen when I started.", line: "I learned to model deals as the firm's youngest intern.",
  },
  {
    slug: "datastealth", name: "DataStealth", role: "Product Engineering Intern, Mississauga",
    tag: "Then I got to build the tools.", line: "I built product demos and automated competitor research.",
  },
  {
    slug: "sagard", name: "Sagard", role: "AI Engineer",
    tag: "Turns out I like making useful things.", line: "I build AI tools for the legal and compliance team.",
  },
  {
    slug: "openai", name: "OpenAI", role: "Founding Builder Lead",
    tag: "Now I'm finding other people who build.", line: "I find student builders and help them ship.",
  },
  {
    slug: "pear-vc", name: "Pear VC", role: "Fellow",
    tag: "And backing those builders.", line: "I scout and support early-stage founders.",
  },
];

export const PROJECT_COPY: readonly FilmCardCopy[] = [
  {
    slug: "backseat", name: "Backseat", role: "",
    tag: "Your GPS could use a better voice.", line: "I made character voices you can add to Waze in one tap.",
  },
  {
    slug: "rocketship", name: "RocketShip", role: "",
    tag: "Then I tried building an AI stock analyst.", line: "I built an AI research tool and tested its stock picks.",
  },
  {
    slug: "waterloo-venture", name: "Waterloo Venture Group", role: "Managing Director",
    tag: "I also like getting people together.", line: "I run Waterloo's student venture community.",
  },
  {
    slug: "waterloo-tech-week", name: "Waterloo Tech Week / Hack the North", role: "",
    tag: "So we put on a week of events.", line: "I organized Tech Week and helped run Hack the North.",
  },
];
