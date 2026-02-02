/**
 * Lounge room content — personal, reflective.
 * Update with your own thoughts, reading, projects, photos.
 */

export const loungeRoomContent = {
  window: {
    title: "Window View",
    paragraphs: [
      "I've been thinking about how airports are designed for forgetting. You're not supposed to remember being in one—you're supposed to move through.",
      "But I keep coming back to them. There's something about the in-between. The not-here-not-there. Toronto to Dubai to Karachi. CS to Finance. Building to shipping.",
      "Right now I'm focused on RocketShip—multi-agent equity research that actually works. Also thinking about airline route economics. Also trying to figure out what comes after 1B term.",
    ],
    date: "February 2026",
  },

  bookshelf: {
    title: "What I'm Reading",
    items: [
      { label: "Right now", text: "William Warwick series (Jeffrey Archer) — detective fiction that's well-constructed" },
      { label: "Recently finished", text: "Airline economics papers — route profitability models, hub vs point-to-point" },
      { label: "Always returning to", text: "Religious texts — been going deeper since November" },
      { label: "For work", text: "Multi-agent systems research, LLM reasoning papers, finance textbooks" },
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
      { title: "RocketShip", text: "Multi-agent equity research platform. Uses adversarial LLM debate to surface better insights. Been working on this since December. Finally getting somewhere." },
      { title: "Summer 2026", text: "Looking for the right co-op. Want something that's at the intersection of code and capital. Or just something where I'll learn a lot from good people." },
      { title: "Helping friends", text: "Probably spend more time helping friends with job apps and interviews than working on my own. That's fine. I learn from it." },
    ],
  },

  cafe: {
    title: "Café",
    intro: "You don't have to. But if you want to talk—about work, ideas, Liverpool's transfer strategy, airline economics, or nothing in particular—the table's open.",
  },
} as const;
