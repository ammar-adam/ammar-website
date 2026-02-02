/**
 * Lounge room content — personal, reflective.
 */

export const loungeRoomContent = {
  window: {
    title: "Window View",
    paragraphs: [
      "Recent reflections on goals, direction, and what comes next.",
    ],
    date: "February 2026",
  },

  bookshelf: {
    title: "What I'm Working On",
    items: [
      { label: "", text: "Agentic trading systems" },
      { label: "", text: "WhatsApp automation for a commodities business" },
      { label: "", text: "Machine learning for football predictions" },
      { label: "", text: "Case competitions" },
      { label: "", text: "Trying to read more" },
      { label: "", text: "Cooking" },
    ],
  },

  photos: {
    title: "Moments",
    items: [
      { src: "/photos/photo1.jpg", caption: "somewhere between terminals" },
      { src: "/photos/photo2.jpg", caption: "the usual suspects" },
      { src: "/photos/photo3.jpg", caption: "3am debugging" },
      { src: "/photos/photo4.jpg", caption: "Anfield, finally" },
      { src: "/photos/photo5.jpg", caption: "Dubai skyline" },
      { src: "/photos/photo6.jpg", caption: "home for a bit" },
    ],
  },

  table: {
    title: "What's on the table",
    items: [
      { title: "Café", text: "Looking for Summer 2026 co-ops. Iced coffee and matcha experiments. Chicken shawarma hunts. Liverpool kits. Lego sets. CN Tower models." },
    ],
  },

  cafe: {
    title: "Café",
    intro: "What's on the table:",
    items: [
      "Looking for Summer 2026 co-ops",
      "Iced coffee and matcha experiments",
      "Chicken shawarma hunts",
      "Liverpool kits",
      "Lego sets",
      "CN Tower models",
    ],
    cta: "Take a seat",
  },
} as const;
