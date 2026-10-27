# Ammar Adam

[ammaradam.com](https://ammaradam.com) — my personal site, told through a 3D airport inspired by *Spider-Man: Into the Spider-Verse*.

A short opening film leads into a terminal you explore by scrolling: check in, pass through security, walk the concourse, and scan a boarding pass. An [About me page](https://ammaradam.com/short) offers a direct way to read my experience and projects.

## The experience

- **Introduction:** a six-second film recorded from the airport scene. The first caption, Skip intro, and About me are visible from the start. The interactive world starts after the film finishes or is skipped.
- **Check-in:** five experiences, with animated luggage and a counter that changes with the story. Each entry has a brief introduction and a Details dialog.
- **Security:** four projects, including community work, presented through inspection trays and a changing display.
- **Concourse:** photographs, food, music, film, and sports references placed among shops and cafés. Toronto, Dubai, and Karachi run through the artwork. Drag horizontally to look around.
- **Gate:** scanning the boarding-pass barcode triggers a scan, ticket tear, and takeoff, then opens the résumé PDF in the same tab after two seconds.

On phones, native swipes drive the camera and captions; Back/Next controls travel along the same path. Reduced motion skips the film, uses stationary room views, and opens the résumé immediately. About me uses two columns on desktop and a naturally scrolling single column on phones.

## Stack

Next.js 16 App Router, React 19, TypeScript 5, Three.js, Framer Motion 12, and Tailwind CSS 4. Hosted on Vercel.

The terminal uses real-time 3D geometry, an articulated traveler, painted materials, lighting, and a WebGL post-processing pass. The opening film ships in desktop, phone portrait, and phone landscape formats, with H.264 and capability-selected AV1 versions.

## Local development

Requires Node.js **20.9 or newer** and npm. On Windows, keep the checkout path short, such as `C:\dev\site`, to avoid Turbopack path-length problems.

```powershell
git clone https://github.com/ammar-adam/ammar-website.git C:\dev\site
cd C:\dev\site
npm install
npm run tw
npx next dev -p 3101
```

Open [localhost:3101](http://localhost:3101). On other platforms, clone into a directory of your choice and run the same npm commands.

Tailwind is compiled separately into `src/app/tw.generated.css`, which is gitignored. Run `npm run tw:watch` in another terminal while editing utility classes, or rerun `npm run tw` after changes. The convenience command `npm run dev` starts both watchers on Next.js's default port, 3000.

## Routes

| URL | Purpose |
| --- | --- |
| `/` | Opening film and scroll-driven airport |
| `/#experience` | Check-in / experience |
| `/#projects` | Security / projects |
| `/#people` | Concourse |
| `/#contact` | Gate and boarding pass |
| `/short` | About me: experience, projects, résumé, and social links |
| `/credits` | Artwork and photographic source credits |
| `/Ammar_Adam.pdf` | Résumé PDF |

Legacy routes redirect to the current experience; the complete mapping is in [next.config.ts](next.config.ts).

## Editing content

| File | Controls |
| --- | --- |
| [src/data/arrivals.ts](src/data/arrivals.ts) | Experience records, detail text, images, and company links |
| [src/data/departures.ts](src/data/departures.ts) | Projects and community work, screenshots, descriptions, and links |
| [src/data/filmCopy.ts](src/data/filmCopy.ts) | First-person intro captions and experience/project readouts |
| [src/data/site.ts](src/data/site.ts) | Shared social links and site configuration |
| [src/data/references.ts](src/data/references.ts) | Easter eggs, wall-art placement, labels, and exploration references |
| [src/data/loungeRoom.ts](src/data/loungeRoom.ts) | Personal photograph sources and captions |
| [src/components/sv/memorySequence.ts](src/components/sv/memorySequence.ts) | Concourse photograph selection and framing |
| [src/components/sv/ShortPortfolioContent.tsx](src/components/sv/ShortPortfolioContent.tsx) | About me introduction, curated summaries, and ordering |
| [src/components/sv/BoardingPass.tsx](src/components/sv/BoardingPass.tsx) | Boarding-pass content, scan timing, and résumé destination |

Images and other static assets live in `public/`. Replace [public/Ammar_Adam.pdf](public/Ammar_Adam.pdf) to update the résumé. The About me summaries are curated separately from the film captions; update both when changing biography or role descriptions.

## Scene and layout code

Most active airport code lives in [src/components/sv/](src/components/sv/):

- `SpiderVerse.tsx` coordinates the film, scroll timeline, chapter navigation, and overlays.
- `OpeningFilm.tsx` handles video selection, autoplay fallback, captions, and skipping.
- `TerminalWorld.tsx` manages rendering, touch gestures, loading, and the GPU budget.
- `film-terminal.ts` composes the world and camera path; `film-architecture.ts`, `film-checkin.ts`, and the other `film-*` modules build its rooms, props, and character.
- `film-materials.ts` and `terminal-post.ts` control the painted surfaces and final image treatment.
- `timeline.ts`, `mobile-scroll.ts`, and `MobileJourneyControls.tsx` define chapter timing and phone navigation.
- `TerminalStory.tsx` renders the readouts and Details dialogs.

The About me route and responsive layout live in [src/app/short/](src/app/short/). Its background uses `CityMuralBackground.tsx`. Older scene implementations remain in the repository; the active home-page entry point is `SpiderVerse.tsx`.

## Build and verification

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start -- -p 3101
```

`npm run build` automatically bakes the static terminal sets and compiles Tailwind before building Next.js. If you change the baked set definitions during development, run `npm run bake:sets` to regenerate `public/geometry/` and `src/data/terminalSets.generated.json`. This does not regenerate the opening film; the videos and posters in `public/film/` are separately recorded assets.

For visual checks on Windows, use Playwright with installed Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe` and the arguments `--use-angle=default --enable-gpu`. Do not use SwiftShader for visual or performance verification. Check desktop, portrait, and landscape views, including the intro handoff, native swipes, Details dialogs, and scan-to-PDF sequence. Chrome touch emulation does not replace testing on a physical iPhone in Safari.

Vercel deploys from `main`; pushing there publishes the site. Develop on a working branch and obtain the site owner's approval before pushing or merging to `main`.

## Artwork and credits

Source and provenance records are in [public/art/README.md](public/art/README.md), the adjacent provenance files, and the [credits page](https://ammaradam.com/credits). Earlier photographic environment plates are retained with attribution in [public/plates/PLATES.md](public/plates/PLATES.md). The terminal's personal photographs belong to Ammar.

Recent implementation and verification notes are in [REVISION_NOTES.md](REVISION_NOTES.md).
