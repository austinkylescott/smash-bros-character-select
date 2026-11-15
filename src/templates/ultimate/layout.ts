/**
 * Where the Ultimate template puts its pieces, in stage pixels. There are two stages: the game's
 * own 16:9 screen, and a stack for phones held upright, with the grid on top and the player
 * panels below. Both use the same pieces; only their places differ.
 */
import type { Box } from "../../selection/navigate";
import type { Orientation, Size } from "../stage";

export interface UltimateLayout {
  readonly stage: Size;
  /** The band the fighter grid fills, between the top bar and the floor. */
  readonly gridArea: Box;
  /** Where the floor the player panels stand on begins. */
  readonly floorTop: number;
  /** The band the player panels fill, left of the add and remove tabs. */
  readonly panelBand: Box;
  /** How many panels share a row, with this many on screen. */
  readonly panelColumns: (count: number) => number;
  /** The add and remove tabs' left edge, and their tops. */
  readonly tabs: { readonly x: number; readonly addTop: number; readonly removeTop: number };
  /** The "Ready to Fight!" banner's top, and how much it is scaled to fit across the stage. */
  readonly banner: { readonly top: number; readonly scale: number };
}

/** A player panel's height, which its contents are laid out on. */
const PANEL_HEIGHT = 386;
const PANEL_GAP = 8;

/** Ultimate's own screen: the grid above, the panels side by side across the bottom. */
export const ULTIMATE_LANDSCAPE: UltimateLayout = {
  stage: { width: 1920, height: 1080 },
  gridArea: { x: 24, y: 84, width: 1872, height: 576 },
  floorTop: 662,
  panelBand: { x: 14, y: 694, width: 1826, height: PANEL_HEIGHT },
  panelColumns: (count) => count,
  tabs: { x: 1844, addTop: 806, removeTop: 944 },
  banner: { top: 300, scale: 1 },
};

const PORTRAIT_WIDTH = 1080;
const PORTRAIT_HEIGHT = 1920;
/** Two rows of panels fill the bottom of the portrait stage. */
const PORTRAIT_BAND_HEIGHT = PANEL_HEIGHT * 2 + PANEL_GAP;
const PORTRAIT_BAND_TOP = PORTRAIT_HEIGHT - PORTRAIT_BAND_HEIGHT;
const TAB_STRIP = 74;

/**
 * For a phone held upright: the grid across the top, the panels stacked in two rows beneath.
 * Two players get a full-width panel each; three or four share two columns; more share four.
 */
export const ULTIMATE_PORTRAIT: UltimateLayout = {
  stage: { width: PORTRAIT_WIDTH, height: PORTRAIT_HEIGHT },
  gridArea: { x: 20, y: 92, width: 1040, height: PORTRAIT_BAND_TOP - 32 - 12 - 92 },
  floorTop: PORTRAIT_BAND_TOP - 32,
  panelBand: {
    x: 12,
    y: PORTRAIT_BAND_TOP,
    width: PORTRAIT_WIDTH - 12 - TAB_STRIP,
    height: PORTRAIT_BAND_HEIGHT,
  },
  panelColumns: (count) => (count <= 2 ? 1 : count <= 4 ? 2 : 4),
  tabs: {
    x: PORTRAIT_WIDTH - 70,
    addTop: PORTRAIT_HEIGHT - 136 - 8 - 130,
    removeTop: PORTRAIT_HEIGHT - 136,
  },
  banner: { top: PORTRAIT_BAND_TOP - 300, scale: 0.6 },
};

/** The layout for a viewport: the stack when it is held upright, Ultimate's own screen otherwise. */
export const ultimateLayout = (orientation: Orientation): UltimateLayout =>
  orientation === "portrait" ? ULTIMATE_PORTRAIT : ULTIMATE_LANDSCAPE;
