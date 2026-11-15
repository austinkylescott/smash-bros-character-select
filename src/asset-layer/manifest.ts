import data from "./manifest.json";

export const GAMES = [
  "smash-64",
  "melee",
  "brawl",
  "smash-for-3ds",
  "smash-for-wii-u",
  "ultimate",
] as const;

export const KINDS = ["portrait", "music", "sound-effect", "announcer-line", "ui-art"] as const;

export type Game = (typeof GAMES)[number];
export type AssetKind = (typeof KINDS)[number];

export interface AssetEntry {
  /** Stable name the app resolves the asset by. Never changes when the file does. */
  id: string;
  game: Game;
  kind: AssetKind;
  /** Location of the file, both in the private bucket and under the local fetch folder. */
  path: string;
}

export interface Manifest {
  assets: AssetEntry[];
}

/** Every official asset the app uses. The only place official assets are named. */
export const manifest = data as Manifest;

const SAFE_PATH = /^[\w-][\w.-]*(\/[\w-][\w.-]*)*$/;

/** Lists everything wrong with a manifest. An empty list means it is valid. */
export function validateManifest(manifest: {
  assets: Record<keyof AssetEntry, string>[];
}): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();

  for (const asset of manifest.assets) {
    if (ids.has(asset.id)) problems.push(`Duplicate id "${asset.id}"`);
    ids.add(asset.id);

    if (!(GAMES as readonly string[]).includes(asset.game))
      problems.push(`Unknown game "${asset.game}" on "${asset.id}"`);
    if (!(KINDS as readonly string[]).includes(asset.kind))
      problems.push(`Unknown kind "${asset.kind}" on "${asset.id}"`);
    if (!SAFE_PATH.test(asset.path)) problems.push(`Unsafe path "${asset.path}" on "${asset.id}"`);
  }

  return problems;
}
