/**
 * About Me — editorial content. Minimal airport theme.
 */

import { loungeRoomContent } from "./loungeRoom";
import { siteConfig } from "./site";

export const aboutIntro =
  "I'm Ammar. I study Computer Science and Finance at the University of Waterloo. I build systems, work on startups, and care about clarity — in code and in how we communicate.";

export const aboutPhotos = loungeRoomContent.photos.items;

export const aboutWhatsUp = loungeRoomContent.cafe.items;

/** 6–10 highlight bullets for editorial About */
export const aboutHighlights = [
  "CS + Finance at University of Waterloo",
  "Building systems and startups",
  "Product and engineering roles",
  "Toronto, Dubai, Karachi",
  ...loungeRoomContent.cafe.items.slice(0, 5),
].slice(0, 10);

/** Optional fieldnotes cards: title, date, one line */
export const aboutFieldnotes = [
  { title: "Window View", date: "Feb 2026", line: "Recent reflections on goals and direction." },
  { title: "What I'm Working On", date: "2026", line: loungeRoomContent.bookshelf.items.map((i) => i.text).slice(0, 2).join(" · ") },
];

export const aboutCaption = siteConfig.photoCaption;
