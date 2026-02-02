/**
 * Departures = Projects as flights.
 * Seatmap: A1=Overview, A2=Problem, B1=Architecture, B2=Demo, C1=Reflection
 * Status: BOARDING, BOARDING CLOSED, DELAYED, DEPARTED
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
  year: string;
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
    year: "2026",
    destination: "RocketShip",
    flightCode: "RS493",
    routeName: "Multi-agent equity research and stock picker",
    gate: "A12",
    status: "Boarding",
    shortDesc: "Multi-agent equity research and stock picker.",
    screenshot: "/placeholders/screenshot.svg",
    seats: [
      {
        id: "A1",
        label: "Overview",
        content:
          "RocketShip is an equity research system built to explore upside-focused investing. It ingests historical price data across a large universe of stocks, scores each ticker using a mix of fundamental and technical signals, and evaluates candidates through a structured, multi-agent debate process. Once a set of stocks is selected, the system applies convex optimization to generate a portfolio allocation.",
      },
      {
        id: "A2",
        label: "Problem",
        content:
          "Before RocketShip, I built a system designed for risk-averse investors. That project was focused on minimizing downside and managing volatility. It worked, but it left me with a different question. What happens if risk is not the primary constraint? I wanted to see whether a system could reason about markets, argue internally about opportunities, and still produce structured decisions without anchoring everything to protection and hedging.",
      },
      {
        id: "B1",
        label: "Architecture",
        content:
          "RocketShip follows a clear pipeline:\n\nIngest historical price data across hundreds of tickers\nScore each ticker using derived signals\nRun a multi-agent debate with distinct analytical roles\nSelect final stock candidates based on the debate output\nApply convex optimization to allocate capital\n\nEach stage is modular and observable. That made it easier to test assumptions, replace components, and understand where decisions were coming from.",
      },
      {
        id: "B2",
        label: "Demo",
        content: "",
        links: [
          { label: "Ticker Ingestion and Scoring", url: "https://www.loom.com/share/dcc9e7329bbd4486bb5704994dc79317" },
          { label: "Agentic Debate and Portfolio Allocation", url: "https://www.loom.com/share/9df9303e6d7742838730fdc1ff5bff29" },
          { label: "App", url: "https://rocketshipstocks.vercel.app/" },
          { label: "GitHub", url: "https://github.com/ammar-adam/rocketship" },
        ],
      },
      {
        id: "C1",
        label: "Reflection",
        content:
          "RocketShip forced me to be explicit about how decisions are made inside a system. Removing constraints increased creativity, but only when the structure underneath was solid.",
      },
    ],
  },
  {
    slug: "zarf",
    year: "2026",
    destination: "ZARF",
    flightCode: "HLAL21",
    routeName: "Building clarity and intention in relationships",
    gate: "B3",
    status: "Boarding Closed",
    shortDesc: "Building clarity and intention in relationships.",
    screenshot: "/placeholders/screenshot.svg",
    seats: [
      {
        id: "A1",
        label: "Overview",
        content:
          "ZARF is a lightweight platform designed to help people build clarity and intention in relationships. It focuses on reflection and alignment rather than speed or engagement.",
      },
      {
        id: "A2",
        label: "Problem",
        content:
          "A lot of tools in this space optimize for immediacy. I wanted to build something slower. Something that helps people think before acting and articulate what they actually want.",
      },
      {
        id: "B1",
        label: "Architecture",
        content:
          "ZARF uses structured prompts and simple persistence to capture thoughts over time. The interface stays intentionally minimal to reduce cognitive noise.",
      },
      {
        id: "B2",
        label: "Demo",
        content: "",
        links: [
          { label: "App", url: "https://usezarf.vercel.app/" },
          { label: "GitHub", url: "https://github.com/ammar-adam/zarf" },
        ],
      },
      {
        id: "C1",
        label: "Reflection",
        content:
          "This project reinforced the idea that good systems do not force outcomes. They create space for better decisions.",
      },
    ],
  },
  {
    slug: "risk-optimized",
    year: "2025",
    destination: "Risk Optimized Portfolio System",
    flightCode: "BETA16",
    routeName: "Portfolio construction for risk-averse investors",
    gate: "C7",
    status: "Boarding Closed",
    shortDesc: "Portfolio construction for risk-averse investors.",
    screenshot: "/placeholders/screenshot.svg",
    seats: [
      {
        id: "A1",
        label: "Overview",
        content:
          "This system was built for investors who care more about stability than returns. It evaluates a universe of equities, scores volatility and correlation, and constructs a minimum variance portfolio using convex optimization.",
      },
      {
        id: "A2",
        label: "Problem",
        content:
          "Most retail tools emphasize performance without explaining risk. I wanted to build something that makes conservative portfolio construction transparent and explainable.",
      },
      {
        id: "B1",
        label: "Architecture",
        content:
          "The system loads historical market data, computes volatility and covariance matrices, and applies minimum variance optimization to generate portfolio weights.",
      },
      {
        id: "B2",
        label: "Demo",
        content: "",
        links: [
          { label: "Demo Video", url: "https://www.loom.com/share/f9d68d48cef5487896156f55c5669271" },
          { label: "GitHub", url: "https://github.com/ammar-adam/risk-optimized-equity-system" },
        ],
      },
      {
        id: "C1",
        label: "Reflection",
        content:
          "This project shaped how I think about tradeoffs, constraints, and designing for specific user profiles.",
      },
    ],
  },
  {
    slug: "dollar-seeds",
    year: "2024-25",
    destination: "Dollar Seeds",
    flightCode: "CAN25",
    routeName: "Financial literacy for Canadian immigrants",
    gate: "D4",
    status: "Delayed",
    shortDesc: "Financial literacy for Canadian immigrants.",
    screenshot: "/placeholders/screenshot.svg",
    seats: [
      {
        id: "A1",
        label: "Overview",
        content:
          "Dollar Seeds is a financial literacy initiative built to support Canadian immigrants. The focus is on accessibility, language inclusion, and practical education around banking and financial systems.",
      },
      {
        id: "A2",
        label: "Problem",
        content:
          "Many immigrants arrive without a clear understanding of the financial system. Resources are fragmented, and support networks are often informal or inaccessible.",
      },
      {
        id: "B1",
        label: "Architecture",
        content:
          "Dollar Seeds combined student-led volunteering, multilingual content, workshops, and policy engagement. The project was presented to Nina Tangri, Ontario's Associate Minister of Small Business.",
      },
      {
        id: "B2",
        label: "Demo",
        content: "",
        links: [{ label: "Website", url: "https://dollarseeds.typedream.app/" }],
      },
      {
        id: "C1",
        label: "Reflection",
        content:
          "Dollar Seeds taught me that impact scales fastest when systems are designed with empathy rather than assumptions.",
      },
    ],
  },
  {
    slug: "mycelia",
    year: "2025",
    destination: "Mycelia",
    flightCode: "UT11",
    routeName: "Addressing urban heat through social engineering",
    gate: "E9",
    status: "Departed",
    shortDesc: "Addressing urban heat through social engineering.",
    screenshot: "/placeholders/screenshot.svg",
    seats: [
      {
        id: "A1",
        label: "Overview",
        content:
          "Mycelia started as CoolTOgether during a University of Toronto engineering competition and evolved through work at Oxford. The project explores how social systems can help address urban heat.",
      },
      {
        id: "A2",
        label: "Problem",
        content:
          "Urban heat islands disproportionately affect dense cities. Infrastructure alone does not solve the problem. Behavior and incentives matter just as much.",
      },
      {
        id: "B1",
        label: "Architecture",
        content:
          "The concept focused on community marketplaces, participation loops, and localized incentives rather than centralized infrastructure.",
      },
      {
        id: "B2",
        label: "Demo",
        content: "",
        links: [
          { label: "Mycelia Presentation", url: "https://docs.google.com/presentation/d/1ca7iNnVcBOWLLmxxXFRkIaQUJUtyUfX_iauGV2-xryc/edit" },
          { label: "CoolTOgether Presentation", url: "https://docs.google.com/presentation/d/1ya46MKm54nb8t26XVhJJZKaI3iYSy2TTDEx1PcqOpss/edit" },
        ],
      },
      {
        id: "C1",
        label: "Reflection",
        content:
          "This project shifted how I think about climate solutions toward people-first design.",
      },
    ],
  },
  {
    slug: "high-school",
    year: "2021-25",
    destination: "High School",
    flightCode: "MC07",
    routeName: "Good times, fun times, and everything in between",
    gate: "F2",
    status: "Departed",
    shortDesc: "Good times, fun times, and everything in between.",
    screenshot: "/placeholders/screenshot.svg",
    seats: [
      {
        id: "A1",
        label: "Overview",
        content:
          "High school was where I learned how to lead, build teams, and try things without overthinking the outcome.",
      },
      {
        id: "A2",
        label: "Awards",
        content: `DECA
Top 20 internationally
Two-time provincial champion
Two-time regional champion
Eighteen total awards in entrepreneurship

FBLA
Second nationally
Top ten nationally
International Business category

Model UN
Best Delegate at ACMUN Ad Hoc
Best Delegate at KingsMUN EPL
Best Delegate at OxfordMUN Berkeley Venture Capital Committee`,
      },
      {
        id: "B1",
        label: "Reflection",
        content:
          "Mentor College gave me space to try, fail publicly, and enjoy the process.",
      },
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
