/**
 * About Me — editorial content. Minimal airport theme.
 */

import { loungeRoomContent } from "./loungeRoom";
import { siteConfig } from "./site";

export const aboutIntro =
  "I'm a first-year Computer Science & Finance student at the University of Waterloo. I love building and trying new things while figuring it all out in the process.";

export const aboutPhotos = loungeRoomContent.photos.items;

export const aboutWhatsUp = loungeRoomContent.cafe.items;

/** IN-FLIGHT ENTERTAINMENT — amenities list */
export const aboutAmenities = [
  "I love cooking and eating food: from shawarma and steaks, to iced coffee and matcha",
  "Super passionate about airplanes and aviation",
  "How I Met Your Mother is my favourite show ever. And, Paddington 2 is the best movie ever",
  "I'm a massive sports fan. Liverpool, the Toronto Blue Jays, and the Raptors",
];

/** Optional fieldnotes cards: title, date, one line */
export const aboutFieldnotes = [
  { title: "Window View", date: "Feb 2026", line: "Recent reflections on goals and direction." },
  { title: "What I'm Working On", date: "2026", line: loungeRoomContent.bookshelf.items.map((i) => i.text).slice(0, 2).join(" · ") },
];

export const aboutCaption = siteConfig.photoCaption;

/** Location stamps with optional links (YYZ, DXB, KHI) */
export const aboutLocationStamps = [
  { code: "YYZ", url: "https://www.destinationtoronto.com" },
  { code: "DXB", url: "https://www.visitdubai.com" },
  { code: "KHI", url: "https://en.wikipedia.org/wiki/Karachi" },
];
