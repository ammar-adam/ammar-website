"use client";

import Link from "next/link";
import { ShortPortfolioContent } from "@/components/sv/ShortPortfolioContent";
import "@/components/sv/short-version.css";

export default function ShortPortfolio() {
  return <div className="sp-standalone">
    <a className="short-skip" href="#short-page-about">Skip to content</a>
    <main className="short-sheet">
      <header className="sp-chrome"><div><Link className="sp-mark" href="/" aria-label="Ammar Adam — back to the terminal">a/a</Link><h2>The short version</h2></div><Link className="short-return" href="/">Terminal <span aria-hidden="true">↗</span></Link></header>
      <ShortPortfolioContent idPrefix="short-page" />
    </main>
  </div>;
}
