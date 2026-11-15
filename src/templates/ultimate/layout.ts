/**
 * Where the Ultimate template puts its pieces, in stage pixels. There are two stages: the game's
 * own 16:9 screen, and a stack for phones held upright, with the grid on top and the player
 * panels below (ADR 0006). Both use the same pieces; only their places differ.
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
/** The space between neighbouring panels, and between the add and remove tabs. */
export const PANEL_GAP = 8;
/** The add and remove tabs' size. They stand right of the panels, the add tab above. */
export const TAB = { width: 62, addHeight: 130, removeHeight: 136 } as const;
/** The top bar's height. The grid starts below it. */
const TOP_BAR_HEIGHT = 84;
/** How far the floor starts above the panels, showing its seam. */
const FLOOR_LIP = 32;

/** Ultimate's own screen: the grid above, the panels side by side across the bottom. */
export const ULTIMATE_LANDSCAPE: UltimateLayout = {
  stage: { width: 1920, height: 1080 },
  gridArea: { x: 24, y: TOP_BAR_HEIGHT, width: 1872, height: 576 },
  floorTop: 694 - FLOOR_LIP,
  panelBand: { x: 14, y: 694, width: 1826, height: PANEL_HEIGHT },
  panelColumns: (count) => count,
  tabs: { x: 1844, addTop: 806, removeTop: 806 + TAB.addHeight + PANEL_GAP },
  banner: { top: 300, scale: 1 },
};

const UPRIGHT = { width: 1080, height: 1920 } as const;
/** The upright stage's margin at its sides, and between the grid and the pieces around it. */
const MARGIN = 12;
/** Two rows of panels fill the bottom of the upright stage. */
const UPRIGHT_PANELS_TOP = UPRIGHT.height - (PANEL_HEIGHT * 2 + PANEL_GAP);
const UPRIGHT_FLOOR_TOP = UPRIGHT_PANELS_TOP - FLOOR_LIP;
const UPRIGHT_TABS_X = UPRIGHT.width - MARGIN / 2 - TAB.width;
const UPRIGHT_GRID_TOP = TOP_BAR_HEIGHT + PANEL_GAP;

/**
 * For a phone held upright: the grid across the top, the panels stacked in two rows beneath.
 * Two players get a full-width panel each; three or four share two columns; more share four.
 */
export const ULTIMATE_UPRIGHT: UltimateLayout = {
  stage: UPRIGHT,
  gridArea: {
    x: MARGIN,
    y: UPRIGHT_GRID_TOP,
    width: UPRIGHT.width - MARGIN * 2,
    height: UPRIGHT_FLOOR_TOP - MARGIN - UPRIGHT_GRID_TOP,
  },
  floorTop: UPRIGHT_FLOOR_TOP,
  panelBand: {
    x: MARGIN,
    y: UPRIGHT_PANELS_TOP,
    width: UPRIGHT_TABS_X - MARGIN / 2 - MARGIN,
    height: UPRIGHT.height - UPRIGHT_PANELS_TOP,
  },
  panelColumns: (count) => (count <= 2 ? 1 : count <= 4 ? 2 : 4),
  tabs: {
    x: UPRIGHT_TABS_X,
    addTop: UPRIGHT.height - TAB.removeHeight - PANEL_GAP - TAB.addHeight,
    removeTop: UPRIGHT.height - TAB.removeHeight,
  },
  banner: { top: UPRIGHT_PANELS_TOP - 300, scale: 0.6 },
};

/** The layout for a viewport: the stack when it is held upright, Ultimate's own screen otherwise. */
export const ultimateLayout = (orientation: Orientation): UltimateLayout =>
  orientation === "upright" ? ULTIMATE_UPRIGHT : ULTIMATE_LANDSCAPE;
