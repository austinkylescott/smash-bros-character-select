/** Ultimate's player panels: how 2 to 8 share the band below the grid, in stage pixels. */
import type { Box } from "../../selection/navigate";
import { PANEL_GAP as GAP, ULTIMATE_LANDSCAPE, type UltimateLayout } from "./layout";

/**
 * One box per panel, all the same size, filling the layout's band in rows: left to right, then
 * top to bottom.
 */
export function ultimatePanels(count: number, layout: UltimateLayout = ULTIMATE_LANDSCAPE): Box[] {
  const band = layout.panelBand;
  const columns = layout.panelColumns(count);
  const rows = Math.ceil(count / columns);
  const width = (band.width - GAP * (columns - 1)) / columns;
  const height = (band.height - GAP * (rows - 1)) / rows;
  return Array.from({ length: count }, (_, index) => ({
    x: band.x + (index % columns) * (width + GAP),
    y: band.y + Math.floor(index / columns) * (height + GAP),
    width,
    height,
  }));
}

/** Where a token waits in its panel when it is neither held nor on a slot: on the panel's glove. */
export function ultimateTokenHome(panel: Box) {
  return { x: panel.x + 10 + (panel.width - 20) * 0.66, y: panel.y + 140 };
}
