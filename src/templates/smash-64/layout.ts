/**
 * Where the Smash 64 template puts its pieces, in stage pixels. The game's own screen is 320x240;
 * its stage here is drawn at four times that, so measurements from the reference screenshots
 * quadruple.
 *
 * There are two stages: the game's own 4:3 screen, and a taller one for phones held upright
 * (ADR 0006). Both are the same width and share the header and the row of four player panels;
 * the upright stage only gives the grid more room above the panels.
 */
import type { Box } from "../../selection/navigate";
import type { Orientation, Size } from "../stage";

export interface Smash64Layout {
  readonly stage: Size;
  /** The band the fighter grid fills, below the header. */
  readonly gridArea: Box;
  /** The largest a slot may grow. The game's own is one of its twelve slots. */
  readonly maxSlot: Size;
  /** The band the four player panels fill. */
  readonly panelBand: Box;
  /** The "Ready to Fight" banner's vertical centre. */
  readonly bannerY: number;
}

/** One of the game's slots: six to a row across the band, two rows deep. Slots touch. */
export const SMASH_64_SLOT: Size = { width: 1084 / 6, height: 172 };

/** The game's own screen. */
export const SMASH_64_LANDSCAPE: Smash64Layout = {
  stage: { width: 1280, height: 960 },
  gridArea: { x: 96, y: 140, width: 1084, height: 344 },
  maxSlot: SMASH_64_SLOT,
  panelBand: { x: 88, y: 500, width: 1092, height: 362 },
  // Across the seam between the grid's two rows, as the game draws it.
  bannerY: 308,
};

const UPRIGHT_HEIGHT = 2048;
/** On the upright stage the panels sit as far from its foot as on the game's own screen. */
const UPRIGHT_PANELS_TOP = SMASH_64_LANDSCAPE.panelBand.y + UPRIGHT_HEIGHT - 960;
const MARGIN = 24;

/**
 * For a phone held upright: the header and panels as on the game's screen, with the grid filling
 * the tall space between them across the full width. Slots may grow to twice the game's own, so a
 * small roster does not sit lost in the space.
 */
export const SMASH_64_UPRIGHT: Smash64Layout = {
  stage: { width: 1280, height: UPRIGHT_HEIGHT },
  gridArea: {
    x: MARGIN,
    y: 140,
    width: 1280 - MARGIN * 2,
    height: UPRIGHT_PANELS_TOP - MARGIN - 140,
  },
  maxSlot: { width: SMASH_64_SLOT.width * 2, height: SMASH_64_SLOT.height * 2 },
  panelBand: { ...SMASH_64_LANDSCAPE.panelBand, y: UPRIGHT_PANELS_TOP },
  bannerY: UPRIGHT_PANELS_TOP - (SMASH_64_LANDSCAPE.panelBand.y - SMASH_64_LANDSCAPE.bannerY),
};

/** The layout for a viewport: the tall stage when it is held upright, the game's own otherwise. */
export const smash64Layout = (orientation: Orientation): Smash64Layout =>
  orientation === "upright" ? SMASH_64_UPRIGHT : SMASH_64_LANDSCAPE;
