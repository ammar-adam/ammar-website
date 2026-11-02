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
    flightCode: "Cc24",
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
    flightCode: "Beta16",
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
    screenshot: "/plates/backseat-landing.webp",
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
    screenshot: "/WATERLOOVG.jpg", stackTag: "Community / venture",
    seats: [{ id: "main", label: "Links", content: "", links: [{ label: "Visit WVG", url: "https://www.waterloovg.com/" }] }],
  },
  {
    slug: "waterloo-tech-week", name: "Waterloo Tech Week / Hack the North", year: "", destination: "A week of builders",
    flightCode: "WTW70", routeName: "I helped get a whole city building.", gate: "D", status: "Boarding",
    shortDesc: "I organized Waterloo Tech Week across 70 events, raised $6K+ in sponsorship, and moderated founder conversations.",
    screenshot: "/HTN_ORGANIZER.jpg", stackTag: "Community / events",
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

/**
 * AFA INTERNATIONAL AIRPORT — Central configuration.
 * Replace placeholders with your content.
 * Tone: calm, human announcements — not corporate signage.
 */

/** Canonical site URL for webring. Set NEXT_PUBLIC_SITE_URL or replace this so prev/next point to your registered site. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ammaradam.com";

export const siteConfig = {
  airportName: "AFA International Airport",
  siteName: "AFA International Airport",
  siteUrl,

  /** uwaterloo.network webring — set your id after joining (https://github.com/Shayaan-Azeem/waterloo.network). */
  uwaterlooNetworkUserId: undefined as string | undefined,

  navLabels: {
    projects: "Projects",
    arrivals: "Experiences",
    about: "About Me",
    resume: "Resume",
  },

  /** Landing hero: one clear sentence. */
  heroOneLiner: "Hi, I'm Ammar. CS & Finance at Waterloo. Welcome to AFA International.",

  socialLinks: {
    email: "mailto:ammar.adam@uwaterloo.ca",
    github: "https://github.com/ammar-adam",
    linkedin: "https://www.linkedin.com/in/ammar-adam/",
    x: "https://x.com/ammaradam_5807?s=11",
  },

  checkIn: {
    ctaTerminal: "Enter Terminal",
    ctaDepartures: "View Departures",
  },

  /** Top ticker: floating taglines */
  tickerIdentifiers: [
    "CS & Finance at Waterloo",
    "Toronto, Dubai, Karachi",
    "AI Engineer at Sagard",
    "Founding Builder Lead at OpenAI",
    "Probably eating shawarma",
  ],

  /** Hero background image (optional). Add /hero-airport.jpg to public. */
  heroImageUrl: "/hero-airport.jpg",

  /** Intro boarding pass (beside headshot on check-in) */
  introBoardingPass: {
    passenger: "Ammar Adam",
    program: "Computer Science and Finance",
    institution: "University of Waterloo",
    focus: "AI, finance, startups",
    currentStatus: "In progress",
  },

  /** Check-in main intro paragraphs */
  checkInIntro: [
    "Hi, I'm Ammar Adam.",
    "Welcome to AFA International Airport.",
    "I structured this site like a terminal because most of my life feels like movement. Between cities, ideas, projects, and different phases of learning.",
    "There is no fixed path here.",
    "Some sections show what I am building.",
    "Some show what I have already done.",
    "Some are just there if you want to look around.",
    "If you want the short version, it is on the boarding pass next to this page.",
    "Everything else is optional.",
  ],

  /** Lounge photo (optional). Add /photo.jpg to public and set to "/photo.jpg". */
  photoUrl: "" as string,

  /** Caption shown below lounge photo when photoUrl is set. */
  photoCaption: {
    name: "",
    subtitle: "CS + Finance · UW 2A",
  },
} as const;

/** Single placement registry for the terminal's quiet personal references.
 * done is set only after the integrated desktop/phone visual pass. */
