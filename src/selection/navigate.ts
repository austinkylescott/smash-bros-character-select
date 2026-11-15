/** Moving the selection between slots with the arrow keys, for any template's layout. */

export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type Direction = "up" | "down" | "left" | "right";

const centreX = (box: Box) => box.x + box.width / 2;

/**
 * The slot an arrow key moves to from `from`. Slots are in reading order. Left and right step
 * through that order, running on between rows; up and down go to the nearest slot in the row
 * above or below, the leftmost on a tie. At an edge the selection stays put.
 */
export function neighbour(slots: readonly Box[], from: number, direction: Direction): number {
  if (direction === "left") return Math.max(0, from - 1);
  if (direction === "right") return Math.min(slots.length - 1, from + 1);

  const here = slots[from]!;
  const rowYs = [...new Set(slots.map((slot) => slot.y))].sort((a, b) => a - b);
  const row = rowYs.indexOf(here.y) + (direction === "down" ? 1 : -1);
  if (row < 0 || row >= rowYs.length) return from;

  let best = from;
  let bestDistance = Infinity;
  slots.forEach((slot, index) => {
    if (slot.y !== rowYs[row]) return;
    const distance = Math.abs(centreX(slot) - centreX(here));
    if (distance < bestDistance - 1e-6) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}
