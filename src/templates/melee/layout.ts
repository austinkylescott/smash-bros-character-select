/**
 * Where the Melee template puts its pieces, in stage pixels. Melee's own screen is 640x480; its
 * stage here is drawn at twice that, so measurements from the reference screenshots double.
 *
 * There are two stages: the game's own 4:3 screen, and a taller one for phones held upright
 * (ADR 0006). Both are the same width and share the header and the row of four player panels;
 * the upright stage only gives the grid more room above the panels.
 */
import type { Box } from "../../selection/navigate";
import type { Orientation, Size } from "../stage";

export interface MeleeLayout {
  readonly stage: Size;
  /** The band the fighter grid fills, below the header. */
  readonly gridArea: Box;
  /** The largest a slot may grow. Melee's own is the size of one of its 25 slots. */
  readonly maxSlot: Size;
  /** The band the four player panels fill, tabs included. */
  readonly panelBand: Box;
  /** The "Ready to Fight" banner's vertical centre. */
  readonly bannerY: number;
}

/** One of Melee's slots: nine to a row across the band, three rows deep. Slots touch. */
export const MELEE_SLOT: Size = { width: 1150 / 9, height: 120 };
/** A player panel's height, tab included, which its contents are laid out on. */
const PANEL_HEIGHT = 386;

/** Melee's own screen. */
export const MELEE_LANDSCAPE: MeleeLayout = {
  stage: { width: 1280, height: 960 },
  gridArea: { x: 68, y: 144, width: 1150, height: 360 },
  maxSlot: MELEE_SLOT,
  panelBand: { x: 84, y: 514, width: 1110, height: PANEL_HEIGHT },
  bannerY: 360,
};

const UPRIGHT_HEIGHT = 2048;
/** On the upright stage the panels sit as far from its foot as on Melee's own screen. */
const UPRIGHT_PANELS_TOP = MELEE_LANDSCAPE.panelBand.y + UPRIGHT_HEIGHT - 960;
const MARGIN = 24;

/**
 * For a phone held upright: the header and panels as on Melee's screen, with the grid filling the
 * tall space between them across the full width. Slots may grow to twice Melee's own size, so a
 * small roster does not sit lost in the space.
 */
export const MELEE_UPRIGHT: MeleeLayout = {
  stage: { width: 1280, height: UPRIGHT_HEIGHT },
  gridArea: {
    x: MARGIN,
    y: 144,
    width: 1280 - MARGIN * 2,
    height: UPRIGHT_PANELS_TOP - MARGIN - 144,
  },
  maxSlot: { width: MELEE_SLOT.width * 2, height: MELEE_SLOT.height * 2 },
  panelBand: { ...MELEE_LANDSCAPE.panelBand, y: UPRIGHT_PANELS_TOP },
  bannerY: UPRIGHT_PANELS_TOP - 200,
};

/** The layout for a viewport: the tall stage when it is held upright, Melee's own otherwise. */
export const meleeLayout = (orientation: Orientation): MeleeLayout =>
  orientation === "upright" ? MELEE_UPRIGHT : MELEE_LANDSCAPE;
