/**
 * Melee's fighter grid: how any number of slots, from 1 to 121, reflows into the band below the
 * header, in stage pixels. Melee's slots have one shape; only their size changes. Rows hang from
 * the top of the band, each centred, as Melee centres its short last row.
 */
import type { Box } from "../../selection/navigate";
import { MELEE_LANDSCAPE, type MeleeLayout } from "./layout";

export interface MeleeGrid {
  readonly columns: number;
  /** One per slot, in roster order: left to right, top to bottom. */
  readonly slots: readonly Box[];
}

/** How much a column count shrinks the layout's largest slot to fit the band. */
function fit(slotCount: number, columns: number, { gridArea, maxSlot }: MeleeLayout) {
  const rows = Math.ceil(slotCount / columns);
  const scale = Math.min(
    1,
    gridArea.width / (columns * maxSlot.width),
    gridArea.height / (rows * maxSlot.height),
  );
  return { rows, scale };
}

/**
 * Picks the column count that gives the biggest slots. On a tie it takes the fewest rows, then the
 * fewest columns, as Melee's starter screen puts 14 fighters in two rows of 7.
 */
export function meleeGrid(slotCount: number, layout: MeleeLayout = MELEE_LANDSCAPE): MeleeGrid {
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
