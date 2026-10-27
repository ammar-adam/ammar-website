# Wall art, boarding and prose revision

This revision is local to `spiderverse-airport`; nothing was pushed or merged.

- Removed Prayer Room geometry/registry entry and all DECA/ICDC departure-board logic. Five visible rows now cycle the eleven remaining routes.
- Ordinary barcode activation now shows 750ms scanning, 350ms ticket tearing and 900ms takeoff, then opens the PDF in the same tab. This keeps the sequence visible and avoids popup blocking. Both departure signs rise clear of the aircraft; the phone camera follows it during triggered departure only. Modified clicks retain native behavior; reduced motion opens immediately. Back navigation restores the pass; leaving Gate cancels pending navigation.
- Added original transparent graffiti motifs for Dubai, Toronto, Karachi and departure, directly on textured, lit wall surfaces. One shared 711KB atlas is requested lazily and uses existing scene lighting, with a 1024×512 plaster finish. The gate's solid return carries artwork while the flight window remains open.
- Intro now reads “My name’s Ammar Adam. And I study CS + Finance at Waterloo.” The third beat is “I like making things happen. Sometimes I write code. Sometimes I bring people together.” Experience/project cards, Details, metadata and the short page use first-person prose. Supplied facts and numerical achievements are preserved. Pear adds “And backing those builders.”
- The short page has 16px body text, 14px roles, higher contrast, tighter spacing and GitHub/LinkedIn/X/email icons with accessible names and 44px targets.

## Verification

Hardware Chrome with `--use-angle=default --enable-gpu`: 30 main-site desktop/phone captures, no page errors or horizontal overflow. Each changed intro beat and all nine information cards were inspected. [Desktop contact sheet](shots/revision-wall-and-copy/desktop-contact.png) · [Phone contact sheet](shots/revision-wall-and-copy/mobile-contact.png).

Boarding tests verify the scan/tear/takeoff states, duplicate-click guard, delayed PDF requests at ~2.1–2.3s during capture (scheduled at2.0s), reduced motion, native Ctrl-click, history reset and cancellation after leaving Gate. The animation proof intercepted PDF navigation to retain each frame; a separate actual request returned HTTP200/application-pdf. The final phone framing proof shows the complete aircraft. [Boarding evidence](shots/revision-wall-and-copy/boarding/qa-result.json) · [Desktop takeoff](shots/revision-wall-and-copy/boarding/takeoff-desktop.png) · [Phone takeoff](shots/revision-wall-and-copy/boarding/takeoff-phone.png).

Short-page document height equals viewport height at1440×900,1440×780,1366×768, 1280×720 and1100×740. At390×844 it is1516px (1.80screens), with no horizontal overflow. All social icons have accessible names and44px targets. [Laptop proof](shots/revision-wall-and-copy/short/laptop-720.png) · [Measurements](shots/revision-wall-and-copy/short/report.json).

Lint, TypeScript and the production build pass. Protected video/poster/skyline hashes and the ordinary scroll-camera route match baseline. [Hash audit](shots/revision-wall-and-copy/locked-audit.json).

The previous cold-start performance limitations remain; this revision does not claim to fix them. The new art is lazy-loaded. The preserved intro video retains its baked lighting.

## Generated artwork

[Saved atlas](public/art/terminal-graffiti-v1.webp) · [Full prompt and provenance](public/art/terminal-graffiti-v1.provenance.json). Created with the built-in image-generation tool, optimized to WebP with alpha preserved, and mapped into four original wall paintings.

## Short-page layout revision — 2026-10-27

Replaced the full-width tables with two editorial lists: Experience and Built. Every entry groups organization, role and description vertically, with 19px titles and 17px descriptions. The content measure is 1040px, with an 88px desktop column gutter and a single-column phone layout. All nine existing entries, roles, descriptions, order and destination links are preserved. Only the short page changes.

The continuous dark reading field leaves the graffiti visible at the edges while reducing its contrast behind the copy. The introduction uses the requested two desktop lines: education, then building software and the food/soccer/trying-new-things sentence. The three inline marks are PNGs linking to Waterloo, Beli and Liverpool's official sites. Sources are recorded in public/art/short-logos.sources.json. Social icons and résumé remain at the top.

Hardware Chrome visual checks cover 1440×900, 1280×720, 1100×740, 950×740, 900×740, 640×900, 390×844 and 320×740. No horizontal overflow, missing images or page errors. The 1440×900 view fits one screen; shorter laptops and phones scroll naturally without reducing text size or squeezing margins. Skip link, visible keyboard focus, all nine external links, all three PNG logo links, 44px social targets and the actual PDF response passed. Existing content records match the prior commit. Evidence is in the task workspace at outputs/short-editorial/final/.

Lint, TypeScript and the production build pass. No push or merge.

## One-screen spacing and main release — 2026-10-27

Reduced desktop-only vertical gaps and outer padding below 820px viewport height. Short or narrow desktop windows place roles beside organization names; body text remains 17px and all content is retained. Phone spacing is unchanged.

Production Chrome checks fit the full short page at 1440×900, 1440×780, 1366×768, 1280×720, 1280×650, 1280×600, 1100×740 and 950×740. Mobile/reflow, PNG links, résumé and keyboard checks pass. Production smoke test played the intro and rendered check-in, security, concourse and gate without missing assets, page errors or 3D fallback. Lint, TypeScript and the production build pass. Proofs are in the task workspace at outputs/short-one-screen-release/.

The user explicitly authorized publishing the entire site to GitHub main in this revision.

