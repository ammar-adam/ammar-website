/**
 * Departures = Projects as flights.
 * Seat map order: 1A, 1B, 2A, 2B, 3A, 3B.
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

export const projects: Project[] = [
  {
    slug: "rocketship",
    name: "Rocketship",
    year: "2026",
    destination: "To the moon!",
    flightCode: "RS493",
    routeName: "Multi-agent equity research and stock picker",
    gate: "A",
    status: "Boarding",
    shortDesc: "Screening S&P 500 stocks to find undervalued rocketships through technical scoring and agentic debate",
    screenshot: "/ROCKETSHIP.png",
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
    slug: "zarf",
    name: "Zarf",
    year: "2026",
    destination: "Awareness",
    flightCode: "ZARF21",
    routeName: "Building clarity and intention in relationships",
    gate: "B",
    status: "Boarding",
    shortDesc: "Finding areas of difference through double-blind conflict resolution and financial stress tests.",
    screenshot: "/ZARF.png",
    seats: [
      {
        id: "main",
        label: "Links",
        content: "",
        links: [
          { label: "View Project", url: "https://usezarf.vercel.app/" },
          { label: "GitHub", url: "https://github.com/ammar-adam/zarf" },
        ],
      },
    ],
  },
  {
    slug: "risk-optimized-equity-system",
    name: "Risk-Free Equity System",
    year: "2025",
    destination: "Risk-Free",
    flightCode: "BETA16",
    routeName: "Portfolio construction for risk-averse investors",
    gate: "C",
    status: "Boarding Closed",
    shortDesc: "Using volatility and covariance to create a portfolio allocation using convex optimization",
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
    slug: "dollar-seeds",
    name: "Dollar Seeds",
    year: "2024-25",
    destination: "Financial Freedom",
    flightCode: "CAN25",
    routeName: "Financial literacy for Canadian immigrants",
    gate: "D",
    status: "Boarding",
    shortDesc: "Built a team of volunteers to create resources in 5 languages, getting approval from Ontario's Associate Minister of Small Business.",
    screenshot: "/DOLARSEEDS.png",
    seats: [
      {
        id: "main",
        label: "Links",
        content: "",
        links: [
          { label: "View Project", url: "https://dollarseeds.typedream.app/" },
          { label: "More", url: "https://www.linkedin.com/posts/ammar-adam_had-the-pleasure-of-meeting-mississauga-streetsville-activity-7257135182573453312-jtfb/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAC8vrDUBjNRa1oP20m7X93vdsiFuxMFdNfE" },
        ],
      },
    ],
  },
  {
    slug: "mycelia",
    name: "Mycelia",
    year: "2025",
    destination: "Net-Zero",
    flightCode: "UT11",
    routeName: "Addressing urban heat island through social engineering",
    gate: "E",
    status: "Departed",
    shortDesc: "Made a mock platform to incentivize sustainable community actions through an online marketplace.",
    screenshot: "/MYCELIA.png",
    seats: [
      {
        id: "main",
        label: "Links",
        content: "",
        links: [
          { label: "More", url: "https://docs.google.com/presentation/d/1ivJBlUKZDNLKWIadJ0rmzyYHV51_MKKhiDM0g-OYWW0/edit?slide=id.g34d8998f368_15_45#slide=id.g34d8998f368_15_45" },
        ],
      },
    ],
  },
  {
    slug: "mentor-college-deca",
    name: "DECA",
    year: "2021-25",
    destination: "Internationals!",
    flightCode: "MC07",
    routeName: "Set school records and ate lots of sushi",
    gate: "F",
    status: "Departed",
    shortDesc: "Led Mentor DECA to a top 100/4400 chapter in the world, regularly winning awards at the biggest stage.",
    screenshot: "/DECA.jpg",
    seats: [
      {
        id: "main",
        label: "Links",
        content: "",
        links: [
          { label: "More", url: "https://www.instagram.com/p/DF5X_EHMp-q/?img_index=2" },
        ],
      },
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
