import { describe, expect, it } from "vite-plus/test";

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
});
