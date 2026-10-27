# Terminal finishing pass

Work only in `C:/dev/site`, on `spiderverse-airport`. Commit each verified phase locally; never push, merge, or touch main. Preserve film media, camera route, scene order, skyline, ticket design and a/a. Explicit caption/control changes affect HTML over the film, not its media. Functional social icons remain navigation; decorative crests/character imagery become original allusions. Employment dates are absent from the supplied data and will be omitted.

## File map
- `src/app/page.tsx` → `src/components/sv/SpiderVerse.tsx`: pinned journey, scroll state, intro lock and composition; `timeline.ts`: chapter cuts/selections.
- `TerminalWorld.tsx`: WebGL renderer, input, culling and render loop; `film-terminal.ts`: camera rail, lights, scenery, animations.
- `film-materials.ts`, `film-architecture.ts`, `terminal-post.ts`, `film-traveler-3d.ts`: surfaces, architecture, print/ink pass, character. `film-*-set.ts` and `scripts/bake-terminal-sets.cjs`: authored furnishings and baked assets.
- `TerminalStory.tsx`, `manifest.css`, `film-type.css`: narration, cards and details; `OpeningFilm.tsx` / `opening-film.css`: video and HTML captions.
- `JourneyNavigation.tsx`, `SocialLinks.tsx`, `terminal-journey.css`, `BoardingPass.tsx` and their CSS: navigation, contact and ticket behavior.
- `src/app/short/*`, `ShortPortfolioContent.tsx`, `CityMuralBackground.tsx`: short page and existing skyline mural. `src/data/{arrivals,departures,site,loungeRoom}.ts`: facts, projects, links and photos.

## Phases and verification
0. Audit only: this plan; `shots/baseline/` at 1440×900 and 390×844, intro 0/3/6s and each 10% of scroll. Preserve a hash list of locked assets/route.
1. Copy: centralize exact approved screen copy in `src/data/filmCopy.ts`; update `TerminalStory.tsx`, HTML intro captions, chapter labels and in-world concourse lettering. Keep numbers in data/details only. Check every card and intro beat at both sizes.
2. Paint: revise material UV strokes/ramp and key/fill, post masking, geometry UV preservation/baking, character face/keychains/shoes; remove ceiling swooshes and floor glare source. Approve the Alpen proof in `shots/proof/` against skyline/stills before the full stop sweep. Keep camera coordinates fixed; populate the 84% transition.
3. References: one `src/data/references.ts` registry; lazy per-stop authored geometry and readable prop labels, original allusions, gate split-flap board. Remove decorative crest/character assets from live scenes. Verify every A item during its dwell, five concourse positions and both sizes.
4. UX: shared top bar/rail, static cards, right details drawer, transient hints, chapter ticks, keyboard stepping, concourse-only look, native PDF tab on scan. Preserve ticket appearance. Check focus/Esc, new-tab activation, mobile targets and overlap.
5. Short: exact nine-row table and links in `ShortPortfolioContent.tsx` / `short.css`; retain mural. Verify one 900px desktop screen and approximately two phone screens.
6. Performance/final: profile actual render frames and intro startup under 4× CPU/Fast 3G; optimize startup, lazy props, texture sizes and scheduling without altering locked media/route. Run lint, TypeScript and build; collect `shots/final/`, reference completion evidence, measured limitations and missing-copy report.

All visual checks use installed Chrome with `--use-angle=default --enable-gpu`. Inspect captured images before moving phases; distinguish desktop GPU emulation from a physical-phone measurement.