export interface TerminalReference {
 id:string;stop:"checkin"|"security"|"concourse"|"gate";
 position:readonly[number,number,number];rotation:readonly[number,number,number];scale:readonly[number,number,number];
 priority:"A"|"B";note:string;done:boolean;dwell:number;label?:string;text?:readonly string[];art?:readonly string[];
 /** Optional exploration angle for a reference viewed from the same authored rail. */
 lookDwell?:number;lookYaw?:number;lookPitch?:number;
 /** Wall artwork is anchored separately so foreground props never hide its neighbours. */
 wall?:{position:readonly[number,number,number];rotation:readonly[number,number,number];size:readonly[number,number]};
}
export const terminalReferences:readonly TerminalReference[]=[
{ id: "alpen-difc", stop: "checkin", position: [4.91, 1.20, -25.32], rotation: [0, -.10, 0], scale: [1, 1, 1], priority: "A", note: "DIFC ID card hanging from a physical desk hook.", done: true, label: "DIFC", dwell: .261 },
  { id: "alpen-model", stop: "checkin", position: [3.92, 1.20, -25.17], rotation: [0, -.06, 0], scale: [1, 1, 1], priority: "A", note: "Printed spreadsheet lying on the Alpen desk.", done: true,  dwell: .261 },
  { id: "alpen-business-cards", stop: "checkin", position: [4.43, 1.21, -25.03], rotation: [0, -.08, 0], scale: [1, 1, 1], priority: "B", note: "Small stack of bone-coloured business cards.", done: true, dwell: .261 },
  { id: "datastealth-dashboard", stop: "checkin", position: [5.43, 1.20, -25.67], rotation: [0, -.12, 0], scale: [1, 1, 1], priority: "A", note: "A sales dashboard on a physical customer-facing desk monitor.", done: true, label: "Sales", dwell: .303 },
  { id: "sagard-kyc", stop: "checkin", position: [5.47, 1.20, -25.51], rotation: [0, -.12, 0], scale: [1, 1, 1], priority: "A", note: "KYC folder with a red rubber stamp and a Doppel sticky note.", done: true, label: "KYC / Doppel", dwell: .345 },
  { id: "openai-devday", stop: "checkin", position: [5.99, 1.20, -25.79], rotation: [0, -.12, 0], scale: [1, 1, 1], priority: "A", note: "Unbranded DevDay badge hanging at the desk.", done: true, label: "DevDay", dwell: .387 },
  { id: "openai-handheld", stop: "checkin", position: [6.20, 1.26, -25.63], rotation: [-.72, -.28, 0], scale: [.80, .80, .80], priority: "A", note: "A generic handheld in a small cradle beside the DevDay badge.", done: true, dwell: .387 },
{ id: "security-bat-flip", stop: "security", position: [4.40, 0, -38.13], rotation: [0, 0, 0], scale: [1, 1, 1], priority: "A", note: "A baseball bat mid-flip above a separate inspection return belt.", done: true, dwell: .525 },
  { id: "security-corner-newspaper", stop: "security", position: [3.86, 0, -39.69], rotation: [0, -.06, 0], scale: [1, 1, 1], priority: "B", note: "One small folded CORNER TAKEN QUICKLY newspaper on the bench; a low leaning corner flag stays below its backrest.", done: true, label: "Corner taken quickly", dwell: .525 },
  { id: "security-cap-wand", stop: "security", position: [4.13, .55, -39.30], rotation: [0, -.10, 0], scale: [.78, .78, .78], priority: "B", note: "Blue baseball cap and a wooden wand in a personal belongings tray.", done: true, dwell: .525 },
  { id: "security-yellow-umbrella", stop: "security", position: [3.02, 0, -40.0], rotation: [0, 0, -.10], scale: [1, 1, 1], priority: "B", note: "A closed yellow umbrella resting beside the lane barrier.", done: true, dwell: .525 },
  { id: "security-xray-biscuits", stop: "security", position: [7.05, 2.46, -41.75], rotation: [0, -.15, 0], scale: [1, 1, 1], priority: "B", note: "A plain biscuit packet on a separate X-ray inspection display, with no wrapper logo.", done: true, label: "Oreo", dwell: .525 },
{ id: "concourse-nihari", stop: "concourse", position: [-5.40, 0, -58.30], rotation: [0, .08, 0], scale: [1, 1, 1], priority: "A", note: "Nihari pot stays at the counter; its English/Urdu Karachi still life hangs on the kitchen back wall.", text: ["NIHARI", "نہاری", "KARACHI"], wall: { position: [-9.85, 3.60, -61.18], rotation: [0, 0, 0], size: [3.0, 1.95] }, dwell: 0.674, done: true },
  { id: "concourse-ridgeway", stop: "concourse", position: [-4.8, 0, -60.4], rotation: [0, .12, 0], scale: [1, 1, 1], priority: "A", note: "Ridgeway Plaza rotisserie; roast turns slowly in twelve poses each second.", text: ["RIDGEWAY PLAZA", "shawarma · kafta · arayes"], wall: { position: [-13.20, 3.60, -58.65], rotation: [0, Math.PI / 2, 0], size: [2.85, 1.70] }, dwell: 0.684, done: true },
  { id: "concourse-mango-matcha", stop: "concourse", position: [-5.08, 1.325, -69.40], rotation: [0, .08, 0], scale: [1, 1, 1], priority: "A", note: "Two-layer mango matcha stays on the café counter; its painted label hangs below the leading return-wall photo.", text: ["Mango matcha"], wall: { position: [-13.20, 1.75, -65.50], rotation: [0, Math.PI / 2, 0], size: [2.20, 1.10] }, dwell: 0.738, done: true },
  { id: "concourse-dubai", stop: "concourse", position: [-5.60, 0, -71.6], rotation: [0, .10, 0], scale: [1, 1, 1], priority: "A", note: "Hand rolls stay on the service return; Kokoro, Hashmi's and Tong Thai share their original still life below the café back-wall photos.", text: ["Kokoro", "Hashmi's", "Tong Thai"], wall: { position: [-11.20, 1.75, -72.19], rotation: [0, 0, 0], size: [2.80, 1.15] }, dwell: 0.757, done: true },
  { id: "concourse-thai", stop: "concourse", position: [-5.30, 0, -75.1], rotation: [0, .08, 0], scale: [1, 1, 1], priority: "A", note: "Thai bowls stay on the counter; the full Sukhothai, Chiang Mai and Mississauga still life hangs on the next bay's clear side wall.", text: ["Sukhothai", "Chiang Mai,", "Mississauga"], wall: { position: [-13.20, 3.50, -76.30], rotation: [0, Math.PI / 2, 0], size: [3.05, 2.0] }, dwell: 0.777, done: true },
  { id: "concourse-souvenir-shelves", stop: "concourse", position: [-7.7, 0, -81.5], rotation: [0, 0, 0], scale: [1, 1, 1], priority: "A", note: "Low glass-globe plinth and a stepped shelf for the original, unbranded plush allusions.", text: [], dwell: 0.808, done: true },
  { id: "globe-paris", stop: "concourse", position: [-8.75, 1.48, -80.65], rotation: [0, 0, 0], scale: [1, 1, 1], priority: "A", note: "Snow globe with a narrow four-legged iron tower silhouette.", text: [], dwell: 0.787, done: true },
  { id: "globe-istanbul", stop: "concourse", position: [-7.98, 1.48, -80.65], rotation: [0, 0, 0], scale: [1, 1, 1], priority: "A", note: "Snow globe with domes and slender minarets, no sacred-site image.", text: [], dwell: 0.799, done: true },
  { id: "globe-nyc", stop: "concourse", position: [-7.21, 1.48, -80.65], rotation: [0, 0, 0], scale: [1, 1, 1], priority: "A", note: "Snow globe with a stepped Manhattan tower cluster.", text: [], dwell: 0.807, done: true },
  { id: "globe-london", stop: "concourse", position: [-6.44, 1.48, -80.65], rotation: [0, 0, 0], scale: [1, 1, 1], priority: "A", note: "Snow globe with a clock tower and a little bridge.", text: [], dwell: 0.816, done: true },
  { id: "globe-seoul", stop: "concourse", position: [-8.37, 2.00, -81.55], rotation: [0, 0, 0], scale: [1, 1, 1], priority: "A", note: "Snow globe with a slender observation tower on a hill.", text: [], dwell: 0.813, done: true },
  { id: "globe-montreal", stop: "concourse", position: [-7.60, 2.00, -81.55], rotation: [0, 0, 0], scale: [1, 1, 1], priority: "A", note: "Snow globe with clustered stepped Habitat-like cubes.", text: [], dwell: 0.816, done: true },
  { id: "globe-castle", stop: "concourse", position: [-6.83, 2.00, -81.55], rotation: [0, 0, 0], scale: [1, 1, 1], priority: "A", note: "A generic turreted castle in a snow globe, with no branded silhouette.", text: [], dwell: 0.817, done: true },
  { id: "souvenir-yellow-lentil", stop: "concourse", position: [-10.3, 1.87, -82.10], rotation: [0, .15, -.06], scale: [1, 1, 1], priority: "A", note: "Plain yellow lentil plush, no letters or character face.", text: [], dwell: 0.799, done: true },
  { id: "souvenir-blue-lentil", stop: "concourse", position: [-9.50, 1.87, -82.10], rotation: [0, -.10, .10], scale: [1, 1, 1], priority: "A", note: "Plain blue lentil plush beside the yellow one.", text: [], dwell: 0.808, done: true },
  { id: "souvenir-tiger-tail", stop: "concourse", position: [-10.35, 2.85, -82.30], rotation: [0, .12, .12], scale: [1, 1, 1], priority: "A", note: "A curled warm-yellow plush tail with ink stripes, no character face.", text: [], dwell: 0.802, done: true },
  { id: "souvenir-cookie-jar", stop: "concourse", position: [-9.45, 2.63, -82.30], rotation: [0, 0, 0], scale: [1, 1, 1], priority: "A", note: "Blue ceramic cookie jar with an open lid; no eyes or character graphics.", text: [], dwell: 0.815, done: true },
  { id: "souvenir-black-duck", stop: "concourse", position: [-8.50, 2.655, -82.30], rotation: [0, -.30, 0], scale: [1, 1, 1], priority: "A", note: "A plain ink-coloured duck plush with a warm beak, no character face.", text: [], dwell: 0.816, done: true },
  { id: "souvenir-tall-hat-dog", stop: "concourse", position: [-10.10, 3.51, -82.38], rotation: [0, .12, 0], scale: [1, 1, 1], priority: "A", note: "A long-eared dog plush with a plain tall hat and no face or branded clothing.", text: [], dwell: 0.808, done: true },
  { id: "souvenir-mouse-ears", stop: "concourse", position: [-8.90, 3.88, -82.35], rotation: [0, 0, .10], scale: [1, 1, 1], priority: "A", note: "Round costume ears hanging from a metal hook.", text: [], dwell: 0.816, done: true },
  { id: "souvenir-bat-shadow", stop: "concourse", position: [-12.72, 3.66, -80.55], rotation: [0, Math.PI / 2, -.04], scale: [1, 1, 1], priority: "A", note: "An original animal-bat cutout casts its shadow onto the nearby shop wall under the window key.", text: [], dwell: 0.780, done: true },
  { id: "concourse-football-screen", stop: "concourse", position: [10.2, 3.8, -63.2], rotation: [0, -Math.PI/2, 0], scale: [1, 1, 1], priority: "A", note: "Sports-bar football screen and replay ticker. No club crests.", text: ["LIV 2–1 TOT", "ALISSON 90+5'"], dwell: .735, done: true, lookDwell: .705, lookYaw: -1.409, lookPitch: -.14 },
  { id: "concourse-baseball-screen", stop: "concourse", position: [10.2, 3.8, -67], rotation: [0, -Math.PI/2, 0], scale: [1, 1, 1], priority: "A", note: "Blue-and-cream baseball field coverage, wordmark-free jerseys; Blue Jays text only.", text: ["BLUE JAYS"], dwell: .735, done: true, lookDwell: .705, lookYaw: -1.409, lookPitch: -.14 },
  { id: "concourse-basketball-screen", stop: "concourse", position: [10.2, 3.8, -70.8], rotation: [0, -Math.PI/2, 0], scale: [1, 1, 1], priority: "A", note: "A basketball's arc to a rim with four painted bounce marks, no team logo.", text: [], dwell: .735, done: true, lookDwell: .705, lookYaw: -1.409, lookPitch: -.14 },
  { id: "concourse-paper-bear-tv", stop: "concourse", position: [4.55, 3.55, -83.05], rotation: [0, 0, 0], scale: [.86, .86, .86], priority: "A", note: "An original, abstract paper-cut bear allusion in blue and red, playing on the gate TV; no film still or copied character face.", text: ["Paddington 2"], dwell: .821, done: true },
  { id: "traveller-66", stop: "concourse", position: [6.00, 0, -62.2], rotation: [0, -.72, 0], scale: [1.10, 1.10, 1.10], priority: "A", note: "A traveller in an uncrested red 66 jersey pushing a luggage cart.", text: ["ALEXANDER-", "ARNOLD", "66"], dwell: .665, done: true, lookDwell: .705, lookYaw: -1.409, lookPitch: -.14 },
  { id: "traveller-11", stop: "concourse", position: [6.20, 0, -69.5], rotation: [0, -.70, 0], scale: [1.10, 1.10, 1.10], priority: "A", note: "Uncrested red SALAH 11 jersey.", text: ["SALAH", "11"], dwell: .695, done: true, lookDwell: .758, lookYaw: -1.501, lookPitch: -.13 },
  { id: "traveller-4", stop: "concourse", position: [7.70, 0, -91.0], rotation: [0, 0, 0], scale: [1.10, 1.10, 1.10], priority: "A", note: "Uncrested red VAN DIJK 4 jersey.", text: ["VAN DIJK", "4"], dwell: .854, done: true },
  { id: "traveller-9", stop: "concourse", position: [10.10, 0, -92.4], rotation: [0, -.12, 0], scale: [1.10, 1.10, 1.10], priority: "A", note: "Uncrested red FIRMINO 9 jersey.", text: ["FIRMINO", "9"], dwell: .854, done: true },
  { id: "traveller-10", stop: "concourse", position: [7.10, 0, -90.2], rotation: [0, .13, 0], scale: [1.10, 1.10, 1.10], priority: "A", note: "Uncrested red DEROZAN 10 basketball jersey.", text: ["DEROZAN", "10"], dwell: .850, done: true },
  { id: "traveller-43", stop: "concourse", position: [9.10, 0, -91.0], rotation: [0, 0, 0], scale: [1.10, 1.10, 1.10], priority: "A", note: "Uncrested red SIAKAM 43 basketball jersey.", text: ["SIAKAM", "43"], dwell: .854, done: true },
  { id: "traveller-clement", stop: "concourse", position: [6.65, 0, -88.8], rotation: [0, .10, 0], scale: [1.10, 1.10, 1.10], priority: "A", note: "A blue CLEMENT tee beside the gate approach, no team crest.", text: ["CLEMENT"], dwell: .839, done: true },
  { id: "traveller-bautista", stop: "concourse", position: [6.30, 0, -93.5], rotation: [0, -.08, 0], scale: [1.10, 1.10, 1.10], priority: "A", note: "A blue BAUTISTA tee further along the gate approach.", text: ["BAUTISTA"], dwell: .854, done: true },
  { id: "concourse-football-kids", stop: "concourse", position: [7.4, 0, -78.3], rotation: [0, -.20, 0], scale: [1, 1, 1], priority: "A", note: "Two children pass a football in the seating pocket, clear of the camera rail.", text: [], dwell: 0.827, done: true },
  { id: "concourse-basketball-player", stop: "concourse", position: [11.4, 0, -87.5], rotation: [0, -.7, 0], scale: [1, 1, 1], priority: "A", note: "A traveller bounces a basketball beside the gate seating.", text: [], dwell: 0.840, done: true },
  { id: "concourse-wings-flyer", stop: "concourse", position: [-13.20, 3.55, -55.20], rotation: [0, Math.PI / 2, 0], scale: [1, 1, 1], priority: "B", note: "Sultan's, Burlington flyer mounted on the kitchen side wall, separate from the food still lifes.", text: ["Sultan's,", "Burlington"], wall: { position: [-13.20, 3.55, -55.20], rotation: [0, Math.PI / 2, 0], size: [2.05, 1.10] }, dwell: .698, done: true },
  { id: "concourse-london-board", stop: "concourse", position: [-13.20, 1.75, -68.60], rotation: [0, Math.PI / 2, 0], scale: [1, 1, 1], priority: "B", note: "Park Room steak-sandwich board mounted below the rear café return-wall photo, without covering the image.", text: ["Steak sandwich,", "Park Room style"], wall: { position: [-13.20, 1.75, -68.60], rotation: [0, Math.PI / 2, 0], size: [2.20, 1.10] }, dwell: .737, done: true },
  { id: "concourse-record-picks", stop: "concourse", position: [-6.50, 3.50, -83.17], rotation: [0, 0, 0], scale: [1, 1, 1], priority: "B", note: "Full staff-picks sleeve mounted on the souvenir back wall, clear of the plush shelf and cinema posters.", text: ["STAFF PICKS", "Drake · The Weeknd", "Dave · Atif Aslam"], wall: { position: [-6.50, 3.50, -83.17], rotation: [0, 0, 0], size: [2.65, 1.55] }, dwell: 0.818, done: true },
  { id: "concourse-cinema-posters", stop: "concourse", position: [-2.50, 3.10, -83.43], rotation: [0, 0, 0], scale: [1, 1, 1], priority: "B", note: "Original painted travel posters with readable movie titles; no copied poster or character designs.", text: ["Yeh Jawaani Hai Deewani", "Zindagi Na Milegi Dobara"], art: ["/art/references/himalayan-friends.webp", "/art/references/coastal-road.webp"], dwell: 0.805, done: true },
 {id:"concourse-cafe-photos",stop:"concourse",position:[-9.35,3.65,-71.85],rotation:[0,0,0],scale:[1,1,1],priority:"A",note:"Four large uncropped personal photos on the café back and return walls, without captions.",dwell:.735,done:true},
 {id:"gate-departures",stop:"gate",position:[3.4,4.7,-98.0],rotation:[0,0,0],scale:[1,1,1],priority:"A",note:"Eleven split-flap routes, cycling a row every three seconds in twelve animation steps per second.",dwell:.94,done:true,text:["DXB → YYZ|Toronto|BOARDING","DXB → KHI|Karachi|ON TIME","YYZ → DXB|Dubai|ON TIME","LHR|London|BOARDING","CDG|Paris|ON TIME","IST|Istanbul|ON TIME","JFK|New York|ON TIME","ICN|Seoul — departed without permission|DEPARTED","YUL|MUN — delegate unaccounted for|DEPARTED","DOH|Qsuite|ON TIME","SIN|The Residence / Changi|ON TIME"]},
 {id:"gate-nine-three-quarters",stop:"gate",position:[12.75,2.25,-101.8],rotation:[0,0,0],scale:[.105,.105,.105],priority:"B",note:"A tiny Gate 9¾ plaque tucked onto the right window mullion.",dwell:.94,done:true},
];

