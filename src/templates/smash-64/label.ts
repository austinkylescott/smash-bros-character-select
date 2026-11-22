/** Names the game prints its own way, which no rule gives. */
const GAME_LABELS: Readonly<Record<string, string>> = { "Donkey Kong": "DK" };

/** Names this long or longer are shortened. Captain Falcon, at fourteen, is the game's one. */
const SHORTEN_FROM = 13;

/**
 * A fighter's name as Smash 64 prints it across the top of a slot: in capitals, always on one
 * line. A long name of several words has its first word cut to an initial, as the game prints
 * C.FALCON. A name still too wide for its slot is squeezed by the screen, as the game squeezes
 * JIGGLYPUFF.
 */
export function smash64SlotLabel(name: string): string {
  const own = GAME_LABELS[name];
  if (own) return own;
  const words = name.toLocaleUpperCase("en").split(" ");
  if (name.length < SHORTEN_FROM || words.length < 2) return words.join(" ");
  const [first, ...rest] = words;
  return `${initial(first!)}.${rest.join(" ")}`;
}

/** A word's first letter, kept whole when it is built of more than one code point. */
const initial = (word: string): string =>
  new Intl.Segmenter("en").segment(word)[Symbol.iterator]().next().value?.segment ?? "";
