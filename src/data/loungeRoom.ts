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
      { src: "/ABOUT1.jpg", caption: "" },
      { src: "/ABOUT2.jpg", caption: "" },
      { src: "/ABOUT3.jpg", caption: "" },
      { src: "/ABOUT4.jpg", caption: "" },
      { src: "/ABOUT5.jpg", caption: "" },
      { src: "/ABOUT6.jpg", caption: "" },
      { src: "/ABOUT7.jpg", caption: "" },
      { src: "/ABOUT8.jpg", caption: "" },
      { src: "/ABOUT9.jpg", caption: "" },
      { src: "/ABOUT10.jpg", caption: "" },
      { src: "/ABOUT11.jpg", caption: "" },
      { src: "/ABOUT12.jpg", caption: "" },
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
