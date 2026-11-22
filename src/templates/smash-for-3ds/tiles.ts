/**
 * The coloured tile behind each portrait on Smash for 3DS's grid. The game gives every fighter a
 * tile of their own, pale at the top and deeper at the foot. Fighters the game had keep the
 * colour of their tile in the reference screenshots; anyone else is given one of the same
 * colours, always the same one for the same fighter.
 */

export interface Tile {
  /** The tile's pale top. */
  readonly top: string;
  /** Its deeper foot. */
  readonly bottom: string;
}

const TILES = {
  red: { top: "#f8b0b2", bottom: "#e2363c" },
  pink: { top: "#fcd4ec", bottom: "#ec84b6" },
  orange: { top: "#ffd6a8", bottom: "#ee842e" },
  yellow: { top: "#fff2a4", bottom: "#f0c620" },
  lime: { top: "#e4f2a6", bottom: "#9cc832" },
  green: { top: "#c2eebe", bottom: "#30ac4a" },
  teal: { top: "#b2e8e0", bottom: "#20b4a0" },
  sky: { top: "#c8e6f8", bottom: "#4aa6e6" },
  blue: { top: "#b8caf2", bottom: "#3a60d0" },
  purple: { top: "#eac4f2", bottom: "#aa5aca" },
  lavender: { top: "#ded6f4", bottom: "#8c82c8" },
  brown: { top: "#eacfae", bottom: "#a26c3e" },
  grey: { top: "#ececec", bottom: "#a8aaae" },
} as const satisfies Record<string, Tile>;

type TileColour = keyof typeof TILES;

/** The game's own fighters, by the colour of their tile on its screen. */
const OWN_TILES: Readonly<Record<string, TileColour>> = {
  mario: "red",
  luigi: "green",
  peach: "pink",
  bowser: "orange",
  yoshi: "green",
  "rosalina-and-luma": "teal",
  "bowser-jr": "yellow",
  wario: "yellow",
  "mr-game-and-watch": "grey",
  "donkey-kong": "brown",
  "diddy-kong": "red",
  link: "lime",
  zelda: "purple",
  sheik: "lavender",
  ganondorf: "lavender",
  "toon-link": "lime",
  samus: "lavender",
  "zero-suit-samus": "blue",
  pit: "sky",
  palutena: "green",
  marth: "teal",
  ike: "brown",
  robin: "purple",
  kirby: "pink",
  "king-dedede": "orange",
  "meta-knight": "blue",
  "little-mac": "green",
  fox: "sky",
  falco: "teal",
  pikachu: "yellow",
  charizard: "orange",
  lucario: "sky",
  jigglypuff: "pink",
  greninja: "blue",
  "duck-hunt": "brown",
  rob: "grey",
  ness: "red",
  "captain-falcon": "red",
  villager: "red",
  olimar: "green",
  "wii-fit-trainer": "grey",
  "dr-mario": "grey",
  "dark-pit": "purple",
  lucina: "blue",
  shulk: "yellow",
  "pac-man": "yellow",
  "mega-man": "sky",
  sonic: "blue",
  mii: "orange",
  // The Extra Fighters page.
  mewtwo: "lavender",
  lucas: "orange",
  roy: "green",
  ryu: "red",
  cloud: "teal",
  corrin: "sky",
  bayonetta: "grey",
};

const COLOURS = Object.keys(TILES) as TileColour[];

/** A small, stable hash of a fighter's id, so a fighter keeps their colour between visits. */
function hash(id: string): number {
  let value = 0;
  for (const char of id) value = (value * 31 + char.codePointAt(0)!) >>> 0;
  return value;
}

/** A fighter's tile on the game's own screen, or undefined for one the game did not have. */
export function ownTile(fighterId: string): Tile | undefined {
  const colour = OWN_TILES[fighterId];
  return colour && TILES[colour];
}

/** A fighter's tile: their own on the game's screen, or a stable pick from the same colours. */
export const tileOf = (fighterId: string): Tile =>
  ownTile(fighterId) ?? TILES[COLOURS[hash(fighterId) % COLOURS.length]!];
