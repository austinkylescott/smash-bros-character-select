import { describe, expect, it } from "vite-plus/test";

import { createAssetLookup } from "./lookup";
import { manifest as officialManifest, type Manifest } from "./manifest";

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

describe("Ultimate sound-effect fallback", () => {
  const effects = officialManifest.assets.filter(
    (asset) =>
      asset.kind === "sound-effect" && (asset.game === "melee" || asset.game === "smash-64"),
  );

  it.each(effects)("uses the matching Ultimate effect for missing $id", (asset) => {
    const name = asset.id.split("/").at(-1);
    const ultimate = officialManifest.assets.find(
      (entry) => entry.id === `ultimate/sound-effect/${name}`,
    )!;
    const resolveAsset = createAssetLookup({
      manifest: officialManifest,
      fetched: { [ultimate.path]: `/built/ultimate-${name}.ogg` },
      placeholders,
    });

    expect(resolveAsset(asset.id)).toBe(`/built/ultimate-${name}.ogg`);
  });

  it.each(effects)("prefers the game's own file for $id", (asset) => {
    const name = asset.id.split("/").at(-1);
    const ultimate = officialManifest.assets.find(
      (entry) => entry.id === `ultimate/sound-effect/${name}`,
    )!;
    const resolveAsset = createAssetLookup({
      manifest: officialManifest,
      fetched: { [asset.path]: "/built/original.ogg", [ultimate.path]: "/built/ultimate.ogg" },
      placeholders,
    });

    expect(resolveAsset(asset.id)).toBe("/built/original.ogg");
  });

  it("uses silence when the original and Ultimate files are both missing", () => {
    const resolveAsset = createAssetLookup({
      manifest: officialManifest,
      fetched: {},
      placeholders,
    });
    for (const asset of effects) {
      expect(resolveAsset(asset.id)).toBe(placeholders["sound-effect"]);
    }
  });

  it("does not substitute Ultimate for other games or other asset kinds", () => {
    const ultimateFiles = Object.fromEntries(
      officialManifest.assets
        .filter((asset) => asset.game === "ultimate")
        .map((asset) => [asset.path, `/built/${asset.path}`]),
    );
    const resolveAsset = createAssetLookup({
      manifest: officialManifest,
      fetched: ultimateFiles,
      placeholders,
    });

    for (const asset of officialManifest.assets.filter(
      (entry) => entry.game !== "ultimate" && !effects.includes(entry),
    )) {
      expect(resolveAsset(asset.id), asset.id).toBe(placeholders[asset.kind]);
    }
  });
});
