/** Ultimate's player panels: how 2 to 8 share the band below the grid, in stage pixels. */
import type { Box } from "../../selection/navigate";

/** The band the panels fill, left of the add and remove tabs. */
const BAND = { x: 14, y: 694, width: 1826, height: 386 } as const;
const GAP = 8;

/** One box per panel, left to right, all the same width. */
export function ultimatePanels(count: number): Box[] {
  const width = (BAND.width - GAP * (count - 1)) / count;
  return Array.from({ length: count }, (_, index) => ({
    x: BAND.x + index * (width + GAP),
    y: BAND.y,
    width,
    height: BAND.height,
  }));
}

/** Where a token waits in its panel when it is neither held nor on a slot: on the panel's glove. */
export function ultimateTokenHome(panel: Box) {
  return { x: panel.x + 10 + (panel.width - 20) * 0.66, y: panel.y + 140 };
}