/** Shared labels printed in the terminal and its HTML controls. */
export const PAINTED_COPY = {
  "alexanderArnold": "Alexander-Arnold",
  "label66": "66",
  "ammarAdam": "Ammar Adam",
  "boardingPass": "Boarding pass",
  "passenger": "Passenger",
  "adamAmmar": "Adam / Ammar",
  "computerScienceAmpFinanceWaterloo": "Computer Science & Finance · Waterloo",
  "from": "From",
  "waterloo": "Waterloo",
  "to": "To",
  "next": "Next",
  "whatSNext": "What’s next",
  "flight": "Flight",
  "gate": "Gate",
  "label05": "05",
  "seat": "Seat",
  "document": "Document",
  "resume": "Resume",
  "ammaradamCom": "Ammaradam.com",
  "keepThisPart": "Keep this part",
  "resumePdf": "Resume / PDF",
  "arrow": "→",
  "amm01AmmarAdam01a": "AMM01 / AMMAR-ADAM / 01A",
  "linkedin": "LinkedIn",
  "github": "GitHub",
  "email": "Email",
  "label01Experience": "01 / Experience",
  "aFewStops": "A few stops",
  "alongTheWay": "along the way.",
  "arrowLabel": "↗",
  "checkIn": "Check-in",
  "experience": "Experience",
  "label05Stops": "05 Stops",
  "no": "No.",
  "whereWhatIDid": "Where / what I did",
  "counter": "Counter",
  "fullExperience": "Full experience",
  "experienceLabel": "Experience /",
  "aa": "Aa",
  "sales": "Sales",
  "doppel": "Doppel",
  "devday": "DevDay",
  "corner": "Corner",
  "takenQuickly": "Taken quickly",
  "oreo": "Oreo",
  "departures": "Departures  →",
  "terminalA": "Terminal A",
  "security": "Security  →",
  "allGates": "All gates",
  "a1A12": "←  A1—A12",
  "departuresLabel": "Departures",
  "gates0406": "Gates 04—06",
  "entry": "Entry",
  "securityLabel": "Security",
  "airsideScreening": "Airside screening",
  "gate05": "Gate 05",
  "boarding": "Boarding",
  "alrightLetSDoThisOneMoreTime": "Alright. Let’s do this one more time.",
  "iM": "I’m",
  "ammarAdamLabel": "Ammar Adam.",
  "iStudyCsAmpFinanceAtWaterloo": "I study CS & Finance at Waterloo.",
  "iBuildAiToolsAtSagardAndBring": "I build AI tools at Sagard and bring student builders together.",
  "hereSTheStorySoFar": "Here’s the story so far",
  "iMAmmarAdamCsAmpFinanceAt": "I’m Ammar Adam. CS & Finance at Waterloo. I build AI tools at Sagard and bring student builders together.",
  "ammarAdamTake01": "Ammar Adam / take 01",
  "alright": "Alright.",
  "letSDoThis": "Let’s do this",
  "oneMore": "One more",
  "time": "Time.",
  "myNameIs": "My name is",
  "ammar": "Ammar",
  "adam": "Adam.",
  "heyGoodToMeetYou": "Hey. Good to meet you.",
  "iStudy": "I study",
  "csAmp": "CS &",
  "finance": "Finance.",
  "atTheUniversityOfWaterloo": "at the University of Waterloo.",
  "mostDays": "Most days",
  "iBuild": "I build",
  "aiTools": "AI tools.",
  "forThePeopleDoingTheWork": "For the people doing the work.",
  "andWhenIMNotDoingThat": "And when I’m not doing that",
  "iBring": "I bring",
  "builders": "Builders",
  "together": "Together.",
  "goodThingsTendToStartWithGoodPeople": "Good things tend to start with good people.",
  "thatSTheShortVersion": "That’s the short version.",
  "hereS": "Here’s",
  "theStory": "The story",
  "soFar": "So far.",
  "label0": "0",
  "label06": "/ 06",
  "skipToTheWork": "Skip to the work",
  "aboutMe": "About me",
  "rSum": "Résumé",
  "menu": "Menu",
  "arrowLabelLabel": "←",
  "arrowLabelLabelLabel": "▶",
  "playIntro": "Play intro",
  "aFewThingsIWantToRemember": "A few things I want to remember",
  "label03CameraRoll": "03 / Camera roll",
  "andOff": "And off",
  "theClock": "the clock?",
  "aFewMomentsWorthKeeping": "A few moments worth keeping.",
  "label25Photos": "/ 25 Photos",
  "gates": "Gates",
  "label0405": "04—05",
  "arrowLabelLabelLabelLabel": "↑",
  "keepRight": "Keep right",
  "label25": "/ 25",
  "openPhotoGallery": "Open photo gallery",
  "label25PhotosLabel": "· 25 photos",
  "aaLabel": "Aa /",
  "label02SecurityCheckProjects": "02 / Security check · projects",
  "whatIVeBeen": "What I’ve been",
  "building": "building.",
  "fourProjectsTakeALookInside": "Four projects. Take a look inside.",
  "label02": "02",
  "cabinBaggage": "Cabin baggage",
  "xRay02": "X-ray / 02",
  "personalProject": "Personal project",
  "item0": "Item 0",
  "label04": "/ 04",
  "inspectionMonitor": "Inspection monitor",
  "builtByAmmarAdam": "Built by Ammar Adam",
  "tray0": "Tray 0",
  "canadaclip": "CanadaClip",
  "ca": "Ca ↗",
  "bigBrandLink": "Big-brand link.",
  "localAlternative": "Local alternative.",
  "pasteMatchShopLocal": "Paste → match → shop local",
  "ammarAdamIStudyCsFinanceAtWaterloo": "Ammar Adam — I study CS + Finance at Waterloo",
  "skipToAboutMe": "Skip to About me",
  "scroll": "Scroll",
  "arrowLabelLabelLabelLabelLabel": "↓",
  "dragToLookAround": "Drag to look around",
  "departuresA01A09": "Departures  /  A01—A09",
  "label01ExperienceLabel": "01  /  Experience",
  "gate05Label": "Gate 05  →",
  "gates0406Label": "Gates 04—06  →",
  "nihari": "Nihari",
  "khiSlowCooked": "KHI  /  slow cooked",
  "postcards": "Postcards",
  "gate05StillBoarding": "Gate 05  /  still boarding",
  "label05NextChapter": "05  /  Next chapter",
  "ammarAdamPortfolio": "Ammar Adam / portfolio",
  "allTheWork": "All the work.",
  "theWorkTheProjectsAndAWayTo": "The work, the projects, and a way to say hello.",
  "close": "Close",
  "arrowLabelLabelLabelLabelLabelLabel": "×",
  "whereIAposVeWorked": "Where I've worked",
  "website": "Website",
  "for": "for",
  "opensInANewTab": "(opens in a new tab)",
  "projects": "Projects",
  "thingsIAposVeBuilt": "Things I've built",
  "contact": "Contact",
  "letAposSTalk": "Let's talk",
  "theOnePageVersion": "The one-page version.",
  "csAmpFinanceAtTheUniversityOfWaterloo": "CS & Finance at the University of Waterloo.",
  "openMyResume": "Open my resume",
  "pdfOpensInANewTab": "(PDF, opens in a new tab)",
  "visualCredits": "Visual credits"
} as const;

