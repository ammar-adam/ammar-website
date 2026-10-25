import type { CSSProperties } from "react";

/** Inspected against all25 originals: wide groups keep every person; portrait crops keep faces in frame. */
const FRAMING: Record<string, CSSProperties> = {
  "/ABOUT1.jpg": { objectFit: "contain", objectPosition: "50% 50%" },
  "/ABOUT2.jpg": { objectFit: "cover", objectPosition: "50% 45%" },
  "/ABOUT3.jpg": { objectFit: "cover", objectPosition: "50% 35%" },
  "/ABOUT4.jpg": { objectFit: "cover", objectPosition: "50% 53%" },
  "/ABOUT5.jpg": { objectFit: "contain", objectPosition: "50% 50%" },
  "/ABOUT6.jpg": { objectFit: "cover", objectPosition: "50% 62%" },
  "/ABOUT7.jpg": { objectFit: "cover", objectPosition: "50% 38%" },
  "/ABOUT8.jpg": { objectFit: "contain", objectPosition: "50% 50%" },
  "/ABOUT9.jpg": { objectFit: "contain", objectPosition: "50% 50%" },
  "/ABOUT10.jpg": { objectFit: "contain", objectPosition: "50% 50%" },
  "/ABOUT11.jpg": { objectFit: "cover", objectPosition: "50% 55%" },
  "/ABOUT12.jpg": { objectFit: "cover", objectPosition: "50% 38%" },
  "/ABOUT13.jpg": { objectFit: "contain", objectPosition: "50% 50%" },
  "/ABOUT14.jpg": { objectFit: "cover", objectPosition: "50% 63%" },
  "/ABOUT15.jpg": { objectFit: "cover", objectPosition: "50% 42%" },
  "/ABOUT16.jpg": { objectFit: "contain", objectPosition: "50% 50%" },
  "/ABOUT17.jpg": { objectFit: "cover", objectPosition: "50% 55%" },
  "/ABOUT18.jpg": { objectFit: "contain", objectPosition: "50% 50%" },
  "/ABOUT19.jpg": { objectFit: "cover", objectPosition: "50% 55%" },
  "/ABOUT21.jpg": { objectFit: "cover", objectPosition: "50% 56%" },
  "/ABOUT22.jpg": { objectFit: "cover", objectPosition: "50% 64%" },
  "/ABOUT24.jpg": { objectFit: "contain", objectPosition: "50% 50%" },
  "/ABOUT25.jpg": { objectFit: "contain", objectPosition: "50% 50%" },
  "/ABOUT26.jpg": { objectFit: "cover", objectPosition: "50% 34%" },
  "/ABOUT27.jpg": { objectFit: "contain", objectPosition: "50% 50%" },
};

export function photoFraming(src: string): CSSProperties {
  return { backgroundColor: "#06111c", ...(FRAMING[src] ?? { objectFit: "contain", objectPosition: "50% 50%" }) };
}
