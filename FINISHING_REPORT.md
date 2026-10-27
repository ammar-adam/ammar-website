# Terminal finishing report

All work is local on `spiderverse-airport`. Nothing was pushed or merged; `main` was not changed. Preview: http://localhost:3101/.

## Art and architecture

All four rooms now have modeled ceiling, back-wall and left-wall installations. Check-in has folded canopies, layered city reliefs and recessed maquettes. Security has ribs, relief panels and a circular installation. The concourse has suspended fins, a continuous retail frieze, niches and rear-wall movie paintings. Gate has ceiling sails, reliefs and details above the glass. These use the same warm key, cool shadow bands, directional surface brushwork and depth-aware ink treatment as the interior. Geometry is merged by material and loaded per room.

The large hand-lettered **“Alright.”** is restored. Food signs lead with illustrations of nihari, hand-rolls, shawarma and matcha; cooking props remain physical objects. The two original movie paintings have readable titles. Jersey printing follows the torso surface instead of floating above it. The departures board has individual split flaps and cycling rows. The empty 84% transition now has travelers and a basketball player visible through the gate opening.

The traveler retains the existing rig, with clearer face shading, white/orange shoes and two small backpack keychains. The Alpen proof was compared with the window skyline and supplied film stills before extending the treatment. [Final proof](shots/final/proof-comparison.png).

## Copy, controls and short page

Approved narration is centralized in `src/data/filmCopy.ts`. Detailed statistics stay in Details; the short page follows the exact compact nine-row brief. WVG's $13.9M fact remains in the underlying detail data. The HTN application-rubric sentence and Pear selection-count sentence are removed. Employment dates were not supplied and were not invented.

One shared header replaces redundant navigation. Reading cards have one Details action. The drawer supports Escape, focus trapping and focus restoration. Keyboard stepping, mobile menu behavior and concourse-only looking were checked. The preserved ticket opens the résumé PDF with a native new-tab link on the click; its scan, tear and departure sequence continues in the original tab. The short page retains the existing skyline mural: exactly 900px document height on desktop, 1497px on the 844px phone viewport, with no horizontal overflow.

## References and evidence

All 46 required A entries in [the reference registry](src/data/references.ts) are marked done. The registry contains their placement and intended dwell; sports screens and some jersey details have exploration angles. The Phase 3 sweep covered 82 desktop/phone frames plus focused views. Final captures contain 0/3/6-second intro frames, every 10% of scroll at both sizes, five additional concourse views, both short-page captures and the Alpen proof. [Screenshot index](shots/final/README.md).

The movie paintings are original generated artwork, not official film posters. Prompts and provenance are in [provenance.json](public/art/references/provenance.json). Tiny labels cannot be certified at 14px from every angle or phone crop; some sports and jersey references are best seen using look-around. The optional rental-car desk was omitted.

## Performance

Shader preparation now runs ahead of approaching rooms in small tasks; hidden preparation wrappers dissolve afterward so normal room culling remains intact. Hero light slots remain stable after the hero exits. Concourse construction yields between references and merges. Ambient prop updates follow their 12fps animation cadence; luggage belts use fixed bounds and stop updating outside their room. The unused brush-image prefetch was removed.

Production measurements used installed Chrome with `--use-angle=default --enable-gpu`, hardware Intel Arc 140V/ANGLE D3D11, WebGL2. Desktop was 1440×900. The phone profile was 390×844 with 4× CPU throttling and DPR capped by the app at 1.35. Frame counts are actual terminal post-pass draw submissions, not rAF counts or GPU-completion measurements. Phone results still use a desktop GPU and are not physical-phone certification.

| Profile / 24-second traversal | Average fps | p95 interval | Longest interval |
|---|---:|---:|---:|
| Desktop · first-traversal | 78.2 | 10.1ms | 1882.8ms |
| Desktop · steady-warm | 76.8 | 13.4ms | 663.6ms |
| Phone profile · first-traversal | 57.4 | 40.9ms | 246.3ms |
| Phone profile · steady-warm | 66.7 | 27.2ms | 51.0ms |

The earlier production baseline averaged 42.0fps desktop and 29.5fps phone on first traversal. The final traversal improved these averages, but **the consistent 60fps desktop / 30fps phone target is not met at every moment**. In the first desktop measurement, later-room stalls persisted into the second traversal. A separate readiness-checked diagnostic then measured 111.1fps over a 16-second traversal and about 120fps around 73%, 80% and 94%, with no frames over 50ms in those three settled samples and no shader relinking after the traversal. The slowdown did not reproduce there. Transient driver compilation/cache behavior is plausible but unproven; cold stalls up to 1.88s remain a limitation. Both results are retained, rather than reporting only the favorable run. [Diagnosis](shots/performance/FOCUSED-DIAGNOSIS.md).

Cold Fast 3G measurement (180,000 B/s download, 562.5ms latency, 4× CPU):

- Caption and Skip entered the DOM at 0.70s and 0.70s; first contentful paint was 2.09s. DOM availability is not proof of paint.
- First decoded video frame: 5.60s. Actual playback: **12.63s**; first moving frame: 12.66s.
- Film ended at 19.02s; 1 playback buffer wait(s), totaling 0.38s. 1 dropped of 360 decoded frames.
- First ready live-world draw: 27.08s from navigation.

**The ~2-second cold intro target is not met.** The protected portrait AV1 file is 2,369,867 bytes; its full transfer alone takes about 13.2s at this bandwidth, before latency and competing assets. The first caption and Skip remain present. An SSR-video-discovery experiment was rejected because its 1.3s earlier motion produced eight buffering waits; that code is not shipped. [Trace and explanation](shots/performance/cold-buffering-diagnosis.md). Film bytes cannot be made smaller under the current media lock.

The protected intro also retains its earlier baked lighting and floor highlight. Live-world floor glare was removed, but that cannot change already-rendered video pixels. DPR and texture-size audits passed with no recorded violations.

## Checks and local commits

`npm run lint`, `npx tsc --noEmit`, and `npm run build` pass. Build includes geometry baking and `npm run tw`. Final 38-frame journey capture recorded zero page errors and zero horizontal overflow. Controls, all 18 card/drawer combinations across both sizes, PDF HTTP 200/new tab, scan/tear sequence, mobile targets, and the short-page layout were checked in Phases 4–5.

SHA-256 audit: all nine protected film/poster/skyline assets and the authored camera route match baseline. Camera SHA: `cddf8d8f90f58a5e3c058d288ad291c115325929e06d6be94fec0be18a4405d4`. [Audit](shots/final/locked-audit.json). Ticket appearance was checked visually; it is not a full-component hash guarantee.

| Phase | Local commit |
|---|---|
| Baseline / plan | `f2276a5` |
| Copy | `9e781b3`, `dd7d6de` |
| Paint / character | `2600217` |
| References / four-room architecture | `2f82eec` |
| Controls / résumé behavior | `873714b` |
| Short page | `e17814d` |
| Performance / final evidence | The commit containing this report |

Performance JSON files are in `shots/performance/`. The baseline harness's `likelyDevelopmentBuild: true` flag was a false positive from matching the generic Turbopack runtime; that run served `next start`. The final detector uses development-only markers. Original baseline evidence was retained unchanged.
