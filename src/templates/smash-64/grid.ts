/**
 * Smash 64's fighter grid: how any number of slots, from 1 to 121, reflows into the band below
 * the header, in stage pixels. The game only ever showed 12, so the rule is our own: every slot
 * keeps the game's nearly square shape and all shrink together, as big as the band allows but
 * never past the game's own. Slots touch, as they do in the game. Rows are centred, and the grid
 * is centred in the band.
 */
import type { Box } from "../../selection/navigate";
import { SMASH_64_LANDSCAPE, SMASH_64_SLOT, type Smash64Layout } from "./layout";

export interface Smash64Grid {
  readonly columns: number;
  /** One per slot, in roster order: left to right, top to bottom. */
  readonly slots: readonly Box[];
}

const ASPECT = SMASH_64_SLOT.width / SMASH_64_SLOT.height;

/** The slot a column count gives: the game's shape, as big as the band and the cap allow. */
function fit(slotCount: number, columns: number, { gridArea, maxSlot }: Smash64Layout) {
  const rows = Math.ceil(slotCount / columns);
  const width = Math.min(
    maxSlot.width,
    maxSlot.height * ASPECT,
    gridArea.width / columns,
    (gridArea.height / rows) * ASPECT,
  );
  return { rows, width, height: width / ASPECT };
}

/** Picks the column count that gives the biggest slots; on a tie, the fewest rows. */
export function smash64Grid(
  slotCount: number,
  layout: Smash64Layout = SMASH_64_LANDSCAPE,
): Smash64Grid {
  if (!Number.isInteger(slotCount) || slotCount < 1)
    throw new Error(`A grid needs at least one slot, not ${slotCount}.`);

  let columns = 1;
  let best = fit(slotCount, 1, layout);
  for (let candidate = 2; candidate <= slotCount; candidate++) {
    const next = fit(slotCount, candidate, layout);
    const same = Math.abs(next.width - best.width) <= 1e-6;
    if ((!same && next.width > best.width) || (same && next.rows < best.rows)) {
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
