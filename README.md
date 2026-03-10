# ✈️ AFA International Airport

*A portfolio disguised as an airport terminal.*

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer-Motion-EF0080?style=for-the-badge&logo=framer&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)
[![Live](https://img.shields.io/badge/Live-ammaradam.com-F5A623?style=for-the-badge&logo=safari&logoColor=white)](https://ammaradam.com)

---

## Design Philosophy

The site is built around a single metaphor: you’re moving through an airport. Projects are **gates and seats** - pick a flight and a seat to see what’s on board. Experiences are the **baggage carousel** - grab a bag to see where it’s been. The About page is the **lounge**: bio, highlights, and a grid of moments. The Resume is your **boarding pass**: one tap opens the PDF in a new tab. No corporate clutter - just clear signage and a calm, human tone.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Routes

| Route        | Description                          |
|-------------|--------------------------------------|
| `/`         | Home - Terminal Directory (gate links) |
| `/projects` | Projects - seat map, pick a seat for details |
| `/arrivals` | Experiences - baggage carousel, pick a bag |
| `/about`    | About - bio, highlights, photos      |
| `/resume`   | Resume - boarding pass + open PDF in new tab |

---

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

- **Projects:** Set each project’s `screenshot` in `departures.ts` (e.g. `/ROCKETSHIP.png`). Use `.mp4` for video; the app will show a Google Drive embed where appropriate.
- **Experiences:** Set each experience’s `image` in `arrivals.ts` (e.g. `/WATERLOOVG.jpg`).
- **About photos:** Point `loungeRoom.ts` → `photos.items[].src` at your files (e.g. `/ABOUT1.jpg` … `/ABOUT12.jpg`).
- **Resume PDF:** Put **`Ammar_Adam.pdf`** (or your file) in `public/` and set `resumeFileUrl` in `boardingPass.ts` (e.g. `"/Ammar_Adam.pdf"`). Clicking the barcode opens the PDF in a new tab.

---

*Designed and built by Ammar Adam*
