import { slotLabel } from "../label";

/** Names this long or longer go on two lines. Diddy Kong, at ten, is the shortest Brawl splits. */
const TWO_LINES_FROM = 10;

/**
 * A fighter's name as Brawl prints it on a slot's strip: in capitals, and split over two smaller
 * lines when long, as evenly as the words allow. A name too wide for its strip is squeezed by the
 * screen, as Brawl squeezes JIGGLYPUFF.
 */
export const brawlSlotLabel = (name: string): string[] => slotLabel(name, TWO_LINES_FROM);
