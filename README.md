# AFA INTERNATIONAL AIRPORT

A personal website styled as a fictional airport terminal — Check-in Hall, Terminal, Departures, Arrivals, Lounge, Boarding Pass Office.

## Tech Stack

- **Next.js** (App Router)
- **React** + **TypeScript**
- **Tailwind CSS**
- **Framer Motion**

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes (Locations)

| Route | Location |
|-------|----------|
| `/` | Check-in Hall |
| `/terminal` | Main Terminal / Concourse |
| `/departures` | Departures Hall |
| `/departures/[slug]` | Gate / Aircraft View |
| `/arrivals` | Arrivals Hall |
| `/arrivals/[slug]` | Baggage Claim |
| `/lounge` | Airport Lounge |
| `/boarding-pass` | Boarding Pass Office |

## Content Configuration

All content lives in `src/data/`:

### `site.ts`
- `airportName`, `checkIn` (headline, subtext, CTAs), `socialLinks`, `navLabels`

### `departures.ts`
- `projects[]`: `slug`, `destination`, `flightCode`, `routeName`, `gate`, `status` (Boarding | Ready | Scheduled), `screenshot`, `links`, `overview`, `build`

### `arrivals.ts`
- `arrivals[]`: `slug`, `from`, `title`, `shortDesc`, `details`

### `lounge.ts`
- `headline`, `blurb`, `interests[]`

### `boardingPass.ts`
- `displayName`, `resumeFileUrl`, `sections[]`

Add `resume.pdf` to `public/` for the Boarding Pass download.
