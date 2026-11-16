import { expect, it } from "vite-plus/test";

import { hasAsset, resolveAsset } from ".";
import { manifest } from "./manifest";

it("resolves every asset in the manifest, fetched or not", () => {
  for (const asset of manifest.assets) {
    expect(resolveAsset(asset.id), asset.id).toEqual(expect.stringMatching(/./));
  }
});

it("knows which assets the manifest lists", () => {
  expect(hasAsset("ultimate/announcer-line/mario")).toBe(true);
  // Inkling was never in Melee, so Melee's announcer has no line for them.
  expect(hasAsset("melee/announcer-line/inkling")).toBe(false);
});
