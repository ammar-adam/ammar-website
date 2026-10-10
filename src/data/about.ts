/**
 * About Me — editorial content. Minimal airport theme.
 */

import { loungeRoomContent } from "./loungeRoom";
import { siteConfig } from "./site";

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
