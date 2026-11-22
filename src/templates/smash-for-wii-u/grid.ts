/**
 * Smash for Wii U's fighter grid: how any number of slots, from 1 to 121, reflows into the dark
 * band below the header, in stage pixels. Slots touch and stretch: rows share out the band's
 * height and columns its width, so a slot is anywhere between the full roster's wide shape and
 * the launch roster's nearly square one. As the game does, the rows are balanced, the longer
 * ones first and none more than a slot longer than another, and each is centred.
 */
import type { Box } from "../../selection/navigate";
import { WII_U_LANDSCAPE, WII_U_SQUARE_SLOT, WII_U_WIDE_SLOT, type WiiULayout } from "./layout";

export interface WiiUGrid {
  /** The length of the longest row. */
  readonly columns: number;
  /** One per slot, in roster order: left to right, top to bottom. */
  readonly slots: readonly Box[];
}

const WIDEST = WII_U_WIDE_SLOT.width / WII_U_WIDE_SLOT.height;
const SQUAREST = WII_U_SQUARE_SLOT.width / WII_U_SQUARE_SLOT.height;

/** The slot a column count gives: as big as the band allows, within the game's two shapes. */
function fit(slotCount: number, columns: number, { gridArea, maxSlot }: WiiULayout) {
  const rows = Math.ceil(slotCount / columns);
  let height = Math.min(maxSlot.height, gridArea.height / rows);
  const width = Math.min(maxSlot.width, gridArea.width / columns, height * WIDEST);
  height = Math.min(height, width / SQUAREST);
  return { rows, width, height };
}

/**
 * Picks the column count that gives the biggest slots. On a tie it takes the fewest rows, then the
 * fewest columns, as the game puts 57 slots in rows of 12 rather than 13.
 */
export function wiiUGrid(slotCount: number, layout: WiiULayout = WII_U_LANDSCAPE): WiiUGrid {
  if (!Number.isInteger(slotCount) || slotCount < 1)
    throw new Error(`A grid needs at least one slot, not ${slotCount}.`);

  let best = fit(slotCount, 1, layout);
  for (let candidate = 2; candidate <= slotCount; candidate++) {
    const next = fit(slotCount, candidate, layout);
    const area = next.width * next.height;
    const bestArea = best.width * best.height;
    const same = Math.abs(area - bestArea) <= 1e-6;
    if ((!same && area > bestArea) || (same && next.rows < best.rows)) best = next;
  }

  const { gridArea } = layout;
  const { rows, width, height } = best;
  // Balanced rows: the first `long` rows hold one slot more than the rest.
  const short = Math.floor(slotCount / rows);
  const long = slotCount % rows;
  const top = gridArea.y + (gridArea.height - rows * height) / 2;
  const slots: Box[] = [];
  for (let row = 0; row < rows; row++) {
    const inRow = row < long ? short + 1 : short;
    const left = gridArea.x + (gridArea.width - inRow * width) / 2;
    for (let column = 0; column < inRow; column++)
      slots.push({ x: left + column * width, y: top + row * height, width, height });
  }
  return { columns: long > 0 ? short + 1 : short, slots };
}
