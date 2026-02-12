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
      { src: "/ABOUT1.jpg", caption: "core memory — playing soccer on jeju island" },
      { src: "/ABOUT2.jpg", caption: "first mun conference in montreal" },
      { src: "/ABOUT3.jpg", caption: "last time running the mentor college culture show" },
      { src: "/ABOUT4.jpg", caption: "harry potter ride at universal" },
      { src: "/ABOUT5.jpg", caption: "met king julian and alex at deca icdc" },
      { src: "/ABOUT6.jpg", caption: "i love toronto sunsets" },
      { src: "/ABOUT7.jpg", caption: "golf is so fun" },
      { src: "/ABOUT8.jpg", caption: "disneyland was awesome" },
      { src: "/ABOUT9.jpg", caption: "last dinner before uni started" },
      { src: "/ABOUT10.jpg", caption: "roommates" },
      { src: "/ABOUT11.jpg", caption: "matcha is so good — especially mango matcha" },
      { src: "/ABOUT12.jpg", caption: "valedictorian speech and grad" },
      { src: "/ABOUT13.jpg", caption: "first engineering contest (paramount after was delicious)" },
      { src: "/ABOUT14.jpg", caption: "scoops on the last day of classes" },
      { src: "/ABOUT15.jpg", caption: "prom!" },
      { src: "/ABOUT16.jpg", caption: "grad trip" },
      { src: "/ABOUT17.jpg", caption: "post arcadium breakfast" },
      { src: "/ABOUT18.jpg", caption: "i don't even know it's a long story" },
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