export const BACKGROUND_ROUTES = ["DXB → YYZ|Toronto|Boarding", "DXB → KHI|Karachi|On time", "YYZ → LHR|London|On time", "DOH → ICN|Seoul|Boarding"] as const;
export const BANNER_LINES = ["Waterloo", "Tech Week"] as const;

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
  tagline: "AI Engineer @ Sagard",
} as const;

/**
 * Lounge room content — personal, reflective.
 */

export const loungeRoomContent = {
  window: {
    title: "Window View",
    paragraphs: [
      "Recent reflections on goals, direction, and what comes next.",
    ],
    date: "October 2026",
  },

  bookshelf: {
    title: "What I'm Working On",
    items: [
      { label: "", text: "Legal AI tooling and computer-use agents at Sagard" },
      { label: "", text: "Scouting student builders for OpenAI" },
      { label: "", text: "Evals for RocketShip" },
      { label: "", text: "Trying to read more" },
      { label: "", text: "Cooking" },
    ],
  },

  photos: {
    title: "Moments",
    items: [
      { src: "/ABOUT1.jpg", caption: "core memory — playing soccer on jeju island" },
      { src: "/ABOUT2.jpg", caption: "first mun conference in montreal" },
      { src: "/ABOUT3.jpg", caption: "last time running the culture show" },
      { src: "/ABOUT4.jpg", caption: "harry potter ride at universal" },
      { src: "/ABOUT5.jpg", caption: "met king julian and alex at deca icdc" },
      { src: "/ABOUT6.jpg", caption: "i love toronto sunsets" },
      { src: "/ABOUT7.jpg", caption: "golf is so fun" },
      { src: "/ABOUT8.jpg", caption: "disneyland was awesome" },
      { src: "/ABOUT9.jpg", caption: "last dinner before uni started" },
      { src: "/ABOUT10.jpg", caption: "roommates" },
      { src: "/ABOUT11.jpg", caption: "matcha is so good — especially mango matcha" },
      { src: "/ABOUT12.jpg", caption: "valedictorian speech and grad" },
      { src: "/ABOUT13.jpg", caption: "first engineering contest (paramount after was delicious)" },
      { src: "/ABOUT14.jpg", caption: "scoops on the last day of classes" },
      { src: "/ABOUT15.jpg", caption: "prom!" },
      { src: "/ABOUT16.jpg", caption: "grad trip" },
      { src: "/ABOUT17.jpg", caption: "post arcadium breakfast" },
      { src: "/ABOUT18.jpg", caption: "i don't even know it's a long story" },
      { src: "/ABOUT19.jpg", caption: "morning sunrise" },
      { src: "/ABOUT21.jpg", caption: "openai office" },
      { src: "/ABOUT22.jpg", caption: "htn 2026!" },
      { src: "/ABOUT24.jpg", caption: "waterloo tech week" },
      { src: "/ABOUT25.jpg", caption: "world cup" },
      { src: "/ABOUT26.jpg", caption: "shenanigans" },
      { src: "/ABOUT27.jpg", caption: "pottery w/ crv" },
    ],
  },

  table: {
    title: "What's on the table",
    items: [
      { title: "Café", text: "Iced coffee and matcha experiments. Chicken shawarma hunts. Liverpool kits. Lego sets. CN Tower models." },
    ],
  },

  cafe: {
    title: "Café",
    intro: "What's on the table:",
    items: [
      "Iced coffee and matcha experiments",
      "Chicken shawarma hunts",
      "Liverpool kits",
      "Lego sets",
      "CN Tower models",
    ],
    cta: "Take a seat",
  },
} as const;

