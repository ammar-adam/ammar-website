# Brief: one variant of Ammar Adam's personal site

You are building ONE of three experimental variants of a personal site for Ammar Adam, a
second-year CS & Finance student at Waterloo who grew up between Toronto, Dubai and Karachi.
The site's theme is an airport terminal. The owner will pick one variant; the others are deleted.

## Non-negotiables (he has rejected work for breaking these)

- **Taste bar is high.** He rejected three previous attempts as "slop": generic card layouts,
  stacked boxes, SVG illustrations of planes/skylines, template-looking sections, "every
  section looks like a different site". Craft > concept. If a detail would look like a
  template, don't ship it.
- **Coherent.** One visual language from top to bottom. Every section must obviously belong to
  the same site. Reuse the same few objects and rhythms; don't invent a new container per section.
- **Type:** Inter (body, headings) + JetBrains Mono (labels, codes, board text). They're loaded
  via `--font-body` / `--font-mono` (also `--sans` / `--mono`). No display serifs, no condensed
  uppercase display faces. Headings are Inter, weight 600–700, tight tracking, like the old site.
- **Palette and feel:** the OLD site's warm off-white / amber day theme and the deep blue-grey
  night theme, both already defined in `src/app/globals.css` (`--bg`, `--surface`, `--text`,
  `--dim`, `--faint`, `--line`, `--accent`, `--brd-*` for the dark board). Soft, tactile,
  rounded, hairlines. Mono eyebrow labels like `GATE A · DEPARTURES`. This is "clearly him".
- **Story, not pages.** One continuous scroll that reads as walking through a terminal, with
  **pinned scenes** (a section sticks while you scroll and something happens), like jeremysu.ca.
  About five scenes. Total page length roughly 6–9 viewport heights. Not a stack of old pages.
- **Talk less.** Minimal copy. Labels plain and instantly readable. Never force the metaphor:
  content is never mapped onto plane parts; nothing cute that costs legibility.
