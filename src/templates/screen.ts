/**
 * The template boundary: a template is given a `ScreenRoster` and renders it. It never sees how a
 * roster is stored, and roster code never sees how a template lays it out.
 */
import { hasAsset, portraitStandIn, resolveAsset } from "../asset-layer";
import type { Game } from "../asset-layer/manifest";
import { officialFighter, portraitAssetId } from "../official";

/** The six templates, one per game. */
export type Template = Game;

export interface ScreenFighter {
  readonly id: string;
  readonly name: string;
  /** URL of the fighter's portrait for this template. */
  readonly portrait: string;
}

export interface ScreenRoster {
  readonly fighters: readonly ScreenFighter[];
  readonly randomSlot: boolean;
}

/**
 * What a template can show: an official roster or one a user made. Each fighter is an official
 * one, named by id, and may carry a name to show in place of its own.
 */
export interface ShowableRoster {
  readonly fighters: readonly { readonly id: string; readonly name?: string }[];
  readonly randomSlot: boolean;
}

/**
 * Prepares a roster for a template, taking each portrait from the template's game or the nearest
 * one whose portraits the asset layer has. A fighter with no portrait in any game gets a stand-in.
 */
export function screenRoster(
  roster: ShowableRoster,
  template: Template,
  resolve: (assetId: string) => string = resolveAsset,
): ScreenRoster {
  return {
    randomSlot: roster.randomSlot,
    fighters: roster.fighters.map(({ id, name }) => {
      const portrait = portraitAssetId(id, template, hasAsset);
      return {
        id,
        name: name ?? officialFighter(id).name,
        portrait: hasAsset(portrait) ? resolve(portrait) : portraitStandIn,
      };
    }),
  };
}
