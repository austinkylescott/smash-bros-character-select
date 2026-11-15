/** Words Ultimate leaves in their own case when it capitalises a name. */
const KEEP_CASE = new Set(["Mii", "Wii", "Fit"]);
/** Names this long or longer go on two lines. */
const TWO_LINES_FROM = 13;

/**
 * A fighter's name as Ultimate prints it on a slot: in capitals, and split over two lines when
 * long, as evenly as the words allow. Mii fighters always put "Mii" on a line of its own.
 */
export function slotLabel(name: string): string[] {
  const words = name
    .split(" ")
    .map((word) => (KEEP_CASE.has(word) ? word : word.toLocaleUpperCase("en")));

  if (words[0] === "Mii" && words.length > 1) return ["Mii", words.slice(1).join(" ")];
  if (name.length < TWO_LINES_FROM || words.length < 2) return [words.join(" ")];

  const longest = (lines: string[]) => Math.max(...lines.map((line) => line.length));
  let best: string[] = [];
  for (let split = 1; split < words.length; split++) {
    const lines = [words.slice(0, split).join(" "), words.slice(split).join(" ")];
    if (best.length === 0 || longest(lines) < longest(best)) best = lines;
  }
  return best;
}
