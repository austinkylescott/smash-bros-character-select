/** Smash for 3DS's four player cards, side by side on the touch screen, in stage pixels. */
import type { Box } from "../../selection/navigate";
import { SCALE, SMASH_3DS_LAYOUT, type Smash3dsLayout } from "./layout";

/** The game has a card for each of four players. */
export const PANEL_COUNT = 4;

/** The cards' band on the touch screen, between its header and status bar, in the game's pixels. */
const BAND: Box = { x: 2, y: 30, width: 316, height: 192 };
/** The space between neighbouring cards, in the game's pixels. */
const GAP = 4;

/** One box per card, left to right across the touch screen. */
export function smash3dsCards(layout: Smash3dsLayout = SMASH_3DS_LAYOUT): Box[] {
  const { bottomScreen } = layout;
  const width = ((BAND.width - GAP * (PANEL_COUNT - 1)) / PANEL_COUNT) * SCALE;
  return Array.from({ length: PANEL_COUNT }, (_, index) => ({
    x: bottomScreen.x + BAND.x * SCALE + index * (width + GAP * SCALE),
    y: bottomScreen.y + BAND.y * SCALE,
    width,
    height: BAND.height * SCALE,
  }));
}

/** Where a token waits on its card when it is neither held nor on a slot: over the fighter. */
export function smash3dsTokenHome(card: Box) {
  return { x: card.x + card.width * 0.5, y: card.y + card.height * 0.55 };
}
