import { describe, expect, it } from "vite-plus/test";

import { officialRosters } from "../../official";
import { ownTile, tileOf } from "./tiles";

describe("Smash for 3DS portrait tiles", () => {
  it("gives the game's own fighters the colour of their tile on its screen", () => {
    expect(tileOf("mario").bottom).toBe("#e2363c");
    expect(tileOf("luigi").bottom).toBe("#30ac4a");
    expect(tileOf("pikachu").bottom).toBe("#f0c620");
  });

  it("gives every fighter the game had a tile of their own colour", () => {
    for (const fighter of officialRosters["smash-for-3ds"].fighters) {
      expect(ownTile(fighter.id), fighter.id).toBeDefined();
    }
  });

  it("gives anyone else one of the game's colours, the same one each time", () => {
    expect(ownTile("custom-fighter-42")).toBeUndefined();
    const tile = tileOf("custom-fighter-42");
    expect(tileOf("custom-fighter-42")).toBe(tile);
    expect(tile.top).toMatch(/^#[0-9a-f]{6}$/);
  });
});
