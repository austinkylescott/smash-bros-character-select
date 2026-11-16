/** Melee's four player panels, side by side below the grid, in stage pixels. */
import type { Box } from "../../selection/navigate";
import { MELEE_LANDSCAPE, type MeleeLayout } from "./layout";

/** Melee has a panel for each of the console's four controller ports. */
export const PANEL_COUNT = 4;
/** The space between neighbouring panels. */
const GAP = 14;

/** One box per panel, tab included, left to right across the layout's band. */
export function meleePanels(layout: MeleeLayout = MELEE_LANDSCAPE): Box[] {
  const band = layout.panelBand;
  const width = (band.width - GAP * (PANEL_COUNT - 1)) / PANEL_COUNT;
  return Array.from({ length: PANEL_COUNT }, (_, index) => ({
    x: band.x + index * (width + GAP),
    y: band.y,
    width,
    height: band.height,
  }));
}

/** Where a token waits in its panel when it is neither held nor on a slot: over the portrait. */
export function meleeTokenHome(panel: Box) {
  return { x: panel.x + panel.width * 0.5, y: panel.y + panel.height * 0.36 };
}
