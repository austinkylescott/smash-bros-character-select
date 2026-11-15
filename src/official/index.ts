import { GAMES, type Game } from "../asset-layer/manifest";
import { FIGHTER_NAMES, ROSTER_DATA } from "./data";

export interface OfficialFighter {
  readonly id: string;
  readonly name: string;
  /**
   * The games whose official roster includes this fighter, oldest first. Taken from the
   * reference screenshots, so DLC fighters do not list the 3DS or Wii U. Miis are one fighter in
   * those games and three in Ultimate, so they do not share portraits.
   */
  readonly games: readonly Game[];
}

export interface OfficialRoster {
  readonly game: Game;
  readonly fighters: readonly OfficialFighter[];
  readonly randomSlot: boolean;
}

const fighterById = new Map<string, OfficialFighter>(
  Object.entries(FIGHTER_NAMES).map(([id, name]) => [
    id,
    Object.freeze({
      id,
      name,
      games: Object.freeze(GAMES.filter((game) => ROSTER_DATA[game].fighters.includes(id))),
    }),
  ]),
);

/** The six official rosters. Frozen: official rosters are read-only. */
export const officialRosters: Readonly<Record<Game, OfficialRoster>> = Object.freeze(
  Object.fromEntries(
    GAMES.map((game) => [
      game,
      Object.freeze({
        game,
        randomSlot: ROSTER_DATA[game].randomSlot,
        fighters: Object.freeze(ROSTER_DATA[game].fighters.map((id) => fighterById.get(id)!)),
      }),
    ]),
  ) as Record<Game, OfficialRoster>,
);

/** Every official fighter. */
export const officialFighters: readonly OfficialFighter[] = Object.freeze([
  ...fighterById.values(),
]);

/**
 * The asset id of a fighter's portrait for a template: that game's own portrait, or else the
 * nearest game that has one. When two games are equally near, the later one wins.
 */
export function portraitAssetId(fighterId: string, template: Game): string {
  const fighter = fighterById.get(fighterId);
  if (!fighter) throw new Error(`Unknown official fighter "${fighterId}".`);

  const distance = (game: Game) => Math.abs(GAMES.indexOf(game) - GAMES.indexOf(template));
  const nearest = [...fighter.games].sort(
    (a, b) => distance(a) - distance(b) || GAMES.indexOf(b) - GAMES.indexOf(a),
  )[0]!;
  return `${nearest}/portrait/${fighterId}`;
}
