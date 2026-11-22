import { slotLabel } from "../label";

/** Names this long or longer go on two lines. Young Link, at ten, is the longest Melee keeps on one. */
const TWO_LINES_FROM = 11;

/**
 * A fighter's name as Melee prints it on a slot: in capitals, and split over two lines when long,
 * as evenly as the words allow. A name too wide for its slot is squeezed by the screen.
 */
export const meleeSlotLabel = (name: string): string[] => slotLabel(name, TWO_LINES_FROM);
