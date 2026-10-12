/** Clickable parts of the plane, what they open, and where the camera zooms to. */
export const parts = [
  { id: "windows", label: "Windows", title: "Window seats", sub: "Where I've worked", x: 620, y: 196 },
  { id: "engine", label: "Engine", title: "Engine room", sub: "Things I've built", x: 625, y: 308 },
  { id: "cockpit", label: "Cockpit", title: "From the cockpit", sub: "About me", x: 1095, y: 200 },
  { id: "door", label: "Door", title: "Now boarding", sub: "Resume", x: 981, y: 212 },
  { id: "tail", label: "Tail", title: "Tail number", sub: "Say hi", x: 120, y: 110 },
] as const;

export type PartId = (typeof parts)[number]["id"];

export function getPart(id: PartId) {
  return parts.find((p) => p.id === id)!;
}
