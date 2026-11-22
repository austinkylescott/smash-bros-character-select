/**
 * Where the Smash for Wii U template puts its pieces, in stage pixels. The game draws at 1280x720,
 * and so does its stage here, so measurements from the reference screenshots carry over as they
 * are.
 *
 * There are two stages: the game's own 16:9 screen, and a tall one for phones held upright
 * (ADR 0006). Both are the same width and share the header; the upright stage gives the grid the
 * tall space below it and stacks the player panels in two rows at its foot.
 */
import type { Box } from "../../selection/navigate";
import type { Orientation, Size } from "../stage";

export interface WiiULayout {
  readonly stage: Size;
  /** The dark band the fighter grid sits on, below the header. */
  readonly band: { readonly y: number; readonly height: number };
  /** The space the fighter grid fills, inside the band. */
  readonly gridArea: Box;
  /** The largest a slot may grow. The game's own is the size of a slot on its starter screen. */
  readonly maxSlot: Size;
  /** The space the player panels fill, below the band. */
  readonly panelBand: Box;
  /** How many panels share a row, with this many on screen. */
  readonly panelColumns: (count: number) => number;
  /** The "Ready to Fight!" banner's vertical centre. */
  readonly bannerY: number;
}

/**
 * The game's slots change shape as well as size. On the full roster's screen, five rows deep,
 * they are wide; on the launch roster's, four rows of thirteen across the whole band, nearly
 * square. A slot is never wider or squarer than these two. The starter screen's are the biggest.
 */
export const WII_U_WIDE_SLOT: Size = { width: 92, height: 60 };
export const WII_U_SQUARE_SLOT: Size = { width: 1228 / 13, height: 75 };
export const WII_U_STARTER_SLOT: Size = { width: 99.5, height: 75 };

/** Every stage is the game's width. */
const STAGE_WIDTH = 1280;
/** The header ends, and the charcoal band begins, here. */
const BAND_TOP = 87;
/** The grid's first row starts a little way into the band. */
const GRID_TOP = 92;

/** The game's own screen. */
export const WII_U_LANDSCAPE: WiiULayout = {
  stage: { width: STAGE_WIDTH, height: 720 },
  band: { y: BAND_TOP, height: 306 },
  gridArea: { x: 26, y: GRID_TOP, width: 1228, height: 300 },
  maxSlot: WII_U_STARTER_SLOT,
  panelBand: { x: 42, y: 430, width: 1196, height: 290 },
  panelColumns: (count) => count,
  bannerY: 392,
};

/** 9:16, the shape of a phone held upright. */
const UPRIGHT_HEIGHT = 2276;
/** The space between neighbouring panels. */
export const PANEL_GAP = 12;
/** Two rows of panels, each as tall as one on the game's own screen. */
const UPRIGHT_PANELS_TOP = UPRIGHT_HEIGHT - (WII_U_LANDSCAPE.panelBand.height * 2 + PANEL_GAP);
const MARGIN = 16;
/** The grid stops short of the panels, leaving the banner room; the band ends just below it. */
const UPRIGHT_GRID_BOTTOM = UPRIGHT_PANELS_TOP - 40;

/**
 * For a phone held upright: the header as on the game's screen, the band and its grid filling the
 * tall space below it, and the panels in two rows at the foot: Smash's four two to a row, 8-Player
 * Smash's eight four to a row. Slots may grow to twice the starter screen's, so a small roster
 * does not sit lost in the space.
 */
export const WII_U_UPRIGHT: WiiULayout = {
  stage: { width: STAGE_WIDTH, height: UPRIGHT_HEIGHT },
  band: { y: BAND_TOP, height: UPRIGHT_GRID_BOTTOM + 1 - BAND_TOP },
  gridArea: {
    x: MARGIN,
    y: GRID_TOP,
    width: STAGE_WIDTH - MARGIN * 2,
    height: UPRIGHT_GRID_BOTTOM - GRID_TOP,
  },
  maxSlot: { width: WII_U_STARTER_SLOT.width * 2, height: WII_U_STARTER_SLOT.height * 2 },
  panelBand: {
    x: MARGIN,
    y: UPRIGHT_PANELS_TOP,
    width: STAGE_WIDTH - MARGIN * 2,
    height: UPRIGHT_HEIGHT - UPRIGHT_PANELS_TOP,
  },
  panelColumns: (count) => (count <= 4 ? 2 : 4),
  bannerY: UPRIGHT_GRID_BOTTOM,
};

/** The layout for a viewport: the tall stage when it is held upright, the game's own otherwise. */
export const wiiULayout = (orientation: Orientation): WiiULayout =>
  orientation === "upright" ? WII_U_UPRIGHT : WII_U_LANDSCAPE;
