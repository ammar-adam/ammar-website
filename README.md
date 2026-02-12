# AFA International Airport

A personal portfolio site styled as an airport terminal.

Live at: ammaradam.com

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

## Routes

| Route        | Description                          |
|-------------|--------------------------------------|
| `/`         | Home — Terminal Directory (gate links) |
| `/projects` | Projects — seat map, pick a seat for details |
| `/arrivals` | Experiences — baggage carousel, pick a bag |
| `/about`    | About — bio, highlights, photos      |
| `/resume`   | Resume — boarding pass + PDF download |

## Content & Assets

All copy and links live in **`src/data/`**:

| File              | What it controls |
|-------------------|------------------|
| **`site.ts`**     | Airport name, hero line, social links (email, GitHub, LinkedIn, X), ticker, check-in intro |
| **`departures.ts`** | Projects: `name`, `destination`, `shortDesc`, `screenshot` path, `seats[].links` (View Project, GitHub, Demo, More) |
| **`arrivals.ts`** | Experiences: `from`, `fromUrl`, `image`, `origin` (bag tag), `detailTitle`, `impact`, `details` |
| **`about.ts`**    | Intro, “Some Cool Stuff” list, location stamps (YYZ, DXB, KHI) and their URLs |
| **`loungeRoom.ts`** | About page photos: `photos.items[]` with `src` and optional `caption` (e.g. `/ABOUT1.jpg` … `/ABOUT12.jpg`) |
| **`boardingPass.ts`** | Resume: `displayName`, `from`, `to`, `flight`, `tagline`, `resumeFileUrl` (PDF path) |

### Images (in `public/`)

- **Projects:** Set each project’s `screenshot` in `departures.ts` (e.g. `/ROCKETSHIP.png`).
- **Experiences:** Set each experience’s `image` in `arrivals.ts` (e.g. `/WATERLOOVG.jpg`).
- **About photos:** Point `loungeRoom.ts` → `photos.items[].src` at your files (e.g. `/ABOUT1.jpg` … `/ABOUT12.jpg`).
- **Resume PDF:** Put **`Ammar_Adam.pdf`** (or your file) in `public/` and set `resumeFileUrl` in `boardingPass.ts` (e.g. `"/Ammar_Adam.pdf"`). Clicking the barcode on the resume page downloads it.

## Navbar & Hero

- **Navbar** (top): Gate letters A–D → Projects, Experiences, About, Resume. Links for email, GitHub, LinkedIn, X.
- **Hero** (home): One-line intro and **Terminal Directory** table with gate, destination, and info copy. Edit directory rows in **`src/components/terminal/TerminalDirectoryBoard.tsx`** and gate links in **`src/components/AppShell.tsx`**.
