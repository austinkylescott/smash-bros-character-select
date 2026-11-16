import { describe, expect, it } from "vite-plus/test";

import { ROSTER_DATA } from "../official/data";
import { manifest, validateManifest } from "./manifest";

const mario = {
  id: "ultimate/portrait/mario",
  game: "ultimate",
  kind: "portrait",
  path: "ultimate/portraits/mario.png",
};

describe("manifest validation", () => {
  it("accepts a well-formed manifest", () => {
    expect(validateManifest({ assets: [mario] })).toEqual([]);
  });

  it("reports an id used by more than one asset", () => {
    const problems = validateManifest({
      assets: [mario, { ...mario, path: "ultimate/portraits/mario-alt.png" }],
    });

    expect(problems).toEqual(['Duplicate id "ultimate/portrait/mario"']);
  });

  it("reports a game or kind outside the known set", () => {
    const problems = validateManifest({
      assets: [{ ...mario, game: "smash-4", kind: "icon" }],
    });

    expect(problems).toEqual([
      'Unknown game "smash-4" on "ultimate/portrait/mario"',
      'Unknown kind "icon" on "ultimate/portrait/mario"',
    ]);
  });

  it("reports a path that would escape the fetch folder", () => {
    const problems = validateManifest({
      assets: [
        { ...mario, id: "a", path: "../outside.png" },
        { ...mario, id: "b", path: "/etc/outside.png" },
      ],
    });

    expect(problems).toEqual([
      'Unsafe path "../outside.png" on "a"',
      'Unsafe path "/etc/outside.png" on "b"',
    ]);
  });
});

describe("the committed manifest", () => {
  it("is valid", () => {
    expect(validateManifest(manifest)).toEqual([]);
  });

  it("gives every game a menu track and the six approved sound effects", () => {
    const games = ["ultimate", "melee", "brawl", "smash-64", "smash-for-wii-u", "smash-for-3ds"];
    const effects = [
      "hand-move",
      "token-pick-up",
      "token-drop",
      "panel-toggle",
      "back",
      "ready-to-fight",
    ];
    const ids = new Set(manifest.assets.map((asset) => asset.id));

    for (const game of games) {
      expect(ids.has(`${game}/music/menu`), game).toBe(true);
      for (const effect of effects) expect(ids.has(`${game}/sound-effect/${effect}`)).toBe(true);
    }
  });

  it("gives every official fighter an announcer call", () => {
    const ids = new Set(manifest.assets.map((asset) => asset.id));
    const missing = Object.entries(ROSTER_DATA).flatMap(([game, { fighters }]) =>
      fighters.map((f) => `${game}/announcer-line/${f}`).filter((id) => !ids.has(id)),
    );

    expect(missing).toEqual([]);
  });

  it("shares announcer calls between 3DS and Wii U", () => {
    const pathOf = (id: string) => manifest.assets.find((asset) => asset.id === id)?.path;

    for (const fighter of ROSTER_DATA["smash-for-3ds"].fighters) {
      expect(pathOf(`smash-for-wii-u/announcer-line/${fighter}`)).toBe(
        pathOf(`smash-for-3ds/announcer-line/${fighter}`),
      );
    }
  });
});
