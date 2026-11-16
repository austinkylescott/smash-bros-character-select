/** Names this long or longer go on two lines. Young Link, at ten, is the longest Melee keeps on one. */
const TWO_LINES_FROM = 11;

/**
 * A fighter's name as Melee prints it on a slot: in capitals, and split over two lines when long,
 * as evenly as the words allow. A name too wide for its slot is squeezed by the screen.
 */
export function meleeSlotLabel(name: string): string[] {
  const words = name.toLocaleUpperCase("en").split(" ");
  if (name.length < TWO_LINES_FROM || words.length < 2) return [words.join(" ")];

  const longest = (lines: string[]) => Math.max(...lines.map((line) => line.length));
  let best: string[] = [];
  for (let split = 1; split < words.length; split++) {
    const lines = [words.slice(0, split).join(" "), words.slice(split).join(" ")];
    if (best.length === 0 || longest(lines) < longest(best)) best = lines;
  }
  return best;
}
