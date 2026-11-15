import { describe, expect, it } from "vite-plus/test";
import type { Game } from "../asset-layer/manifest";

import { officialRosters } from "./index";

const names = (game: Game) => officialRosters[game].fighters.map((fighter) => fighter.name);

describe("official rosters", () => {
  it("Smash 64 has its twelve fighters in screen order and no random slot", () => {
    expect(names("smash-64")).toEqual([
      "Luigi",
      "Mario",
      "Donkey Kong",
      "Link",
      "Samus",
      "Captain Falcon",
      "Ness",
      "Yoshi",
      "Kirby",
      "Fox",
      "Pikachu",
      "Jigglypuff",
    ]);
    expect(officialRosters["smash-64"].randomSlot).toBe(false);
  });

  it("Melee has its 25 fighters in screen order and no random slot", () => {
    expect(names("melee")).toEqual([
      "Dr. Mario",
      "Mario",
      "Luigi",
      "Bowser",
      "Peach",
      "Yoshi",
      "Donkey Kong",
      "Captain Falcon",
      "Ganondorf",
      "Falco",
      "Fox",
      "Ness",
      "Ice Climbers",
      "Kirby",
      "Samus",
      "Zelda",
      "Link",
      "Young Link",
      "Pichu",
      "Pikachu",
      "Jigglypuff",
      "Mewtwo",
      "Mr. Game & Watch",
      "Marth",
      "Roy",
    ]);
    expect(officialRosters.melee.randomSlot).toBe(false);
  });

  it("Brawl has its 35 fighters in screen order and a random slot", () => {
    expect(names("brawl")).toEqual([
      "Mario",
      "Donkey Kong",
      "Link",
      "Samus",
      "Kirby",
      "Fox",
      "Pikachu",
      "Marth",
      "Mr. Game & Watch",
      "Luigi",
      "Diddy Kong",
      "Zelda",
      "Pit",
      "Meta Knight",
      "Falco",
      "Pokémon Trainer",
      "Ike",
      "Snake",
      "Peach",
      "Yoshi",
      "Ganondorf",
      "Ice Climbers",
      "King Dedede",
      "Wolf",
      "Lucario",
      "Ness",
      "Sonic",
      "Bowser",
      "Wario",
      "Toon Link",
      "R.O.B.",
      "Olimar",
      "Captain Falcon",
      "Jigglypuff",
      "Lucas",
    ]);
    expect(officialRosters.brawl.randomSlot).toBe(true);
  });

  it("Smash for 3DS has its 49 fighters in screen order and a random slot", () => {
    expect(names("smash-for-3ds")).toEqual([
      "Mario",
      "Luigi",
      "Peach",
      "Bowser",
      "Yoshi",
      "Rosalina & Luma",
      "Bowser Jr.",
      "Wario",
      "Mr. Game & Watch",
      "Donkey Kong",
      "Diddy Kong",
      "Link",
      "Zelda",
      "Sheik",
      "Ganondorf",
      "Toon Link",
      "Samus",
      "Zero Suit Samus",
      "Pit",
      "Palutena",
      "Marth",
      "Ike",
      "Robin",
      "Kirby",
      "King Dedede",
      "Meta Knight",
      "Little Mac",
      "Fox",
      "Falco",
      "Pikachu",
      "Charizard",
      "Lucario",
      "Jigglypuff",
      "Greninja",
      "Duck Hunt",
      "R.O.B.",
      "Ness",
      "Captain Falcon",
      "Villager",
      "Olimar",
      "Wii Fit Trainer",
      "Dr. Mario",
      "Dark Pit",
      "Lucina",
      "Shulk",
      "PAC-MAN",
      "Mega Man",
      "Sonic",
      "Mii",
    ]);
    expect(officialRosters["smash-for-3ds"].randomSlot).toBe(true);
  });

  it("Smash for Wii U has its 49 fighters in screen order and a random slot", () => {
    expect(names("smash-for-wii-u")).toEqual([
      "Mario",
      "Luigi",
      "Peach",
      "Bowser",
      "Yoshi",
      "Rosalina & Luma",
      "Bowser Jr.",
      "Wario",
      "Donkey Kong",
      "Diddy Kong",
      "Mr. Game & Watch",
      "Little Mac",
      "Link",
      "Zelda",
      "Sheik",
      "Ganondorf",
      "Toon Link",
      "Samus",
      "Zero Suit Samus",
      "Pit",
      "Palutena",
      "Marth",
      "Ike",
      "Robin",
      "Duck Hunt",
      "Kirby",
      "King Dedede",
      "Meta Knight",
      "Fox",
      "Falco",
      "Pikachu",
      "Charizard",
      "Lucario",
      "Jigglypuff",
      "Greninja",
      "R.O.B.",
      "Ness",
      "Captain Falcon",
      "Villager",
      "Olimar",
      "Wii Fit Trainer",
      "Shulk",
      "Dr. Mario",
      "Dark Pit",
      "Lucina",
      "PAC-MAN",
      "Mega Man",
      "Sonic",
      "Mii",
    ]);
    expect(officialRosters["smash-for-wii-u"].randomSlot).toBe(true);
  });

  it("Ultimate has its 86 fighters in screen order and a random slot", () => {
    const fighters = names("ultimate");
    expect(fighters).toHaveLength(86);
    expect(fighters.slice(0, 13)).toEqual([
      "Mario",
      "Donkey Kong",
      "Link",
      "Samus",
      "Dark Samus",
      "Yoshi",
      "Kirby",
      "Fox",
      "Pikachu",
      "Luigi",
      "Ness",
      "Captain Falcon",
      "Jigglypuff",
    ]);
    expect(fighters.slice(13, 26)).toEqual([
      "Peach",
      "Daisy",
      "Bowser",
      "Ice Climbers",
      "Sheik",
      "Zelda",
      "Dr. Mario",
      "Pichu",
      "Falco",
      "Marth",
      "Lucina",
      "Young Link",
      "Ganondorf",
    ]);
    expect(fighters.slice(26, 39)).toEqual([
      "Mewtwo",
      "Roy",
      "Chrom",
      "Mr. Game & Watch",
      "Meta Knight",
      "Pit",
      "Dark Pit",
      "Zero Suit Samus",
      "Wario",
      "Snake",
      "Ike",
      "Pokémon Trainer",
      "Diddy Kong",
    ]);
    expect(fighters.slice(39, 52)).toEqual([
      "Lucas",
      "Sonic",
      "King Dedede",
      "Olimar",
      "Lucario",
      "R.O.B.",
      "Toon Link",
      "Wolf",
      "Villager",
      "Mega Man",
      "Wii Fit Trainer",
      "Rosalina & Luma",
      "Little Mac",
    ]);
    expect(fighters.slice(52, 65)).toEqual([
      "Greninja",
      "Palutena",
      "PAC-MAN",
      "Robin",
      "Shulk",
      "Bowser Jr.",
      "Duck Hunt",
      "Ryu",
      "Ken",
      "Cloud",
      "Corrin",
      "Bayonetta",
      "Inkling",
    ]);
    expect(fighters.slice(65, 78)).toEqual([
      "Ridley",
      "Simon",
      "Richter",
      "King K. Rool",
      "Isabelle",
      "Incineroar",
      "Piranha Plant",
      "Joker",
      "Hero",
      "Banjo & Kazooie",
      "Terry",
      "Byleth",
      "Min Min",
    ]);
    expect(fighters.slice(78)).toEqual([
      "Steve",
      "Sephiroth",
      "Pyra/Mythra",
      "Kazuya",
      "Sora",
      "Mii Brawler",
      "Mii Swordfighter",
      "Mii Gunner",
    ]);
    expect(officialRosters.ultimate.randomSlot).toBe(true);
  });
});

describe("official rosters are read-only", () => {
  it("cannot have fighters added, removed or reordered", () => {
    const roster = officialRosters.melee as unknown as { fighters: unknown[] };
    expect(() => roster.fighters.push({})).toThrow();
    expect(() => roster.fighters.reverse()).toThrow();
    expect(() => roster.fighters.pop()).toThrow();
    expect(officialRosters.melee.fighters).toHaveLength(25);
  });

  it("cannot have the random slot switched or a roster replaced", () => {
    const rosters = officialRosters as Record<string, { randomSlot: boolean }>;
    expect(() => (rosters.melee!.randomSlot = true)).toThrow();
    expect(() => (rosters.melee = { randomSlot: true })).toThrow();
    expect(officialRosters.melee.randomSlot).toBe(false);
  });
});
