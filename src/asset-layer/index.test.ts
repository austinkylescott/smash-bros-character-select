import { expect, it } from "vite-plus/test";

import { resolveAsset } from ".";
import { manifest } from "./manifest";

it("resolves every asset in the manifest, fetched or not", () => {
  for (const asset of manifest.assets) {
    expect(resolveAsset(asset.id), asset.id).toEqual(expect.stringMatching(/./));
  }
});
