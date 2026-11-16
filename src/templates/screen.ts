/**
 * The template boundary: a template is given a `ScreenRoster` and renders it. It never sees how a
 * roster is stored, and roster code never sees how a template lays it out.
 */
import { hasAsset, portraitStandIn, resolveAsset } from "../asset-layer";
import type { Game } from "../asset-layer/manifest";
import { officialFighter, portraitAssetId } from "../official";
import type { Crop, ImageSize } from "../portraits/crop";
import { type CustomFighter, isCustomFighter, type RosterFighter } from "../rosters/roster";

/** The six templates, one per game. */
export type Template = Game;

export interface ScreenFighter {
  readonly id: string;
  readonly name: string;
  /** URL of the fighter's portrait for this template. */
  readonly portrait: string;
  /**
   * For a fighter added by image: the image's size and the regions of it to show in a slot and in
   * a player panel. Official portraits have none, and are framed as the template frames them.
   */
  readonly crops?: PortraitCrops;
}

export interface PortraitCrops extends ImageSize {
  readonly slot: Crop;
  readonly panel: Crop;
}

export interface ScreenRoster {
  readonly fighters: readonly ScreenFighter[];
  readonly randomSlot: boolean;
}

/**
 * What a template can show: an official roster or one a user made. Each fighter is an official
 * one, named by id, which may carry a name to show in place of its own, or one a user added by
 * name and image.
 */
export interface ShowableRoster {
  readonly fighters: readonly RosterFighter[];
  readonly randomSlot: boolean;
}

const customScreenFighter = ({ id, name, portrait }: CustomFighter): ScreenFighter => ({
  id,
  name,
  portrait: portrait.image,
  crops: {
    width: portrait.width,
    height: portrait.height,
    slot: portrait.slot,
    panel: portrait.panel,
  },
});

/**
 * Prepares a roster for a template, taking each official portrait from the template's game or the
 * nearest one whose portraits the asset layer has. A fighter with no portrait in any game gets a
 * stand-in. A fighter added by image has the same image and crops in every template.
 */
export function screenRoster(
  roster: ShowableRoster,
  template: Template,
  resolve: (assetId: string) => string = resolveAsset,
): ScreenRoster {
  return {
    randomSlot: roster.randomSlot,
    fighters: roster.fighters.map((fighter) => {
      if (isCustomFighter(fighter)) return customScreenFighter(fighter);
      const { id, name } = fighter;
      const portrait = portraitAssetId(id, template, hasAsset);
      return {
        id,
        name: name ?? officialFighter(id).name,
        portrait: hasAsset(portrait) ? resolve(portrait) : portraitStandIn,
      };
    }),
  };
}
