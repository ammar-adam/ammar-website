import { loungeRoomContent } from "@/data/loungeRoom";

export type MemoryPhoto = {
  /** Index in the complete, canonical camera roll; used by PhotoGallery. */
  photoIndex: number;
  group: number;
  src: string;
  caption: string;
  /** Native dimensions preserve the composition on the concourse wall. */
  width: number;
  height: number;
  objectPosition?: string;
};

export const memoryGroups = [
  {
    title: "This is the rest.",
    copy: "Friends, roommates, and everything between the deadlines.",
  },
  {
    title: "It’s better with other people.",
    copy: "Big events. Small afternoons. I try to remember both.",
  },
  {
    title: "And then there’s this.",
    copy: "The cone is a longer story.",
  },
] as const;

function memory(
  photoIndex: number,
  group: number,
  width: number,
  height: number,
): MemoryPhoto {
  return { photoIndex, group, ...loungeRoomContent.photos.items[photoIndex], width, height };
}

/** Each group begins with its large landscape anchor, followed by two supports. */
export const memorySequence: MemoryPhoto[] = [
  memory(0, 0, 900, 675),   // Jeju: an open horizon and the whole group.
  memory(9, 0, 900, 675),   // Roommates: a quieter, close conversation.
  memory(11, 0, 900, 1200), // Graduation: an upright portrait balances the landscapes.
  memory(21, 1, 1100, 618), // Tech Week: the widest frame, the largest gathering.
  memory(20, 1, 1100, 1632), // HTN: retain the building and every row of faces.
  memory(24, 1, 1100, 732), // Pottery: close action after the two larger groups.
  memory(15, 2, 900, 675),  // Grad trip: the final group opens with people again.
  memory(17, 2, 900, 1200), // The cone: a tall, unexpected visual beat.
  memory(18, 2, 1100, 1196), // Sunrise: a quiet frame to finish the sequence.
];