- **Reference vibes:** jeremysu.ca (a journey with scenes), iankorovinsky.ca and
  shayaanazeem.com (one calm column, tiny copy, a plain table or image grid, nothing decorative
  that isn't content). Clean and concise like those two, a journey like Jeremy.
- No photo of his face. Place/people photos are fine (`public/ABOUT*.jpg` have captions in
  `src/data/loungeRoom.ts`), but optional.
- Day/night must both look finished. Mobile (390px) must be clean, no horizontal overflow.
- Respect `prefers-reduced-motion` (framer-motion `MotionConfig reducedMotion="user"` is already
  on; CSS animations need the media query).

## Content (already correct; import, don't retype)

- Experience, in order: `arrivals` from `src/data/arrivals.ts` (Alpen Capital → DataStealth →
  Sagard → Waterloo Venture Group → Waterloo Tech Week / Hack the North → OpenAI → Pear VC).
  Fields: from, fromUrl, image, origin (city), title, detailTitle, impact, details, links.
- Projects: `projects` from `src/data/departures.ts` (Rocketship, CanadaClip, Risk-Optimized
  Portfolio, Backseat). `screenshot` is an image except CanadaClip (`/CANADACLIP.mp4` doesn't
  exist); for CanadaClip use `https://img.youtube.com/vi/JzYwfPrcPtM/maxresdefault.jpg`.
  Links are in `seats[0].links`.
- Resume: `/Ammar_Adam.pdf` (`boardingPassConfig` in `src/data/boardingPass.ts`).
- Socials: `siteConfig.socialLinks` in `src/data/site.ts`.
- About copy you may use (keep it this short or shorter): "I grew up between Toronto, Dubai
  and Karachi, so a lot of my life happened in departure halls. This site lives in one." /
  "Liverpool since I was ten. Paddington 2 is the best movie ever made. Ask me about airline
  economics, mango matcha, or the best shawarma in the GTA."
- One-line intro: "CS & Finance at Waterloo. Building AI tools at Sagard, scouting student
  builders for OpenAI, shipping things on the side."

## What exists for you to use

- `src/app/globals.css` is the OLD site's full stylesheet (3,900 lines). It has finished styles
  for the objects he likes: the arched window (`.window`, `.win-inner`, `.sky*`, `.win-frame`,
  `.flight-card`), the split-flap board (`.fboard`, `.fboard-head`, `.fboard-cols`,
  `.fboard-row`, `.sf-cell` flap cells, `.st-amber/.st-green` statuses), the ticker (`.ticker`,
  `.ticker-track`), the baggage carousel (`.claim`, `.carousel`, `.belt-track`, `.bag`), the
  seat map (`.cabin`, `.seat-row`, `.pseat`, `.seat-svg`), the open suitcase project card
  (`.case-open`, `.case-lid`, `.case-body`), the boarding pass (`.intro-boarding-pass-card`,
  `.pass-header`, `.pass-body`, `.pass-stub`), buttons (`.btn`, `.btn.solid`), `.kicker`,
  `.wrap`, `.masthead`. Grep it before writing new CSS; prefer reusing these classes so the
  result stays "him". Tailwind v4 utilities are also available.
- `src/legacy/*.tsx`: old components restored for reference and reuse (`FlapText`,
  `DeparturesBoardDisplay`, `BaggageCarousel`, `BaggageCard`, `SeatMap`, `BoardingPassViewer`,
  `DetailsPanel`, `PersonalTicker`, `MovingWalkway`, `LuggageScatter`, `BaggageTrolley`,
  `PlaneIcon`, `RunwayLine`, `TerminalClock`, `PerforationDivider`, `AirportIcon`). Some have
  old nav links or page chrome; copy what you need into your variant rather than importing
  wholesale if it drags in page chrome.
- `src/variants/shared/Shell.tsx`: `Sky` (the old fixed sky background: gradient, clouds, cloud
  video, grain, a plane crossing), `TopBar({ here, variant })` (brand, a "you are here" slot,
  Toronto clock, day/night toggle), `useTheme`, `useClock`. Use `Sky` and `TopBar`.
- `src/variants/shared/Flap.tsx`: a split-flap text component (`<Flap value length stagger step
  className />`, cells styled by `.flap-cell` in... NOTE: its CSS was removed; if you use it,
  style `.flap`, `.flap-cell`, `.flap-half`, `.flap-top`, `.flap-bot`, `.flap-leaf*` in your
  variant CSS, or use `src/legacy/FlapText.tsx` whose `.sf-*` styles exist in globals).
- `src/variants/shared/Reveal.tsx`: `Lines` (masked line reveal) and `Fade` helpers.
- framer-motion 12 (`useScroll`, `useTransform`, `useSpring`, `useMotionValueEvent`,
  `AnimatePresence`) for pinned/scroll-driven scenes. Pattern: a tall section
  (`height: N * 100svh`) with a `position: sticky; top: 0; height: 100svh` child, progress from
  `useScroll({ target, offset: ["start start", "end end"] })`.
- Old photos: `public/ALPENCAPITAL.jpg`, `DATASTEALTH.jpg`, `SAGARD.jpg`, `WATERLOOVG.jpg`,
  `HTN_ORGANIZER.jpg`, `OPENAI.jpg`, `PEARVC.jpg` (experience images, already referenced in
  data), `ROCKETSHIP.png`, `RISKFREE.png`, `BACKSEAT.png`, `/airport-icons/*.svg` (plane-side,
  plane-top, suitcase-1, suitcase-2, carryon, trolley, boarding-pass, window, coffee-cup,
  gate-sign).

## Where your code goes (touch nothing else)

- `src/variants/<x>/Variant.tsx` exporting `Variant<X>` (already a placeholder; replace it).
  Add more files under `src/variants/<x>/` freely.
- `src/variants/<x>/<x>.css` (imported by Variant.tsx). Put ALL your new CSS here, scoped under
  a root class like `.va` / `.vb` / `.vc` so variants never collide. You may still use the old
  global classes.
- Do NOT edit `src/app/globals.css`, `src/app/layout.tsx`, `src/variants/shared/*`,
  `src/legacy/*`, `src/data/*`, or other variants. If a legacy component needs a tweak, copy
  it into your folder first.
- The route `src/app/<x>/page.tsx` already renders your component. The page must start with
  `<Sky />` and `<TopBar variant="X" here={...} />` from shared; `here` should show the current
  stop (e.g. "Departures · 1 min walk") driven by an IntersectionObserver.
- Keep the whole thing a client component tree (files start with `"use client"`).

## Verify before you finish

- `npx tsc --noEmit` and `npm run lint` from the repo root must pass with zero output/errors.
  Do NOT run `npm run build` (it breaks the running dev server).
- A dev server is already running at http://localhost:3123 (hot reload). Your route is
  http://localhost:3123/<x>. Screenshot it with headless Chrome via Playwright: there is a
  ready script at
  `C:/Users/aaamm/AppData/Local/Temp/claude/C--Users-aaamm-AppData-Roaming-Claude-scratch-workspaces-08cad2c3-1bb4-4d4f-b834-6a7c58cc949e-72b09c50-b4c6-42ea-b05f-612de8239fc2-scratch-2026-10-17-505b81/d8aca913-7305-4c2d-a500-8d0b9c440861/scratchpad/shoot/`
  with `node_modules/playwright-core` installed; copy `shoot.mjs` to `shoot-<x>.mjs`, change
  the URL to your route and the selectors to your sections, and write PNGs into
  `.../scratchpad/shots/<x>/`. Scroll with `behavior: "instant"` (smooth scroll lags in
  headless). Chrome is at `C:/Program Files/Google/Chrome/Application/chrome.exe`.
- Look at your screenshots at 1440×900 and 390×844, day and night. Critique them honestly
  against the bar above and iterate at least twice. Check: no horizontal overflow, nothing
  clipped, nothing overlapping the top bar, every scene legible, type sizes consistent, the
  same vocabulary everywhere. Make sure your pinned scenes actually work at several scroll
  positions.
- Do not commit. When done, reply with: the scene list (one line each), what the recurring
  visual vocabulary is, any content you added, paths of your final screenshots, and anything
  you couldn't make work.
