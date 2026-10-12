/**
 * Everything on the homepage lives here.
 * Keep lines short and lowercase. One line per thing.
 */

export interface Item {
  name: string;
  url: string;
  role?: string;
  note: string;
  /** Three-letter flight code for the board. */
  code: string;
  /** Airport code of the city it happened in. */
  city?: string;
  /** Still going? */
  now?: boolean;
}

/** Cities in the order life went, for the route map. */
export const cities = [
  { code: "KHI", name: "karachi", note: "one of three homes." },
  { code: "DXB", name: "dubai", note: "m&a at alpen capital, at 16." },
  { code: "YYZ", name: "toronto", note: "home base. datastealth, then sagard." },
  { code: "YKF", name: "waterloo", note: "cs & finance, wvg, tech week, hack the north." },
  { code: "SFO", name: "bay area", note: "openai and pear vc." },
];

export const resumeUrl = "/Ammar_Adam.pdf";

export const links = [
  { label: "email", url: "mailto:ammar.adam@uwaterloo.ca" },
  { label: "github", url: "https://github.com/ammar-adam" },
  { label: "linkedin", url: "https://www.linkedin.com/in/ammar-adam/" },
  { label: "x", url: "https://x.com/ammaradam_5807" },
  { label: "resume", url: resumeUrl },
];

export const experience: Item[] = [
  {
    name: "alpen capital",
    code: "ALP",
    city: "DXB",
    url: "https://alpencapital.com/",
    role: "m&a analyst",
    note: "youngest intern there, at 16. $50m+ in deal flow.",
  },
  {
    name: "datastealth",
    code: "DST",
    city: "YYZ",
    url: "https://datastealth.io/",
    role: "product engineering",
    note: "built a demo environment that cut sales-demo setup from months to hours.",
  },
  {
    name: "sagard",
    code: "SGD",
    city: "YYZ",
    now: true,
    url: "https://www.sagard.com/",
    role: "ai engineer",
    note: "building legal ai tools and doppel, a local computer-use agent.",
  },
  {
    name: "waterloo venture group",
    code: "WVG",
    city: "YKF",
    now: true,
    url: "https://www.waterloovg.com/",
    role: "partner innovation lead",
    note: "connecting startups with a 1,300+ member student ecosystem.",
  },
  {
    name: "waterloo tech week / hack the north",
    code: "HTN",
    city: "YKF",
    url: "https://waterlootechweek.ca/",
    role: "organizer",
    note: "70 events, and the rubric that picks who gets into htn.",
  },
  {
    name: "openai",
    code: "OAI",
    city: "SFO",
    now: true,
    url: "https://openai.com/",
    role: "founding builder lead",
    note: "one of 5 in north america. scouting student builders.",
  },
  {
    name: "pear vc",
    code: "PVC",
    city: "SFO",
    now: true,
    url: "https://pear.vc/",
    role: "fellow",
    note: "one of ~50 from 650+ applicants.",
  },
];

export const projects: Item[] = [
  {
    name: "backseat",
    code: "BKS",
    now: true,
    url: "https://backseatnav.com/",
    note: "make your gps iconic. character voices for waze, installed in one tap.",
  },
  {
    name: "rocketship",
    code: "RKT",
    now: true,
    url: "https://rocketshipstocks.vercel.app/",
    note: "multi-agent equity research. a simple momentum baseline beat it, which was the interesting part.",
  },
  {
    name: "canadaclip",
    code: "CCL",
    url: "https://github.com/ammar-adam/canada-clip-hackcanada",
    note: "ios app clip that sends big-brand product links to canadian small businesses.",
  },
  {
    name: "risk-optimized portfolio",
    code: "ROP",
    url: "https://github.com/ammar-adam/risk-optimized-equity-system",
    note: "lowest-risk allocations with convex optimization.",
  },
];

export const photos = [
  { src: "/ABOUT1.jpg", caption: "soccer on jeju island" },
  { src: "/ABOUT6.jpg", caption: "toronto sunsets" },
  { src: "/ABOUT12.jpg", caption: "valedictorian speech" },
  { src: "/ABOUT7.jpg", caption: "golf is so fun" },
  { src: "/ABOUT11.jpg", caption: "mango matcha" },
  { src: "/ABOUT5.jpg", caption: "deca icdc" },
  { src: "/ABOUT10.jpg", caption: "roommates" },
  { src: "/ABOUT16.jpg", caption: "grad trip" },
];
