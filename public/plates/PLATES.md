# Plates

Environment plates for the intro. Each plate ships as a paint-baked colour
texture (`<id>-paint-2000.webp`, `<id>-paint-1600.webp`: sharp median(5) +
blur(0.6), WebP q80) and a hand-authored feathered depth matte
(`<id>-depth.webp`, 1024px wide, 0 = sky/far, 1 = near). The site
colour-grades, posterises, halftones and chromatic-splits them in real time
(`src/components/sv/Film.tsx`); the originals are untouched. No airline
livery or name is visible in any plate.

Unsplash License and Pexels License both allow commercial use and
modification without attribution; credit is given anyway, here and at
`/credits`. No Creative Commons / Wikimedia material is used.

| id     | title                                                                 | photographer    | source                                  | licence          | used for            |
|--------|-----------------------------------------------------------------------|-----------------|-----------------------------------------|------------------|---------------------|
| hero   | Modern plane parking on stand near its gate at night                  | Arthouse Studio | https://www.pexels.com/photo/4530192/   | Pexels License   | hero                |
| ramp   | Airplanes with red beacon parked on an airfield at night              | Arthouse Studio | https://www.pexels.com/photo/4530190/   | Pexels License   | the three gates     |
| hall   | Modern airport terminal with passengers and signage (Soekarno-Hatta)  | Edwin Petrus    | https://unsplash.com/photos/7tKkizJ7XJA | Unsplash License | check-in hall       |
| lane   | People at Security Checkpoint in Airport Terminal                     | 海风 张          | https://www.pexels.com/photo/37847918/  | Pexels License   | security lane       |
| dawn   | Burj Khalifa above a highway interchange in Dubai, sunrise            | David Rodrigo   | https://unsplash.com/photos/Fr6zexbmjmc | Unsplash License | the gate (photos)   |
| runway | Aerial view of an airport runway at sunset (Skellefteå Airport)       | Niklas Jonasson | https://unsplash.com/photos/3p3HtGKvGLM | Unsplash License | boarding / takeoff  |
