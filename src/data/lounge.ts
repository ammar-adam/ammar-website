/**
 * Lounge = Personality. Relaxed, atmospheric.
 * Café = Optional place to talk. Non-transactional.
 */

export const loungeContent = {
  headline: "Lounge",
  blurb: "A few things I care about outside of work.",
  interests: [
    "Liverpool",
    "Toronto sports",
    "Cooking",
    "Aviation + terminals",
    "Theme parks / immersive design",
    "TCF + social impact",
    "Airline economics",
    "NYT puzzles",
  ],
} as const;

export const cafeContent = {
  intro: "You don't have to. But if you want to talk — work, ideas, or nothing in particular — the table's open.",
  cta: "Take a seat",
  sayHelloEmail: "mailto:hello@example.com?subject=Hello",
  askQuestionEmail: "mailto:hello@example.com?subject=A question",
} as const;
