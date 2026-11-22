/**
 * Where the Smash for 3DS template puts its pieces, in stage pixels. The handheld has two
 * displays: the 400x240 top screen, which holds the fighter grid, and the 320x240 touch screen
 * below it, which holds the player cards. The stage draws both at three times the game's size,
 * stacked as on the handheld, with the dark hinge between them.
 *
 * The stacked screens are already taller than they are wide, so unlike the other templates there
 * is no separate upright stage (ADR 0006): phones held either way get the same one.
 */
import type { Box } from "../../selection/navigate";
import type { Orientation, Size } from "../stage";

/** How many stage pixels make one of the game's. */
export const SCALE = 3;

export interface Smash3dsLayout {
  readonly stage: Size;
  /** The top screen, which the fighter grid fills. */
  readonly topScreen: Box;
  /** The touch screen, which holds the header, the four player cards and the status bar. */
  readonly bottomScreen: Box;
  /** The "Ready to Fight" banner's vertical centre, across the top screen. */
  readonly bannerY: number;
}

const TOP: Size = { width: 400 * SCALE, height: 240 * SCALE };
const BOTTOM: Size = { width: 320 * SCALE, height: 240 * SCALE };
/** The hinge between the two screens. */
const HINGE = 72;

export const SMASH_3DS_LAYOUT: Smash3dsLayout = {
  stage: { width: TOP.width, height: TOP.height + HINGE + BOTTOM.height },
  topScreen: { x: 0, y: 0, ...TOP },
  bottomScreen: { x: (TOP.width - BOTTOM.width) / 2, y: TOP.height + HINGE, ...BOTTOM },
  bannerY: TOP.height * 0.5,
};

/** The layout for a viewport: the same stacked screens whichever way it is held. */
export const smash3dsLayout = (_orientation: Orientation): Smash3dsLayout => SMASH_3DS_LAYOUT;
