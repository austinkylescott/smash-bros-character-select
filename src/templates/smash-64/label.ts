/**
 * A fighter's name as Smash 64 prints it across the top of a slot: in capitals, always on one
 * line. A name too wide for its slot is squeezed by the screen, as the game squeezes JIGGLYPUFF.
 */
export const smash64SlotLabel = (name: string): string => name.toLocaleUpperCase("en");
