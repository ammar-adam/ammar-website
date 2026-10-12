/**
 * Everything on the homepage lives here.
 * Keep lines short and lowercase. One line per thing.
 */

export interface Item {
  name: string;
  url: string;
  role?: string;
  note: string;
}

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
    url: "https://alpencapital.com/",
    role: "m&a analyst",
    note: "youngest intern there, at 16. $50m+ in deal flow.",
  },
  {
    name: "datastealth",
    url: "https://datastealth.io/",
    role: "product engineering",
    note: "built a demo environment that cut sales-demo setup from months to hours.",
  },
  {
    name: "sagard",
    url: "https://www.sagard.com/",
    role: "ai engineer",
    note: "building legal ai tools and doppel, a local computer-use agent.",
  },
  {
    name: "waterloo venture group",
    url: "https://www.waterloovg.com/",
    role: "partner innovation lead",
    note: "connecting startups with a 1,300+ member student ecosystem.",
  },
  {
    name: "waterloo tech week / hack the north",
    url: "https://waterlootechweek.ca/",
    role: "organizer",
    note: "70 events, and the rubric that picks who gets into htn.",
  },
  {
    name: "openai",
    url: "https://openai.com/",
    role: "founding builder lead",
    note: "one of 5 in north america. scouting student builders.",
  },
  {
    name: "pear vc",
    url: "https://pear.vc/",
    role: "fellow",
    note: "one of ~50 from 650+ applicants.",
  },
];

export const projects: Item[] = [
  {
    name: "backseat",
    url: "https://backseatnav.com/",
    note: "make your gps iconic. character voices for waze, installed in one tap.",
  },
  {
    name: "rocketship",
    url: "https://rocketshipstocks.vercel.app/",
    note: "multi-agent equity research. a simple momentum baseline beat it, which was the interesting part.",
  },
  {
    name: "canadaclip",
    url: "https://github.com/ammar-adam/canada-clip-hackcanada",
    note: "ios app clip that sends big-brand product links to canadian small businesses.",
  },
  {
    name: "risk-optimized portfolio",
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
