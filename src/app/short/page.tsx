import type { Metadata } from "next";
import ShortPortfolio from "./ShortPortfolio";
import "./short.css";

export const metadata: Metadata = {
  title: "Ammar Adam — the short version",
  description: "I study CS + Finance at Waterloo. Here's what I've built and where I've worked.",
};

export default function ShortPage() {
  return <ShortPortfolio />;
}
