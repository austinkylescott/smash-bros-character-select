import { describe, expect, it } from "vite-plus/test";

import { ultimateGrid } from "./grid";

// Expected positions are measured from the reference screenshots in docs/references/ultimate/,
// scaled to the 1920x1080 stage. Measurements are good to a couple of pixels.
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} is not near ${expected}`).toBeLessThanOrEqual(3);

describe("Ultimate fighter grid", () => {
  it("lays out the full DLC screen: 86 fighters and the random slot in 13 columns", () => {
    const grid = ultimateGrid(87);

    expect(grid.columns).toBe(13);
    expect(grid.slots).toHaveLength(87);
    // Mario, top left.
    near(grid.slots[0]!.x, 25);
    near(grid.slots[0]!.y, 85);
    near(grid.slots[0]!.width, 144);
    near(grid.slots[0]!.height, 82);
    // Steve opens the short last row, under the third column.
    near(grid.slots[78]!.x, 313);
    near(grid.slots[78]!.y, 577);
  });

  it("lays out the launch screen: 74 fighters and the random slot, last row centred", () => {
    const grid = ultimateGrid(75);

    expect(grid.columns).toBe(13);
    near(grid.slots[0]!.width, 144);
    near(grid.slots[0]!.height, 96);
    // Ridley opens the last row of ten, half a slot in from the second column.
    near(grid.slots[65]!.x, 240);
  });

  it("lays out the starter screen: eight fighters and the random slot as big rows of 5 and 4", () => {
    const grid = ultimateGrid(9);

    expect(grid.columns).toBe(5);
    near(grid.slots[0]!.x, 206);
    near(grid.slots[0]!.y, 154);
    near(grid.slots[0]!.width, 302);
    near(grid.slots[0]!.height, 220);
    // Kirby opens the second row, half a slot in.
    near(grid.slots[5]!.x, 357);
    near(grid.slots[5]!.y, 374);
  });

  it("lays out 65 fighters and the random slot in 11 full columns, as an early version did", () => {
    const grid = ultimateGrid(66);

    expect(grid.columns).toBe(11);
    // The random slot ends a full last row, under the last column.
    near(grid.slots.at(-1)!.x, grid.slots[10]!.x);
  });

  it.each([1, 12, 89, 120])(
    "keeps %i fighters and the random slot legible and inside the band",
    (fighters) => {
      const { slots } = ultimateGrid(fighters + 1);

      expect(slots).toHaveLength(fighters + 1);
      for (const slot of slots) {
        expect(slot.width).toBeGreaterThanOrEqual(110);
        expect(slot.height).toBeGreaterThanOrEqual(64);
        expect(slot.width / slot.height).toBeLessThanOrEqual(1.8 + 1e-9);
        expect(slot.x).toBeGreaterThanOrEqual(24);
        expect(slot.x + slot.width).toBeLessThanOrEqual(1896 + 1e-9);
        expect(slot.y).toBeGreaterThanOrEqual(84);
        expect(slot.y + slot.height).toBeLessThanOrEqual(660 + 1e-9);
      }
    },
  );

  it("puts a single fighter and the random slot side by side", () => {
    const grid = ultimateGrid(2);

    expect(grid.columns).toBe(2);
    expect(grid.slots[1]!.y).toBe(grid.slots[0]!.y);
  });

  it("rejects an empty grid", () => {
    expect(() => ultimateGrid(0)).toThrow(/at least one slot/);
  });
});
