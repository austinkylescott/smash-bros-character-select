/**
 * The template boundary: a template is given a `ScreenRoster` and renders it. It never sees how a
 * roster is stored, and roster code never sees how a template lays it out.
 */
import { hasAsset, resolveAsset } from "../asset-layer";
import type { Game } from "../asset-layer/manifest";
import { type OfficialRoster, portraitAssetId } from "../official";

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
 * Prepares a roster for a template, taking each portrait from the template's game or the nearest
 * one whose portraits the asset layer has.
 */
export function screenRoster(
  roster: OfficialRoster,
  template: Template,
  resolve: (assetId: string) => string = resolveAsset,
): ScreenRoster {
  return {
    randomSlot: roster.randomSlot,
    fighters: roster.fighters.map(({ id, name }) => ({
      id,
      name,
      portrait: resolve(portraitAssetId(id, template, hasAsset)),
    })),
  };
}
