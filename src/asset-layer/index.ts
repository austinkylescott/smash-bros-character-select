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

export { manifest };
export type { AssetEntry, AssetKind, Game } from "./manifest";

// Files put in `official/` by `scripts/fetch-assets.ts`. The folder is gitignored
// and is empty on a fresh clone, where every asset resolves to a placeholder.
const fetchedFiles = import.meta.glob<string>("./official/**/*", {
  eager: true,
  query: "?url",
  import: "default",
});

/** Resolves a manifest id to the URL of its file, or of a placeholder if it has not been fetched. */
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
