/**
 * Where the Brawl template puts its pieces, in stage pixels. Brawl's own screen is 640x480; its
 * stage here is drawn at twice that, so measurements from the reference screenshots double.
 *
 * There are two stages: the game's own 4:3 screen, and a taller one for phones held upright
 * (ADR 0006). Both are the same width and share the header and the row of four player panels;
 * the upright stage only gives the grid more room above the panels.
 */
import type { Box } from "../../selection/navigate";
import type { Orientation, Size } from "../stage";

export interface BrawlLayout {
  readonly stage: Size;
  /** The band the fighter grid fills, below the header. */
  readonly gridArea: Box;
  /** The largest a slot may grow. Brawl's own is the size of a slot on its starter screen. */
  readonly maxSlot: Size;
  /** The band the four player panels fill, name plates included. */
  readonly panelBand: Box;
  /** The "Ready to Fight" banner's vertical centre. */
  readonly bannerY: number;
}

/**
 * Brawl's slots change shape as well as size. On the full screen, nine to a row and four rows
 * deep, they are wide; on the starter screen, eight to a row and three deep, they are nearly
 * square. A slot is never wider or squarer than these two.
 */
export const BRAWL_FULL_SLOT: Size = { width: 1124 / 9, height: 96 };
export const BRAWL_STARTER_SLOT: Size = { width: 132.5, height: 123 };

/** Brawl's own screen. */
export const BRAWL_LANDSCAPE: BrawlLayout = {
  stage: { width: 1280, height: 960 },
  gridArea: { x: 78, y: 184, width: 1124, height: 384 },
  maxSlot: BRAWL_STARTER_SLOT,
  panelBand: { x: 68, y: 592, width: 1151, height: 308 },
  bannerY: 590,
};

const UPRIGHT_HEIGHT = 2048;
/** On the upright stage the panels sit as far from its foot as on Brawl's own screen. */
const UPRIGHT_PANELS_TOP = BRAWL_LANDSCAPE.panelBand.y + UPRIGHT_HEIGHT - 960;
const MARGIN = 24;

/**
 * For a phone held upright: the header and panels as on Brawl's screen, with the grid filling the
 * tall space between them across the full width. Slots may grow to twice the starter screen's, so
 * a small roster does not sit lost in the space.
 */
export const BRAWL_UPRIGHT: BrawlLayout = {
  stage: { width: 1280, height: UPRIGHT_HEIGHT },
  gridArea: {
    x: MARGIN,
    y: 184,
    width: 1280 - MARGIN * 2,
    height: UPRIGHT_PANELS_TOP - MARGIN - 184,
  },
  maxSlot: { width: BRAWL_STARTER_SLOT.width * 2, height: BRAWL_STARTER_SLOT.height * 2 },
  panelBand: { ...BRAWL_LANDSCAPE.panelBand, y: UPRIGHT_PANELS_TOP },
  bannerY: UPRIGHT_PANELS_TOP - 2,
};

/** The layout for a viewport: the tall stage when it is held upright, Brawl's own otherwise. */
export const brawlLayout = (orientation: Orientation): BrawlLayout =>
  orientation === "upright" ? BRAWL_UPRIGHT : BRAWL_LANDSCAPE;
