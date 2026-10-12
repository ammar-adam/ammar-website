/** The walk through the terminal, in order. Section ids double as nav anchors. */
export const stops = [
  { id: "check-in", code: "1", label: "Check-in", dest: "Hello" },
  { id: "bag-drop", code: "2", label: "Bag drop", dest: "Where I've worked" },
  { id: "gate", code: "3", label: "Gate", dest: "Things I've built" },
  { id: "boarding", code: "4", label: "Boarding", dest: "Resume" },
  { id: "in-flight", code: "5", label: "In-flight", dest: "Off the clock" },
] as const;

export type StopId = (typeof stops)[number]["id"];
