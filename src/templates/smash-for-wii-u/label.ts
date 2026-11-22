/** Words the game leaves in their own case when it capitalises a name. */
const KEEP_CASE = new Set(["Mii", "Wii", "Fit"]);

/**
 * A fighter's name as Smash for Wii U prints it along a slot's foot: in capitals, but for Mii and
 * Wii Fit, and always on one line. A name too wide for its slot is squeezed by the screen, as the
 * game squeezes MR. GAME & WATCH.
 */
export const wiiUSlotLabel = (name: string): string =>
  name
    .split(" ")
    .map((word) => (KEEP_CASE.has(word) ? word : word.toLocaleUpperCase("en")))
    .join(" ");
