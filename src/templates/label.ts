/**
 * A fighter's name as a template prints it on a slot: in capitals, and split over two lines once
 * it is `twoLinesFrom` characters long, as evenly as the words allow. A single word stays on one
 * line, however long, for the screen to squeeze.
 */
export function slotLabel(name: string, twoLinesFrom: number): string[] {
  const words = name.toLocaleUpperCase("en").split(" ");
  if (name.length < twoLinesFrom || words.length < 2) return [words.join(" ")];

  const longest = (lines: string[]) => Math.max(...lines.map((line) => line.length));
  let best: string[] = [];
  for (let split = 1; split < words.length; split++) {
    const lines = [words.slice(0, split).join(" "), words.slice(split).join(" ")];
    if (best.length === 0 || longest(lines) < longest(best)) best = lines;
  }
  return best;
}
