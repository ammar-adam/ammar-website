/**
 * About Me — editorial content. Minimal airport theme.
 */

import { loungeContent } from "./lounge";
import { loungeRoomContent } from "./loungeRoom";
import { siteConfig } from "./site";

export const aboutIntro =
  "I'm Ammar. I study Computer Science and Finance at the University of Waterloo. I build systems, work on startups, and care about clarity — in code and in how we communicate.";

export const aboutInterests = loungeContent.interests;

export const aboutPhotos = loungeRoomContent.photos.items;

export const aboutWhatsUp = loungeRoomContent.cafe.items;

export const aboutCaption = siteConfig.photoCaption;
