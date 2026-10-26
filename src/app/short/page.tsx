import type { Metadata } from "next";
import ShortPortfolio from "./ShortPortfolio";
import "./short.css";

export const metadata: Metadata = {
  title: "Ammar Adam — the short version",
  description: "CS & Finance at Waterloo. AI engineering, projects, and the people I build with.",
};

export default function ShortPage() {
  return <ShortPortfolio />;
}
