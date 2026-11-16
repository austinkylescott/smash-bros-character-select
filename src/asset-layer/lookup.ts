import type { AssetKind, Manifest } from "./manifest";

export interface AssetLookupOptions {
  manifest: Manifest;
  /** URL of each fetched file, keyed by manifest path. */
  fetched: Record<string, string>;
  placeholders: Record<AssetKind, string>;
}

export function createAssetLookup({ manifest, fetched, placeholders }: AssetLookupOptions) {
  const byId = new Map(manifest.assets.map((asset) => [asset.id, asset]));

  return function resolveAsset(id: string): string {
    const asset = byId.get(id);
    if (!asset) throw new Error(`Unknown asset "${id}". Add it to the manifest first.`);
    const ownFile = fetched[asset.path];
    if (ownFile !== undefined) return ownFile;

    if (asset.kind === "sound-effect" && (asset.game === "melee" || asset.game === "smash-64")) {
      const name = asset.id.split("/").at(-1);
      const fallback = byId.get(`ultimate/sound-effect/${name}`);
      if (fallback?.kind === "sound-effect") {
        const ultimateFile = fetched[fallback.path];
        if (ultimateFile !== undefined) return ultimateFile;
      }
    }

    return placeholders[asset.kind];
  };
}
