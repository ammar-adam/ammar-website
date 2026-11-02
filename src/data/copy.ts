/**
 * Arrivals = Experiences. What has landed.
 */

export interface ArrivalArtifact {
  label: string;
  sublabel?: string;
  type?: "analytics" | "automation" | "presentation" | "finance" | "default";
}

export interface ArrivalLink {
  label: string;
  url: string;
}

export interface Arrival {
  slug: string;
  from: string;
  /** Company/category URL for detail card */
  fromUrl?: string;
  /** Image path for bag card and detail panel (e.g. /WATERLOOVG.jpg) */
  image?: string;
  /** Bag tag text (e.g. "Waterloo", "Mississauga", "Dubai") */
  origin: string;
  title: string;
  detailTitle?: string;
  impact: string;
  /** Single line or short detail (no bullets) */
  details: string;
  status?: "Bags ready" | "Bags loading";
  artifacts?: ArrivalArtifact[];
  /** Optional extra links shown in the detail panel */
  links?: ArrivalLink[];
}

export const arrivals: Arrival[] = [
  {
    slug: "alpen-capital",
    from: "Alpen Capital",
    fromUrl: "https://alpencapital.com/",
    image: "/ALPENCAPITAL.jpg",
    origin: "Dubai",
    title: "M&A Analyst",
    detailTitle: "Mergers & Acquisitions Summer Analyst",
    impact: "I supported $50M+ in deal flow on buy- and sell-side equity advisory.",
    details: "I joined at sixteen as the firm's youngest intern and learned financial modelling and investment research.",
    status: "Bags ready",
  },
  {
    slug: "datastealth",
    from: "DataStealth",
    fromUrl: "https://datastealth.io/",
    image: "/DATASTEALTH.jpg",
    origin: "Mississauga",
    title: "Product Engineering",
    detailTitle: "Product Engineering Intern",
    impact: "I built a demo environment covering 8 product capabilities, bringing setup time down from months to hours.",
    details: "I also automated competitor comparisons from 10,000-word research documents, cutting product research time by about 40%.",
    status: "Bags ready",
  },
  {
    slug: "sagard",
    from: "Sagard",
    fromUrl: "https://www.sagard.com/",
    image: "/SAGARD.jpg",
    origin: "Toronto",
    title: "AI Engineer",
    detailTitle: "AI Engineer (Contract) Â· prev. AI Engineering Intern",
    impact: "I build AI tools for the legal and compliance team at Sagard, a $46B AUM asset manager.",
    details: "I'm leading the rollout of a 6-tool Legal AI Hub and extending Doppel, a computer-use agent powered by a local LLM. As an intern, I cut KYC package prep from weeks to hours.",
    status: "Bags loading",
  },
  {
    slug: "waterloo-venture",
    from: "Waterloo Venture Group",
    fromUrl: "https://www.waterloovg.com/",
    image: "/WATERLOOVG.jpg",
    origin: "Waterloo",
    title: "Managing Director",
    detailTitle: "Managing Director",
    impact: "I run a student venture community with 1,300+ members. We've helped 30+ students join startups and helped founders raise $13.9M.",
    details: "I help founders with market research and partner introductions, including Smoov's expansion beyond the US.",
    status: "Bags loading",
  },
  {
    slug: "hack-the-north",
    from: "Waterloo Tech Week / Hack the North",
    fromUrl: "https://waterlootechweek.ca/",
    image: "/HTN_ORGANIZER.jpg",
    origin: "Waterloo",
    title: "Organizer",
    detailTitle: "Organizer Â· Waterloo Tech Week & Hack the North",
    impact: "I organized Waterloo Tech Week across 70 events.",
    details: "I raised $6K+ from sponsors including Citadel, HRT and Shopify, reached out to 60+ companies, and moderated a founder panel and fireside chat.",
    status: "Bags ready",
    links: [
      { label: "Waterloo Tech Week", url: "https://waterlootechweek.ca/" },
      { label: "Hack the North", url: "https://hackthenorth.com/" },
      { label: "Techyon", url: "https://techyon.org/" },
    ],
  },
  {
    slug: "openai",
    from: "OpenAI",
    fromUrl: "https://openai.com/",
    image: "/OPENAI.jpg",
    origin: "San Francisco",
    title: "Founding Builder Lead",
    detailTitle: "Founding Builder Lead",
    impact: "I'm one of 5 Founding Builder Leads selected across North America.",
    details: "I find student builders and help them get started with OpenAI's developer tools.",
    status: "Bags loading",
  },
  {
    slug: "pear-vc",
    from: "Pear VC",
    fromUrl: "https://pear.vc/",
    image: "/PEARVC.jpg",
    origin: "Palo Alto",
    title: "Fellow",
    detailTitle: "Pear VC Fellow",
    impact: "At Pear, I help early-stage founders.",
    details: "I scout early-stage startups and evaluate their teams.",
    status: "Bags loading",
  },
];