/**
 * Lounge = Personality. Relaxed, atmospheric.
 * Café = Optional place to talk. Non-transactional.
 */

export const loungeContent = {
  headline: "Lounge",
  blurb: "A few things I care about outside of work.",
  interests: [
    "Liverpool",
    "Toronto sports",
    "Cooking",
    "Aviation + terminals",
    "Theme parks / immersive design",
    "TCF + social impact",
    "Airline economics",
    "NYT puzzles",
  ],
} as const;

export const cafeContent = {
  intro: "You don't have to. But if you want to talk — work, ideas, or nothing in particular — the table's open.",
  cta: "Take a seat",
  sayHelloEmail: "mailto:hello@example.com?subject=Hello",
  askQuestionEmail: "mailto:hello@example.com?subject=A question",
} as const;

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

/**
 * About Me — editorial content. Minimal airport theme.
 */


export const aboutIntro =
  "I'm a second-year CS & Finance student at Waterloo. Right now I'm building AI tools for the legal team at Sagard and scouting student builders for OpenAI. On the side I ship things like Backseat and RocketShip.";

export const aboutPhotos = loungeRoomContent.photos.items;

/** F&B menu — food and drink on this flight */
export const aboutMenuItems = [
  "Iced coffee and mango matcha (non-negotiable)",
  "Chicken shawarma hunts across the GTA",
  "Steak nights when I actually have time to cook",
  "Cooking experiments that sometimes work",
  "Post-hackathon pizza at 2am",
];

