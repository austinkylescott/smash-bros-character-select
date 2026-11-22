/** Smash for Wii U's player panels: Smash's four or 8-Player Smash's eight, in stage pixels. */
import type { Box } from "../../selection/navigate";
import { PANEL_GAP as GAP, WII_U_LANDSCAPE, type WiiULayout } from "./layout";

/** Smash seats four players; 8-Player Smash, eight. */
export const SMASH_PANELS = 4;
export const EIGHT_PLAYER_PANELS = 8;

/**
 * One box per panel, all the same size, filling the layout's band in rows: left to right, then
 * top to bottom.
 */
export function wiiUPanels(count: number, layout: WiiULayout = WII_U_LANDSCAPE): Box[] {
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

/** Where a token waits in its panel when it is neither held nor on a slot: high over the fighter. */
export function wiiUTokenHome(panel: Box) {
  return { x: panel.x + panel.width * 0.5, y: panel.y + Math.min(panel.height * 0.3, 90) };
}
