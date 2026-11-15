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
    return fetched[asset.path] ?? placeholders[asset.kind];
  };
}