/** In-flight magazine — lighter fun facts */
export const aboutFunFacts = [
  "Youngest intern at Alpen Capital, at 16",
  "Liverpool supporter since I was 10",
  "Paddington 2 is the best movie ever made",
  "I can talk about airplanes for way too long",
  "DECA International Finalist, FBLA National Champion",
  "High school valedictorian",
  "Toronto sunsets > almost everything else",
];

export const aboutWhatsUp = loungeRoomContent.cafe.items;

/** Safety card — personal interests */
export const aboutAmenities = [
  "Aviation nerd. Ask me about airline economics",
  "Liverpool, the Blue Jays and the Raptors",
  "How I Met Your Mother is my favourite show",
  "Golf, LEGO and the NYT puzzles",
];

/** Optional fieldnotes cards: title, date, one line */
export const aboutFieldnotes = [
  { title: "Window View", date: "Oct 2026", line: "Recent reflections on goals and direction." },
  { title: "What I'm Working On", date: "2026", line: loungeRoomContent.bookshelf.items.map((i) => i.text).slice(0, 2).join(" · ") },
];

export const aboutCaption = siteConfig.photoCaption;

/** Location stamps with optional links (YYZ, DXB, KHI) */
export const aboutLocationStamps = [
  { code: "YYZ", url: "https://www.destinationtoronto.com" },
  { code: "DXB", url: "https://www.visitdubai.com" },
  { code: "KHI", url: "https://en.wikipedia.org/wiki/Karachi" },
];

export const SHOP_COPY = [{code:"A02",city:"Karachi / Ridgeway",name:"Kitchen"},{code:"A03",city:"Dubai",name:"Café"},{code:"A04",city:"YYZ",name:"Souvenirs"}] as const;
export const FLAP_COLUMNS = ["Route", "Destination", "Status"] as const;
export const SCAN_CLEARANCE = ["Reading barcode", "Pass accepted", "Cleared for departure", "Two seconds to departure"] as const;
