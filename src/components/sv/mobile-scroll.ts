/** Native phone scroll spends time walking between rooms, not rushing through doorways. */
const PHONE_RAIL = [
  [0, .2405], [.07, .282], [.14, .324], [.21, .366], [.28, .408],
  [.35, .433], [.385, .440], [.42, .449], [.44, .45],
  [.51, .50], [.58, .55], [.65, .60], [.69, .635],
  [.73, .641], [.76, .649], [.79, .65],
  [.835, .72], [.88, .79], [.905, .815], [.94, .846], [.965, .86], [1, 1],
] as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
function interpolate(value: number, input: 0 | 1, output: 0 | 1) {
  const position = clamp(value);
  if (position <= PHONE_RAIL[0][input]) return PHONE_RAIL[0][output];
  for (let i = 1; i < PHONE_RAIL.length; i++) {
    const a = PHONE_RAIL[i - 1], b = PHONE_RAIL[i];
    if (position <= b[input]) {
      const fraction = (position - a[input]) / (b[input] - a[input]);
      return a[output] + (b[output] - a[output]) * fraction;
    }
  }
  return PHONE_RAIL[PHONE_RAIL.length - 1][output];
}

export const phoneStoryAt = (scroll: number) => interpolate(scroll, 0, 1);
export const phoneScrollAt = (story: number) => interpolate(story, 1, 0);