export function getArrivalBySlug(slug: string): Arrival | undefined {
  return arrivals.find((a) => a.slug === slug);
}

/** Career chronology; community-building work is featured under projects. */
export const careerArrivals = ["alpen-capital", "datastealth", "sagard", "openai", "pear-vc"].map(slug => arrivals.find(item => item.slug === slug)!);

/**
 * Departures = Projects as flights.
 * Seat map order: 1A, 1B, 2A, 2B, 3A, 3B (max 6).
 */

export type FlightStatus = "Boarding" | "Boarding Closed" | "Departed" | "Delayed";

export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectSeat {
  id: string;
  label: string;
  content: string;
  links?: ProjectLink[];
}

export interface Project {
  slug: string;
  /** Display name on seat (e.g. "Rocketship") */
  name: string;
  year: string;
  /** Gate panel destination line (e.g. "To the moon!") */
  destination: string;
  flightCode: string;
  routeName: string;
  stackTag?: string;
  gate: string;
  status: FlightStatus;
  shortDesc: string;
  screenshot: string;
  seats: ProjectSeat[];
}

const softwareProjects: Project[] = [
  {
    slug: "rocketship",
    name: "Rocketship",
    year: "2026",
    destination: "To the moon!",
    flightCode: "RS493",
    routeName: "I built an AI equity research tool, then put its results to the test.",
    gate: "A",
    status: "Boarding",
    shortDesc: "I combined stock screening, a 5-agent LLM debate, live news and portfolio optimization. When I ran walk-forward tests, a simple momentum baseline beat the LLM ranker and exposed inflated backtests.",
    screenshot: "/ROCKETSHIP-current.webp",
    seats: [
      {
        id: "main",
        label: "Links",
        content: "",
        links: [
          { label: "View Project", url: "https://rocketshipstocks.vercel.app/" },
          { label: "GitHub", url: "https://github.com/ammar-adam/rocketship" },
          { label: "Demo", url: "https://www.loom.com/share/9df9303e6d7742838730fdc1ff5bff29" },
        ],
      },
    ],
  },
  {
    slug: "canadaclip",
    name: "CanadaClip",
    year: "2026",
    destination: "Canadian SMBs",
    flightCode: "CC24",
    routeName: "iOS App Clip + AI Merchant Dashboard",
    gate: "A",
    status: "Boarding",
    shortDesc: "iOS App Clip that takes the big-brand product links AI assistants recommend and points them to Canadian small businesses instead. Includes merchant onboarding and Gemini product matching.",
    screenshot: "/CANADACLIP.mp4",
    seats: [
      {
        id: "main",
        label: "Links",
        content: "",
        links: [
          { label: "GitHub", url: "https://github.com/ammar-adam/canada-clip-hackcanada" },
          { label: "Demo", url: "https://youtu.be/JzYwfPrcPtM?si=v9hC_aww9t8z7gmK" },
        ],
      },
    ],
  },
  {
    slug: "risk-optimized-equity-system",
    name: "Risk-Optimized Portfolio",
    year: "2025",
    destination: "Low Volatility",
    flightCode: "BETA16",
    routeName: "Portfolio construction for risk-averse investors",
    gate: "C",
    status: "Departed",
    shortDesc: "Portfolio builder for risk-averse investors. Estimates volatility and covariance, then solves for the lowest-risk allocation with convex optimization.",
    screenshot: "/RISKFREE.png",
    seats: [
      {
        id: "main",
        label: "Links",
        content: "",
        links: [
          { label: "GitHub", url: "https://github.com/ammar-adam/risk-optimized-equity-system" },
          { label: "Demo", url: "https://www.loom.com/share/f9d68d48cef5487896156f55c5669271" },
        ],
      },
    ],
  },


  {
    slug: "backseat",
    name: "Backseat",
    year: "2026",
    destination: "Recalculating",
    flightCode: "BKS26",
    routeName: "I made character voices you can install in one tap.",
    gate: "E",
    status: "Boarding",
    shortDesc: "You pick a character, then add its voice to Waze in one tap. I wrote the open-source SDK behind it after reverse-engineering Waze's undocumented voice format. It handles text-to-speech, source separation and round-trip checks across all 43 prompts.",
    screenshot: "/BACKSEAT.png",
    seats: [
      {
        id: "main",
        label: "Links",
        content: "",
        links: [
          { label: "View Project", url: "https://backseatnav.com/" },
          { label: "GitHub", url: "https://github.com/ammar-adam/waze-voice-sdk" },
        ],
      },
    ],
  },
];

