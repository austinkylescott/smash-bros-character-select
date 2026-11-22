/** Brawl's four player panels, side by side below the grid, in stage pixels. */
import type { Box } from "../../selection/navigate";
import { BRAWL_LANDSCAPE, type BrawlLayout } from "./layout";

/** Brawl has a panel for each of the Wii's four controller ports. */
export const PANEL_COUNT = 4;
/** The space between neighbouring panels. */
const GAP = 21;

/** One box per panel, name plate included, left to right across the layout's band. */
export function brawlPanels(layout: BrawlLayout = BRAWL_LANDSCAPE): Box[] {
  const band = layout.panelBand;
  const width = (band.width - GAP * (PANEL_COUNT - 1)) / PANEL_COUNT;
  return Array.from({ length: PANEL_COUNT }, (_, index) => ({
    x: band.x + index * (width + GAP),
    y: band.y,
    width,
    height: band.height,
  }));
}

/** Where a token waits in its panel when it is neither held nor on a slot: over the fighter. */
export function brawlTokenHome(panel: Box) {
  return { x: panel.x + panel.width * 0.5, y: panel.y + panel.height * 0.42 };
}
