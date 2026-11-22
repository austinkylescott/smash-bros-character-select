/**
 * Smash 64's fighter grid: how any number of slots, from 1 to 121, reflows into the band below
 * the header, in stage pixels.
 *
 * The game only ever showed twelve slots, six to a row, so there is no screen of its own to copy
 * for a bigger roster. The rule chosen: a slot keeps the game's shape and only shrinks, as evenly
 * as it can, until every slot fits in the band the game's two rows fill. The column count is the
 * one giving the biggest slots. Rows hang from the top of the band, each centred.
 */
import type { Box } from "../../selection/navigate";
import { SMASH_64_LANDSCAPE, type Smash64Layout } from "./layout";

export interface Smash64Grid {
  readonly columns: number;
  /** One per slot, in roster order: left to right, top to bottom. */
  readonly slots: readonly Box[];
}

/** How much a column count shrinks the layout's largest slot to fit the band. */
function fit(slotCount: number, columns: number, { gridArea, maxSlot }: Smash64Layout) {
  const rows = Math.ceil(slotCount / columns);
  const scale = Math.min(
    1,
    gridArea.width / (columns * maxSlot.width),
    gridArea.height / (rows * maxSlot.height),
  );
  return { rows, scale };
}

/** Picks the column count that gives the biggest slots. On a tie it takes the fewest rows. */
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
    const same = Math.abs(next.scale - best.scale) <= 1e-9;
    if ((!same && next.scale > best.scale) || (same && next.rows < best.rows)) {
      columns = candidate;
      best = next;
    }
  }

  const { gridArea, maxSlot } = layout;
  const width = maxSlot.width * best.scale;
  const height = maxSlot.height * best.scale;
  const slots: Box[] = [];
  for (let index = 0; index < slotCount; index++) {
    const row = Math.floor(index / columns);
    const inRow = Math.min(columns, slotCount - row * columns);
    const left = gridArea.x + (gridArea.width - inRow * width) / 2;
    slots.push({
      x: left + (index % columns) * width,
      y: gridArea.y + row * height,
      width,
      height,
    });
  }
  return { columns, slots };
}
