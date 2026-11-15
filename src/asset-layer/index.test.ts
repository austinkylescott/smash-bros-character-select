import { expect, it } from "vite-plus/test";

import { manifest, resolveAsset } from ".";

it("resolves every asset in the manifest, fetched or not", () => {
  for (const asset of manifest.assets) {
    expect(resolveAsset(asset.id), asset.id).toEqual(expect.stringMatching(/./));
  }
});