export const projects: Project[] = [
  softwareProjects.find(project => project.slug === "backseat")!,
  softwareProjects.find(project => project.slug === "rocketship")!,
  {
    slug: "waterloo-venture", name: "Waterloo Venture Group", year: "", destination: "Student founders",
    flightCode: "WVG01", routeName: "I bring student founders together.", gate: "C", status: "Boarding",
    shortDesc: "I run a student venture community with 1,300+ members. We've helped 30+ students join startups and helped founders raise $13.9M. I help founders with market research and partner introductions, including Smoov's expansion beyond the US.",
    screenshot: "/WATERLOOVG.jpg", stackTag: "COMMUNITY / VENTURE",
    seats: [{ id: "main", label: "Links", content: "", links: [{ label: "Visit WVG", url: "https://www.waterloovg.com/" }] }],
  },
  {
    slug: "waterloo-tech-week", name: "Waterloo Tech Week / Hack the North", year: "", destination: "A week of builders",
    flightCode: "WTW70", routeName: "I helped get a whole city building.", gate: "D", status: "Boarding",
    shortDesc: "I organized Waterloo Tech Week across 70 events, raised $6K+ in sponsorship, and moderated founder conversations.",
    screenshot: "/HTN_ORGANIZER.jpg", stackTag: "COMMUNITY / EVENTS",
    seats: [{ id: "main", label: "Links", content: "", links: [{ label: "Tech Week", url: "https://waterlootechweek.ca/" }, { label: "Hack the North", url: "https://hackthenorth.com/" }, { label: "Techyon", url: "https://techyon.org/" }] }],
  },
];

/** Earlier software projects remain available as source records. */
export const archivedProjects = softwareProjects.filter(project => !projects.some(featured => featured.slug === project.slug));

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}


