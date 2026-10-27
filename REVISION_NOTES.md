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



## Mobile usability and scene cleanup — 2026-10-27

The airport now has touch-friendly Back/Next stops for all five experiences, four projects and three concourse views. Short version remains visible in the phone header. Vertical swipes scroll natively; horizontal concourse gestures turn the view only after clear intent, and a second finger releases camera control for zoom. Browser address-bar height changes no longer reposition the story. Phone rendering uses a rotation-safe 30 fps budget, capped pixel ratio, 2× MSAA and 1024px shadows.

Phone captions, navigation, full-screen details and boarding pass respect safe-area insets. Landscape separates the gate headline/contact from the ticket. All gate links have 44px touch targets. The short page uses a readable single-column layout on touch devices, with larger link targets and natural scrolling; desktop still fits one screen through 1280×600. Existing content and the requested linked PNG logos remain.

Concourse discretionary signs were reduced from eight to four, retaining the food objects and photos. Its invitation clears the awning; portrait framing tilts upward. Security has one small newspaper on the bench and no foreground flag. City paintings sit inside physical frames, check-in has straight ivory acoustic panels, gate column gutters contain the Seoul row, and Gate 9¾ is a small mullion plaque.

The 6-second intro was rendered again from the current 3D scene so the old floor glare is absent from both video and posters. Desktop remains 1920×1080 at 60 fps; phone portrait is 720×1560 at 30 fps and phone landscape is 960×540 at 30 fps. AV1 is used only when decoding is reported smooth and power-efficient, with H.264 fallback. Landscape phone H.264 is 2.68 MB versus 8.02 MB for desktop; portrait is 2.66 MB. Blocked autoplay exposes a Play intro button while keeping the first caption, Skip and Short version available.

Verification: hardware Chrome (Intel Arc via ANGLE/D3D11, never SwiftShader) at 1440×900, 390×844, 320×568 and 844×390. All 13 touch stops, vertical/horizontal gestures, pinch handling, menu scroll lock, native detail scrolling, bounded layouts and 44px controls pass. Scan, rip and departure precede a PDF request at 2.06 seconds. The short page passes 13 viewport, keyboard, logo-link and content-preservation checks. Lint, TypeScript and production build pass. QA artifacts remain in the task workspace under outputs/mobile-interactions-corrected, outputs/scene-cleanup-proof, outputs/short-mobile-release and outputs/mobile-final-film.

The user explicitly authorized pushing the completed revision to GitHub main.

Intro production checks also pass for natural portrait/landscape completion, blocked autoplay, menu cleanup across the handoff, height-only resize and rotation. Both unthrottled mobile films decoded all 180 frames with zero drops in hardware Chrome. With 8Mbps/60ms simulated 4G, the caption appeared at 269ms, first decoded frame at 906ms, and 2 of 180 frames dropped. These are desktop hardware browser simulations, not measurements from a physical phone. Full 3D readiness followed film completion by roughly 1–2.2 seconds. Evidence: task workspace outputs/mobile-intro-final/.

## Native phone journey and restored references — 2026-10-27

Renamed the alternate page to About me and removed diagonal arrows from active navigation, readouts and detail links. Its desktop content starts up to 76px lower, with a shrinking spacer that preserves the one-screen layout on shorter laptops. The mobile reading layout remains unchanged.

Touch scrolling now drives the world directly. A phone-specific monotone mapping gives corridor travel its own scroll distance, and the camera moves continuously through check-in and security. Next/Back animate along the same rail and stop immediately when a touch or wheel gesture begins. Captions respond to scroll with brief entrances and exits around a stable reading interval. Phone scroll distance is fixed per orientation, and the WebGL surface uses large-viewport height so Safari toolbar height changes do not continually resize its render buffers. Rotation preserves the story position. Reduced motion keeps stationary room views.

The last project remains fully framed before the camera moves sideways in front of its monitor and then through security. In the concourse, portrait framing turns toward the neighbouring shop after the invitation. All eight original food/music reference groups and their original wording are restored. Artwork has independent wall anchors, away from photos and the walking lane. Ridgeway sits on the kitchen side wall where the rotisserie cannot hide it. The small corner flag is restored below the bench backrest; the single small newspaper remains.

Validation uses installed hardware Chrome with ANGLE/GPU, never SwiftShader. Native touch checks cover all13 stops, all9 details, motion during room swipes, at least10 intermediate Next-camera positions, interruption, doorway travel, vertical/horizontal gesture separation, pinch, menu locking, height-only resize, rotation, 320px portrait and landscape bounds, and scan/rip/takeoff before the PDF request. The camera math audit samples20,001 positions with no intersections against the tested conservative monitor/scanner/partition bounds. Short-page checks pass13 viewports, including one-screen desktop through1280x600, accessible links, logos and unchanged content. Wall placements were inspected from desktop and portrait exploration angles.

Evidence is in the task workspace under outputs/phone-flow-proof, outputs/wall-restoration-final, outputs/short-lowered-proof, outputs/mobile-scroll-final and outputs/mobile-scroll-doorway. Chrome touch emulation is not physical iPhone Safari validation; Safari's collapsing browser chrome still needs device confirmation.

The user explicitly authorized publishing the completed fixes to main.

Final production rechecks: portrait and landscape intro playback, blocked autoplay, simulated 4G and mapped handoff all pass. The restored wall references pass the exploration-angle proof. The arrow-free Demo link has a measured 44x44px target. At1440x900 the About me header begins at121px and the document remains900px tall. Lint, TypeScript and the production build pass. Additional evidence: outputs/mobile-intro-phone-flow and outputs/phone-flow-final.
