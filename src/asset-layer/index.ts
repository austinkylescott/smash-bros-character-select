/**
 * The asset layer: the one way official art and audio reaches the app (ADR 0001, ADR 0005).
 *
 * Call `resolveAsset(id)` with an id from `manifest.json`. Nothing outside this folder
 * may import or link to an official asset directly.
 */
import { createAssetLookup } from "./lookup";
import { manifest } from "./manifest";
import portrait from "./placeholders/portrait.svg";
import silence from "./placeholders/silence.wav";
import uiArt from "./placeholders/ui-art.svg";

// Files put in `official/` by `scripts/fetch-assets.ts`. The folder is gitignored
// and is empty on a fresh clone, where every asset resolves to a placeholder.
const fetchedFiles = import.meta.glob<string>("./official/**/*", {
  eager: true,
  query: "?url",
  import: "default",
});

const ids = new Set(manifest.assets.map((asset) => asset.id));

/** Whether the manifest lists an asset. Lines a game never recorded are not listed. */
export const hasAsset = (id: string): boolean => ids.has(id);

/** Resolves a manifest id, using Ultimate for missing Melee/64 effects, then placeholders. */
export const resolveAsset = createAssetLookup({
  manifest,
  fetched: Object.fromEntries(
    Object.entries(fetchedFiles).map(([file, url]) => [file.replace("./official/", ""), url]),
  ),
  placeholders: {
    portrait,
    music: silence,
    "sound-effect": silence,
    "announcer-line": silence,
    "ui-art": uiArt,
  },
});
