# Plates

Environment plates for the Spider-Verse intro. Each plate ships as a
paint-baked colour texture (`<id>-paint-2000.webp`, `<id>-paint-1600.webp`:
sharp median(5) + blur(0.6), WebP q80) and a hand-authored feathered depth
matte (`<id>-depth.webp`, 1024px wide, 0 = sky/far, 1 = near). The site
colour-grades, posterises, halftones and chromatic-splits them in real time
(`src/components/sv/Film.tsx`); the originals are untouched.

Unsplash License and Pexels License both allow commercial use and
modification without attribution; credit is given anyway, here and at
`/credits`. No Creative Commons / Wikimedia material is used.

| id     | title                                                           | photographer     | source                                  | licence          | used for           |
|--------|-----------------------------------------------------------------|------------------|-----------------------------------------|------------------|--------------------|
| ramp   | Aircraft on the apron at JFK from the TWA Hotel rooftop (golden hour → night) | Lumin Osity | https://unsplash.com/photos/KwpqZHPPv_M | Unsplash License | night ramp         |
| hall   | A row of electronic check-in counters (Kualanamu International) | Edwin Petrus     | https://unsplash.com/photos/7IHHoNL1otQ | Unsplash License | check-in hall      |
| stage  | OpenAI DevDay 2026                                              | Ammar Adam       | public/ABOUT21.jpg                      | owner            | the spotlight beat |
| lane   | People at Security Checkpoint in Airport Terminal               | 海风 张           | https://www.pexels.com/photo/37847918/  | Pexels License   | security lane      |
| gate   | Plane boarding at sunset (White Airplane Under Black Clouds)    | Daniel Kist      | https://www.pexels.com/photo/70955/     | Pexels License   | the gate           |
| dawn   | Burj Khalifa above a highway interchange in Dubai, sunrise      | David Rodrigo    | https://unsplash.com/photos/Fr6zexbmjmc | Unsplash License | off the clock      |
| runway | Aerial view of an airport runway at sunset (Skellefteå Airport) | Niklas Jonasson  | https://unsplash.com/photos/3p3HtGKvGLM | Unsplash License | boarding / takeoff |
