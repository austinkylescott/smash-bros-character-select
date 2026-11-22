/**
 * Smash for 3DS's fighter grid on the top screen, in stage pixels, and how a big roster pages.
 *
 * The game's full screen is nine slots to a row and six rows deep, filling the top screen edge to
 * edge; its starter screen has bigger, squarer slots, eight to a row. A roster that fits on one
 * page reflows between those, as big as the screen allows, rows centred.
 *
 * A roster too big for one page pages as the game did once its "Extra Fighters" arrived: the first
 * page keeps the full screen's nine-by-six grid, its last row run in from the left and cut short
 * by the "Extra Fighters" button; the rest go on a second page, above an "Original Fighters"
 * button, as big as the room above it allows. Each page ends with its own random slot, as both of
 * the game's did.
 */
import type { Box } from "../../selection/navigate";
import type { Size } from "../stage";
import { SCALE, SMASH_3DS_LAYOUT, type Smash3dsLayout } from "./layout";

/** The full screen's slot, nine to a row and six deep, in the game's pixels. */
const FULL_SLOT: Size = { width: 400 / 9, height: 40 };
/** The starter screen's, eight to a row and five deep: the biggest a one-page slot grows. */
const STARTER_SLOT: Size = { width: 50, height: 48 };
/** The Extra Fighters page's, four to a row and two deep: the biggest a second-page slot grows. */
const EXTRA_SLOT: Size = { width: 100, height: 100 };

const COLUMNS = 9;
const ROWS = 6;
/** Every slot the full screen has room for, and so the most one page holds. */
export const PAGE_CAPACITY = COLUMNS * ROWS;
/** The cells the page button takes from the end of the first page's last row. */
const BUTTON_CELLS = 4;
/** Where the page button sits on either page, in the game's pixels. */
const BUTTON: Box = { x: 224, y: 203, width: 174, height: 34 };
/** The height of the second page's grid, above the button. */
const EXTRA_HEIGHT = 200;

/** A slot is never wider than the full screen's, nor narrower than square. */
const WIDEST = FULL_SLOT.width / FULL_SLOT.height;
const SQUAREST = 1;

export interface Smash3dsPage {
  /** The roster's fighters on this page, as indexes into the roster: from `first`, `count` of them. */
  readonly first: number;
  readonly count: number;
  /** Whether the page ends with a random slot. */
  readonly random: boolean;
  /** One per slot, in order: the page's fighters, then its random slot. */
  readonly slots: readonly Box[];
  /** The button to the other page, when there is one. */
  readonly button?: { readonly to: "extra" | "original"; readonly box: Box };
}

const scaled = (box: Box, { topScreen }: Smash3dsLayout): Box => ({
  x: topScreen.x + box.x * SCALE,
  y: topScreen.y + box.y * SCALE,
  width: box.width * SCALE,
  height: box.height * SCALE,
});

/** The slot a column count gives: as big as the area allows, within the 3DS's shapes. */
function fit(slotCount: number, columns: number, area: Size, max: Size) {
  const rows = Math.ceil(slotCount / columns);
  let height = Math.min(max.height, area.height / rows);
  const width = Math.min(max.width, area.width / columns, height * WIDEST);
  height = Math.min(height, width / SQUAREST);
  return { rows, width, height };
}

/**
 * Reflows slots into an area, in the game's pixels: whichever column count gives the biggest
 * slots, the fewest rows on a tie. Rows are centred, and the grid is centred in the area.
 */
function reflow(slotCount: number, area: Box, max: Size): Box[] {
  let columns = 1;
  let best = fit(slotCount, 1, area, max);
  for (let candidate = 2; candidate <= slotCount; candidate++) {
    const next = fit(slotCount, candidate, area, max);
    const size = next.width * next.height;
    const bestArea = best.width * best.height;
    const same = Math.abs(size - bestArea) <= 1e-6;
    if ((!same && size > bestArea) || (same && next.rows < best.rows)) {
      columns = candidate;
      best = next;
    }
  }

  const { rows, width, height } = best;
  const top = area.y + (area.height - rows * height) / 2;
  return Array.from({ length: slotCount }, (_, index) => {
    const row = Math.floor(index / columns);
    const inRow = Math.min(columns, slotCount - row * columns);
    const left = area.x + (area.width - inRow * width) / 2;
    return { x: left + (index % columns) * width, y: top + row * height, width, height };
  });
}

/** The full screen's cells, in reading order, filled from the top left. */
const fullCells = (count: number): Box[] =>
  Array.from({ length: count }, (_, index) => ({
    x: (index % COLUMNS) * FULL_SLOT.width,
    y: Math.floor(index / COLUMNS) * FULL_SLOT.height,
    ...FULL_SLOT,
  }));

/**
 * The pages a roster of `fighterCount` fighters takes: one when every slot fits the full screen,
 * otherwise two.
 */
export function smash3dsPages(
  fighterCount: number,
  randomSlot: boolean,
  layout: Smash3dsLayout = SMASH_3DS_LAYOUT,
): Smash3dsPage[] {
  const random = randomSlot ? 1 : 0;
  const slotCount = fighterCount + random;
  if (!Number.isInteger(fighterCount) || slotCount < 1)
    throw new Error(`A grid needs at least one slot, not ${slotCount}.`);

  const scale = (boxes: Box[]) => boxes.map((box) => scaled(box, layout));

  if (slotCount <= PAGE_CAPACITY) {
    const screen: Box = { x: 0, y: 0, width: 400, height: 240 };
    return [
      {
        first: 0,
        count: fighterCount,
        random: randomSlot,
        slots: scale(reflow(slotCount, screen, STARTER_SLOT)),
      },
    ];
  }

  const firstCount = PAGE_CAPACITY - BUTTON_CELLS - random;
  const restCount = fighterCount - firstCount;
  const extraArea: Box = { x: 0, y: 0, width: 400, height: EXTRA_HEIGHT };
  const button = scaled(BUTTON, layout);
  return [
    {
      first: 0,
      count: firstCount,
      random: randomSlot,
      slots: scale(fullCells(firstCount + random)),
      button: { to: "extra", box: button },
    },
    {
      first: firstCount,
      count: restCount,
      random: randomSlot,
      slots: scale(reflow(restCount + random, extraArea, EXTRA_SLOT)),
      button: { to: "original", box: button },
    },
  ];
}
