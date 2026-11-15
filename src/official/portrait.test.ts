import { describe, expect, it } from "vite-plus/test";

import { portraitAssetId } from "./index";

describe("official portrait resolution", () => {
  it("uses the template's own game when the fighter appeared in it", () => {
    expect(portraitAssetId("mario", "smash-for-wii-u")).toBe("smash-for-wii-u/portrait/mario");
  });

  it("falls back to the nearest game that has the fighter: Snake in Smash for Wii U", () => {
    // Snake was in Brawl and Ultimate; Ultimate is one game away, Brawl two.
    expect(portraitAssetId("snake", "smash-for-wii-u")).toBe("ultimate/portrait/snake");
  });

  it("falls back to a later game when the fighter debuted after it: Ridley in Smash 64", () => {
    expect(portraitAssetId("ridley", "smash-64")).toBe("ultimate/portrait/ridley");
  });

  it("falls back to an earlier game when that is nearer: Mewtwo in Brawl", () => {
    expect(portraitAssetId("mewtwo", "brawl")).toBe("melee/portrait/mewtwo");
  });

  it("prefers the later game when two are equally near: Roy in Smash for 3DS", () => {
    // Roy: Melee and Ultimate. Melee is two games from the 3DS, Ultimate is two too.
    expect(portraitAssetId("roy", "smash-for-3ds")).toBe("ultimate/portrait/roy");
  });

  it("rejects a fighter that is not official", () => {
    expect(() => portraitAssetId("goku", "ultimate")).toThrow(/goku/);
  });
});
