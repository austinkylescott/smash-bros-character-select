import { describe, expect, it } from "vite-plus/test";

import { createAssetLookup } from "./lookup";
import type { Manifest } from "./manifest";

const manifest: Manifest = {
  assets: [
    {
      id: "ultimate/portrait/mario",
      game: "ultimate",
      kind: "portrait",
      path: "ultimate/portraits/mario.png",
    },
    { id: "melee/music/menu", game: "melee", kind: "music", path: "melee/music/menu-1.ogg" },
  ],
};

const placeholders = {
  portrait: "/placeholder/portrait.svg",
  music: "/placeholder/silence.wav",
  "sound-effect": "/placeholder/silence.wav",
  "announcer-line": "/placeholder/silence.wav",
  "ui-art": "/placeholder/ui-art.svg",
};

describe("asset lookup", () => {
  it("resolves an asset to its fetched file", () => {
    const resolveAsset = createAssetLookup({
      manifest,
      fetched: { "ultimate/portraits/mario.png": "/built/mario.abc123.png" },
      placeholders,
    });

    expect(resolveAsset("ultimate/portrait/mario")).toBe("/built/mario.abc123.png");
  });

  it("falls back to the placeholder for the asset's kind when it has not been fetched", () => {
    const resolveAsset = createAssetLookup({ manifest, fetched: {}, placeholders });

    expect(resolveAsset("ultimate/portrait/mario")).toBe("/placeholder/portrait.svg");
    expect(resolveAsset("melee/music/menu")).toBe("/placeholder/silence.wav");
  });

  it("rejects an id that is not in the manifest", () => {
    const resolveAsset = createAssetLookup({ manifest, fetched: {}, placeholders });

    expect(() => resolveAsset("brawl/portrait/nobody")).toThrow(
      'Unknown asset "brawl/portrait/nobody"',
    );
  });
});
