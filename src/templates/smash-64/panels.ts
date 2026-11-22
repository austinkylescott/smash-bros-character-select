/** Smash 64's four player panels, side by side below the grid, in stage pixels. */
import type { Box } from "../../selection/navigate";
import { SMASH_64_LANDSCAPE, type Smash64Layout } from "./layout";

/** The game has a panel for each of the N64's four controller ports. */
export const PANEL_COUNT = 4;
/** The space between neighbouring panels. */
const GAP = 12;

/** One box per panel, left to right across the layout's band. */
export function smash64Panels(layout: Smash64Layout = SMASH_64_LANDSCAPE): Box[] {
  const band = layout.panelBand;
  const width = (band.width - GAP * (PANEL_COUNT - 1)) / PANEL_COUNT;
  return Array.from({ length: PANEL_COUNT }, (_, index) => ({
    x: band.x + index * (width + GAP),
    y: band.y,
    width,
    height: band.height,
  }));
}

/** Where a token waits in its panel when it is neither held nor on a slot: low on the fighter. */
export function smash64TokenHome(panel: Box) {
  return { x: panel.x + panel.width * 0.42, y: panel.y + panel.height * 0.68 };
}
