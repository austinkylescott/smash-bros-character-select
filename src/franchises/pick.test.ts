import { describe, expect, it } from "vite-plus/test";

import type { UploadedImage } from "../portraits/upload";
import { addFighter, type CustomFighter, newRoster, type Roster } from "../rosters/roster";
import { createRosterStore, type RosterStorage } from "../rosters/store";
import { pickFromPool } from "./pool";
import type { CastMember } from "./source";

const naruto: CastMember = {
  id: "anilist-character-17",
  name: "Naruto Uzumaki",
  image: "https://s4.anilist.co/file/anilistcdn/character/large/b17.png",
};
const luffy: CastMember = {
  id: "anilist-character-40",
  name: "Monkey D. Luffy",
  image: "https://s4.anilist.co/file/anilistcdn/character/large/b40.png",
};

/** The site's own copy of a source image, as it is kept after fetching and resizing. */
const copy: UploadedImage = { image: "data:image/webp;base64,UklGRg==", width: 300, height: 450 };

function browserStorage(): RosterStorage {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
  };
}

const roster: Roster = { ...newRoster("r1"), name: "Mixed" };

describe("picking a fighter from the pool", () => {
  it("adds the character at the end, named, with the site's own copy of the image", () => {
    const picked = pickFromPool(addFighter(roster, "kirby"), naruto, copy);

    const fighter = picked.fighters[1] as CustomFighter;
    expect(fighter.id).toBe(naruto.id);
    expect(fighter.name).toBe("Naruto Uzumaki");
    expect(fighter.portrait.image).toBe(copy.image);
    expect(JSON.stringify(picked)).not.toContain("anilist.co");
  });

  it("starts the image centre-cropped, ready for the crop tool", () => {
    const fighter = pickFromPool(roster, naruto, copy).fighters[0] as CustomFighter;

    expect(fighter.portrait.slot).toEqual({ x: 0, y: 125, width: 300, height: 200 });
    expect(fighter.portrait.panel).toEqual({ x: 0, y: 75, width: 300, height: 300 });
  });

  it("never adds the same character twice", () => {
    const once = pickFromPool(roster, naruto, copy);

    expect(pickFromPool(once, naruto, copy)).toBe(once);
  });

  it("mixes franchises with official fighters, and the roster keeps without the source", () => {
    const storage = browserStorage();
    const mixed = pickFromPool(
      pickFromPool(addFighter(roster, "mario"), naruto, copy),
      luffy,
      copy,
    );
    createRosterStore(storage).save(mixed);

    const afterReload = createRosterStore(storage).list();

    expect(afterReload).toEqual([mixed]);
    expect(afterReload[0]?.fighters.map((fighter) => fighter.id)).toEqual([
      "mario",
      naruto.id,
      luffy.id,
    ]);
  });
});
