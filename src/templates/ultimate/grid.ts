/**
 * Ultimate's fighter grid: how any number of slots, from 1 to 121, reflows into the band
 * between the top bar and the player panels, in 1920x1080 stage pixels.
 */

/** Ultimate's stage, in pixels. Everything in the template is laid out on it. */
export const ULTIMATE_STAGE = { width: 1920, height: 1080 } as const;

/** The band the grid fills. */
const AREA = { x: 24, y: 84, width: 1872, height: 576 } as const;
/** Slots never grow wider than the starter screen's, where nine slots share two rows. */
const MAX_SLOT_WIDTH = 302;
/** Slot width over height. Few slots are squarer, many are wider. */
const MIN_ASPECT = 1.375;
const MAX_ASPECT = 1.8;

export interface GridSlot {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface UltimateGrid {
  readonly columns: number;
  /** One per slot, in roster order: left to right, top to bottom. */
  readonly slots: readonly GridSlot[];
}

/** The largest slot that fits a column count, kept within Ultimate's proportions. */
function slotSize(slotCount: number, columns: number) {
  const rows = Math.ceil(slotCount / columns);
  let width = Math.min(AREA.width / columns, MAX_SLOT_WIDTH);
  let height = AREA.height / rows;
  if (width / height > MAX_ASPECT) width = height * MAX_ASPECT;
  if (width / height < MIN_ASPECT) height = width / MIN_ASPECT;
  return { rows, width, height };
}

/**
 * Picks the column count that gives the biggest slots. On a tie it takes the fewest rows, then the
 * fewest columns, so short rosters spread out in a line before they stack.
 * Full rows sit in the middle of the band; a short last row is centred under them.
 */
export function ultimateGrid(slotCount: number): UltimateGrid {
  if (!Number.isInteger(slotCount) || slotCount < 1)
    throw new Error(`A grid needs at least one slot, not ${slotCount}.`);

  let columns = 1;
  let best = slotSize(slotCount, 1);
  for (let candidate = 2; candidate <= slotCount; candidate++) {
    const size = slotSize(slotCount, candidate);
    const area = size.width * size.height;
    const bestArea = best.width * best.height;
    const sameArea = Math.abs(area - bestArea) <= 1e-6;
    if ((!sameArea && area > bestArea) || (sameArea && size.rows < best.rows)) {
      columns = candidate;
      best = size;
    }
  }

  const { rows, width, height } = best;
  const top = AREA.y + (AREA.height - rows * height) / 2;
  const slots: GridSlot[] = [];
  for (let index = 0; index < slotCount; index++) {
    const row = Math.floor(index / columns);
    const inRow = Math.min(columns, slotCount - row * columns);
    const left = AREA.x + (AREA.width - inRow * width) / 2;
    slots.push({ x: left + (index % columns) * width, y: top + row * height, width, height });
  }
  return { columns, slots };
}