/** The single source for journey narration, card descriptions, details and UI copy. */
export type IntroCopy = { pre: string; lines: string[]; aside: string };
export type FilmCardCopy = { slug: string; name: string; role: string; tag: string; desc: string; filmDesc?: string };
export const INTRO_COPY: readonly IntroCopy[] = [
 {pre: "", lines: ["Alright."], aside: "Let's do this one more time."},
 {pre: "My name's", lines: ["Ammar", "Adam."], aside: "CS and Finance at Waterloo."},
 {pre: "", lines: [], aside: "Born and raised in Toronto. Most of my family is a long flight away, so I've spent a lot of my life in places like this."},
 {pre: "And finding", lines: ["My people."], aside: "Builders, founders, friends."},
 {pre: "", lines: [], aside: "Come on. I'll show you."},
];
export const INTRO_BEATS = [0, .8, 1.7, 4.1, 5.1] as const;
export function introBeatAt(seconds: number) { return INTRO_BEATS.filter(at => seconds >= at).length - 1; }
export const EXPERIENCE_COPY: readonly FilmCardCopy[] = [
 {slug:"alpen-capital",name:"Alpen Capital",role:"M&A Summer Analyst, Dubai",tag:"At sixteen I was in Dubai, building models for real M&A deals.",desc:"Modelled M&A deals in Dubai at 16 as the firm's youngest intern.",filmDesc:"Modelled M&A deals in Dubai as the firm's youngest intern."},
 {slug:"datastealth",name:"DataStealth",role:"Product Engineering Intern",tag:"Spreadsheets were cool. Building the thing was cooler.",desc:"Built product demos for sales and automated competitor research."},
 {slug:"sagard",name:"Sagard",role:"AI Engineer",tag:"Then I wanted to build things people use every day.",desc:"Built AI tools for legal and compliance that cut KYC prep from weeks to hours.",filmDesc:"Built AI tools for the legal and compliance team."},
 {slug:"openai",name:"OpenAI",role:"Founding Builder Lead",tag:"Then I found the best part: other people who build.",desc:"Finding the best student builders in North America and helping them ship."},
 {slug:"pear-vc",name:"Pear VC",role:"Fellow",tag:"And sometimes I get to back them early.",desc:"Scouting and supporting founders at their earliest stages."},
];
export const PROJECT_COPY: readonly FilmCardCopy[] = [
 {slug:"backseat",name:"Backseat",role:"Creator",tag:"Some things I built because I wanted them to exist.",desc:"Character voices for Waze, installed in one tap."},
 {slug:"rocketship",name:"RocketShip",role:"Creator",tag:"Some I built to see if I could.",desc:"AI agents that write equity research, graded with honest evals."},
 {slug:"waterloo-venture",name:"Waterloo Venture Group",role:"Managing Director",tag:"But the best things I've built are made of people.",desc:"Running Waterloo's student venture community."},
 {slug:"waterloo-tech-week",name:"Waterloo Tech Week / Hack the North",role:"Organizer",tag:"Give Waterloo's builders a week and the whole city shows up.",desc:"Organized Tech Week and helped run Hack the North."},
];
export const SHORT_COPY = {
 bio: "CS and Finance at Waterloo.",
 personal: "I build AI tools, bring builders together, and back founders early. Outside of that: cooking, eating, soccer, and trying anything once.",
 name: "Ammar Adam", experience:"Experience", built:"Built", resume:"Résumé", back:"Back to the terminal",
};
export const UI_COPY = {
 details:"Details", close:"Close", experience:"Experience", projects:"Projects", company:"Company website", creator:"Creator",
 security:"Everybody's got a bag. Here's what's in mine.", concourse:["There's a bit of me in here.", "Take a look around."],
 ending:"And that's me.", endingTitle:["The story's", "still going."], hello:"Say hello",
 boardingHelper:"Scan the boarding pass. The résumé PDF opens after the two-second departure.",
 look:"Drag to look around", scroll:"Scroll", skip:"Skip intro", back:"Back", next:"Next", gate:"Gate",
 chapters:["Intro", "Check-in", "Security", "Concourse", "Gate"],
};
export const TERMINAL_COPY = {
 cities:["London","Paris","Istanbul","New York","Seoul","Doha"],
 wayfinding:["Baggage claim", "Arrivals", "Prayer room", "Gates A1–A12", "Café", "Washrooms"],
 clocks:[{label:"Toronto",zone:"America/Toronto"},{label:"Dubai",zone:"Asia/Dubai"},{label:"Karachi",zone:"Asia/Karachi"}],
 departures:["DXB → YYZ", "DXB → KHI", "YYZ → LHR", "DOH → ICN"], banner:"Waterloo Tech Week", exit:"Exit", service:"Staff only",
};
