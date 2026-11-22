/**
 * Brawl's fighter grid: how any number of slots, from 1 to 121, reflows into the band below the
 * header, in stage pixels. Unlike Melee's, Brawl's slots stretch: rows share out the band's
 * height and columns its width, so a slot is anywhere between the full screen's wide shape and
 * the starter screen's nearly square one. Rows are centred, and the grid is centred in the band,
 * as Brawl centres its starter screen.
 */
import type { Box } from "../../selection/navigate";
import { BRAWL_FULL_SLOT, BRAWL_LANDSCAPE, BRAWL_STARTER_SLOT, type BrawlLayout } from "./layout";

export interface BrawlGrid {
  readonly columns: number;
  /** One per slot, in roster order: left to right, top to bottom. */
  readonly slots: readonly Box[];
}

const WIDEST = BRAWL_FULL_SLOT.width / BRAWL_FULL_SLOT.height;
const SQUAREST = BRAWL_STARTER_SLOT.width / BRAWL_STARTER_SLOT.height;

/** The slot a column count gives: as big as the band allows, within Brawl's two shapes. */
function fit(slotCount: number, columns: number, { gridArea, maxSlot }: BrawlLayout) {
  const rows = Math.ceil(slotCount / columns);
  let height = Math.min(maxSlot.height, gridArea.height / rows);
  const width = Math.min(maxSlot.width, gridArea.width / columns, height * WIDEST);
  height = Math.min(height, width / SQUAREST);
  return { rows, width, height };
}

/**
 * Picks the column count that gives the biggest slots. On a tie it takes the fewest rows, then the
 * fewest columns, as Brawl's starter screen puts 22 slots in three rows of 8.
 */
export function brawlGrid(slotCount: number, layout: BrawlLayout = BRAWL_LANDSCAPE): BrawlGrid {
  if (!Number.isInteger(slotCount) || slotCount < 1)
    throw new Error(`A grid needs at least one slot, not ${slotCount}.`);

  let columns = 1;
  let best = fit(slotCount, 1, layout);
  for (let candidate = 2; candidate <= slotCount; candidate++) {
    const next = fit(slotCount, candidate, layout);
    const area = next.width * next.height;
    const bestArea = best.width * best.height;
    const same = Math.abs(area - bestArea) <= 1e-6;
    if ((!same && area > bestArea) || (same && next.rows < best.rows)) {
      columns = candidate;
      best = next;
    }
  }

  const { gridArea } = layout;
  const { rows, width, height } = best;
  const top = gridArea.y + (gridArea.height - rows * height) / 2;
  const slots: Box[] = [];
  for (let index = 0; index < slotCount; index++) {
    const row = Math.floor(index / columns);
    const inRow = Math.min(columns, slotCount - row * columns);
    const left = gridArea.x + (gridArea.width - inRow * width) / 2;
    slots.push({ x: left + (index % columns) * width, y: top + row * height, width, height });
  }
  return { columns, slots };
}
