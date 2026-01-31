# Airport Portfolio

A premium, clean portfolio with an airport theme — Check-in, Terminal, Departures, Arrivals, Lounge, and Boarding Pass.

## Tech Stack

- **Next.js** (App Router)
- **React** + **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (subtle animations)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Where to Fill Content

All content is centralized in `src/data/`. Replace placeholders with your real content.

### 1. Site config — `src/data/site.ts`
- `siteName` — Your name
- `tagline` — Check-in welcome message
- `socialLinks` — GitHub, Twitter, LinkedIn URLs

### 2. Departures (Projects) — `src/data/departures.ts`
- Add projects to the `projects` array
- Each project: `slug`, `city`, `routeName`, `shortDesc`, `screenshot`, `links`, `overview`, `build`
- Screenshots: place images in `public/` and reference as `/your-image.jpg`

### 3. Arrivals (Experiences) — `src/data/arrivals.ts`
- Add experiences to the `arrivals` array
- Each: `slug`, `from`, `title`, `shortDesc`, `details`

### 4. Lounge — `src/data/lounge.ts`
- `headline`, `blurb`, `interests` — personality and hobbies

### 5. Boarding Pass (Resume) — `src/data/boardingPass.ts`
- `displayName`, `resumeFileUrl`, `sections`
- Add your PDF to `public/resume.pdf` (or update `resumeFileUrl`)

## Adding a New Project

1. Open `src/data/departures.ts`
2. Add an object to `projects`:

```ts
{
  slug: "my-project",
  city: "San Francisco",
  routeName: "Project Name",
  shortDesc: "One-line description",
  screenshot: "/placeholders/screenshot.svg",
  links: [
    { label: "Live demo", url: "https://..." },
    { label: "Repository", url: "https://..." },
  ],
  overview: "Brief overview...",
  build: "Tech stack and approach...",
}
```

3. Add a screenshot to `public/` and set `screenshot` to its path.

## Adding a New Arrival

1. Open `src/data/arrivals.ts`
2. Add an object to `arrivals`:

```ts
{
  slug: "my-experience",
  from: "Origin context",
  title: "Experience Title",
  shortDesc: "One-line summary",
  details: "Longer description...",
}
```

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Check-in (landing) |
| `/terminal` | Hub navigation |
| `/departures` | Projects list |
| `/departures/[slug]` | Project detail |
| `/arrivals` | Experiences list |
| `/arrivals/[slug]` | Experience detail |
| `/lounge` | Personality |
| `/boarding-pass` | Resume view/download |

## Design Notes

- Typography-first, high whitespace
- Airport motif: route lines, plane accent, boarding pass perforation (used sparingly)
- Boarding modal: optional step before viewing project details
- Respects `prefers-reduced-motion` for accessibility
