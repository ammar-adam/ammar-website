"use client";

import { ShortPortfolioContent } from "@/components/sv/ShortPortfolioContent";
import { ShortColorField } from "./ShortColorField";

export default function ShortPortfolio() {
  return <div className="short-page">
    <ShortColorField />
    <a className="short-skip" href="#short-about">Skip to content</a>
    <main className="short-content"><ShortPortfolioContent idPrefix="short" /></main>
  </div>;
}
